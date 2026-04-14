package com.pokopia.tracker.domain.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum Rarity {
    COMMON("Common"), RARE("Rare"), VERY_RARE("Very Rare"), NONE("None");

    private final String displayName;

    Rarity(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public static Rarity fromDisplayName(String name) {
        if (name == null || name.isBlank()) return NONE;
        for (Rarity r : values()) {
            if (r.displayName.equalsIgnoreCase(name.trim())) {
                return r;
            }
        }
        return NONE;
    }
}
