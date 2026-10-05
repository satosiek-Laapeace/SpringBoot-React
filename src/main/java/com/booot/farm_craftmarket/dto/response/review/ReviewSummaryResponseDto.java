package com.booot.farm_craftmarket.dto.response.review;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewSummaryResponseDto {
    private Long productId;
    private long totalReviews;
    private double averageRating;
}