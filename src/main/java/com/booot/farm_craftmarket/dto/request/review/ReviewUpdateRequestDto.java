package com.booot.farm_craftmarket.dto.request.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewUpdateRequestDto {

    @NotNull(message = "Rating is required")
    @Min(1) @Max(5)
    private Integer rating;

    @Size(max = 2000)
    private String comment;
}