package com.pokopia.tracker.service;

import com.pokopia.tracker.domain.entity.*;
import com.pokopia.tracker.dto.response.DashboardResponse;
import com.pokopia.tracker.dto.response.UserPokemonResponse;
import com.pokopia.tracker.mapper.PokemonMapper;
import com.pokopia.tracker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PokemonRepository pokemonRepository;
    private final UserPokemonRepository userPokemonRepository;
    private final HouseRepository houseRepository;
    private final PokemonMapper mapper;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(UUID userId) {
        long totalPokemon = pokemonRepository.count();
        long registeredPokemon = userPokemonRepository.countByUserId(userId);
        long homelessPokemon = userPokemonRepository.countByUserIdAndHouseIsNull(userId);
        long totalHouses = houseRepository.countByUserId(userId);

        // Count houses at capacity
        List<House> houses = houseRepository.findByUserId(userId);
        long housesAtCapacity = houses.stream().filter(House::isFull).count();

        // Count pokemon with warnings
        List<UserPokemon> registeredList = userPokemonRepository.findByUserId(userId);
        long pokemonWithWarnings = registeredList.stream()
            .filter(up -> up.getHouse() != null)
            .filter(up -> !up.getPokemon().isDitto())
            .filter(up -> {
                House house = up.getHouse();
                return hasWarning(up.getPokemon(), house);
            })
            .count();

        // Recent registrations
        List<UserPokemonResponse> recent = userPokemonRepository
            .findRecentByUserId(userId, PageRequest.of(0, 5))
            .stream()
            .map(mapper::toUserPokemonResponse)
            .collect(Collectors.toList());

        return DashboardResponse.builder()
            .totalPokemon(totalPokemon)
            .registeredPokemon(registeredPokemon)
            .homelessPokemon(homelessPokemon)
            .totalHouses(totalHouses)
            .housesAtCapacity(housesAtCapacity)
            .pokemonWithWarnings(pokemonWithWarnings)
            .recentRegistrations(recent)
            .build();
    }

    private boolean hasWarning(Pokemon pokemon, House house) {
        if (pokemon.isDitto()) return false;

        var activeFavouriteIds = house.getItems().stream()
            .flatMap(item -> item.getFavourites().stream())
            .filter(f -> !f.isFlavour())
            .map(Favourite::getId)
            .collect(Collectors.toSet());

        if (activeFavouriteIds.isEmpty()) return false;

        return pokemon.getFavourites().stream()
            .filter(f -> !f.isFlavour())
            .noneMatch(f -> activeFavouriteIds.contains(f.getId()));
    }
}
