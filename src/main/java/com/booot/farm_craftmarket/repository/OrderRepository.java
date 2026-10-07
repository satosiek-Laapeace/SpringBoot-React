package com.booot.farm_craftmarket.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.booot.farm_craftmarket.entity.OrderEntity;
import com.booot.farm_craftmarket.enums.orders.OrderStatus;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    List<OrderEntity> findByBuyerId(Long buyerId);

    long countByStatusIn(Collection<OrderStatus> statuses);

    @Query("""
            select coalesce(sum(o.totalAmount), 0)
            from OrderEntity o
            where o.status <> :cancelled
            """)
    BigDecimal sumNonCancelledRevenue(@Param("cancelled") OrderStatus cancelled);

    @Query("""
            select coalesce(sum(o.totalAmount), 0)
            from OrderEntity o
            where o.status <> :cancelled
              and o.createdAt >= :from
              and o.createdAt <= :until
            """)
    BigDecimal sumNonCancelledRevenueBetween(
            @Param("cancelled") OrderStatus cancelled,
            @Param("from") LocalDateTime from,
            @Param("until") LocalDateTime until);

    @Query(value = """
            select cast(extract(year from created_at) as integer) as year,
                   cast(extract(month from created_at) as integer) as month,
                   coalesce(sum(total_amount), 0) as revenue
            from order_tbl
            where status <> 'CANCELLED'
              and created_at >= :from
              and created_at < :until
            group by extract(year from created_at), extract(month from created_at)
            """, nativeQuery = true)
    List<MonthlyRevenueProjection> findMonthlyRevenueBetween(
            @Param("from") LocalDateTime from,
            @Param("until") LocalDateTime until);

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