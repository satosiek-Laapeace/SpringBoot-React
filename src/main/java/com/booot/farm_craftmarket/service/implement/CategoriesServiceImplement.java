package com.booot.farm_craftmarket.service.implement;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.booot.farm_craftmarket.configuration.CloudService;
import com.booot.farm_craftmarket.dto.request.CategoriesRequestDto;
import com.booot.farm_craftmarket.dto.response.CategoriesResponseDto;
import com.booot.farm_craftmarket.entity.CategoriesEntity;
import com.booot.farm_craftmarket.exception.BadRequestException;
import com.booot.farm_craftmarket.exception.ResourceNotFoundException;
import com.booot.farm_craftmarket.mapper.CategoriesMapper;
import com.booot.farm_craftmarket.repository.CategoriesRepository;
import com.booot.farm_craftmarket.service.CategoriesService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoriesServiceImplement implements CategoriesService {

    private final CategoriesRepository categoriesRepository;
    private final CategoriesMapper categoriesMapper;
    private final CloudService cloudService;

    @Override
    @Transactional
    public CategoriesResponseDto createCategories(CategoriesRequestDto dto) throws IOException {
        if (categoriesRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Category already exists with the name " + dto.getName());
        }

        CategoriesEntity category = categoriesMapper.toEntity(dto);
        applyIcon(category, dto.getIconUrl());

        return categoriesMapper.toCategoriesResponseDto(categoriesRepository.save(category));
    }

    @Override
    public CategoriesResponseDto getCategoriesById(long id) {
        return categoriesMapper.toCategoriesResponseDto(findCategory(id));
    }

    @Override
    public CategoriesResponseDto getCategoriesByName(String name) {
        CategoriesEntity category = categoriesRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with name " + name));
        return categoriesMapper.toCategoriesResponseDto(category);
    }

    @Override
    public List<CategoriesResponseDto> getAllCategories() {
        return categoriesRepository.findAll().stream()
                .map(categoriesMapper::toCategoriesResponseDto)
                .toList();
    }

    @Override
    @Transactional
    public CategoriesResponseDto updateCategories(Long id, CategoriesRequestDto dto) throws IOException {
        CategoriesEntity category = findCategory(id);

        boolean nameChanged = !category.getName().equalsIgnoreCase(dto.getName());
        if (nameChanged && categoriesRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Category already exists with the name " + dto.getName());
        }

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());

        MultipartFile icon = dto.getIconUrl();
        if (icon != null && !icon.isEmpty()) {
            deleteOldIcon(category);
            applyIcon(category, icon);
        }

        return categoriesMapper.toCategoriesResponseDto(categoriesRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteCategories(Long id) {
        CategoriesEntity category = findCategory(id);
        deleteOldIcon(category);
        categoriesRepository.delete(category);
    }

    // ---------- helpers ----------

    private CategoriesEntity findCategory(long id) {
        return categoriesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + id));
    }

    private void applyIcon(CategoriesEntity category, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return;
        }
        Map<?, ?> result = cloudService.uploadIcon(file);
        category.setIconUrl(firstNonBlank(result, "secure_url", "sec_url", "url"));
        category.setPublicId((String) result.get("publicId"));
    }

    private void deleteOldIcon(CategoriesEntity category) {
        if (category.getPublicId() == null || category.getPublicId().isBlank()) {
            return;
        }
        try {
            cloudService.delete(category.getPublicId());
        } catch (Exception e) {
            //
        }
    }

    private String firstNonBlank(Map<?, ?> map, String... keys) {
        for (String key : keys) {
            Object value = map.get(key);
            if (value instanceof String s && !s.isBlank()) {
                return s;
            }
        }
        return null;
    }
}