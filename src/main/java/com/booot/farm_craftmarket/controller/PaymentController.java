package com.booot.farm_craftmarket.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.booot.farm_craftmarket.dto.response.PaymentResponseDto;
import com.booot.farm_craftmarket.dto.response.KhqrPaymentResponseDto;
import com.booot.farm_craftmarket.dto.response.KhqrPaymentStatusResponseDto;
import com.booot.farm_craftmarket.dto.response.AbaPaywayCheckoutDto;
import com.booot.farm_craftmarket.mapping.IsAdmin;
import com.booot.farm_craftmarket.mapping.IsBuyer;
import com.booot.farm_craftmarket.security.CustomUserDetailService.AppUser;
import com.booot.farm_craftmarket.service.PaymentService;

import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;

@Tag(name = "Payments", description = "Payment APIs")
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Validated
public class PaymentController {
    public record CheckoutResponse(String checkoutUrl) { }

    private final PaymentService paymentService;

    @Hidden
    @PostMapping("/checkout/{orderId}")
    @IsBuyer
    public ResponseEntity<CheckoutResponse> checkout(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(
                new CheckoutResponse(paymentService.createCheckout(user.getId(), orderId)));
    }

    @Operation(summary = "Start an ABA PayWay checkout (buyer only)")
    @PostMapping("/aba/{orderId}")
    @IsBuyer
    public ResponseEntity<AbaPaywayCheckoutDto> abaPaywayCheckout(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.createAbaPaywayCheckout(user.getId(), orderId));
    }

    @Operation(summary = "Verify an ABA PayWay payment (buyer only)")
    @PostMapping("/aba/{orderId}/verify")
    @IsBuyer
    public ResponseEntity<PaymentResponseDto> verifyAbaPayway(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.verifyAbaPaywayPayment(user.getId(), orderId));
    }

    @Hidden
    @PostMapping({"/aba/return", "/payway/callback"})
    public ResponseEntity<Void> abaPaywayReturn(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "X-PayWay-Hmac-Sha512", required = false) String signature) {
        paymentService.handleAbaPaywayCallback(payload, signature);
        return ResponseEntity.ok().build();
    }

    @Hidden
    @PostMapping("/khqr/{orderId}")
    @IsBuyer
    public ResponseEntity<KhqrPaymentResponseDto> createKhqr(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.createKhqrPayment(user.getId(), orderId));
    }

    @Hidden
    @PostMapping("/khqr/{orderId}/verify")
    @IsBuyer
    public ResponseEntity<KhqrPaymentStatusResponseDto> verifyKhqr(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.verifyKhqrPayment(user.getId(), orderId));
    }

    @Hidden
    @PostMapping("/cod/{orderId}")
    @IsBuyer
    public ResponseEntity<PaymentResponseDto> cashOnDelivery(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.createCashOnDelivery(user.getId(), orderId));
    }

    @Hidden
    @PostMapping("/bank-transfer/{orderId}")
    @IsBuyer
    public ResponseEntity<PaymentResponseDto> bankTransfer(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long orderId,
            @RequestParam @NotBlank @Size(max = 100) String reference) {
        return ResponseEntity.ok(
                paymentService.createBankTransfer(user.getId(), orderId, reference));
    }

    @Hidden
    @PatchMapping("/order/{orderId}/paid")
    @IsAdmin
    public ResponseEntity<PaymentResponseDto> markPaid(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.markPaid(orderId));
    }

    @Operation(summary = "Payments of an order (owner or admin)")
    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('BUYER','ADMIN')")
    public ResponseEntity<List<PaymentResponseDto>> byOrder(
            @AuthenticationPrincipal AppUser user,
            Authentication auth,
            @PathVariable Long orderId) {
        boolean admin = auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        return ResponseEntity.ok(
                paymentService.getPaymentsForOrder(user.getId(), orderId, admin));
    }

    @Hidden
    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature) {
        paymentService.handleWebhook(payload, signature);
        return ResponseEntity.ok().build();
    }
}