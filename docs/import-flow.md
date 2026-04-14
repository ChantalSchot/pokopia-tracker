# Pokopia Tracker — Data Import Flow

## Overview

The application imports master data from JSON files in `resources/json/` into the database. Import runs automatically on first startup (when tables are empty) and can be triggered manually via admin endpoints.

## Source Files

| File | Entity | Records |
|------|--------|---------|
| `specialties.json` | Specialty | 31 |
| `favourites.json` | Favourite | ~60 + 5 synthetic |
| `items.json` | Item | ~2100 |
| `housing-kits.json` | HousingKit | 12 |
| `habitats.json` | Habitat | ~170 |
| `pokemon.json` | Pokemon | ~350 |

## Import Order

Import order is critical due to foreign key relationships:

1. **Specialties** — No dependencies
2. **Favourites** — No dependencies; also synthesises 5 flavour favourites
3. **Items** — After favourites (for item-favourite linking)
4. **Housing Kits** — No dependencies
5. **Habitats** — No dependencies
6. **Pokemon** — After specialties and favourites (ManyToMany links)

## Import Strategy

- **Upsert by UUID**: Each JSON record has a stable UUID `id` field. Import checks for existing records by ID and updates or creates as needed.
- **Idempotent**: Running import multiple times produces the same result.
- **Transactional**: Each dataset import runs in its own transaction.

## Flavour Favourites

The JSON data references 5 flavour names that don't exist as Favourite records:
- `sweet flavors`
- `sour flavors`
- `spicy flavors`
- `bitter flavors`
- `dry flavors`

The FavouriteImporter creates these as synthetic Favourite records with `isFlavour = true` and generated UUIDs. These favourites have no item links (no items activate flavour favourites).

## Item-Favourite Linking

`favourites.json` contains `items` arrays listing item names that activate each favourite. The linking process:

1. After both items and favourites are imported, `ItemImporter.linkItemsToFavourites()` runs
2. For each favourite, iterate its `items` array
3. Normalize both the favourite's item name and the database item name using NFKD normalization
4. Match by normalized name
5. Create the ManyToMany link

### Unicode Normalization (ImportNormalizer)

```
Input:  "Poké Ball light"
NFKD:   "Poke\u0301 Ball light"  (decompose accents)
ASCII:  "Poke Ball light"         (strip combining marks)
Lower:  "poke ball light"
Trim:   "poke ball light"
```

4 items remain unmatched after normalization (all variants of "Inflatable Sudowoodo") — these are logged as WARN and skipped.

### Road/Food Item Exclusion

Items with type `ROAD` or `FOOD` are:
- **NOT** linked to favourites
- **NOT** assignable to houses
- Shown in the items page with type filters
- Excluded from house item assignment endpoints

## Ditto Special Case

Pokemon #047 (Ditto, ID: `60530198-35df-42ac-ae98-df0c0c47d509`) is the player character:

- `isDitto` flag set to `true` during import
- Favourites array `["none"]` in JSON → stored as empty favourites (no links)
- **Never** appears in suggestions
- **Excluded** from all warning logic
- Can be registered and assigned to a house (valid gameplay)
- The string `"none"` does NOT create a favourite record

## TimeOfDay Filtering

Pokemon JSON contains `timeOfDay` arrays with values that may be garbled (single chars, spaces). During import:

- Valid values: `"All day"`, `"Daytime"`, `"Evening"`, `"Morning"`, `"Nighttime"`
- Any value not in this set is filtered out
- A pokemon may end up with an empty timeOfDay list

## Admin Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/admin/import/all` | Re-import all datasets in order |
| `POST /api/admin/import/{dataset}` | Re-import a single dataset |
| `GET /api/admin/export/{dataset}` | Export current DB data as JSON |

Dataset values: `pokemon`, `items`, `favourites`, `habitats`, `housing-kits`, `specialties`

## Startup Behaviour

The `DataImporter` implements `ApplicationRunner`:
1. Checks if any master data tables have records
2. If all are empty, runs `importAll()`
3. If any have data, skips import (assumes data is already loaded)
4. Admin can manually trigger re-import at any time
