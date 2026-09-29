package com.booot.farm_craftmarket.repository;

import com.booot.farm_craftmarket.entity.OrderItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemsRepository extends JpaRepository<OrderItemEntity, Long> {
    List<OrderItemEntity> findByOrderId(Long orderId);

    List<OrderItemEntity> findByProductId(Long productId);
}
