package com.booot.farm_craftmarket.repository;

import com.booot.farm_craftmarket.entity.CartEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface CartRepository extends JpaRepository<CartEntity, Long> {
    Optional<CartEntity> findByBuyerId(Long buyerId);
}
