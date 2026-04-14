package com.pokopia.tracker.domain.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum PokemonType {
    BUG("Bug"), DARK("Dark"), DRAGON("Dragon"), ELECTRIC("Electric"),
    FAIRY("Fairy"), FIGHTING("Fighting"), FIRE("Fire"), FLYING("Flying"),
    GHOST("Ghost"), GRASS("Grass"), GROUND("Ground"), ICE("Ice"),
    NORMAL("Normal"), POISON("Poison"), PSYCHIC("Psychic"),
    ROCK("Rock"), STEEL("Steel"), WATER("Water");

    private final String displayName;

    PokemonType(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public static PokemonType fromDisplayName(String name) {
        for (PokemonType t : values()) {
            if (t.displayName.equalsIgnoreCase(name)) {
                return t;
            }
        }
        throw new IllegalArgumentException("Unknown pokemon type: " + name);
    }
}
