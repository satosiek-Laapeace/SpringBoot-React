package com.booot.farm_craftmarket.repository;

import com.booot.farm_craftmarket.entity.RoleEntity;
import com.booot.farm_craftmarket.enums.roles.RolesUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<RoleEntity, Integer>{
    Optional<RoleEntity> findByName(RolesUser name);
}