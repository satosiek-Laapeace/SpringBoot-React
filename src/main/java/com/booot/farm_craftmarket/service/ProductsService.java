package com.booot.farm_craftmarket.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.booot.farm_craftmarket.dto.request.ProductsRequestDto;
import com.booot.farm_craftmarket.dto.response.ProductsResponseDto;
import com.booot.farm_craftmarket.security.CustomUserDetailService.AppUser;

public interface ProductsService {

    ProductsResponseDto getProductById(Long id);

    List<ProductsResponseDto> getAllProducts();

    List<ProductsResponseDto> getProductsForSeller(Long sellerId);

    Page<ProductsResponseDto> searchProducts(String keyword, Long categoryId, BigDecimal minPrice,
                                            BigDecimal maxPrice, Boolean inStock, Pageable pageable);

    ProductsResponseDto getProductByName(String name);

    List<ProductsResponseDto> getByCategoryId(Long categoriesId);

    ProductsResponseDto createProduct(ProductsRequestDto dto, Long sellerId);

    ProductsResponseDto updateProduct(Long id, ProductsRequestDto dto, AppUser currentUser);

    void deleteProduct(Long id, AppUser currentUser);
}