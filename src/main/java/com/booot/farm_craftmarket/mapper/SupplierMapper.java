package com.booot.farm_craftmarket.mapper;

import com.booot.farm_craftmarket.dto.request.SupplierRequestDto;
import com.booot.farm_craftmarket.dto.response.SupplierResponseDto;
import com.booot.farm_craftmarket.entity.SupplierEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SupplierMapper {

    public SupplierEntity toEntity(SupplierRequestDto request) {
        SupplierEntity entity = new SupplierEntity();
        applyRequest(request, entity);
        return entity;
    }

    public void updateEntity(SupplierRequestDto request, SupplierEntity entity) {
        applyRequest(request, entity);
    }

    public SupplierResponseDto toResponse(SupplierEntity entity) {
        SupplierResponseDto dto = new SupplierResponseDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setContactPerson(entity.getContactPerson());
        dto.setEmail(entity.getEmail());
        dto.setPhone(entity.getPhone());
        dto.setAddress(entity.getAddress());
        dto.setDescription(entity.getDescription());
        dto.setIsActive(entity.getIsActive());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    public List<SupplierResponseDto> toResponseList(List<SupplierEntity> entities) {
        return entities.stream().map(this::toResponse).toList();
    }

    private void applyRequest(SupplierRequestDto request, SupplierEntity entity) {
        entity.setName(request.getName());
        entity.setContactPerson(request.getContactPerson());
        entity.setEmail(request.getEmail());
        entity.setPhone(request.getPhone());
        entity.setAddress(request.getAddress());
        entity.setDescription(request.getDescription());
    }
}