package com.booot.farm_craftmarket.repository;

import com.booot.farm_craftmarket.entity.AddressEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<AddressEntity, Long> {

    List<AddressEntity> findByBuyerIdOrderByIsDefaultDescIdAsc(Long buyerId);

    long countByBuyerId(Long buyerId);

    Optional<AddressEntity> findByIdAndBuyerId(Long id, Long buyerId);

    Optional<AddressEntity> findFirstByBuyerIdOrderByIdAsc(Long buyerId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update AddressEntity a set a.isDefault = false " +
            "where a.buyerId = :buyerId and a.isDefault = true")
    void clearDefault(@Param("buyerId") Long buyerId);
}