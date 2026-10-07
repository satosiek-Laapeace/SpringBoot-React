package com.booot.farm_craftmarket.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.booot.farm_craftmarket.dto.response.ApiResponse;
import com.booot.farm_craftmarket.dto.response.SellerDashboardOverviewResponseDto;
import com.booot.farm_craftmarket.service.SellerDashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/seller/dashboard")
@RequiredArgsConstructor
public class SellerDashboardController {

    private final SellerDashboardService sellerDashboardService;

    @GetMapping("/overview")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<SellerDashboardOverviewResponseDto>> getOverview() {
        return ResponseEntity.ok(ApiResponse.success(
                "Platform dashboard overview retrieved successfully",
                sellerDashboardService.getPlatformOverview()));
    }
}
