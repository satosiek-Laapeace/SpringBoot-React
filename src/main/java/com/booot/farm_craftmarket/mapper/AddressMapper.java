package com.booot.farm_craftmarket.mapper;

import com.booot.farm_craftmarket.dto.request.AddressRequestDto;
import com.booot.farm_craftmarket.dto.response.AddressResponseDto;
import com.booot.farm_craftmarket.entity.AddressEntity;
import org.springframework.stereotype.Component;

@Component
public class AddressMapper {

    /** New entity. isDefault is decided by the service, so it is not copied here. */
    public AddressEntity toEntity(AddressRequestDto request, Long userId) {
        AddressEntity entity = new AddressEntity();
        entity.setUserId(userId);
        copyFields(request, entity);
        return entity;
    }

    /** Copies the editable fields onto an existing entity (isDefault handled by the service). */
    public void updateEntity(AddressEntity entity, AddressRequestDto request) {
        copyFields(request, entity);
    }

    public AddressResponseDto toDto(AddressEntity entity) {
        return AddressResponseDto.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .street(entity.getStreet())
                .city(entity.getCity())
                .state(entity.getState())
                .zip(entity.getZip())
                .country(entity.getCountry())
                .isDefault(entity.getIsDefault())
                .deliveryInstructions(entity.getDeliveryInstructions())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .googlePlaceId(entity.getGooglePlaceId())
                .formattedAddress(entity.getFormattedAddress())
                .build();
    }

    private void copyFields(AddressRequestDto request, AddressEntity entity) {
        entity.setStreet(request.getStreet());
        entity.setCity(request.getCity());
        entity.setState(request.getState());
        entity.setZip(request.getZip());
        entity.setCountry(request.getCountry());
        entity.setDeliveryInstructions(request.getDeliveryInstructions());
        entity.setLatitude(request.getLatitude());
        entity.setLongitude(request.getLongitude());
        entity.setGooglePlaceId(request.getGooglePlaceId());
        entity.setFormattedAddress(request.getFormattedAddress());
    }
}