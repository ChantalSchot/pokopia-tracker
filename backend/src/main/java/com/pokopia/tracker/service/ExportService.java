package com.pokopia.tracker.service;

import com.pokopia.tracker.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final PokemonRepository pokemonRepository;
    private final ItemRepository itemRepository;
    private final FavouriteRepository favouriteRepository;
    private final HabitatRepository habitatRepository;
    private final HousingKitRepository housingKitRepository;
    private final SpecialtyRepository specialtyRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public Object exportDataset(String dataset) {
        return switch (dataset.toLowerCase()) {
            case "pokemon" -> pokemonRepository.findAll();
            case "items" -> itemRepository.findAll();
            case "favourites" -> favouriteRepository.findAll();
            case "habitats" -> habitatRepository.findAll();
            case "housing-kits" -> housingKitRepository.findAll();
            case "specialties" -> specialtyRepository.findAll();
            default -> throw new IllegalArgumentException("Unknown dataset: " + dataset);
        };
    }
}
