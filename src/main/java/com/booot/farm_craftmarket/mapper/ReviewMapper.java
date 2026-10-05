package com.booot.farm_craftmarket.mapper;

import com.booot.farm_craftmarket.dto.request.review.ReviewRequestDto;
import com.booot.farm_craftmarket.dto.response.review.ReviewResponseDto;
import com.booot.farm_craftmarket.entity.ReviewEntity;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewEntity toEntity(ReviewRequestDto request) {
        ReviewEntity entity = new ReviewEntity();
        entity.setProductId(request.getProductId());
        entity.setOrderId(request.getOrderId());
        entity.setRating(request.getRating());
        entity.setComment(request.getComment());
        return entity;
    }

    public ReviewResponseDto toResponse(ReviewEntity entity) {
        ReviewResponseDto dto = new ReviewResponseDto();
        dto.setId(entity.getId());
        dto.setProductId(entity.getProductId());
        dto.setBuyerId(entity.getBuyerId());
        dto.setOrderId(entity.getOrderId());
        dto.setRating(entity.getRating());
        dto.setComment(entity.getComment());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}