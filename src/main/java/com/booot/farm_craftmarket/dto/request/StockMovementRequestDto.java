package com.booot.farm_craftmarket.dto.request;

import com.booot.farm_craftmarket.enums.stock.StockMovementType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementRequestDto {

    @NotNull(message = "productId is required")
    private Long productId;

    @NotNull(message = "type is required")
    private StockMovementType type;

    @NotNull(message = "quantityChange is required")
    private Integer quantityChange;

    private Long supplierId;

    private Long referenceOrderId;

    @Size(max = 500, message = "note must be at most 500 characters")
    private String note;
}