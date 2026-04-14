package com.pokopia.tracker.repository;

import com.pokopia.tracker.domain.entity.Item;
import com.pokopia.tracker.domain.enums.ItemType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ItemRepository extends JpaRepository<Item, UUID>, JpaSpecificationExecutor<Item> {
    Optional<Item> findByNameIgnoreCase(String name);
    Page<Item> findByType(ItemType type, Pageable pageable);
    Page<Item> findByCategoryIgnoreCase(String category, Pageable pageable);

    @Query("SELECT i FROM Item i WHERE i.type NOT IN ('ROAD', 'FOOD')")
    List<Item> findHouseAssignableItems();
}
