package com.booot.farm_craftmarket.repository;

import com.booot.farm_craftmarket.entity.ProductsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductsRepository extends JpaRepository<ProductsEntity, Long> {
    List<ProductsEntity> findByCategoryId(Long categoryId);

    List<ProductsEntity> findByNameContainingIgnoreCase(String keyword);
}
