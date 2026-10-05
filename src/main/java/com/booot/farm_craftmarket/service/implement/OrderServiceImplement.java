package com.booot.farm_craftmarket.service.implement;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.booot.farm_craftmarket.dto.request.OrderRequestDto;
import com.booot.farm_craftmarket.dto.response.OrderResponseDto;
import com.booot.farm_craftmarket.entity.OrderEntity;
import com.booot.farm_craftmarket.entity.OrderItemEntity;
import com.booot.farm_craftmarket.entity.UserEntity;
import com.booot.farm_craftmarket.enums.orders.OrderStatus;
import com.booot.farm_craftmarket.enums.roles.RolesUser;
import com.booot.farm_craftmarket.enums.stock.NotificationType;
import com.booot.farm_craftmarket.exception.ResourceNotFoundException;
import com.booot.farm_craftmarket.mapper.OrderMapper;
import com.booot.farm_craftmarket.repository.AddressRepository;
import com.booot.farm_craftmarket.repository.OrderItemsRepository;
import com.booot.farm_craftmarket.repository.OrderRepository;
import com.booot.farm_craftmarket.repository.ProductsRepository;
import com.booot.farm_craftmarket.repository.UserRepository;
import com.booot.farm_craftmarket.service.OrderService;
import com.booot.farm_craftmarket.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderServiceImplement implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductsRepository productsRepository;
    private final OrderItemsRepository orderItemsRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final OrderMapper orderMapper;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public OrderResponseDto createOrder(Long buyerId, OrderRequestDto orderRequestDto) {
        if (orderRequestDto.getItems() == null || orderRequestDto.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }
        if (orderRequestDto.getAddressId() == null) {
            throw new IllegalArgumentException("Address is required");
        }

        UserEntity buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + buyerId));

        addressRepository.findByIdAndBuyerId(orderRequestDto.getAddressId(), buyerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Address not found with id " + orderRequestDto.getAddressId()));

        OrderEntity order = new OrderEntity();
        order.setBuyer(buyer);
        order.setDeliveryTime(LocalDateTime.now());
        order.setDeliverySlot(orderRequestDto.getDeliverySlot());
        order.setAddressId(orderRequestDto.getAddressId());
        order.setStatus(OrderStatus.PENDING);

        List<OrderItemEntity> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (var itemDto : orderRequestDto.getItems()) {
            if (itemDto.getProductId() == null) {
                throw new IllegalArgumentException("Product id is required");
            }
            if (itemDto.getQuantity() == null || itemDto.getQuantity() <= 0) {
                throw new IllegalArgumentException("Quantity must be greater than 0");
            }

            var product = productsRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found with id " + itemDto.getProductId()));

            if (product.getPrice() == null) {
                throw new IllegalStateException("Product " + product.getId() + " has no price");
            }

            Long quantity = itemDto.getQuantity();
            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(quantity));

            OrderItemEntity orderItem = new OrderItemEntity();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(quantity);
            orderItem.setPriceAtPurchase(product.getPrice());

            orderItems.add(orderItem);
            totalAmount = totalAmount.add(lineTotal);
        }

        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);

        OrderEntity savedOrder = orderRepository.save(order);
        orderItemsRepository.saveAll(orderItems);

        notifyOrderStakeholders(savedOrder, NotificationType.ORDER_PLACED,
                "New order received", "New order #" + savedOrder.getId() + " is waiting for processing.");

        return orderMapper.toOrderResponseDto(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDto getOrderById(Long userId, Long orderId) {
        OrderEntity order = findOrder(orderId);

        if (!isAdmin() && !isOrderBuyer(order, userId) && !isOrderSeller(order, userId)) {
            throw new AccessDeniedException("You are not allowed to view this order");
        }
        return orderMapper.toOrderResponseDto(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponseDto> getOrdersByBuyer(Long buyerId) {
        return orderRepository.findByBuyerId(buyerId)
                .stream()
                .map(orderMapper::toOrderResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponseDto> getOrdersForSeller(Long sellerId) {
        return orderRepository.findOrdersContainingSellerProducts(sellerId)
                .stream()
                .map(orderMapper::toOrderResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponseDto> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(orderMapper::toOrderResponseDto)
                .toList();
    }

    @Override
    @Transactional
    public OrderResponseDto updateOrderStatus(Long userId, Long orderId, OrderStatus newStatus) {
        if (newStatus == null) {
            throw new IllegalArgumentException("Status is required");
        }

        OrderEntity order = findOrder(orderId);

        if (!isAdmin() && !isOrderSeller(order, userId)) {
            throw new AccessDeniedException("You can only update orders containing your own products");
        }
        if (newStatus == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Use the cancel endpoint to cancel an order");
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("A cancelled order cannot be updated");
        }

        order.setStatus(newStatus);
        OrderEntity savedOrder = orderRepository.save(order);
        notificationService.notifyUser(savedOrder.getBuyerId(), NotificationType.ORDER_STATUS,
                "Order status updated", "Order #" + orderId + " is now " + newStatus.name().toLowerCase() + ".", orderId);
        return orderMapper.toOrderResponseDto(savedOrder);
    }

    @Override
    @Transactional
    public void cancelOrder(Long userId, Long orderId) {
        OrderEntity order = findOrder(orderId);

        if (!isAdmin() && !isOrderBuyer(order, userId)) {
            throw new AccessDeniedException("You can only cancel your own orders");
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Only pending orders can be cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        notificationService.notifyUser(order.getBuyerId(), NotificationType.ORDER_STATUS,
                "Order cancelled", "Order #" + orderId + " has been cancelled.", orderId);
        notifyOrderStakeholders(order, NotificationType.ORDER_STATUS,
                "Order cancelled", "Buyer cancelled order #" + orderId + ".");
    }

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    private OrderEntity findOrder(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
    }

    private boolean isOrderBuyer(OrderEntity order, Long userId) {
        return order.getBuyer().getId().equals(userId);
    }

    private boolean isOrderSeller(OrderEntity order, Long userId) {
        return order.getItems().stream()
                .anyMatch(i -> i.getProduct().getSeller().getId().equals(userId));
    }

    private void notifyOrderStakeholders(OrderEntity order, NotificationType type, String title, String message) {
        order.getItems().stream()
                .map(item -> item.getProduct().getSeller().getId())
                .distinct()
                .forEach(sellerId -> notificationService.notifyUser(
                        sellerId, type, title, message, order.getId()));
        userRepository.findDistinctByRoles_Name(RolesUser.ADMIN).stream()
                .filter(UserEntity::isEnabled)
                .forEach(admin -> notificationService.notifyUser(
                        admin.getId(), type, title, message, order.getId()));
    }

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }
}
