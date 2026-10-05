package com.booot.farm_craftmarket.dto.response.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@AllArgsConstructor
@NoArgsConstructor
@Data
public class LoginResponseDto {
    private String username;
    private String token;
    private Set<String> roles;
}
