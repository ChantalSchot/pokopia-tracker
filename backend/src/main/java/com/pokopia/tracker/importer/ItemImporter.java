package com.pokopia.tracker.importer;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pokopia.tracker.domain.entity.Favourite;
import com.pokopia.tracker.domain.entity.Item;
import com.pokopia.tracker.domain.enums.ItemType;
import com.pokopia.tracker.repository.FavouriteRepository;
import com.pokopia.tracker.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class ItemImporter {

    private final ItemRepository itemRepository;
    private final FavouriteRepository favouriteRepository;
    private final ImportNormalizer normalizer;
    private final ObjectMapper objectMapper;

    @Value("${app.import-data-path}")
    private String importDataPath;

    public void importData() {
        try {
            File file = new File(importDataPath, "items.json");
            List<Map<String, Object>> data = objectMapper.readValue(file, new TypeReference<>() {});

            for (Map<String, Object> entry : data) {
                UUID id = UUID.fromString((String) entry.get("id"));
                if (itemRepository.existsById(id)) continue;

                String typeStr = (String) entry.get("type");
                ItemType type = ItemType.fromDisplayName(typeStr);

                Item item = Item.builder()
                    .id(id)
                    .name((String) entry.get("name"))
                    .description((String) entry.get("description"))
                    .category((String) entry.get("category"))
                    .obtainMethod((String) entry.get("obtainMethod"))
                    .obtainDetails((String) entry.get("obtainDetails"))
                    .type(type)
                    .colour((String) entry.get("colour"))
                    .imagePath((String) entry.get("imagePath"))
                    .build();
                itemRepository.save(item);
            }
            log.info("Imported {} items", data.size());
        } catch (IOException e) {
            log.error("Failed to import items", e);
            throw new RuntimeException("Failed to import items", e);
        }
    }

    public void linkItemsToFavourites() {
        try {
            File file = new File(importDataPath, "favourites.json");
            List<Map<String, Object>> data = objectMapper.readValue(file, new TypeReference<>() {});

            // Build a normalized name -> Item lookup
            List<Item> allItems = itemRepository.findAll();
            Map<String, Item> normalizedItemMap = new HashMap<>();
            for (Item item : allItems) {
                normalizedItemMap.put(normalizer.normalize(item.getName()), item);
            }

            for (Map<String, Object> entry : data) {
                UUID favouriteId = UUID.fromString((String) entry.get("id"));
                Optional<Favourite> favOpt = favouriteRepository.findById(favouriteId);
                if (favOpt.isEmpty()) continue;

                Favourite favourite = favOpt.get();
                @SuppressWarnings("unchecked")
                List<String> itemNames = (List<String>) entry.get("items");
                if (itemNames == null) continue;

                for (String itemName : itemNames) {
                    String normalizedName = normalizer.normalize(itemName);
                    Item item = normalizedItemMap.get(normalizedName);
                    if (item != null) {
                        // Skip Road/Food items
                        if (item.getType() == ItemType.ROAD || item.getType() == ItemType.FOOD) {
                            continue;
                        }
                        item.getFavourites().add(favourite);
                        itemRepository.save(item);
                    } else {
                        log.warn("Item not found for favourite '{}': '{}'", favourite.getName(), itemName);
                    }
                }
            }
            log.info("Item-favourite linking completed");
        } catch (IOException e) {
            log.error("Failed to link items to favourites", e);
            throw new RuntimeException("Failed to link items to favourites", e);
        }
    }
}
