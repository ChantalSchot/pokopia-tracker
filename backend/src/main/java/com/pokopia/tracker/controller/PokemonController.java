package com.pokopia.tracker.controller;

import com.pokopia.tracker.domain.entity.Pokemon;
import com.pokopia.tracker.dto.response.PageResponse;
import com.pokopia.tracker.dto.response.PokemonResponse;
import com.pokopia.tracker.dto.response.UserPokemonResponse;
import com.pokopia.tracker.service.PokemonService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pokemon")
@RequiredArgsConstructor
public class PokemonController {

    private final PokemonService pokemonService;

    @GetMapping
    public ResponseEntity<PageResponse<PokemonResponse>> getAllPokemon(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String idealHabitat,
            @RequestParam(required = false) String rarity,
            @RequestParam(required = false) Boolean isEvent,
            @PageableDefault(size = 20, sort = "number") Pageable pageable) {

        Specification<Pokemon> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (name != null && !name.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
            }
            if (idealHabitat != null && !idealHabitat.isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("idealHabitat")), idealHabitat.toUpperCase()));
            }
            if (rarity != null && !rarity.isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("rarity")), rarity.toUpperCase()));
            }
            if (isEvent != null) {
                predicates.add(cb.equal(root.get("isEvent"), isEvent));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return ResponseEntity.ok(pokemonService.getAllPokemon(spec, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PokemonResponse> getPokemonById(@PathVariable UUID id) {
        return ResponseEntity.ok(pokemonService.getPokemonById(id));
    }
}
