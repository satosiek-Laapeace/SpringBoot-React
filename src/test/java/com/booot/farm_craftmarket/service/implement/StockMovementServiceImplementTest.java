package com.booot.farm_craftmarket.service.implement;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import com.booot.farm_craftmarket.dto.request.StockMovementRequestDto;
import com.booot.farm_craftmarket.dto.response.StockMovementResponseDto;
import com.booot.farm_craftmarket.entity.ProductsEntity;
import com.booot.farm_craftmarket.entity.StockMovementEntity;
import com.booot.farm_craftmarket.entity.UserEntity;
import com.booot.farm_craftmarket.enums.stock.StockMovementType;
import com.booot.farm_craftmarket.exception.ResourceNotFoundException;
import com.booot.farm_craftmarket.mapper.StockMovementMapper;
import com.booot.farm_craftmarket.repository.ProductsRepository;
import com.booot.farm_craftmarket.repository.StockMovementRepository;
import com.booot.farm_craftmarket.repository.SupplierRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class StockMovementServiceImplementTest {

    @Mock
    private StockMovementRepository stockMovementRepository;

    @Mock
    private ProductsRepository productsRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private StockMovementMapper mapper;

    @InjectMocks
    private StockMovementServiceImplement stockMovementService;

    @Test
    void sellerStockMovementListIsScopedToTheirProducts() {
        Pageable pageable = PageRequest.of(0, 20);
        when(stockMovementRepository.findByProduct_Seller_Id(42L, pageable))
                .thenReturn(new PageImpl<>(List.of()));

        var result = stockMovementService.getAll(pageable, 42L, false);

        assertEquals(0, result.getTotalElements());
        verify(stockMovementRepository).findByProduct_Seller_Id(42L, pageable);
        verify(stockMovementRepository, never()).findAll(pageable);
    }

    @Test
    void administratorsCanListAllStockMovements() {
        Pageable pageable = PageRequest.of(0, 20);
        when(stockMovementRepository.findAll(pageable)).thenReturn(new PageImpl<>(List.of()));

        var result = stockMovementService.getAll(pageable, 42L, true);

        assertEquals(0, result.getTotalElements());
        verify(stockMovementRepository).findAll(pageable);
        verify(stockMovementRepository, never()).findByProduct_Seller_Id(42L, pageable);
    }

    @Test
    void sellerCanAdjustTheirProductAndPersistsItsNewQuantity() {
        ProductsEntity product = new ProductsEntity();
        product.setId(7L);
        product.setStockQuantity(8L);
        UserEntity seller = new UserEntity();
        seller.setId(42L);
        product.setSeller(seller);

        StockMovementRequestDto request = new StockMovementRequestDto();
        request.setProductId(7L);
        request.setType(StockMovementType.RESTOCK);
        request.setQuantityChange(5);
        StockMovementEntity movement = new StockMovementEntity();
        StockMovementResponseDto response = new StockMovementResponseDto();

        when(productsRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(product));
        when(mapper.toEntity(request)).thenReturn(movement);
        when(stockMovementRepository.save(movement)).thenReturn(movement);
        when(mapper.toResponse(movement)).thenReturn(response);

        stockMovementService.create(request, 42L, false);

        assertEquals(13L, product.getStockQuantity());
        assertEquals(13, movement.getQuantityAfter());
        verify(productsRepository).save(product);
    }

    @Test
    void sellerCannotAdjustAnotherSellersProduct() {
        ProductsEntity product = new ProductsEntity();
        UserEntity seller = new UserEntity();
        seller.setId(99L);
        product.setSeller(seller);
        StockMovementRequestDto request = new StockMovementRequestDto();
        request.setProductId(7L);
        request.setType(StockMovementType.RESTOCK);
        request.setQuantityChange(5);
        when(productsRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(product));

        assertThrows(ResourceNotFoundException.class,
                () -> stockMovementService.create(request, 42L, false));

        verify(stockMovementRepository, never()).save(org.mockito.ArgumentMatchers.any());
        verify(productsRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }
}
