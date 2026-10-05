package com.booot.farm_craftmarket.repository;

import com.booot.farm_craftmarket.entity.SecurityLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SecurityLogRepository extends JpaRepository<SecurityLogEntity, Long> {
}
