package com.booot.farm_craftmarket.service.implement;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.booot.farm_craftmarket.dto.response.SellerDashboardOverviewResponseDto;
import com.booot.farm_craftmarket.dto.response.SellerDashboardOverviewResponseDto.MonthlyRevenueDto;
import com.booot.farm_craftmarket.enums.orders.OrderStatus;
import com.booot.farm_craftmarket.repository.CategoriesRepository;
import com.booot.farm_craftmarket.repository.MonthlyRevenueProjection;
import com.booot.farm_craftmarket.repository.OrderRepository;
import com.booot.farm_craftmarket.repository.ProductsRepository;
import com.booot.farm_craftmarket.repository.SupplierRepository;
import com.booot.farm_craftmarket.service.SellerDashboardService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SellerDashboardServiceImplement implements SellerDashboardService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final List<OrderStatus> IN_PROGRESS_STATUSES = List.of(
            OrderStatus.PENDING, OrderStatus.CONFIRMED);

    private final OrderRepository orderRepository;
    private final ProductsRepository productsRepository;
    private final CategoriesRepository categoriesRepository;
    private final SupplierRepository supplierRepository;

    @Override
    @Transactional(readOnly = true)
    public SellerDashboardOverviewResponseDto getPlatformOverview() {
        LocalDateTime currentMoment = LocalDateTime.now();
        LocalDate today = currentMoment.toLocalDate();
        int currentYear = today.getYear();
        int previousYear = currentYear - 1;

        LocalDateTime currentYearStart = LocalDate.of(currentYear, 1, 1).atStartOfDay();
        LocalDateTime previousYearStart = LocalDate.of(previousYear, 1, 1).atStartOfDay();
        LocalDateTime nextYearStart = LocalDate.of(currentYear + 1, 1, 1).atStartOfDay();
        LocalDateTime previousYearCutoff = currentMoment.minusYears(1);

        List<MonthlyRevenueProjection> revenueRows =
                orderRepository.findMonthlyRevenueBetween(previousYearStart, nextYearStart);
        List<MonthlyRevenueDto> monthlyRevenue = new ArrayList<>(12);
        for (int month = 1; month <= 12; month++) {
            BigDecimal thisYear = revenueFor(revenueRows, currentYear, month);
            BigDecimal lastYear = revenueFor(revenueRows, previousYear, month);
            monthlyRevenue.add(new MonthlyRevenueDto(month, thisYear, lastYear));
        }

        BigDecimal currentYearRevenue = orderRepository.sumNonCancelledRevenueBetween(
                OrderStatus.CANCELLED, currentYearStart, currentMoment);
        BigDecimal previousYearRevenue = orderRepository.sumNonCancelledRevenueBetween(
                OrderStatus.CANCELLED, previousYearStart, previousYearCutoff);

        return new SellerDashboardOverviewResponseDto(
                productsRepository.count(),
                categoriesRepository.count(),
                orderRepository.count(),
                orderRepository.countByStatusIn(IN_PROGRESS_STATUSES),
                supplierRepository.countByIsActiveTrue(),
                supplierRepository.count(),
                orderRepository.sumNonCancelledRevenue(OrderStatus.CANCELLED),
                currentYear,
                previousYear,
                currentYearRevenue == null ? ZERO : currentYearRevenue,
                previousYearRevenue == null ? ZERO : previousYearRevenue,
                List.copyOf(monthlyRevenue));
    }

    private BigDecimal revenueFor(List<MonthlyRevenueProjection> rows, int year, int month) {
        return rows.stream()
                .filter(row -> row.getYear() == year && row.getMonth() == month)
                .map(row -> row.getRevenue())
                .findFirst()
                .orElse(ZERO);
    }
}
