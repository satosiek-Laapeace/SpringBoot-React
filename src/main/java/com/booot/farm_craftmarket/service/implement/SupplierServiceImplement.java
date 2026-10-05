package com.booot.farm_craftmarket.service.implement;

import com.booot.farm_craftmarket.dto.request.SupplierRequestDto;
import com.booot.farm_craftmarket.dto.response.SupplierResponseDto;
import com.booot.farm_craftmarket.entity.SupplierEntity;
import com.booot.farm_craftmarket.exception.BadRequestException;
import com.booot.farm_craftmarket.mapper.SupplierMapper;
import com.booot.farm_craftmarket.repository.SupplierRepository;
import com.booot.farm_craftmarket.service.SupplierService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SupplierServiceImplement implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper mapper;

    @Override
    @Transactional
    public SupplierResponseDto create(SupplierRequestDto request) {
        String email = request.getEmail().trim();
        if (supplierRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("Supplier email already exists: " + email);
        }

        SupplierEntity entity = mapper.toEntity(request);
        entity.setEmail(email);
        entity.setIsActive(true);

        return mapper.toResponse(supplierRepository.save(entity));
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierResponseDto getById(Long id) {
        return mapper.toResponse(findOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SupplierResponseDto> getAll(String keyword, Boolean active, Pageable pageable) {
        boolean hasKeyword = keyword != null && !keyword.isBlank();
        String kw = hasKeyword ? keyword.trim() : null;

        Page<SupplierEntity> page;
        if (hasKeyword && active != null) {
            page = supplierRepository
                    .findByIsActiveAndNameContainingIgnoreCaseOrIsActiveAndEmailContainingIgnoreCase(
                            active, kw, active, kw, pageable);
        } else if (hasKeyword) {
            page = supplierRepository
                    .findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(kw, kw, pageable);
        } else if (active != null) {
            page = supplierRepository.findByIsActive(active, pageable);
        } else {
            page = supplierRepository.findAll(pageable);
        }

        return page.map(mapper::toResponse);
    }

    @Override
    @Transactional
    public SupplierResponseDto update(Long id, SupplierRequestDto request) {
        SupplierEntity entity = findOrThrow(id);

        String email = request.getEmail().trim();
        if (supplierRepository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw new BadRequestException("Supplier email already exists: " + email);
        }

        mapper.updateEntity(request, entity);
        entity.setEmail(email);

        return mapper.toResponse(supplierRepository.save(entity));
    }

    @Override
    @Transactional
    public SupplierResponseDto setActive(Long id, boolean active) {
        SupplierEntity entity = findOrThrow(id);
        entity.setIsActive(active);
        return mapper.toResponse(supplierRepository.save(entity));
    }

    private SupplierEntity findOrThrow(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + id));
    }
}