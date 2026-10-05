package com.booot.farm_craftmarket.service;

import com.booot.farm_craftmarket.dto.request.StockMovementRequestDto;
import com.booot.farm_craftmarket.dto.response.StockMovementResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StockMovementService {

    StockMovementResponseDto create(StockMovementRequestDto request, Long actorId, boolean admin);

    StockMovementResponseDto getById(Long id, Long actorId, boolean admin);

    Page<StockMovementResponseDto> getAll(Pageable pageable, Long actorId, boolean admin);

    Page<StockMovementResponseDto> getByProductId(Long productId, Pageable pageable, Long actorId, boolean admin);

    Page<StockMovementResponseDto> getBySupplierId(Long supplierId, Pageable pageable);
}