package com.booot.farm_craftmarket.service;

import com.booot.farm_craftmarket.dto.request.auth.GoogleLoginRequestDto;
import com.booot.farm_craftmarket.dto.request.auth.GoogleRegisterRequestDto;
import com.booot.farm_craftmarket.dto.response.auth.LoginResponseDto;

public interface GoogleAuthService {
    LoginResponseDto loginWithGoogle(GoogleLoginRequestDto request);

    LoginResponseDto registerWithGoogle(GoogleRegisterRequestDto request);
}