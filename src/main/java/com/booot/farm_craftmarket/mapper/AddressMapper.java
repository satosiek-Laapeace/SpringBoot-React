package com.booot.farm_craftmarket.mapper;

import com.booot.farm_craftmarket.dto.request.AddressRequestDto;
import com.booot.farm_craftmarket.dto.response.AddressResponseDto;
import com.booot.farm_craftmarket.entity.AddressEntity;
import org.springframework.stereotype.Component;

@Component
public class AddressMapper {

    public AddressEntity toEntity(AddressRequestDto request, Long buyerId) {
        AddressEntity entity = new AddressEntity();
        entity.setBuyerId(buyerId);
        copyFields(request, entity);
        entity.setIsDefault(false);
        return entity;
    }
    public void updateEntity(AddressEntity entity, AddressRequestDto request) {
        copyFields(request, entity);
    }

    public AddressResponseDto toDto(AddressEntity entity) {
        if (entity == null) {
            return null;
        }
        return AddressResponseDto.builder()
                .id(entity.getId())
                .buyerId(entity.getBuyerId())
                .street(entity.getStreet())
                .city(entity.getCity())
                .state(entity.getState())
                .zip(entity.getZip())
                .country(entity.getCountry())
                .isDefault(Boolean.TRUE.equals(entity.getIsDefault()))
                .deliveryInstructions(entity.getDeliveryInstructions())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .googlePlaceId(entity.getGooglePlaceId())
                .formattedAddress(entity.getFormattedAddress())
                .build();
    }

    private void copyFields(AddressRequestDto request, AddressEntity entity) {
        entity.setStreet(trim(request.getStreet()));
        entity.setCity(trim(request.getCity()));
        entity.setState(trim(request.getState()));
        entity.setZip(trim(request.getZip()));
        entity.setCountry(trim(request.getCountry()));
        entity.setDeliveryInstructions(trim(request.getDeliveryInstructions()));
        entity.setLatitude(request.getLatitude());
        entity.setLongitude(request.getLongitude());
        entity.setGooglePlaceId(trim(request.getGooglePlaceId()));
        entity.setFormattedAddress(trim(request.getFormattedAddress()));
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }
}