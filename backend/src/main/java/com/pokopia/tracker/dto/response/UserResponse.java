package com.pokopia.tracker.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private UUID id;
    private String username;
    private String email;
    private Set<String> roles;
    private boolean emailVerified;
    private LocalDateTime createdAt;
}
