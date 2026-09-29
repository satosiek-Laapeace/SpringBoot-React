package com.booot.farm_craftmarket.service;

import com.booot.farm_craftmarket.dto.request.CategoriesRequestDto;
import com.booot.farm_craftmarket.dto.response.CategoriesResponseDto;

import java.util.List;

public interface CategoriesService {

    CategoriesResponseDto getCategoriesById(long id);
    CategoriesResponseDto getCategoriesByName(String name);

    List<CategoriesResponseDto> getAllCategories();
    CategoriesResponseDto createCategories(CategoriesRequestDto categoriesRequestDto);

    CategoriesResponseDto updateCategories(Long id,CategoriesRequestDto categoriesRequestDto);

    void deleteCategories(Long id);

}
