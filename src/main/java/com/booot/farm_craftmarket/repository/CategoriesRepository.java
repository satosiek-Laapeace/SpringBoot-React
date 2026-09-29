package com.booot.farm_craftmarket.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.booot.farm_craftmarket.entity.CategoriesEntity;

import javax.swing.text.html.Option;
import java.util.Optional;

@Repository 
public interface CategoriesRepository extends JpaRepository<CategoriesEntity, Long> {

    boolean existsByName(String name);

    Optional<CategoriesEntity> findByName(String name);

}
