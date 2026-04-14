package com.pokopia.tracker.repository;

import com.pokopia.tracker.domain.entity.Pokemon;
import com.pokopia.tracker.domain.enums.IdealHabitat;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PokemonRepository extends JpaRepository<Pokemon, UUID>, JpaSpecificationExecutor<Pokemon> {
    Optional<Pokemon> findByNameIgnoreCase(String name);
    List<Pokemon> findByIdealHabitat(IdealHabitat idealHabitat);

    @Query("SELECT p FROM Pokemon p WHERE p.isDitto = true")
    Optional<Pokemon> findDitto();

    long count();
}
