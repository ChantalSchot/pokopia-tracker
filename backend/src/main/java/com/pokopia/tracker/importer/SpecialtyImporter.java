package com.pokopia.tracker.importer;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pokopia.tracker.domain.entity.Specialty;
import com.pokopia.tracker.repository.SpecialtyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class SpecialtyImporter {

    private final SpecialtyRepository specialtyRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.import-data-path}")
    private String importDataPath;

    @Transactional
    public void importData() {
        try {
            File file = new File(importDataPath, "specialties.json");
            List<Map<String, Object>> data = objectMapper.readValue(file, new TypeReference<>() {});

            for (Map<String, Object> entry : data) {
                UUID id = UUID.fromString((String) entry.get("id"));
                if (specialtyRepository.existsById(id)) continue;

                Specialty specialty = Specialty.builder()
                    .id(id)
                    .name((String) entry.get("name"))
                    .description((String) entry.get("description"))
                    .imagePath((String) entry.get("imagePath"))
                    .build();
                specialtyRepository.save(specialty);
            }
            log.info("Imported {} specialties", data.size());
        } catch (IOException e) {
            log.error("Failed to import specialties", e);
            throw new RuntimeException("Failed to import specialties", e);
        }
    }
}
