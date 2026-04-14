package com.pokopia.tracker.controller;

import com.pokopia.tracker.dto.response.FavouriteResponse;
import com.pokopia.tracker.service.FavouriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favourites")
@RequiredArgsConstructor
public class FavouriteController {

    private final FavouriteService favouriteService;

    @GetMapping
    public ResponseEntity<List<FavouriteResponse>> getAllFavourites() {
        return ResponseEntity.ok(favouriteService.getAllFavourites());
    }
}
