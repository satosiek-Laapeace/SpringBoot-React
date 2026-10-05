package com.booot.farm_craftmarket.service.implement;

import com.booot.farm_craftmarket.dto.request.review.ReviewRequestDto;
import com.booot.farm_craftmarket.dto.request.review.ReviewUpdateRequestDto;
import com.booot.farm_craftmarket.dto.response.review.ReviewResponseDto;
import com.booot.farm_craftmarket.dto.response.review.ReviewSummaryResponseDto;
import com.booot.farm_craftmarket.entity.ReviewEntity;
import com.booot.farm_craftmarket.exception.BadRequestException;
import com.booot.farm_craftmarket.mapper.ReviewMapper;
import com.booot.farm_craftmarket.repository.ProductsRepository;
import com.booot.farm_craftmarket.repository.ReviewRepository;
import com.booot.farm_craftmarket.service.ReviewService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImplement implements ReviewService {
    private final ReviewRepository reviewRepository;
    private final ProductsRepository productsRepository;
    private final ReviewMapper mapper;

    @Override
    @Transactional
    public ReviewResponseDto create(Long buyerId, ReviewRequestDto request) {
        if (!productsRepository.existsById(request.getProductId())) {
            throw new EntityNotFoundException("Product not found with id: " + request.getProductId());
        }
        if (reviewRepository.existsByProductIdAndBuyerId(request.getProductId(), buyerId)) {
            throw new BadRequestException("You have already reviewed this product");
        }

        ReviewEntity entity = mapper.toEntity(request);
        entity.setBuyerId(buyerId);

        return mapper.toResponse(reviewRepository.save(entity));
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponseDto getById(Long id) {
        return reviewRepository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Review not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponseDto> getByProductId(Long productId, Pageable pageable) {
        if (!productsRepository.existsById(productId)) {
            throw new EntityNotFoundException("Product not found with id: " + productId);
        }
        return reviewRepository.findByProductId(productId, pageable).map(mapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponseDto> getMine(Long buyerId, Pageable pageable) {
        return reviewRepository.findByBuyerId(buyerId, pageable).map(mapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewSummaryResponseDto getSummary(Long productId) {
        if (!productsRepository.existsById(productId)) {
            throw new EntityNotFoundException("Product not found with id: " + productId);
        }
        List<ReviewEntity> reviews = reviewRepository.findByProductId(productId);
        double avg = reviews.stream()
                .mapToInt(ReviewEntity::getRating)
                .average()
                .orElse(0.0);
        double rounded = Math.round(avg * 10.0) / 10.0;
        return new ReviewSummaryResponseDto(productId, reviews.size(), rounded);
    }

    @Override
    @Transactional
    public ReviewResponseDto update(Long buyerId, Long id, ReviewUpdateRequestDto request) {
        ReviewEntity entity = reviewRepository.findByIdAndBuyerId(id, buyerId)
                .orElseThrow(() -> new EntityNotFoundException("Review not found with id: " + id));

        entity.setRating(request.getRating());
        entity.setComment(request.getComment());

        return mapper.toResponse(reviewRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(Long userId, boolean isAdmin, Long id) {
        ReviewEntity entity = isAdmin
                ? reviewRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Review not found with id: " + id))
                : reviewRepository.findByIdAndBuyerId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Review not found with id: " + id));

        reviewRepository.delete(entity);
    }
}