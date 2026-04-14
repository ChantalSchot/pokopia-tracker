package com.pokopia.tracker.service;

import com.pokopia.tracker.domain.entity.Pokemon;
import com.pokopia.tracker.domain.entity.UserPokemon;
import com.pokopia.tracker.domain.entity.User;
import com.pokopia.tracker.dto.response.PageResponse;
import com.pokopia.tracker.dto.response.PokemonResponse;
import com.pokopia.tracker.dto.response.UserPokemonResponse;
import com.pokopia.tracker.exception.BusinessRuleException;
import com.pokopia.tracker.exception.ConflictException;
import com.pokopia.tracker.exception.ResourceNotFoundException;
import com.pokopia.tracker.mapper.PokemonMapper;
import com.pokopia.tracker.repository.PokemonRepository;
import com.pokopia.tracker.repository.UserPokemonRepository;
import com.pokopia.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PokemonService {

    private final PokemonRepository pokemonRepository;
    private final UserPokemonRepository userPokemonRepository;
    private final UserRepository userRepository;
    private final PokemonMapper mapper;

    @Transactional(readOnly = true)
    public PageResponse<PokemonResponse> getAllPokemon(Specification<Pokemon> spec, Pageable pageable) {
        Page<Pokemon> page = pokemonRepository.findAll(spec, pageable);
        Page<PokemonResponse> responsePage = page.map(mapper::toResponse);
        return PageResponse.of(responsePage);
    }

    @Transactional(readOnly = true)
    public PokemonResponse getPokemonById(UUID id) {
        Pokemon pokemon = pokemonRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Pokemon", "id", id));
        return mapper.toResponse(pokemon);
    }

    @Transactional(readOnly = true)
    public PageResponse<UserPokemonResponse> getRegisteredPokemon(UUID userId, Pageable pageable) {
        Page<UserPokemon> page = userPokemonRepository.findByUserId(userId, pageable);
        Page<UserPokemonResponse> responsePage = page.map(mapper::toUserPokemonResponse);
        return PageResponse.of(responsePage);
    }

    @Transactional
    public UserPokemonResponse registerPokemon(UUID userId, UUID pokemonId) {
        if (userPokemonRepository.existsByUserIdAndPokemonId(userId, pokemonId)) {
            throw new ConflictException("Pokemon already registered");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Pokemon pokemon = pokemonRepository.findById(pokemonId)
            .orElseThrow(() -> new ResourceNotFoundException("Pokemon", "id", pokemonId));

        UserPokemon userPokemon = UserPokemon.builder()
            .user(user)
            .pokemon(pokemon)
            .build();
        userPokemon = userPokemonRepository.save(userPokemon);
        return mapper.toUserPokemonResponse(userPokemon);
    }

    @Transactional
    public void unregisterPokemon(UUID userId, UUID pokemonId) {
        UserPokemon userPokemon = userPokemonRepository.findByUserIdAndPokemonId(userId, pokemonId)
            .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));

        userPokemonRepository.delete(userPokemon);
    }
}
