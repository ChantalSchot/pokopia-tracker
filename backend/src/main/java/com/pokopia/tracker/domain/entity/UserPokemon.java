package com.pokopia.tracker.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "user_pokemon", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "pokemon_id"})
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UserPokemon {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pokemon_id", nullable = false)
    private Pokemon pokemon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "house_id")
    private House house;

    public boolean isHomeless() {
        return house == null;
    }
}
