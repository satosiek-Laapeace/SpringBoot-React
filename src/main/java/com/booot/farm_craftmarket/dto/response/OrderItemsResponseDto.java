package com.booot.farm_craftmarket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class OrderItemsResponseDto{

    private Long id;
    private Long orderId;
    private Long productId;
    private String productName;

    private Long quantity;
    private BigDecimal priceAtPurchase;
    private BigDecimal subTotal;

}
