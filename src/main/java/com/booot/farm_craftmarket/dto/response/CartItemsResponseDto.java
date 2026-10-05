package com.booot.farm_craftmarket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemsResponseDto {
    private Long itemId;
    private Long productId;
    private String productName;
    private String imageUrl;
    private String unit;
    private BigDecimal unitPrice;
    private Long quantity;
    private BigDecimal subTotal;
}