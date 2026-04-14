package com.pokopia.tracker.controller;

import com.pokopia.tracker.dto.request.*;
import com.pokopia.tracker.dto.response.*;
import com.pokopia.tracker.service.HouseService;
import com.pokopia.tracker.service.SuggestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/houses")
@RequiredArgsConstructor
public class HouseController {

    private final HouseService houseService;
    private final SuggestionService suggestionService;

    @GetMapping
    public ResponseEntity<PageResponse<HouseResponse>> getUserHouses(
            Authentication auth,
            @PageableDefault(size = 20) Pageable pageable) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(houseService.getUserHouses(userId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HouseResponse> getHouse(Authentication auth, @PathVariable UUID id) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(houseService.getHouse(id, userId));
    }

    @PostMapping
    public ResponseEntity<HouseResponse> createHouse(Authentication auth,
                                                       @Valid @RequestBody CreateHouseRequest request) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(houseService.createHouse(userId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HouseResponse> updateHouse(Authentication auth,
                                                       @PathVariable UUID id,
                                                       @Valid @RequestBody UpdateHouseRequest request) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(houseService.updateHouse(id, userId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHouse(Authentication auth, @PathVariable UUID id) {
        UUID userId = (UUID) auth.getPrincipal();
        houseService.deleteHouse(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/region")
    public ResponseEntity<HouseResponse> changeRegion(Authentication auth,
                                                        @PathVariable UUID id,
                                                        @Valid @RequestBody ChangeHouseRegionRequest request) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(houseService.changeRegion(id, userId, request));
    }

    @PostMapping("/{id}/pokemon/{pokemonId}")
    public ResponseEntity<HouseResponse> assignPokemon(Authentication auth,
                                                         @PathVariable UUID id,
                                                         @PathVariable UUID pokemonId) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(houseService.assignPokemon(id, pokemonId, userId));
    }

    @DeleteMapping("/{id}/pokemon/{pokemonId}")
    public ResponseEntity<HouseResponse> removePokemon(Authentication auth,
                                                         @PathVariable UUID id,
                                                         @PathVariable UUID pokemonId) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(houseService.removePokemon(id, pokemonId, userId));
    }

    @PutMapping("/{id}/items")
    public ResponseEntity<HouseResponse> updateItems(Authentication auth,
                                                       @PathVariable UUID id,
                                                       @Valid @RequestBody UpdateHouseItemsRequest request) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(houseService.updateItems(id, userId, request));
    }

    @GetMapping("/{id}/suggestions")
    public ResponseEntity<HouseSuggestionsResponse> getSuggestions(Authentication auth,
                                                                     @PathVariable UUID id) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(suggestionService.getSuggestions(id, userId));
    }

    @GetMapping("/{id}/active-favourites")
    public ResponseEntity<List<FavouriteResponse>> getActiveFavourites(Authentication auth,
                                                                         @PathVariable UUID id) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(houseService.getActiveFavourites(id, userId));
    }
}
