package com.booot.farm_craftmarket.service.implement;

import com.booot.farm_craftmarket.dto.request.AddressRequestDto;
import com.booot.farm_craftmarket.dto.response.AddressResponseDto;
import com.booot.farm_craftmarket.entity.AddressEntity;
import com.booot.farm_craftmarket.mapper.AddressMapper;
import com.booot.farm_craftmarket.repository.AddressRepository;
import com.booot.farm_craftmarket.service.AddressService;
import com.booot.farm_craftmarket.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressServiceImplement implements AddressService {

    private final AddressRepository addressRepository;
    private final AddressMapper addressMapper;

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponseDto> getAllAddresses(Long buyerId) {
        return addressRepository.findByBuyerIdOrderByIsDefaultDescIdAsc(buyerId).stream()
                .map(addressMapper::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AddressResponseDto getAddress(Long buyerId, Long addressId) {
        return addressMapper.toDto(findOwned(buyerId, addressId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponseDto> getNearbyAddresses(Long buyerId, double latitude,double longitude, double radiusKm) {
        if (!GeoUtils.isValidCoordinate(latitude, longitude) || radiusKm <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid latitude, longitude or radius");
        }

        return addressRepository.findByBuyerIdOrderByIsDefaultDescIdAsc(buyerId).stream()
                .filter(a -> a.getLatitude() != null && a.getLongitude() != null)
                .map(a -> {
                    double km = GeoUtils.distanceKm(latitude, longitude,
                            a.getLatitude(), a.getLongitude());
                    AddressResponseDto dto = addressMapper.toDto(a);
                    dto.setDistanceKm(Math.round(km * 100.0) / 100.0);
                    return dto;
                })
                .filter(dto -> dto.getDistanceKm() <= radiusKm)
                .sorted(Comparator.comparing(AddressResponseDto::getDistanceKm))
                .toList();
    }

    @Override
    @Transactional
    public AddressResponseDto createAddress(Long buyerId, AddressRequestDto request) {
        validateCoordinates(request);

        boolean isFirstAddress = addressRepository.countByBuyerId(buyerId) == 0;
        boolean makeDefault = isFirstAddress || Boolean.TRUE.equals(request.getIsDefault());

        if (makeDefault) {
            addressRepository.clearDefault(buyerId);
        }

        AddressEntity entity = addressMapper.toEntity(request, buyerId);
        entity.setIsDefault(makeDefault);

        return addressMapper.toDto(addressRepository.save(entity));
    }

    @Override
    @Transactional
    public AddressResponseDto updateAddress(Long buyerId, Long addressId,
                                            AddressRequestDto request) {
        validateCoordinates(request);
        AddressEntity entity = findOwned(buyerId, addressId);

        boolean promoteToDefault = Boolean.TRUE.equals(request.getIsDefault())
                && !Boolean.TRUE.equals(entity.getIsDefault());
        if (promoteToDefault) {
            addressRepository.clearDefault(buyerId);
        }

        addressMapper.updateEntity(entity, request);
        if (promoteToDefault) {
            entity.setIsDefault(true);
        }

        return addressMapper.toDto(addressRepository.save(entity));
    }

    @Override
    @Transactional
    public AddressResponseDto setDefaultAddress(Long buyerId, Long addressId) {
        AddressEntity entity = findOwned(buyerId, addressId);

        if (!Boolean.TRUE.equals(entity.getIsDefault())) {
            addressRepository.clearDefault(buyerId);
            entity.setIsDefault(true);
            entity = addressRepository.save(entity);
        }
        return addressMapper.toDto(entity);
    }

    @Override
    @Transactional
    public void deleteAddress(Long buyerId, Long addressId) {
        AddressEntity entity = findOwned(buyerId, addressId);
        boolean wasDefault = Boolean.TRUE.equals(entity.getIsDefault());

        try {
            addressRepository.delete(entity);
            addressRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This address is used by an existing order and cannot be deleted");
        }

        if (wasDefault) {
            addressRepository.findFirstByBuyerIdOrderByIdAsc(buyerId).ifPresent(next -> {
                next.setIsDefault(true);
                addressRepository.save(next);
            });
        }
    }

    private void validateCoordinates(AddressRequestDto request) {
        if ((request.getLatitude() == null) != (request.getLongitude() == null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "latitude and longitude must be provided together");
        }
    }

    private AddressEntity findOwned(Long buyerId, Long addressId) {
        return addressRepository.findByIdAndBuyerId(addressId, buyerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Address not found"));
    }
}