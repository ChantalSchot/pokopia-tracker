# Claude Prompt: Generate `pokopia-housing-planner` Repository

---

## Overview

You are generating a complete, production-ready code repository called **`pokopia-housing-planner`** — a full-stack web application for planning and managing Pokémon housing in the Pokopia game world.

Read this entire prompt carefully before writing any code. Every section contains requirements you must implement.

---

## Project Summary

Pokopia Housing Planner allows users to:
- Track which Pokémon they have registered
- Create and manage houses (custom, habitat, or from housing kits) across areas
- Assign Pokémon and items to houses
- See which "favourite" categories are active in each house based on its items
- Get suggestions for Pokémon that would be happy in a given house
- Plan and organise their Pokémon placements based on type compatibility and favourite categories

---

## Technical Stack

| Layer | Technology |
|---|---|
| Database | PostgreSQL |
| Back-end | Java 21 + Spring Boot 3.x (Spring Data JPA, Spring Security, Spring Web) |
| Front-end | Angular 17+ with Angular Material |
| Build | Maven (back-end), Angular CLI (front-end) |
| Auth | JWT-based authentication |
| API | RESTful JSON API |

---

## Repository Structure

Generate a monorepo with the following structure:

```
pokopia-housing-planner/
├── README.md
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/pokopia/housingplanner/
│       │   │   ├── HousingPlannerApplication.java
│       │   │   ├── config/
│       │   │   │   ├── SecurityConfig.java
│       │   │   │   └── JwtConfig.java
│       │   │   ├── controller/
│       │   │   │   ├── AuthController.java
│       │   │   │   ├── UserController.java
│       │   │   │   ├── PokemonController.java
│       │   │   │   ├── HouseController.java
│       │   │   │   ├── HabitatController.java
│       │   │   │   ├── HousingKitController.java
│       │   │   │   ├── ItemController.java
│       │   │   │   └── FavouriteController.java
│       │   │   ├── dto/
│       │   │   │   ├── request/
│       │   │   │   └── response/
│       │   │   ├── entity/
│       │   │   │   ├── User.java
│       │   │   │   ├── Pokemon.java
│       │   │   │   ├── House.java
│       │   │   │   ├── Habitat.java
│       │   │   │   ├── HousingKit.java
│       │   │   │   ├── Item.java
│       │   │   │   └── FavouriteCategory.java
│       │   │   ├── repository/
│       │   │   ├── service/
│       │   │   └── security/
│       │   └── resources/
│       │       ├── application.yml
│       │       └── db/migration/  (Flyway SQL scripts)
│       └── test/
└── frontend/
    ├── angular.json
    ├── package.json
    └── src/
        ├── app/
        │   ├── core/           (auth, guards, interceptors, services)
        │   ├── shared/         (reusable components, pipes, directives)
        │   ├── features/
        │   │   ├── auth/
│       │   │   ├── dashboard/
│       │   │   ├── pokedex/
│       │   │   ├── pokemon-detail/
│       │   │   ├── houses/
│       │   │   └── house-detail/
│       │   └── app.routes.ts
│       └── assets/
│           ├── pokemon-assets/   (PNG sprites)
│           ├── habitat-assets/   (PNG images)
│           ├── housing-assets/   (PNG images)
│           └── item-assets/      (PNG images)
```

---

## Data Models

### Source JSON Files (provided as seed data)

The following JSON files are the seed data source. Implement Flyway migration scripts that import this data on first run.

#### `pokemon.json` — Each Pokémon object:

```json
{
  "id": "uuid-string",
  "number": "#001",
  "name": "Bulbasaur",
  "abilities": ["Grow"],
  "idealHabitat": "Bright",
  "litterDrop": "leaf",
  "favourites": ["lots of nature", "soft stuff", "cute stuff", "lots of water", "group activities", "sweet flavors"],
  "spritePath": "assets/pokemon-assets/1-bulbasaur.png",
  "areas": ["Bleak Beach", "Cloud Island", "Palette Town", "Rocky Ridges", "Sparkling Skylands", "Withered Wastelands"],
  "types": ["Grass", "Poison"],
  "timeOfDay": ["All day"],
  "rarity": "Common",
  "isEvent": false
}
```

#### `habitats.json` — Each habitat object:

```json
{
  "id": 1,
  "name": "Tall Grass",
  "slug": "tall-grass",
  "isEvent": false,
  "pokemonIds": [1, 4, 6, 7, 13, 159],
  "imagePath": "assets/habitat-assets/1-tall-grass.png"
}
```

> Note: `pokemonIds` in habitats refers to the Pokémon's sequential number (e.g., 1 = Bulbasaur), NOT the UUID `id` field. Map accordingly.

#### `housing-kits.json` — Each housing kit object:

```json
{
  "name": "Leaf den",
  "floors": 1,
  "size": 1,
  "width": 2,
  "depth": 2,
  "height": 1,
  "imagePath": "assets/housing-assets/leafden.png"
}
```

> The `size` field represents the **maximum number of Pokémon** that can be assigned to a house built from this kit.

#### `items.json` — Each item object has at minimum:

```json
{
  "name": "Berry chair",
  "imagePath": "assets/item-assets/berry-chair.png",
  "type": "decoration"
}
```

> Item `type` is one of: `"decoration"`, `"relaxation"`, `"toy"`, or `null` (no type). Store this as an enum in the database.

#### `favourites.json` — Each favourite category:

```json
{
  "name": "cute stuff",
  "items": ["Berry chair", "Stylish stool", "Cute sofa", ...]
}
```

> A favourite category is a named list of item names. When items are assigned to a house, the house's active favourite categories are computed from the union of categories whose item lists intersect with the house's items.

---

## Database Schema

### PostgreSQL Tables

Implement the following entities. Use Flyway for schema migration (`V1__init.sql`, `V2__seed_data.sql`, etc.).

#### `users`

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | generated |
| username | VARCHAR UNIQUE NOT NULL | |
| email | VARCHAR UNIQUE NOT NULL | |
| password_hash | VARCHAR NOT NULL | BCrypt |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### `pokemon`

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | from seed data |
| number | VARCHAR | e.g. "#001" |
| name | VARCHAR NOT NULL | |
| abilities | TEXT[] | PostgreSQL array |
| ideal_habitat | VARCHAR | |
| litter_drop | VARCHAR | nullable |
| favourites | TEXT[] | list of favourite category names |
| sprite_path | VARCHAR | |
| areas | TEXT[] | list of area names |
| types | TEXT[] | |
| time_of_day | TEXT[] | |
| rarity | VARCHAR | |
| is_event | BOOLEAN DEFAULT false | |

#### `habitats`

| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| name | VARCHAR NOT NULL | |
| slug | VARCHAR UNIQUE | |
| is_event | BOOLEAN DEFAULT false | |
| pokemon_numbers | INTEGER[] | sequential Pokémon numbers |
| image_path | VARCHAR | |

#### `housing_kits`

| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| name | VARCHAR UNIQUE NOT NULL | |
| floors | INTEGER | |
| size | INTEGER | max Pokémon capacity |
| width | INTEGER | |
| depth | INTEGER | |
| height | INTEGER | |
| image_path | VARCHAR | |

#### `items`

| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| name | VARCHAR UNIQUE NOT NULL | |
| image_path | VARCHAR | |
| type | item_type ENUM | decoration, relaxation, toy, or null |

#### `favourite_categories`

| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| name | VARCHAR UNIQUE NOT NULL | |

#### `favourite_category_items`

| Column | Type | Notes |
|---|---|---|
| favourite_category_id | INTEGER FK | |
| item_name | VARCHAR | item name reference |

#### `houses`

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | generated |
| name | VARCHAR NOT NULL | |
| house_type | house_type ENUM | `custom`, `habitat`, `kit` |
| area | VARCHAR NOT NULL | must be a valid area name |
| max_size | INTEGER NOT NULL | 4 for custom, 1 for habitat, kit.size for kit-based |
| housing_kit_id | INTEGER FK nullable | set when house_type = 'kit' |
| habitat_id | INTEGER FK nullable | set when house_type = 'habitat' |
| created_by | UUID FK | references users.id |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### `user_registered_pokemon`

| Column | Type | Notes |
|---|---|---|
| user_id | UUID FK | |
| pokemon_id | UUID FK | |
| PRIMARY KEY | (user_id, pokemon_id) | |

#### `house_pokemon`

| Column | Type | Notes |
|---|---|---|
| house_id | UUID FK | |
| pokemon_id | UUID FK | |
| PRIMARY KEY | (house_id, pokemon_id) | |

> Enforce max_size constraint at service layer: count existing assignments and reject if already at capacity.

#### `house_items`

| Column | Type | Notes |
|---|---|---|
| house_id | UUID FK | |
| item_id | INTEGER FK | |
| PRIMARY KEY | (house_id, item_id) | |

---

## Valid Areas

The following are the only valid area names (derived from Pokémon seed data):

- `Bleak Beach`
- `Cloud Island`
- `Palette Town`
- `Rocky Ridges`
- `Sparkling Skylands`
- `Withered Wastelands`

Store these as a database table `areas` or as an application-level enum/constant. Houses must be assigned to one of these areas.

---

## Business Logic

### House Capacity Rules

| House Type | Max Pokémon (max_size) |
|---|---|
| `habitat` | Always 1 |
| `custom` | Always 4 |
| `kit` | `housing_kit.size` (1, 2, or 4 depending on kit) |

### Favourite Categories in a House

When items are assigned to a house, compute the house's active favourite categories as follows:
- For each `FavouriteCategory`, check if **any** of its items appear in the house's item list
- If yes, that category is "present" in the house
- Return the list of present favourite category names

Implement this as a computed method in `HouseService.getActiveFavourites(houseId)`.

### Pokémon Suggestion Logic

For a given house, suggest registered (but un-housed) Pokémon that would be a good fit:
- Pokémon whose `favourites` array contains **at least one** of the house's active favourite categories
- Sort by number of matching favourite categories (descending)
- Exclude Pokémon already assigned to a house

### Registered vs. Housed

- A Pokémon is **registered** when it appears in `user_registered_pokemon` for that user
- A Pokémon is **housed** when it appears in `house_pokemon` for a house owned by that user
- **Homeless** = registered but not housed

---

## REST API Endpoints

### Auth

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/logout` | Invalidate token (client-side) |

### User

| Method | Path | Description |
|---|---|---|
| GET | `/api/users/me` | Get current user details |
| PUT | `/api/users/me` | Update name, email, password |

### Pokémon

| Method | Path | Description |
|---|---|---|
| GET | `/api/pokemon` | List all Pokémon (supports filtering & sorting) |
| GET | `/api/pokemon/{id}` | Get single Pokémon detail |
| POST | `/api/pokemon/{id}/register` | Toggle registered status for current user |

**Filtering query params for `GET /api/pokemon`:**
- `type` — filter by type (e.g. `Fire`, `Water`)
- `rarity` — filter by rarity
- `area` — filter by area
- `ability` — filter by ability name
- `favourite` — filter by favourite category name
- `isEvent` — boolean
- `idealHabitat` — filter by ideal habitat
- `timeOfDay` — filter by time of day
- `assignedHouseId` — filter by house UUID (shows Pokémon assigned to that house)
- `registered` — boolean, filter to only registered Pokémon
- `homeless` — boolean, filter to registered but unhoused
- `sort` — field to sort by (e.g. `name`, `number`, `rarity`)
- `direction` — `asc` or `desc`
- `page`, `size` — pagination

### Houses

| Method | Path | Description |
|---|---|---|
| GET | `/api/houses` | List all houses for current user (supports filtering) |
| POST | `/api/houses` | Create a new house |
| GET | `/api/houses/{id}` | Get house detail (incl. items, Pokémon, active favourites) |
| PUT | `/api/houses/{id}` | Update house name or area |
| DELETE | `/api/houses/{id}` | Delete house (makes Pokémon homeless) |
| POST | `/api/houses/{id}/pokemon/{pokemonId}` | Assign Pokémon to house |
| DELETE | `/api/houses/{id}/pokemon/{pokemonId}` | Remove Pokémon from house |
| POST | `/api/houses/{id}/items/{itemId}` | Add item to house |
| DELETE | `/api/houses/{id}/items/{itemId}` | Remove item from house |
| GET | `/api/houses/{id}/suggestions` | Get Pokémon suggestions for this house |

**Filtering query params for `GET /api/houses`:**
- `area` — filter by area name
- `hasAvailableSpots` — boolean, only show houses with open slots
- `favourite` — filter by active favourite category name

### Reference Data (read-only)

| Method | Path | Description |
|---|---|---|
| GET | `/api/habitats` | List all habitats |
| GET | `/api/habitats/{id}` | Get single habitat |
| GET | `/api/housing-kits` | List all housing kits |
| GET | `/api/items` | List all items (supports filter by type) |
| GET | `/api/favourites` | List all favourite categories |
| GET | `/api/areas` | List all valid areas |

---

## Security

- Use Spring Security with JWT (e.g. `io.jsonwebtoken:jjwt`)
- All `/api/**` endpoints require authentication except `/api/auth/**`
- Users can only manage their own registered Pokémon and their own houses
- Validate ownership in service layer (throw `403 Forbidden` if user does not own the resource)
- Store passwords with BCrypt

---

## Frontend — Angular

### Angular Material Theme

Use Angular Material with a **custom Pokopia-style theme**. The design language should feel like a clean, modern Pokémon companion app: warm greens, soft teals, gentle yellows as accent. Avoid purple/blue AI-template aesthetics.

**Custom SCSS theme:**

```scss
// _pokopia-theme.scss
@use '@angular/material' as mat;

$pokopia-primary: mat.define-palette(mat.$teal-palette, 700, 400, 900);
$pokopia-accent: mat.define-palette(mat.$light-green-palette, 600);
$pokopia-warn: mat.define-palette(mat.$deep-orange-palette);

$pokopia-theme: mat.define-light-theme((
  color: (
    primary: $pokopia-primary,
    accent: $pokopia-accent,
    warn: $pokopia-warn,
  ),
  typography: mat.define-typography-config(
    $font-family: "'Nunito', 'Roboto', sans-serif"
  ),
  density: 0,
));

// Also define a dark theme variant:
$pokopia-dark-theme: mat.define-dark-theme((
  color: (
    primary: $pokopia-primary,
    accent: $pokopia-accent,
    warn: $pokopia-warn,
  ),
));
```

Load `Nunito` from Google Fonts. Include a dark mode toggle that stores preference in `localStorage`.

### Pages & Routes

| Route | Component | Description |
|---|---|---|
| `/login` | `AuthLoginComponent` | Login form |
| `/register` | `AuthRegisterComponent` | Registration form |
| `/dashboard` | `DashboardComponent` | Overview page (guarded) |
| `/pokedex` | `PokedexComponent` | Full Pokémon list with filters |
| `/pokedex/:id` | `PokemonDetailComponent` | Single Pokémon detail |
| `/houses` | `HousesComponent` | Houses list with filters |
| `/houses/new` | `HouseFormComponent` | Create house form |
| `/houses/:id` | `HouseDetailComponent` | House detail, items, assigned Pokémon |
| `/houses/:id/edit` | `HouseFormComponent` | Edit house |
| `/profile` | `ProfileComponent` | User profile settings |

All routes except `/login` and `/register` are protected by an `AuthGuard`.

### Dashboard Page

Display:
- Total number of Pokémon in the database
- Number registered by the current user (with a progress chip: "X / Total")
- Number of registered Pokémon currently housed
- A scrollable list/grid of **homeless** Pokémon (registered but not in any house), showing sprite image, name, number, and types as chips

### Pokédex Page

- Display all Pokémon in a responsive grid of cards (3 columns desktop, 2 tablet, 1 mobile)
- Each card shows: sprite image, number, name, type chips, rarity badge, a "registered" toggle
- Implement a collapsible filter sidebar with:
  - Type multi-select
  - Rarity multi-select
  - Area multi-select
  - Ability text input
  - Favourite category multi-select
  - Ideal habitat select
  - Time of day select
  - Toggle: "Only registered"
  - Toggle: "Only homeless"
  - Toggle: "Include events"
- Sort controls: sort by name / number / rarity, ascending / descending
- Paginated results (Angular Material paginator)
- Clicking a card navigates to the detail page

### Pokémon Detail Page

Display all Pokémon properties:
- Large sprite image (or placeholder if `spritePath` is empty)
- Name, number, types (as chips), rarity badge, `isEvent` indicator
- Abilities list
- Ideal habitat, time of day
- Litter drop (if present)
- Areas where found (as chips)
- Favourites list (as chips) with a note explaining what each favourite means
- Current house assignment (if any), with a link to the house
- Registered toggle button

### Houses Page

- Grid of house cards (2 columns desktop, 1 mobile)
- Each card shows: house name, type badge, area, capacity indicator ("2 / 4 Pokémon"), active favourite category chips, Pokémon sprite thumbnails
- Filter bar:
  - Area filter (chip group)
  - "Has available spots" toggle
  - Favourite category multi-select
- "Create House" FAB button

### House Detail Page

Tabs or sections:

1. **Info** — Name, type, area, kit/habitat name (if applicable), capacity, image of kit/habitat
2. **Pokémon** — List of assigned Pokémon (sprite + name + types). "Remove" button per Pokémon. "Add Pokémon" button opens a dialog to search and assign a registered homeless Pokémon.
3. **Items** — Grid of assigned items with image, name, type chip. "Remove" button per item. "Add Item" button opens a searchable dialog of all items.
4. **Active Favourites** — Chips showing which favourite categories are currently active based on assigned items.
5. **Suggestions** — A list of suggested registered-but-homeless Pokémon sorted by number of matching favourites. Each shows name, sprite, type chips, and matching favourites highlighted.

### Create/Edit House Form

Fields:
- Name (text input, required)
- House type: radio group (`Custom`, `Habitat`, `Housing Kit`)
- Area: select from valid areas
- If type = `Habitat`: show a searchable mat-select of all habitats (show habitat name + image)
- If type = `Housing Kit`: show a searchable mat-select of all housing kits (show kit name, size, image)
- Custom and Habitat types have fixed capacities (4 and 1). Kit type shows the `size` from the selected kit.

### Accessibility (WCAG 2.1 AA)

Implement throughout the entire application:
- All images have meaningful `alt` attributes (or `alt=""` for decorative)
- All form fields have associated `<label>` elements (Angular Material handles this for mat-form-field)
- Color is never the sole means of conveying information — pair colors with text or icons
- All interactive elements are keyboard-accessible (Tab, Enter, Space, Escape)
- Focus indicators are always visible — do not suppress the outline
- Pokémon type chips use both color AND text label (not color-only)
- Modals and dialogs trap focus and return focus to the trigger on close
- ARIA roles and labels on icon-only buttons (e.g., `aria-label="Remove Pokémon"`)
- Skip navigation link as the first focusable element in the app shell
- Minimum touch target size 44×44px for all interactive elements
- Do not use `setTimeout` to manage focus — use Angular CDK `FocusTrap` for dialogs
- Test contrast ratios: body text ≥ 4.5:1, large text ≥ 3:1 against backgrounds

### Responsive Design

- Mobile-first breakpoints: 375px → 768px → 1024px → 1280px
- Navigation: bottom tab bar on mobile (Dashboard, Pokédex, Houses, Profile); sidebar on desktop
- Cards collapse to single-column on mobile
- Filter sidebars become bottom sheets on mobile (Angular Material `MatBottomSheet`)
- Tables where used show a card-per-row layout on mobile
- No fixed-height containers that clip content on small screens
- All images use `max-width: 100%`

---

## Seed Data Strategy

Provide Flyway migration scripts:

- `V1__schema.sql` — all CREATE TABLE, ENUMs, indexes, foreign keys
- `V2__seed_pokemon.sql` — all Pokémon from `pokemon.json`
- `V3__seed_habitats.sql` — all habitats from `habitats.json`
- `V4__seed_housing_kits.sql` — all housing kits from `housing-kits.json`
- `V5__seed_items.sql` — all items from `items.json`
- `V6__seed_favourites.sql` — all favourite categories and their item mappings from `favourites.json`

Since the JSON files are large, generate the SQL INSERT statements directly from the data. Do not use dynamic loading from JSON at runtime — the database is the source of truth after migration.

---

## Error Handling

### Back-end

- Implement a `GlobalExceptionHandler` (`@RestControllerAdvice`) that returns consistent JSON error responses:

```json
{
  "timestamp": "2026-04-13T18:00:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Pokémon with id abc123 not found",
  "path": "/api/pokemon/abc123"
}
```

- Map: `EntityNotFoundException` → 404, `AccessDeniedException` → 403, `IllegalArgumentException` → 400, generic exceptions → 500

### Front-end

- HTTP interceptor that catches 401 responses and redirects to login
- HTTP interceptor that attaches JWT `Authorization: Bearer <token>` header to all API calls
- Snackbar notifications for success/error feedback (e.g., "Pokémon assigned!", "Failed to create house")
- Loading spinners on all async operations using Angular Material `MatProgressSpinner`
- Empty states for lists with no results — never a blank page

---

## Configuration

### `backend/src/main/resources/application.yml`

```yaml
spring:
  application:
    name: pokopia-housing-planner
  datasource:
    url: ${DATASOURCE_URL:jdbc:postgresql://localhost:5432/pokopia}
    username: ${DATASOURCE_USERNAME:pokopia}
    password: ${DATASOURCE_PASSWORD:pokopia}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    open-in-view: false
  flyway:
    enabled: true
    locations: classpath:db/migration

jwt:
  secret: ${JWT_SECRET:change-this-in-production}
  expiration-ms: 86400000

server:
  port: 8080

logging:
  level:
    com.pokopia: DEBUG
```

### `frontend/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

---

## Testing

### Back-end

- Unit tests for all service classes using JUnit 5 + Mockito
- Integration tests for all controllers using `@WebMvcTest` + MockMvc
- Repository tests using `@DataJpaTest` with H2 in-memory (configure for PostgreSQL compatibility mode)
- Test the house capacity enforcement logic explicitly
- Test the favourite category computation logic explicitly
- Test the Pokémon suggestion logic explicitly

### Front-end

- Unit tests for all services using `TestBed` + `HttpClientTestingModule`
- Component tests for `DashboardComponent`, `PokedexComponent`, `HouseDetailComponent`
- Test that filters correctly update the displayed results

---

## README

Include a `README.md` at the repository root with:
- Project description
- Prerequisites (Java 21, Node 20, PostgreSQL 15, Angular CLI)
- Local setup instructions (clone → configure DB → run migrations → start backend → start frontend)
- Environment variable reference table
- API overview with base URL
- Screenshot placeholder section

---

## Code Quality Guidelines

- Follow standard Java naming conventions and Spring Boot best practices
- Use Lombok (`@Data`, `@Builder`, `@NoArgsConstructor`, etc.) to reduce boilerplate
- Use MapStruct for entity ↔ DTO mapping
- No business logic in controllers — controllers call services only
- Use `@Transactional` on service methods that write to the database
- Angular code: use `OnPush` change detection strategy on all components
- Angular code: use typed `HttpClient` with response DTOs matching the API response shapes
- Angular code: use Angular Signals (17+) for local component state where appropriate
- Angular code: separate `*Service` classes handle all HTTP calls — no direct HTTP in components
- Follow the Angular style guide (one component per file, consistent naming)

---

## Notes & Clarifications

- The Pokémon `id` field is a UUID string in the seed data — use it as the primary key directly
- Habitat `pokemonIds` contains sequential Pokémon numbers (1, 4, 6...) matching the `number` field (after stripping `#` and parsing as int), not the UUID `id`
- `favourites` on a Pokémon is a list of favourite category **names**, not IDs — use string matching
- `areas` on a Pokémon lists the game areas where that Pokémon can be found — this is metadata, not the area a user's house is in
- When a house is deleted, do NOT delete the Pokémon — just remove the `house_pokemon` associations
- A user can only see and manage their own houses and their own registered Pokémon list
- The reference data (all Pokémon, habitats, housing kits, items, favourites) is shared across all users and is read-only from the API (no POST/PUT/DELETE for seeded reference data)
- Item images may use various path formats in the seed data — normalise paths to `assets/item-assets/<slug>.png` format where slug is the item name lowercased and hyphenated
