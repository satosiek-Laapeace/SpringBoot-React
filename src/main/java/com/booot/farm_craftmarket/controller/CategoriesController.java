package com.booot.farm_craftmarket.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.booot.farm_craftmarket.dto.request.CategoriesRequestDto;
import com.booot.farm_craftmarket.dto.response.ApiResponse;
import com.booot.farm_craftmarket.dto.response.CategoriesResponseDto;
import com.booot.farm_craftmarket.mapping.IsAdmin;
import com.booot.farm_craftmarket.mapping.IsAdminOrSeller;
import com.booot.farm_craftmarket.service.CategoriesService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Category", description = "Category Management APIs")
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoriesController {

    private final CategoriesService categoriesService;

    @Operation(summary = "Create a new category (admin or seller)")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @IsAdminOrSeller
    public ResponseEntity<ApiResponse<CategoriesResponseDto>> createCategory(
            @Valid @ModelAttribute CategoriesRequestDto categoriesRequestDto) throws IOException {
        CategoriesResponseDto created = categoriesService.createCategories(categoriesRequestDto);
        return new ResponseEntity<>(
                ApiResponse.success("Category created successfully", created), HttpStatus.CREATED);
    }

    @Operation(summary = "Get all categories")
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoriesResponseDto>>> getCategories() {
        List<CategoriesResponseDto> categories = categoriesService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categories));
    }

    @Operation(summary = "Get category by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoriesResponseDto>> getCategoryById(@PathVariable Long id) {
        CategoriesResponseDto category = categoriesService.getCategoriesById(id);
        return ResponseEntity.ok(ApiResponse.success("Category retrieved successfully", category));
    }

    @Operation(summary = "Update category by ID (admin or seller)")
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @IsAdminOrSeller
    public ResponseEntity<ApiResponse<CategoriesResponseDto>> updateCategories(
            @PathVariable Long id,
            @Valid @ModelAttribute CategoriesRequestDto categoriesRequestDto) throws IOException {
        CategoriesResponseDto updated = categoriesService.updateCategories(id, categoriesRequestDto);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", updated));
    }

    @Operation(summary = "Delete category (admin only)")
    @DeleteMapping("/{id}")
    @IsAdmin
    public ResponseEntity<ApiResponse<Void>> deleteCategories(@PathVariable Long id) {
        categoriesService.deleteCategories(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }
}