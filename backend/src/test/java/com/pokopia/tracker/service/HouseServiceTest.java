package com.pokopia.tracker.service;

import com.pokopia.tracker.domain.entity.*;
import com.pokopia.tracker.domain.enums.*;
import com.pokopia.tracker.dto.request.CreateHouseRequest;
import com.pokopia.tracker.dto.response.HouseResponse;
import com.pokopia.tracker.exception.BusinessRuleException;
import com.pokopia.tracker.exception.ConflictException;
import com.pokopia.tracker.mapper.PokemonMapper;
import com.pokopia.tracker.repository.*;
import org.junit.jupiter.api.BeforeEach;
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
class HouseServiceTest {

    @Mock private HouseRepository houseRepository;
    @Mock private UserRepository userRepository;
    @Mock private HousingKitRepository housingKitRepository;
    @Mock private HabitatRepository habitatRepository;
    @Mock private ItemRepository itemRepository;
    @Mock private UserPokemonRepository userPokemonRepository;
    @Mock private PokemonMapper mapper;

    @InjectMocks private HouseService houseService;

    private User testUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = User.builder().id(userId).username("testuser").email("test@test.com").build();
    }

    @Test
    void createHouse_withKitType_setsCapacityFromKit() {
        UUID kitId = UUID.randomUUID();
        HousingKit kit = HousingKit.builder().id(kitId).name("Leaf house").size(4).width(8).depth(6).height(6).floors(2).build();

        CreateHouseRequest request = CreateHouseRequest.builder()
            .name("My House").region(Region.PALETTE_TOWN).houseType(HouseType.KIT)
            .housingKitId(kitId).build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(houseRepository.existsByUserIdAndRegionAndName(any(), any(), any())).thenReturn(false);
        when(housingKitRepository.findById(kitId)).thenReturn(Optional.of(kit));
        when(houseRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(mapper.toHouseResponse(any())).thenReturn(HouseResponse.builder().name("My House").capacity(4).build());

        HouseResponse response = houseService.createHouse(userId, request);

        assertThat(response.getName()).isEqualTo("My House");
        assertThat(response.getCapacity()).isEqualTo(4);
    }

    @Test
    void createHouse_duplicateName_throwsConflict() {
        CreateHouseRequest request = CreateHouseRequest.builder()
            .name("My House").region(Region.PALETTE_TOWN).houseType(HouseType.CUSTOM).build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(houseRepository.existsByUserIdAndRegionAndName(userId, Region.PALETTE_TOWN, "My House")).thenReturn(true);

        assertThatThrownBy(() -> houseService.createHouse(userId, request))
            .isInstanceOf(ConflictException.class);
    }

    @Test
    void assignPokemon_houseFull_throwsBusinessRule() {
        UUID houseId = UUID.randomUUID();
        House house = House.builder().id(houseId).user(testUser).houseType(HouseType.HABITAT)
            .region(Region.PALETTE_TOWN).name("Test").assignedPokemon(List.of(new UserPokemon())).build();

        when(houseRepository.findByIdAndUserId(houseId, userId)).thenReturn(Optional.of(house));

        assertThatThrownBy(() -> houseService.assignPokemon(houseId, UUID.randomUUID(), userId))
            .isInstanceOf(BusinessRuleException.class)
            .hasMessageContaining("capacity");
    }
}
