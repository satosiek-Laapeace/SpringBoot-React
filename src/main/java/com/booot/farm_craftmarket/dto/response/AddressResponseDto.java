package com.booot.farm_craftmarket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class AddressResponseDto {

    private Long id;
    private Long buyerId;
    private String street;
    private String city;
    private String state;
    private String zip;
    private String country;
    private Boolean isDefault;
    private String deliveryInstructions;
    private Double latitude;
    private Double longitude;
    private String googlePlaceId;
    private String formattedAddress;
    private Double distanceKm;
}