# Configuration Reference

This document describes all configuration options for the Pokopia Tracker application, including environment variables, port assignments, Docker Compose profiles, Spring Boot profiles, and Flyway migrations.

---

## Environment Variables

All configuration is managed via environment variables. Default values are suitable for local development. For production deployments, copy `.env.example` to `.env` and adjust values.

### `.env.example` Reference

```bash
# ============================================
# Database
# ============================================
DB_URL=jdbc:postgresql://localhost:5433/pokopia
DB_USERNAME=pokopia
DB_PASSWORD=pokopia

# ============================================
# JWT Authentication
# ============================================
JWT_SECRET=change-this-to-a-secure-random-string-at-least-256-bits

# ============================================
# Mail (Password Reset)
# ============================================
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=

# ============================================
# Application
# ============================================
ASSETS_PATH=resources/assets
FRONTEND_URL=http://localhost:4300
IMPORT_DATA_PATH=resources/json
```

### Database Variables

| Variable | Default | Description |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5433/pokopia` | JDBC connection URL for PostgreSQL |
| `DB_USERNAME` | `pokopia` | Database username |
| `DB_PASSWORD` | `pokopia` | Database password |

The database URL uses port `5433` (non-default) to avoid conflicts with any local PostgreSQL installation on port 5432.

### JWT Authentication Variables

| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET` | *(dev-only default)* | HMAC-SHA256 secret key. Must be at least 256 bits (32 characters) for production. |

Token lifetimes are configured in `application.yml` (not environment variables):

| Token Type | Duration | Notes |
|---|---|---|
| Access token (JWT) | 15 minutes | Carried in HttpOnly cookie |
| Refresh token | 7 days | Stored in database, referenced via HttpOnly cookie |
| Password reset token | 1 hour | Sent via email |

### Mail Variables

| Variable | Default | Description |
|---|---|---|
| `MAIL_HOST` | `smtp.gmail.com` | SMTP server hostname |
| `MAIL_PORT` | `587` | SMTP server port (TLS) |
| `MAIL_USERNAME` | *(empty)* | SMTP authentication username |
| `MAIL_PASSWORD` | *(empty)* | SMTP authentication password or app-specific password |

Mail is used for password reset emails. If not configured, password reset functionality is disabled but the application still starts.

### Application Variables

| Variable | Default | Description |
|---|---|---|
| `ASSETS_PATH` | `resources/assets` | Filesystem path to the directory containing asset folders (pokemon/, habitats/, items/, etc.) |
| `FRONTEND_URL` | `http://localhost:4300` | Frontend origin URL. Used for CORS configuration and links in emails. |
| `IMPORT_DATA_PATH` | `resources/json` | Filesystem path to the directory containing JSON import files |

---

## Port Configuration

The project uses non-default ports to avoid conflicts with other local services.

| Service | Host Port | Container Port | Protocol |
|---|---|---|---|
| Frontend (Angular dev server) | 4300 | -- | HTTP |
| Frontend (Nginx in Docker) | 4300 | 80 | HTTP |
| Backend (Spring Boot) | 8088 | 8088 | HTTP |
| PostgreSQL | 5433 | 5432 | TCP |

### Where Ports Are Configured

| Port | Configuration Location |
|---|---|
| 4300 (frontend) | `angular.json` serve options; `docker-compose.yml` port mapping; `FRONTEND_URL` env var |
| 8088 (backend) | `application.yml` (`server.port`); `docker-compose.yml` port mapping; `Dockerfile` EXPOSE |
| 5433 (PostgreSQL) | `docker-compose.yml` port mapping; `DB_URL` env var |

---

## Docker Compose

### Production Profile: `docker-compose.yml`

Runs all three services as containers with built images.

```yaml
services:
  db:
    image: postgres:16-alpine
    ports:
      - "5433:5432"
    environment:
      POSTGRES_DB: pokopia
      POSTGRES_USER: ${DB_USERNAME:-pokopia}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-pokopia}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pokopia"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    ports:
      - "8088:8088"
    environment:
      DB_URL: jdbc:postgresql://db:5432/pokopia
      DB_USERNAME: ${DB_USERNAME:-pokopia}
      DB_PASSWORD: ${DB_PASSWORD:-pokopia}
      JWT_SECRET: ${JWT_SECRET}
      ASSETS_PATH: /app/resources/assets
      IMPORT_DATA_PATH: /app/resources/json
      FRONTEND_URL: ${FRONTEND_URL:-http://localhost:4300}
    volumes:
      - ./resources/assets:/app/resources/assets:ro
      - ./resources/json:/app/resources/json:ro
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build: ./frontend
    ports:
      - "4300:80"
    depends_on:
      - backend

volumes:
  pgdata:
```

**Usage:**
```bash
cp .env.example .env
# Edit .env with production values (especially JWT_SECRET and MAIL_*)
docker compose up -d
```

### Development Profile: `docker-compose.dev.yml`

Runs only the database container. Backend and frontend run locally for hot-reload development.

```yaml
services:
  db:
    image: postgres:16-alpine
    ports:
      - "5433:5432"
    environment:
      POSTGRES_DB: pokopia
      POSTGRES_USER: pokopia
      POSTGRES_PASSWORD: pokopia
    volumes:
      - pgdata-dev:/var/lib/postgresql/data

volumes:
  pgdata-dev:
```

**Usage:**
```bash
# Start database only
docker compose -f docker-compose.dev.yml up -d

# Start backend (separate terminal)
cd backend
./mvnw spring-boot:run

# Start frontend (separate terminal)
cd frontend
npm install
ng serve --port 4300
```

---

## Spring Boot Profiles

### `application.yml` (default)

The base configuration used by all profiles:

| Setting | Value | Purpose |
|---|---|---|
| `server.port` | `8088` | Non-default HTTP port |
| `spring.datasource.url` | `${DB_URL}` | Database connection |
| `spring.datasource.username` | `${DB_USERNAME}` | Database auth |
| `spring.datasource.password` | `${DB_PASSWORD}` | Database auth |
| `spring.jpa.hibernate.ddl-auto` | `validate` | Schema validated by Hibernate, managed by Flyway |
| `spring.jpa.open-in-view` | `false` | Prevents lazy loading outside transactions |
| `spring.jpa.show-sql` | `false` | SQL logging disabled by default |
| `spring.flyway.enabled` | `true` | Automatic schema migrations on startup |
| `spring.flyway.locations` | `classpath:db/migration` | Flyway migration script location |
| `spring.jackson.default-property-inclusion` | `non_null` | Omits null fields from JSON responses |
| `jwt.secret` | `${JWT_SECRET}` | JWT signing key |
| `jwt.access-token-expiration-ms` | `900000` | 15 minutes |
| `jwt.refresh-token-expiration-ms` | `604800000` | 7 days |
| `pokopia.assets-path` | `${ASSETS_PATH}` | Asset serving directory |
| `pokopia.import-data-path` | `${IMPORT_DATA_PATH}` | JSON import file directory |
| `pokopia.frontend-url` | `${FRONTEND_URL}` | CORS allowed origin |
| `springdoc.swagger-ui.path` | `/swagger-ui.html` | Swagger UI URL |

### `application-dev.yml` (development)

Overrides for local development:

| Setting | Value | Purpose |
|---|---|---|
| `spring.jpa.show-sql` | `true` | Log SQL queries to console |
| `logging.level.com.pokopia` | `DEBUG` | Verbose application logging |
| `logging.level.org.springframework.security` | `DEBUG` | Security debug logging |

### `application-prod.yml` (production)

Overrides for production deployment:

| Setting | Value | Purpose |
|---|---|---|
| `spring.jpa.show-sql` | `false` | No SQL logging |
| `logging.level.com.pokopia` | `INFO` | Standard logging |
| `logging.level.root` | `WARN` | Minimal framework logging |

Activate profiles via environment variable or command line:
```bash
# Environment variable
SPRING_PROFILES_ACTIVE=dev

# Command line
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

---

## Flyway Database Migrations

Flyway manages the PostgreSQL schema via versioned SQL migration scripts located at:

```
backend/src/main/resources/db/migration/
```

### Migration Files

| File | Description |
|---|---|
| `V1__init_schema.sql` | Creates all tables, indexes, constraints, and enum types |
| `V2__add_refresh_tokens.sql` | Adds refresh_tokens table |
| `V3__add_password_reset_tokens.sql` | Adds password_reset_tokens table |

### Migration Behavior

- Migrations run automatically on application startup when `spring.flyway.enabled=true`.
- Flyway tracks applied migrations in a `flyway_schema_history` table.
- Each migration runs exactly once. Subsequent startups skip already-applied migrations.
- Migrations are transactional -- a failed migration rolls back completely.

### Creating New Migrations

Follow this naming convention:
```
V{next_number}__{description}.sql
```

Example: `V4__add_user_preferences.sql`

**Important**: Never modify an existing migration that has already been applied. Always create a new migration for schema changes.

---

## Security Configuration

### Password Hashing

- Algorithm: BCrypt
- Strength: 12 rounds (configured in `SecurityConfig.java`)

### JWT Cookie Settings

| Attribute | Value | Purpose |
|---|---|---|
| Name | `pokopia_jwt` | Access token cookie |
| HttpOnly | `true` | Prevents JavaScript access (XSS protection) |
| Secure | `true` (prod) / `false` (dev) | HTTPS-only in production |
| SameSite | `Strict` | CSRF protection |
| Path | `/api` | Scoped to API endpoints |
| Max-Age | `900` | 15 minutes (matches token expiry) |

### CORS Configuration

| Setting | Value |
|---|---|
| Allowed Origins | `${FRONTEND_URL}` |
| Allowed Methods | GET, POST, PUT, DELETE, OPTIONS |
| Allowed Headers | Content-Type, Authorization, X-XSRF-TOKEN |
| Allow Credentials | true |
| Max Age | 3600 seconds |

### Public Endpoints (No Authentication Required)

| Pattern | Description |
|---|---|
| `/api/auth/**` | Authentication endpoints |
| `/assets/**` | Static asset serving |
| `/swagger-ui/**` | Swagger UI |
| `/v3/api-docs/**` | OpenAPI specification |
| `/actuator/health` | Health check |

### Protected Endpoints

| Pattern | Required Role |
|---|---|
| `/api/admin/**` | ADMIN |
| `/api/**` (all other) | USER or ADMIN |

---

## Frontend Configuration

### Angular Environments

**`src/environments/environment.ts`** (development):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8088'
};
```

**`src/environments/environment.prod.ts`** (production):
```typescript
export const environment = {
  production: true,
  apiUrl: ''  // Same-origin; frontend Nginx proxies to backend
};
```

### Angular CLI Configuration

Key settings in `angular.json`:

| Setting | Value |
|---|---|
| Default port (`serve.options.port`) | 4300 |
| Style preprocessor | SCSS |
| Build output | `dist/pokopia-tracker/` |

### Nginx Configuration (Production Frontend)

In production Docker builds, the Angular app is served by Nginx. The Nginx configuration proxies API and asset requests to the backend:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://backend:8088;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /assets/ {
        proxy_pass http://backend:8088;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Admin Setup

The first admin user must be manually promoted in the database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

After this, the admin can manage other users and assign/revoke the ADMIN role via the admin UI or API (`PUT /api/admin/users/{id}/role`).
