package com.booot.farm_craftmarket.dto.request.auth;

import com.booot.farm_craftmarket.enums.roles.RolesUser;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleRegisterRequestDto {

    @NotBlank(message = "Google ID token is required")
    private String idToken;

    private RolesUser role;
}