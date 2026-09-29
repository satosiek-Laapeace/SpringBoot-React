package com.booot.farm_craftmarket.service;

import java.util.List;

import com.booot.farm_craftmarket.dto.request.OrderRequestDto;
import com.booot.farm_craftmarket.dto.response.OrderResponseDto;
import com.booot.farm_craftmarket.enums.orders.OrderStatus;

public interface OrderService {

    OrderResponseDto createOrder(OrderRequestDto orderRequestDto);

    OrderResponseDto getOrderById(Long orderId);

    List<OrderResponseDto> getOrdersByBuyer(Long buyerId);

    List<OrderResponseDto> getAllOrders();

    OrderResponseDto updateOrderStatus(Long orderId, OrderStatus newStatus);

    void cancelOrder(Long orderId);
}