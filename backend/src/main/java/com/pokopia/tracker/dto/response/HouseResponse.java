package com.pokopia.tracker.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HouseResponse {
    private UUID id;
    private String name;
    private String description;
    private String region;
    private String houseType;
    private String idealHabitat;
    private Integer width;
    private Integer depth;
    private Integer height;
    private int capacity;
    private int occupancy;
    private HousingKitResponse housingKit;
    private HabitatResponse habitatRef;
    private List<ItemResponse> items;
    private List<UserPokemonResponse> assignedPokemon;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
