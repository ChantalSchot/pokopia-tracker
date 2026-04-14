# Testing Strategy

This document describes the testing approach, tooling, and coverage targets for the Pokopia Tracker application across both backend and frontend.

---

## Overview

The project maintains tests at multiple levels to ensure correctness of business logic, data integrity, security enforcement, and UI behavior. The testing pyramid emphasizes unit tests at the base, with integration tests for controller/security contracts and component tests for frontend interactions.

---

## Backend Testing

### Frameworks and Tools

| Tool | Purpose |
|---|---|
| JUnit 5 | Test framework and assertions |
| Mockito | Mocking dependencies in unit tests |
| Spring Boot Test | `@SpringBootTest`, `@WebMvcTest`, `@DataJpaTest` support |
| MockMvc | HTTP-level controller integration testing |
| H2 Database | In-memory database for integration tests (PostgreSQL compatibility mode) |
| AssertJ | Fluent assertions |

### Test Configuration

A dedicated test profile is configured at `src/test/resources/application-test.yml`:

- H2 in-memory database with PostgreSQL compatibility mode (replaces PostgreSQL for tests)
- Flyway disabled (schema managed by Hibernate `ddl-auto: create-drop` in test profile)
- Test-specific JWT secret and short token expiration
- Test asset paths pointing to `src/test/resources/test-assets/`

### Unit Tests (Service Layer)

Service unit tests use Mockito to mock repository and other service dependencies, testing business logic in isolation.

**HouseServiceTest** (`service/HouseServiceTest.java`):

| Test Case | Validates |
|---|---|
| Create CUSTOM house sets maxSize to 4 | House capacity rules |
| Create HABITAT house sets maxSize to 1 | House capacity rules |
| Create HOUSING_KIT house copies size from kit | House capacity derivation |
| Assign Pokemon to full house throws exception | Capacity enforcement |
| Assign unregistered Pokemon throws exception | Registration prerequisite |
| Assign Pokemon already in another house moves it | Implicit reassignment |
| Delete house sets assigned Pokemon to homeless | Cascade behavior |
| Duplicate house name in same region throws conflict | Uniqueness constraint |
| Update region after creation throws exception | Region immutability |
| Update dimensions on non-CUSTOM house throws exception | Edit restrictions |

**SuggestionServiceTest** (`service/SuggestionServiceTest.java`):

| Test Case | Validates |
|---|---|
| Full house returns empty suggestions | Capacity check |
| House with no idealHabitat returns empty suggestions | Prerequisite check |
| Suggestions filtered by matching idealHabitat | Habitat matching |
| Suggestions ranked by matching favourite count | Ranking logic |
| Ditto excluded from suggestions | Special case |
| Professor Tangrowth excluded from suggestions | Exclusion rule |
| No items: fallback to favourites of assigned Pokemon | Fallback logic |
| Flavour favourites excluded from active computation | Flavour handling |

**ActiveFavouriteServiceTest** (`service/ActiveFavouriteServiceTest.java`):

| Test Case | Validates |
|---|---|
| House with no items returns empty active favourites | Empty case |
| Items activating multiple categories all returned | Multi-category activation |
| Flavour favourites never appear in active list | Flavour exclusion |
| Duplicate items counted once | Deduplication |

**PokemonWarningServiceTest** (`service/PokemonWarningServiceTest.java`):

| Test Case | Validates |
|---|---|
| Pokemon with matching active favourites has no warning | Normal case |
| Pokemon with zero matching active favourites has warning | Warning detection |
| Ditto never has warning | Special case |
| Only non-flavour favourites considered for warnings | Flavour exclusion |

**UserPokemonServiceTest** (`service/UserPokemonServiceTest.java`):

| Test Case | Validates |
|---|---|
| Register Pokemon creates UserPokemon record | Registration |
| Register already-registered Pokemon throws conflict | Duplicate prevention |
| Unregister Pokemon assigned to house removes from house | Cascade |
| Unregister Pokemon not owned by user throws forbidden | Ownership check |

### Import Tests

**ImportNormalizerTest** (`importer/ImportNormalizerTest.java`):

| Test Case | Validates |
|---|---|
| Accent removal (e.g. "Poke Ball" from "Poke\u0301 Ball") | NFKD normalization |
| Non-breaking space normalized to regular space | Unicode normalization |
| Lowercase conversion | Case normalization |
| Whitespace trimming | Trim |
| Null input returns null | Null safety |
| Matching normalized names returns true | Positive match |
| Non-matching normalized names returns false | Negative match |

**PokemonImporterTest** (`importer/PokemonImporterTest.java`):

| Test Case | Validates |
|---|---|
| Ditto favourites "none" results in empty list | Ditto handling |
| Empty litterDrop string mapped to null | Field normalization |
| Invalid timeOfDay values filtered out | TimeOfDay filtering |
| Valid timeOfDay values retained | TimeOfDay filtering |
| Null rarity remains null | Nullable enum handling |

**FavouriteImporterTest** (`importer/FavouriteImporterTest.java`):

| Test Case | Validates |
|---|---|
| 5 flavour favourites synthesized with isFlavour=true | Synthesis |
| Flavour favourites have deterministic UUIDs | Idempotency |
| Reimport does not duplicate flavour favourites | Upsert safety |

### Controller Integration Tests

Controller tests use `@WebMvcTest` with MockMvc to verify HTTP semantics, request validation, and role-based access.

**AuthControllerTest** (`controller/AuthControllerTest.java`):

| Test Case | Validates |
|---|---|
| POST /api/auth/register with valid data returns 201 | Registration endpoint |
| POST /api/auth/register with missing fields returns 400 | Validation |
| POST /api/auth/register with duplicate email returns 409 | Conflict handling |
| POST /api/auth/login with valid credentials returns 200 + cookie | Login flow |
| POST /api/auth/login with wrong password returns 401 | Auth failure |
| POST /api/auth/logout clears JWT cookie | Logout |
| POST /api/auth/refresh with valid refresh token returns new JWT | Token refresh |

**HouseControllerTest** (`controller/HouseControllerTest.java`):

| Test Case | Validates |
|---|---|
| GET /api/houses returns user's houses only | Ownership scoping |
| POST /api/houses with valid data returns 201 | House creation |
| PUT /api/houses/{id} by non-owner returns 403 | Authorization |
| DELETE /api/houses/{id} returns 204 | Deletion |
| POST /api/houses/{id}/pokemon/{pokemonId} to full house returns 400 | Capacity enforcement via HTTP |

### Security Tests

**SecurityConfigTest** (`security/SecurityConfigTest.java`):

| Test Case | Validates |
|---|---|
| Public endpoints accessible without auth | Auth whitelist |
| Protected endpoints return 401 without JWT | Auth enforcement |
| Admin endpoints return 403 for USER role | Role enforcement |
| Admin endpoints accessible for ADMIN role | Role access |
| Expired JWT returns 401 | Token expiration |

### Test Coverage Goals

| Layer | Target Coverage | Focus Areas |
|---|---|---|
| Service | 80%+ | Business logic, capacity rules, suggestion ranking, warning computation |
| Importer | 90%+ | Normalization, Ditto handling, TimeOfDay filtering, upsert logic |
| Controller | 70%+ | HTTP status codes, request validation, role enforcement |
| Security | 80%+ | JWT lifecycle, cookie handling, role checks |
| Repository | Selective | Custom query methods only (standard Spring Data methods not tested) |

---

## Frontend Testing

### Frameworks and Tools

| Tool | Purpose |
|---|---|
| Karma | Test runner |
| Jasmine | Test framework and assertions |
| Angular TestBed | Component and service testing utilities |
| HttpClientTestingModule | HTTP mock support for service tests |

### Service Tests

**AuthService** (`core/auth/auth.service.spec.ts`):

| Test Case | Validates |
|---|---|
| Initial state: currentUser signal is null | Default state |
| Initial state: isLoggedIn signal is false | Default state |
| Login sets currentUser signal from response | State update |
| Login detects admin role correctly | Role detection |
| Logout clears currentUser signal | State cleanup |
| Logout navigates to /login | Navigation |
| Refresh updates user on success | Token refresh |
| Refresh clears user on 401 | Session expiry handling |
| Register calls POST /api/auth/register | HTTP contract |
| Forgot password calls POST /api/auth/forgot-password | HTTP contract |
| HTTP error does not change user state | Error resilience |

**AuthGuard** (`core/auth/auth.guard.spec.ts`):

| Test Case | Validates |
|---|---|
| Authenticated user passes authGuard | Guard allows |
| Unauthenticated user redirected to /login | Guard blocks |
| Admin user passes adminGuard | Admin guard allows |
| Non-admin user redirected to /dashboard | Admin guard blocks |

**HouseService** (`core/services/house.service.spec.ts`):

| Test Case | Validates |
|---|---|
| getHouses sends GET with query params | List endpoint |
| createHouse sends POST with request body | Create endpoint |
| updateHouse sends PUT with request body | Update endpoint |
| deleteHouse sends DELETE | Delete endpoint |
| assignPokemon sends POST to correct URL | Assignment endpoint |
| removePokemon sends DELETE to correct URL | Removal endpoint |
| getActiveFavourites returns favourite list | Computed data endpoint |
| getSuggestions returns suggestion list | Suggestion endpoint |

**PokemonService** (`core/services/pokemon.service.spec.ts`):

| Test Case | Validates |
|---|---|
| getPokemon sends GET with filter params | List endpoint with filters |
| getPokemonById sends GET to /api/pokemon/{id} | Detail endpoint |
| registerPokemon sends POST to /api/users/me/pokemon | Registration endpoint |
| unregisterPokemon sends DELETE | Unregistration endpoint |

### Component Tests

**PokemonCardComponent** (`shared/components/pokemon-card/pokemon-card.component.spec.ts`):

| Test Case | Validates |
|---|---|
| Renders Pokemon name and number | Data binding |
| Displays type chips with correct labels | Type rendering |
| Shows "Registered" class when registered | Visual state |
| Shows "Homeless" class when homeless | Visual state |
| Shows warning icon when hasWarning is true | Warning display |
| Shows event badge for event Pokemon | Event indicator |
| Emits register event on toggle click | User interaction |
| Sprite image displays with correct src | Image binding |
| Sprite error falls back to placeholder | Error handling |

**DashboardComponent** (`features/dashboard/dashboard.component.spec.ts`):

| Test Case | Validates |
|---|---|
| Displays total and registered Pokemon counts | Summary cards |
| Displays housed count | Statistics |
| Renders homeless Pokemon grid | List rendering |
| Shows loading spinner while data loads | Loading state |
| Shows empty state when no homeless Pokemon | Empty state |

**HouseDetailComponent** (`features/houses/house-detail/house-detail.component.spec.ts`):

| Test Case | Validates |
|---|---|
| Displays house name, type, and region | Data rendering |
| Shows capacity indicator (assigned/max) | Capacity display |
| Lists assigned Pokemon with sprites | Pokemon list |
| Lists items grouped by type | Item grouping |
| Displays active favourites as chips | Favourite display |
| Shows warning for Pokemon with no active favourites | Warning rendering |
| Suggestion list renders when house not full | Suggestions |
| Suggestion list hidden when house is full | Conditional display |

### Running Tests

```bash
# Backend tests
cd backend
./mvnw test

# Backend tests with coverage report
./mvnw test jacoco:report
# Report at: backend/target/site/jacoco/index.html

# Frontend tests
cd frontend
npm test

# Frontend tests (single run, headless)
npm run test -- --watch=false --browsers=ChromeHeadless

# Frontend tests with coverage
npm run test -- --watch=false --code-coverage
# Report at: frontend/coverage/index.html
```

---

## Test Data Strategy

### Backend Test Data

- Service unit tests use Mockito to construct test entities directly in Java.
- Integration tests use a `TestDataFactory` utility class that creates common test entities (Users, Pokemon, Houses, Items) with sensible defaults.
- The H2 in-memory database is recreated for each test class (`ddl-auto: create-drop`).

### Frontend Test Data

- Component tests use mock data objects matching TypeScript interfaces.
- A `test-helpers/mock-data.ts` file provides factory functions for creating test Pokemon, Houses, Items, and Users.
- HttpClientTestingModule intercepts and mocks all HTTP calls.

---

## Continuous Integration Notes

For CI pipelines, the following commands run all tests:

```bash
# Full backend test suite
cd backend && ./mvnw clean verify

# Full frontend test suite (headless)
cd frontend && npm ci && npm run test -- --watch=false --browsers=ChromeHeadless
```

Both commands return non-zero exit codes on test failure, suitable for CI gate enforcement.
