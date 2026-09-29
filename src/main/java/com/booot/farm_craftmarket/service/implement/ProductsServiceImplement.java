package com.booot.farm_craftmarket.service.implement;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.booot.farm_craftmarket.config.CloudService;
import com.booot.farm_craftmarket.dto.request.ProductsRequestDto;
import com.booot.farm_craftmarket.dto.response.ProductsResponseDto;
import com.booot.farm_craftmarket.entity.CategoriesEntity;
import com.booot.farm_craftmarket.entity.ProductsEntity;
import com.booot.farm_craftmarket.entity.ProductsImageEntity;
import com.booot.farm_craftmarket.exception.ResourceNotFoundException;
import com.booot.farm_craftmarket.mapper.ProductsMapper;
import com.booot.farm_craftmarket.repository.CategoriesRepository;
import com.booot.farm_craftmarket.repository.ProductsImageRepository;
import com.booot.farm_craftmarket.repository.ProductsRepository;
import com.booot.farm_craftmarket.service.ProductsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductsServiceImplement implements ProductsService {

    private final ProductsRepository productsRepository;
    private final CategoriesRepository categoriesRepository;
    private final ProductsImageRepository imageRepository;
    private final ProductsMapper productsMapper;
    private final CloudService cloudService;

    // ---------------------------------------------------------------- create

    @Override
    @Transactional
    public ProductsResponseDto createProduct(ProductsRequestDto dto) {
        CategoriesEntity category = findCategory(dto.getCategoryId());

        ProductsEntity product = productsMapper.toEntity(dto);
        product.setCategory(category);
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setUnit(dto.getUnit());
        product.setImageUrl(null);
        product.setPublicId(null);

        return productsMapper.toProductsResponseDto(productsRepository.save(product));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductsResponseDto getProductById(Long id) {
        return productsMapper.toProductsResponseDto(findProduct(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductsResponseDto> getAllProducts() {
        return productsRepository.findAll().stream()
                .map(productsMapper::toProductsResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductsResponseDto getProductByName(String name) {
        // assumes findByNameContainingIgnoreCase returns List<ProductsEntity>
        return productsRepository.findByNameContainingIgnoreCase(name).stream()
                .findFirst()
                .map(productsMapper::toProductsResponseDto)
                .orElseThrow(() -> new ResourceNotFoundException("No product found with name " + name));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductsResponseDto> getByCategoryId(Long categoryId) {
        if (!categoriesRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("No category found with id " + categoryId);
        }
        return productsRepository.findByCategoryId(categoryId).stream()
                .map(productsMapper::toProductsResponseDto)
                .collect(Collectors.toList());
    }
    @Override
    @Transactional
    public ProductsResponseDto updateProduct(Long id, ProductsRequestDto dto) {
        ProductsEntity product = findProduct(id);
        CategoriesEntity category = findCategory(dto.getCategoryId());

        product.setCategory(category);
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setUnit(dto.getUnit());
        return productsMapper.toProductsResponseDto(productsRepository.save(product));
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        ProductsEntity product = findProduct(id);

        List<ProductsImageEntity> images =
                imageRepository.findByProductIdOrderByIsPrimaryDescSortOrderAscIdAsc(id);

        Set<String> publicIds = images.stream()
                .map(ProductsImageEntity::getPublicId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        if (product.getPublicId() != null) {
            publicIds.add(product.getPublicId());
        }

        imageRepository.deleteAll(images);
        productsRepository.delete(product);
        productsRepository.flush();

        publicIds.forEach(this::deleteFromCloudinaryQuietly);
    }


    private ProductsEntity findProduct(Long id) {
        return productsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No product found with id " + id));
    }

    private CategoriesEntity findCategory(Long categoryId) {
        return categoriesRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("No category found with id " + categoryId));
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
}