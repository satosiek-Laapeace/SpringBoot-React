package com.booot.farm_craftmarket.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.booot.farm_craftmarket.entity.OrderEntity;
import com.booot.farm_craftmarket.enums.orders.OrderStatus;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    List<OrderEntity> findByBuyerId(Long buyerId);

    List<OrderEntity> findByBuyerIdAndStatus(Long buyerId, OrderStatus status);

    List<OrderEntity> findByStatus(OrderStatus status);
}