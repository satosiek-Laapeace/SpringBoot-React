package com.booot.farm_craftmarket.mapper;

import com.booot.farm_craftmarket.dto.response.CartItemsResponseDto;
import com.booot.farm_craftmarket.dto.response.CartResponseDto;
import com.booot.farm_craftmarket.entity.CartEntity;
import com.booot.farm_craftmarket.entity.CartItemEntity;
import com.booot.farm_craftmarket.entity.ProductsEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CartMapper {

    private final CartItemMapper cartItemMapper;

    public CartResponseDto toDto(CartEntity cart,
                                 List<CartItemEntity> items,
                                 Map<Long, ProductsEntity> productsById) {

        List<CartItemsResponseDto> itemDto = items.stream()
                .filter(item -> productsById.containsKey(item.getProductId())) // skip deleted products
                .map(item -> cartItemMapper.toDto(item, productsById.get(item.getProductId())))
                .toList();

        BigDecimal totalAmount = itemDto.stream()
                .map(CartItemsResponseDto::getSubTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalItems = itemDto.stream()
                .mapToLong(CartItemsResponseDto::getQuantity)
                .sum();

        return CartResponseDto.builder()
                .id(cart.getId())
                .userId(cart.getUserId())
                .cartItems(itemDto)
                .totalItems(totalItems)
                .totalAmount(totalAmount)
                .build();
    }

    /** Response for a user who has no cart yet. */
    public CartResponseDto empty(Long userId) {
        return CartResponseDto.builder()
                .id(null)
                .userId(userId)
                .cartItems(new ArrayList<>())
                .totalItems(0L)
                .totalAmount(BigDecimal.ZERO)
                .build();
    }
}