package com.booot.farm_craftmarket.dto.request;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ProductsImageRequestDto {
    private Boolean isPrimary;

    @Min(value = 0, message = "sortOrder must be 0 or more")
    private Integer sortOrder;
}