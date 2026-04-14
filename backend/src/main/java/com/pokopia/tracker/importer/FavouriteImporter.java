package com.pokopia.tracker.importer;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pokopia.tracker.domain.entity.Favourite;
import com.pokopia.tracker.repository.FavouriteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class FavouriteImporter {

    private final FavouriteRepository favouriteRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.import-data-path}")
    private String importDataPath;

    private static final Set<String> FLAVOUR_NAMES = Set.of(
        "sweet flavors", "sour flavors", "spicy flavors", "bitter flavors", "dry flavors"
    );

    @Transactional
    public void importData() {
        try {
            File file = new File(importDataPath, "favourites.json");
            List<Map<String, Object>> data = objectMapper.readValue(file, new TypeReference<>() {});

            for (Map<String, Object> entry : data) {
                UUID id = UUID.fromString((String) entry.get("id"));
                if (favouriteRepository.existsById(id)) continue;

                Favourite favourite = Favourite.builder()
                    .id(id)
                    .name((String) entry.get("name"))
                    .isFlavour(false)
                    .build();
                favouriteRepository.save(favourite);
            }
            log.info("Imported {} favourites from JSON", data.size());

            // Create flavour favourites if they don't exist
            for (String flavourName : FLAVOUR_NAMES) {
                if (!favouriteRepository.existsByNameIgnoreCase(flavourName)) {
                    Favourite flavour = Favourite.builder()
                        .id(UUID.randomUUID())
                        .name(flavourName)
                        .isFlavour(true)
                        .build();
                    favouriteRepository.save(flavour);
                    log.info("Created flavour favourite: {}", flavourName);
                }
            }
        } catch (IOException e) {
            log.error("Failed to import favourites", e);
            throw new RuntimeException("Failed to import favourites", e);
        }
    }
}
