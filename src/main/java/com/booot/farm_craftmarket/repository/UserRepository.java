package com.booot.farm_craftmarket.repository;

import com.booot.farm_craftmarket.entity.UserEntity;
import com.booot.farm_craftmarket.enums.roles.RolesUser;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<UserEntity,Long> {

    Optional<UserEntity> findByUsername(String username);

    Optional<UserEntity> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    List<UserEntity> findDistinctByRoles_Name(RolesUser role);
}
