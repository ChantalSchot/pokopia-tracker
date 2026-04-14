# API Endpoint Reference

This document catalogs all REST API endpoints for the Pokopia Tracker backend. The API base URL is `/api/`. All requests and responses use JSON (`application/json`).

---

## Authentication

JWT-based authentication uses HttpOnly cookies. After a successful login, the server sets a `pokopia_jwt` cookie on the response. All subsequent requests must include this cookie. The refresh token is stored server-side and referenced via a separate `pokopia_refresh` cookie.

---

## Error Response Format

All error responses follow a consistent structure:

```json
{
  "timestamp": "2026-04-14T12:00:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Pokemon with id 2c574a1a-d443-4d55-bfd7-7198ba61726f not found",
  "path": "/api/pokemon/2c574a1a-d443-4d55-bfd7-7198ba61726f"
}
```

| HTTP Status | When |
|---|---|
| 400 Bad Request | Validation errors, malformed input, business rule violations |
| 401 Unauthorized | Missing or expired JWT |
| 403 Forbidden | Insufficient role or not the resource owner |
| 404 Not Found | Entity does not exist |
| 409 Conflict | Duplicate username, email, or house name within region |
| 500 Internal Server Error | Unexpected server errors |

Validation errors include a `fieldErrors` map:

```json
{
  "timestamp": "2026-04-14T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/auth/register",
  "fieldErrors": {
    "email": "must be a valid email address",
    "password": "must be at least 8 characters"
  }
}
```

---

## Pagination

All list endpoints that return potentially large result sets support Spring `Page` pagination via query parameters:

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | Integer | 0 | Zero-based page number |
| `size` | Integer | 20 | Page size |
| `sort` | String | varies | Sort field (e.g. `name`, `number`, `rarity`) |
| `direction` | String | `asc` | Sort direction: `asc` or `desc` |

Paginated responses use the Spring Page wrapper:

```json
{
  "content": [...],
  "totalElements": 310,
  "totalPages": 16,
  "number": 0,
  "size": 20,
  "first": true,
  "last": false,
  "numberOfElements": 20
}
```

---

## Auth Endpoints

All auth endpoints are **public** (no authentication required).

| Method | Path | Description | Request Body | Response |
|---|---|---|---|---|
| POST | `/api/auth/register` | Register a new user account | `RegisterRequest` | 201: `UserResponse` |
| POST | `/api/auth/login` | Authenticate and receive JWT cookie | `LoginRequest` | 200: `UserResponse` + Set-Cookie |
| POST | `/api/auth/logout` | Invalidate refresh token, clear JWT cookie | *(none)* | 200: `{ "message": "Logged out" }` |
| POST | `/api/auth/refresh` | Refresh the JWT using the refresh token cookie | *(none)* | 200: `UserResponse` + Set-Cookie |
| POST | `/api/auth/forgot-password` | Request a password reset email | `ForgotPasswordRequest` | 200: `{ "message": "..." }` |
| POST | `/api/auth/reset-password` | Reset password using a token | `ResetPasswordRequest` | 200: `{ "message": "..." }` |

### Request/Response DTOs

**RegisterRequest:**
```json
{
  "username": "string (required, 3-50 chars, unique)",
  "email": "string (required, valid email, unique)",
  "password": "string (required, min 8 chars)"
}
```

**LoginRequest:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**ForgotPasswordRequest:**
```json
{
  "email": "string (required)"
}
```

**ResetPasswordRequest:**
```json
{
  "token": "string (required)",
  "newPassword": "string (required, min 8 chars)"
}
```

**UserResponse:**
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "role": "USER | ADMIN",
  "createdAt": "datetime"
}
```

---

## User Endpoints

All user endpoints require **authentication** (JWT cookie).

| Method | Path | Description | Request Body | Response |
|---|---|---|---|---|
| GET | `/api/users/me` | Get current user profile | *(none)* | 200: `UserResponse` |
| PUT | `/api/users/me` | Update username and/or email | `UpdateUserRequest` | 200: `UserResponse` |
| PUT | `/api/users/me/password` | Change password | `ChangePasswordRequest` | 200: `{ "message": "..." }` |

**UpdateUserRequest:**
```json
{
  "username": "string (optional, 3-50 chars, unique)",
  "email": "string (optional, valid email, unique)"
}
```

**ChangePasswordRequest:**
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, min 8 chars)"
}
```

---

## Pokemon Endpoints

Authentication required for all endpoints.

| Method | Path | Description | Response |
|---|---|---|---|
| GET | `/api/pokemon` | List all Pokemon (paginated, filterable) | 200: `Page<PokemonSummaryResponse>` |
| GET | `/api/pokemon/{id}` | Get detailed Pokemon info | 200: `PokemonDetailResponse` |

### GET /api/pokemon -- Filter Parameters

| Parameter | Type | Description |
|---|---|---|
| `type` | String | Filter by PokemonType (e.g. `Fire`, `Water`) |
| `rarity` | String | Filter by rarity (Common, Rare, Very Rare) |
| `region` | String | Filter by region name |
| `specialty` | String | Filter by specialty name |
| `favourite` | String | Filter by favourite category name |
| `idealHabitat` | String | Filter by ideal habitat (Bright, Cool, etc.) |
| `timeOfDay` | String | Filter by time of day |
| `litterDrop` | String | Filter by litter drop type |
| `isEvent` | Boolean | Filter event Pokemon |
| `registered` | Boolean | Filter to only registered (true) or unregistered (false) Pokemon for current user |
| `homeless` | Boolean | If true, show only registered-but-unhoused Pokemon |
| `houseId` | UUID | Filter to Pokemon assigned to a specific house |
| `houseType` | String | Filter by house type of the assigned house (HABITAT, CUSTOM, HOUSING_KIT) |
| `search` | String | Text search on Pokemon name |
| `page` | Integer | Page number (0-based) |
| `size` | Integer | Page size |
| `sort` | String | Sort field: `name`, `number`, `rarity` |
| `direction` | String | Sort direction: `asc`, `desc` |

**PokemonSummaryResponse:**
```json
{
  "id": "uuid",
  "number": "#001",
  "name": "Bulbasaur",
  "types": ["Grass", "Poison"],
  "specialties": [{ "name": "Grow", "imagePath": "..." }],
  "rarity": "Common",
  "spritePath": "assets/pokemon/1-bulbasaur.png",
  "isEvent": false,
  "registered": true,
  "housedIn": { "id": "uuid", "name": "Green Garden" }
}
```

**PokemonDetailResponse:**
```json
{
  "id": "uuid",
  "number": "#001",
  "name": "Bulbasaur",
  "types": ["Grass", "Poison"],
  "specialties": [{ "id": "uuid", "name": "Grow", "description": "...", "imagePath": "..." }],
  "idealHabitat": "Bright",
  "litterDrop": "leaf",
  "favourites": [
    { "id": "uuid", "name": "lots of nature", "isFlavour": false },
    { "id": "uuid", "name": "sweet flavors", "isFlavour": true }
  ],
  "spritePath": "assets/pokemon/1-bulbasaur.png",
  "regions": ["Bleak Beach", "Cloud Island"],
  "timeOfDay": ["All day"],
  "rarity": "Common",
  "isEvent": false,
  "registered": true,
  "housedIn": { "id": "uuid", "name": "Green Garden", "region": "Palette Town" }
}
```

---

## User Pokemon Endpoints

Authentication required. All operations scoped to the current user.

| Method | Path | Description | Request Body | Response |
|---|---|---|---|---|
| GET | `/api/users/me/pokemon` | List user's registered Pokemon | *(none)* | 200: `List<UserPokemonResponse>` |
| POST | `/api/users/me/pokemon` | Register a Pokemon | `{ "pokemonId": "uuid" }` | 201: `UserPokemonResponse` |
| DELETE | `/api/users/me/pokemon/{pokemonId}` | Unregister a Pokemon | *(none)* | 204: No Content |

**UserPokemonResponse:**
```json
{
  "id": "uuid",
  "pokemon": { "id": "uuid", "number": "#001", "name": "Bulbasaur", "spritePath": "..." },
  "house": { "id": "uuid", "name": "Green Garden", "region": "Palette Town" }
}
```

**Business rules:**
- Unregistering a Pokemon that is assigned to a house automatically removes it from the house.
- Registering an already-registered Pokemon returns 409 Conflict.

---

## House Endpoints

Authentication required. All operations scoped to the current user's houses.

| Method | Path | Description | Request Body | Response |
|---|---|---|---|---|
| GET | `/api/houses` | List user's houses (paginated, filterable) | *(none)* | 200: `Page<HouseSummaryResponse>` |
| POST | `/api/houses` | Create a new house | `CreateHouseRequest` | 201: `HouseDetailResponse` |
| GET | `/api/houses/{id}` | Get house detail | *(none)* | 200: `HouseDetailResponse` |
| PUT | `/api/houses/{id}` | Update house | `UpdateHouseRequest` | 200: `HouseDetailResponse` |
| DELETE | `/api/houses/{id}` | Delete house (Pokemon become homeless) | *(none)* | 204: No Content |
| GET | `/api/houses/region` | List houses grouped by region | *(none)* | 200: `Map<String, List<HouseSummaryResponse>>` |

### House Pokemon Assignment

| Method | Path | Description | Request Body | Response |
|---|---|---|---|---|
| POST | `/api/houses/{id}/pokemon/{pokemonId}` | Assign Pokemon to house | *(none)* | 200: `HouseDetailResponse` |
| DELETE | `/api/houses/{id}/pokemon/{pokemonId}` | Remove Pokemon from house | *(none)* | 200: `HouseDetailResponse` |

### House Item Assignment

| Method | Path | Description | Request Body | Response |
|---|---|---|---|---|
| GET | `/api/houses/{id}/items` | List items in a house | *(none)* | 200: `List<ItemResponse>` |
| POST | `/api/houses/{id}/items` | Add item(s) to house | `{ "itemIds": ["uuid", ...] }` | 200: `HouseDetailResponse` |
| DELETE | `/api/houses/{id}/items/{itemId}` | Remove item from house | *(none)* | 200: `HouseDetailResponse` |

### House Computed Data

| Method | Path | Description | Response |
|---|---|---|---|
| GET | `/api/houses/{id}/active-favourites` | Get active favourite categories for this house | 200: `List<FavouriteResponse>` |
| GET | `/api/houses/{id}/suggestions` | Get suggested Pokemon for this house | 200: `List<PokemonSuggestionResponse>` |

### GET /api/houses -- Filter Parameters

| Parameter | Type | Description |
|---|---|---|
| `region` | String | Filter by region name |
| `idealHabitat` | String | Filter by house ideal habitat |
| `hasAvailableSpots` | Boolean | Only show houses with open slots |
| `favourite` | String | Filter by active favourite category name |
| `houseType` | String | Filter by house type (HABITAT, CUSTOM, HOUSING_KIT) |
| `search` | String | Text search on house name |
| `page` | Integer | Page number (0-based) |
| `size` | Integer | Page size |
| `sort` | String | Sort field |
| `direction` | String | Sort direction |

### Request/Response DTOs

**CreateHouseRequest:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "houseType": "HABITAT | CUSTOM | HOUSING_KIT (required)",
  "region": "string (required, must be valid Region)",
  "idealHabitat": "string (optional, must be valid IdealHabitat)",
  "housingKitId": "uuid (required if houseType=HOUSING_KIT)",
  "habitatId": "uuid (required if houseType=HABITAT)",
  "width": "integer (optional, only for CUSTOM)",
  "depth": "integer (optional, only for CUSTOM)",
  "height": "integer (optional, only for CUSTOM)"
}
```

**UpdateHouseRequest:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "idealHabitat": "string (optional)",
  "width": "integer (optional, only for CUSTOM)",
  "depth": "integer (optional, only for CUSTOM)",
  "height": "integer (optional, only for CUSTOM)"
}
```

**HouseSummaryResponse:**
```json
{
  "id": "uuid",
  "name": "Green Garden",
  "houseType": "CUSTOM",
  "region": "Palette Town",
  "idealHabitat": "Bright",
  "maxSize": 4,
  "assignedPokemonCount": 2,
  "activeFavourites": ["cute stuff", "lots of nature"],
  "pokemonSprites": ["assets/pokemon/1-bulbasaur.png", "assets/pokemon/2-ivysaur.png"]
}
```

**HouseDetailResponse:**
```json
{
  "id": "uuid",
  "name": "Green Garden",
  "description": "My favorite garden house",
  "houseType": "CUSTOM",
  "region": "Palette Town",
  "idealHabitat": "Bright",
  "maxSize": 4,
  "width": 8,
  "depth": 6,
  "height": 6,
  "housingKit": null,
  "habitat": null,
  "assignedPokemon": [
    {
      "id": "uuid",
      "pokemonId": "uuid",
      "number": "#001",
      "name": "Bulbasaur",
      "types": ["Grass", "Poison"],
      "spritePath": "...",
      "hasWarning": false
    }
  ],
  "items": [
    {
      "id": "uuid",
      "name": "Berry chair",
      "type": "Decoration",
      "imagePath": "...",
      "activatesFavourites": ["cute stuff"]
    }
  ],
  "activeFavourites": ["cute stuff", "lots of nature"],
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

**PokemonSuggestionResponse:**
```json
{
  "id": "uuid",
  "number": "#001",
  "name": "Bulbasaur",
  "types": ["Grass", "Poison"],
  "spritePath": "...",
  "matchingFavourites": ["cute stuff", "lots of nature"],
  "matchCount": 2
}
```

---

## Reference Data Endpoints

Authentication required. Read-only for normal users.

| Method | Path | Description | Response |
|---|---|---|---|
| GET | `/api/items` | List all items (paginated, filterable) | 200: `Page<ItemResponse>` |
| GET | `/api/items/{id}` | Get item detail | 200: `ItemResponse` |
| GET | `/api/habitats` | List all habitats | 200: `List<HabitatResponse>` |
| GET | `/api/habitats/{id}` | Get habitat detail | 200: `HabitatDetailResponse` |
| GET | `/api/favourites` | List all favourite categories | 200: `List<FavouriteResponse>` |
| GET | `/api/specialties` | List all specialties | 200: `List<SpecialtyResponse>` |
| GET | `/api/housing-kits` | List all housing kits | 200: `List<HousingKitResponse>` |

### GET /api/items -- Filter Parameters

| Parameter | Type | Description |
|---|---|---|
| `type` | String | Filter by ItemType (Decoration, Relaxation, Toy, Food, Road) |
| `category` | String | Filter by item category (nature, furniture, kits, etc.) |
| `favourite` | String | Filter by favourite category name (items belonging to that favourite) |
| `search` | String | Text search on item name |
| `page` | Integer | Page number |
| `size` | Integer | Page size |

### GET /api/habitats -- Filter Parameters

| Parameter | Type | Description |
|---|---|---|
| `completed` | Boolean | If true, only habitats where all linked Pokemon are registered by the current user |
| `isEvent` | Boolean | Filter event habitats |

**ItemResponse:**
```json
{
  "id": "uuid",
  "name": "Berry chair",
  "description": "A cute chair shaped like a berry",
  "category": "furniture",
  "type": "Decoration",
  "imagePath": "assets/items/berry-chair.png",
  "favourites": ["cute stuff"]
}
```

**HabitatResponse:**
```json
{
  "id": "uuid",
  "name": "Tall Grass",
  "isEvent": false,
  "imagePath": "assets/habitats/1-tall-grass.png",
  "pokemonCount": 6,
  "registeredCount": 4,
  "completed": false
}
```

**HabitatDetailResponse:**
```json
{
  "id": "uuid",
  "name": "Tall Grass",
  "isEvent": false,
  "imagePath": "assets/habitats/1-tall-grass.png",
  "pokemon": [
    { "id": "uuid", "number": "#001", "name": "Bulbasaur", "spritePath": "...", "registered": true }
  ],
  "completed": false
}
```

**FavouriteResponse:**
```json
{
  "id": "uuid",
  "name": "cute stuff",
  "isFlavour": false,
  "itemCount": 56
}
```

**SpecialtyResponse:**
```json
{
  "id": "uuid",
  "name": "Grow",
  "description": "Pokemon with the Grow specialty can make plants flourish",
  "imagePath": "assets/specialties/grow.png"
}
```

**HousingKitResponse:**
```json
{
  "id": "uuid",
  "name": "Leaf den",
  "floors": 1,
  "size": 1,
  "width": 2,
  "depth": 2,
  "height": 1,
  "imagePath": "assets/housing-kits/leafden.png"
}
```

---

## Dashboard Endpoint

Authentication required.

| Method | Path | Description | Response |
|---|---|---|---|
| GET | `/api/dashboard` | Get dashboard summary for current user | 200: `DashboardResponse` |

**DashboardResponse:**
```json
{
  "totalPokemon": 310,
  "registeredCount": 45,
  "housedCount": 30,
  "homelessPokemon": [
    { "id": "uuid", "number": "#001", "name": "Bulbasaur", "types": ["Grass", "Poison"], "spritePath": "..." }
  ]
}
```

---

## Admin Endpoints

All admin endpoints require **ADMIN role** in addition to authentication.

### Admin Import/Export

| Method | Path | Description | Request Body | Response |
|---|---|---|---|---|
| POST | `/api/admin/import/all` | Reload all master data from JSON files | *(none)* | 200: `ImportResultResponse` |
| POST | `/api/admin/import/{dataset}` | Reload a specific dataset | *(none)* | 200: `ImportResultResponse` |
| GET | `/api/admin/export/{dataset}` | Export current database state as JSON | *(none)* | 200: JSON file download |

Valid `{dataset}` values: `pokemon`, `favourites`, `items`, `habitats`, `housing-kits`, `specialties`

**ImportResultResponse:**
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

### Admin User Management

| Method | Path | Description | Request Body | Response |
|---|---|---|---|---|
| GET | `/api/admin/users` | List all users (paginated) | *(none)* | 200: `Page<AdminUserResponse>` |
| GET | `/api/admin/users/{id}` | Get user detail | *(none)* | 200: `AdminUserResponse` |
| PUT | `/api/admin/users/{id}` | Update user | `AdminUpdateUserRequest` | 200: `AdminUserResponse` |
| DELETE | `/api/admin/users/{id}` | Delete user | *(none)* | 204: No Content |
| PUT | `/api/admin/users/{id}/role` | Change user role | `{ "role": "ADMIN" }` | 200: `AdminUserResponse` |

### Admin Reference Data CRUD

For each entity type (pokemon, items, habitats, favourites, specialties, housing-kits), the following endpoints exist:

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/{entity}` | List all (paginated) |
| GET | `/api/admin/{entity}/{id}` | Get by ID |
| POST | `/api/admin/{entity}` | Create new |
| PUT | `/api/admin/{entity}/{id}` | Update existing |
| DELETE | `/api/admin/{entity}/{id}` | Delete |

Where `{entity}` is one of: `pokemon`, `items`, `habitats`, `favourites`, `specialties`, `housing-kits`.

---

## CORS Configuration

The backend is configured to accept requests from the frontend origin:

| Setting | Value |
|---|---|
| Allowed Origins | `${FRONTEND_URL}` (default: `http://localhost:4300`) |
| Allowed Methods | GET, POST, PUT, DELETE, OPTIONS |
| Allowed Headers | Content-Type, Authorization, X-XSRF-TOKEN |
| Allow Credentials | true |
| Max Age | 3600 seconds |

---

## OpenAPI / Swagger UI

When running in development mode, the SpringDoc OpenAPI UI is available at:

- **Swagger UI**: `http://localhost:8088/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8088/v3/api-docs`
- **OpenAPI YAML**: `http://localhost:8088/v3/api-docs.yaml`
