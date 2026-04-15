# AI Code Review — Implementation Gap Analysis

> The AI produced a structurally reasonable skeleton — the layered architecture is there, the routing is wired up, the entities exist. However, there are **significant gaps, wrong implementations, and missing functionality** across the codebase.

---

## 🐛 Bugs & Wrong Implementations

### 1. Custom House Capacity is 1, Not 4
The spec is explicit: **custom house capacity = 4**. The generated `House.getCapacity()` returns `1` for both `HABITAT` and `CUSTOM`:

```java
case HABITAT, CUSTOM -> 1;
```

This directly contradicts the spec and will prevent any meaningful use of custom houses.

---

### 2. Warning Logic — Incomplete / Wrong Trigger Condition
The spec states: show a warning if **none** of a Pokémon's favourites are active in the house.

The generated `computeWarning()` short-circuits with `return false` when `activeFavouriteIds.isEmpty()` — meaning if a house has no items at all, warnings are never shown. A Pokémon with no favourite match should still trigger a warning regardless. This is a **silent business rule deviation**.

---

### 3. `idealHabitat` Enum Values — Serialisation Inconsistency
- Backend `IdealHabitat` enum uses uppercase values: `BRIGHT`, `COOL`, `DARK`, etc.
- `HouseResponse` and `PokemonResponse` map `idealHabitat` using `.name()` → serialised as raw enum names (e.g. `"BRIGHT"`)
- `Region` uses a display-name approach with `@JsonValue` → serialised as `"Bleak Beach"`

**Result:** Regions render as human-readable strings; `idealHabitat` renders as raw enum identifiers. The UI will show `BRIGHT` instead of a user-friendly label.

---

### 4. `isHouseAssignable()` Uses Wrong Types
`Item.isHouseAssignable()` blocks items of type `ROAD` and `FOOD`. The spec says nothing about blocking these types from being linked to houses in the backend. This is an **invented restriction not present in the spec**.

---

## ❌ Missing Functionality

### Pokédex

| Feature | Status |
|---|---|
| Filters (type, house, specialties, litterDrop, favourites, idealHabitat, rarity, isEvent, region, house type, housing status) | ❌ Only 3 implemented (name, habitat, rarity) |
| Pokémon detail modal/dialog | ❌ Missing entirely — no `pokemon-detail-dialog` component |
| House assignment from Pokédex context | ❌ Not implemented — card only exposes register/unregister |

---

### Houses

| Feature | Status |
|---|---|
| Filter sidebar (region, habitat type, available spots, favourites) | ❌ No filter panel — plain grid only |
| Move Pokémon between houses | ❌ Not implemented |
| Items grouped by type in house detail (decoration, relaxation, toy, none) | ❌ No tab/section UI |
| Assign / remove items UI | ❌ Backend endpoint exists (`PUT /api/houses/{id}/items`), no frontend UI |
| Filter items by favourite in house items view | ❌ Completely absent |

---

### Habitats

| Feature | Status |
|---|---|
| Completion tracking (all Pokémon registered) | ❌ `HabitatResponse` has no `isCompleted` field; no status computed |
| Visual distinction for fully completed habitats | ❌ Missing |
| Filter on non-completed habitats | ❌ Missing |
| Hover/detail interaction with Pokémon sprites | ❌ Cards only show name, image, and flat list of Pokémon numbers |

---

### Dashboard
- ❌ **Homeless Pokémon grid missing** — spec requires a list/grid of registered Pokémon not assigned to any house; only a counter (`homelessPokemon` number) is shown

---

### Admin

| Feature | Status |
|---|---|
| Master data CRUD pages (pokemon, habitats, items, favourites, specialties, housing kits) | ❌ Only `AdminImportComponent` and `AdminUsersComponent` exist |
| Role management (add/remove admin role) | ❌ `AdminUsersComponent` only supports delete |
| JSON export UI | ❌ `ExportService` exists in backend; no frontend page exposes it |

---

### Profile Page
- ⚠️ **Needs verification** — `profile.component.ts` exists but likely minimal based on patterns observed elsewhere; change email / username / password UI not confirmed

---

## ⚠️ Architectural & Structural Issues

### Single Mapper for Everything
A single `PokemonMapper` class handles mapping for: `Pokemon`, `User`, `House`, `Item`, `Habitat`, `HousingKit`, `Favourite`, and `Specialty`.

> Violates separation of concerns — not consistent with a "serious, maintainable project made by an experienced engineer."

---

### No Specification/Filter Support on Key Endpoints
`PokemonService` accepts a `Specification<Pokemon>`, but with only 3 filters in the Pokédex, most of the specification logic is likely a stub or absent. Dynamic filtering for all required filter parameters is not implemented.

---

### `HouseRepository.findByUserId()` — Conflicting Return Types
- `DashboardService` calls `houseRepository.findByUserId(userId)` expecting `List<House>`
- `HouseService.getUserHouses()` calls the same method with a `Pageable`

These require **two different method signatures** in the repository. If only one is defined, one call will fail to compile.

---

### All Component Templates Are Inline
Every Angular component uses inline templates inside the `.ts` file. While technically valid, components are large enough that this makes them very hard to maintain — conflicting with the "clean, maintainable Angular architecture" requirement.

---

## 📊 Status Overview

| Area | Status |
|---|---|
| Backend structure / layering | ✅ Mostly correct |
| Auth (JWT, cookies, guards) | ✅ Implemented |
| Custom house capacity (4) | ❌ Wrong — coded as 1 |
| Warning logic correctness | ⚠️ Partially wrong |
| Pokédex filters (12+ required) | ❌ Only 3 implemented |
| Pokémon detail dialog | ❌ Missing entirely |
| House assignment from Pokédex | ❌ Missing |
| Houses filter sidebar | ❌ Missing |
| Move Pokémon between houses | ❌ Missing |
| Items management UI in house | ❌ Missing |
| Items grouped by type in house | ❌ Missing |
| Habitats completion tracking | ❌ Missing |
| Dashboard homeless Pokémon grid | ❌ Missing |
| Admin master data CRUD pages | ❌ Missing |
| Admin role management | ❌ Missing |
| Admin JSON export UI | ❌ Missing |
| Profile page functionality | ⚠️ Needs verification |

---

> The AI clearly understood the requirements in Phase 1 (the analysis was thorough) but the Phase 2 implementation cut a large number of corners — producing a functional shell while leaving out most of the application's actual business value.

-----

# Own identified issues:

### Dashboard/generic:
- logging in was supposed to be email+password, but username+password was implemented. Fix resulted in both username and email to be "correct" (yet I want *only* email).
- layout: styling is NOT even remotely the "cosy pokopia" styling/colouring
- menu (navbar) was supposed to be on top, but is now on the left side with empty bar on top (apart from profile icon)
- recent registrations is a nice feature, but these should be cards of pokemon with their sprites, same as on pokedex page

### Performance:
- static sprite loading results in A LOT of http calls constantly when going through website. Assets (sprites/images) should probably just be loaded in the front-end on startup.
- API calls with "pagination" result in constant api calls when loading pages as well. I would want pagination in the front-end, not back-end.

### Pokedex:
- Clicking pokemon doesn't work, pokemon details can't be opened/viewed
- Only two filters (habitat + rarity) are added, and name search. None of the other filters are present.
- Cards should be smaller, so at least 4 or 5 fit next to each other in the grid.
- Pokemon can't be assigned to houses here.
- idealHabitat is fully capitalised, but display text should be as in original json data: "Bright", not "BRIGHT". Same for other (enum) values
- while an outline shows whether a pokemon is registered and housed or not, there should also be (more accessible) indication of housing. I'd expect something like a house/warning icon or such (similar to the chips with either house name or "homeless" in the dashboard).

### Houses:
- Suggestions should be exactly what the word says: suggestions. Right now, it is impossible to add pokemon to a house if they're not "suggested". Users should always be able to add pokemon (from a dropdown list of registered pokemon) to houses.
- Capacity for custom houses is 1, but should be 4.
- House cards should have an image. I guess I still need to add an image for custom houses.
- It seems impossible to change a houses region right now. It should be possible, with the option to move pokemon with the house or not.
- Description of the house is not visible anywhere. Should be visible in both details and house card.
- House details is a separate page, but should be a modal.
- changes aren't updated "real time". e.g. when i remove a pokemon from a house, it doesn't update until i navigate to another page and come back.
- it's impossible to add items to houses
- all filters are missing on the houses page

### Items:
- item category should be an enum. Filter in the items page shows text field, instead of dropdown
- filter for favourites is absent

### Habitats:
- cards only show pokemon numbers of pokemon belonging to habitat. No one memorises the numbers, this should display the actual pokemon (probably "mini sprites" with or without name)
- if i register all pokemon from a habitat, the page habitat does not show whether they have been registered or not (or that i registered all pokemon from that habitat)
- no habitat details can be seen or opened

### Admin:
- Only shows 2 pages: "users" and "import"
- "users" only shows list with user info, but only allows deleting, not adding/editing users
- "import" only shows buttons to (re)import json data from master json files, but the actual functionality of these buttons is very unclear
- "export" functionality is missing
- "edit data" functionality is missing 


---

Re-run mvn test — confirm the application.properties fix lands all 3 remaining test classes green → 98/98 ✅

npm install + ng build in frontend — surface TypeScript errors

Fix frontend compile errors — align service method signatures to backend API

Docker Compose smoke test — bring up Postgres + backend, run import, verify data loads

End-to-end manual test — register user, import data, create house, assign Pokémon