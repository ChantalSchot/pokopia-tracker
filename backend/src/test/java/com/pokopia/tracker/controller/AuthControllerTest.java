package com.pokopia.tracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pokopia.tracker.dto.request.RegisterRequest;
import com.pokopia.tracker.dto.response.UserResponse;
import com.pokopia.tracker.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Set;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean private AuthService authService;

    @Test
    void register_validRequest_returns201() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
            .username("testuser").email("test@test.com").password("Password1").build();
        UserResponse response = UserResponse.builder()
            .id(UUID.randomUUID()).username("testuser").email("test@test.com").roles(Set.of("USER")).build();

        when(authService.register(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    void register_missingUsername_returns400() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
            .email("test@test.com").password("Password1").build();

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }
}
