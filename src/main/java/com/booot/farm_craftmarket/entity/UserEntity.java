package com.booot.farm_craftmarket.entity;

import com.booot.farm_craftmarket.enums.roles.RolesUser;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "user_tbl")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class UserEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Builder.Default
    @Column(nullable = false)
    private Boolean enabled = true;

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
    public void setRole(String role){
        //
    }
    public String getRoel() {
        if (roles == null && roles.isEmpty()) {
            return RolesUser.BUYER.name();
        }
        Set<RolesUser> names = roles.stream()
                .map(r->r.getName()).collect(Collectors.toSet());
        if (names.contains(RolesUser.ADMIN)) return RolesUser.ADMIN.name();
        if (names.contains(RolesUser.SELLER)) return RolesUser.SELLER.name();

        return RolesUser.BUYER.name();
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
