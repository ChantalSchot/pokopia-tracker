package com.pokopia.tracker.mapper;

import com.pokopia.tracker.domain.entity.*;
import com.pokopia.tracker.dto.response.*;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class PokemonMapper {

    public PokemonResponse toResponse(Pokemon pokemon) {
        if (pokemon == null) return null;
        return PokemonResponse.builder()
            .id(pokemon.getId())
            .number(pokemon.getNumber())
            .name(pokemon.getName())
            .idealHabitat(pokemon.getIdealHabitat() != null ? pokemon.getIdealHabitat().name() : null)
            .litterDrop(pokemon.getLitterDrop() != null ? pokemon.getLitterDrop().getDisplayName() : null)
            .rarity(pokemon.getRarity() != null ? pokemon.getRarity().getDisplayName() : null)
            .isEvent(pokemon.isEvent())
            .isDitto(pokemon.isDitto())
            .spritePath(pokemon.getSpritePath())
            .types(pokemon.getTypes().stream()
                .map(t -> t.getDisplayName())
                .collect(Collectors.toCollection(java.util.LinkedHashSet::new)))
            .regions(pokemon.getRegions().stream()
                .map(r -> r.getDisplayName())
                .collect(Collectors.toCollection(java.util.LinkedHashSet::new)))
            .timeOfDay(pokemon.getTimeOfDay() != null ? new java.util.ArrayList<>(pokemon.getTimeOfDay()) : java.util.List.of())
            .specialties(pokemon.getSpecialties().stream()
                .map(this::toSpecialtyResponse)
                .collect(Collectors.toList()))
            .favourites(pokemon.getFavourites().stream()
                .map(this::toFavouriteResponse)
                .collect(Collectors.toList()))
            .build();
    }

    public SpecialtyResponse toSpecialtyResponse(Specialty specialty) {
        if (specialty == null) return null;
        return SpecialtyResponse.builder()
            .id(specialty.getId())
            .name(specialty.getName())
            .description(specialty.getDescription())
            .imagePath(specialty.getImagePath())
            .build();
    }

    public FavouriteResponse toFavouriteResponse(Favourite favourite) {
        if (favourite == null) return null;
        return FavouriteResponse.builder()
            .id(favourite.getId())
            .name(favourite.getName())
            .isFlavour(favourite.isFlavour())
            .build();
    }

    public ItemResponse toItemResponse(Item item) {
        if (item == null) return null;
        return ItemResponse.builder()
            .id(item.getId())
            .name(item.getName())
            .description(item.getDescription())
            .category(item.getCategory())
            .obtainMethod(item.getObtainMethod())
            .obtainDetails(item.getObtainDetails())
            .type(item.getType() != null ? item.getType().getDisplayName() : null)
            .colour(item.getColour())
            .imagePath(item.getImagePath())
            .favourites(item.getFavourites().stream()
                .map(this::toFavouriteResponse)
                .collect(Collectors.toList()))
            .build();
    }

    public HabitatResponse toHabitatResponse(Habitat habitat) {
        if (habitat == null) return null;
        return HabitatResponse.builder()
            .id(habitat.getId())
            .name(habitat.getName())
            .isEvent(habitat.isEvent())
            .imagePath(habitat.getImagePath())
            .pokemonNumbers(habitat.getPokemonNumbers() != null ? new java.util.ArrayList<>(habitat.getPokemonNumbers()) : java.util.List.of())
            .build();
    }

    public HousingKitResponse toHousingKitResponse(HousingKit kit) {
        if (kit == null) return null;
        return HousingKitResponse.builder()
            .id(kit.getId())
            .name(kit.getName())
            .floors(kit.getFloors())
            .size(kit.getSize())
            .width(kit.getWidth())
            .depth(kit.getDepth())
            .height(kit.getHeight())
            .imagePath(kit.getImagePath())
            .build();
    }

    public UserResponse toUserResponse(User user) {
        if (user == null) return null;
        return UserResponse.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .roles(user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toSet()))
            .emailVerified(user.isEmailVerified())
            .createdAt(user.getCreatedAt())
            .build();
    }

    public HouseResponse toHouseResponse(House house) {
        if (house == null) return null;
        return HouseResponse.builder()
            .id(house.getId())
            .name(house.getName())
            .description(house.getDescription())
            .region(house.getRegion() != null ? house.getRegion().getDisplayName() : null)
            .houseType(house.getHouseType() != null ? house.getHouseType().name() : null)
            .idealHabitat(house.getIdealHabitat() != null ? house.getIdealHabitat().name() : null)
            .width(house.getWidth())
            .depth(house.getDepth())
            .height(house.getHeight())
            .capacity(house.getCapacity())
            .occupancy(house.getOccupancy())
            .housingKit(house.getHousingKit() != null ? toHousingKitResponse(house.getHousingKit()) : null)
            .habitatRef(house.getHabitatRef() != null ? toHabitatResponse(house.getHabitatRef()) : null)
            .items(house.getItems().stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList()))
            .assignedPokemon(house.getAssignedPokemon().stream()
                .map(up -> toUserPokemonResponse(up, house))
                .collect(Collectors.toList()))
            .createdAt(house.getCreatedAt())
            .updatedAt(house.getUpdatedAt())
            .build();
    }

    public UserPokemonResponse toUserPokemonResponse(UserPokemon userPokemon, House house) {
        if (userPokemon == null) return null;
        Pokemon p = userPokemon.getPokemon();
        boolean warning = false;
        if (house != null && !p.isDitto()) {
            warning = computeWarning(p, house);
        }
        return UserPokemonResponse.builder()
            .id(userPokemon.getId())
            .pokemonId(p.getId())
            .pokemonName(p.getName())
            .pokemonNumber(p.getNumber())
            .spritePath(p.getSpritePath())
            .houseId(house != null ? house.getId() : null)
            .houseName(house != null ? house.getName() : null)
            .homeless(userPokemon.isHomeless())
            .warning(warning)
            .build();
    }

    public UserPokemonResponse toUserPokemonResponse(UserPokemon userPokemon) {
        House house = userPokemon.getHouse();
        return toUserPokemonResponse(userPokemon, house);
    }

    private boolean computeWarning(Pokemon pokemon, House house) {
        if (pokemon.isDitto()) return false;

        // Get active favourites of the house (non-flavour favourites linked to items in the house)
        java.util.Set<java.util.UUID> activeFavouriteIds = house.getItems().stream()
            .flatMap(item -> item.getFavourites().stream())
            .filter(f -> !f.isFlavour())
            .map(Favourite::getId)
            .collect(Collectors.toSet());

        if (activeFavouriteIds.isEmpty()) return false;

        // Check if any of pokemon's non-flavour favourites are active
        boolean hasMatch = pokemon.getFavourites().stream()
            .filter(f -> !f.isFlavour())
            .anyMatch(f -> activeFavouriteIds.contains(f.getId()));

        return !hasMatch;
    }
}
