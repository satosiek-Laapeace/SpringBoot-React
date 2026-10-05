package com.booot.farm_craftmarket.service;

import java.util.List;

import com.booot.farm_craftmarket.dto.request.OrderRequestDto;
import com.booot.farm_craftmarket.dto.response.OrderResponseDto;
import com.booot.farm_craftmarket.enums.orders.OrderStatus;
public interface OrderService {

    OrderResponseDto createOrder(Long buyerId, OrderRequestDto dto);

    List<OrderResponseDto> getAllOrders();

    List<OrderResponseDto> getOrdersByBuyer(Long buyerId);

    List<OrderResponseDto> getOrdersForSeller(Long sellerId);

    OrderResponseDto getOrderById(Long buyerId, Long orderId);

    OrderResponseDto updateOrderStatus(Long buyerId, Long orderId, OrderStatus status);

    void cancelOrder(Long buyerId, Long orderId);
}