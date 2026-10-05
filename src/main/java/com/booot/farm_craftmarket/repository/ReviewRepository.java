package com.booot.farm_craftmarket.repository;

import com.booot.farm_craftmarket.entity.ReviewEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<ReviewEntity, Long> {

    Page<ReviewEntity> findByProductId(Long productId, Pageable pageable);

    List<ReviewEntity> findByProductId(Long productId);

    Page<ReviewEntity> findByBuyerId(Long buyerId, Pageable pageable);

    boolean existsByProductIdAndBuyerId(Long productId, Long buyerId);

    Optional<ReviewEntity> findByIdAndBuyerId(Long id, Long buyerId);
}