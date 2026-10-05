package com.booot.farm_craftmarket.service.implement;

import java.util.List;
import java.util.Map;
import java.math.BigDecimal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import com.booot.farm_craftmarket.configuration.CloudService;
import com.booot.farm_craftmarket.dto.request.ProductsRequestDto;
import com.booot.farm_craftmarket.dto.response.ProductsResponseDto;
import com.booot.farm_craftmarket.entity.CategoriesEntity;
import com.booot.farm_craftmarket.entity.ProductsEntity;
import com.booot.farm_craftmarket.exception.ResourceNotFoundException;
import com.booot.farm_craftmarket.mapper.ProductsMapper;
import com.booot.farm_craftmarket.repository.CategoriesRepository;
import com.booot.farm_craftmarket.repository.ProductsRepository;
import com.booot.farm_craftmarket.repository.UserRepository;
import com.booot.farm_craftmarket.security.CustomUserDetailService.AppUser;
import com.booot.farm_craftmarket.service.ProductsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductsServiceImplement implements ProductsService {

    private static final String PRODUCT_FOLDER = "farm_craftmarket/products";

    private final ProductsRepository productsRepository;
    private final CategoriesRepository categoriesRepository;
    private final UserRepository userRepository;
    private final ProductsMapper productsMapper;
    private final CloudService cloudService;


    @Override
    @Transactional
    public ProductsResponseDto createProduct(ProductsRequestDto dto, Long sellerId) {
        CategoriesEntity category = findCategory(dto.getCategoryId());

        ProductsEntity product = new ProductsEntity();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setUnit(dto.getUnit());
        product.setCategory(category);
        product.setSeller(findSeller(sellerId));

        String uploadedPublicId = applyImage(product, dto.getFile());
        deleteOnRollback(uploadedPublicId);

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
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductsResponseDto> getProductsForSeller(Long sellerId) {
        return productsRepository.findBySeller_Id(sellerId).stream()
                .map(productsMapper::toProductsResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductsResponseDto> searchProducts(String keyword, Long categoryId, BigDecimal minPrice,
                                                    BigDecimal maxPrice, Boolean inStock, Pageable pageable) {
        validatePriceRange(minPrice, maxPrice);
        return productsRepository.findAll(
                        buildProductSpecification(keyword, categoryId, minPrice, maxPrice, inStock),
                        pageable)
                .map(productsMapper::toProductsResponseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductsResponseDto getProductByName(String name) {
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
                .toList();
    }


    @Override
    @Transactional
    public ProductsResponseDto updateProduct(Long id, ProductsRequestDto dto, AppUser currentUser) {
        ProductsEntity product = findProduct(id);
        checkOwnership(product, currentUser);
        CategoriesEntity category = findCategory(dto.getCategoryId());

        product.setCategory(category);
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setUnit(dto.getUnit());

        String oldPublicId = product.getPublicId();
        String newPublicId = applyImage(product, dto.getFile());
        if (newPublicId != null) {
            deleteOnRollback(newPublicId);
            deleteAfterCommit(oldPublicId);
        }

        return productsMapper.toProductsResponseDto(productsRepository.save(product));
    }

    @Override
    @Transactional
    public void deleteProduct(Long id, AppUser currentUser) {
        ProductsEntity product = findProduct(id);
        checkOwnership(product, currentUser);
        product.setDeleted(true);
        productsRepository.save(product);
    }

    private String applyImage(ProductsEntity product, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        Map<?, ?> result = cloudService.upload(file, PRODUCT_FOLDER);
        String publicId = result.get("public_id").toString();
        product.setImageUrl(result.get("secure_url").toString());
        product.setPublicId(publicId);
        return publicId;
    }

    private void checkOwnership(ProductsEntity product, AppUser user) {
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !product.getSeller().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only modify your own products");
        }
    }

    private com.booot.farm_craftmarket.entity.UserEntity findSeller(Long sellerId) {
        return userRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("No seller found with id " + sellerId));
    }

    private ProductsEntity findProduct(Long id) {
        return productsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No product found with id " + id));
    }

    private CategoriesEntity findCategory(Long categoryId) {
        return categoriesRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("No category found with id " + categoryId));
    }

    private void validatePriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        if ((minPrice != null && minPrice.signum() < 0)
                || (maxPrice != null && maxPrice.signum() < 0)
                || (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0)) {
            throw new IllegalArgumentException("Invalid product price range");
        }
    }

    private Specification<ProductsEntity> buildProductSpecification(String keyword, Long categoryId,
                                                                      BigDecimal minPrice, BigDecimal maxPrice,
                                                                      Boolean inStock) {
        String searchTerm = keyword == null ? "" : keyword.trim().toLowerCase();
        return (root, query, builder) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            addKeywordPredicate(searchTerm, root, builder, predicates);
            if (categoryId != null) {
                predicates.add(builder.equal(root.get("category").get("id"), categoryId));
            }
            addPricePredicates(minPrice, maxPrice, root, builder, predicates);
            addStockPredicate(inStock, root, builder, predicates);
            return builder.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    private void addKeywordPredicate(String searchTerm, jakarta.persistence.criteria.Root<ProductsEntity> root,
                                     jakarta.persistence.criteria.CriteriaBuilder builder,
                                     List<jakarta.persistence.criteria.Predicate> predicates) {
        if (searchTerm.isEmpty()) {
            return;
        }
        String pattern = "%" + searchTerm + "%";
        predicates.add(builder.or(
                builder.like(builder.lower(root.get("name")), pattern),
                builder.like(builder.lower(root.get("description")), pattern)));
    }

    private void addPricePredicates(BigDecimal minPrice, BigDecimal maxPrice,
                                    jakarta.persistence.criteria.Root<ProductsEntity> root,
                                    jakarta.persistence.criteria.CriteriaBuilder builder,
                                    List<jakarta.persistence.criteria.Predicate> predicates) {
        if (minPrice != null) {
            predicates.add(builder.greaterThanOrEqualTo(root.get("price"), minPrice));
        }
        if (maxPrice != null) {
            predicates.add(builder.lessThanOrEqualTo(root.get("price"), maxPrice));
        }
    }

    private void addStockPredicate(Boolean inStock, jakarta.persistence.criteria.Root<ProductsEntity> root,
                                jakarta.persistence.criteria.CriteriaBuilder builder,
                                List<jakarta.persistence.criteria.Predicate> predicates) {
        if (inStock == null) {
            return;
        }
        predicates.add(inStock
                ? builder.greaterThan(root.get("stockQuantity"), 0L)
                : builder.equal(root.get("stockQuantity"), 0L));
    }

    private void deleteAfterCommit(String publicId) {
        if (publicId == null || publicId.isBlank()) {
            return;
        }
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            deleteFromCloudinaryQuietly(cloudService, publicId);
            return;
        }
        CloudService service = cloudService;
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                ProductsServiceImplement.deleteFromCloudinaryQuietly(service, publicId);
            }
        });
    }

    private void deleteOnRollback(String publicId) {
        if (publicId == null || publicId.isBlank()
                || !TransactionSynchronizationManager.isSynchronizationActive()) {
            return;
        }
        CloudService service = cloudService;
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status != STATUS_COMMITTED) {
                    ProductsServiceImplement.deleteFromCloudinaryQuietly(service, publicId);
                }
            }
        });
    }

    private static void deleteFromCloudinaryQuietly(CloudService cloudService, String publicId) {
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