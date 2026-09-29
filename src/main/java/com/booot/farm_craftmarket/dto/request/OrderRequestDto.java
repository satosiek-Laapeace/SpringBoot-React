package com.booot.farm_craftmarket.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class OrderRequestDto {

    @NotNull(message = "Buyer ID is required")
    private Long buyerId;

    @NotNull(message = "Address ID is required")
    private Long addressId;

    @NotNull(message = "Delivery slot is required")
    private String deliverySlot;

    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<OrderItemRequestDto> items;
}