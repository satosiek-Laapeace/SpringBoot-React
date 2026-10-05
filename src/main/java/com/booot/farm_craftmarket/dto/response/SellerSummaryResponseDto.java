package com.booot.farm_craftmarket.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SellerSummaryResponseDto {
    private Long id;
    private String displayName;
    private String username;
    private String profilePictureUrl;
    private String role;
    private LocalDateTime createdAt;
}