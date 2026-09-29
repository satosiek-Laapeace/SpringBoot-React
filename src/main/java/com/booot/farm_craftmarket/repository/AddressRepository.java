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

    List<AddressEntity> findByUserIdOrderByIsDefaultDescIdAsc(Long userId);

    Optional<AddressEntity> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    Optional<AddressEntity> findFirstByUserIdOrderByIdAsc(Long userId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)

    @Query("UPDATE AddressEntity a SET a.isDefault = false WHERE a.userId = :userId AND a.isDefault = true")
    void clearDefault(@Param("userId") Long userId);
}