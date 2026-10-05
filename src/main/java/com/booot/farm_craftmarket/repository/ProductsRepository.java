package com.booot.farm_craftmarket.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.booot.farm_craftmarket.entity.ProductsEntity;

import jakarta.persistence.LockModeType;

@Repository
public interface ProductsRepository extends JpaRepository<ProductsEntity, Long>, JpaSpecificationExecutor<ProductsEntity> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select product from ProductsEntity product where product.id = :id")
    Optional<ProductsEntity> findByIdForUpdate(@Param("id") Long id);

    @Override
    @EntityGraph(attributePaths = {"category", "seller"})
    Page<ProductsEntity> findAll(org.springframework.data.jpa.domain.Specification<ProductsEntity> specification,
                                 Pageable pageable);

    @EntityGraph(attributePaths = "category")
    List<ProductsEntity> findByCategoryId(Long categoryId);

    @EntityGraph(attributePaths = "category")
    List<ProductsEntity> findByNameContainingIgnoreCase(String keyword);

    @EntityGraph(attributePaths = "category")
    List<ProductsEntity> findBySellerId(Long sellerId);

    @EntityGraph(attributePaths = {"category", "seller"})
    List<ProductsEntity> findBySeller_Id(Long sellerId);

    @Override
    @EntityGraph(attributePaths = "category")
    List<ProductsEntity> findAll();
}