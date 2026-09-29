package com.booot.farm_craftmarket.dto.request;

import jakarta.persistence.Column;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ProductsRequestDto {

    @NotBlank(message = "Name must not be blank")
    @Size(min = 1, max = 50, message = "Name must be between 1 and 50 characters.")
    private String name;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters.")
    private String description;

    @NotNull(message = "Price is required")
    @Column(nullable = false, precision = 10, scale = 2)
    @Positive(message = "Price must be greater than zero")
    @DecimalMin(value = "0.01", message = "Total amount must be at least 0.01")
    private BigDecimal price;

    private MultipartFile file;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Long stockQuantity;

    @NotBlank(message = "Unit must not be blank")
    private String unit;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}