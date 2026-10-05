package com.booot.farm_craftmarket.repository;
import com.booot.farm_craftmarket.entity.NotificationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    Page<NotificationEntity> findByUserIdOrderByCreatedAtDesc(Long buyerId, Pageable pageable);

    Page<NotificationEntity> findByUserIdAndReadFalseOrderByCreatedAtDesc(Long buyerId, Pageable pageable);

    long countByUserIdAndReadFalse(Long buyerId);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE NotificationEntity n SET n.read = true, n.readAt = CURRENT_TIMESTAMP " +
            "WHERE n.buyerId = :buyerId AND n.read = false")
    int markAllAsRead(@Param("buyerId") Long buyerId);
}