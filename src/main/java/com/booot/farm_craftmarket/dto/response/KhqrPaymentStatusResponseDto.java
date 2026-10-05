package com.booot.farm_craftmarket.dto.response;

import java.time.LocalDateTime;

import com.booot.farm_craftmarket.enums.payments.PaymentStatus;

public record KhqrPaymentStatusResponseDto(
        Long orderId,
        PaymentStatus status,
        LocalDateTime paidAt) {
}
