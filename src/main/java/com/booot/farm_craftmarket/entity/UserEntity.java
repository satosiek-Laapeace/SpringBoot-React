package com.booot.farm_craftmarket.entity;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.booot.farm_craftmarket.enums.roles.AuthProvider;
import com.booot.farm_craftmarket.enums.roles.RolesUser;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_tbl")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(name = "display_name")
    private String displayName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "profile_picture_url", length = 2048)
    private String profilePictureUrl;

    @Column(name = "profile_picture_public_id")
    private String profilePicturePublicId;

    @Column(nullable = false)
    private String password;

    @Builder.Default
    @Column(nullable = false)
    private boolean enabled = true;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider")
    private AuthProvider  provider = AuthProvider.LOCAL;

    @Column(name = "provider_id", unique = true)
    private String providerId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "lock_time")
    private LocalDateTime lockTime;

    @Builder.Default
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<RoleEntity> roles = new HashSet<>();

    public String getName() {
        return this.username;
    }

    public void setName(String name) {
        this.username = name;
    }

    private RolesUser getRoleName(RoleEntity role) {
        return role == null ? null : role.getName();
    }

    public String getRole() {
        if (roles == null || roles.isEmpty()) {
            return RolesUser.BUYER.name();
        }
        Set<RolesUser> names = roles.stream()
                .filter(java.util.Objects::nonNull)
                .map(this::getRoleName)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());
        if (names.contains(RolesUser.ADMIN)) return RolesUser.ADMIN.name();
        if (names.contains(RolesUser.SELLER)) return RolesUser.SELLER.name();

        return RolesUser.BUYER.name();
    }

    public void setRole(String role) {
        this.roles = new HashSet<>();
        if (role == null || role.isBlank()) {
            return;
        }

        RolesUser normalizedRole = RolesUser.valueOf(role.trim().toUpperCase());
        this.roles.add(new RoleEntity(normalizedRole));
    }

    public LocalDateTime getCreateAt() {
        return this.createdAt;
    }

    public void setCreateAt(LocalDateTime createAt) {
        this.createdAt = createAt;
    }

    public LocalDateTime getUpdateAt() {
        return this.updatedAt;
    }

    public void setUpdateAt(LocalDateTime updateAt) {
        this.updatedAt = updateAt;
    }
}