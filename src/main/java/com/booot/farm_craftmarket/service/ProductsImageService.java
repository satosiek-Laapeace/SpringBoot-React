package com.booot.farm_craftmarket.service;

import com.booot.farm_craftmarket.dto.request.ProductsImageRequestDto;
import com.booot.farm_craftmarket.dto.response.ProductsImageResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductsImageService {

    List<ProductsImageResponseDto> getImages(Long productId);

    List<ProductsImageResponseDto> uploadImages(Long sellerId, Long productId, List<MultipartFile> files);

    ProductsImageResponseDto updateImage(Long sellerId, Long productId, Long imageId, ProductsImageRequestDto request);

    ProductsImageResponseDto setPrimary(Long sellerId, Long productId, Long imageId);

    void deleteImage(Long sellerId, Long productId, Long imageId);
}