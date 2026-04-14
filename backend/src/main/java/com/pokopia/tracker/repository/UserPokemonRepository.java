package com.pokopia.tracker.repository;

import com.pokopia.tracker.domain.entity.UserPokemon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserPokemonRepository extends JpaRepository<UserPokemon, UUID> {
    Page<UserPokemon> findByUserId(UUID userId, Pageable pageable);
    List<UserPokemon> findByUserId(UUID userId);
    Optional<UserPokemon> findByUserIdAndPokemonId(UUID userId, UUID pokemonId);
    boolean existsByUserIdAndPokemonId(UUID userId, UUID pokemonId);
    List<UserPokemon> findByUserIdAndHouseIsNull(UUID userId);
    List<UserPokemon> findByHouseId(UUID houseId);
    long countByUserId(UUID userId);
    long countByUserIdAndHouseIsNull(UUID userId);

    @Query("SELECT up FROM UserPokemon up WHERE up.user.id = :userId ORDER BY up.id DESC")
    Page<UserPokemon> findRecentByUserId(@Param("userId") UUID userId, Pageable pageable);
}
