package com.booot.farm_craftmarket.repository;

import com.booot.farm_craftmarket.entity.PaymentEntity;
import com.booot.farm_craftmarket.enums.payments.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {

    Optional<PaymentEntity> findByTransactionId(String transactionId);

    boolean existsByOrderIdAndStatus(Long orderId, PaymentStatus status);

    List<PaymentEntity> findByOrderIdOrderByIdDesc(Long orderId);
}