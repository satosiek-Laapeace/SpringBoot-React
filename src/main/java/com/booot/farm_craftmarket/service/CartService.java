package com.booot.farm_craftmarket.service;


import com.booot.farm_craftmarket.dto.request.CartRequestDto;
import com.booot.farm_craftmarket.dto.request.ProductsRequestDto;
import com.booot.farm_craftmarket.dto.response.CartResponseDto;

public interface CartService {

    CartResponseDto getCart(Long buyerId);
    CartResponseDto addToCart(Long buyerId, CartRequestDto cartRequestDto);

    CartResponseDto updateItem(Long buyerId, CartRequestDto cartRequestDto);

    CartResponseDto removeItem(Long buyerId, Long productId);

    void clearCart(Long buyerId);

}
