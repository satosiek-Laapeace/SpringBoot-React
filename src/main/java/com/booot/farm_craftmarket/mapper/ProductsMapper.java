package com.booot.farm_craftmarket.mapper;


import com.booot.farm_craftmarket.dto.request.ProductsRequestDto;
import com.booot.farm_craftmarket.dto.response.ProductsResponseDto;
import com.booot.farm_craftmarket.entity.CategoriesEntity;
import com.booot.farm_craftmarket.entity.ProductsEntity;
import org.springframework.stereotype.Component;

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
        productsResponseDto.setStockQuantity(productsResponseDto.getStockQuantity());
        productsResponseDto.setUnit(productsEntity.getUnit());

        if(productsEntity.getCategory() != null){
            productsResponseDto.setCategoryId(productsEntity.getCategory().getId());
            productsResponseDto.setCategoryName(productsEntity.getCategory().getName());
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

       productsEntity.setStockQuantity(productsEntity.getStockQuantity());
       productsEntity.setUnit(productsRequestDto.getUnit());

       if(productsRequestDto.getCategoryId() != null){
           CategoriesEntity categories =  new CategoriesEntity();
           categories.setId(productsRequestDto.getCategoryId());
           productsEntity.setCategory(categories);
       }

       return productsEntity;
    }
}
