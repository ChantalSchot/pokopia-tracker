package com.pokopia.tracker.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "specialties")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Specialty {
    @Id
    private UUID id;

    @Column(unique = true, nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_path", length = 500)
    private String imagePath;
}
