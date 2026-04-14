package com.pokopia.tracker.dto.response;

import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HousingKitResponse {
    private UUID id;
    private String name;
    private int floors;
    private int size;
    private int width;
    private int depth;
    private int height;
    private String imagePath;
}
