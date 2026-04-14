package com.pokopia.tracker.importer;

import com.pokopia.tracker.repository.PokemonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataImporter implements ApplicationRunner {

    private final PokemonRepository pokemonRepository;
    private final SpecialtyImporter specialtyImporter;
    private final FavouriteImporter favouriteImporter;
    private final ItemImporter itemImporter;
    private final HousingKitImporter housingKitImporter;
    private final HabitatImporter habitatImporter;
    private final PokemonImporter pokemonImporter;

    @Override
    public void run(ApplicationArguments args) {
        if (pokemonRepository.count() > 0) {
            log.info("Database already populated, skipping import");
            return;
        }
        log.info("Database is empty, starting data import...");
        importAll();
    }

    public void importAll() {
        log.info("Importing specialties...");
        specialtyImporter.importData();
        log.info("Importing favourites...");
        favouriteImporter.importData();
        log.info("Importing items...");
        itemImporter.importData();
        log.info("Linking items to favourites...");
        itemImporter.linkItemsToFavourites();
        log.info("Importing housing kits...");
        housingKitImporter.importData();
        log.info("Importing habitats...");
        habitatImporter.importData();
        log.info("Importing pokemon...");
        pokemonImporter.importData();
        log.info("Data import completed successfully!");
    }

    public void importDataset(String dataset) {
        switch (dataset.toLowerCase()) {
            case "specialties" -> specialtyImporter.importData();
            case "favourites" -> {
                favouriteImporter.importData();
                itemImporter.linkItemsToFavourites();
            }
            case "items" -> {
                itemImporter.importData();
                itemImporter.linkItemsToFavourites();
            }
            case "housing-kits" -> housingKitImporter.importData();
            case "habitats" -> habitatImporter.importData();
            case "pokemon" -> pokemonImporter.importData();
            default -> throw new IllegalArgumentException("Unknown dataset: " + dataset);
        }
    }
}
