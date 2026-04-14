package com.pokopia.tracker.domain.entity;

import com.pokopia.tracker.domain.enums.*;
import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity
@Table(name = "pokemon")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Pokemon {
    @Id
    private UUID id;

    @Column(nullable = false, length = 10)
    private String number;

    @Column(nullable = false, length = 200)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "ideal_habitat", length = 20)
    private IdealHabitat idealHabitat;

    @Enumerated(EnumType.STRING)
    @Column(name = "litter_drop", length = 30)
    private LitterDrop litterDrop;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Rarity rarity;

    @Column(name = "is_event")
    @Builder.Default
    private boolean isEvent = false;

    @Column(name = "is_ditto")
    @Builder.Default
    private boolean isDitto = false;

    @Column(name = "sprite_path", length = 500)
    private String spritePath;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "pokemon_types", joinColumns = @JoinColumn(name = "pokemon_id"))
    @Column(name = "type")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Set<PokemonType> types = new LinkedHashSet<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "pokemon_regions", joinColumns = @JoinColumn(name = "pokemon_id"))
    @Column(name = "region")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Set<Region> regions = new LinkedHashSet<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "pokemon_time_of_day", joinColumns = @JoinColumn(name = "pokemon_id"))
    @Column(name = "time_of_day")
    @Builder.Default
    private List<String> timeOfDay = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "pokemon_specialties",
        joinColumns = @JoinColumn(name = "pokemon_id"),
        inverseJoinColumns = @JoinColumn(name = "specialty_id")
    )
    @Builder.Default
    private Set<Specialty> specialties = new LinkedHashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "pokemon_favourites",
        joinColumns = @JoinColumn(name = "pokemon_id"),
        inverseJoinColumns = @JoinColumn(name = "favourite_id")
    )
    @Builder.Default
    private Set<Favourite> favourites = new LinkedHashSet<>();
}
