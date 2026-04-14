package com.pokopia.tracker.domain.entity;

import com.pokopia.tracker.domain.enums.*;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "houses", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "region", "name"})
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class House {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Region region;

    @Enumerated(EnumType.STRING)
    @Column(name = "house_type", nullable = false, length = 20)
    private HouseType houseType;

    @Enumerated(EnumType.STRING)
    @Column(name = "ideal_habitat", length = 20)
    private IdealHabitat idealHabitat;

    private Integer width;
    private Integer depth;
    private Integer height;
    private Integer size;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "housing_kit_id")
    private HousingKit housingKit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "habitat_ref_id")
    private Habitat habitatRef;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "house_items",
        joinColumns = @JoinColumn(name = "house_id"),
        inverseJoinColumns = @JoinColumn(name = "item_id")
    )
    @Builder.Default
    private Set<Item> items = new LinkedHashSet<>();

    @OneToMany(mappedBy = "house", fetch = FetchType.LAZY)
    @Builder.Default
    private List<UserPokemon> assignedPokemon = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public int getCapacity() {
        return switch (houseType) {
            case KIT -> housingKit != null ? housingKit.getSize() : (size != null ? size : 1);
            case HABITAT, CUSTOM -> 1;
        };
    }

    public int getOccupancy() {
        return assignedPokemon != null ? assignedPokemon.size() : 0;
    }

    public boolean isFull() {
        return getOccupancy() >= getCapacity();
    }
}
