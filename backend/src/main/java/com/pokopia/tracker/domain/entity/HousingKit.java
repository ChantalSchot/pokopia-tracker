package com.pokopia.tracker.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "housing_kits")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class HousingKit {
    @Id
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false)
    private int floors;

    @Column(nullable = false)
    private int size;

    @Column(nullable = false)
    private int width;

    @Column(nullable = false)
    private int depth;

    @Column(nullable = false)
    private int height;

    @Column(name = "image_path", length = 500)
    private String imagePath;
}
