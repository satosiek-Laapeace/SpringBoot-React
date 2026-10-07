package com.booot.farm_craftmarket.service.implement;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import com.booot.farm_craftmarket.dto.response.KhqrPaymentResponseDto;
import com.booot.farm_craftmarket.dto.response.KhqrPaymentStatusResponseDto;
import com.booot.farm_craftmarket.dto.response.PaymentResponseDto;
import com.booot.farm_craftmarket.dto.response.AbaPaywayCheckoutDto;
import com.booot.farm_craftmarket.entity.OrderEntity;
import com.booot.farm_craftmarket.entity.PaymentEntity;
import com.booot.farm_craftmarket.enums.orders.OrderStatus;
import com.booot.farm_craftmarket.enums.payments.PaymentMethod;
import com.booot.farm_craftmarket.enums.payments.PaymentStatus;
import com.booot.farm_craftmarket.exception.ResourceNotFoundException;
import com.booot.farm_craftmarket.repository.OrderRepository;
import com.booot.farm_craftmarket.repository.PaymentRepository;
import com.booot.farm_craftmarket.service.KhqrSvgService;
import com.booot.farm_craftmarket.service.AbaPaywayClient;
import com.booot.farm_craftmarket.service.PaymentService;
import com.booot.farm_craftmarket.service.PlatformSettingsService;
import tools.jackson.databind.JsonNode;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.RequestOptions;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;

import kh.gov.nbc.bakong_khqr.BakongKHQR;
import kh.gov.nbc.bakong_khqr.model.IndividualInfo;
import kh.gov.nbc.bakong_khqr.model.KHQRCurrency;
import kh.gov.nbc.bakong_khqr.model.KHQRData;
import kh.gov.nbc.bakong_khqr.model.KHQRResponse;

@Service
public class PaymentServiceImplement implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImplement.class);
    private static final ZoneId APP_ZONE = ZoneId.systemDefault();
    private static final String ORDER_NOT_FOUND_PREFIX = "Order not found: ";

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final KhqrSvgService khqrSvgService;
    private final PlatformSettingsService platformSettingsService;
    private final RestTemplate bakongRestTemplate;
    private final AbaPaywayClient abaPaywayClient;

    @Value("${stripe.secret-key:}") private String secretKey;
    @Value("${stripe.webhook-secret:}") private String webhookSecret;
    @Value("${app.frontend.success-url:http://localhost:3000/payment/success}") private String successUrl;
    @Value("${app.frontend.cancel-url:http://localhost:3000/payment/cancel}") private String cancelUrl;
    @Value("${bakong.api.base-url:https://api-bakong.nbc.org.kh}") private String bakongBaseUrl;
    @Value("${bakong.api.check-transaction-path:/v1/check_transaction_by_md5}") private String bakongCheckPath;
    @Value("${bakong.api.token:}") private String bakongToken;
    @Value("${bakong.account-id:}") private String bakongAccountId;
    @Value("${bakong.merchant-name:}") private String bakongMerchantName;
    @Value("${bakong.merchant-city:}") private String bakongMerchantCity;
    @Value("${bakong.currency:USD}") private String bakongCurrency;

    public PaymentServiceImplement(
            OrderRepository orderRepository,
            PaymentRepository paymentRepository,
            KhqrSvgService khqrSvgService,
            PlatformSettingsService platformSettingsService,
            AbaPaywayClient abaPaywayClient) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.khqrSvgService = khqrSvgService;
        this.platformSettingsService = platformSettingsService;
        this.abaPaywayClient = abaPaywayClient;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5000);
        requestFactory.setReadTimeout(8000);
        this.bakongRestTemplate = new RestTemplate(requestFactory);
    }

    @Override
    @Transactional
    public AbaPaywayCheckoutDto createAbaPaywayCheckout(Long userId, Long orderId) {
        platformSettingsService.assertPaymentEnabled(PaymentMethod.ABA_PAYWAY);
        OrderEntity order = getPayableOrder(userId, orderId);
        cancelOldPending(orderId);
        String merchantReference = "FC"
                + Long.toString(orderId, 36).toUpperCase()
                + "-"
                + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 20);
        PaymentEntity payment = savePending(
                orderId, order, PaymentMethod.ABA_PAYWAY, null);
        payment.setMerchantReference(merchantReference);
        payment.setExpiresAt(LocalDateTime.now(ZoneOffset.UTC).plusHours(24));
        paymentRepository.save(payment);

        AbaPaywayClient.PaymentLink link = abaPaywayClient.createPaymentLink(
                order.getTotalAmount(), merchantReference, "FarmCraft order #" + orderId);
        payment.setExpiresAt(link.expiresAt());
        paymentRepository.save(payment);
        return new AbaPaywayCheckoutDto(link.url());
    }

    @Override
    @Transactional
    public PaymentResponseDto verifyAbaPaywayPayment(Long userId, Long orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(ORDER_NOT_FOUND_PREFIX + orderId));
        if (!order.getBuyerId().equals(userId)) {
            throw new AccessDeniedException("Not your order");
        }
        PaymentEntity payment = findAbaPaywayPayment(orderId);
        if (payment.getTransactionId() != null) {
            verifyAndApplyAbaPaywayStatus(payment, false);
        }
        return toDto(payment);
    }

    @Override
    @Transactional
    public void handleAbaPaywayCallback(Map<String, Object> payload, String signature) {
        if (payload.containsKey("merchant_ref_no")) {
            handleAbaPaywayPaymentLinkCallback(payload);
            return;
        }
        abaPaywayClient.validateCallbackSignature(payload, signature);
        Object transactionIdValue = payload.get("tran_id");
        if (transactionIdValue == null || transactionIdValue.toString().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "ABA PayWay callback is missing its transaction ID");
        }
        paymentRepository.findByTransactionId(transactionIdValue.toString())
                .filter(payment -> payment.getMethod() == PaymentMethod.ABA_PAYWAY)
                .ifPresentOrElse(
                        payment -> verifyAndApplyAbaPaywayStatus(payment, true),
                        () -> log.warn("No ABA PayWay payment found for transaction {}",
                                transactionIdValue));
    }

    @Override
    @Transactional
    public String createCheckout(Long userId, Long orderId) {
        platformSettingsService.assertPaymentEnabled(PaymentMethod.CARD);
        if (isBlank(secretKey)) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Card payment is not configured");
        }

        OrderEntity order = getPayableOrder(userId, orderId);

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .setClientReferenceId(String.valueOf(orderId))
                .putMetadata("orderId", String.valueOf(orderId))
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("usd")
                                .setUnitAmount(toCents(order.getTotalAmount()))
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Order #" + orderId)
                                        .build())
                                .build())
                        .build())
                .build();

        Session session;
        try {
            session = Session.create(params, stripeOptions());
        } catch (StripeException e) {
            log.error("Stripe checkout failed for order {}", orderId, e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Payment provider error");
        }

        cancelOldPending(orderId);
        savePending(orderId, order, PaymentMethod.CARD, session.getId());

        return session.getUrl();
    }

    @Override
    @Transactional
    public void handleWebhook(String payload, String signature) {
        if (isBlank(webhookSecret)) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Webhook is not configured");
        }

        Event event;
        try {
            event = Webhook.constructEvent(payload, signature, webhookSecret);
        } catch (SignatureVerificationException _) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid signature");
        }

        StripeObject object = event.getDataObjectDeserializer().getObject().orElse(null);
        if (object == null) {
            try {
                object = event.getDataObjectDeserializer().deserializeUnsafe();
            } catch (RuntimeException | StripeException e) {
                log.warn("Could not read Stripe event {}", event.getId(), e);
                return;
            }
        }
        if (!(object instanceof Session session)) {
            return;
        }

        if ("checkout.session.completed".equals(event.getType())
                || "checkout.session.async_payment_succeeded".equals(event.getType())) {
            if ("paid".equals(session.getPaymentStatus())) {
                paymentRepository.findByTransactionId(session.getId())
                        .ifPresentOrElse(
                                p -> completeCardPayment(p, session),
                                () -> log.warn("No payment found for Stripe session {}", session.getId()));
            }
            return;
        }
        if ("checkout.session.expired".equals(event.getType())
                || "checkout.session.async_payment_failed".equals(event.getType())) {
            paymentRepository.findByTransactionId(session.getId())
                    .ifPresent(p -> {
                        if (p.getStatus() == PaymentStatus.PENDING) {
                            p.setStatus(PaymentStatus.CANCELLED);
                            paymentRepository.save(p);
                        }
                    });
        }
    }

    @Override
    @Transactional
    public PaymentResponseDto createCashOnDelivery(Long userId, Long orderId) {
        platformSettingsService.assertPaymentEnabled(PaymentMethod.CASH_ON_DELIVERY);
        OrderEntity order = getPayableOrder(userId, orderId);
        cancelOldPending(orderId);
        return toDto(savePending(orderId, order, PaymentMethod.CASH_ON_DELIVERY, null));
    }

    @Override
    @Transactional
    public PaymentResponseDto createBankTransfer(Long userId, Long orderId, String reference) {
        platformSettingsService.assertPaymentEnabled(PaymentMethod.BANK_TRANSFER);
        if (isBlank(reference)) {
            throw new IllegalArgumentException("Transfer reference is required");
        }
        OrderEntity order = getPayableOrder(userId, orderId);
        cancelOldPending(orderId);
        return toDto(savePending(orderId, order, PaymentMethod.BANK_TRANSFER, reference.trim()));
    }

    @Override
    @Transactional
    @SuppressWarnings("deprecation")
    public KhqrPaymentResponseDto createKhqrPayment(Long userId, Long orderId) {
        platformSettingsService.assertPaymentEnabled(PaymentMethod.KHQR_BAKONG);
        requireBakongConfiguration();
        OrderEntity order = getPayableOrder(userId, orderId);
        BigDecimal amount = order.getTotalAmount().setScale(2, RoundingMode.HALF_UP);
        if (amount.signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Order total must be greater than zero");
        }

        LocalDateTime expiresAt = LocalDateTime.now(APP_ZONE).plusMinutes(5);
        IndividualInfo info = new IndividualInfo();
        info.setBakongAccountId(bakongAccountId.trim());
        info.setMerchantName(bakongMerchantName.trim());
        info.setMerchantCity(bakongMerchantCity.trim());
        info.setCurrency(KHQRCurrency.USD);
        info.setAmount(amount.doubleValue());
        info.setExpirationTimestamp(System.currentTimeMillis() + Duration.ofMinutes(5).toMillis());

        KHQRResponse<KHQRData> generated = BakongKHQR.generateIndividual(info);
        if (generated == null || generated.getKHQRStatus() == null
                || generated.getKHQRStatus().getCode() != 0
                || generated.getData() == null
                || isBlank(generated.getData().getQr())
                || isBlank(generated.getData().getMd5())) {
            String reason = generated == null || generated.getKHQRStatus() == null
                    ? "KHQR SDK returned no status"
                    : generated.getKHQRStatus().getMessage();
            log.error("KHQR generation failed for order {}: {}", orderId, reason);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Bakong QR generation failed");
        }

        String qrString = generated.getData().getQr();
        String md5 = generated.getData().getMd5();
        cancelOldPending(orderId);
        PaymentEntity payment = savePending(orderId, order, PaymentMethod.KHQR_BAKONG, md5);
        payment.setExpiresAt(expiresAt);
        paymentRepository.save(payment);

        return new KhqrPaymentResponseDto(
                orderId,
                amount,
                "USD",
                qrString,
                md5,
                khqrSvgService.render(qrString),
                bakongMerchantName.trim(),
                expiresAt,
                payment.getStatus());
    }

    @Override
    @Transactional
    public KhqrPaymentStatusResponseDto verifyKhqrPayment(Long userId, Long orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(ORDER_NOT_FOUND_PREFIX + orderId));
        if (!order.getBuyerId().equals(userId)) {
            throw new AccessDeniedException("Not your order");
        }

        PaymentEntity payment = paymentRepository.findByOrderIdOrderByIdDesc(orderId).stream()
                .filter(p -> p.getMethod() == PaymentMethod.KHQR_BAKONG)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No Bakong QR payment found for order " + orderId));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            return new KhqrPaymentStatusResponseDto(orderId, payment.getStatus(), payment.getPaidAt());
        }
        if (payment.getExpiresAt() != null && payment.getExpiresAt().isBefore(LocalDateTime.now(APP_ZONE))) {
            payment.setStatus(PaymentStatus.CANCELLED);
            paymentRepository.save(payment);
            return new KhqrPaymentStatusResponseDto(orderId, payment.getStatus(), null);
        }

        requireBakongConfiguration();
        JsonNode data = queryBakongTransaction(payment.getTransactionId());
        if (data == null) {
            return new KhqrPaymentStatusResponseDto(orderId, PaymentStatus.PENDING, null);
        }
        if (data.path("responseCode").asInt(-1) == 1) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            return new KhqrPaymentStatusResponseDto(orderId, payment.getStatus(), null);
        }
        validateBakongTransaction(payment, data);

        if (paymentRepository.existsByOrderIdAndStatus(orderId, PaymentStatus.PAID)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This order already has a completed payment");
        }
        completePayment(payment);
        return new KhqrPaymentStatusResponseDto(orderId, payment.getStatus(), payment.getPaidAt());
    }

    @Override
    @Transactional
    public PaymentResponseDto markPaid(Long orderId) {
        PaymentEntity payment = paymentRepository.findByOrderIdOrderByIdDesc(orderId).stream()
                .filter(p -> p.getStatus() == PaymentStatus.PENDING)
                .filter(p -> p.getMethod() != PaymentMethod.CARD
                        && p.getMethod() != PaymentMethod.KHQR_BAKONG
                        && p.getMethod() != PaymentMethod.ABA_PAYWAY)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No pending cash or bank-transfer payment for order " + orderId));

        completePayment(payment);
        return toDto(payment);
    }


    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponseDto> getPaymentsForOrder(Long userId, Long orderId, boolean admin) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(ORDER_NOT_FOUND_PREFIX + orderId));
        if (!admin && !order.getBuyerId().equals(userId)) {
            throw new AccessDeniedException("Not your order");
        }
        return paymentRepository.findByOrderIdOrderByIdDesc(orderId).stream()                .map(this::toDto)
                .toList();
    }


    private OrderEntity getPayableOrder(Long userId, Long orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(ORDER_NOT_FOUND_PREFIX + orderId));

        if (!order.getBuyerId().equals(userId)) {
            throw new AccessDeniedException("Not your order");
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Only pending orders can be paid");
        }
        if (paymentRepository.existsByOrderIdAndStatus(orderId, PaymentStatus.PAID)) {
            throw new IllegalStateException("Order is already paid");
        }
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        boolean abaPaymentInProgress = paymentRepository.findByOrderIdOrderByIdDesc(orderId).stream()
                .anyMatch(payment -> payment.getMethod() == PaymentMethod.ABA_PAYWAY
                        && payment.getStatus() == PaymentStatus.PENDING
                        && payment.getExpiresAt() != null
                        && payment.getExpiresAt().isAfter(now));
        if (abaPaymentInProgress) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "An ABA PayWay payment is already in progress for this order");
        }
        return order;
    }

    private PaymentEntity findAbaPaywayPayment(Long orderId) {
        return paymentRepository.findByOrderIdOrderByIdDesc(orderId).stream()
                .filter(payment -> payment.getMethod() == PaymentMethod.ABA_PAYWAY)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No ABA PayWay payment found for order " + orderId));
    }

    private void verifyAndApplyAbaPaywayStatus(PaymentEntity payment, boolean processCancelled) {
        if (payment.getStatus() != PaymentStatus.PENDING
                && !(processCancelled && payment.getStatus() == PaymentStatus.CANCELLED)) {
            return;
        }
        if (payment.getTransactionId() == null || payment.getTransactionId().isBlank()) {
            return;
        }
        PaymentStatus verifiedStatus =
                abaPaywayClient.verifyTransaction(payment.getTransactionId(), payment.getAmount());
        if (verifiedStatus == PaymentStatus.PAID) {
            if (payment.getStatus() == PaymentStatus.CANCELLED) {
                log.warn("ABA PayWay reports a paid transaction {} after its local payment was cancelled",
                        payment.getTransactionId());
            }
            completePayment(payment);
            return;
        }
        boolean expired = payment.getExpiresAt() != null
                && payment.getExpiresAt().isBefore(LocalDateTime.now(ZoneOffset.UTC));
        if (payment.getStatus() == PaymentStatus.PENDING && expired
                && verifiedStatus == PaymentStatus.PENDING) {
            payment.setStatus(PaymentStatus.CANCELLED);
            paymentRepository.save(payment);
            return;
        }
        if (payment.getStatus() == PaymentStatus.PENDING
                && verifiedStatus != PaymentStatus.PENDING) {
            payment.setStatus(verifiedStatus);
            paymentRepository.save(payment);
        }
    }

    private void handleAbaPaywayPaymentLinkCallback(Map<String, Object> payload) {
        String providerStatus = String.valueOf(payload.getOrDefault("status", ""));
        String transactionId = String.valueOf(payload.getOrDefault("tran_id", ""));
        String merchantReference = String.valueOf(payload.getOrDefault("merchant_ref_no", ""));
        if (!"00".equals(providerStatus)) {
            log.warn("ABA PayWay payment-link callback reported status {}", providerStatus);
            return;
        }
        if (transactionId.isBlank() || merchantReference.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "ABA PayWay payment-link callback is missing its transaction or merchant reference");
        }
        PaymentEntity payment = paymentRepository.findByMerchantReference(merchantReference)
                .filter(candidate -> candidate.getMethod() == PaymentMethod.ABA_PAYWAY)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "ABA PayWay payment-link reference was not found"));
        if (payment.getTransactionId() != null
                && !payment.getTransactionId().equals(transactionId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "ABA PayWay transaction does not match the payment-link reference");
        }
        payment.setTransactionId(transactionId);
        paymentRepository.save(payment);
        verifyAndApplyAbaPaywayStatus(payment, true);
    }

    private void cancelOldPending(Long orderId) {
        paymentRepository.findByOrderIdOrderByIdDesc(orderId).stream()
                .filter(p -> p.getStatus() == PaymentStatus.PENDING)
                .forEach(p -> {
                    if (p.getMethod() == PaymentMethod.CARD && p.getTransactionId() != null) {
                        expireStripeSession(p.getTransactionId());
                    }
                    p.setStatus(PaymentStatus.CANCELLED);
                    paymentRepository.save(p);
                });
    }

    private void expireStripeSession(String sessionId) {
        try {
            RequestOptions options = stripeOptions();
            Session.retrieve(sessionId, options).expire(options);
        } catch (StripeException e) {
            log.warn("Could not expire Stripe session {}: {}", sessionId, e.getMessage());
        }
    }

    private PaymentEntity savePending(Long orderId, OrderEntity order,
                                      PaymentMethod method, String transactionId) {
        PaymentEntity payment = new PaymentEntity();
        payment.setOrderId(orderId);
        payment.setAmount(order.getTotalAmount());
        payment.setMethod(method);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setTransactionId(transactionId);
        return paymentRepository.save(payment);
    }

    private void completeCardPayment(PaymentEntity payment, Session session) {
        Long charged = session.getAmountTotal();
        if (charged != null && charged != toCents(payment.getAmount())) {
            log.error("Amount mismatch for payment {}: Stripe charged {} cents, expected {}",
                    payment.getId(), charged, toCents(payment.getAmount()));
            return;
        }
        completePayment(payment);
    }

    private void completePayment(PaymentEntity payment) {
        if (payment.getStatus() == PaymentStatus.PAID) {
            return;
        }
        if (paymentRepository.existsByOrderIdAndStatus(payment.getOrderId(), PaymentStatus.PAID)) {
            log.warn("Order {} already has a PAID payment; payment {} needs review/refund",
                    payment.getOrderId(), payment.getId());
            return;
        }
        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now(APP_ZONE));
        paymentRepository.save(payment);

        orderRepository.findById(payment.getOrderId()).ifPresent(o -> {
            if (o.getStatus() == OrderStatus.PENDING) {
                o.setStatus(OrderStatus.CONFIRMED);
                orderRepository.save(o);
            }
        });
    }

    private long toCents(BigDecimal amount) {
        return amount.setScale(2, RoundingMode.HALF_UP).movePointRight(2).longValueExact();
    }

    private RequestOptions stripeOptions() {
        return RequestOptions.builder().setApiKey(secretKey).build();
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private void requireBakongConfiguration() {
        if (isBlank(bakongBaseUrl) || isBlank(bakongToken) || isBlank(bakongAccountId)
                || isBlank(bakongMerchantName) || isBlank(bakongMerchantCity)) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Bakong payment is not configured");
        }
        URI apiUri;
        try {
            apiUri = URI.create(bakongBaseUrl.trim());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Bakong API URL is invalid", e);
        }
        if (!"https".equalsIgnoreCase(apiUri.getScheme()) || isBlank(apiUri.getHost())) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Bakong API URL must use HTTPS");
        }
        String apiHost = apiUri.getHost();
        if (!"api-bakong.nbc.org.kh".equalsIgnoreCase(apiHost)
                && !"sit-api-bakong.nbc.org.kh".equalsIgnoreCase(apiHost)) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Bakong API URL must use an official production or SIT host");
        }
        if (!"USD".equalsIgnoreCase(bakongCurrency)) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Bakong payments must use USD while order totals are stored in USD");
        }
    }

    private JsonNode queryBakongTransaction(String md5) {
        URI baseUri = URI.create(bakongBaseUrl.trim());
        URI checkPath = URI.create(bakongCheckPath.trim());
        if (checkPath.isAbsolute() || checkPath.getRawAuthority() != null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Bakong transaction path must be a relative path");
        }
        String requestUrl = baseUri.resolve(checkPath).toString();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(bakongToken.trim());

        try {
            ResponseEntity<JsonNode> response = bakongRestTemplate.postForEntity(
                    requestUrl,
                    new HttpEntity<>(Map.of("md5", md5), headers),
                    JsonNode.class);
            JsonNode body = response.getBody();
            if (!response.getStatusCode().is2xxSuccessful() || body == null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Bakong returned an invalid verification response");
            }

            int responseCode = body.path("responseCode").asInt(-1);
            if (responseCode == 1) {
                String message = body.path("responseMessage").asText("");
                if (message.toLowerCase().contains("could not be found")) {
                    return null;
                }
                return body;
            }
            if (responseCode != 0) {
                log.warn("Bakong verification returned response code {} for a pending payment",
                        responseCode);
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Bakong could not verify this payment");
            }

            JsonNode data = body.path("data");
            return data.isObject() ? data : null;
        } catch (RestClientException e) {
            log.error("Bakong transaction lookup failed", e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Bakong verification service is unavailable", e);
        }
    }

    private void validateBakongTransaction(PaymentEntity payment, JsonNode data) {
        JsonNode transactionAmount = data.path("amount");
        boolean matches = data.path("hash").asText().equalsIgnoreCase(payment.getTransactionId())
                && data.path("toAccountId").asText().equals(bakongAccountId.trim())
                && "USD".equalsIgnoreCase(data.path("currency").asText(""))
                && transactionAmount.isNumber()
                && transactionAmount.decimalValue().setScale(2, RoundingMode.HALF_UP)
                        .compareTo(payment.getAmount().setScale(2, RoundingMode.HALF_UP)) == 0;
        if (!matches) {
            log.error("Bakong transaction details do not match payment {}", payment.getId());
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Bakong transaction details do not match this order");
        }
    }

    private PaymentResponseDto toDto(PaymentEntity p) {
        return PaymentResponseDto.builder()
                .id(p.getId())
                .orderId(p.getOrderId())
                .amount(p.getAmount())
                .method(p.getMethod())
                .status(p.getStatus())
                .transactionId(p.getTransactionId())
                .paidAt(p.getPaidAt())
                .build();

    }
}
