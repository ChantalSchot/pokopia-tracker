# Pokopia Tracker

A Pokemon Pokopia island management tracker that helps players organize their Pokemon, houses, items, and habitats across regions. Register your Pokemon, build and furnish houses, assign Pokemon to houses based on habitat compatibility, and get smart suggestions for optimal placements.

## Features

- **Pokemon management** -- registration, house assignment, and favourites tracking
- **House builder** -- capacity management, item placement, active favourites, and Pokemon placement suggestions
- **Comprehensive item catalog** -- filterable by type and category
- **Habitat browser** -- browse habitats with event badges and image references
- **Dashboard** -- stats, warnings, and recent activity at a glance
- **Admin panel** -- data management, JSON imports, user role management, and data exports
- **JWT authentication** -- secure HttpOnly cookies with access and refresh tokens, password reset via email
- **Responsive design** -- light/dark theme support with SCSS design tokens

## Tech Stack

| Layer    | Technology                                                       |
|----------|------------------------------------------------------------------|
| Backend  | Java 21, Spring Boot 3.3.5, Spring Data JPA, Spring Security, Flyway, SpringDoc OpenAPI 2.5 |
| Frontend | Angular 17, Angular Material 17, TypeScript 5.4, SCSS           |
| Database | PostgreSQL 16                                                    |
| Auth     | JWT (access + refresh tokens via HTTP-only cookies, JJWT 0.12.6)|
| Mapping  | MapStruct 1.5.5                                                  |
| Docs     | SpringDoc OpenAPI (Swagger UI)                                   |
| Build    | Maven (backend), Angular CLI (frontend), Docker Compose          |

## Prerequisites

- **Docker & Docker Compose** (for containerized setup) -- recommended
- OR for local development:
  - Java 21+
  - Node.js 20+
  - PostgreSQL 16

## Quick Start

### Docker (recommended)

```bash
# 1. Clone the repository
git clone <repo-url> && cd pokopia-tracker

# 2. Copy and configure environment variables
cp .env.example .env
# Edit .env and set a strong JWT_SECRET (minimum 256 bits)

# 3. Start all services
docker compose up --build -d

# 4. Open the application
#    Frontend  -> http://localhost:4300
#    Backend   -> http://localhost:8088
#    Swagger   -> http://localhost:8088/swagger-ui.html
```

### Local Development

```bash
# 1. Start only the database
docker compose -f docker-compose.dev.yml up -d

# 2. Copy and configure environment variables
cp .env.example .env

# 3. Start the backend
cd backend
./mvnw spring-boot:run

# 4. Start the frontend (in a separate terminal)
cd frontend
npm install
ng serve --port 4300
```

## Configuration

Copy `.env.example` to `.env` and configure the following environment variables:

| Variable         | Description                                | Default                                    |
|------------------|--------------------------------------------|--------------------------------------------|
| `DB_URL`         | JDBC connection string                     | `jdbc:postgresql://localhost:5433/pokopia`  |
| `DB_USERNAME`    | Database username                          | `pokopia`                                  |
| `DB_PASSWORD`    | Database password                          | `pokopia`                                  |
| `JWT_SECRET`     | Secret key for signing JWTs (min 256 bits) | _(must be set)_                            |
| `MAIL_HOST`      | SMTP host for password-reset emails        | `smtp.gmail.com`                           |
| `MAIL_PORT`      | SMTP port                                  | `587`                                      |
| `MAIL_USERNAME`  | SMTP username                              | _(empty)_                                  |
| `MAIL_PASSWORD`  | SMTP password                              | _(empty)_                                  |
| `ASSETS_PATH`    | Path to habitat/item image assets          | `resources/assets`                         |
| `FRONTEND_URL`   | Frontend origin for CORS and emails        | `http://localhost:4300`                    |

## Ports

| Service    | Port |
|------------|------|
| Frontend   | 4300 |
| Backend    | 8088 |
| PostgreSQL | 5433 |

## Data Import

On first startup the backend automatically seeds the database from bundled JSON files (located in `resources/json/`) when it detects an empty `pokemon` table. The import runs in this order:

1. **Specialties** -- Pokemon specialties (e.g., Berry Finding, Cooking)
2. **Favourites** -- Pokemon favourite items/activities
3. **Items** -- Decorative and functional house items, then links items to favourites
4. **Housing Kits** -- Pre-built house templates with fixed dimensions
5. **Habitats** -- Habitat definitions with image references
6. **Pokemon** -- Full Pokemon catalog with types, regions, habitats, and relationships

The import is idempotent: if data already exists, it is skipped. Administrators can trigger a full re-import via `POST /api/admin/import` or import a specific dataset via `POST /api/admin/import/{dataset}`.

## Project Structure

```
pokopia-tracker/
  backend/
    src/main/java/com/pokopia/tracker/
      config/          # Security, JWT, CORS, OpenAPI, Mail configuration
      controller/      # REST controllers (Auth, User, Pokemon, House, Admin, ...)
      domain/
        entity/        # JPA entities (User, Pokemon, House, Item, Habitat, ...)
        enums/         # Region, HouseType, IdealHabitat, PokemonType, Rarity, ...
      dto/
        request/       # Incoming request DTOs with validation
        response/      # Outgoing response DTOs
      exception/       # Custom exceptions and global handler
      importer/        # JSON data import pipeline
      mapper/          # MapStruct mappers
      repository/      # Spring Data JPA repositories
      security/        # JWT filter, token provider, UserDetailsService
      service/         # Business logic layer
    src/test/          # Unit and integration tests (JUnit 5, Mockito, H2)
  frontend/
    src/               # Angular 17 application (components, services, models)
  resources/
    assets/            # Habitat and item images
  docs/                # Additional documentation
  prompts/             # AI prompt references
  docker-compose.yml       # Full-stack deployment (db + backend + frontend)
  docker-compose.dev.yml   # Database-only for local development
  .env.example             # Environment variable template
```

## API Documentation

Swagger UI is available at [http://localhost:8088/swagger-ui.html](http://localhost:8088/swagger-ui.html) when the backend is running.

### Key Endpoints

| Area           | Method | Path                                   | Description                        | Auth  |
|----------------|--------|----------------------------------------|------------------------------------|-------|
| Auth           | POST   | `/api/auth/register`                   | Register a new user                | No    |
| Auth           | POST   | `/api/auth/login`                      | Log in and receive tokens          | No    |
| Auth           | POST   | `/api/auth/logout`                     | Log out and clear tokens           | Yes   |
| Auth           | POST   | `/api/auth/refresh`                    | Refresh the access token           | Yes   |
| Auth           | POST   | `/api/auth/forgot-password`            | Request password reset             | No    |
| Auth           | POST   | `/api/auth/reset-password`             | Reset password with token          | No    |
| Users          | GET    | `/api/users/me`                        | Get current user profile           | Yes   |
| Users          | PUT    | `/api/users/me`                        | Update profile                     | Yes   |
| Pokemon        | GET    | `/api/pokemon`                         | List all Pokemon (filterable)      | Yes   |
| Pokemon        | GET    | `/api/pokemon/{id}`                    | Get Pokemon details                | Yes   |
| User Pokemon   | GET    | `/api/user-pokemon`                    | List user's registered Pokemon     | Yes   |
| User Pokemon   | POST   | `/api/user-pokemon/{pokemonId}`        | Register a Pokemon                 | Yes   |
| User Pokemon   | DELETE | `/api/user-pokemon/{id}`               | Remove from collection             | Yes   |
| Houses         | GET    | `/api/houses`                          | List user's houses (paginated)     | Yes   |
| Houses         | POST   | `/api/houses`                          | Create a new house                 | Yes   |
| Houses         | PUT    | `/api/houses/{id}`                     | Update house settings              | Yes   |
| Houses         | DELETE | `/api/houses/{id}`                     | Delete a house                     | Yes   |
| Houses         | POST   | `/api/houses/{id}/pokemon/{pokemonId}` | Assign Pokemon to house            | Yes   |
| Houses         | GET    | `/api/houses/{id}/suggestions`         | Get Pokemon placement suggestions  | Yes   |
| Houses         | GET    | `/api/houses/{id}/active-favourites`   | Get active favourites in house     | Yes   |
| Reference Data | GET    | `/api/items`                           | List all items                     | Yes   |
| Reference Data | GET    | `/api/habitats`                        | List all habitats                  | Yes   |
| Reference Data | GET    | `/api/favourites`                      | List all favourites                | Yes   |
| Reference Data | GET    | `/api/specialties`                     | List all specialties               | Yes   |
| Reference Data | GET    | `/api/housing-kits`                    | List all housing kits              | Yes   |
| Dashboard      | GET    | `/api/dashboard`                       | Get user dashboard stats           | Yes   |
| Admin          | POST   | `/api/admin/import`                    | Trigger full data import           | ADMIN |
| Admin          | POST   | `/api/admin/import/{dataset}`          | Import specific dataset            | ADMIN |
| Admin          | GET    | `/api/admin/export/pokemon`            | Export Pokemon data                | ADMIN |
| Admin          | GET    | `/api/admin/users`                     | List all users                     | ADMIN |
| Admin          | PUT    | `/api/admin/users/{id}/roles`          | Update user roles                  | ADMIN |

See `docs/api.md` for the full API reference.

## Testing

### Backend

```bash
cd backend
./mvnw test
```

Tests use an in-memory H2 database configured via `src/test/resources/application-test.yml`. No external services are required. The test suite uses JUnit 5 and Mockito.

### Frontend

```bash
cd frontend
npm test
```

Frontend tests use Karma with Jasmine.

## Creating the First Admin User

1. Register a user through the UI or the `/api/auth/register` endpoint.
2. Connect to the database and promote the user:

```sql
psql -h localhost -p 5433 -U pokopia -d pokopia

INSERT INTO user_roles (user_id, role)
SELECT id, 'ADMIN' FROM users WHERE username = 'your-username';
```

3. Log out and log back in for the new role to take effect.

## License

This project is private and not licensed for redistribution.
