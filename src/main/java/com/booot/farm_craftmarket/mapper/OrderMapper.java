package com.booot.farm_craftmarket.mapper;

import com.booot.farm_craftmarket.dto.response.OrderItemsResponseDto;
import com.booot.farm_craftmarket.dto.response.OrderResponseDto;
import com.booot.farm_craftmarket.entity.OrderEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class OrderMapper {

    public OrderResponseDto toOrderResponseDto(OrderEntity orderEntity) {
        if (orderEntity == null) {
            return null;
        }

        OrderResponseDto orderResponseDto = new OrderResponseDto();
        orderResponseDto.setId(orderResponseDto.getId());
        orderResponseDto.setAddressId(orderResponseDto.getAddressId());
        orderResponseDto.setBuyerId(orderResponseDto.getBuyerId());
        orderResponseDto.setTotalAmount(orderResponseDto.getTotalAmount());
        orderResponseDto.setDeliverySlot(orderResponseDto.getDeliverySlot());
        orderResponseDto.setDeliveryTime(orderResponseDto.getDeliveryTime());
        orderResponseDto.setCreatedAt(orderResponseDto.getCreatedAt());

        if (orderEntity.getStatus() != null) {
            orderResponseDto.setStatus(orderEntity.getStatus().name());
        }

        if (orderEntity.getItems() != null) {
            List<OrderItemsResponseDto> itemsList = new ArrayList<>();
            orderEntity.getItems().forEach((itemEntity) -> {
                OrderItemsResponseDto itemsResponseDto = new OrderItemsResponseDto();
                itemsResponseDto.setId(itemEntity.getId());
                itemsResponseDto.setOrderId(itemEntity.getOrderId());
                itemsResponseDto.setProductId(itemEntity.getProductId());
                itemsResponseDto.setQuantity(itemEntity.getProduct().getStockQuantity()); // fixed: was reading product stock
                itemsResponseDto.setPriceAtPurchase(itemEntity.getPriceAtPurchase());

                if (itemEntity.getProduct() != null) {
                    itemsResponseDto.setProductName(itemEntity.getProduct().getName());
                }
                itemsList.add(itemsResponseDto);
            });
            orderResponseDto.setItems(itemsList);
        }

        return orderResponseDto;
    }

    public OrderEntity toEntity(OrderResponseDto orderResponseDto) {
        if (orderResponseDto == null) {
            return null;
        }

        OrderEntity orderEntity = new OrderEntity();
        orderEntity.setId(orderResponseDto.getId());
        orderEntity.setAddressId(orderResponseDto.getAddressId());
        orderEntity.setBuyerId(orderResponseDto.getBuyerId());
        orderEntity.setTotalAmount(orderResponseDto.getTotalAmount());
        orderEntity.setDeliverySlot(orderResponseDto.getDeliverySlot());
        orderEntity.setDeliveryTime(orderResponseDto.getDeliveryTime());

        return orderEntity;
    }
}