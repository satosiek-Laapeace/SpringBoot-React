package com.booot.farm_craftmarket.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.booot.farm_craftmarket.dto.request.ProductsImageRequestDto;
import com.booot.farm_craftmarket.dto.response.ApiResponse;
import com.booot.farm_craftmarket.dto.response.ProductsImageResponseDto;
import com.booot.farm_craftmarket.mapping.IsAdminOrSeller;
import com.booot.farm_craftmarket.security.CustomUserDetailService.AppUser;
import com.booot.farm_craftmarket.service.ProductsImageService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Product Images", description = "Product image APIs")
@RestController
@RequestMapping("/api/products/{productId}/images")
@RequiredArgsConstructor
public class ProductsImageController {
    private final ProductsImageService imageService;

    @Operation(summary = "Get images of a product")
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductsImageResponseDto>>> getImages(
            @PathVariable Long productId) {
        return ResponseEntity.ok(
                ApiResponse.success("Images retrieved successfully", imageService.getImages(productId)));
    }

    @Operation(summary = "Upload images (admin or seller)")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @IsAdminOrSeller
    public ResponseEntity<ApiResponse<List<ProductsImageResponseDto>>> uploadImages(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long productId,
            @RequestPart("files") List<MultipartFile> files) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Images uploaded successfully",
                        imageService.uploadImages(user.getId(), productId, files)));
    }

    @Operation(summary = "Update image (admin or seller)")
    @PutMapping("/{imageId}")
    @IsAdminOrSeller
    public ResponseEntity<ApiResponse<ProductsImageResponseDto>> updateImage(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long productId,
            @PathVariable Long imageId,
            @Valid @RequestBody ProductsImageRequestDto request) {
        return ResponseEntity.ok(
                ApiResponse.success("Image updated successfully",
                        imageService.updateImage(user.getId(), productId, imageId, request)));
    }

    @Operation(summary = "Set primary image (admin or seller)")
    @PatchMapping("/{imageId}/primary")
    @IsAdminOrSeller
    public ResponseEntity<ApiResponse<ProductsImageResponseDto>> setPrimary(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long productId,
            @PathVariable Long imageId) {
        return ResponseEntity.ok(
                ApiResponse.success("Primary image updated successfully",
                        imageService.setPrimary(user.getId(), productId, imageId)));
    }

    @Operation(summary = "Delete image (admin or seller)")
    @DeleteMapping("/{imageId}")
    @IsAdminOrSeller
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long productId,
            @PathVariable Long imageId) {
        imageService.deleteImage(user.getId(), productId, imageId);
        return ResponseEntity.ok(ApiResponse.<Void>success("Image deleted successfully", null));
    }
}