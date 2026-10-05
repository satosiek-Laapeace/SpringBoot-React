package com.booot.farm_craftmarket.mapper;

import com.booot.farm_craftmarket.dto.request.StockMovementRequestDto;
import com.booot.farm_craftmarket.dto.response.StockMovementResponseDto;
import com.booot.farm_craftmarket.entity.StockMovementEntity;
import org.springframework.stereotype.Component;

@Component
public class StockMovementMapper {

    public StockMovementEntity toEntity(StockMovementRequestDto dto) {
        if (dto == null) return null;
        StockMovementEntity entity = new StockMovementEntity();
        entity.setProductId(dto.getProductId());
        entity.setType(dto.getType());
        entity.setQuantityChange(dto.getQuantityChange());
        entity.setSupplierId(dto.getSupplierId());
        entity.setReferenceOrderId(dto.getReferenceOrderId());
        entity.setNote(dto.getNote());
        return entity;
    }

    public StockMovementResponseDto toResponse(StockMovementEntity entity) {
        if (entity == null) return null;
        StockMovementResponseDto dto = new StockMovementResponseDto();
        dto.setId(entity.getId());
        dto.setProductId(entity.getProductId());
        dto.setProductName(entity.getProduct() == null ? null : entity.getProduct().getName());
        dto.setType(entity.getType());
        dto.setQuantityChange(entity.getQuantityChange());
        dto.setQuantityAfter(entity.getQuantityAfter());
        dto.setSupplierId(entity.getSupplierId());
        dto.setReferenceOrderId(entity.getReferenceOrderId());
        dto.setNote(entity.getNote());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}