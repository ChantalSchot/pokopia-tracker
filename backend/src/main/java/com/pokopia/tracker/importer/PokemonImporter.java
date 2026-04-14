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

    @SuppressWarnings("unchecked")
    @Transactional
    public void importData() {
        try {
            File file = new File(importDataPath, "pokemon.json");
            List<Map<String, Object>> data = objectMapper.readValue(file, new TypeReference<>() {});

            for (Map<String, Object> entry : data) {
                UUID id = UUID.fromString((String) entry.get("id"));
                if (pokemonRepository.existsById(id)) continue;

                String name = (String) entry.get("name");
                boolean isDitto = "Ditto".equalsIgnoreCase(name);

                // Parse types
                List<String> typeNames = (List<String>) entry.get("types");
                Set<PokemonType> types = typeNames != null ? typeNames.stream()
                    .map(PokemonType::fromDisplayName)
                    .collect(Collectors.toCollection(LinkedHashSet::new)) : new LinkedHashSet<>();

                // Parse regions
                List<String> regionNames = (List<String>) entry.get("regions");
                Set<Region> regions = regionNames != null ? regionNames.stream()
                    .map(Region::fromDisplayName)
                    .collect(Collectors.toCollection(LinkedHashSet::new)) : new LinkedHashSet<>();

                // Parse timeOfDay - filter to valid values only
                List<String> timeOfDayRaw = (List<String>) entry.get("timeOfDay");
                List<String> timeOfDay = timeOfDayRaw != null ? timeOfDayRaw.stream()
                    .filter(VALID_TIME_OF_DAY::contains)
                    .collect(Collectors.toList()) : new ArrayList<>();

                // Parse specialties
                List<String> specialtyNames = (List<String>) entry.get("specialties");
                Set<Specialty> specialties = new LinkedHashSet<>();
                if (specialtyNames != null) {
                    for (String sName : specialtyNames) {
                        specialtyRepository.findByNameIgnoreCase(sName)
                            .ifPresent(specialties::add);
                    }
                }

                // Parse favourites
                List<String> favouriteNames = (List<String>) entry.get("favourites");
                Set<Favourite> favourites = new LinkedHashSet<>();
                if (!isDitto && favouriteNames != null) {
                    for (String fName : favouriteNames) {
                        if ("none".equalsIgnoreCase(fName)) continue;
                        favouriteRepository.findByNameIgnoreCase(fName)
                            .ifPresent(favourites::add);
                    }
                }

                String idealHabitatStr = (String) entry.get("idealHabitat");
                String litterDropStr = (String) entry.get("litterDrop");
                String rarityStr = (String) entry.get("rarity");

                Pokemon pokemon = Pokemon.builder()
                    .id(id)
                    .number((String) entry.get("number"))
                    .name(name)
                    .idealHabitat(idealHabitatStr != null && !idealHabitatStr.isBlank() ?
                        IdealHabitat.valueOf(idealHabitatStr.toUpperCase()) : null)
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
            }
            log.info("Imported {} pokemon", data.size());
        } catch (IOException e) {
            log.error("Failed to import pokemon", e);
            throw new RuntimeException("Failed to import pokemon", e);
        }
    }
}
