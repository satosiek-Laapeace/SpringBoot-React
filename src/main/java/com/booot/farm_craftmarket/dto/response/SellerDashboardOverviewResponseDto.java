package com.booot.farm_craftmarket.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record SellerDashboardOverviewResponseDto(
        long catalogProducts,
        long productCategories,
        long totalOrders,
        long ordersInProgress,
        long activeVendors,
        long vendorAccounts,
        BigDecimal marketplaceGmv,
        int currentYear,
        int previousYear,
        BigDecimal currentYearRevenue,
        BigDecimal previousYearRevenue,
        List<MonthlyRevenueDto> monthlyRevenue) {

    public record MonthlyRevenueDto(int month, BigDecimal thisYear, BigDecimal lastYear) {
    }
}
