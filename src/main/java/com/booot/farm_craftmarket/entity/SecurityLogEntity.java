package com.booot.farm_craftmarket.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "security_log_tbl", indexes = {
        @Index(name = "idx_security_log_created_at", columnList = "created_at"),
        @Index(name = "idx_security_log_actor_id", columnList = "actor_id")
})
@Getter
@Setter
@NoArgsConstructor
public class SecurityLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_type", nullable = false, length = 64)
    private String eventType;

    @Column(name = "actor_id")
    private Long actorId;

    @Column(name = "actor_username", length = 120)
    private String actorUsername;

    @Column(name = "actor_role", length = 80)
    private String actorRole;

    @Column(name = "http_method", nullable = false, length = 10)
    private String httpMethod;

    @Column(name = "request_path", nullable = false, length = 300)
    private String requestPath;

    @Column(name = "response_status", nullable = false)
    private int responseStatus;

    @Column(name = "client_ip", length = 64)
    private String clientIp;

    @Column(name = "authentication_type", nullable = false, length = 32)
    private String authenticationType;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

}
