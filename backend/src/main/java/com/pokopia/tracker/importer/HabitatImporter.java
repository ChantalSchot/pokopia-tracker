package com.pokopia.tracker.importer;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pokopia.tracker.domain.entity.Habitat;
import com.pokopia.tracker.repository.HabitatRepository;
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
public class HabitatImporter {

    private final HabitatRepository habitatRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.import-data-path}")
    private String importDataPath;

    @SuppressWarnings("unchecked")
    public void importData() {
        try {
            File file = new File(importDataPath, "habitats.json");
            List<Map<String, Object>> data = objectMapper.readValue(file, new TypeReference<>() {});

            for (Map<String, Object> entry : data) {
                UUID id = UUID.fromString((String) entry.get("id"));
                if (habitatRepository.existsById(id)) continue;

                List<String> pokemonIds = (List<String>) entry.get("pokemonIds");

                Habitat habitat = Habitat.builder()
                    .id(id)
                    .name((String) entry.get("name"))
                    .isEvent(Boolean.TRUE.equals(entry.get("isEvent")))
                    .imagePath((String) entry.get("imagePath"))
                    .pokemonNumbers(pokemonIds != null ? new ArrayList<>(pokemonIds) : new ArrayList<>())
                    .build();
                habitatRepository.save(habitat);
            }
            log.info("Imported {} habitats", data.size());
        } catch (IOException e) {
            log.error("Failed to import habitats", e);
            throw new RuntimeException("Failed to import habitats", e);
        }
    }
}
