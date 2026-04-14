package com.pokopia.tracker.service;

import com.pokopia.tracker.dto.response.SpecialtyResponse;
import com.pokopia.tracker.mapper.PokemonMapper;
import com.pokopia.tracker.repository.SpecialtyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SpecialtyService {

    private final SpecialtyRepository specialtyRepository;
    private final PokemonMapper mapper;

    @Transactional(readOnly = true)
    public List<SpecialtyResponse> getAllSpecialties() {
        return specialtyRepository.findAll().stream()
            .map(mapper::toSpecialtyResponse)
            .collect(Collectors.toList());
    }
}
