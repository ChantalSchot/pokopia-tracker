package com.pokopia.tracker.service;

import com.pokopia.tracker.domain.entity.User;
import com.pokopia.tracker.dto.request.ChangePasswordRequest;
import com.pokopia.tracker.dto.request.UpdateProfileRequest;
import com.pokopia.tracker.dto.response.UserResponse;
import com.pokopia.tracker.exception.BusinessRuleException;
import com.pokopia.tracker.exception.ConflictException;
import com.pokopia.tracker.exception.ResourceNotFoundException;
import com.pokopia.tracker.mapper.PokemonMapper;
import com.pokopia.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PokemonMapper mapper;

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UUID userId) {
        User user = findById(userId);
        return mapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = findById(userId);

        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new ConflictException("Username already taken");
            }
            user.setUsername(request.getUsername());
        }

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new ConflictException("Email already registered");
            }
            user.setEmail(request.getEmail());
        }

        user = userRepository.save(user);
        return mapper.toUserResponse(user);
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = findById(userId);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BusinessRuleException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(mapper::toUserResponse);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        return mapper.toUserResponse(findById(id));
    }

    @Transactional
    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", "id", id);
        }
        userRepository.deleteById(id);
    }

    public User findById(UUID id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }
}
