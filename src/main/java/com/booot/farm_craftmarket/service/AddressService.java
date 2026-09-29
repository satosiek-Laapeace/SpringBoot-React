package com.booot.farm_craftmarket.service;

import com.booot.farm_craftmarket.dto.request.AddressRequestDto;
import com.booot.farm_craftmarket.dto.response.AddressResponseDto;

import java.util.List;

public interface AddressService {

    /** All addresses of the user, default address first. */
    List<AddressResponseDto> getAllAddresses(Long buyerId);

    AddressResponseDto getAddress(Long buyerId, Long addressId);

    List<AddressResponseDto> getNearbyAddresses(Long buyerId, double latitude, double longitude, double radiusKm);

    AddressResponseDto createAddress(Long buyerId, AddressRequestDto request);

    AddressResponseDto updateAddress(Long buyerId, Long addressId, AddressRequestDto request);

    /** Makes this address the default and un-defaults the others. */
    AddressResponseDto setDefaultAddress(Long buyerId, Long addressId);

    void deleteAddress(Long buyerId, Long addressId);
}