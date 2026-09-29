package com.booot.farm_craftmarket.controller;

import com.booot.farm_craftmarket.dto.request.CartRequestDto;
import com.booot.farm_craftmarket.dto.response.CartResponseDto;
import com.booot.farm_craftmarket.service.CartService;
import jakarta.validation.Valid;
import com.booot.farm_craftmarket.security.CustomUserDetailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartsController {

    private final CartService cartService;
    public CartsController(CartService cartService) {
        this.cartService = cartService;
    }
    @GetMapping
    public ResponseEntity<CartResponseDto> getCart(
            @AuthenticationPrincipal CustomUserDetailService user) {
        return ResponseEntity.ok(cartService.getCart(user.getId()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponseDto> addToCart(
            @AuthenticationPrincipal CustomUserDetailService user,
            @Valid @RequestBody CartRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cartService.addToCart(user.getId(), request));
    }

    @PutMapping("/items")
    public ResponseEntity<CartResponseDto> updateItem(
            @AuthenticationPrincipal CustomUserDetailService user,
            @Valid @RequestBody CartRequestDto request) {
        return ResponseEntity.ok(cartService.updateItem(user.getId(), request));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartResponseDto> removeItem(
            @AuthenticationPrincipal CustomUserDetailService user,
            @PathVariable Long productId) {
        return ResponseEntity.ok(cartService.removeItem(user.getId(), productId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(
            @AuthenticationPrincipal CustomUserDetailService user) {
        cartService.clearCart(user.getId());
        return ResponseEntity.noContent().build();
    }
}