package com.pokopia.tracker.dto.request;

import com.pokopia.tracker.domain.enums.Region;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangeHouseRegionRequest {
    @NotNull(message = "New region is required")
    private Region newRegion;

    private List<UUID> pokemonIdsToMove;
}
