package com.booot.farm_craftmarket.dto.response.review;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewResponseDto {
    private Long id;
    private Long productId;
    private Long buyerId;
    private Long orderId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}