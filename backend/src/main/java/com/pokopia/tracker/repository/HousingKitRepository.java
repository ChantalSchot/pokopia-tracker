package com.pokopia.tracker.repository;

import com.pokopia.tracker.domain.entity.HousingKit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface HousingKitRepository extends JpaRepository<HousingKit, UUID> {
}
