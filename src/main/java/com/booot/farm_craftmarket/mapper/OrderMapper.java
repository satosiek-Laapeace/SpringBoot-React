package com.booot.farm_craftmarket.mapper;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.booot.farm_craftmarket.dto.response.OrderItemsResponseDto;
import com.booot.farm_craftmarket.dto.response.OrderResponseDto;
import com.booot.farm_craftmarket.entity.OrderEntity;

@Component
public class OrderMapper {


    private final OrderItemMapper orderItemMapper;
    public OrderMapper(OrderItemMapper orderItemMapper){
        this.orderItemMapper = orderItemMapper;
    }


    public OrderResponseDto toOrderResponseDto(OrderEntity orderEntity) {
        if (orderEntity == null) {
            return null;
        }

        OrderResponseDto dto = new OrderResponseDto();
        dto.setId(orderEntity.getId());
        dto.setBuyerId(orderEntity.getBuyerId());
        if (orderEntity.getBuyer() != null) {
            dto.setBuyerName(orderEntity.getBuyer().getDisplayName() != null
                    ? orderEntity.getBuyer().getDisplayName()
                    : orderEntity.getBuyer().getUsername());
        }
        dto.setAddressId(orderEntity.getAddressId());
        dto.setTotalAmount(orderEntity.getTotalAmount());
        dto.setDeliverySlot(orderEntity.getDeliverySlot());
        dto.setDeliveryTime(orderEntity.getDeliveryTime());
        dto.setCreatedAt(orderEntity.getCreatedAt());

        if (orderEntity.getStatus() != null) {
            dto.setStatus(orderEntity.getStatus().name());
        }

        List<OrderItemsResponseDto> items = new ArrayList<>();
        if (orderEntity.getItems() != null) {
            orderEntity.getItems().forEach(
                    item -> items.add(orderItemMapper.toOrderItemsResponseDto(item)));
        }
        dto.setItems(items);

        return dto;
    }

    public OrderEntity toEntity(OrderResponseDto dto) {
        if (dto == null) {
            return null;
        }

        OrderEntity entity = new OrderEntity();
        entity.setId(dto.getId());
        entity.setAddressId(dto.getAddressId());
        entity.setBuyerId(dto.getBuyerId());
        entity.setTotalAmount(dto.getTotalAmount());
        entity.setDeliverySlot(dto.getDeliverySlot());
        entity.setDeliveryTime(dto.getDeliveryTime());
        return entity;
    }
}