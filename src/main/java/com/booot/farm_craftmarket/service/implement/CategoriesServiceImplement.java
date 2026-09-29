package com.booot.farm_craftmarket.service.implement;

import com.booot.farm_craftmarket.config.CloudService;
import com.booot.farm_craftmarket.dto.request.CategoriesRequestDto;
import com.booot.farm_craftmarket.dto.response.CategoriesResponseDto;
import com.booot.farm_craftmarket.entity.CategoriesEntity;
import com.booot.farm_craftmarket.exception.BadRequestException;
import com.booot.farm_craftmarket.exception.ResourceNotFoundException;
import com.booot.farm_craftmarket.service.CategoriesService;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import com.booot.farm_craftmarket.mapper.CategoriesMapper;
import com.booot.farm_craftmarket.repository.CategoriesRepository;

@Service
public class CategoriesServiceImplement implements CategoriesService {
    private final CategoriesRepository categoriesRepository;
    private final CategoriesMapper categoriesMapper;
    private final CloudService  cloudService;

    public CategoriesServiceImplement(
        CategoriesRepository categoriesRepository,
        CategoriesMapper categoriesMapper,
        CloudService cloudService
    ) {
        this.categoriesRepository = categoriesRepository;
        this.categoriesMapper = categoriesMapper;
        this.cloudService = cloudService;
    }

    @Override
    public CategoriesResponseDto createCategories(CategoriesRequestDto categoriesRequestDto) {
        if (categoriesRepository.existsByName(categoriesRequestDto.getName())) {
            throw new BadRequestException("Category already exists with the name " + categoriesRequestDto.getName());
        }
        String iconUrl = null;
        String publicId = null;
        CategoriesEntity categories = categoriesMapper.toEntity(categoriesRequestDto);

        if(categoriesRequestDto.getIconUrl() != null && !categoriesRequestDto.getIconUrl().isEmpty()){
            Map icon = cloudService.uploadIcon(categoriesRequestDto.getIconUrl());
            iconUrl = (String) icon.get("url");
            publicId = (String) icon.get("publicId");
        }
        categories.setIconUrl(iconUrl);
        CategoriesEntity saved = categoriesRepository.save(categories);
        return categoriesMapper.toCategoriesResponseDto(saved);
    }
    
    @Override
    public CategoriesResponseDto getCategoriesById(long id) {
        CategoriesEntity categories = categoriesRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Category not found with id " + id));
            return categoriesMapper.toCategoriesResponseDto(categories);
    }

    @Override
    public CategoriesResponseDto getCategoriesByName(String name){
        CategoriesEntity categories = categoriesRepository.findByName(name)
                .orElseThrow(()-> new ResourceNotFoundException("Category not found with name " + name));

        return categoriesMapper.toCategoriesResponseDto(categories);
    }

    @Override
    public List<CategoriesResponseDto> getAllCategories() {
        return categoriesRepository.findAll().stream()
                .map(categoriesMapper::toCategoriesResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public CategoriesResponseDto updateCategories(Long id, CategoriesRequestDto categoriesRequestDto) {
        CategoriesEntity categories = categoriesRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Category not found with id " + id)
        );
        if (!categoriesRepository.existsByName(categoriesRequestDto.getName())
                && !categories.getName().equalsIgnoreCase(categoriesRequestDto.getName())) {
            throw new BadRequestException("Category already exists with the name " + categoriesRequestDto.getName());
        }

        categories.setName(categoriesRequestDto.getName());
        categories.setDescription(categoriesRequestDto.getDescription());
        if(categoriesRequestDto.getIconUrl() != null && !categoriesRequestDto.getIconUrl().isEmpty()) {
            try {
                if (categories.getPublicId() != null && !categories.getPublicId().isEmpty()) {
                    cloudService.delete(categories.getPublicId());
                }
                Map icon = cloudService.uploadIcon(categoriesRequestDto.getIconUrl());
                String url = (String) icon.get("sec_url");
                if(url == null && url.isEmpty()) {
                    url = (String) icon.get("url");
                }
                categories.setIconUrl(url);
                categories.setPublicId((String) icon.get("publicId"));
            }catch (IOException e){
                throw  new BadRequestException("Url Icon not found" + categoriesRequestDto.getIconUrl());
            }
        }
        CategoriesEntity saved = categoriesRepository.save(categories);
        return categoriesMapper.toCategoriesResponseDto(saved);
    }
    @Override
    public void deleteCategories(Long id){
        CategoriesEntity storeCategories = categoriesRepository.findById(id).orElseThrow(
                ()-> new ResourceNotFoundException("Category not found with id " + id));
        categoriesRepository.delete(storeCategories);
    }
}
