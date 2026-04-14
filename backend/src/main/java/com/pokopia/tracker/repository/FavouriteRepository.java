package com.pokopia.tracker.repository;

import com.pokopia.tracker.domain.entity.Favourite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FavouriteRepository extends JpaRepository<Favourite, UUID> {
    Optional<Favourite> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}
