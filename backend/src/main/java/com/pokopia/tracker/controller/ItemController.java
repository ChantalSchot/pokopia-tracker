package com.pokopia.tracker.controller;

import com.pokopia.tracker.domain.entity.Item;
import com.pokopia.tracker.dto.response.ItemResponse;
import com.pokopia.tracker.dto.response.PageResponse;
import com.pokopia.tracker.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @GetMapping
    public ResponseEntity<PageResponse<ItemResponse>> getAllItems(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) UUID favouriteId,
            @PageableDefault(size = 20, sort = "name") Pageable pageable) {

        Specification<Item> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (type != null && !type.isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("type")), type.toUpperCase()));
            }
            if (category != null && !category.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("category")), "%" + category.toLowerCase() + "%"));
            }
            if (name != null && !name.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
            }
            if (favouriteId != null) {
                predicates.add(cb.isMember(favouriteId, root.join("favourites").get("id")));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return ResponseEntity.ok(itemService.getAllItems(spec, pageable));
    }
}
