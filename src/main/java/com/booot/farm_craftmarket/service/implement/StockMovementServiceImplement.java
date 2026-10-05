package com.booot.farm_craftmarket.service.implement;

import com.booot.farm_craftmarket.dto.request.StockMovementRequestDto;
import com.booot.farm_craftmarket.dto.response.StockMovementResponseDto;
import com.booot.farm_craftmarket.entity.ProductsEntity;
import com.booot.farm_craftmarket.entity.StockMovementEntity;
import com.booot.farm_craftmarket.exception.BadRequestException;
import com.booot.farm_craftmarket.exception.ResourceNotFoundException;
import com.booot.farm_craftmarket.mapper.StockMovementMapper;
import com.booot.farm_craftmarket.repository.ProductsRepository;
import com.booot.farm_craftmarket.repository.StockMovementRepository;
import com.booot.farm_craftmarket.repository.SupplierRepository;
import com.booot.farm_craftmarket.service.StockMovementService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StockMovementServiceImplement implements StockMovementService {

    private final StockMovementRepository stockMovementRepository;
    private final ProductsRepository productsRepository;
    private final SupplierRepository supplierRepository;
    private final StockMovementMapper mapper;

    @Override
    @Transactional
    public StockMovementResponseDto create(StockMovementRequestDto request, Long actorId, boolean admin) {
        ProductsEntity product = productsRepository.findByIdForUpdate(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with id: " + request.getProductId()));
        if (!admin && !product.getSeller().getId().equals(actorId)) {
            throw new ResourceNotFoundException("Product not found with id: " + request.getProductId());
        }
        if (request.getSupplierId() != null && !supplierRepository.existsById(request.getSupplierId())) {
            throw new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId());
        }

        long currentQty = product.getStockQuantity();
        long newQty = currentQty + request.getQuantityChange();
        if (newQty < 0 || newQty > Integer.MAX_VALUE) {
            throw new BadRequestException(
                    "Invalid stock change. Current: " + currentQty + ", change: " + request.getQuantityChange());
        }

        product.setStockQuantity(newQty);
        productsRepository.save(product);
        StockMovementEntity entity = mapper.toEntity(request);
        entity.setQuantityAfter((int) newQty);

        return mapper.toResponse(stockMovementRepository.save(entity));
    }

    @Override
    @Transactional(readOnly = true)
    public StockMovementResponseDto getById(Long id, Long actorId, boolean admin) {
        Optional<StockMovementEntity> movement = admin
                ? stockMovementRepository.findById(id)
                : stockMovementRepository.findByIdAndProduct_Seller_Id(id, actorId);
        return movement
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Stock movement not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StockMovementResponseDto> getAll(Pageable pageable, Long actorId, boolean admin) {
        Page<StockMovementEntity> movements = admin
                ? stockMovementRepository.findAll(pageable)
                : stockMovementRepository.findByProduct_Seller_Id(actorId, pageable);
        return movements.map(mapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StockMovementResponseDto> getByProductId(
            Long productId, Pageable pageable, Long actorId, boolean admin) {
        if (!admin) {
            findAccessibleProduct(productId, actorId, false);
        }
        Page<StockMovementEntity> movements = admin
                ? stockMovementRepository.findByProductId(productId, pageable)
                : stockMovementRepository.findByProductIdAndProduct_Seller_Id(productId, actorId, pageable);
        return movements.map(mapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StockMovementResponseDto> getBySupplierId(Long supplierId, Pageable pageable) {
        return stockMovementRepository.findBySupplierId(supplierId, pageable).map(mapper::toResponse);
    }

    private ProductsEntity findAccessibleProduct(Long productId, Long actorId, boolean admin) {
        ProductsEntity product = productsRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        if (!admin && !product.getSeller().getId().equals(actorId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }
        return product;
    }
}