package com.pokopia.tracker.dto.response;

import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavouriteResponse {
    private UUID id;
    private String name;
    private boolean isFlavour;
}
