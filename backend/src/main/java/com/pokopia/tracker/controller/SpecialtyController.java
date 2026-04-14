package com.pokopia.tracker.controller;

import com.pokopia.tracker.dto.response.SpecialtyResponse;
import com.pokopia.tracker.service.SpecialtyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/specialties")
@RequiredArgsConstructor
public class SpecialtyController {

    private final SpecialtyService specialtyService;

    @GetMapping
    public ResponseEntity<List<SpecialtyResponse>> getAllSpecialties() {
        return ResponseEntity.ok(specialtyService.getAllSpecialties());
    }
}
