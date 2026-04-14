package com.pokopia.tracker.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity
@Table(name = "favourites")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Favourite {
    @Id
    private UUID id;

    @Column(unique = true, nullable = false, length = 200)
    private String name;

    @Column(name = "is_flavour")
    @Builder.Default
    private boolean isFlavour = false;

    @ManyToMany(mappedBy = "favourites", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Item> items = new LinkedHashSet<>();

    @ManyToMany(mappedBy = "favourites", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Pokemon> pokemon = new LinkedHashSet<>();
}
