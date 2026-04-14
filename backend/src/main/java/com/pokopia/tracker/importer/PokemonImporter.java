package com.pokopia.tracker.importer;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pokopia.tracker.domain.entity.Favourite;
import com.pokopia.tracker.domain.entity.Pokemon;
import com.pokopia.tracker.domain.entity.Specialty;
import com.pokopia.tracker.domain.enums.*;
import com.pokopia.tracker.repository.FavouriteRepository;
import com.pokopia.tracker.repository.PokemonRepository;
import com.pokopia.tracker.repository.SpecialtyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class PokemonImporter {

    private final PokemonRepository pokemonRepository;
    private final SpecialtyRepository specialtyRepository;
    private final FavouriteRepository favouriteRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.import-data-path}")
    private String importDataPath;

    private static final Set<String> VALID_TIME_OF_DAY = Set.of(
        "All day", "Daytime", "Evening", "Morning", "Nighttime"
    );

    /**
     * Safely coerces a JSON field value to List<String>.
     * Handles: null → empty list, String → single-element list, List → as-is.
     * This is necessary because some pokemon.json records have timeOfDay as a
     * plain String instead of an array (data quality issue in source JSON).
     */
    @SuppressWarnings("unchecked")
    private List<String> toStringList(Object value) {
        if (value == null) return new ArrayList<>();
        if (value instanceof List) return (List<String>) value;
        if (value instanceof String s) {
            return s.isBlank() ? new ArrayList<>() : new ArrayList<>(List.of(s));
        }
        return new ArrayList<>();
    }

    @SuppressWarnings("unchecked")
    @Transactional
    public void importData() {
        try {
            File file = new File(importDataPath, "pokemon.json");
            List<Map<String, Object>> data = objectMapper.readValue(file, new TypeReference<>() {});

            int imported = 0;
            int skipped = 0;

            for (Map<String, Object> entry : data) {
                UUID id = UUID.fromString((String) entry.get("id"));
                if (pokemonRepository.existsById(id)) {
                    skipped++;
                    continue;
                }

                String name = (String) entry.get("name");
                boolean isDitto = "Ditto".equalsIgnoreCase(name);

                // Parse types — always a list in source data, but use safe helper
                List<String> typeNames = toStringList(entry.get("types"));
                Set<PokemonType> types = typeNames.stream()
                    .map(t -> {
                        try { return PokemonType.fromDisplayName(t); }
                        catch (Exception e) { log.warn("Unknown type '{}' for pokemon {}", t, name); return null; }
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toCollection(LinkedHashSet::new));

                // Parse regions — always a list in source data
                List<String> regionNames = toStringList(entry.get("regions"));
                Set<Region> regions = regionNames.stream()
                    .map(r -> {
                        try { return Region.fromDisplayName(r); }
                        catch (Exception e) { log.warn("Unknown region '{}' for pokemon {}", r, name); return null; }
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toCollection(LinkedHashSet::new));

                // Parse timeOfDay — may be String or List<String> in source data (data quality issue)
                List<String> timeOfDay = toStringList(entry.get("timeOfDay")).stream()
                    .filter(VALID_TIME_OF_DAY::contains)
                    .collect(Collectors.toList());

                // Parse specialties
                List<String> specialtyNames = toStringList(entry.get("specialties"));
                Set<Specialty> specialties = new LinkedHashSet<>();
                for (String sName : specialtyNames) {
                    if (sName == null || sName.isBlank()) continue;
                    specialtyRepository.findByNameIgnoreCase(sName.trim())
                        .ifPresentOrElse(
                            specialties::add,
                            () -> log.warn("Specialty not found: '{}' for pokemon {}", sName, name)
                        );
                }

                // Parse favourites — Ditto gets empty favourites (special player character)
                List<String> favouriteNames = toStringList(entry.get("favourites"));
                Set<Favourite> favourites = new LinkedHashSet<>();
                if (!isDitto) {
                    for (String fName : favouriteNames) {
                        if (fName == null || fName.isBlank() || "none".equalsIgnoreCase(fName)) continue;
                        favouriteRepository.findByNameIgnoreCase(fName.trim())
                            .ifPresentOrElse(
                                favourites::add,
                                () -> log.warn("Favourite not found: '{}' for pokemon {}", fName, name)
                            );
                    }
                }

                String idealHabitatStr = (String) entry.get("idealHabitat");
                String litterDropStr = (String) entry.get("litterDrop");
                String rarityStr = (String) entry.get("rarity");

                IdealHabitat idealHabitat = null;
                if (idealHabitatStr != null && !idealHabitatStr.isBlank()) {
                    try { idealHabitat = IdealHabitat.valueOf(idealHabitatStr.toUpperCase()); }
                    catch (IllegalArgumentException e) { log.warn("Unknown idealHabitat '{}' for pokemon {}", idealHabitatStr, name); }
                }

                Pokemon pokemon = Pokemon.builder()
                    .id(id)
                    .number((String) entry.get("number"))
                    .name(name)
                    .idealHabitat(idealHabitat)
                    .litterDrop(LitterDrop.fromDisplayName(litterDropStr))
                    .rarity(Rarity.fromDisplayName(rarityStr))
                    .isEvent(Boolean.TRUE.equals(entry.get("isEvent")))
                    .isDitto(isDitto)
                    .spritePath((String) entry.get("spritePath"))
                    .types(types)
                    .regions(regions)
                    .timeOfDay(timeOfDay)
                    .specialties(specialties)
                    .favourites(favourites)
                    .build();

                pokemonRepository.save(pokemon);
                imported++;
            }
            log.info("Imported {} pokemon ({} already existed, skipped)", imported, skipped);
        } catch (IOException e) {
            log.error("Failed to import pokemon", e);
            throw new RuntimeException("Failed to import pokemon", e);
        }
    }
}
