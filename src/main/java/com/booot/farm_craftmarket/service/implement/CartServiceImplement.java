package com.booot.farm_craftmarket.service.implement;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.booot.farm_craftmarket.dto.request.CartRequestDto;
import com.booot.farm_craftmarket.dto.response.CartResponseDto;
import com.booot.farm_craftmarket.entity.CartEntity;
import com.booot.farm_craftmarket.entity.CartItemEntity;
import com.booot.farm_craftmarket.entity.ProductsEntity;
import com.booot.farm_craftmarket.mapper.CartMapper;
import com.booot.farm_craftmarket.repository.CartItemRepository;
import com.booot.farm_craftmarket.repository.CartRepository;
import com.booot.farm_craftmarket.repository.ProductsRepository;
import com.booot.farm_craftmarket.service.CartService;

@Service
public class CartServiceImplement implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductsRepository productsRepository;
    private final CartMapper cartMapper;

    public CartServiceImplement(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductsRepository productsRepository,
            CartMapper cartMapper
    ) {
        this.cartItemRepository = cartItemRepository;
        this.cartMapper = cartMapper;
        this.cartRepository = cartRepository;
        this.productsRepository = productsRepository;
    }

    @Override
    public CartResponseDto getCart(Long buyerId) {
        return cartRepository.findByBuyerId(buyerId)
                .map(this::buildResponse)
                .orElseGet(() -> cartMapper.empty(buyerId));
    }

    @Override
    public CartResponseDto addToCart(Long buyerId, CartRequestDto request) {
        ProductsEntity product = findProduct(request.getProductId());
        CartEntity cart = getOrCreateCart(buyerId);

        CartItemEntity item = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), product.getId())
                .orElseGet(() -> {
                    CartItemEntity created = new CartItemEntity();
                    created.setCartId(cart.getId());
                    created.setProductId(product.getId());
                    created.setQuantity(0L);
                    return created;
                });

        Long newQuantity = item.getQuantity() + request.getQuantity();
        validateStock(product, newQuantity);

        item.setQuantity(newQuantity);
        cartItemRepository.save(item);

        return buildResponse(cart);
    }

    @Override
    public CartResponseDto updateItem(Long buyerId, CartRequestDto request) {
        CartEntity cart = findCart(buyerId);
        CartItemEntity item = findItem(cart.getId(), request.getProductId());
        ProductsEntity product = findProduct(request.getProductId());

        validateStock(product, request.getQuantity());

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);

        return buildResponse(cart);
    }

    @Override
    public CartResponseDto removeItem(Long buyerId, Long productId) {
        CartEntity cart = findCart(buyerId);
        CartItemEntity item = findItem(cart.getId(), productId);

        cartItemRepository.delete(item);

        return buildResponse(cart);
    }

    @Override
    public void clearCart(Long buyerId) {
        cartRepository.findByBuyerId(buyerId)
                .ifPresent(cart -> cartItemRepository.deleteByCartId(cart.getId()));
    }

    private CartEntity getOrCreateCart(Long buyerId) {
        return cartRepository.findByBuyerId(buyerId).orElseGet(() -> {
            CartEntity cart = new CartEntity();
            cart.setBuyerId(buyerId);
            return cartRepository.save(cart);
        });
    }

    private CartEntity findCart(Long buyerId) {
        return cartRepository.findByBuyerId(buyerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart not found"));
    }

    private CartItemEntity findItem(Long cartId, Long productId) {
        return cartItemRepository.findByCartIdAndProductId(cartId, productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product is not in the cart"));
    }

    private ProductsEntity findProduct(Long productId) {
        return productsRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    private void validateStock(ProductsEntity product, Long requestedQuantity) {
        if (requestedQuantity > product.getStockQuantity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only " + product.getStockQuantity() + " in stock for " + product.getName());
        }
    }

    private CartResponseDto buildResponse(CartEntity cart) {
        List<CartItemEntity> items = cartItemRepository.findByCartId(cart.getId());

        List<Long> productIds = items.stream().map(CartItemEntity::getProductId).toList();
        Map<Long, ProductsEntity> productsById = productsRepository.findAllById(productIds).stream()
                .collect(Collectors.toMap(ProductsEntity::getId, Function.identity()));

        return cartMapper.toDto(cart, items, productsById);
    }
}
