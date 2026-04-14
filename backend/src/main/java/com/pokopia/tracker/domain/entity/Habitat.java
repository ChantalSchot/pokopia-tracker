package com.pokopia.tracker.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity
@Table(name = "habitats")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Habitat {
    @Id
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "is_event")
    @Builder.Default
    private boolean isEvent = false;

    @Column(name = "image_path", length = 500)
    private String imagePath;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "habitat_pokemon_numbers", joinColumns = @JoinColumn(name = "habitat_id"))
    @Column(name = "pokemon_number")
    @Builder.Default
    private List<String> pokemonNumbers = new ArrayList<>();
}
