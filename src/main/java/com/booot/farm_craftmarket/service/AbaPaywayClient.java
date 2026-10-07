package com.booot.farm_craftmarket.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.MessageDigest;
import java.security.PublicKey;
import java.security.interfaces.RSAKey;
import java.security.spec.X509EncodedKeySpec;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import com.booot.farm_craftmarket.enums.payments.PaymentStatus;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Component
public class AbaPaywayClient {
    private static final DateTimeFormatter REQUEST_TIME =
            DateTimeFormatter.ofPattern("yyyyMMddHHmmss").withZone(ZoneOffset.UTC);
    private static final String CHECK_TRANSACTION_PATH =
            "/api/payment-gateway/v1/payments/check-transaction-2";
    private static final String PAYMENT_LINK_PATH =
            "/api/merchant-portal/merchant-access/payment-link/create";
    private final String environment;
    private final String merchantId;
    private final String apiKey;
    private final String publicBackendUrl;
    private final String configuredCheckUrl;
    private final String configuredPaymentLinkUrl;
    private final String rsaPublicKey;
    private final String configuredReturnUrl;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public AbaPaywayClient(
            @Value("${aba.payway.environment:}") String environment,
            @Value("${aba.payway.merchant-id:}") String merchantId,
            @Value("${aba.payway.api-key:}") String apiKey,
            @Value("${aba.payway.public-backend-url:}") String publicBackendUrl,
            @Value("${payway.check-url:}") String configuredCheckUrl,
            @Value("${payway.payment-link-url:}") String configuredPaymentLinkUrl,
            @Value("${aba.payway.public-key:}") String rsaPublicKey,
            @Value("${payway.return-url:}") String configuredReturnUrl,
            ObjectMapper objectMapper) {
        this.environment = resolveEnvironment(environment, configuredPaymentLinkUrl);
        this.merchantId = merchantId;
        this.apiKey = apiKey;
        this.publicBackendUrl = publicBackendUrl;
        this.configuredCheckUrl = configuredCheckUrl;
        this.configuredPaymentLinkUrl = configuredPaymentLinkUrl;
        this.rsaPublicKey = rsaPublicKey;
        this.configuredReturnUrl = configuredReturnUrl;
        this.objectMapper = objectMapper;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5000);
        requestFactory.setReadTimeout(8000);
        this.restTemplate = new RestTemplate(requestFactory);
    }

    public PaymentLink createPaymentLink(
            BigDecimal amount, String merchantReference, String title) {
        requireConfiguration();
        if (isBlank(rsaPublicKey)) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "ABA PayWay RSA public key is not configured");
        }
        if (isBlank(merchantReference) || merchantReference.length() > 50) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "ABA PayWay merchant reference must contain 1 to 50 characters");
        }
        BigDecimal payableAmount;
        try {
            payableAmount = amount.setScale(2, RoundingMode.UNNECESSARY);
        } catch (ArithmeticException e) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Order total must use no more than two decimal places", e);
        }
        if (payableAmount.compareTo(new BigDecimal("0.01")) < 0) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "ABA PayWay requires a payment link amount of at least USD 0.01");
        }

        Instant expiresAt = Instant.now().plusSeconds(24 * 60 * 60);
        String requestTime = REQUEST_TIME.format(Instant.now());
        String encodedCallback = Base64.getEncoder().encodeToString(
                callbackUrl().getBytes(StandardCharsets.UTF_8));
        Map<String, Object> authPayload = new LinkedHashMap<>();
        authPayload.put("mc_id", merchantId.trim());
        authPayload.put("title", title);
        authPayload.put("amount", payableAmount.toPlainString());
        authPayload.put("currency", "USD");
        authPayload.put("description", "FarmCraft order payment");
        authPayload.put("payment_limit", "1");
        authPayload.put("expired_date", Long.toString(expiresAt.getEpochSecond()));
        authPayload.put("return_url", encodedCallback);
        authPayload.put("merchant_ref_no", merchantReference);

        String encryptedAuth;
        try {
            encryptedAuth = encryptMerchantAuth(objectMapper.writeValueAsString(authPayload));
        } catch (JacksonException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "ABA PayWay payment link request could not be prepared", e);
        }
        String signature = hmacSha512Base64(requestTime + merchantId.trim() + encryptedAuth);
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("request_time", requestTime);
        form.add("merchant_id", merchantId.trim());
        form.add("merchant_auth", encryptedAuth);
        form.add("hash", signature);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        JsonNode responseBody;
        try {
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                    gatewayUrl(configuredPaymentLinkUrl, PAYMENT_LINK_PATH),
                    new HttpEntity<>(form, headers),
                    JsonNode.class);
            responseBody = response.getBody();
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "ABA PayWay could not create a payment link", e);
        }
        if (responseBody == null || !"00".equals(responseBody.path("status").path("code").asText())) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "ABA PayWay returned an unsuccessful payment-link response");
        }

        String paymentLink = responseBody.path("data").path("payment_link").asText("");
        validatePaymentLinkUrl(paymentLink);
        return new PaymentLink(paymentLink, LocalDateTime.ofInstant(expiresAt, ZoneOffset.UTC));
    }

    public PaymentStatus verifyTransaction(String tranId, BigDecimal expectedAmount) {
        requireConfiguration();
        String reqTime = REQUEST_TIME.format(Instant.now());
        Map<String, String> request = new LinkedHashMap<>();
        request.put("req_time", reqTime);
        request.put("merchant_id", merchantId.trim());
        request.put("tran_id", tranId);
        request.put("hash", hmacSha512Base64(reqTime + merchantId.trim() + tranId));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        JsonNode responseBody;
        try {
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(
                    gatewayUrl(configuredCheckUrl, CHECK_TRANSACTION_PATH),
                    new HttpEntity<>(request, headers),
                    JsonNode.class);
            responseBody = response.getBody();
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "ABA PayWay could not verify this transaction", e);
        }

        if (responseBody == null || !"00".equals(responseBody.path("status").path("code").asText())) {
            String code = responseBody == null
                    ? "empty response"
                    : responseBody.path("status").path("code").asText("unknown");
            if ("6".equals(code)) return PaymentStatus.PENDING;
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "ABA PayWay returned an invalid transaction verification response");
        }

        JsonNode data = responseBody.path("data");
        String status = data.path("payment_status").asText("");
        if ("APPROVED".equalsIgnoreCase(status) && data.path("payment_status_code").asInt(-1) == 0) {
            validateApprovedPayment(data, expectedAmount);
            return PaymentStatus.PAID;
        }
        if ("DECLINED".equalsIgnoreCase(status)) return PaymentStatus.FAILED;
        if ("CANCELLED".equalsIgnoreCase(status)) return PaymentStatus.CANCELLED;
        return PaymentStatus.PENDING;
    }

    public boolean isConfigured() {
        try {
            requireConfiguration();
            gatewayUrl(configuredPaymentLinkUrl, PAYMENT_LINK_PATH);
            gatewayUrl(configuredCheckUrl, CHECK_TRANSACTION_PATH);
            callbackUrl();
            readRsaPublicKey();
            return true;
        } catch (ResponseStatusException e) {
            return false;
        }
    }

    public void validateCallbackSignature(Map<String, Object> payload, String receivedSignature) {
        requireConfiguration();
        String signature = receivedSignature;
        if (isBlank(signature) && payload.get("hash") != null) {
            signature = payload.get("hash").toString();
        }
        if (isBlank(signature)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "ABA PayWay callback signature is required");
        }

        TreeMap<String, Object> sortedPayload = new TreeMap<>(payload);
        sortedPayload.entrySet().removeIf(entry -> {
            String key = entry.getKey();
            return key == null || "hash".equalsIgnoreCase(key) || "signature".equalsIgnoreCase(key);
        });

        List<String> values = new ArrayList<>(sortedPayload.size());
        for (Object value : sortedPayload.values()) {
            if (value instanceof Map<?, ?> || value instanceof List<?>) {
                try {
                    values.add(objectMapper.writeValueAsString(value));
                } catch (JacksonException e) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "ABA PayWay callback payload is invalid", e);
                }
            } else {
                values.add(value == null ? "" : String.valueOf(value));
            }
        }

        String expectedSignature = hmacSha512Base64(String.join("", values));
        if (!MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.US_ASCII),
                signature.trim().getBytes(StandardCharsets.US_ASCII))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "ABA PayWay callback signature is invalid");
        }
    }

    private void validateApprovedPayment(JsonNode data, BigDecimal expectedAmount) {
        if (!amountMatches(data.path("original_amount"), expectedAmount)
                || !amountMatches(data.path("total_amount"), expectedAmount)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "ABA PayWay transaction details do not match this order");
        }
    }

    private boolean amountMatches(JsonNode value, BigDecimal expectedAmount) {
        if (!value.isNumber() && !value.isTextual()) return false;
        try {
            return new BigDecimal(value.asText()).setScale(2, RoundingMode.HALF_UP)
                    .compareTo(expectedAmount.setScale(2, RoundingMode.HALF_UP)) == 0;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private String hmacSha512Base64(String input) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(apiKey.trim().getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            return Base64.getEncoder().encodeToString(mac.doFinal(input.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.GeneralSecurityException e) {
            throw new IllegalStateException("HMAC-SHA512 is unavailable", e);
        }
    }

    private void requireConfiguration() {
        if (isBlank(merchantId) || isBlank(apiKey) || merchantId.length() > 30) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "ABA PayWay merchant credentials are not configured");
        }
        String normalizedEnvironment = environment == null ? "" : environment.trim().toLowerCase();
        if (!"sandbox".equals(normalizedEnvironment) && !"production".equals(normalizedEnvironment)) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "ABA PayWay environment must be sandbox or production");
        }
        if (isBlank(publicBackendUrl) && isBlank(configuredReturnUrl)) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "ABA PayWay public backend URL is not configured");
        }
        if (isBlank(configuredReturnUrl)) {
            validateConfiguredUrl(publicBackendUrl, "ABA PayWay public backend URL");
        } else {
            validateConfiguredUrl(configuredReturnUrl, "ABA PayWay callback URL");
        }
    }

    private void validateConfiguredUrl(String configuredUrl, String label) {
        try {
            URI uri = URI.create(configuredUrl.trim());
            boolean secure = "https".equalsIgnoreCase(uri.getScheme());
            boolean localHttp = "http".equalsIgnoreCase(uri.getScheme())
                    && ("localhost".equalsIgnoreCase(uri.getHost())
                    || "127.0.0.1".equals(uri.getHost()));
            if (uri.getHost() == null || uri.getUserInfo() != null
                    || "your-domain.com".equalsIgnoreCase(uri.getHost())
                    || uri.getHost().toLowerCase().endsWith(".your-domain.com")
                    || (!secure && !("sandbox".equalsIgnoreCase(environment) && localHttp))) {
                throw new IllegalArgumentException();
            }
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    label + " must be an absolute HTTPS URL"
                            + ("production".equalsIgnoreCase(environment) ? "" : " or localhost HTTP in sandbox"),
                    e);
        }
    }

    private String gatewayUrl(String configuredUrl, String expectedPath) {
        String expectedHost = "production".equalsIgnoreCase(environment)
                ? "checkout.payway.com.kh"
                : "checkout-sandbox.payway.com.kh";
        if (isBlank(configuredUrl)) {
            return "https://" + expectedHost + expectedPath;
        }
        try {
            URI uri = URI.create(configuredUrl.trim());
            if (!"https".equalsIgnoreCase(uri.getScheme())
                    || !expectedHost.equalsIgnoreCase(uri.getHost())
                    || !expectedPath.equals(uri.getPath())
                    || uri.getUserInfo() != null
                    || (uri.getPort() != -1 && uri.getPort() != 443)
                    || uri.getQuery() != null
                    || uri.getFragment() != null) {
                throw new IllegalArgumentException();
            }
            return uri.toString();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "ABA PayWay URL does not match the configured environment", e);
        }
    }

    private String encryptMerchantAuth(String payload) {
        try {
            PublicKey publicKey = readRsaPublicKey();
            Cipher cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
            cipher.init(Cipher.ENCRYPT_MODE, publicKey);
            int blockSize = (((RSAKey) publicKey).getModulus().bitLength() + 7) / 8 - 11;
            byte[] input = payload.getBytes(StandardCharsets.UTF_8);
            java.io.ByteArrayOutputStream encrypted = new java.io.ByteArrayOutputStream();
            for (int offset = 0; offset < input.length; offset += blockSize) {
                byte[] block = cipher.doFinal(input, offset, Math.min(blockSize, input.length - offset));
                encrypted.write(block);
            }
            return Base64.getEncoder().encodeToString(encrypted.toByteArray());
        } catch (java.security.GeneralSecurityException | IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "ABA PayWay RSA public key is invalid", e);
        } catch (java.io.IOException e) {
            throw new IllegalStateException("Could not encode ABA PayWay merchant authorization", e);
        }
    }

    private PublicKey readRsaPublicKey() {
        if (isBlank(rsaPublicKey)) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "ABA PayWay RSA public key is not configured");
        }
        try {
            String key = rsaPublicKey.trim().replace("\\n", "\n");
            boolean pkcs1 = key.contains("BEGIN RSA PUBLIC KEY");
            String encoded = key.replaceAll("-----BEGIN [^-]+-----", "")
                    .replaceAll("-----END [^-]+-----", "")
                    .replaceAll("\\s", "");
            byte[] keyBytes = Base64.getDecoder().decode(encoded);
            if (pkcs1) keyBytes = wrapPkcs1RsaKey(keyBytes);
            return KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(keyBytes));
        } catch (java.security.GeneralSecurityException | IllegalArgumentException
                | java.io.IOException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "ABA PayWay RSA public key is invalid", e);
        }
    }

    private byte[] wrapPkcs1RsaKey(byte[] key) throws java.io.IOException {
        byte[] algorithm = new byte[] {
                0x30, 0x0d, 0x06, 0x09, 0x2a, (byte) 0x86, 0x48,
                (byte) 0x86, (byte) 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00
        };
        java.io.ByteArrayOutputStream bitString = new java.io.ByteArrayOutputStream();
        bitString.write(0);
        bitString.write(key);
        byte[] bitStringBytes = bitString.toByteArray();
        java.io.ByteArrayOutputStream sequence = new java.io.ByteArrayOutputStream();
        sequence.write(algorithm);
        sequence.write(0x03);
        writeDerLength(sequence, bitStringBytes.length);
        sequence.write(bitStringBytes);
        byte[] sequenceBytes = sequence.toByteArray();
        java.io.ByteArrayOutputStream encoded = new java.io.ByteArrayOutputStream();
        encoded.write(0x30);
        writeDerLength(encoded, sequenceBytes.length);
        encoded.write(sequenceBytes);
        return encoded.toByteArray();
    }

    private void writeDerLength(java.io.ByteArrayOutputStream output, int length) {
        if (length < 128) {
            output.write(length);
            return;
        }
        int byteCount = 0;
        for (int value = length; value > 0; value >>= 8) byteCount++;
        output.write(0x80 | byteCount);
        for (int shift = (byteCount - 1) * 8; shift >= 0; shift -= 8) {
            output.write((length >> shift) & 0xff);
        }
    }

    private void validatePaymentLinkUrl(String paymentLink) {
        try {
            URI uri = URI.create(paymentLink);
            String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase();
            boolean sandboxHost = host.contains("sandbox") || host.contains("euat");
            if (!"https".equalsIgnoreCase(uri.getScheme())
                    || !host.endsWith(".payway.com.kh")
                    || uri.getUserInfo() != null
                    || (uri.getPort() != -1 && uri.getPort() != 443)
                    || uri.getFragment() != null
                    || ("sandbox".equalsIgnoreCase(environment) != sandboxHost)) {
                throw new IllegalArgumentException();
            }
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "ABA PayWay returned a payment link outside the configured environment", e);
        }
    }

    private String callbackUrl() {
        if (!isBlank(configuredReturnUrl)) {
            validateConfiguredUrl(configuredReturnUrl, "ABA PayWay callback URL");
            URI callback = URI.create(configuredReturnUrl.trim());
            if (!"/api/payments/aba/return".equals(callback.getPath())
                    && !"/api/payway/callback".equals(callback.getPath())) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                        "ABA PayWay callback URL must target a supported FarmCraft callback route");
            }
            return configuredReturnUrl.trim();
        }
        validateConfiguredUrl(publicBackendUrl, "ABA PayWay public backend URL");
        return trimTrailingSlash(publicBackendUrl) + "/api/payments/aba/return";
    }

    private String resolveEnvironment(String configuredEnvironment, String paymentLinkUrl) {
        if (!isBlank(configuredEnvironment)) {
            return configuredEnvironment.trim().toLowerCase();
        }
        if (!isBlank(paymentLinkUrl)) {
            try {
                URI uri = URI.create(paymentLinkUrl.trim());
                if ("checkout.payway.com.kh".equalsIgnoreCase(uri.getHost())) {
                    return "production";
                }
                if ("checkout-sandbox.payway.com.kh".equalsIgnoreCase(uri.getHost())) {
                    return "sandbox";
                }
            } catch (IllegalArgumentException e) {
                return "";
            }
        }
        return "sandbox";
    }

    private String trimTrailingSlash(String value) {
        String result = value.trim();
        while (result.endsWith("/")) result = result.substring(0, result.length() - 1);
        return result;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    public record PaymentLink(String url, LocalDateTime expiresAt) {
    }
}
