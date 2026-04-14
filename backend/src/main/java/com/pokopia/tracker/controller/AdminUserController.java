package com.pokopia.tracker.controller;

import com.pokopia.tracker.dto.response.PageResponse;
import com.pokopia.tracker.dto.response.UserResponse;
import com.pokopia.tracker.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<PageResponse<UserResponse>> getAllUsers(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(PageResponse.of(userService.getAllUsers(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
