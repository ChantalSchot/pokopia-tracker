package com.pokopia.tracker.service;

import com.pokopia.tracker.dto.response.HousingKitResponse;
import com.pokopia.tracker.mapper.PokemonMapper;
import com.pokopia.tracker.repository.HousingKitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HousingKitService {

    private final HousingKitRepository housingKitRepository;
    private final PokemonMapper mapper;

    @Transactional(readOnly = true)
    public List<HousingKitResponse> getAllHousingKits() {
        return housingKitRepository.findAll().stream()
            .map(mapper::toHousingKitResponse)
            .collect(Collectors.toList());
    }
}
