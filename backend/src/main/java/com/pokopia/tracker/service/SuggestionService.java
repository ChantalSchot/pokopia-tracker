package com.pokopia.tracker.service;

import com.pokopia.tracker.domain.entity.*;
import com.pokopia.tracker.dto.response.HouseSuggestionsResponse;
import com.pokopia.tracker.dto.response.PokemonResponse;
import com.pokopia.tracker.exception.ResourceNotFoundException;
import com.pokopia.tracker.mapper.PokemonMapper;
import com.pokopia.tracker.repository.HouseRepository;
import com.pokopia.tracker.repository.UserPokemonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SuggestionService {

    private final HouseRepository houseRepository;
    private final UserPokemonRepository userPokemonRepository;
    private final PokemonMapper mapper;

    @Transactional(readOnly = true)
    public HouseSuggestionsResponse getSuggestions(UUID houseId, UUID userId) {
        House house = houseRepository.findByIdAndUserId(houseId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("House", "id", houseId));

        int availableSlots = house.getCapacity() - house.getOccupancy();

        if (availableSlots <= 0 || house.getIdealHabitat() == null) {
            return HouseSuggestionsResponse.builder()
                .suggestions(List.of())
                .availableSlots(Math.max(availableSlots, 0))
                .build();
        }

        // Get registered homeless pokemon for this user
        List<UserPokemon> homelessPokemon = userPokemonRepository.findByUserIdAndHouseIsNull(userId);

        // Filter: matching idealHabitat, not Ditto
        List<Pokemon> candidates = homelessPokemon.stream()
            .map(UserPokemon::getPokemon)
            .filter(p -> !p.isDitto())
            .filter(p -> p.getIdealHabitat() == house.getIdealHabitat())
            .collect(Collectors.toList());

        // Get active favourites of the house
        Set<UUID> activeFavouriteIds = house.getItems().stream()
            .flatMap(item -> item.getFavourites().stream())
            .filter(f -> !f.isFlavour())
            .map(Favourite::getId)
            .collect(Collectors.toSet());

        List<PokemonResponse> suggestions;

        if (!activeFavouriteIds.isEmpty()) {
            // House has items -> suggest by active favourite overlap
            suggestions = candidates.stream()
                .map(p -> {
                    long overlap = p.getFavourites().stream()
                        .filter(f -> !f.isFlavour())
                        .filter(f -> activeFavouriteIds.contains(f.getId()))
                        .count();
                    return Map.entry(p, overlap);
                })
                .filter(e -> e.getValue() > 0)
                .sorted(Comparator.<Map.Entry<Pokemon, Long>, Long>comparing(Map.Entry::getValue).reversed()
                    .thenComparing(e -> e.getKey().getName()))
                .map(e -> mapper.toResponse(e.getKey()))
                .collect(Collectors.toList());
        } else {
            // No items -> suggest by overlap with favourites of pokemon already in the house
            Set<UUID> housePokemonFavouriteIds = house.getAssignedPokemon().stream()
                .map(UserPokemon::getPokemon)
                .flatMap(p -> p.getFavourites().stream())
                .filter(f -> !f.isFlavour())
                .map(Favourite::getId)
                .collect(Collectors.toSet());

            if (housePokemonFavouriteIds.isEmpty()) {
                // No pokemon and no items -> just return habitat matches sorted alphabetically
                suggestions = candidates.stream()
                    .sorted(Comparator.comparing(Pokemon::getName))
                    .map(mapper::toResponse)
                    .collect(Collectors.toList());
            } else {
                suggestions = candidates.stream()
                    .map(p -> {
                        long overlap = p.getFavourites().stream()
                            .filter(f -> !f.isFlavour())
                            .filter(f -> housePokemonFavouriteIds.contains(f.getId()))
                            .count();
                        return Map.entry(p, overlap);
                    })
                    .filter(e -> e.getValue() > 0)
                    .sorted(Comparator.<Map.Entry<Pokemon, Long>, Long>comparing(Map.Entry::getValue).reversed()
                        .thenComparing(e -> e.getKey().getName()))
                    .map(e -> mapper.toResponse(e.getKey()))
                    .collect(Collectors.toList());
            }
        }

        return HouseSuggestionsResponse.builder()
            .suggestions(suggestions)
            .availableSlots(availableSlots)
            .build();
    }
}
