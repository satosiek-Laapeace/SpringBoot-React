package com.booot.farm_craftmarket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ProductsResponseDto {
    private Long id;

    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private Long stockQuantity;
    private String unit;

    private Long categoryId;
    private String categoryName;
}
