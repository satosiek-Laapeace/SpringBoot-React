package com.booot.farm_craftmarket.repository;

import com.booot.farm_craftmarket.entity.OrderItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemsRepository extends JpaRepository<OrderItemEntity, Long> {

    List<OrderItemEntity> findByOrder_Id(Long orderId);

    List<OrderItemEntity> findByProduct_Id(Long productId);
}