package com.pokopia.tracker.controller;

import com.pokopia.tracker.importer.DataImporter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/import")
@RequiredArgsConstructor
public class AdminImportController {

    private final DataImporter dataImporter;

    @PostMapping("/all")
    public ResponseEntity<String> importAll() {
        dataImporter.importAll();
        return ResponseEntity.ok("Import completed successfully");
    }

    @PostMapping("/{dataset}")
    public ResponseEntity<String> importDataset(@PathVariable String dataset) {
        dataImporter.importDataset(dataset);
        return ResponseEntity.ok("Import of " + dataset + " completed successfully");
    }
}
