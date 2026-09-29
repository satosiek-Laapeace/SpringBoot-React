package com.booot.farm_craftmarket.service;

import java.util.List;

import com.booot.farm_craftmarket.dto.request.ProductsRequestDto;
import com.booot.farm_craftmarket.dto.response.ProductsResponseDto;

public interface ProductsService {

    ProductsResponseDto getProductById(Long id);

    List<ProductsResponseDto> getAllProducts();

    ProductsResponseDto getProductByName(String name);

    List<ProductsResponseDto> getByCategoryId(Long categoriesId);

    ProductsResponseDto createProduct(ProductsRequestDto productsRequestDto);

    ProductsResponseDto updateProduct(Long id, ProductsRequestDto productsRequestDto);

    void deleteProduct(Long id);

}
