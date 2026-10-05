package com.booot.farm_craftmarket.repository;

import com.booot.farm_craftmarket.entity.StockMovementEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovementEntity, Long> {

    Page<StockMovementEntity> findByProductId(Long productId, Pageable pageable);

    Page<StockMovementEntity> findByProduct_Seller_Id(Long sellerId, Pageable pageable);

    Page<StockMovementEntity> findByProductIdAndProduct_Seller_Id(Long productId, Long sellerId, Pageable pageable);

    Optional<StockMovementEntity> findByIdAndProduct_Seller_Id(Long id, Long sellerId);

    Page<StockMovementEntity> findBySupplierId(Long supplierId, Pageable pageable);

    Optional<StockMovementEntity> findTopByProductIdOrderByIdDesc(Long productId);
}