package com.booot.farm_craftmarket.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CategoriesRequestDto {

    @NotBlank(message = "Category name is required")
    @Size(max = 100, message = "Category name must be at most 100 characters")
    @Schema(example = "Watermelons")
    private String name;

    @Size(max = 1000, message = "Description must be at most 1000 characters")
    @Schema(example = "Fresh natural products")
    private String description;

    @Schema(description = "Category icon image (optional)", type = "string", format = "binary")
    private MultipartFile iconUrl;
}