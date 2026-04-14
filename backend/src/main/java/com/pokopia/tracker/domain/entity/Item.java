package com.pokopia.tracker.domain.entity;

import com.pokopia.tracker.domain.enums.ItemType;
import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity
@Table(name = "items")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Item {
    @Id
    private UUID id;

    @Column(nullable = false, length = 300)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String category;

    @Column(name = "obtain_method", length = 200)
    private String obtainMethod;

    @Column(name = "obtain_details", columnDefinition = "TEXT")
    private String obtainDetails;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 20)
    @Builder.Default
    private ItemType type = ItemType.NONE;

    @Column(length = 50)
    private String colour;

    @Column(name = "image_path", length = 500)
    private String imagePath;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "item_favourites",
        joinColumns = @JoinColumn(name = "item_id"),
        inverseJoinColumns = @JoinColumn(name = "favourite_id")
    )
    @Builder.Default
    private Set<Favourite> favourites = new LinkedHashSet<>();

    public boolean isHouseAssignable() {
        return type != ItemType.ROAD && type != ItemType.FOOD;
    }
}
