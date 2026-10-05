package com.booot.farm_craftmarket.dto.request.auth;

import jakarta.validation.constraints.NotBlank;

public class GoogleLoginRequestDto {
    @NotBlank(message = "Google ID token is required")
    private String idToken;

    public String getIdToken() { return idToken; }
    public void setIdToken(String idToken) { this.idToken = idToken; }
}