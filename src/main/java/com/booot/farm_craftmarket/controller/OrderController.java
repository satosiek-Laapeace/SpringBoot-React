package com.booot.farm_craftmarket.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.booot.farm_craftmarket.dto.request.OrderRequestDto;
import com.booot.farm_craftmarket.dto.response.ApiResponse;
import com.booot.farm_craftmarket.dto.response.OrderResponseDto;
import com.booot.farm_craftmarket.enums.orders.OrderStatus;
import com.booot.farm_craftmarket.mapping.IsAdmin;
import com.booot.farm_craftmarket.mapping.IsAdminOrSeller;
import com.booot.farm_craftmarket.mapping.IsBuyer;
import com.booot.farm_craftmarket.security.CustomUserDetailService.AppUser;
import com.booot.farm_craftmarket.service.OrderService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Orders", description = "Orders Management APIs")
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @Operation(summary = "Create order (buyer only)")
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @IsBuyer
    public ResponseEntity<ApiResponse<OrderResponseDto>> createOrder(
            @AuthenticationPrincipal AppUser user,
            @Valid @RequestBody OrderRequestDto orderRequestDto) {
        OrderResponseDto created = orderService.createOrder(user.getId(), orderRequestDto);
        return new ResponseEntity<>(
                ApiResponse.success("Order created successfully", created), HttpStatus.CREATED);
    }

    @Operation(summary = "Get all orders (admin only)")
    @GetMapping
    @IsAdmin
    public ResponseEntity<ApiResponse<List<OrderResponseDto>>> getAllOrders() {
        return ResponseEntity.ok(
                ApiResponse.success("Orders retrieved successfully", orderService.getAllOrders()));
    }

    @Operation(summary = "Get my orders (buyer only)")
    @GetMapping("/my")
    @IsBuyer
    public ResponseEntity<ApiResponse<List<OrderResponseDto>>> getMyOrders(
            @AuthenticationPrincipal AppUser user) {
        return ResponseEntity.ok(
                ApiResponse.success("Orders retrieved successfully",
                        orderService.getOrdersByBuyer(user.getId())));
    }

    @Operation(summary = "Get orders containing the authenticated seller's products")
    @GetMapping("/seller/my")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<List<OrderResponseDto>>> getMySellerOrders(
            @AuthenticationPrincipal AppUser user) {
        return ResponseEntity.ok(
                ApiResponse.success("Seller orders retrieved successfully",
                        orderService.getOrdersForSeller(user.getId())));
    }

    @Operation(summary = "Get orders of a buyer (admin only)")
    @GetMapping("/buyer/{buyerId}")
    @IsAdmin
    public ResponseEntity<ApiResponse<List<OrderResponseDto>>> getOrdersByBuyer(
            @PathVariable Long buyerId) {
        return ResponseEntity.ok(
                ApiResponse.success("Orders retrieved successfully",
                        orderService.getOrdersByBuyer(buyerId)));
    }

    @Operation(summary = "Get order by ID (owner, involved seller, or admin)")
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderResponseDto>> getOrderById(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Order retrieved successfully",
                        orderService.getOrderById(user.getId(), id)));
    }

    @Operation(summary = "Update order status (admin or seller)")
    @PutMapping("/{id}/status")
    @IsAdminOrSeller
    public ResponseEntity<ApiResponse<OrderResponseDto>> updateOrderStatus(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(
                ApiResponse.success("Order updated successfully",
                        orderService.updateOrderStatus(user.getId(), id, status)));
    }

    @Operation(summary = "Cancel order (owner buyer or admin)")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('BUYER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long id) {
        orderService.cancelOrder(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", null));
    }
}