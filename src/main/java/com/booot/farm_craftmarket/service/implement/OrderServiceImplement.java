package com.booot.farm_craftmarket.service.implement;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.booot.farm_craftmarket.dto.request.OrderRequestDto;
import com.booot.farm_craftmarket.dto.response.OrderResponseDto;
import com.booot.farm_craftmarket.entity.OrderEntity;
import com.booot.farm_craftmarket.entity.OrderItemEntity;
import com.booot.farm_craftmarket.entity.UserEntity;
import com.booot.farm_craftmarket.enums.orders.OrderStatus;
import com.booot.farm_craftmarket.exception.ResourceNotFoundException;
import com.booot.farm_craftmarket.mapper.OrderMapper;
import com.booot.farm_craftmarket.repository.OrderItemsRepository;
import com.booot.farm_craftmarket.repository.OrderRepository;
import com.booot.farm_craftmarket.repository.ProductsRepository;
import com.booot.farm_craftmarket.repository.UserRepository;
import com.booot.farm_craftmarket.service.OrderService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderServiceImplement implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductsRepository productsRepository;
    private final OrderItemsRepository orderItemsRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;

    public OrderServiceImplement(
            OrderRepository orderRepository,
            ProductsRepository productsRepository,
            OrderItemsRepository orderItemsRepository,
            UserRepository userRepository,
            OrderMapper orderMapper
    ) {
        this.orderRepository = orderRepository;
        this.productsRepository = productsRepository;
        this.orderItemsRepository = orderItemsRepository;
        this.userRepository = userRepository;
        this.orderMapper = orderMapper;
    }

    @Override
    @Transactional
    public OrderResponseDto createOrder(OrderRequestDto orderRequestDto) {
        if (orderRequestDto.getItems() == null || orderRequestDto.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }

        UserEntity user = userRepository.findById(orderRequestDto.getBuyerId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id " + orderRequestDto.getBuyerId()));

        OrderEntity order = new OrderEntity();
        order.setBuyer(user);
        order.setDeliveryTime(LocalDateTime.now());
        order.setDeliverySlot(orderRequestDto.getDeliverySlot());
        order.setAddressId(orderRequestDto.getAddressId());
        order.setStatus(OrderStatus.PENDING);

        List<OrderItemEntity> orderItemEntities = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (var itemDto : orderRequestDto.getItems()) {
            var product = productsRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found with id " + itemDto.getProductId()));

            Long quantity = itemDto.getQuantity();
            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(quantity));

            OrderItemEntity orderItem = new OrderItemEntity();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(quantity);
            orderItem.setPriceAtPurchase(product.getPrice());

            orderItemEntities.add(orderItem);
            totalAmount = totalAmount.add(lineTotal);
        }

        order.setItems(orderItemEntities);
        order.setTotalAmount(totalAmount);

        OrderEntity savedOrder = orderRepository.save(order);
        orderItemsRepository.saveAll(orderItemEntities);

        return orderMapper.toOrderResponseDto(savedOrder);
    }

    @Override
    public OrderResponseDto getOrderById(Long orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return orderMapper.toOrderResponseDto(order);
    }

    @Override
    public List<OrderResponseDto> getOrdersByBuyer(Long buyerId) {
        return orderRepository.findByBuyerId(buyerId)
                .stream()
                .map(orderMapper::toOrderResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderResponseDto> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(orderMapper::toOrderResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderResponseDto updateOrderStatus(Long orderId, OrderStatus newStatus) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        order.setStatus(newStatus);
        OrderEntity updatedOrder = orderRepository.save(order);
        return orderMapper.toOrderResponseDto(updatedOrder);
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }
}