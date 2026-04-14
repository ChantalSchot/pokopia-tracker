package com.pokopia.tracker.service;

import com.pokopia.tracker.domain.entity.*;
import com.pokopia.tracker.domain.enums.*;
import com.pokopia.tracker.dto.request.*;
import com.pokopia.tracker.dto.response.*;
import com.pokopia.tracker.exception.*;
import com.pokopia.tracker.mapper.PokemonMapper;
import com.pokopia.tracker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HouseService {

    private final HouseRepository houseRepository;
    private final UserRepository userRepository;
    private final HousingKitRepository housingKitRepository;
    private final HabitatRepository habitatRepository;
    private final ItemRepository itemRepository;
    private final UserPokemonRepository userPokemonRepository;
    private final PokemonMapper mapper;

    @Transactional(readOnly = true)
    public PageResponse<HouseResponse> getUserHouses(UUID userId, Pageable pageable) {
        Page<House> page = houseRepository.findByUserId(userId, pageable);
        return PageResponse.of(page.map(mapper::toHouseResponse));
    }

    @Transactional(readOnly = true)
    public HouseResponse getHouse(UUID houseId, UUID userId) {
        House house = findHouseForUser(houseId, userId);
        return mapper.toHouseResponse(house);
    }

    @Transactional
    public HouseResponse createHouse(UUID userId, CreateHouseRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (houseRepository.existsByUserIdAndRegionAndName(userId, request.getRegion(), request.getName())) {
            throw new ConflictException("A house with this name already exists in this region");
        }

        House house = House.builder()
            .user(user)
            .name(request.getName())
            .description(request.getDescription())
            .region(request.getRegion())
            .houseType(request.getHouseType())
            .idealHabitat(request.getIdealHabitat())
            .build();

        if (request.getHouseType() == HouseType.KIT && request.getHousingKitId() != null) {
            HousingKit kit = housingKitRepository.findById(request.getHousingKitId())
                .orElseThrow(() -> new ResourceNotFoundException("HousingKit", "id", request.getHousingKitId()));
            house.setHousingKit(kit);
            house.setSize(kit.getSize());
            house.setWidth(kit.getWidth());
            house.setDepth(kit.getDepth());
            house.setHeight(kit.getHeight());
        }

        if (request.getHouseType() == HouseType.CUSTOM) {
            house.setWidth(request.getWidth());
            house.setDepth(request.getDepth());
            house.setHeight(request.getHeight());
        }

        if (request.getHabitatRefId() != null) {
            Habitat habitat = habitatRepository.findById(request.getHabitatRefId())
                .orElseThrow(() -> new ResourceNotFoundException("Habitat", "id", request.getHabitatRefId()));
            house.setHabitatRef(habitat);
        }

        house = houseRepository.save(house);
        return mapper.toHouseResponse(house);
    }

    @Transactional
    public HouseResponse updateHouse(UUID houseId, UUID userId, UpdateHouseRequest request) {
        House house = findHouseForUser(houseId, userId);

        if (request.getName() != null) {
            if (!request.getName().equals(house.getName()) &&
                houseRepository.existsByUserIdAndRegionAndName(userId, house.getRegion(), request.getName())) {
                throw new ConflictException("A house with this name already exists in this region");
            }
            house.setName(request.getName());
        }
        if (request.getDescription() != null) house.setDescription(request.getDescription());
        if (request.getIdealHabitat() != null) house.setIdealHabitat(request.getIdealHabitat());

        if (house.getHouseType() == HouseType.CUSTOM) {
            if (request.getWidth() != null) house.setWidth(request.getWidth());
            if (request.getDepth() != null) house.setDepth(request.getDepth());
            if (request.getHeight() != null) house.setHeight(request.getHeight());
        }

        if (request.getHabitatRefId() != null) {
            Habitat habitat = habitatRepository.findById(request.getHabitatRefId())
                .orElseThrow(() -> new ResourceNotFoundException("Habitat", "id", request.getHabitatRefId()));
            house.setHabitatRef(habitat);
        }

        house = houseRepository.save(house);
        return mapper.toHouseResponse(house);
    }

    @Transactional
    public void deleteHouse(UUID houseId, UUID userId) {
        House house = findHouseForUser(houseId, userId);
        // All assigned pokemon become homeless (house_id set to null via cascade)
        List<UserPokemon> assigned = userPokemonRepository.findByHouseId(houseId);
        for (UserPokemon up : assigned) {
            up.setHouse(null);
            userPokemonRepository.save(up);
        }
        houseRepository.delete(house);
    }

    @Transactional
    public HouseResponse changeRegion(UUID houseId, UUID userId, ChangeHouseRegionRequest request) {
        House house = findHouseForUser(houseId, userId);

        if (request.getNewRegion() == house.getRegion()) {
            throw new BusinessRuleException("House is already in this region");
        }

        if (houseRepository.existsByUserIdAndRegionAndName(userId, request.getNewRegion(), house.getName())) {
            throw new ConflictException("A house with this name already exists in the target region");
        }

        Set<UUID> pokemonToMove = request.getPokemonIdsToMove() != null ?
            new HashSet<>(request.getPokemonIdsToMove()) : Collections.emptySet();

        List<UserPokemon> assigned = userPokemonRepository.findByHouseId(houseId);
        for (UserPokemon up : assigned) {
            if (!pokemonToMove.contains(up.getPokemon().getId())) {
                up.setHouse(null);
                userPokemonRepository.save(up);
            }
        }

        house.setRegion(request.getNewRegion());
        house = houseRepository.save(house);
        return mapper.toHouseResponse(house);
    }

    @Transactional
    public HouseResponse assignPokemon(UUID houseId, UUID pokemonId, UUID userId) {
        House house = findHouseForUser(houseId, userId);

        if (house.isFull()) {
            throw new BusinessRuleException("House is at capacity");
        }

        UserPokemon userPokemon = userPokemonRepository.findByUserIdAndPokemonId(userId, pokemonId)
            .orElseThrow(() -> new ResourceNotFoundException("Pokemon not registered"));

        if (userPokemon.getHouse() != null) {
            // Remove from old house implicitly
            userPokemon.setHouse(null);
        }

        userPokemon.setHouse(house);
        userPokemonRepository.save(userPokemon);

        // Refresh house
        house = houseRepository.findById(houseId).orElseThrow();
        return mapper.toHouseResponse(house);
    }

    @Transactional
    public HouseResponse removePokemon(UUID houseId, UUID pokemonId, UUID userId) {
        findHouseForUser(houseId, userId);

        UserPokemon userPokemon = userPokemonRepository.findByUserIdAndPokemonId(userId, pokemonId)
            .orElseThrow(() -> new ResourceNotFoundException("Pokemon not registered"));

        if (userPokemon.getHouse() == null || !userPokemon.getHouse().getId().equals(houseId)) {
            throw new BusinessRuleException("Pokemon is not assigned to this house");
        }

        userPokemon.setHouse(null);
        userPokemonRepository.save(userPokemon);

        House house = houseRepository.findById(houseId).orElseThrow();
        return mapper.toHouseResponse(house);
    }

    @Transactional
    public HouseResponse updateItems(UUID houseId, UUID userId, UpdateHouseItemsRequest request) {
        House house = findHouseForUser(houseId, userId);

        Set<Item> items = new LinkedHashSet<>();
        if (request.getItemIds() != null) {
            for (UUID itemId : request.getItemIds()) {
                Item item = itemRepository.findById(itemId)
                    .orElseThrow(() -> new ResourceNotFoundException("Item", "id", itemId));
                if (!item.isHouseAssignable()) {
                    throw new BusinessRuleException("Item '" + item.getName() + "' cannot be assigned to a house");
                }
                items.add(item);
            }
        }

        house.setItems(items);
        house = houseRepository.save(house);
        return mapper.toHouseResponse(house);
    }

    @Transactional(readOnly = true)
    public List<FavouriteResponse> getActiveFavourites(UUID houseId, UUID userId) {
        House house = findHouseForUser(houseId, userId);

        return house.getItems().stream()
            .flatMap(item -> item.getFavourites().stream())
            .filter(f -> !f.isFlavour())
            .distinct()
            .map(mapper::toFavouriteResponse)
            .collect(Collectors.toList());
    }

    private House findHouseForUser(UUID houseId, UUID userId) {
        return houseRepository.findByIdAndUserId(houseId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("House", "id", houseId));
    }
}
