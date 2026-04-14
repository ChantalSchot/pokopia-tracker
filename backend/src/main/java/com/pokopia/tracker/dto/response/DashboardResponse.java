package com.pokopia.tracker.dto.response;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private long totalPokemon;
    private long registeredPokemon;
    private long homelessPokemon;
    private long totalHouses;
    private long housesAtCapacity;
    private long pokemonWithWarnings;
    private List<UserPokemonResponse> recentRegistrations;
}
