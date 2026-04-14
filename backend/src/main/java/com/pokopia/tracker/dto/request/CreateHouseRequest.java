package com.pokopia.tracker.dto.request;

import com.pokopia.tracker.domain.enums.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateHouseRequest {
    @NotBlank(message = "House name is required")
    @Size(max = 200)
    private String name;

    private String description;

    @NotNull(message = "Region is required")
    private Region region;

    @NotNull(message = "House type is required")
    private HouseType houseType;

    private IdealHabitat idealHabitat;

    private Integer width;
    private Integer depth;
    private Integer height;

    private UUID housingKitId;
    private UUID habitatRefId;
}
