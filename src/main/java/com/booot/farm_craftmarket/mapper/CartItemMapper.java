package com.booot.farm_craftmarket.mapper;

import com.booot.farm_craftmarket.dto.response.CartItemsResponseDto;
import com.booot.farm_craftmarket.entity.CartItemEntity;
import com.booot.farm_craftmarket.entity.ProductsEntity;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class CartItemMapper {

    public CartItemsResponseDto toDto(CartItemEntity item, ProductsEntity product) {
        BigDecimal subTotal = product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));


        return CartItemsResponseDto.builder()
                .itemId(item.getId())
                .productId(product.getId())
                .productName(product.getName())
                .imageUrl(product.getImageUrl())
                .unit(product.getUnit())
                .unitPrice(product.getPrice())
                .quantity(item.getQuantity())
                .subTotal(subTotal)
                .build();
    }
}