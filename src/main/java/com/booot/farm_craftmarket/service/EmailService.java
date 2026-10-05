package com.booot.farm_craftmarket.service;

public interface EmailService {
    void sendOtpEmail(String to, String otp, Long expiryMinutes);
}