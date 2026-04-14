# Architecture Overview

This document describes the high-level architecture of the Pokopia Tracker application -- a full-stack web application for tracking and managing Pokemon housing in the Pokopia game world.

---

## System Overview

Pokopia Tracker is a monorepo web application consisting of a Spring Boot REST API backend, an Angular single-page application frontend, and a PostgreSQL relational database. All three services are containerized with Docker and orchestrated via Docker Compose.

```
                         +-------------------+
                         |   Browser / SPA   |
                         | Angular 17+ (4300)|
                         +---------+---------+
                                   |
                              REST / JSON
                           (JWT via HttpOnly cookies)
                                   |
                         +---------+---------+
                         | Spring Boot API   |
                         |  Java 21 (8088)   |
                         +---------+---------+
                                   |
                              JDBC / JPA
                                   |
                         +---------+---------+
                         | PostgreSQL 16     |
                         |     (5433)        |
                         +-------------------+
```

---

## Monorepo Structure

```
pokopia-tracker/
+-- README.md
+-- docker-compose.yml
+-- .env.example
+-- .gitignore
+-- docs/
|   +-- architecture.md          # This file
|   +-- data-model.md            # Entity relationships and enums
|   +-- api.md                   # REST API endpoint reference
|   +-- import-flow.md           # Data import documentation
|   +-- testing-strategy.md      # Testing approach and coverage
|   +-- configuration.md         # Configuration reference
+-- backend/
|   +-- Dockerfile
|   +-- pom.xml
|   +-- src/
|       +-- main/
|       |   +-- java/com/pokopia/tracker/
|       |   |   +-- PokopiaTrackerApplication.java
|       |   |   +-- config/           # Security, JWT, CORS, OpenAPI configs
|       |   |   +-- controller/       # REST controllers
|       |   |   +-- dto/
|       |   |   |   +-- request/      # Incoming DTOs with validation
|       |   |   |   +-- response/     # Outgoing DTOs
|       |   |   +-- entity/           # JPA entities
|       |   |   +-- enums/            # Java enums (Region, PokemonType, etc.)
|       |   |   +-- exception/        # Custom exceptions + global handler
|       |   |   +-- mapper/           # Entity-to-DTO mappers (MapStruct)
|       |   |   +-- repository/       # Spring Data JPA repositories
|       |   |   +-- security/         # JWT filter, UserDetails, auth service
|       |   |   +-- service/          # Business logic services
|       |   |   +-- importer/         # JSON import services
|       |   +-- resources/
|       |       +-- application.yml
|       |       +-- application-dev.yml
|       |       +-- application-prod.yml
|       |       +-- db/migration/     # Flyway SQL migration scripts
|       +-- test/
|           +-- java/com/pokopia/tracker/
|               +-- service/          # Service unit tests
|               +-- controller/       # Controller integration tests
|               +-- security/         # Security tests
|               +-- importer/         # Import logic tests
+-- frontend/
|   +-- Dockerfile
|   +-- angular.json
|   +-- package.json
|   +-- tsconfig.json
|   +-- src/
|       +-- app/
|       |   +-- core/
|       |   |   +-- auth/             # Auth service, guards, interceptors
|       |   |   +-- services/         # Shared API services
|       |   |   +-- models/           # TypeScript interfaces/enums
|       |   +-- shared/               # Reusable components, pipes, directives
|       |   +-- features/
|       |   |   +-- auth/             # Login, register, password reset
|       |   |   +-- dashboard/        # Dashboard page
|       |   |   +-- pokedex/          # Pokemon list + detail dialog
|       |   |   +-- houses/           # House list, detail, create/edit
|       |   |   +-- items/            # Items browsing page
|       |   |   +-- habitats/         # Habitats browsing page
|       |   |   +-- profile/          # User profile management
|       |   |   +-- admin/            # Admin pages (users, data, import/export)
|       |   +-- app.routes.ts
|       |   +-- app.component.ts
|       +-- assets/
|       +-- styles/
|       |   +-- _tokens.scss          # SCSS design tokens
|       |   +-- _theme.scss           # Angular Material theme
|       |   +-- styles.scss           # Global styles
|       +-- environments/
+-- resources/
    +-- json/
    |   +-- pokemon.json
    |   +-- favourites.json
    |   +-- items.json
    |   +-- habitats.json
    |   +-- housing-kits.json
    |   +-- specialties.json
    +-- assets/
        +-- pokemon/                  # Pokemon sprite PNGs
        +-- habitats/                 # Habitat image PNGs
        +-- housing-kits/             # Housing kit image PNGs
        +-- items/                    # Item image PNGs
        +-- specialties/              # Specialty icon PNGs
```

---

## Backend Architecture

### Technology Stack

| Component | Technology | Version |
|---|---|---|
| Language | Java | 21 |
| Framework | Spring Boot | 3.3.5 |
| Persistence | Spring Data JPA / Hibernate | via Spring Boot BOM |
| Security | Spring Security | via Spring Boot BOM |
| Migrations | Flyway | via Spring Boot BOM |
| API Docs | SpringDoc OpenAPI (Swagger UI) | 2.x |
| Password Hashing | BCrypt | via Spring Security |
| JWT | io.jsonwebtoken (jjwt) | 0.12.x |
| Mapping | MapStruct | 1.5.x |
| Validation | Jakarta Bean Validation | via Spring Boot BOM |
| Build | Maven | 3.9+ |

### Layered Architecture

The backend follows a standard layered architecture with strict separation of concerns:

1. **Controller Layer** -- REST controllers handle HTTP requests, delegate to services, and return DTOs. No business logic resides in controllers.
2. **Service Layer** -- Business logic, validation, authorization checks, and transaction management (`@Transactional`). Services call repositories and other services.
3. **Repository Layer** -- Spring Data JPA interfaces providing CRUD and custom query methods against PostgreSQL.
4. **Entity Layer** -- JPA-annotated entities mapped to database tables. All entities use UUID primary keys.
5. **DTO Layer** -- Separate request and response DTOs with Jakarta Bean Validation annotations on request DTOs.
6. **Mapper Layer** -- MapStruct mappers convert between entities and DTOs.
7. **Exception Layer** -- Custom exceptions (`EntityNotFoundException`, `BusinessRuleViolationException`, etc.) handled by a `@RestControllerAdvice` global exception handler that produces consistent JSON error responses.
8. **Security Layer** -- JWT authentication filter, `UserDetailsService` implementation, role-based authorization (`USER`, `ADMIN`).
9. **Importer Layer** -- Services that read JSON source files and upsert master data into the database.

### Authentication Flow

1. User registers via `POST /api/auth/register` with username, email, and password.
2. Password is hashed with BCrypt before storage.
3. User logs in via `POST /api/auth/login` with email + password.
4. On successful authentication, the server issues a JWT access token and a refresh token. The JWT is sent as an HttpOnly, Secure, SameSite cookie.
5. All subsequent API requests include the JWT cookie. A `JwtAuthenticationFilter` extracts and validates the token on every request.
6. The refresh token is stored in the `refresh_tokens` table and used to issue new access tokens via `POST /api/auth/refresh`.
7. Logout invalidates the refresh token and clears the JWT cookie.
8. Password reset uses a time-limited token sent via email (`POST /api/auth/forgot-password`, `POST /api/auth/reset-password`).

### Authorization Model

| Role | Permissions |
|---|---|
| `USER` | Manage own profile, registered Pokemon, houses, and assignments |
| `ADMIN` | All USER permissions, plus: manage users, reload/import/export master data, CRUD all reference entities |

Authorization is enforced at two levels:
- **Endpoint level**: Spring Security `@PreAuthorize` annotations restrict access by role.
- **Service level**: Ownership checks ensure users can only modify their own resources (houses, registered Pokemon). Unauthorized access returns HTTP 403.

### Static Asset Serving

The backend serves static assets (Pokemon sprites, habitat images, item images, etc.) from a configurable filesystem path. The `ASSETS_PATH` environment variable points to the directory containing asset folders. Assets are served under `/assets/**` by configuring a Spring resource handler.

---

## Frontend Architecture

### Technology Stack

| Component | Technology | Version |
|---|---|---|
| Framework | Angular | 17+ |
| Component Style | Standalone components | -- |
| UI Library | Angular Material | 17+ |
| Styling | SCSS with design tokens | -- |
| State Management | Angular Signals + Services | -- |
| HTTP | Angular HttpClient | -- |
| Build | Angular CLI | 17+ |

### Key Architectural Decisions

- **Standalone Components**: All components use the Angular standalone component pattern (no NgModules). Components declare their imports directly.
- **OnPush Change Detection**: All components use `ChangeDetectionStrategy.OnPush` for performance.
- **SCSS Design Tokens**: Colors, spacing, typography, and breakpoints are defined as SCSS variables in `_tokens.scss`. Changing a token propagates to the entire application.
- **Light and Dark Themes**: Two Angular Material themes inspired by Pokopia aesthetics. Theme preference is stored in `localStorage` and toggled via a UI control.
- **Typed HTTP Layer**: All HTTP calls go through dedicated `*Service` classes. Response types match backend DTOs via TypeScript interfaces.
- **Route Guards**: `AuthGuard` protects all authenticated routes. `AdminGuard` protects admin routes. Guards redirect unauthenticated users to the login page.
- **HTTP Interceptors**: An auth interceptor attaches credentials (cookies). An error interceptor catches 401 responses and redirects to login, and displays error snackbars for other failures.
- **Responsive Layout**: Mobile-first breakpoints (375px, 768px, 1024px, 1280px). Navigation collapses to a hamburger menu on mobile. Filter panels become bottom sheets or drawers on small screens.
- **Accessibility (WCAG 2.1 AA)**: Semantic HTML, ARIA attributes, keyboard navigation, visible focus indicators, sufficient color contrast, skip navigation links, `prefers-reduced-motion` support.

### Page / Route Map

| Route | Component | Auth | Role |
|---|---|---|---|
| `/login` | LoginComponent | Public | -- |
| `/register` | RegisterComponent | Public | -- |
| `/forgot-password` | ForgotPasswordComponent | Public | -- |
| `/reset-password` | ResetPasswordComponent | Public | -- |
| `/dashboard` | DashboardComponent | Required | USER |
| `/pokedex` | PokedexComponent | Required | USER |
| `/houses` | HousesComponent | Required | USER |
| `/items` | ItemsComponent | Required | USER |
| `/habitats` | HabitatsComponent | Required | USER |
| `/profile` | ProfileComponent | Required | USER |
| `/admin/dashboard` | AdminDashboardComponent | Required | ADMIN |
| `/admin/users` | AdminUsersComponent | Required | ADMIN |
| `/admin/pokemon` | AdminPokemonComponent | Required | ADMIN |
| `/admin/habitats` | AdminHabitatsComponent | Required | ADMIN |
| `/admin/items` | AdminItemsComponent | Required | ADMIN |
| `/admin/favourites` | AdminFavouritesComponent | Required | ADMIN |
| `/admin/housing-kits` | AdminHousingKitsComponent | Required | ADMIN |
| `/admin/import-export` | AdminImportExportComponent | Required | ADMIN |

---

## Database Architecture

### Technology

- **Engine**: PostgreSQL 16
- **Primary Keys**: UUID for all entities (generated or sourced from import data)
- **Migrations**: Flyway manages schema evolution via versioned SQL scripts in `db/migration/`
- **Connection Pooling**: HikariCP (Spring Boot default)

### Schema Principles

- All tables use UUID primary keys.
- Master/reference data tables (pokemon, favourites, items, habitats, housing_kits, specialties) are loaded from JSON on first startup and can be reloaded by admins.
- User-owned data tables (users, houses, user_pokemon, house_items) are created and managed by authenticated users.
- Join tables are used for many-to-many relationships (pokemon_favourites, pokemon_specialties, item_favourites, house_items).
- Enum types are stored as PostgreSQL VARCHAR and mapped to Java enums.
- Active favourites for a house are computed at query time, not stored.

---

## Containerization

### Docker Multi-Stage Builds

Both the backend and frontend use multi-stage Docker builds:

- **Backend Dockerfile**: Stage 1 builds the Maven project, Stage 2 runs the JAR on a slim JRE 21 base image.
- **Frontend Dockerfile**: Stage 1 builds the Angular app with `ng build --configuration production`, Stage 2 serves the built files via nginx.

### Docker Compose Services

| Service | Image | Port (host:container) |
|---|---|---|
| `db` | postgres:16-alpine | 5433:5432 |
| `backend` | pokopia-tracker-backend (built) | 8088:8088 |
| `frontend` | pokopia-tracker-frontend (built) | 4300:80 |

Docker Compose reads environment variables from `.env` (or `.env.example` as template). Profiles can be used to distinguish between `dev` (hot-reload volumes) and `prod` (built images) configurations.

---

## Communication

### REST API

All communication between frontend and backend occurs over a RESTful JSON API. The base URL is `/api/`.

### Authentication Transport

JWT tokens are transported via HttpOnly cookies (not Authorization headers). This approach:
- Prevents XSS-based token theft
- Requires CSRF protection for state-changing requests (handled via SameSite cookie attribute and CSRF token headers where needed)

### Pagination

All list endpoints return Spring `Page` objects with the following structure:

```json
{
  "content": [...],
  "totalElements": 310,
  "totalPages": 16,
  "number": 0,
  "size": 20,
  "first": true,
  "last": false
}
```

### Error Responses

All errors follow a consistent format:

```json
{
  "timestamp": "2026-04-14T12:00:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Pokemon with id abc123 not found",
  "path": "/api/pokemon/abc123"
}
```

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Pokemon assignment is one-to-one (one Pokemon to at most one house) | Resolved contradictory requirements in favor of the stricter, more consistent rule |
| House region is immutable after creation | Prevents data integrity issues with Pokemon region assignments |
| Active favourites are computed, not stored | Ensures consistency and avoids stale data; computed from house items at query time |
| Flavour favourites (sweet/sour/spicy/bitter/dry) are synthetic | Not in favourites.json; synthesized during import with `isFlavour=true` flag; excluded from item-based activation logic |
| Professor Tangrowth is excluded from all user-facing queries | Business rule; present in database but filtered out of all non-admin API responses |
| Ditto has special handling | Has `isDitto=true` flag, empty favourites, null rarity; suggestion logic skips Ditto |
| JWT via HttpOnly cookies instead of Authorization header | Better XSS protection for a browser-based SPA |
| SCSS design tokens for theming | Centralizes visual identity; changing one token propagates everywhere |
| Standalone Angular components | Modern Angular best practice; no NgModules needed |
