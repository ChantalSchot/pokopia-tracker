# Pokopia Tracker — Testing Strategy

## Backend Testing

### Framework
- **JUnit 5** — Test framework
- **Mockito** — Mocking framework
- **Spring Boot Test** — Integration test support
- **H2** — In-memory database for integration tests

### Test Configuration

`src/test/resources/application-test.yml`:
- H2 in-memory database (replaces PostgreSQL)
- Flyway disabled (schema managed by Hibernate for tests)
- Test JWT secret
- Test asset paths

### Unit Tests (Service Layer)

**HouseServiceTest** (`service/HouseServiceTest.java`):
- KIT house creation copies capacity from housing kit
- Duplicate house name within same user+region throws ConflictException
- Assigning pokemon to a full house throws BusinessRuleException

**SuggestionServiceTest** (`service/SuggestionServiceTest.java`):
- Full house returns empty suggestions
- House with no idealHabitat returns empty suggestions
- Ditto is excluded from suggestion results

**ImportNormalizerTest** (`importer/ImportNormalizerTest.java`):
- Accent removal (e.g., "Poké" → "poke")
- Lowercase and whitespace trimming
- Null input handling
- Accent-insensitive matching verification
- Case-insensitive matching verification
- Non-matching strings correctly identified

### Integration Tests (Controller Layer)

**AuthControllerTest** (`controller/AuthControllerTest.java`):
- `@WebMvcTest` with MockMvc
- Valid registration returns 201 with username in response
- Missing required fields returns 400

### Test Coverage Goals

| Layer | Target | Focus |
|-------|--------|-------|
| Services | Business logic | Suggestion ranking, warning computation, house rules |
| Importers | Data normalization | Unicode handling, Ditto, timeOfDay filtering |
| Controllers | HTTP contract | Status codes, request validation, role enforcement |
| Security | Auth flow | JWT generation/validation, cookie handling |

---

## Frontend Testing

### Framework
- **Karma** — Test runner
- **Jasmine** — Test framework / assertion library
- **Angular TestBed** — Component/service testing utilities

### Service Tests

**AuthService** (`core/auth/auth.service.spec.ts`):
- Initial signal state (null user, isLoggedIn false)
- Login sets currentUser signal, detects admin role
- Logout clears user signal, navigates to /login
- Refresh updates user on success, clears on failure
- Register/forgotPassword/resetPassword HTTP calls
- Error handling (no state change on HTTP error)

**AuthGuard** (`core/auth/auth.guard.spec.ts`):
- authGuard allows authenticated users
- authGuard redirects unauthenticated to /login
- adminGuard allows admin users
- adminGuard redirects non-admin to /dashboard

**HouseService** (`core/services/house.service.spec.ts`):
- CRUD operations with correct HTTP methods/URLs
- Pokemon assignment/removal
- Items update
- Suggestions and active favourites endpoints
- Query parameter handling

### Component Tests

**PokemonCardComponent** (`shared/components/pokemon-card/pokemon-card.component.spec.ts`):
- Renders pokemon name, number, types
- Type color chips display correctly
- Registered/homeless/warning CSS state classes
- Register/unregister button events
- Event badge display
- Sprite image loading and error handling

### Running Tests

```bash
# Backend
cd backend
./mvnw test

# Frontend
cd frontend
npm test
```
