package com.pokopia.tracker.dto.response;

import lombok.*;
import java.util.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitatResponse {
    private UUID id;
    private String name;
    private boolean isEvent;
    private String imagePath;
    private List<String> pokemonNumbers;
}
