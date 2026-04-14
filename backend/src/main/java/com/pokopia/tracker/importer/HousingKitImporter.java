package com.pokopia.tracker.importer;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pokopia.tracker.domain.entity.HousingKit;
import com.pokopia.tracker.repository.HousingKitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class HousingKitImporter {

    private final HousingKitRepository housingKitRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.import-data-path}")
    private String importDataPath;

    public void importData() {
        try {
            File file = new File(importDataPath, "housing-kits.json");
            List<Map<String, Object>> data = objectMapper.readValue(file, new TypeReference<>() {});

            for (Map<String, Object> entry : data) {
                UUID id = UUID.fromString((String) entry.get("id"));
                if (housingKitRepository.existsById(id)) continue;

                HousingKit kit = HousingKit.builder()
                    .id(id)
                    .name((String) entry.get("name"))
                    .floors((Integer) entry.get("floors"))
                    .size((Integer) entry.get("size"))
                    .width((Integer) entry.get("width"))
                    .depth((Integer) entry.get("depth"))
                    .height((Integer) entry.get("height"))
                    .imagePath((String) entry.get("imagePath"))
                    .build();
                housingKitRepository.save(kit);
            }
            log.info("Imported {} housing kits", data.size());
        } catch (IOException e) {
            log.error("Failed to import housing kits", e);
            throw new RuntimeException("Failed to import housing kits", e);
        }
    }
}
