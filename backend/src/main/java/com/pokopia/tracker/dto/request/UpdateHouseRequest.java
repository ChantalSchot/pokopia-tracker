package com.pokopia.tracker.dto.request;

import com.pokopia.tracker.domain.enums.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateHouseRequest {
    @Size(max = 200)
    private String name;
    private String description;
    private IdealHabitat idealHabitat;
    private Integer width;
    private Integer depth;
    private Integer height;
    private UUID habitatRefId;
}
