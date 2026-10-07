package com.booot.farm_craftmarket.service.implement;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.booot.farm_craftmarket.repository.CategoriesRepository;
import com.booot.farm_craftmarket.repository.MonthlyRevenueProjection;
import com.booot.farm_craftmarket.repository.OrderRepository;
import com.booot.farm_craftmarket.repository.ProductsRepository;
import com.booot.farm_craftmarket.repository.SupplierRepository;

class SellerDashboardServiceImplementTest {

    @Test
    void returnsPlatformWideAggregatesAndMonthlyRevenue() {
        OrderRepository orders = mock(OrderRepository.class);
        ProductsRepository products = mock(ProductsRepository.class);
        CategoriesRepository categories = mock(CategoriesRepository.class);
        SupplierRepository suppliers = mock(SupplierRepository.class);
        SellerDashboardServiceImplement service =
                new SellerDashboardServiceImplement(orders, products, categories, suppliers);

        int currentYear = LocalDate.now().getYear();
        int currentMonth = LocalDate.now().getMonthValue();
        MonthlyRevenueProjection currentMonthRevenue = mock(MonthlyRevenueProjection.class);
        when(currentMonthRevenue.getYear()).thenReturn(currentYear);
        when(currentMonthRevenue.getMonth()).thenReturn(currentMonth);
        when(currentMonthRevenue.getRevenue()).thenReturn(new BigDecimal("30.00"));
        when(orders.findMonthlyRevenueBetween(any(), any())).thenReturn(List.of(currentMonthRevenue));
        when(products.count()).thenReturn(5L);
        when(categories.count()).thenReturn(3L);
        when(orders.count()).thenReturn(28L);
        when(orders.countByStatusIn(anyCollection())).thenReturn(25L);
        when(suppliers.countByIsActiveTrue()).thenReturn(1L);
        when(suppliers.count()).thenReturn(1L);
        when(orders.sumNonCancelledRevenue(any())).thenReturn(new BigDecimal("93.00"));
        when(orders.sumNonCancelledRevenueBetween(any(), any(), any()))
                .thenReturn(new BigDecimal("30.00"), new BigDecimal("20.00"));

        var overview = service.getPlatformOverview();

        assertEquals(5L, overview.catalogProducts());
        assertEquals(3L, overview.productCategories());
        assertEquals(28L, overview.totalOrders());
        assertEquals(25L, overview.ordersInProgress());
        assertEquals(1L, overview.activeVendors());
        assertEquals(new BigDecimal("93.00"), overview.marketplaceGmv());
        assertEquals(currentYear, overview.currentYear());
        assertEquals(currentYear - 1, overview.previousYear());
        assertEquals(new BigDecimal("30.00"), overview.currentYearRevenue());
        assertEquals(new BigDecimal("20.00"), overview.previousYearRevenue());
        assertEquals(12, overview.monthlyRevenue().size());
        assertEquals(new BigDecimal("30.00"), overview.monthlyRevenue().get(currentMonth - 1).thisYear());
    }
}
