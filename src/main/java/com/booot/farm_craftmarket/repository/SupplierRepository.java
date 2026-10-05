package com.booot.farm_craftmarket.repository;

import com.booot.farm_craftmarket.entity.SupplierEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepository extends JpaRepository<SupplierEntity, Long> {

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    Page<SupplierEntity> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String name, String email, Pageable pageable);

    Page<SupplierEntity> findByIsActive(Boolean isActive, Pageable pageable);


    Page<SupplierEntity> findByIsActiveAndNameContainingIgnoreCaseOrIsActiveAndEmailContainingIgnoreCase(
            Boolean active1, String name, Boolean active2, String email, Pageable pageable);
}