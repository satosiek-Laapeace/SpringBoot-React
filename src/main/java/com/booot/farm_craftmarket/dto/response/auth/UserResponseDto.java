package com.booot.farm_craftmarket.dto.response.auth;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserResponseDto {
    private Long id;
    private String name;
    private String fullName;
    private String email;
    private String profilePictureUrl;
    private String role;
    private boolean enabled;
    private LocalDateTime lockTime;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;
}
