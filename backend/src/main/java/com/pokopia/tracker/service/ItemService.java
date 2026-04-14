package com.pokopia.tracker.service;

import com.pokopia.tracker.domain.entity.Item;
import com.pokopia.tracker.dto.response.ItemResponse;
import com.pokopia.tracker.dto.response.PageResponse;
import com.pokopia.tracker.mapper.PokemonMapper;
import com.pokopia.tracker.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final PokemonMapper mapper;

    @Transactional(readOnly = true)
    public PageResponse<ItemResponse> getAllItems(Specification<Item> spec, Pageable pageable) {
        Page<Item> page = itemRepository.findAll(spec, pageable);
        Page<ItemResponse> responsePage = page.map(mapper::toItemResponse);
        return PageResponse.of(responsePage);
    }
}
