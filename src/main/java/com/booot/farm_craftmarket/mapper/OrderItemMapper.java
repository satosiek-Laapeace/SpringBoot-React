package com.booot.farm_craftmarket.mapper;

import com.booot.farm_craftmarket.dto.response.OrderItemsResponseDto;
import com.booot.farm_craftmarket.entity.OrderEntity;
import org.springframework.stereotype.Component;

@Component
public class OrderItemMapper {

    public OrderItemsResponseDto toOrderItemsResponseDto(OrderEntity orderEntity) {
        if (orderEntity == null) {
            return null;
        }
        OrderItemsResponseDto orderItemsResponseDto = new OrderItemsResponseDto();
        orderItemsResponseDto.setId(orderEntity.getId());
        orderItemsResponseDto.setOrderId(orderItemsResponseDto.getOrderId());
        orderItemsResponseDto.setProductId(orderItemsResponseDto.getProductId());
        orderItemsResponseDto.setProductName(orderItemsResponseDto.getProductName());
        orderItemsResponseDto.setQuantity(orderItemsResponseDto.getQuantity());
        orderItemsResponseDto.setPriceAtPurchase(orderItemsResponseDto.getPriceAtPurchase());
        orderItemsResponseDto.setSubTotal(orderItemsResponseDto.getSubTotal());

        return orderItemsResponseDto;
    }
}
