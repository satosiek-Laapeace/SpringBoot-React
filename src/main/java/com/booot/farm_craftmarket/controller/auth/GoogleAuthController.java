package com.booot.farm_craftmarket.controller.auth;

import com.booot.farm_craftmarket.dto.request.auth.GoogleLoginRequestDto;
import com.booot.farm_craftmarket.dto.request.auth.GoogleRegisterRequestDto;
import com.booot.farm_craftmarket.dto.response.auth.LoginResponseDto;
import com.booot.farm_craftmarket.service.GoogleAuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/google")
public class GoogleAuthController {

    private final GoogleAuthService googleAuthService;

    public GoogleAuthController(GoogleAuthService googleAuthService) {
        this.googleAuthService = googleAuthService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> googleLogin(@Valid @RequestBody GoogleLoginRequestDto request) {
        return ResponseEntity.ok(googleAuthService.loginWithGoogle(request));
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponseDto> googleRegister(@Valid @RequestBody GoogleRegisterRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(googleAuthService.registerWithGoogle(request));
    }
}