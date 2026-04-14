package com.pokopia.tracker.repository;

import com.pokopia.tracker.domain.entity.Habitat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface HabitatRepository extends JpaRepository<Habitat, UUID> {
}
