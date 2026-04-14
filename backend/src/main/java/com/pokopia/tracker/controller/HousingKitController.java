package com.pokopia.tracker.controller;

import com.pokopia.tracker.dto.response.HousingKitResponse;
import com.pokopia.tracker.service.HousingKitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/housing-kits")
@RequiredArgsConstructor
public class HousingKitController {

    private final HousingKitService housingKitService;

    @GetMapping
    public ResponseEntity<List<HousingKitResponse>> getAllHousingKits() {
        return ResponseEntity.ok(housingKitService.getAllHousingKits());
    }
}
