package com.booot.farm_craftmarket.controller;

import java.net.URI;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.booot.farm_craftmarket.dto.request.StockMovementRequestDto;
import com.booot.farm_craftmarket.dto.response.StockMovementResponseDto;
import com.booot.farm_craftmarket.mapping.IsAdmin;
import com.booot.farm_craftmarket.mapping.IsAdminOrSeller;
import com.booot.farm_craftmarket.security.CustomUserDetailService.AppUser;
import com.booot.farm_craftmarket.service.StockMovementService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/stock-movements")
@RequiredArgsConstructor
public class StockMovementController {

    private final StockMovementService stockMovementService;

    @PostMapping
    @IsAdminOrSeller
    public ResponseEntity<StockMovementResponseDto> create(
            @Valid @RequestBody StockMovementRequestDto request,
            @AuthenticationPrincipal AppUser actor) {
        StockMovementResponseDto created = stockMovementService.create(request, actor.getId(), isAdmin(actor));
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/{id:\\d+}")
    @IsAdminOrSeller
    public ResponseEntity<StockMovementResponseDto> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal AppUser actor) {
        return ResponseEntity.ok(stockMovementService.getById(id, actor.getId(), isAdmin(actor)));
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Page<StockMovementResponseDto>> getMyStockMovements(
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal AppUser actor) {
        return ResponseEntity.ok(stockMovementService.getAll(pageable, actor.getId(), false));
    }

    @GetMapping
    @IsAdminOrSeller
    public ResponseEntity<Page<StockMovementResponseDto>> getAll(
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal AppUser actor) {
        return ResponseEntity.ok(stockMovementService.getAll(pageable, actor.getId(), isAdmin(actor)));
    }

    @GetMapping("/product/{productId}")
    @IsAdminOrSeller
    public ResponseEntity<Page<StockMovementResponseDto>> getByProductId(
            @PathVariable Long productId,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal AppUser actor) {
        return ResponseEntity.ok(stockMovementService.getByProductId(
                productId, pageable, actor.getId(), isAdmin(actor)));
    }

    @GetMapping("/supplier/{supplierId}")
    @IsAdmin
    public ResponseEntity<Page<StockMovementResponseDto>> getBySupplierId(
            @PathVariable Long supplierId,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(stockMovementService.getBySupplierId(supplierId, pageable));
    }

    private boolean isAdmin(AppUser actor) {
        return actor.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }
}