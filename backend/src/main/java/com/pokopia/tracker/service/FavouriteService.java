package com.pokopia.tracker.service;

import com.pokopia.tracker.domain.entity.Favourite;
import com.pokopia.tracker.dto.response.FavouriteResponse;
import com.pokopia.tracker.mapper.PokemonMapper;
import com.pokopia.tracker.repository.FavouriteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavouriteService {

    private final FavouriteRepository favouriteRepository;
    private final PokemonMapper mapper;

    @Transactional(readOnly = true)
    public List<FavouriteResponse> getAllFavourites() {
        return favouriteRepository.findAll().stream()
            .map(mapper::toFavouriteResponse)
            .collect(Collectors.toList());
    }
}
