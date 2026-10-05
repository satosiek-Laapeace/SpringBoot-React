package com.booot.farm_craftmarket.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.booot.farm_craftmarket.dto.request.SupplierRequestDto;
import com.booot.farm_craftmarket.dto.response.SupplierResponseDto;

public interface SupplierService {
    SupplierResponseDto create(SupplierRequestDto request);

    SupplierResponseDto getById(Long id);

    Page<SupplierResponseDto> getAll(String keyword, Boolean active, Pageable pageable);
    SupplierResponseDto update(Long id, SupplierRequestDto request);
    
    SupplierResponseDto setActive(Long id, boolean active);
}