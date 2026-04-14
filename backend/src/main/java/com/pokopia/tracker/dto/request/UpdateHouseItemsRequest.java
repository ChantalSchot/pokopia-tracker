package com.pokopia.tracker.dto.request;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateHouseItemsRequest {
    private List<UUID> itemIds;
}
