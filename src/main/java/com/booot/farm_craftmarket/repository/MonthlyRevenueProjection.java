package com.booot.farm_craftmarket.repository;

import java.math.BigDecimal;

public interface MonthlyRevenueProjection {
    Integer getYear();

    Integer getMonth();

    BigDecimal getRevenue();
}
