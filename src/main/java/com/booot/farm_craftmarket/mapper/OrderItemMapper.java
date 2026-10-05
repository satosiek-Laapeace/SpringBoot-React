package com.booot.farm_craftmarket.mapper;

import java.math.BigDecimal;

import org.springframework.stereotype.Component;

import com.booot.farm_craftmarket.dto.response.OrderItemsResponseDto;
import com.booot.farm_craftmarket.entity.OrderItemEntity;

@Component
public class OrderItemMapper {

    public OrderItemsResponseDto toOrderItemsResponseDto(OrderItemEntity item) {
        if (item == null) {
            return null;
        }

        OrderItemsResponseDto dto = new OrderItemsResponseDto();
        dto.setId(item.getId());
        dto.setOrderId(item.getOrder() == null ? null : item.getOrder().getId());
        dto.setQuantity(item.getQuantity());
        dto.setPriceAtPurchase(item.getPriceAtPurchase());

        if (item.getProduct() != null) {
            dto.setProductId(item.getProduct().getId());
            dto.setProductName(item.getProduct().getName());
        }

        if (item.getPriceAtPurchase() != null && item.getQuantity() != null) {
            dto.setSubTotal(item.getPriceAtPurchase()
                    .multiply(BigDecimal.valueOf(item.getQuantity())));
        }
        return dto;
    }
}