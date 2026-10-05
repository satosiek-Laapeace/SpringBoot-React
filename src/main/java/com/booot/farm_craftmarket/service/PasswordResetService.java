package com.booot.farm_craftmarket.service;

import com.booot.farm_craftmarket.dto.request.auth.ForgotPasswordRequestDto;
import com.booot.farm_craftmarket.dto.request.auth.ResetPasswordRequestDto;
import com.booot.farm_craftmarket.dto.response.auth.MessageResponseDto;

public interface PasswordResetService {
    MessageResponseDto forgotPassword(ForgotPasswordRequestDto request);
    MessageResponseDto resetPassword(ResetPasswordRequestDto request);
}