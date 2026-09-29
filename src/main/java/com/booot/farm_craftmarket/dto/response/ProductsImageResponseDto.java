package com.booot.farm_craftmarket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductsImageResponseDto {

    private Long id;
    private Long productId;
    private String imageUrl;
    private Boolean isPrimary;
    private Integer sortOrder;
}