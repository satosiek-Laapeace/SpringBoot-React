package com.booot.farm_craftmarket.configuration;

import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.booot.farm_craftmarket.entity.RoleEntity;
import com.booot.farm_craftmarket.entity.UserEntity;
import com.booot.farm_craftmarket.enums.roles.RolesUser;
import com.booot.farm_craftmarket.repository.RoleRepository;
import com.booot.farm_craftmarket.repository.UserRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner seedData(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            PlatformTransactionManager txManager,
            @Value("${app.admin.username}") String adminUsername,
            @Value("${app.admin.email}") String adminEmail,
            @Value("${app.admin.password}") String adminPassword
    ) {
        return args -> new TransactionTemplate(txManager).executeWithoutResult(status -> {
            for (RolesUser r : RolesUser.values()) {
                roleRepository.findByName(r)
                        .orElseGet(() -> roleRepository.save(new RoleEntity(r)));
            }
            RoleEntity adminRole = roleRepository.findByName(RolesUser.ADMIN).orElseThrow();

            UserEntity admin = userRepository.findByUsername(adminUsername).orElseGet(UserEntity::new);
            boolean isNew = admin.getId() == null;

            admin.setUsername(adminUsername.trim());
            admin.setEmail(adminEmail.trim());
            admin.setPassword(passwordEncoder.encode(adminPassword.trim()));
            admin.setEnabled(true);
            admin.setLockTime(null);

            Set<RoleEntity> roles = new HashSet<>();
            roles.add(adminRole);
            admin.setRoles(roles);

            userRepository.save(admin);
            log.info("Admin '{}' {}", adminUsername, isNew ? "created" : "repaired");
        });
    }
}