package com.booot.farm_craftmarket.dto.response;

import com.booot.farm_craftmarket.enums.stock.StockMovementType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementResponseDto {
    private Long id;
    private Long productId;
    private String productName;
    private StockMovementType type;
    private Integer quantityChange;
    private Integer quantityAfter;
    private Long supplierId;
    private Long referenceOrderId;
    private String note;
    private LocalDateTime createdAt;
}