package com.booot.farm_craftmarket.repository;

import com.booot.farm_craftmarket.entity.CartEntity;
import com.booot.farm_craftmarket.entity.CartItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItemEntity, Long> {

    List<CartItemEntity> findByCartId(Long cartId);

    Optional<CartItemEntity> findByCartIdAndProductId(Long cartId, Long productId);
    void deleteByCartId(Long cartId);
}
