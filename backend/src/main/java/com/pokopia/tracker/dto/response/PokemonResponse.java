package com.pokopia.tracker.dto.response;

import lombok.*;
import java.util.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PokemonResponse {
    private UUID id;
    private String number;
    private String name;
    private String idealHabitat;
    private String litterDrop;
    private String rarity;
    private boolean isEvent;
    private boolean isDitto;
    private String spritePath;
    private Set<String> types;
    private Set<String> regions;
    private List<String> timeOfDay;
    private List<SpecialtyResponse> specialties;
    private List<FavouriteResponse> favourites;
}
