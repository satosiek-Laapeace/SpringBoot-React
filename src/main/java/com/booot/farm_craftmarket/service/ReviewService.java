package com.booot.farm_craftmarket.service;

import com.booot.farm_craftmarket.dto.request.review.ReviewRequestDto;
import com.booot.farm_craftmarket.dto.request.review.ReviewUpdateRequestDto;
import com.booot.farm_craftmarket.dto.response.review.ReviewResponseDto;
import com.booot.farm_craftmarket.dto.response.review.ReviewSummaryResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    ReviewResponseDto create(Long buyerId, ReviewRequestDto request);

    ReviewResponseDto getById(Long id);

    Page<ReviewResponseDto> getByProductId(Long productId, Pageable pageable);

    Page<ReviewResponseDto> getMine(Long buyerId, Pageable pageable);

    ReviewSummaryResponseDto getSummary(Long productId);

    ReviewResponseDto update(Long buyerId, Long id, ReviewUpdateRequestDto request);

    void delete(Long userId, boolean isAdmin, Long id);
}