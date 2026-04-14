# Data Model

This document describes the entity relationships, enums, and business rules that make up the Pokopia Tracker domain model.

---

## Entity Overview

Entities are divided into three categories:

| Category | Entities | Description |
|---|---|---|
| Master Data | Pokemon, Favourite, Item, Specialty, Habitat, HousingKit | Imported from JSON source files. Read-only for normal users. Admins can reload, edit, or export. |
| User-Owned Data | User, House, UserPokemon | Created and managed by authenticated users. |
| Auth Support | RefreshToken, PasswordResetToken | Security tokens with expiration. |

All entities use **UUID** primary keys. Master data entities retain the UUID from their source JSON files (upserted by source ID). User-owned entities generate UUIDs at creation time.

---

## Master Data Entities

### Pokemon

Represents a single Pokemon species in the Pokopia world.

| Field | Type | Nullable | Notes |
|---|---|---|---|
| id | UUID (PK) | No | From source JSON |
| number | String | No | Pokedex number, e.g. `#001`. Not unique (multiple Pokemon can share a number). |
| name | String | No | Display name |
| specialties | List\<Specialty\> | Yes | ManyToMany relationship |
| idealHabitat | IdealHabitat (enum) | Yes | One of: Bright, Cool, Dark, Dry, Humid, Warm |
| litterDrop | LitterDrop (enum) | Yes | Nullable; empty string in source treated as null |
| favourites | List\<Favourite\> | Yes | ManyToMany relationship; always exactly 6 per Pokemon |
| spritePath | String | Yes | Relative path to sprite image |
| regions | List\<Region\> (enum set) | Yes | ElementCollection of Region enums |
| types | List\<PokemonType\> (enum set) | Yes | ElementCollection of PokemonType enums |
| timeOfDay | List\<String\> | Yes | Valid values: All day, Daytime, Evening, Morning, Nighttime |
| rarity | Rarity (enum) | Yes | Nullable (Ditto has null rarity) |
| isEvent | Boolean | No | Default false |
| isDitto | Boolean | No | Default false; set to true for Ditto |

**Special cases:**
- **Ditto**: `isDitto=true`, favourites list contains only the string `"none"`, rarity is null, regions list is empty. Ditto is excluded from suggestion logic.
- **Professor Tangrowth**: Present in the database but excluded from all user-facing API responses (filtered at the query/service layer).

### Favourite

Represents a favourite category that Pokemon enjoy.

| Field | Type | Nullable | Notes |
|---|---|---|---|
| id | UUID (PK) | No | From source JSON (for the 43 categories from favourites.json) or generated (for synthetic flavour favourites) |
| name | String (unique) | No | Category name, e.g. "cute stuff", "sweet flavors" |
| isFlavour | Boolean | No | Default false. True for the 5 synthetic flavour favourites. |
| items | List\<Item\> | Yes | ManyToMany relationship. Empty for flavour favourites. |

There are **43 standard favourite categories** from `favourites.json`, each with linked items. Additionally, **5 synthetic flavour favourites** are created during import:
- sweet flavors
- sour flavors
- spicy flavors
- bitter flavors
- dry flavors

Flavour favourites have `isFlavour=true` and no linked items. They appear in Pokemon favourite lists but cannot be activated through items in a house.

### Item

Represents a placeable item that can be assigned to houses.

| Field | Type | Nullable | Notes |
|---|---|---|---|
| id | UUID (PK) | No | From source JSON |
| name | String (unique) | No | Item display name |
| description | String | Yes | Item description |
| category | String | Yes | Source category (nature, furniture, kits, etc.) |
| obtainMethod | String | Yes | How the item is obtained |
| obtainDetails | String | Yes | Detailed obtain instructions |
| type | ItemType (enum) | Yes | Nullable. One of: Decoration, Food, Relaxation, Road, Toy |
| colour | String | Yes | Item colour if applicable |
| imagePath | String | Yes | Relative path to item image |
| favourites | List\<Favourite\> | Yes | ManyToMany (inverse side); which favourite categories this item activates |

**Note:** The source JSON fields `usedInHabitats` and `craftingRecipeId` are explicitly ignored during import and not present in the database.

### Specialty

Represents a Pokemon specialty/ability in Pokopia.

| Field | Type | Nullable | Notes |
|---|---|---|---|
| id | UUID (PK) | No | From source JSON |
| name | String (unique) | No | Specialty name, e.g. "Grow", "Build", "Chop" |
| description | String | Yes | What the specialty does |
| imagePath | String | Yes | Relative path to specialty icon |

### Habitat

Represents a discoverable habitat where wild Pokemon can be found. Habitats are informational master data, not user-created houses.

| Field | Type | Nullable | Notes |
|---|---|---|---|
| id | UUID (PK) | No | From source JSON |
| name | String | No | Habitat display name |
| isEvent | Boolean | No | Default false |
| pokemonIds | List\<String\> | Yes | List of Pokemon number strings (e.g. `["#001", "#004"]`). Stored as a text array. |
| imagePath | String | Yes | Relative path to habitat image |

**Important:** `pokemonIds` contains Pokemon *number* values (e.g. `#001`), not UUIDs. Because multiple Pokemon can share the same number, a single `pokemonIds` entry can map to multiple Pokemon entity rows. Resolution is done at the service layer by matching on the `number` field.

### HousingKit

Represents a buildable housing kit with predefined dimensions and capacity.

| Field | Type | Nullable | Notes |
|---|---|---|---|
| id | UUID (PK) | No | From source JSON |
| name | String (unique) | No | Kit name, e.g. "Leaf den" |
| floors | Integer | Yes | Number of floors |
| size | Integer | No | Maximum Pokemon capacity |
| width | Integer | Yes | Width in grid units |
| depth | Integer | Yes | Depth in grid units |
| height | Integer | Yes | Height in grid units |
| imagePath | String | Yes | Relative path to housing kit image |

---

## User-Owned Entities

### User

Represents a registered application user.

| Field | Type | Nullable | Notes |
|---|---|---|---|
| id | UUID (PK) | No | Generated at registration |
| username | String (unique) | No | Unique display name |
| email | String (unique) | No | Unique email address; used for login |
| passwordHash | String | No | BCrypt-hashed password |
| role | Role (enum) | No | USER or ADMIN |
| createdAt | Timestamp | No | Auto-set on creation |
| updatedAt | Timestamp | No | Auto-updated on modification |

### House

Represents a user-created house where Pokemon can be assigned.

| Field | Type | Nullable | Notes |
|---|---|---|---|
| id | UUID (PK) | No | Generated at creation |
| name | String | No | House name; unique per user within a region |
| description | String | Yes | Optional user description |
| houseType | HouseType (enum) | No | HABITAT, CUSTOM, or HOUSING_KIT |
| region | Region (enum) | No | Immutable after creation |
| idealHabitat | IdealHabitat (enum) | Yes | The habitat type assigned to this house (UI label: "Habitat") |
| maxSize | Integer | No | Computed from houseType: HABITAT=1, CUSTOM=4, HOUSING_KIT=kit.size |
| width | Integer | Yes | Editable only for CUSTOM houses |
| depth | Integer | Yes | Editable only for CUSTOM houses |
| height | Integer | Yes | Editable only for CUSTOM houses |
| housingKit | HousingKit | Yes | ManyToOne; set when houseType=HOUSING_KIT |
| habitat | Habitat | Yes | ManyToOne; set when houseType=HABITAT |
| owner | User | No | ManyToOne; the user who created this house |
| items | List\<Item\> | Yes | ManyToMany; items placed in this house |
| createdAt | Timestamp | No | Auto-set on creation |
| updatedAt | Timestamp | No | Auto-updated on modification |

**Business rules:**
- House name must be unique per user within a region.
- Region cannot be changed after creation.
- Width, depth, and height are editable only for CUSTOM houses.
- Size (maxSize) is never directly editable.
- Deleting a house makes its assigned Pokemon homeless (removes UserPokemon.house references).

### UserPokemon

Represents the relationship between a user and a Pokemon they have registered, and optionally which house the Pokemon is assigned to.

| Field | Type | Nullable | Notes |
|---|---|---|---|
| id | UUID (PK) | No | Generated |
| user | User | No | ManyToOne; the owning user |
| pokemon | Pokemon | No | ManyToOne; the registered Pokemon |
| house | House | Yes | ManyToOne; nullable. If null, the Pokemon is "homeless". |

**Constraints:**
- Unique constraint on (user, pokemon): a user can register a Pokemon only once.
- A Pokemon can be assigned to at most one house at a time (per user).
- Assigning a Pokemon to a new house automatically removes it from the previous house.
- Only registered Pokemon (those with a UserPokemon record) can be assigned to houses.

---

## Auth Entities

### RefreshToken

| Field | Type | Nullable | Notes |
|---|---|---|---|
| id | UUID (PK) | No | Generated |
| token | String (unique) | No | Opaque refresh token string |
| user | User | No | ManyToOne |
| expiryDate | Timestamp | No | When the token expires |
| createdAt | Timestamp | No | When the token was issued |

### PasswordResetToken

| Field | Type | Nullable | Notes |
|---|---|---|---|
| id | UUID (PK) | No | Generated |
| token | String (unique) | No | Opaque reset token string |
| user | User | No | ManyToOne |
| expiryDate | Timestamp | No | When the token expires |
| used | Boolean | No | Default false; set to true once consumed |

---

## Entity Relationships

### Relationship Diagram

```
Pokemon ----<ManyToMany>---- Favourite
Pokemon ----<ManyToMany>---- Specialty
Item -------<ManyToMany>---- Favourite
House ------<ManyToMany>---- Item
House ------<ManyToOne>----- HousingKit  (nullable, when houseType=HOUSING_KIT)
House ------<ManyToOne>----- Habitat     (nullable, when houseType=HABITAT)
House ------<ManyToOne>----- User        (owner)
UserPokemon <ManyToOne>----- Pokemon
UserPokemon <ManyToOne>----- User
UserPokemon <ManyToOne>----- House       (nullable)
RefreshToken <ManyToOne>---- User
PasswordResetToken <ManyToOne>-- User
```

### Join Tables

| Join Table | Left Entity | Right Entity | Notes |
|---|---|---|---|
| pokemon_favourites | Pokemon (id) | Favourite (id) | Pokemon always has exactly 6 favourites |
| pokemon_specialties | Pokemon (id) | Specialty (id) | Variable count per Pokemon |
| item_favourites | Item (id) | Favourite (id) | Links items to the favourite categories they activate |
| house_items | House (id) | Item (id) | Items placed in a house |

---

## Enums

### Region (6 values)

Derived from the `regions` field in `pokemon.json`.

| Value | Display Name |
|---|---|
| BLEAK_BEACH | Bleak Beach |
| CLOUD_ISLAND | Cloud Island |
| PALETTE_TOWN | Palette Town |
| ROCKY_RIDGES | Rocky Ridges |
| SPARKLING_SKYLANDS | Sparkling Skylands |
| WITHERED_WASTELANDS | Withered Wastelands |

### IdealHabitat (6 values)

Derived from the `idealHabitat` field in `pokemon.json`.

| Value | Display Name |
|---|---|
| BRIGHT | Bright |
| COOL | Cool |
| DARK | Dark |
| DRY | Dry |
| HUMID | Humid |
| WARM | Warm |

### HouseType (3 values)

| Value | Description |
|---|---|
| HABITAT | References a habitat record; maxSize = 1 |
| CUSTOM | User-defined dimensions; maxSize = 4 |
| HOUSING_KIT | References a housing kit; maxSize = kit.size |

### PokemonType (18 values)

| Value |
|---|
| BUG |
| DARK |
| DRAGON |
| ELECTRIC |
| FAIRY |
| FIGHTING |
| FIRE |
| FLYING |
| GHOST |
| GRASS |
| GROUND |
| ICE |
| NORMAL |
| POISON |
| PSYCHIC |
| ROCK |
| STEEL |
| WATER |

### Rarity (4 values including null)

| Value | Notes |
|---|---|
| COMMON | 175 Pokemon |
| RARE | 100 Pokemon |
| VERY_RARE | 20 Pokemon |
| *(null)* | 15 Pokemon (including Ditto) |

### LitterDrop (12 values including empty)

| Value | Display Name |
|---|---|
| FLUFF | fluff |
| HONEY | honey |
| IRON_ORE | iron ore |
| LEAF | leaf |
| NONBURNABLE_GARBAGE | nonburnable garbage |
| SMALL_LOG | small log |
| SQUISHY_CLAY | squishy clay |
| STONE | stone |
| STURDY_STICK | sturdy stick |
| TWINE | twine |
| VINE_ROPE | vine rope |
| *(null/empty)* | No litter drop |

### ItemType (6 values including null)

| Value | Description |
|---|---|
| DECORATION | Decorative items |
| FOOD | Food items |
| RELAXATION | Relaxation items |
| ROAD | Road/path items |
| TOY | Toy items |
| *(null)* | No type assigned |

### Role (2 values)

| Value | Description |
|---|---|
| USER | Standard user; can manage own data |
| ADMIN | Administrator; can manage all data and users |

---

## Computed Fields and Derived Values

### Active Favourites (House)

Active favourites for a house are **computed at query time**, never stored in the database.

**Algorithm:**
1. Collect all items assigned to the house.
2. For each non-flavour favourite category, check if any of the category's linked items appear in the house's item set.
3. If at least one item matches, that favourite category is "active" in the house.
4. Return the list of active favourite category names.

Flavour favourites (sweet/sour/spicy/bitter/dry flavors) are excluded from this computation because they have no linked items.

### House Capacity

The maximum number of Pokemon in a house is determined by the house type:

| House Type | Max Size | Source |
|---|---|---|
| HABITAT | 1 | Fixed |
| CUSTOM | 4 | Fixed |
| HOUSING_KIT | Variable (1, 2, or 4) | `housing_kit.size` at creation time |

Capacity enforcement occurs at the service layer when assigning Pokemon to houses.

### Pokemon Warning State

A warning is displayed for a Pokemon assigned to a house when **none** of that Pokemon's non-flavour favourites are active in the house. The check:

1. Get the Pokemon's favourites, excluding flavour favourites.
2. Get the house's active favourites.
3. If the intersection is empty, the Pokemon is in a warning state.

This is computed client-side for immediate UI feedback and also available via the backend API.

### Pokemon Suggestion Logic

Suggested Pokemon for a house are computed as follows:

1. If the house is full (assigned Pokemon count equals maxSize), return no suggestions.
2. Collect candidate Pokemon: all registered-but-homeless Pokemon for the user.
3. Filter candidates to those whose `idealHabitat` matches the house's `idealHabitat`.
4. If items are present in the house:
   - Compute active favourites from items.
   - Rank candidates by the number of their non-flavour favourites that overlap with the house's active favourites (descending).
5. If no items are present in the house:
   - Collect favourites from Pokemon already assigned to the house.
   - Use those favourites plus `idealHabitat` matching as the ranking criteria.
6. Exclude Ditto from suggestions.
7. Return the ranked list.

---

## Data Counts (from source JSON)

| Entity | Count |
|---|---|
| Pokemon | 310 |
| Favourite categories | 43 (+ 5 synthetic flavour favourites = 48 total) |
| Items | 1,328 |
| Habitats | 212 |
| Housing Kits | 16 |
| Specialties | 31 |
