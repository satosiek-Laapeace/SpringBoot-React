package com.booot.farm_craftmarket.mapper;


import org.springframework.stereotype.Component;

import com.booot.farm_craftmarket.dto.request.ProductsRequestDto;
import com.booot.farm_craftmarket.dto.response.ProductsResponseDto;
import com.booot.farm_craftmarket.dto.response.SellerSummaryResponseDto;
import com.booot.farm_craftmarket.entity.CategoriesEntity;
import com.booot.farm_craftmarket.entity.ProductsEntity;

@Component
public class ProductsMapper {
    public ProductsResponseDto toProductsResponseDto(ProductsEntity productsEntity) {
        ProductsResponseDto productsResponseDto = new ProductsResponseDto();

        productsResponseDto.setId(productsEntity.getId());
        productsResponseDto.setName(productsEntity.getName());
        productsResponseDto.setDescription(productsEntity.getDescription());
        productsResponseDto.setPrice(productsEntity.getPrice());

        if(productsEntity.getImageUrl() != null && !productsEntity.getImageUrl().isEmpty()){
            productsResponseDto.setImageUrl(productsEntity.getImageUrl());
        }
        productsResponseDto.setStockQuantity(productsEntity.getStockQuantity());
        productsResponseDto.setUnit(productsEntity.getUnit());

        if(productsEntity.getCategory() != null){
            productsResponseDto.setCategoryId(productsEntity.getCategory().getId());
            productsResponseDto.setCategoryName(productsEntity.getCategory().getName());
        }

        if (productsEntity.getSeller() != null) {
            var seller = productsEntity.getSeller();
            productsResponseDto.setSeller(new SellerSummaryResponseDto(
                    seller.getId(),
                    seller.getDisplayName(),
                    seller.getUsername(),
                    seller.getProfilePictureUrl(),
                    seller.getRole(),
                    seller.getCreatedAt()));
        }

        return productsResponseDto;
    }
    public ProductsEntity toEntity(ProductsRequestDto productsRequestDto) {
        if(productsRequestDto == null){
            return null;
    }
        ProductsEntity productsEntity = new ProductsEntity();
    productsEntity.setName(productsRequestDto.getName());
    productsEntity.setDescription(productsRequestDto.getDescription());
    productsEntity.setPrice(productsRequestDto.getPrice());

    productsEntity.setStockQuantity(productsRequestDto.getStockQuantity());
    productsEntity.setUnit(productsRequestDto.getUnit());

    if(productsRequestDto.getCategoryId() != null){
        CategoriesEntity categories =  new CategoriesEntity();
        categories.setId(productsRequestDto.getCategoryId());
        productsEntity.setCategory(categories);
    }

    return productsEntity;
    }
}
