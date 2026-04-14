package com.pokopia.tracker.dto.response;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HouseSuggestionsResponse {
    private List<PokemonResponse> suggestions;
    private int availableSlots;
}
