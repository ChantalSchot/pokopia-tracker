package com.pokopia.tracker.controller;

import com.pokopia.tracker.dto.response.PageResponse;
import com.pokopia.tracker.dto.response.UserPokemonResponse;
import com.pokopia.tracker.service.PokemonService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users/me/pokemon")
@RequiredArgsConstructor
public class UserPokemonController {

    private final PokemonService pokemonService;

    @GetMapping
    public ResponseEntity<PageResponse<UserPokemonResponse>> getRegisteredPokemon(
            Authentication auth,
            @PageableDefault(size = 20) Pageable pageable) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(pokemonService.getRegisteredPokemon(userId, pageable));
    }

    @PostMapping("/{pokemonId}")
    public ResponseEntity<UserPokemonResponse> registerPokemon(Authentication auth,
                                                                 @PathVariable UUID pokemonId) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(pokemonService.registerPokemon(userId, pokemonId));
    }

    @DeleteMapping("/{pokemonId}")
    public ResponseEntity<Void> unregisterPokemon(Authentication auth,
                                                    @PathVariable UUID pokemonId) {
        UUID userId = (UUID) auth.getPrincipal();
        pokemonService.unregisterPokemon(userId, pokemonId);
        return ResponseEntity.noContent().build();
    }
}
