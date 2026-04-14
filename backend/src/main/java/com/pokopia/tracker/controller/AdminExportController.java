package com.pokopia.tracker.controller;

import com.pokopia.tracker.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/export")
@RequiredArgsConstructor
public class AdminExportController {

    private final ExportService exportService;

    @GetMapping("/{dataset}")
    public ResponseEntity<Object> exportDataset(@PathVariable String dataset) {
        return ResponseEntity.ok(exportService.exportDataset(dataset));
    }
}
