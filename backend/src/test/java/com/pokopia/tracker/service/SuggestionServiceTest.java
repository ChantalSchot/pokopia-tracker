package com.pokopia.tracker.service;

import com.pokopia.tracker.domain.entity.*;
import com.pokopia.tracker.domain.enums.*;
import com.pokopia.tracker.dto.response.HouseSuggestionsResponse;
import com.pokopia.tracker.dto.response.PokemonResponse;
import com.pokopia.tracker.mapper.PokemonMapper;
import com.pokopia.tracker.repository.HouseRepository;
import com.pokopia.tracker.repository.UserPokemonRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SuggestionServiceTest {

    @Mock private HouseRepository houseRepository;
    @Mock private UserPokemonRepository userPokemonRepository;
    @Mock private PokemonMapper mapper;

    @InjectMocks private SuggestionService suggestionService;

    @Test
    void getSuggestions_fullHouse_returnsEmpty() {
        UUID userId = UUID.randomUUID();
        UUID houseId = UUID.randomUUID();
        House house = House.builder().id(houseId).houseType(HouseType.HABITAT)
            .idealHabitat(IdealHabitat.BRIGHT)
            .assignedPokemon(List.of(new UserPokemon()))
            .items(new LinkedHashSet<>()).build();
        house.setUser(User.builder().id(userId).build());

        when(houseRepository.findByIdAndUserId(houseId, userId)).thenReturn(Optional.of(house));

        HouseSuggestionsResponse result = suggestionService.getSuggestions(houseId, userId);
        assertThat(result.getSuggestions()).isEmpty();
        assertThat(result.getAvailableSlots()).isEqualTo(0);
    }

    @Test
    void getSuggestions_noHabitat_returnsEmpty() {
        UUID userId = UUID.randomUUID();
        UUID houseId = UUID.randomUUID();
        House house = House.builder().id(houseId).houseType(HouseType.KIT).size(4)
            .idealHabitat(null)
            .assignedPokemon(new ArrayList<>())
            .items(new LinkedHashSet<>()).build();
        house.setUser(User.builder().id(userId).build());

        when(houseRepository.findByIdAndUserId(houseId, userId)).thenReturn(Optional.of(house));

        HouseSuggestionsResponse result = suggestionService.getSuggestions(houseId, userId);
        assertThat(result.getSuggestions()).isEmpty();
    }

    @Test
    void getSuggestions_excludesDitto() {
        UUID userId = UUID.randomUUID();
        UUID houseId = UUID.randomUUID();
        House house = House.builder().id(houseId).houseType(HouseType.KIT).size(4)
            .idealHabitat(IdealHabitat.BRIGHT)
            .assignedPokemon(new ArrayList<>())
            .items(new LinkedHashSet<>()).build();
        house.setUser(User.builder().id(userId).build());

        Pokemon ditto = Pokemon.builder().id(UUID.randomUUID()).name("Ditto").isDitto(true)
            .idealHabitat(IdealHabitat.BRIGHT).favourites(new LinkedHashSet<>())
            .types(new LinkedHashSet<>()).regions(new LinkedHashSet<>()).build();
        UserPokemon dittoReg = UserPokemon.builder().pokemon(ditto).build();

        when(houseRepository.findByIdAndUserId(houseId, userId)).thenReturn(Optional.of(house));
        when(userPokemonRepository.findByUserIdAndHouseIsNull(userId)).thenReturn(List.of(dittoReg));

        HouseSuggestionsResponse result = suggestionService.getSuggestions(houseId, userId);
        assertThat(result.getSuggestions()).isEmpty();
    }
}
