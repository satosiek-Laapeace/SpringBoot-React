package com.booot.farm_craftmarket.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Data;

// Used to UPDATE an image (upload uses multipart files, not this DTO).
@Data
public class ProductImageRequestDto {

    // send true to make this image the primary (cover) image
    private Boolean isPrimary;

    @Min(value = 0, message = "sortOrder must be 0 or more")
    private Integer sortOrder;
}