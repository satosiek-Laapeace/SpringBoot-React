package com.booot.farm_craftmarket.service;

import com.booot.farm_craftmarket.dto.request.CategoriesRequestDto;
import com.booot.farm_craftmarket.dto.response.CategoriesResponseDto;

import java.io.IOException;
import java.util.List;

public interface CategoriesService {

    CategoriesResponseDto getCategoriesById(long id);
    CategoriesResponseDto getCategoriesByName(String name);

    List<CategoriesResponseDto> getAllCategories();
    CategoriesResponseDto createCategories(CategoriesRequestDto categoriesRequestDto) throws IOException;

    CategoriesResponseDto updateCategories(Long id,CategoriesRequestDto categoriesRequestDto) throws IOException;

    void deleteCategories(Long id);

}
