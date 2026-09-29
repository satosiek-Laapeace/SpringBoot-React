package com.booot.farm_craftmarket.controller;

import com.booot.farm_craftmarket.dto.request.OrderRequestDto;
import com.booot.farm_craftmarket.dto.response.ApiResponse;
import com.booot.farm_craftmarket.dto.response.OrderResponseDto;
import com.booot.farm_craftmarket.enums.orders.OrderStatus;
import com.booot.farm_craftmarket.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@Tag(name = "Orders", description = "Orders Management APIs")
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @Operation(summary = "Create Order")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<OrderResponseDto>> createOrder(
            @Valid @ModelAttribute OrderRequestDto orderRequestDto
    ){
        OrderResponseDto createOrder = orderService.createOrder(orderRequestDto);
        return new ResponseEntity<>(ApiResponse.success("Create Order success!",createOrder), HttpStatus.CREATED);
    }

    @Operation(summary = "Get All Orders")
    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponseDto>>> getAllOrders(){
        List<OrderResponseDto> getAll = orderService.getAllOrders();
        return ResponseEntity.ok(ApiResponse.success("Get Order successful!", getAll));
    }

    @Operation(summary = "Get Order By Id")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponseDto>> getOrderById(@PathVariable Long id){
        OrderResponseDto getById = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success("Get Order successful!",getById));
    }

    @Operation(summary = "Get Order By Buyer")
    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<ApiResponse<List<OrderResponseDto>>> getOrdersByBuyer(@PathVariable Long buyerId){
        List<OrderResponseDto> getByBuyer = orderService.getOrdersByBuyer(buyerId);
        return ResponseEntity.ok(ApiResponse.success("Get Order successful!",getByBuyer));
    }

    @Operation(summary = "update orders")
    @PutMapping(value = "/{id}/status", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<OrderResponseDto>> updateOrder(
            @Valid @ModelAttribute OrderStatus orderStatus,
            @PathVariable Long id
    ){
        OrderResponseDto update = orderService.updateOrderStatus(id , orderStatus);
        return ResponseEntity.ok(ApiResponse.success("Update Order successful!",update));
    }

    @Operation(summary = "Cancel Orders")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponseDto>> cancelOrder(@PathVariable Long id){
        orderService.cancelOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Cancel Order successful!",null));
    }
}
