package com.booot.farm_craftmarket.mapper;

import com.booot.farm_craftmarket.dto.request.CategoriesRequestDto;
import com.booot.farm_craftmarket.dto.response.CategoriesResponseDto;
import com.booot.farm_craftmarket.entity.CategoriesEntity;
import org.springframework.stereotype.Component;

@Component
public class CategoriesMapper {
    public CategoriesResponseDto toCategoriesResponseDto(CategoriesEntity categoriesEntity) {
        CategoriesResponseDto categoriesResponseDto = new CategoriesResponseDto();
        categoriesResponseDto.setId(categoriesEntity.getId());
        categoriesResponseDto.setName(categoriesEntity.getName());
        categoriesResponseDto.setDescription(categoriesEntity.getDescription());
        if(categoriesEntity.getIconUrl() != null && !categoriesEntity.getIconUrl().isEmpty()) {
            categoriesResponseDto.setIconUrl(categoriesEntity.getIconUrl());
        }
        categoriesResponseDto.setCreateAt(categoriesEntity.getCreatedAt());
        categoriesResponseDto.setUpdateAt(categoriesEntity.getUpdatedAt());

        return categoriesResponseDto;
    }

    public CategoriesEntity toEntity(CategoriesRequestDto categoriesRequestDto) {
        CategoriesEntity cateEntity = new CategoriesEntity();
        cateEntity.setName(categoriesRequestDto.getName());
        cateEntity.setDescription(categoriesRequestDto.getDescription());

        return cateEntity;
    }
}