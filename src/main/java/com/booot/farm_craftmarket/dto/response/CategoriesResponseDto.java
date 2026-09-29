package com.booot.farm_craftmarket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CategoriesResponseDto {

    private Long id;
    private String name;
    private String description;

    private String iconUrl;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;
}
