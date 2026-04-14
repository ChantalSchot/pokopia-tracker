package com.pokopia.tracker.domain.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ItemType {
    DECORATION("Decoration"),
    FOOD("Food"),
    RELAXATION("Relaxation"),
    ROAD("Road"),
    TOY("Toy"),
    NONE("None");

    private final String displayName;

    ItemType(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public static ItemType fromDisplayName(String name) {
        if (name == null || name.isBlank()) return NONE;
        for (ItemType t : values()) {
            if (t.displayName.equalsIgnoreCase(name.trim())) {
                return t;
            }
        }
        return NONE;
    }
}
