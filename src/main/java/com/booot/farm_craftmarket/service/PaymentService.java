package com.booot.farm_craftmarket.service;

import com.booot.farm_craftmarket.dto.response.PaymentResponseDto;
import com.booot.farm_craftmarket.dto.response.KhqrPaymentResponseDto;
import com.booot.farm_craftmarket.dto.response.KhqrPaymentStatusResponseDto;
import com.booot.farm_craftmarket.dto.response.AbaPaywayCheckoutDto;

import java.util.List;
import java.util.Map;

public interface PaymentService {

    String createCheckout(Long userId, Long orderId);

    AbaPaywayCheckoutDto createAbaPaywayCheckout(Long userId, Long orderId);

    PaymentResponseDto verifyAbaPaywayPayment(Long userId, Long orderId);

    void handleAbaPaywayCallback(Map<String, Object> payload, String signature);

    PaymentResponseDto createCashOnDelivery(Long userId, Long orderId);

    PaymentResponseDto createBankTransfer(Long userId, Long orderId, String reference);

    KhqrPaymentResponseDto createKhqrPayment(Long userId, Long orderId);

    KhqrPaymentStatusResponseDto verifyKhqrPayment(Long userId, Long orderId);

    PaymentResponseDto markPaid(Long orderId);

    List<PaymentResponseDto> getPaymentsForOrder(Long userId, Long orderId, boolean admin);

    void handleWebhook(String payload, String signature);
}