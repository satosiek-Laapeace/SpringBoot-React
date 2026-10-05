package com.booot.farm_craftmarket.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.booot.farm_craftmarket.dto.request.ProductsRequestDto;
import com.booot.farm_craftmarket.dto.response.ApiResponse;
import com.booot.farm_craftmarket.dto.response.ProductsResponseDto;
import com.booot.farm_craftmarket.mapping.IsAdminOrSeller;
import com.booot.farm_craftmarket.security.CustomUserDetailService.AppUser;
import com.booot.farm_craftmarket.service.ProductsService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Products", description = "Products Management APIs")
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductsController {

    private final ProductsService productsService;

    @Operation(summary = "Create a new product with optional image upload (admin or seller)")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @IsAdminOrSeller
    public ResponseEntity<ApiResponse<ProductsResponseDto>> createProducts(
            @Valid @ModelAttribute ProductsRequestDto requestDto,
            @AuthenticationPrincipal AppUser currentUser) {
        ProductsResponseDto created = productsService.createProduct(requestDto, currentUser.getId());
        return new ResponseEntity<>(
                ApiResponse.success("Product created successfully", created), HttpStatus.CREATED);
    }

    @Operation(summary = "Get product by ID")
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<ApiResponse<ProductsResponseDto>> getProductsById(@PathVariable Long id) {
        ProductsResponseDto product = productsService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Product retrieved successfully", product));
    }

    @Operation(summary = "Get products by category ID")
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<ProductsResponseDto>>> getProductsByCategoryId(
            @PathVariable Long categoryId) {
        List<ProductsResponseDto> products = productsService.getByCategoryId(categoryId);
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", products));
    }

    @Operation(summary = "Get product by name")
    @GetMapping("/name/{name}")
    public ResponseEntity<ApiResponse<ProductsResponseDto>> getProductsByName(@PathVariable String name) {
        ProductsResponseDto product = productsService.getProductByName(name);
        return ResponseEntity.ok(ApiResponse.success("Product retrieved successfully", product));
    }

    @Operation(summary = "Get all products")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductsResponseDto>>> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean inStock,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ProductsResponseDto> products = productsService.searchProducts(
                search, categoryId, minPrice, maxPrice, inStock, pageable);
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", products));
    }

    @Operation(summary = "Get the authenticated seller's products")
    @GetMapping("/mine")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<List<ProductsResponseDto>>> getMyProducts(
            @AuthenticationPrincipal AppUser currentUser) {
        return ResponseEntity.ok(ApiResponse.success(
                "Seller products retrieved successfully",
                productsService.getProductsForSeller(currentUser.getId())));
    }

    @Operation(summary = "Update product by ID with optional new image (admin or seller)")
    @PutMapping(value = "/{id:\\d+}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @IsAdminOrSeller
    public ResponseEntity<ApiResponse<ProductsResponseDto>> updateProduct(
            @PathVariable Long id,
            @Valid @ModelAttribute ProductsRequestDto requestDto,
            @AuthenticationPrincipal AppUser currentUser) {
        ProductsResponseDto updated = productsService.updateProduct(id, requestDto, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", updated));
    }

    @Operation(summary = "Delete product by ID (admin or seller)")
    @DeleteMapping("/{id:\\d+}")
    @IsAdminOrSeller
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal AppUser currentUser) {
        productsService.deleteProduct(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }
}