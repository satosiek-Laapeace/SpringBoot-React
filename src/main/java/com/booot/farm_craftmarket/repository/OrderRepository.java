package com.booot.farm_craftmarket.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.booot.farm_craftmarket.entity.OrderEntity;
import com.booot.farm_craftmarket.enums.orders.OrderStatus;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    List<OrderEntity> findByBuyerId(Long buyerId);

    @Query("""
            select distinct o
            from OrderEntity o
            join o.items item
            join item.product product
            where product.seller.id = :sellerId
            order by o.createdAt desc
            """)
    List<OrderEntity> findOrdersContainingSellerProducts(@Param("sellerId") Long sellerId);

    List<OrderEntity> findByBuyerIdAndStatus(Long buyerId, OrderStatus status);

    List<OrderEntity> findByStatus(OrderStatus status);
}