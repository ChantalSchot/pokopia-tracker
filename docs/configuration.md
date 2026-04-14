# Pokopia Tracker — Configuration Reference

## Environment Variables

All configuration is managed via environment variables, with defaults suitable for local development.

Copy `.env.example` to `.env` and adjust values as needed.

### Database

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_URL` | `jdbc:postgresql://localhost:5433/pokopia` | JDBC connection URL |
| `DB_USERNAME` | `pokopia` | Database username |
| `DB_PASSWORD` | `pokopia` | Database password |

### JWT Authentication

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | (dev default) | HMAC-SHA secret key (min 256 bits for production) |

Token lifetimes (configured in `application.yml`, not env vars):
- Access token: 15 minutes (900s)
- Refresh token: 7 days (604800s)
- Inactivity timeout: 3 hours (10800s)

### Mail (Password Reset)

| Variable | Default | Description |
|----------|---------|-------------|
| `MAIL_HOST` | `smtp.gmail.com` | SMTP server host |
| `MAIL_PORT` | `587` | SMTP server port |
| `MAIL_USERNAME` | (empty) | SMTP username |
| `MAIL_PASSWORD` | (empty) | SMTP password |

### Application

| Variable | Default | Description |
|----------|---------|-------------|
| `ASSETS_PATH` | `resources/assets` | Path to asset files (images, sprites) |
| `FRONTEND_URL` | `http://localhost:4300` | Frontend URL (for CORS and email links) |
| `IMPORT_DATA_PATH` | `resources/json` | Path to JSON import data files |

---

## Port Configuration

| Service | Port | Notes |
|---------|------|-------|
| Frontend (Angular) | 4300 | `ng serve --port 4300` |
| Backend (Spring Boot) | 8088 | `server.port=8088` in application.yml |
| PostgreSQL (external) | 5433 | Mapped from container port 5432 |
| PostgreSQL (internal) | 5432 | Default PostgreSQL port inside container |

These are **non-default ports** (mandatory per project decisions) to avoid conflicts with other local services.

---

## Docker Compose Profiles

### Production: `docker-compose.yml`

Runs all three services:
- **db**: PostgreSQL 16 Alpine with healthcheck
- **backend**: Spring Boot JAR (multi-stage build)
- **frontend**: Angular build served by Nginx (proxies /api and /assets to backend)

```bash
cp .env.example .env
# Edit .env for production values
docker-compose up -d
```

### Development: `docker-compose.dev.yml`

Runs database only — backend and frontend run locally:

```bash
docker-compose -f docker-compose.dev.yml up -d

# Start backend
cd backend && ./mvnw spring-boot:run

# Start frontend
cd frontend && npm install && ng serve --port 4300
```

---

## Spring Boot Configuration

Key settings in `backend/src/main/resources/application.yml`:

| Setting | Value | Purpose |
|---------|-------|---------|
| `spring.jpa.hibernate.ddl-auto` | `validate` | Schema managed by Flyway, not Hibernate |
| `spring.jpa.open-in-view` | `false` | Avoid lazy loading outside transactions |
| `spring.flyway.enabled` | `true` | Automatic schema migrations |
| `spring.jackson.default-property-inclusion` | `non_null` | Omit null fields in JSON responses |
| `springdoc.swagger-ui.path` | `/swagger-ui.html` | Swagger UI URL |

---

## Database Migrations

Flyway manages the database schema via migration files in:
```
backend/src/main/resources/db/migration/
```

Current migrations:
- `V1__init_schema.sql` — Full initial schema (all tables, indexes, constraints)

Migrations run automatically on application startup.

---

## Asset Serving

Assets (habitat images, pokemon sprites, item images, specialty icons) are served by the Spring Boot backend:

- **Endpoint**: `GET /assets/**`
- **Source**: Configurable via `ASSETS_PATH` env var
- **Default**: `resources/assets/` relative to working directory
- **Docker**: Volume-mounted or copied into container

The Angular frontend references assets via `environment.apiUrl + imagePath` (e.g., `http://localhost:8088/assets/habitats/1-tall-grass.png`).

---

## CORS Configuration

CORS is configured in `WebConfig.java`:
- Allowed origin: `FRONTEND_URL` env var
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed headers: all
- Credentials: true (required for cookie-based auth)

---

## Security Configuration

- BCrypt password hashing with strength 12
- JWT tokens stored in HttpOnly, SameSite=Strict cookies
- Stateless session management (no server-side sessions)
- Role-based access: USER (default), ADMIN
- Public endpoints: `/api/auth/**`, `/assets/**`, `/swagger-ui/**`, `/v3/api-docs/**`
- Authenticated endpoints: everything else under `/api/**`
- Admin endpoints: `/api/admin/**` requires ADMIN role
