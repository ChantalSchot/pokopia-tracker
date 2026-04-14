package com.pokopia.tracker.controller;

import com.pokopia.tracker.dto.response.HabitatResponse;
import com.pokopia.tracker.service.HabitatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/habitats")
@RequiredArgsConstructor
public class HabitatController {

    private final HabitatService habitatService;

    @GetMapping
    public ResponseEntity<List<HabitatResponse>> getAllHabitats() {
        return ResponseEntity.ok(habitatService.getAllHabitats());
    }
}
