package com.booot.farm_craftmarket.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.booot.farm_craftmarket.dto.request.ProductsImageRequestDto;
import com.booot.farm_craftmarket.dto.response.ApiResponse;
import com.booot.farm_craftmarket.dto.response.ProductsImageResponseDto;
import com.booot.farm_craftmarket.service.ProductsImageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products/{productId}/images")
@RequiredArgsConstructor
public class ProductsImageController {

    private final ProductsImageService imageService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductsImageResponseDto>>> getImages(
            @PathVariable Long productId) {
        return ResponseEntity.ok(
                ApiResponse.success("Images retrieved successfully", imageService.getImages(productId)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<ProductsImageResponseDto>>> uploadImages(
            @RequestParam Long sellerId,
            @PathVariable Long productId,
            @RequestPart("files") List<MultipartFile> files) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Images uploaded successfully",
                        imageService.uploadImages(sellerId, productId, files)));
    }

    @PutMapping("/{imageId}")
    public ResponseEntity<ApiResponse<ProductsImageResponseDto>> updateImage(
            @RequestParam Long sellerId,
            @PathVariable Long productId,
            @PathVariable Long imageId,
            @RequestBody ProductsImageRequestDto request) {
        return ResponseEntity.ok(
                ApiResponse.success("Image updated successfully",
                        imageService.updateImage(sellerId, productId, imageId, request)));
    }

    @PatchMapping("/{imageId}/primary")
    public ResponseEntity<ApiResponse<ProductsImageResponseDto>> setPrimary(
            @RequestParam Long sellerId,
            @PathVariable Long productId,
            @PathVariable Long imageId) {
        return ResponseEntity.ok(
                ApiResponse.success("Primary image updated successfully",
                        imageService.setPrimary(sellerId, productId, imageId)));
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @RequestParam Long sellerId,
            @PathVariable Long productId,
            @PathVariable Long imageId) {
        imageService.deleteImage(sellerId, productId, imageId);
        return ResponseEntity.ok(ApiResponse.<Void>success("Image deleted successfully", null));
    }
}