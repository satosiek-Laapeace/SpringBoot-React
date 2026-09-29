package com.booot.farm_craftmarket.dto.request;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CategoriesRequestDto {

    @Column(nullable = false)
    @Size(min = 1, max = 100, message = "categories name must be required!")
    private String name;

    @Size(min = 1, max = 1000, message = "The description must be required!")
    private String description;

    private MultipartFile iconUrl;

}
