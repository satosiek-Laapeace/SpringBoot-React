package com.booot.farm_craftmarket.controller;


import com.booot.farm_craftmarket.dto.request.ProductsRequestDto;
import com.booot.farm_craftmarket.dto.response.ApiResponse;
import com.booot.farm_craftmarket.dto.response.ProductsResponseDto;
import com.booot.farm_craftmarket.service.ProductsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Products", description = "Products Management APIs")
@RestController
@RequestMapping("/api/products")
public class ProductsController {
    private final ProductsService productsService;

    public ProductsController(
            ProductsService productsService
    ){
        this.productsService = productsService;
    }

    @Operation(summary = "Create a new product with optional image upload")
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<ProductsResponseDto>> createProducts(
            @Valid @ModelAttribute ProductsRequestDto requestDto
    ){
        ProductsResponseDto created = productsService.createProduct(requestDto);
        return new ResponseEntity<>(ApiResponse.success("Product create successful!",created),HttpStatus.CREATED);
    }

    @Operation(summary = "Get Products BY ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductsResponseDto>> getProductsById(
            @PathVariable Long id
    ){
        ProductsResponseDto getProduct =  productsService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Product successful!",getProduct));
    }

    @Operation(summary = "Get products by category ID")
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<ProductsResponseDto>>> getProductsByCategoryId(@PathVariable Long categoryId){
        List<ProductsResponseDto> products = productsService.getByCategoryId(categoryId);
        return ResponseEntity.ok(ApiResponse.success("Product successful!",products));
    }

    @Operation(summary = "Get Products BY Name")
    @GetMapping("/{name}")
    public ResponseEntity<ApiResponse<ProductsResponseDto>> getProductsByName(
            @PathVariable  String name
    ){
        ProductsResponseDto getProduct =  productsService.getProductByName(name);
        return ResponseEntity.ok(ApiResponse.success("Product successful!",getProduct));
    }
    @Operation(summary = "Get all products")
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductsResponseDto>>> getAllProducts(){
        List<ProductsResponseDto> getAll = productsService.getAllProducts();
        return ResponseEntity.ok(ApiResponse.success("Product successful!",getAll));
    }

    @Operation(summary = "Update product by ID with optional new image")
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductsResponseDto>> updateProduct(
            @Valid @ModelAttribute ProductsRequestDto requestDto,
            @PathVariable Long id
    ){
        ProductsResponseDto update = productsService.updateProduct(id, requestDto);
        return ResponseEntity.ok(ApiResponse.success("Product successful!",update));
    }
    @Operation(summary = "Delete product by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id){
        productsService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Delete Product success!", null));
    }
}
