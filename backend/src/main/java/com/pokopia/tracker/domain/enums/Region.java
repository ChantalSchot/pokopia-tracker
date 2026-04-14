package com.pokopia.tracker.domain.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum Region {
    BLEAK_BEACH("Bleak Beach"),
    CLOUD_ISLAND("Cloud Island"),
    PALETTE_TOWN("Palette Town"),
    ROCKY_RIDGES("Rocky Ridges"),
    SPARKLING_SKYLANDS("Sparkling Skylands"),
    WITHERED_WASTELANDS("Withered Wastelands");

    private final String displayName;

    Region(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public static Region fromDisplayName(String name) {
        for (Region r : values()) {
            if (r.displayName.equalsIgnoreCase(name)) {
                return r;
            }
        }
        throw new IllegalArgumentException("Unknown region: " + name);
    }
}
