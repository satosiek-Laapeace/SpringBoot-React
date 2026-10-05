package com.booot.farm_craftmarket.controller.auth;

import com.booot.farm_craftmarket.dto.request.auth.ForgotPasswordRequestDto;
import com.booot.farm_craftmarket.dto.request.auth.ResetPasswordRequestDto;
import com.booot.farm_craftmarket.dto.response.auth.MessageResponseDto;
import com.booot.farm_craftmarket.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    public PasswordResetController(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponseDto> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequestDto request) {
        return ResponseEntity.ok(passwordResetService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponseDto> resetPassword(
            @Valid @RequestBody ResetPasswordRequestDto request) {
        return ResponseEntity.ok(passwordResetService.resetPassword(request));
    }
}