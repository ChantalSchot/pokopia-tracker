
You are an expert full-stack software engineer. Your task is to generate a complete, production-quality web application called **pokopia-tracker** — a Pokémon housing management tracker for the game "Pokopia". Generate every file, including back-end, front-end, database, Docker configuration, data importers, documentation, and tests. Follow every instruction precisely.

---

# 1. PROJECT OVERVIEW

**Name:** pokopia-tracker  
**Purpose:** Allow users to manage their Pokémon in Pokopia — track which Pokémon they've registered, organise them into houses per region, manage items and habitats, and optimise house setups based on Pokémon favourites.

---

# 2. REPOSITORY STRUCTURE

```
pokopia-tracker/
├── README.md
├── docker-compose.yml
├── .env.example
├── .gitignore
│
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/pokopiatracker/
│       │   │   ├── PokopiaTrackerApplication.java
│       │   │   ├── config/
│       │   │   │   ├── SecurityConfig.java
│       │   │   │   ├── CorsConfig.java
│       │   │   │   └── JwtConfig.java
│       │   │   ├── controller/
│       │   │   │   ├── AuthController.java
│       │   │   │   ├── UserController.java
│       │   │   │   ├── PokemonController.java
│       │   │   │   ├── HouseController.java
│       │   │   │   ├── HabitatController.java
│       │   │   │   ├── ItemController.java
│       │   │   │   ├── FavouriteController.java
│       │   │   │   ├── HousingKitController.java
│       │   │   │   ├── AdminController.java
│       │   │   │   └── DataImportController.java
│       │   │   ├── dto/
│       │   │   │   ├── request/
│       │   │   │   └── response/
│       │   │   ├── entity/
│       │   │   │   ├── User.java
│       │   │   │   ├── Pokemon.java
│       │   │   │   ├── House.java
│       │   │   │   ├── Habitat.java
│       │   │   │   ├── Item.java
│       │   │   │   ├── Favourite.java
│       │   │   │   ├── HousingKit.java
│       │   │   │   └── Specialty.java
│       │   │   ├── enums/
│       │   │   │   ├── IdealHabitat.java
│       │   │   │   ├── HouseType.java
│       │   │   │   ├── Region.java
│       │   │   │   ├── Rarity.java
│       │   │   │   ├── TimeOfDay.java
│       │   │   │   └── ItemCategory.java
│       │   │   ├── exception/
│       │   │   │   ├── GlobalExceptionHandler.java
│       │   │   │   ├── ResourceNotFoundException.java
│       │   │   │   └── ValidationException.java
│       │   │   ├── importer/
│       │   │   │   └── DataImportService.java
│       │   │   ├── repository/
│       │   │   ├── security/
│       │   │   │   ├── JwtTokenProvider.java
│       │   │   │   ├── JwtAuthenticationFilter.java
│       │   │   │   └── UserDetailsServiceImpl.java
│       │   │   └── service/
│       └── resources/
│           ├── application.yml
│           ├── application-dev.yml
│           └── data/
│               ├── pokemon.json
│               ├── habitats.json
│               ├── items.json
│               ├── favourites.json
│               ├── housing-kits.json
│               └── specialties.json
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── angular.json
│   ├── tsconfig.json
│   └── src/
│       ├── main.ts
│       ├── app/
│       │   ├── app.module.ts
│       │   ├── app-routing.module.ts
│       │   ├── app.component.ts/html/scss
│       │   ├── core/
│       │   │   ├── auth/
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   ├── models/
│       │   │   └── services/
│       │   ├── shared/
│       │   │   ├── components/
│       │   │   └── pipes/
│       │   └── features/
│       │       ├── auth/
│       │       ├── dashboard/
│       │       ├── pokedex/
│       │       ├── houses/
│       │       ├── items/
│       │       ├── habitats/
│       │       ├── profile/
│       │       └── admin/
│       ├── assets/
│       │   ├── pokemon/
│       │   ├── habitats/
│       │   ├── items/
│       │   ├── housing-kits/
│       │   └── specialties/
│       └── styles/
│           ├── _variables.scss
│           ├── _theme.scss
│           └── styles.scss
│
└── docs/
    ├── API.md
    ├── DATA_MODELS.md
    ├── DEPLOYMENT.md
    └── DEVELOPMENT.md
```

---

# 3. TECHNOLOGY STACK

## Back-end
- **Java 21** with **Spring Boot 3.3+**
- **Spring Security** with JWT (Bearer token) authentication
- **Spring Data JPA** with Hibernate
- **PostgreSQL** 16 as database
- **Maven** build tool
- **Lombok** for boilerplate reduction
- **MapStruct** for DTO mapping
- **Jackson** for JSON (de)serialisation
- **Spring Validation** (Jakarta Bean Validation)
- **Port: 8090** (NOT default 8080)

## Front-end
- **Angular 17+** (standalone components where applicable)
- **Angular Material** (latest) for UI components
- **Angular CDK** for accessibility and overlays
- **RxJS** for reactive streams
- **SCSS** with custom design tokens (see Section 8)
- **Port: 4300** (NOT default 4200)

## Database
- **PostgreSQL 16** in Docker
- **Port: 5432** (standard, exposed as 5433 on host to avoid conflicts)

## Infrastructure
- **Docker** and **Docker Compose** for all services
- Individual Dockerfiles for backend, frontend, and database

---

# 4. DATA MODELS

## 4.1 Enums (use these exact values)

### IdealHabitat (String enum)
Extract ALL distinct `idealHabitat` values from pokemon.json. Based on the data: `BRIGHT`, `HUMID`, `WARM`, `DRY`, `DARK`.  
Map to enum: `BRIGHT("Bright")`, `HUMID("Humid")`, `WARM("Warm")`, `DRY("Dry")`, `DARK("Dark")`.

### HouseType
```java
HABITAT,   // a named habitat used as a house (capacity: 1)
CUSTOM,    // user-created custom house (capacity: 4)
KIT        // based on a housing kit (capacity from kit's size field)
```

### Region
Extract ALL distinct `regions` values from pokemon.json. Values found: `BLEAK_BEACH("Bleak Beach")`, `CLOUD_ISLAND("Cloud Island")`, `PALETTE_TOWN("Palette Town")`, `ROCKY_RIDGES("Rocky Ridges")`, `SPARKLING_SKYLANDS("Sparkling Skylands")`, `WITHERED_WASTELANDS("Withered Wastelands")`.

### Rarity
`COMMON("Common")`, `RARE("Rare")`, `VERY_RARE("Very Rare")`, `NULL(null)` (for Ditto-type edge cases).

### TimeOfDay
`ALL_DAY("All day")`, `MORNING("Morning")`, `DAYTIME("Daytime")`, `EVENING("Evening")`, `NIGHTTIME("Nighttime")`.

### ItemCategory / ItemTag
Items have `tag` and `category` properties. Derive these from items.json. Use enums for both where the set of values is fixed.

### ItemType (decoration sub-type, for house display purposes)
`RELAXATION`, `TOY`, `DECORATION`, `NONE` — used to categorise items assigned to a house.

---

## 4.2 Entity: Pokemon
```
id              UUID (PK)
number          Integer               -- sequential number e.g. 1, 2, ... (same number = same line)
name            String (unique per number)
types           List<String>          -- e.g. ["Grass","Poison"]
specialties     List<Specialty>       -- ManyToMany
idealHabitat    IdealHabitat (enum)
litterDrop      String (nullable)
favourites      List<Favourite>       -- ManyToMany, always exactly 6 (one is flavour type)
spritePath      String (nullable)     -- relative path e.g. "assets/pokemon/1-bulbasaur.png"
regions         List<Region>          -- ManyToMany (enum-based)
timeOfDay       List<TimeOfDay>
rarity          Rarity
isEvent         Boolean
```
**IMPORTANT:**  
- Pokémon asset file name pattern: `<stripped_number>-<name_no_spaces>.png` (e.g. #001 → `1-bulbasaur.png`, spaces removed from name).
- "Professor Tangrowth" (number 041, name "Professor Tangrowth") MUST be fully excluded from all application functionality — do not return it in any API response, do not allow it in any house, do not show it in the pokédex. Filter it out at the service layer by name.
- Pokémon with `null` rarity (e.g. Ditto, Gulpin/Swalot) should still display but with rarity shown as "—".
- It is valid for multiple Pokémon to share the same `number` (e.g. Tatsugiri forms, Professor Tangrowth + Tangrowth both being #041).

---

## 4.3 Entity: Habitat
```
id          Integer (PK, from JSON)
name        String
slug        String
isEvent     Boolean
pokemonIds  List<Integer>   -- references Pokemon.number (not UUID). Multiple pokemon can share a number.
imagePath   String
```
- A habitat's `pokemonIds` array contains sequential numbers. ALL pokemon sharing that number should be linked to that habitat.
- Habitats can be used as houses (HouseType.HABITAT). Capacity = 1.

---

## 4.4 Entity: HousingKit
```
id          UUID (PK)
name        String (unique)
floors      Integer
size        Integer         -- max number of pokemon (capacity)
width       Integer
depth       Integer
height      Integer
imagePath   String
```
Housing kit names from data: `Leaf den`, `Leaf hut`, `Leaf cottage`, `Leaf house`, `Sand den`, `Sand hut`, `Sand cottage`, `Sand house`, `Stone den`, `Stone hut`, `Stone cottage`, `Stone house`, `City den`, `City hut`, `City cottage`, `City house`.  
Sizes (from JSON): den=1, hut=1, cottage=2, house=4.

---

## 4.5 Entity: Item
```
id          UUID (PK)
name        String (unique)
tag         String          -- from items.json
category    String          -- from items.json
imagePath   String (nullable)
favourites  List<Favourite> -- ManyToMany, derived from favourites.json linkage
```
Items are linked to favourites through the `favourites.json` — each favourite has an `items` array listing item names.

---

## 4.6 Entity: Favourite
```
id          UUID (PK)
name        String (unique)
items       List<Item>      -- ManyToMany
```
**Important:** One of each Pokémon's 6 favourites is a "flavour" favourite (e.g. "sweet flavors", "spicy flavors", etc.) and has NO items linked to it in favourites.json. All flavour names end with "flavors". This favourite type exists in the Pokémon's data but items-based matching only applies to the other 5.

---

## 4.7 Entity: Specialty
```
id          UUID (PK)
name        String (unique)
description String
imagePath   String
```

---

## 4.8 Entity: User
```
id              UUID (PK)
username        String (unique, not null)
email           String (unique, not null)
passwordHash    String
role            UserRole (ADMIN / USER)
registeredPokemonIds    List<UUID>  -- Set of Pokemon UUIDs user has "found/registered"
createdAt       Instant
updatedAt       Instant
```

---

## 4.9 Entity: House
```
id              UUID (PK)
name            String          -- unique within same region + owner combination
description     String (nullable)
owner           User            -- ManyToOne
region          Region (enum)   -- IMMUTABLE after creation (cannot be changed)
houseType       HouseType (enum)
housingKit      HousingKit      -- ManyToOne (nullable, only for KIT type)
habitat         Habitat         -- ManyToOne (nullable, only for HABITAT type)
maxSize         Integer         -- derived: 4 for CUSTOM, kit.size for KIT, 1 for HABITAT
width           Integer (nullable, editable only for CUSTOM)
depth           Integer (nullable, editable only for CUSTOM)
height          Integer (nullable, editable only for CUSTOM)
idealHabitat    IdealHabitat    -- nullable; what habitat type this house is set to
assignedPokemon List<Pokemon>   -- ManyToMany, max = maxSize
items           List<Item>      -- ManyToMany
activeFavourites List<Favourite> -- DERIVED (not stored): computed from items assigned; flavour favourites excluded
createdAt       Instant
updatedAt       Instant
```
**Rules:**
- `name` must be unique within the same (owner, region) pair.
- `region` is set at creation and CANNOT be changed.
- Width/depth/height are only editable for CUSTOM type.
- Assigning a Pokémon to a house requires `assignedPokemon.size() < maxSize`.
- A Pokémon can only be in ONE house at a time.
- `activeFavourites` is computed: the set of all favourites linked to the items assigned to this house (excluding flavour-type favourites ending in "flavors").
- If a Pokémon in a house has NONE of its non-flavour favourites present in `activeFavourites`, show a warning.

---

# 5. BACK-END SPECIFICATIONS

## 5.1 Spring Boot Configuration (application.yml)
```yaml
server:
  port: 8090

spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5433/pokopiatracker}
    username: ${DB_USER:pokopia}
    password: ${DB_PASSWORD:pokopia_secret}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
  flyway:
    enabled: true
    locations: classpath:db/migration

jwt:
  secret: ${JWT_SECRET:changeme_in_production_use_256bit_key}
  expiration-ms: 86400000  # 24 hours

cors:
  allowed-origins: ${CORS_ORIGINS:http://localhost:4300}
```

## 5.2 Security
- Use **JWT Bearer tokens** (stateless).
- Endpoints under `/api/admin/**` require `ROLE_ADMIN`.
- Endpoints under `/api/users/me/**` and `/api/houses/**` require authentication.
- `/api/auth/**`, `/api/pokemon` (GET), `/api/habitats` (GET), `/api/items` (GET), `/api/favourites` (GET), `/api/housing-kits` (GET) are public.
- Passwords hashed with **BCrypt**.
- Include CORS configuration allowing frontend origin.
- Spring Security must configure CSRF disabled (stateless API).
- Optionally add TOTP-based 2FA endpoint (`/api/auth/2fa/setup`, `/api/auth/2fa/verify`) — implement if straightforward, otherwise stub with TODO comment.

## 5.3 REST API Endpoints

### Auth
```
POST /api/auth/register       -- Register new user {username, email, password}
POST /api/auth/login          -- Login {email, password} → {token, user}
POST /api/auth/logout         -- Invalidate token (token blacklist or client-side)
POST /api/auth/change-password -- {oldPassword, newPassword} (authenticated)
```

### Users
```
GET  /api/users/me                        -- Get current user profile
PUT  /api/users/me                        -- Update profile {username, email}
GET  /api/users/me/registered-pokemon     -- List registered pokemon IDs
POST /api/users/me/registered-pokemon/{pokemonId}   -- Toggle registration on
DELETE /api/users/me/registered-pokemon/{pokemonId} -- Toggle registration off
```

### Pokémon (use "pokemon" in all code, endpoints, and class names — never "pokémon")
```
GET /api/pokemon               -- List all (exclude Professor Tangrowth always), supports filters:
                                  ?types=Grass,Fire
                                  ?idealHabitat=BRIGHT
                                  ?rarity=COMMON
                                  ?isEvent=true/false
                                  ?favourites=lots+of+nature,soft+stuff
                                  ?specialties=Build,Grow
                                  ?regions=BLEAK_BEACH
                                  ?registered=true/false (requires auth)
                                  ?housed=true/false (requires auth)
                                  ?houseId={uuid}
                                  ?search={name}
                                  ?sort=name|number|rarity (default: number)
GET /api/pokemon/{id}          -- Get single pokemon detail
```

### Houses
```
GET    /api/houses                    -- List user's houses; filters: ?region=BLEAK_BEACH&availableOnly=true&favourites=x,y
POST   /api/houses                    -- Create house {name, description, region, houseType, housingKitId?, habitatId?, idealHabitat?, width?, depth?, height?}
GET    /api/houses/{id}               -- Get house details (includes activeFavourites, suggestions)
PUT    /api/houses/{id}               -- Update house (name, description, idealHabitat, items, width/depth/height for CUSTOM only)
DELETE /api/houses/{id}               -- Delete house (pokémon become homeless)

POST   /api/houses/{id}/pokemon       -- Assign pokemon(s) {pokemonIds: [uuid, ...]}
DELETE /api/houses/{id}/pokemon/{pokemonId}  -- Remove pokemon from house
POST   /api/houses/{id}/items         -- Assign item(s) {itemIds: [uuid, ...]}
DELETE /api/houses/{id}/items/{itemId}       -- Remove item from house

GET    /api/houses/{id}/suggestions   -- Get suggested pokemon based on active favourites / idealHabitat
```

### Habitats
```
GET /api/habitats              -- List all habitats; filter: ?fullyRegistered=true/false (auth)
GET /api/habitats/{id}         -- Get habitat with its linked pokemon
```

### Items
```
GET /api/items                 -- List all items; filters: ?favourites=x,y&tag=z&category=w&search=name
GET /api/items/{id}            -- Get item details
```

### Favourites
```
GET /api/favourites            -- List all favourites (with their items)
GET /api/favourites/{id}       -- Get favourite details
```

### Housing Kits
```
GET /api/housing-kits          -- List all housing kits
GET /api/housing-kits/{id}     -- Get kit details
```

### Admin
```
POST /api/admin/import/all         -- Reimport all data from JSON files
POST /api/admin/import/{table}     -- Reimport specific table: pokemon|habitats|items|favourites|housing-kits|specialties
GET  /api/admin/users              -- List all users (paginated)
GET  /api/admin/users/{id}         -- Get user
PUT  /api/admin/users/{id}         -- Update user (including role)
DELETE /api/admin/users/{id}       -- Delete user
POST /api/admin/users              -- Create user

GET    /api/admin/pokemon/{id}     -- Get single pokemon (admin view, includes Professor Tangrowth)
POST   /api/admin/pokemon          -- Create pokemon
PUT    /api/admin/pokemon/{id}     -- Update pokemon
DELETE /api/admin/pokemon/{id}     -- Delete pokemon

GET    /api/admin/habitats/{id}    -- Admin habitat view
POST   /api/admin/habitats         -- Create
PUT    /api/admin/habitats/{id}    -- Update
DELETE /api/admin/habitats/{id}    -- Delete

GET    /api/admin/items/{id}       -- Admin item view
POST   /api/admin/items            -- Create
PUT    /api/admin/items/{id}       -- Update
DELETE /api/admin/items/{id}       -- Delete

GET    /api/admin/favourites/{id}  -- Admin favourite view
POST   /api/admin/favourites       -- Create
PUT    /api/admin/favourites/{id}  -- Update
DELETE /api/admin/favourites/{id}  -- Delete

GET    /api/admin/housing-kits/{id}
POST   /api/admin/housing-kits
PUT    /api/admin/housing-kits/{id}
DELETE /api/admin/housing-kits/{id}

GET /api/admin/export/{table}      -- Export JSON for table: pokemon|habitats|items|favourites|housing-kits|specialties
```

## 5.4 Data Import Service
- Place JSON data files in `src/main/resources/data/`.
- At first startup (or on admin trigger), parse JSON files using Jackson and persist to database.
- Use a flag (e.g. `DataLoadStatus` table or Spring `@EventListener(ApplicationReadyEvent.class)`) to avoid re-importing on every restart unless manually triggered by admin.
- Import order: specialties → favourites → items (with favourite linkage) → pokemon (with specialty + favourite linkage) → habitats → housing-kits.
- When reimporting a specific table, first delete existing records for that table, then re-insert.
- Professor Tangrowth IS imported into the database but excluded from all non-admin API responses.

## 5.5 Suggestion Logic (HouseService)
```
GET /api/houses/{id}/suggestions

Logic:
1. If house is full (assignedPokemon.size() >= maxSize): return empty list.
2. Compute activeFavourites from items (exclude flavour-type favourites, i.e. those ending with "flavors").
3. If activeFavourites is NOT empty:
   a. Candidates = all pokemon NOT already in any house AND registered by this user.
   b. Filter candidates: pokemon whose non-flavour favourites have ANY overlap with activeFavourites.
   c. Further filter: pokemon whose idealHabitat matches the house's idealHabitat (if set).
   d. Sort by: number of matching favourites DESC, then by number ASC.
4. If activeFavourites IS empty AND house has assigned pokemon:
   a. Derive "combined favourites" from the pokemon already in the house (union of their non-flavour favourites).
   b. Candidates = unhoused registered pokemon.
   c. Filter by idealHabitat overlap AND favourite overlap with combined favourites.
5. Return top 20 suggestions max.
```

## 5.6 Warning Logic
A Pokémon assigned to a house should have a `hasFavouriteWarning: true` flag in the response if:
- NONE of the Pokémon's non-flavour favourites (i.e. favourites NOT ending in "flavors") appear in the house's `activeFavourites`.

## 5.7 Error Handling
- `GlobalExceptionHandler` using `@RestControllerAdvice`.
- Return structured JSON error: `{timestamp, status, error, message, path}`.
- Handle: `ResourceNotFoundException (404)`, `ValidationException (400)`, `AccessDeniedException (403)`, `AuthenticationException (401)`, `ConstraintViolationException (400)`, generic `Exception (500)`.
- Validation errors return field-level details: `{field, message}[]`.

## 5.8 Database Migration (Flyway)
- Use Flyway for schema management. Place migration scripts in `src/main/resources/db/migration/`.
- Script naming: `V1__initial_schema.sql`, `V2__add_indexes.sql`, etc.
- Generate full DDL covering all tables, join tables, constraints, and indexes.

---

# 6. FRONT-END SPECIFICATIONS

## 6.1 Angular Setup
- Angular 17+ with **standalone components** and **lazy-loaded routes**.
- Angular Material with custom theme.
- Reactive forms (`ReactiveFormsModule`).
- HTTP interceptors for JWT auth header injection and error handling.
- Route guards: `AuthGuard` (requires login), `AdminGuard` (requires ADMIN role).

## 6.2 Pages and Routing

| Route | Component | Guard | Description |
|---|---|---|---|
| `/` | `LoginPage` | public | Login/homepage when not logged in; redirect to `/dashboard` if logged in |
| `/register` | `RegisterPage` | public | Register new account |
| `/dashboard` | `DashboardPage` | AuthGuard | Overview: registered count, housed count, homeless list |
| `/pokedex` | `PokedexPage` | AuthGuard | Pokédex with card grid + filter panel |
| `/houses` | `HousesPage` | AuthGuard | List of houses with filter panel |
| `/items` | `ItemsPage` | AuthGuard | Items list with filter panel |
| `/habitats` | `HabitatsPage` | AuthGuard | Habitats list |
| `/profile` | `ProfilePage` | AuthGuard | User profile edit |
| `/admin` | `AdminDashboard` | AdminGuard | Admin overview |
| `/admin/users` | `AdminUsersPage` | AdminGuard | User management |
| `/admin/pokemon` | `AdminPokemonPage` | AdminGuard | Pokémon data management |
| `/admin/data` | `AdminDataPage` | AdminGuard | Data import/export |

## 6.3 Layout
- **Top navigation bar** with links to all pages. Collapses to hamburger menu on mobile (≤768px).
- Navigation links: Dashboard, Pokédex, Houses, Items, Habitats (and Admin section if role is ADMIN).
- Sticky top navbar; page content scrolls beneath.
- **Filter panels** (on Pokédex, Houses, Items pages): fixed to right side, scrollable independently from content grid. On mobile, the filter panel should collapse behind a toggle button.
- Responsive grid layouts using Angular CDK or CSS Grid.

## 6.4 Dashboard Page
- Total registered Pokémon count (X out of total available).
- Number of registered Pokémon currently assigned to a house.
- **Homeless Pokémon list:** registered Pokémon not assigned to any house — displayed as sprite cards.
- Quick-link button to assign each homeless Pokémon to a house.

## 6.5 Pokédex Page
- **Card grid** (NOT a table) — each Pokémon shown as a card with:
  - Sprite image (from assets/pokemon/ folder)
  - Name, number, types (as chips/badges)
  - Rarity badge
  - Registration toggle button (checkbox or toggle, clearly labelled)
  - "Registered" visual distinction (e.g. glowing border, checkmark overlay, distinct background)
  - Quick house assignment indicator (which house it's in, if any)
- **Filter panel (right side, fixed):**
  - Search by name
  - Filter by type (multi-select chips)
  - Filter by idealHabitat
  - Filter by rarity
  - Filter by isEvent
  - Filter by registered (yes/no)
  - Filter by housed (yes/no/homeless)
  - Filter by region (multi-select)
  - Filter by specialties (multi-select)
  - Filter by favourites (multi-select)
  - Filter by house type (habitat/custom/kit)
  - Filter by assigned house (dropdown)
  - Sort: by number, name, rarity
- **Pokémon detail modal:** clicking a card opens a modal with full Pokémon details:
  - Sprite image (large)
  - Name, number, types, specialties (with icons)
  - idealHabitat, rarity, litterDrop, timeOfDay
  - All 6 favourites listed (indicate which is flavour type)
  - Regions list
  - Which house it is currently assigned to (if any)
  - Habitats it appears in
  - Assign-to-house dropdown (if registered and not yet housed)

## 6.6 Houses Page
- **Card grid** of houses with:
  - House name, region, type badge (Habitat / Custom / Kit name)
  - idealHabitat chip
  - Assigned Pokémon sprites (up to maxSize slots shown)
  - Occupancy indicator (e.g. "2/4")
  - Active favourites summary (up to 3 favourite chips)
  - Warning indicator if any Pokémon has no active favourites
  - Edit / Delete buttons
- **Filter panel (right side, fixed):**
  - Filter by region
  - Filter by available spots (only show non-full houses)
  - Filter by active favourites
  - Filter by house type
  - Filter by idealHabitat
- **House detail modal:** clicking a house opens a modal with:
  - Name (editable), description (editable)
  - Region (display only — immutable)
  - House type + kit/habitat info
  - idealHabitat dropdown (editable)
  - Assigned Pokémon section: sprite grid, add/remove pokemon, warning badges per Pokémon
  - Items section: list of assigned items (grouped by favourite they belong to, visually split by item type: decoration/relaxation/toy/other). Add items button with search + favourite filter. Remove item buttons.
  - Active favourites section: derived from items, shown as badges
  - Suggestions section: list of suggested Pokémon (visible only if house is not full)
  - Width/depth/height (editable only for CUSTOM houses)
- **Create house button** → dialog with:
  - Name (required, unique in region)
  - Description (optional)
  - Region (required, dropdown — cannot be changed later)
  - House type (HABITAT / CUSTOM / KIT)
  - If HABITAT: select habitat from dropdown
  - If KIT: select housing kit from dropdown
  - If CUSTOM: enter width, depth, height
  - idealHabitat (optional)

## 6.7 Items Page
- List of all items (card or compact list format).
- Each item shows: name, category, tag, image (if available), and which favourites it belongs to.
- **Filter panel:**
  - Filter by favourite(s) (multi-select)
  - Filter by tag
  - Filter by category
  - Search by name

## 6.8 Habitats Page
- **Card grid** of all habitats, each showing:
  - Habitat image
  - Name
  - Number of Pokémon linked (and how many user has registered)
  - Visual distinction / badge when ALL Pokémon in this habitat are registered
- Hover shows: list of Pokémon in this habitat (with sprites and registration status).
- Filter: fully registered / not fully registered.

## 6.9 Profile Page
- Display current username and email.
- Edit username (must be unique), email.
- Change password form (old + new + confirm).
- List of all registered Pokémon (count + link to pokédex).

## 6.10 Admin Pages
- **Admin Dashboard:** stats overview + quick links.
- **User management:** table of users, edit/delete/create, toggle admin role.
- **Pokémon management:** table with edit/delete/create (including Professor Tangrowth).
- **Data management:** per-table import button + export-as-JSON button for pokemon, habitats, items, favourites, housing-kits, specialties.
- Separate admin navigation section in the navbar (only visible to admin users).

## 6.11 Shared Components
- `PokemonCardComponent` — reusable Pokémon card
- `PokemonSpriteComponent` — safe image with fallback
- `FavouriteChipComponent` — favourite badge
- `TypeChipComponent` — type badge with type colour
- `HouseCardComponent` — reusable house card
- `HabitatCardComponent`
- `ConfirmDialogComponent` — reusable confirmation dialog
- `FilterPanelComponent` — reusable right-side filter panel shell
- `LoadingSpinnerComponent`
- `ErrorMessageComponent`

## 6.12 Angular Services
- `AuthService` — login, logout, register, currentUser$, token management
- `PokemonService` — CRUD + filters
- `HouseService` — CRUD + pokemon/item assignment
- `HabitatService`
- `ItemService`
- `FavouriteService`
- `HousingKitService`
- `UserService`
- `AdminService`
- `NotificationService` — snackbar notifications wrapper

## 6.13 HTTP Interceptors
- `JwtInterceptor` — adds `Authorization: Bearer <token>` header to all authenticated requests.
- `ErrorInterceptor` — catches HTTP errors, triggers notifications, handles 401 (redirect to login).

---

# 7. DOCKER CONFIGURATION

## docker-compose.yml
```yaml
version: '3.9'
services:
  db:
    image: postgres:16
    container_name: pokopia-db
    environment:
      POSTGRES_DB: pokopiatracker
      POSTGRES_USER: pokopia
      POSTGRES_PASSWORD: pokopia_secret
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pokopia -d pokopiatracker"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    container_name: pokopia-backend
    environment:
      DB_URL: jdbc:postgresql://db:5432/pokopiatracker
      DB_USER: pokopia
      DB_PASSWORD: pokopia_secret
      JWT_SECRET: your_256bit_secret_here
      CORS_ORIGINS: http://localhost:4300
    ports:
      - "8090:8090"
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build: ./frontend
    container_name: pokopia-frontend
    ports:
      - "4300:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

## backend/Dockerfile
```dockerfile
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8090
ENTRYPOINT ["java", "-jar", "app.jar"]
```

## frontend/Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration=production

FROM nginx:alpine
COPY --from=builder /app/dist/pokopia-tracker /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

## frontend/nginx.conf
```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://backend:8090/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

---

# 8. DESIGN SYSTEM (Pokopia Style)

The application must have a cohesive "Pokopia" visual style — cosy, nature-inspired, pastel with warm earthy tones, referencing the in-game aesthetic.

## Colour Palette
```scss
// Primary brand colours — warm earth greens / pokopia pastels
$color-primary:           #3a7d44;   // Forest green (primary action)
$color-primary-hover:     #2d6235;
$color-primary-light:     #e8f5e9;   // Light green tint for backgrounds
$color-secondary:         #f9a825;   // Warm amber (accents, badges)
$color-secondary-hover:   #f57f17;

// Surface colours
$color-bg:                #f5f0e8;   // Warm cream background
$color-surface:           #fdfaf5;   // Card surface
$color-surface-2:         #f8f2e4;   // Slightly darker surface
$color-surface-offset:    #ede8de;

// Text
$color-text:              #2c2416;   // Deep warm brown
$color-text-muted:        #6b5f50;
$color-text-faint:        #a89880;

// Semantic
$color-error:             #c62828;
$color-warning:           #e65100;
$color-success:           #2e7d32;
$color-info:              #1565c0;

// Type colours for Pokémon type chips (standard Pokémon type palette)
$type-normal:   #A8A878;
$type-fire:     #F08030;
$type-water:    #6890F0;
$type-grass:    #78C850;
$type-electric: #F8D030;
$type-ice:      #98D8D8;
$type-fighting: #C03028;
$type-poison:   #A040A0;
$type-ground:   #E0C068;
$type-flying:   #A890F0;
$type-psychic:  #F85888;
$type-bug:      #A8B820;
$type-rock:     #B8A038;
$type-ghost:    #705898;
$type-dragon:   #7038F8;
$type-dark:     #705848;
$type-steel:    #B8B8D0;
$type-fairy:    #EE99AC;
```

## Typography
- **Body font:** `'Nunito', 'Segoe UI', sans-serif` — rounded, friendly feel.
- **Display/heading font:** `'Nunito', sans-serif` (bold weights).
- Load from Google Fonts: `Nunito:wght@400;500;600;700;800`.
- Base font size: 16px.

## Visual Style Rules
- Rounded corners everywhere: `border-radius: 12px` for cards, `8px` for chips/badges.
- Soft drop shadows: `box-shadow: 0 2px 8px rgba(0,0,0,0.08)`.
- Cards have a warm cream background with a subtle leaf/nature-pattern border or top accent line in primary green.
- Registered Pokémon cards: green border glow `box-shadow: 0 0 0 2px $color-primary`.
- House occupancy: use a dot-indicator (filled = occupied, empty = available).
- Type chips use their respective type colour as background with white text (if dark enough) or dark text.
- Pokémon sprite images: 64×64px in card view, 128×128px in modal.
- Warning badges: amber/orange background with exclamation icon.
- Button styles: primary (green fill), secondary (outlined green), danger (red fill), ghost (text only).
- Angular Material theme: override primary palette with Pokopia green, accent with amber.

## Responsive Breakpoints
```scss
$breakpoint-mobile: 768px;
$breakpoint-tablet: 1024px;
$breakpoint-desktop: 1280px;
```

---

# 9. ACCESSIBILITY (WCAG 2.1 AA)

- All interactive elements must have visible focus rings.
- Colour contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text.
- All images have descriptive `alt` text (Pokémon sprite: `"[Name] sprite"`, habitat: `"[Habitat name]"`).
- Icon-only buttons have `aria-label`.
- Form inputs have associated `<label>` elements.
- Modal dialogs trap focus and restore focus on close; use `role="dialog"` with `aria-labelledby` and `aria-describedby`.
- Navigation has `role="navigation"` with `aria-label`.
- Main content area has `<main>` landmark.
- Heading hierarchy: one `<h1>` per page.
- Keyboard navigation fully functional: Tab, Enter, Space, Escape for all interactions.
- Use `aria-live` regions for dynamic updates (e.g. filter results count, registration toggle confirmation).
- Skip-to-main-content link as first focusable element.
- `prefers-reduced-motion` respected — disable animations if set.
- No information conveyed by colour alone (always pair with icon or text).

---

# 10. SPECIAL BUSINESS RULES (SUMMARY)

1. **Professor Tangrowth** (name: "Professor Tangrowth", number: 041): excluded from ALL non-admin API responses and ALL front-end pages except admin. Cannot be assigned to a house.
2. **Pokémon name in UI text:** always written as "Pokémon" (with é). In code, always "pokemon" (with e). Same rule for "Pokédex" in UI, "pokedex" in code.
3. **Flavour favourites:** any favourite whose name ends with "flavors" (e.g. "sweet flavors"). These have NO items and are excluded from active-favourite matching and house warning logic.
4. **House region immutability:** region is set at creation and cannot be changed. Moving a Pokémon to a house in a different region requires: remove from current house first, then assign to new house. No automatic region transfer.
5. **Pokémon uniqueness constraint:** a Pokémon (by UUID) can only be in ONE house at a time.
6. **House name uniqueness:** unique within (owner, region) pair — not globally.
7. **Sprite path format:** `assets/pokemon/{stripped_number}-{name_no_spaces_lowercase}.png`  
   Number stripping: remove leading zeros (e.g. `#001` → `1`). Name: lowercase, remove spaces and special characters.  
   Example: `Tatsugiri Curly Form` #145 → `145-tatsugiricurlyform.png`.
8. **Multiple Pokémon same number:** e.g. Tatsugiri forms (all #145), Professor Tangrowth + Tangrowth (both #041) — all are distinct entities but share the number. Habitat linkage uses the number, so all Pokémon with that number appear in the habitat.
9. **Habitat-type houses:** capacity = 1. Habitat-based houses use the habitat's `imagePath` as display image.
10. **Data load flag:** initial data load runs once. Admin can force reload per-table or all tables.
11. **Item-favourite linkage:** an item belongs to one or more favourites. The linkage is defined in `favourites.json` (each favourite lists its items). Import must correctly build the bidirectional ManyToMany.
12. **Active favourites in a house:** computed as UNION of all favourites linked to all items in that house, EXCLUDING flavour-type favourites.
13. **House warning:** shown per-Pokémon if NONE of that Pokémon's non-flavour favourites are active in its house.

---

# 11. TESTING

## Back-end Tests
- Unit tests for services: `HouseServiceTest`, `PokemonServiceTest`, `DataImportServiceTest`.
- Integration tests using `@SpringBootTest` + `@Testcontainers` (PostgreSQL container).
- Test the suggestion logic with mocked data.
- Test house creation constraints (name uniqueness within region, region immutability).
- Test Professor Tangrowth exclusion.
- Use JUnit 5 + Mockito.

## Front-end Tests
- Unit tests for key services (`AuthService`, `HouseService`) using Jasmine + Karma.
- Component tests for `PokemonCardComponent`, `HouseCardComponent`.
- Use `HttpClientTestingModule` for service tests.

---

# 12. README.md

Generate a comprehensive README with:
- Project description and screenshots placeholder section
- Tech stack overview
- Prerequisites (Docker, Node.js, Java 21, Maven)
- Quick start with Docker: `docker-compose up --build`
- Local development setup (backend + frontend separately)
- Environment variables table (from `.env.example`)
- API documentation link
- Folder structure overview
- First admin setup instructions (manual SQL: `UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';`)
- Known limitations / future work section

---

# 13. DOCUMENTATION FILES

## docs/API.md
Full REST API reference: endpoint, method, auth required, request body, response schema, example.

## docs/DATA_MODELS.md
Entity relationship descriptions, enum values, business rules.

## docs/DEPLOYMENT.md
- Docker Compose production deployment
- Environment variable configuration
- Postgres backup strategy
- Nginx configuration notes
- Health check endpoints

## docs/DEVELOPMENT.md
- Local dev setup
- Code style guidelines
- How to add new migrations
- How to regenerate export JSONs
- Testing guide

---

# 14. ADDITIONAL QUALITY GUIDELINES

- Use **enums** wherever a fixed set of values exists (Region, IdealHabitat, HouseType, Rarity, TimeOfDay).
- **No hardcoded strings** for entity types — always reference enums.
- All API responses use **DTOs** (never expose JPA entities directly).
- **Pagination** on list endpoints that could return large results (`/api/admin/users`, `/api/pokemon` supports `?page=0&size=20`).
- Use **`@Transactional`** on service methods that modify data.
- Front-end: use **async pipe** in templates (avoid manual subscriptions without `takeUntil`).
- Front-end: **lazy loading** for all feature modules/routes.
- Back-end: **input validation** on all incoming DTOs using Jakarta Validation annotations (`@NotBlank`, `@Size`, `@Email`, etc.).
- Back-end: **logging** with SLF4J — log at INFO level for important operations (import, house creation), DEBUG for verbose, ERROR for failures.
- Consistent **HTTP status codes**: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict (e.g. duplicate username).
- Back-end: use **`@PreAuthorize`** or security filter chain checks for role-based access.
- Front-end: **skeleton loaders** while data loads; **empty state components** when lists are empty.
- Front-end: toast/snackbar notifications for all async operations (success + error).
- **`.env.example`** file listing all environment variables with descriptions and safe defaults.
- **`.gitignore`** covering Java (target/, *.class), Node (node_modules/, dist/), environment files (.env), IDE files.

---

# 15. IMPORTANT IMPLEMENTATION NOTES

1. Generate **ALL files** — do not say "implement similarly" or leave placeholder comments saying "TODO: implement". Write the actual code.
2. Pokémon types should be stored as a simple comma-separated string or `@ElementCollection` — not as a separate entity, since types are not linked to images or other data.
3. For the front-end filter panel: use Angular CDK `ScrollStrategy` or plain CSS `position: sticky` + `overflow-y: auto` with a fixed max-height to keep filters scrollable while content scrolls independently.
4. The `items` and `favourites` data is very large (570K+ chars for items). Ensure the import handles batching/chunking to avoid OOM.
5. Sprite images will be placed by the user in `frontend/src/assets/pokemon/`, `habitats/`, `items/`, `housing-kits/`, `specialties/`. The app should show a placeholder/fallback image if a sprite is not found (use Angular's `(error)` event on `<img>` to swap src).
6. For the Angular Material theme, use a custom `@NgModule` theming setup with the Pokopia green/amber palette. Follow Angular Material theming guidelines for SCSS.
7. All monetary/number displays should use Angular pipes (`number`, `titlecase`, etc.) rather than raw string concatenation.
8. The `activeFavourites` field on House responses must be computed server-side (not stored in DB) and included in both list and detail responses.
9. When deleting a house, the backend must remove all `assignedPokemon` associations (making them homeless) before deleting the house record.
10. The admin export endpoint should serialise current DB data to the same JSON format as the input files, allowing round-trip import/export.
