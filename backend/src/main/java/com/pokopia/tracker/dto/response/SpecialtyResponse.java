package com.pokopia.tracker.dto.response;

import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpecialtyResponse {
    private UUID id;
    private String name;
    private String description;
    private String imagePath;
}
