package com.booot.farm_craftmarket.service.implement;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.booot.farm_craftmarket.configuration.CloudService;
import com.booot.farm_craftmarket.dto.request.ProductsImageRequestDto;
import com.booot.farm_craftmarket.dto.response.ProductsImageResponseDto;
import com.booot.farm_craftmarket.entity.ProductsEntity;
import com.booot.farm_craftmarket.entity.ProductsImageEntity;
import com.booot.farm_craftmarket.repository.ProductsImageRepository;
import com.booot.farm_craftmarket.repository.ProductsRepository;
import com.booot.farm_craftmarket.service.ProductsImageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductsImageServiceImplement implements ProductsImageService {

    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;
    private static final int MAX_IMAGES_PER_PRODUCT = 8;
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final String FOLDER = "farm_craftmarket/products/";

    private final ProductsImageRepository imageRepository;
    private final ProductsRepository productsRepository;
    private final CloudService cloudService;

    @Override
    @Transactional(readOnly = true)
    public List<ProductsImageResponseDto> getImages(Long productId) {
        if (!productsRepository.existsById(productId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        return imageRepository.findByProductIdOrderByIsPrimaryDescSortOrderAscIdAsc(productId).stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional
    public List<ProductsImageResponseDto> uploadImages(Long sellerId, Long productId, List<MultipartFile> files) {
        ProductsEntity product = findOwnedProduct(sellerId, productId);

        if (files == null || files.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please choose at least one image");
        }
        files.forEach(this::validateFile);

        long existing = imageRepository.countByProductId(productId);
        if (existing + files.size() > MAX_IMAGES_PER_PRODUCT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A product can have at most " + MAX_IMAGES_PER_PRODUCT + " images");
        }

        boolean hasPrimary = imageRepository.existsByProductIdAndIsPrimaryTrue(productId);
        int nextOrder = (int) existing;

        List<String> uploadedPublicIds = new ArrayList<>();
        List<ProductsImageEntity> entities = new ArrayList<>();

        try {
            for (MultipartFile file : files) {
                Map<?, ?> result = cloudService.upload(file, FOLDER + productId);

                ProductsImageEntity entity = new ProductsImageEntity();
                entity.setProductId(productId);
                entity.setImageUrl((String) result.get("secure_url"));
                entity.setPublicId((String) result.get("public_id"));
                entity.setSortOrder(nextOrder++);
                entity.setIsPrimary(!hasPrimary);
                hasPrimary = true;

                uploadedPublicIds.add(entity.getPublicId());
                entities.add(entity);
            }

            List<ProductsImageEntity> saved = imageRepository.saveAll(entities);
            syncCover(product);

            return saved.stream().map(this::toDto).toList();
        } catch (RuntimeException e) {
            uploadedPublicIds.forEach(this::deleteFromCloudinaryQuietly);
            throw e;
        }
    }

    @Override
    @Transactional
    public ProductsImageResponseDto updateImage(Long sellerId, Long productId, Long imageId,
                                                ProductsImageRequestDto request) {
        ProductsEntity product = findOwnedProduct(sellerId, productId);
        ProductsImageEntity image = findImage(productId, imageId);

        boolean promote = Boolean.TRUE.equals(request.getIsPrimary())
                && !Boolean.TRUE.equals(image.getIsPrimary());
        if (promote) {
            imageRepository.clearPrimary(productId);
            image.setIsPrimary(true);
        }
        if (request.getSortOrder() != null) {
            image.setSortOrder(request.getSortOrder());
        }

        image = imageRepository.save(image);
        if (promote) {
            syncCover(product);
        }
        return toDto(image);
    }

    @Override
    @Transactional
    public ProductsImageResponseDto setPrimary(Long sellerId, Long productId, Long imageId) {
        ProductsEntity product = findOwnedProduct(sellerId, productId);
        ProductsImageEntity image = findImage(productId, imageId);

        if (!Boolean.TRUE.equals(image.getIsPrimary())) {
            imageRepository.clearPrimary(productId);
            image.setIsPrimary(true);
            image = imageRepository.save(image);
            syncCover(product);
        }
        return toDto(image);
    }

    @Override
    @Transactional
    public void deleteImage(Long sellerId, Long productId, Long imageId) {
        ProductsEntity product = findOwnedProduct(sellerId, productId);
        ProductsImageEntity image = findImage(productId, imageId);
        boolean wasPrimary = Boolean.TRUE.equals(image.getIsPrimary());
        String publicId = image.getPublicId();

        imageRepository.delete(image);
        imageRepository.flush();

        if (wasPrimary) {
            imageRepository.findFirstByProductIdOrderBySortOrderAscIdAsc(productId).ifPresent(next -> {
                next.setIsPrimary(true);
                imageRepository.save(next);
            });
        }
        syncCover(product);

        deleteFromCloudinaryQuietly(publicId);
    }

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    private ProductsEntity findOwnedProduct(Long userId, Long productId) {
        ProductsEntity product = productsRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        if (!isAdmin() && !userId.equals(sellerIdOf(product))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this product");
        }
        return product;
    }

    /**
     * Returns the owner's id.
     * If ProductsEntity.seller is a UserEntity: keep this line.
     * If it is a plain Long: change the body to "return product.getSeller();"
     */
    private Long sellerIdOf(ProductsEntity product) {
        return product.getSeller() == null ? null : product.getSeller().getId();
    }

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    private ProductsImageEntity findImage(Long productId, Long imageId) {
        return imageRepository.findByIdAndProductId(imageId, productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found"));
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Empty file is not allowed");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Each image must be 5 MB or smaller");
        }
        if (file.getContentType() == null || !ALLOWED_TYPES.contains(file.getContentType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only JPG, PNG or WEBP images are allowed");
        }
    }

    private void deleteFromCloudinaryQuietly(String publicId) {
        if (publicId == null || publicId.isBlank()) {
            return;
        }
        try {
            cloudService.delete(publicId);
        } catch (RuntimeException e) {
            log.warn("Could not delete Cloudinary image {}", publicId, e);
        }
    }

    private void syncCover(ProductsEntity product) {
        var primary = imageRepository.findFirstByProductIdAndIsPrimaryTrue(product.getId());
        product.setImageUrl(primary.map(ProductsImageEntity::getImageUrl).orElse(null));
        product.setPublicId(primary.map(ProductsImageEntity::getPublicId).orElse(null));
        productsRepository.save(product);
    }

    private ProductsImageResponseDto toDto(ProductsImageEntity e) {
        return ProductsImageResponseDto.builder()
                .id(e.getId())
                .productId(e.getProductId())
                .imageUrl(e.getImageUrl())
                .isPrimary(e.getIsPrimary())
                .sortOrder(e.getSortOrder())
                .build();
    }
}