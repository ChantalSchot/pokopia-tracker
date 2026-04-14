package com.pokopia.tracker.service;

import com.pokopia.tracker.dto.response.HabitatResponse;
import com.pokopia.tracker.mapper.PokemonMapper;
import com.pokopia.tracker.repository.HabitatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HabitatService {

    private final HabitatRepository habitatRepository;
    private final PokemonMapper mapper;

    @Transactional(readOnly = true)
    public List<HabitatResponse> getAllHabitats() {
        return habitatRepository.findAll().stream()
            .map(mapper::toHabitatResponse)
            .collect(Collectors.toList());
    }
}
