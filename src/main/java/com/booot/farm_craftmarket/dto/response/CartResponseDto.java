package com.booot.farm_craftmarket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class CartResponseDto {

    private Long id;
    private Long buyerId;

    private List<CartItemsResponseDto> cartItems;
    private Long totalItems;
    private BigDecimal totalAmount;
}