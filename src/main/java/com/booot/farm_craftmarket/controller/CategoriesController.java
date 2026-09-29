package com.booot.farm_craftmarket.controller;


import com.booot.farm_craftmarket.dto.request.CategoriesRequestDto;
import com.booot.farm_craftmarket.dto.response.ApiResponse;
import com.booot.farm_craftmarket.dto.response.CategoriesResponseDto;
import com.booot.farm_craftmarket.service.CategoriesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Category", description = "Category Management APIs")
@RestController
@RequestMapping("/api/categories")
public class CategoriesController {
    private   CategoriesService categoriesService;
    public CategoriesController(CategoriesService categoriesService) {
        this.categoriesService = categoriesService;
    }

    @Operation(summary = "Create a new category")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CategoriesResponseDto>> createCategory(
            @Valid @ModelAttribute CategoriesRequestDto categoriesRequestDto
    ) {
        CategoriesResponseDto create = categoriesService.createCategories(categoriesRequestDto);
        return new ResponseEntity<>(ApiResponse.success("Category retrieved successfully", create), HttpStatus.CREATED);
    }

    @Operation(summary = "Get all categories")
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoriesResponseDto>>> getCategories() {
        List<CategoriesResponseDto> categories =  categoriesService.getAllCategories();
        return new ResponseEntity<>(ApiResponse.success("Category retrieved successfully", categories), HttpStatus.OK);
    }
    @Operation(summary = "Update category by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoriesResponseDto>> getCategoryById(@PathVariable Long id) {
        CategoriesResponseDto categories = categoriesService.getCategoriesById(id);

        return ResponseEntity.ok(ApiResponse.success("Category retrieved successfully", categories));
    }

    @Operation(summary = "Update category by ID")
    @PutMapping(value = "/{id}",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CategoriesResponseDto>> updateCategories(
            @PathVariable Long id, @Valid @RequestBody CategoriesRequestDto categoriesRequestDto
    ) {
        CategoriesResponseDto update = categoriesService.updateCategories(id, categoriesRequestDto);
        return ResponseEntity.ok(ApiResponse.success("Category retrieved successfully", update));
    }

    @Operation(summary = "Delete Categories")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategories(@PathVariable Long id) {
        categoriesService.deleteCategories(id);
        return ResponseEntity.ok(ApiResponse.success("Categories delete successful", null));
    }

}
