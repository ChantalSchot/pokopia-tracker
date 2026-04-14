# Data Import Flow

This document describes how master data is imported from JSON source files into the Pokopia Tracker database, including import order, transformation rules, edge cases, and the admin reload mechanism.

---

## Overview

The Pokopia Tracker ships with six JSON source files containing master data for the Pokemon universe. On first application startup, if the corresponding database tables are empty, the import service automatically loads all master data. After the initial load, only administrators can trigger a data reload via the admin API.

### Source Files

| File | Location | Entity | Record Count |
|---|---|---|---|
| `specialties.json` | `resources/json/` | Specialty | 31 |
| `favourites.json` | `resources/json/` | Favourite | 43 |
| `items.json` | `resources/json/` | Item | 1,328 |
| `housing-kits.json` | `resources/json/` | HousingKit | 16 |
| `habitats.json` | `resources/json/` | Habitat | 212 |
| `pokemon.json` | `resources/json/` | Pokemon | 310 |

### Asset Folders

| Folder | Location | Contents |
|---|---|---|
| `pokemon/` | `resources/assets/` | Pokemon sprite PNGs |
| `habitats/` | `resources/assets/` | Habitat image PNGs |
| `housing-kits/` | `resources/assets/` | Housing kit image PNGs |
| `items/` | `resources/assets/` | Item image PNGs |
| `specialties/` | `resources/assets/` | Specialty icon PNGs |

Asset file paths stored in the database (e.g. `assets/pokemon/1-bulbasaur.png`) are relative paths. The backend serves these files from a configurable `ASSETS_PATH` directory via a Spring resource handler mapped to `/assets/**`.

---

## Import Order

Imports must be executed in dependency order. Entities that are referenced by other entities must be imported first.

```
1. specialties       (no dependencies)
2. favourites        (no dependencies, plus synthetic flavour favourites)
3. items             (depends on favourites for item-favourite linking)
4. housing-kits      (no dependencies)
5. habitats          (no dependencies; pokemonIds are stored as strings, resolved at query time)
6. pokemon           (depends on specialties and favourites for ManyToMany relationships)
```

### Step-by-Step Import Process

#### Step 1: Import Specialties

- **Source**: `specialties.json`
- **Strategy**: Upsert by source UUID (`id` field)
- **Fields mapped**:

| JSON Field | Entity Field | Notes |
|---|---|---|
| `id` | id | UUID primary key |
| `name` | name | Unique |
| `description` | description | |
| `imagePath` | imagePath | Stored as-is |

- **Transformation**: None required. Direct field mapping.

#### Step 2: Import Favourites

- **Source**: `favourites.json`
- **Strategy**: Upsert by source UUID (`id` field)
- **Fields mapped**:

| JSON Field | Entity Field | Notes |
|---|---|---|
| `id` | id | UUID primary key |
| `name` | name | Unique |
| `items` | *(used in Step 3)* | Item names for linking; not stored directly on the Favourite entity |

- **Post-import -- Synthesize Flavour Favourites**: Create 5 flavour favourite records that do not exist in the source JSON:

| Name | isFlavour |
|---|---|
| sweet flavors | true |
| sour flavors | true |
| spicy flavors | true |
| bitter flavors | true |
| dry flavors | true |

These are generated with deterministic UUIDs (using `UUID.nameUUIDFromBytes(name.getBytes())` to remain stable across reimports). The `isFlavour` flag is set to `true`. They have no linked items.

These flavour favourites exist because every Pokemon has exactly 6 favourites, and one of those 6 is always a flavour favourite. Flavour favourites represent in-game food preferences that cannot be activated through static item placement.

#### Step 3: Import Items

- **Source**: `items.json`
- **Strategy**: Upsert by source UUID (`id` field)
- **Fields mapped**:

| JSON Field | Entity Field | Notes |
|---|---|---|
| `id` | id | UUID primary key |
| `name` | name | Unique |
| `description` | description | |
| `category` | category | String (nature, furniture, kits, etc.) |
| `obtainMethod` | obtainMethod | |
| `obtainDetails` | obtainDetails | |
| `type` | type | Mapped to ItemType enum: Decoration, Food, Relaxation, Road, Toy, or null |
| `colour` | colour | |
| `imagePath` | imagePath | |

- **Ignored fields**: `usedInHabitats` and `craftingRecipeId` are explicitly excluded from the data model and not imported.

- **Item-Favourite Linking**: After all items are imported, the importer processes each favourite category from `favourites.json` and links items to favourites using the `items` array (list of item names) on each favourite record.

  **Unicode Normalization for Matching**: Item names in `favourites.json` may use different Unicode representations than those in `items.json` (e.g. non-breaking spaces, accented characters). To ensure reliable matching, the importer applies the following normalization pipeline to both sides before comparison:

  1. **NFKD normalization** -- decomposes characters into base + combining marks
  2. **Strip non-ASCII** -- removes diacritics and special combining characters
  3. **Lowercase** -- case-insensitive matching
  4. **Trim** -- removes leading/trailing whitespace

  Example:
  ```
  Input:  "Chansey\u00a0plant"      (non-breaking space)
  NFKD:   "Chansey plant"           (NBSP becomes regular space)
  ASCII:  "chansey plant"
  Result: matches "Chansey plant" from items.json
  ```

  A small number of items (e.g. variants of "Inflatable Sudowoodo") may remain unmatched after normalization. These are logged as warnings and skipped.

#### Step 4: Import Housing Kits

- **Source**: `housing-kits.json`
- **Strategy**: Upsert by source UUID (`id` field)
- **Fields mapped**:

| JSON Field | Entity Field | Notes |
|---|---|---|
| `id` | id | UUID primary key |
| `name` | name | Unique |
| `floors` | floors | |
| `size` | size | Maximum Pokemon capacity (1, 2, or 4) |
| `width` | width | |
| `depth` | depth | |
| `height` | height | |
| `imagePath` | imagePath | |

#### Step 5: Import Habitats

- **Source**: `habitats.json`
- **Strategy**: Upsert by source UUID (`id` field)
- **Fields mapped**:

| JSON Field | Entity Field | Notes |
|---|---|---|
| `id` | id | UUID primary key |
| `name` | name | |
| `isEvent` | isEvent | |
| `pokemonIds` | pokemonIds | Stored as a text array of Pokemon number strings (e.g. `["#001", "#004"]`) |
| `imagePath` | imagePath | |

- **Important**: `pokemonIds` contains Pokemon *number* values (e.g. `#001`), not UUIDs. The resolution from number to Pokemon entities happens at the service/query layer, not during import. This supports the fact that multiple Pokemon can share the same number (one-to-many mapping from a single pokemonId entry to multiple Pokemon rows).

#### Step 6: Import Pokemon

- **Source**: `pokemon.json`
- **Strategy**: Upsert by source UUID (`id` field)
- **Fields mapped**:

| JSON Field | Entity Field | Notes |
|---|---|---|
| `id` | id | UUID primary key |
| `number` | number | String, e.g. `#001`. Not unique across Pokemon. |
| `name` | name | |
| `specialties` | specialties | ManyToMany; resolved by matching specialty names to Specialty entities |
| `idealHabitat` | idealHabitat | Mapped to IdealHabitat enum (Bright, Cool, Dark, Dry, Humid, Warm) |
| `litterDrop` | litterDrop | Mapped to LitterDrop enum; empty string treated as null |
| `favourites` | favourites | ManyToMany; resolved by matching favourite names to Favourite entities |
| `spritePath` | spritePath | |
| `regions` | regions | ElementCollection of Region enums; matched by name |
| `types` | types | ElementCollection of PokemonType enums; matched by name |
| `timeOfDay` | timeOfDay | Stored as text array after filtering (see below) |
| `rarity` | rarity | Mapped to Rarity enum; null remains null |
| `isEvent` | isEvent | |

### Ditto Handling

Pokemon #047 (Ditto, id: `60530198-35df-42ac-ae98-df0c0c47d509`) is a special case:

- Source JSON has `favourites: ["none"]`
- During import, `isDitto` flag is set to `true`
- The string `"none"` does NOT create a favourite record
- Favourites ManyToMany link is left empty (no linked favourites)
- Ditto has `rarity: null` and `regions: []` (empty)
- Ditto is kept in the database and can be registered/assigned to houses
- Ditto is excluded from all suggestion logic
- Ditto is excluded from warning computations (no favourites to match against)

### TimeOfDay Filtering

The source data contains some corrupted or garbled `timeOfDay` values. During import, only the following valid values are retained:

| Valid Values |
|---|
| All day |
| Daytime |
| Evening |
| Morning |
| Nighttime |

Any value not in this set (including single characters like `"A"`, `"d"`, `"l"`, `"y"`, whitespace-only strings, etc.) is silently discarded. A Pokemon may end up with an empty `timeOfDay` list after filtering.

### Professor Tangrowth

The Pokemon named "Tangrowth" (id: `733ae119-0e4f-4c29-8436-02f073901892`) is imported into the database but excluded from all user-facing (non-admin) API responses. This is enforced at the service layer by filtering queries on the `name` field. Admins can still view and manage this record.

---

## Upsert Strategy

All imports use an **upsert by source UUID** strategy:

1. For each record in the JSON file, check if an entity with the same `id` (UUID) already exists in the database.
2. If it exists, update all mutable fields to match the JSON source.
3. If it does not exist, insert a new record with the source UUID as primary key.
4. Records in the database that are not present in the JSON source are **not deleted** during reimport. This prevents accidental data loss if a JSON file is temporarily incomplete or if admins have added custom records.

This strategy is safe for repeated execution and preserves admin-added records.

---

## Startup Auto-Import

On application startup, the import service (implementing `ApplicationRunner`) checks whether master data tables are empty:

```
IF pokemon table is empty THEN
    run full importAll() in dependency order
ELSE
    skip auto-import (data already loaded)
END IF
```

The check uses the Pokemon table as the sentinel because it is the last table imported and depends on all others. If Pokemon data exists, all prerequisite data must also exist.

---

## Admin Reload Endpoints

Administrators can trigger a full or partial reimport via the API:

| Endpoint | Description |
|---|---|
| `POST /api/admin/import/all` | Reimport all datasets in dependency order |
| `POST /api/admin/import/specialties` | Reimport specialties only |
| `POST /api/admin/import/favourites` | Reimport favourites + resync flavour favourites |
| `POST /api/admin/import/items` | Reimport items + relink to favourites |
| `POST /api/admin/import/housing-kits` | Reimport housing kits only |
| `POST /api/admin/import/habitats` | Reimport habitats only |
| `POST /api/admin/import/pokemon` | Reimport pokemon + relink specialties and favourites |

Each reload endpoint returns an `ImportResultResponse` with counts:

```json
{
  "dataset": "pokemon",
  "inserted": 5,
  "updated": 300,
  "skipped": 5,
  "errors": [],
  "durationMs": 1234
}
```

**Caution**: Reloading a dataset that other datasets depend on (e.g. favourites before items, or specialties before pokemon) may leave dangling references. The `import/all` endpoint handles this automatically by importing in the correct dependency order.

---

## Admin JSON Export

Administrators can export the current database state as JSON files that follow the same structure as the source JSON:

| Endpoint | Output |
|---|---|
| `GET /api/admin/export/pokemon` | JSON array of all Pokemon in source-compatible format |
| `GET /api/admin/export/favourites` | JSON array of all non-flavour favourites with item name lists |
| `GET /api/admin/export/items` | JSON array of all items (excluding `usedInHabitats` and `craftingRecipeId`) |
| `GET /api/admin/export/habitats` | JSON array of all habitats with pokemonIds as number strings |
| `GET /api/admin/export/housing-kits` | JSON array of all housing kits |
| `GET /api/admin/export/specialties` | JSON array of all specialties |

Exported JSON follows the same structure as the source JSON files, enabling round-trip import/export workflows.

---

## Asset Handling

### Serving Strategy

Static assets are served by the Spring Boot backend from a configurable filesystem path:

1. The `ASSETS_PATH` environment variable points to the root directory containing asset folders.
2. A Spring `WebMvcConfigurer` adds a resource handler mapping `/assets/**` to `file:${ASSETS_PATH}/`.
3. Frontend image elements reference assets via relative URLs (e.g. `/assets/pokemon/1-bulbasaur.png`).

### Docker Asset Mounting

In Docker deployments, the `resources/assets/` directory is mounted read-only into the backend container:

```yaml
backend:
  volumes:
    - ./resources/assets:/app/resources/assets:ro
```

### Image Path Conventions

Asset paths in the database follow patterns from the source JSON:

| Entity | Path Pattern | Example |
|---|---|---|
| Pokemon sprites | `assets/pokemon/<num>-<name>.png` | `assets/pokemon/1-bulbasaur.png` |
| Habitat images | `assets/habitats/<id>-<slug>.png` | `assets/habitats/1-tall-grass.png` |
| Housing kit images | `assets/housing-kits/<slug>.png` | `assets/housing-kits/leafden.png` |
| Item images | `assets/items/<num>-<slug>.png` | `assets/items/1-abandoned-power-plant-kit.png` |
| Specialty icons | `assets/specialties/<slug>.png` | `assets/specialties/grow.png` |

Paths are stored exactly as they appear in the source JSON. No path normalization is performed during import.

---

## Error Handling During Import

| Scenario | Behavior |
|---|---|
| Missing JSON file | Import fails for that dataset with a descriptive error. Other datasets are not affected. |
| Malformed JSON | Import fails for that dataset. A parse error is logged and returned in the response. |
| Unknown enum value | Record logged as warning; field set to null rather than failing the entire import. |
| Duplicate names | Last-write-wins within a single import batch. |
| Missing references | Link silently skipped; warning logged. Occurs when specialties/favourites not imported before pokemon. |
| Database constraint violation | Transaction rolled back for that dataset; error returned in response. |
