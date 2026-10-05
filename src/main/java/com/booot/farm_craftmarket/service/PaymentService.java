package com.booot.farm_craftmarket.service;

import com.booot.farm_craftmarket.dto.response.PaymentResponseDto;
import com.booot.farm_craftmarket.dto.response.KhqrPaymentResponseDto;
import com.booot.farm_craftmarket.dto.response.KhqrPaymentStatusResponseDto;

import java.util.List;

public interface PaymentService {

    String createCheckout(Long userId, Long orderId);

    PaymentResponseDto createCashOnDelivery(Long userId, Long orderId);

    PaymentResponseDto createBankTransfer(Long userId, Long orderId, String reference);

    KhqrPaymentResponseDto createKhqrPayment(Long userId, Long orderId);

    KhqrPaymentStatusResponseDto verifyKhqrPayment(Long userId, Long orderId);

    PaymentResponseDto markPaid(Long orderId);

    List<PaymentResponseDto> getPaymentsForOrder(Long userId, Long orderId, boolean admin);

    void handleWebhook(String payload, String signature);
}