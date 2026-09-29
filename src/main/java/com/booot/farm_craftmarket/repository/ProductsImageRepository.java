package com.booot.farm_craftmarket.repository;

import com.booot.farm_craftmarket.entity.ProductsImageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductsImageRepository extends JpaRepository<ProductsImageEntity, Long> {

    List<ProductsImageEntity> findByProductIdOrderByIsPrimaryDescSortOrderAscIdAsc(Long productId);

    Optional<ProductsImageEntity> findByIdAndProductId(Long id, Long productId);

    long countByProductId(Long productId);

    boolean existsByProductIdAndIsPrimaryTrue(Long productId);

    Optional<ProductsImageEntity> findFirstByProductIdAndIsPrimaryTrue(Long productId);

    Optional<ProductsImageEntity> findFirstByProductIdOrderBySortOrderAscIdAsc(Long productId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update ProductsImageEntity i set i.isPrimary = false where i.productId = :productId")
    void clearPrimary(@Param("productId") Long productId);
}