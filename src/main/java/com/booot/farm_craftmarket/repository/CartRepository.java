package com.booot.farm_craftmarket.repository;

import com.booot.farm_craftmarket.entity.CartEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<CartEntity, Long> {
    Optional<CartEntity> findByBuyerId(Long buyerId);
}
