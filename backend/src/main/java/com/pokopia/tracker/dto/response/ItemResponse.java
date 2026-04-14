package com.pokopia.tracker.dto.response;

import lombok.*;
import java.util.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemResponse {
    private UUID id;
    private String name;
    private String description;
    private String category;
    private String obtainMethod;
    private String obtainDetails;
    private String type;
    private String colour;
    private String imagePath;
    private List<FavouriteResponse> favourites;
}
