package com.pokopia.tracker.controller;

import com.pokopia.tracker.dto.request.ChangePasswordRequest;
import com.pokopia.tracker.dto.request.UpdateProfileRequest;
import com.pokopia.tracker.dto.response.UserResponse;
import com.pokopia.tracker.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(userService.getCurrentUser(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(Authentication auth,
                                                       @Valid @RequestBody UpdateProfileRequest request) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(userService.updateProfile(userId, request));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(Authentication auth,
                                                @Valid @RequestBody ChangePasswordRequest request) {
        UUID userId = (UUID) auth.getPrincipal();
        userService.changePassword(userId, request);
        return ResponseEntity.ok().build();
    }
}
