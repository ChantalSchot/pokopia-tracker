package com.pokopia.tracker.dto.request;

import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignPokemonRequest {
    private UUID houseId;
}
