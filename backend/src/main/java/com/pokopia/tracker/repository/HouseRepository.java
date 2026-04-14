package com.pokopia.tracker.repository;

import com.pokopia.tracker.domain.entity.House;
import com.pokopia.tracker.domain.enums.Region;
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
public interface HouseRepository extends JpaRepository<House, UUID> {
    Page<House> findByUserId(UUID userId, Pageable pageable);
    List<House> findByUserId(UUID userId);
    List<House> findByUserIdAndRegion(UUID userId, Region region);
    Optional<House> findByIdAndUserId(UUID id, UUID userId);
    boolean existsByUserIdAndRegionAndName(UUID userId, Region region, String name);
    long countByUserId(UUID userId);

    @Query("SELECT h FROM House h WHERE h.user.id = :userId AND SIZE(h.assignedPokemon) >= " +
           "CASE h.houseType WHEN 'KIT' THEN COALESCE(h.size, 1) ELSE 1 END")
    long countFullHousesByUserId(@Param("userId") UUID userId);
}
