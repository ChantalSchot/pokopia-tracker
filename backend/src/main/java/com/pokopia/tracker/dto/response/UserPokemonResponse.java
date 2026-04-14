package com.pokopia.tracker.dto.response;

import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPokemonResponse {
    private UUID id;
    private UUID pokemonId;
    private String pokemonName;
    private String pokemonNumber;
    private String spritePath;
    private UUID houseId;
    private String houseName;
    private boolean homeless;
    private boolean warning;
}
