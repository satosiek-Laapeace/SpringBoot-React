package com.booot.farm_craftmarket.repository;

import com.booot.farm_craftmarket.entity.PasswordResetEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetRepository extends JpaRepository<PasswordResetEntity, Long> {

    Optional<PasswordResetEntity> findTopByEmailOrderByCreatedAtDesc(String email);

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM PasswordResetEntity o WHERE o.email = :email")
    void deleteAllByEmail(@Param("email") String email);

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM PasswordResetEntity o WHERE o.expiresAt < :now")
    void deleteExpired(@Param("now") LocalDateTime now);
}