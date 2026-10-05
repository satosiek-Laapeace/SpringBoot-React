package com.booot.farm_craftmarket.mapper;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;
import com.booot.farm_craftmarket.dto.response.CartItemsResponseDto;
import com.booot.farm_craftmarket.dto.response.CartResponseDto;
import com.booot.farm_craftmarket.entity.CartEntity;
import com.booot.farm_craftmarket.entity.CartItemEntity;
import com.booot.farm_craftmarket.entity.ProductsEntity;


@Component
public class CartMapper {

        private final CartItemMapper cartItemMapper;
        public CartMapper(CartItemMapper cartItemMapper){
                this.cartItemMapper = cartItemMapper;
        }

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
                .buyerId(cart.getBuyerId())
                .cartItems(itemDto)
                .totalItems(totalItems)
                .totalAmount(totalAmount)
                .build();
    }

    public CartResponseDto empty(Long buyerId) {
        return CartResponseDto.builder()
                .id(null)
                .buyerId(buyerId)
                .cartItems(new ArrayList<>())
                .totalItems(0L)
                .totalAmount(BigDecimal.ZERO)
                .build();
    }
}