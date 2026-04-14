package com.pokopia.tracker.domain.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum LitterDrop {
    NONE(""),
    FLUFF("fluff"),
    HONEY("honey"),
    IRON_ORE("iron ore"),
    LEAF("leaf"),
    NONBURNABLE_GARBAGE("nonburnable garbage"),
    SMALL_LOG("small log"),
    SQUISHY_CLAY("squishy clay"),
    STONE("stone"),
    STURDY_STICK("sturdy stick"),
    TWINE("twine"),
    VINE_ROPE("vine rope");

    private final String displayName;

    LitterDrop(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public static LitterDrop fromDisplayName(String name) {
        if (name == null || name.isBlank()) return NONE;
        for (LitterDrop l : values()) {
            if (l.displayName.equalsIgnoreCase(name.trim())) {
                return l;
            }
        }
        return NONE;
    }
}
