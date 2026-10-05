package com.booot.farm_craftmarket.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.booot.farm_craftmarket.enums.payments.PaymentStatus;

public record KhqrPaymentResponseDto(
        Long orderId,
        BigDecimal amount,
        String currency,
        String qrString,
        String md5,
        String qrSvg,
        String merchantName,
        LocalDateTime expiresAt,
        PaymentStatus status) {
}
