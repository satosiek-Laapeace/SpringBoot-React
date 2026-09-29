package com.booot.farm_craftmarket.dto.response;

import com.booot.farm_craftmarket.entity.OrderItemEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class OrderResponseDto {

    private Long id;
    private Long buyerId;
    private Long addressId;
    private BigDecimal totalAmount;
    private String deliverySlot;
    private String status;
    private LocalDateTime deliveryTime;

    private List<OrderItemsResponseDto> items;
    private LocalDateTime createdAt;

}
