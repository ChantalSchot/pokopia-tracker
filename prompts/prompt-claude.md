# Claude Sonnet Prompt — Build `pokopia-tracker`

You are a senior full-stack engineer, software architect, product-minded UX engineer, accessibility specialist, DevOps engineer, QA engineer, and technical writer.

Your job is to generate a **fully working, production-quality monorepo** for a web application named **`pokopia-tracker`**.

The output must include **everything needed to clone, configure, run, test, document, and extend the application**. Do **not** give a partial scaffold, pseudo-code, TODO-only structure, or high-level outline. Generate concrete code, concrete files, and concrete documentation.

The stack and requirements below are mandatory unless explicitly challenged during Phase 1 and then confirmed by the user.

---

## Critical working mode: 2-phase flow

You must work in **two distinct phases**.

### Phase 1 — analysis, assumptions, contradictions, decisions

Before generating any code, you must:

1. Read all requirements carefully.
2. Identify:
- assumptions you are making;
- contradictions or ambiguous requirements;
- missing decisions that affect architecture or implementation;
- data-model questions;
- API/security questions;
- UX questions;
- import/data-quality questions;
- anything that could produce incorrect code if guessed silently.
3. Produce a structured **Phase 1 review** containing:
- requirement summary;
- assumptions;
- contradictions or unclear areas;
- recommended decisions;
- proposed architecture;
- proposed entity model;
- proposed auth/authz approach;
- proposed import strategy;
- proposed folder/repository structure;
- proposed API shape;
- notable edge cases.
4. End Phase 1 by asking for confirmation.
5. **Do not generate implementation code in Phase 1.**
6. Wait for explicit user confirmation before starting Phase 2.

### Phase 2 — full code generation after confirmation

Only after the user confirms Phase 1 decisions, generate the full monorepo with all files and code.

If there are still unresolved contradictions after confirmation, state the chosen resolution explicitly before generating code.

---

## Output expectations

In Phase 2, generate a **complete repository** with at least:

- root README;
- repository tree/structure;
- backend application;
- frontend application;
- PostgreSQL setup;
- Dockerfiles for backend, frontend and database;
- docker-compose setup for all needed services;
- data import/seed loader for JSON files;
- full authentication and authorization implementation;
- tests for backend and frontend;
- API documentation;
- architecture documentation;
- data model documentation;
- import-flow documentation;
- setup and run documentation for Docker and non-Docker local development;
- environment/config examples;
- validation/error-handling/loading-state implementation;
- accessibility considerations;
- sensible developer experience configuration.

The codebase must be coherent and runnable, not merely illustrative.

---

## Product overview

Build a user-friendly tracker for **Pokémon Pokopia** that helps users:

- keep an overview of their Pokémon;
- track which Pokémon they have registered;
- manage houses and regions;
- assign Pokémon to houses;
- move Pokémon between houses/regions;
- manage items linked to houses;
- see which favourites are active in a house based on assigned items;
- plan house composition around favourites and habitat compatibility;
- identify “homeless” registered Pokémon not assigned to any house;
- track progress on collection and housing;
- browse master data such as Pokémon, items, habitats, housing kits, specialties, and favourites;
- let admins manage users, imported master data and reload/import/export JSON sources.

---

## Mandatory technical stack

Use exactly this baseline unless explicitly revised in Phase 1 and confirmed by the user:

- **Database:** PostgreSQL
- **Back end:** Java Spring Boot
- **Persistence:** Spring Data JPA / Hibernate
- **Security:** Spring Security
- **Front end:** Angular
- **UI library:** Angular Material
- **Styling:** SCSS with design tokens / variables
- **Containerization:** Docker + docker-compose

---

## Port rules

Do **not** use default framework ports.

Use explicit non-default ports and document them clearly. Prefer:

- frontend: `4300`
- backend: `8088`
- postgres: `5433` externally mapped, or another explicit non-default port if justified

Document all ports in README, Docker docs, environment examples, and setup instructions.

---

## Accessibility and UX rules

The frontend must:

- follow **WCAG-oriented accessibility practices**;
- be responsive and mobile-friendly;
- include proper keyboard accessibility;
- include visible focus states;
- provide accessible forms, labels, validation, feedback, and modal/dialog behavior;
- provide loading, empty, success, and error states;
- have a top navigation/menu bar, with a collapsed hamburger menu on mobile;
- keep filters fixed on the right side on relevant pages, with filter area independently scrollable from the content grid where practical on desktop;
- be polished, modern, accessible, and consistent.

Visual direction:

- the UI should feel inspired by **Pokémon Pokopia** style and assets while remaining clean and accessible;
- find public references/screenshots/web pages to infer a suitable palette and mood;
- define **light and dark themes**;
- use **SCSS design tokens/variables** so color and theme changes are centralized;
- changing a token in one place should propagate throughout the app.

Do not sacrifice accessibility for theme accuracy.

---

## Naming rules

Important text/content rule:

- in user-facing frontend text, always write **“Pokémon”** with the accent, and **“Pokédex”** similarly where visible;
- in code, classes, files, variables, identifiers, database names, etc., always use plain ASCII forms like `pokemon`, `pokedex`, etc., unless in comments or user-visible text.

---

## High-level data domains

The application works with a large data set containing:

- pokemon
- housing kits
- items
- favourites
- habitats
- specialties
- users
- houses

Notes:

- `houses` are created by users and linked through user id;
- imported master data is loaded once initially, then only admins may edit or reload it;
- normal users may edit only their own profile-related and user-owned data.

---

## Data-model rules

These rules are mandatory unless Phase 1 flags a contradiction:

### Global entity rules

- Every entity must have an `id` property.
- IDs must be random UUIDs.
- If an entity does not already provide an id, ensure it is automatically generated and persisted via Spring Data JPA.
- Model relationships and constraints explicitly.
- Add validation rules at DTO/entity/request level as appropriate.
- Use enums where applicable, especially when a string property has about 15 or fewer possible values.

### Pokémon rules

- Pokémon number is a **string**, e.g. `#001`.
- `pokemon.types` must be enum-based where appropriate.
- `litterdrop`, `rarity`, and `timeofday` must be enums.
- Each Pokémon always has **exactly 6 favourites**.
- One of those favourites is a **flavour** favourite that **does not** have items linked to it and **cannot** be added to houses.
- This flavour favourite still belongs to the Pokémon’s six favourites, but must be handled correctly in logic and UI.

### Habitat rules

- Habitats contain linked Pokémon ids by Pokémon **number** values, e.g. `[#001, #025]`.
- Habitats are background/master data, not user-created houses.
- The app must support identifying whether all Pokémon in a habitat are registered by the current user.

### House rules

- Houses belong to a user.
- Houses must be assigned to exactly **one region**.
- Houses may have an `idealHabitat`.
- The only valid options for house `idealHabitat` are values found in the `idealHabitat` property from `pokemon.json`.
- Represent `idealHabitat` as a string enum based on importable source values.
- In house details/properties, this should be called **“habitat”** in the UI, but should be clearly distinguished in documentation from the separate imported `habitats` dataset.
- Houses may have items linked to them.
- Linked items must be visibly split in UI by item type/grouping: `decoration`, `relaxation`, `toy`, or `none` / untyped category according to data handling rules.
- Houses have a derived list of favourites that are present in that house, based on assigned items.
- **Do not persist active/present favourites for a house in the database**; compute them.
- House type is one of: `habitat`, `custom`, `kit`.
- A `habitat` type house references a habitat record for source information such as size, but is only a house type choice and should not create broader semantic coupling than required.
- A `kit` type house references a housing-kit record and copies/derives relevant information such as size upon creation, without creating unnecessary ongoing coupling.
- House name is user-editable.
- House description is user-editable.
- House name must be **unique per user within a region**.
- Width/depth/height are editable only for `custom` houses.
- Size is never directly editable.
- If a house region changes, the user must specify whether Pokémon move with the house to the new region. Pokémon that do not move with the house, will become homeless.
- Deleting a house makes its assigned Pokémon homeless.

### Capacity rules

- Max Pokémon in a house:
- `kit` house: based on housing-kit size;
- `custom` house: 4;
- `habitat` house: 1.
- A Pokémon can be assigned to **only one house at a time**.
- Multiple Pokémon can be assigned to one house if the house has capacity.
- Reassigning a Pokémon to a different house will implicitly remove it from the previous house; make the behavior explicit and documented.

### Item rules

- Items can be linked to many houses, and houses can have many items.
- When editing items for a house, show item list with:
- corresponding favourite they activate,
- item type (`decoration` / `toy` / `relaxation` / `none`),
- filtering by one or more favourites or item types.
- Ignore the original JSON item properties `usedInHabitats` and `craftingRecipeId` completely; do not add them to the database or business model.

### User rules

- Users authenticate via **email + password**.
- Email must be unique.
- Username must be unique.
- Users can change username, email, and password.
- Users have a list of houses.
- Users have an array/list of registered Pokémon based on Pokémon ids.
- Do not implement 2FA in v1, but design the auth architecture so it can be extended later.

---

## Imported source material

Assume the repository contains importable JSON data and asset folders.

JSON sources:

- `favourites.json`
- `habitats.json`
- `housing-kits.json`
- `items.json`
- `pokemon.json`
- `specialties.json`

Assets folders:

- `habitats`
- `housing-kits`
- `items`
- `pokemon`
- `specialties`

The importer must:

- load master data from JSON files;
- map JSON fields to database entities explicitly;
- validate and document mappings;
- support reload-by-admin via API, either all data or a specific dataset/table;
- document import order and dependency handling;
- document id-generation behavior;
- document asset-folder handling and static serving strategy;
- gracefully handle duplicate import/reload scenarios;
- define whether imports are upsert-based, replace-based, or otherwise, and explain the trade-offs.

---

## Authentication and authorization

Requirements:

- all endpoints except login/register must require authentication;
- use role-based authorization;
- support at least roles: `USER`, `ADMIN`;
- admin pages must not be visible to non-admin users;
- first admin will be set manually in the database for the user’s own account;
- implement proper password hashing;
- implement password reset via email;
- design for future extensibility such as 2FA, refresh token strategy, email verification, etc., even if not all are implemented now.

In Phase 1, state and justify the chosen auth model, for example JWT-based stateless auth or another suitable approach.

Document:

- authentication flow;
- authorization model;
- security configuration;
- protected routes/pages;
- role checks in backend and frontend;
- password rules;
- token/session lifecycle;
- major security considerations.

---

## Normal user functionality

Implement at least the following for normal authenticated users.

### Account and profile

- register account when not logged in;
- login;
- logout;
- change password;
- change details such as username and email;
- unique username and unique email enforcement.

### Dashboard

Create a dashboard page showing:

- total registered Pokémon count out of total Pokémon;
- how many registered Pokémon are housed;
- list/grid of registered Pokémon not assigned to any house (“homeless”);
- useful progress indicators and summary cards.

### Pokédex

Provide a Pokédex page with:

- grid/cards of all available Pokémon;
- visually distinct cards for registered vs non-registered Pokémon;
- visually distinct indicators for homeless registered Pokémon;
- cards should at least contain the following information for a Pokémon:
  - sprite (image) of the pokemon
  - name
  - number
  - types (with icons, include alt + hover text)
  - specialties (with icons, include alt + hover text)
- Pokémon detail modal/dialog with all information about that Pokémon;
- ability to toggle registered boolean/state;
- ability to assign a house from the Pokédex context as well.

Filtering/sorting should support many relevant properties, including examples below where applicable and technically sound:

- type
- assigned house
- specialties
- litterDrop
- favourites
- idealHabitat
- rarity
- isEvent
- assigned region (derived from current house if housed)
- house type (habitat vs kit vs custom)
- housed vs homeless (excludes unregistered Pokémon)
- registered vs unregistered

Document all implemented filters and any performance approach.

### Houses

Provide a houses page with grid and modal/details editing.

Users must be able to:

- create a house;
- edit a house;
- delete a house;
- assign region;
- assign or remove one or more Pokémon;
- move one or more Pokémon between houses;
- assign or remove one or more items;
- set habitat type on the house (choose from the "idealHabitat" enum only);
- edit name/description;
- edit dimensions only where allowed for custom houses.

Houses page should support filters for at least:

- region
- habitat type (based on "idealHabitat" enum)
- available spots (houses not full)
- favourites

### Suggestions logic

Implement and document suggested Pokémon for a house.

Rules:

- only suggest Pokémon whose `idealHabitat` matches the house `idealHabitat`;
- if items are present, suggest based on favourites active in that house plus `idealHabitat` match;
- if no items are present yet, match based on house habitat plus favourites of Pokémon already in that house;
- if the house is full, show no suggestions;
- make the suggestion logic explicit, deterministic, and documented;
- document tie-breakers, ranking logic, and edge cases.

### Warnings

If **none** of the favourites of a Pokémon assigned to a house is active in that house, show a warning state/icon/color for that Pokémon in the relevant UI.

Clarify in Phase 1 how the non-item flavour favourite affects this rule.

### Items page

Provide a grid of items with filtering by:

- favourite(s)
- type
- category

### Habitats page

Provide a grid of unique habitats.

Requirements:

- indicate whether all Pokémon in that habitat have been registered by the user;
- visually distinguish fully completed habitats;
- allow filter on non-completed habitats;
- habitats are informational/master data, not houses;
- support useful display details and possibly hover detail if accessible and also available through keyboard/focus interactions.

### Profile page

Provide a profile page for user account management.

---

## Admin functionality

Add admin-only pages and APIs.

Admins can:

- reload JSON data via API, for all data or a specific table/dataset;
- view, edit, add, delete users;
- add/remove admin role from users;
- view, edit, add, delete imported master data that normal users cannot edit of the following:
  - pokemon
  - habitats
  - items
  - favourites
  - specialties
  - housing kits
- generate a new `.json` file based on current data for any of these master-data types.

Admin pages:

- must be hidden/inaccessible for non-admin users;
- must be protected both in frontend route guards and backend authorization.

---

## Frontend page list

Include these frontend pages/routes at minimum:

- login/homepage (default when not logged in)
- dashboard
- pokedex
- houses
- items
- habitats
- profile
- admin pages as needed

Use a clean, maintainable Angular architecture.

---

## API and backend requirements

The backend must include:

- clear layered architecture;
- controllers, services, repositories, DTOs, mappers, validation, exception handling;
- secure auth endpoints;
- protected REST endpoints for application features;
- role-based admin endpoints;
- business rule enforcement in service layer;
- consistent error response shape;
- pagination/filtering strategy where appropriate;
- import endpoints;
- export endpoints for admin JSON generation where required.

Document all API endpoints with:

- method
- path
- auth requirement
- role requirement
- request DTO
- response DTO
- validation rules
- important business rules
- error cases

If suitable, include OpenAPI/Swagger support and document it.

---

## Validation, error handling, and business rules

Be explicit and comprehensive.

Include:

- backend bean validation and domain validation;
- frontend form validation;
- user-friendly error feedback;
- success feedback after important actions;
- loading states and disabled states during async operations;
- guardrails around invalid house assignments, duplicate usernames/emails, invalid imports, and unauthorized access.

Document:

- validation rules;
- business rules;
- edge cases;
- expected system behavior for invalid operations.

---

## Testing requirements

Include meaningful tests for both backend and frontend.

### Backend

Include a practical test strategy and code such as:

- unit tests for service/business logic;
- integration tests for controllers/repositories/security/import flow where valuable;
- test coverage around auth, validation, house assignment, suggestion logic, and admin permissions.

### Frontend

Include tests such as:

- component tests;
- service tests;
- tests for guards/interceptors where used;
- tests for "active favourite" logic for houses depending on items in that house;
- tests for critical UI flows and state handling.

Document how to run tests.

---

## Documentation requirements

The generated repository must include strong documentation.

At minimum include:

1. **README.md** covering:
- project overview;
- features;
- stack;
- repository structure;
- prerequisites;
- setup;
- environment variables;
- Docker usage;
- non-Docker local development;
- import flow;
- running tests;
- ports;
- default admin note;
- troubleshooting.

2. **Architecture documentation** covering:
- system overview;
- frontend/backend responsibilities;
- auth approach;
- data flow;
- import flow;
- deployment/dev topology.

3. **Data model documentation** covering:
- entities;
- enums;
- relationships;
- constraints;
- derived values;
- mapping from JSON input to entities.

4. **API documentation** covering:
- endpoint catalog;
- request/response structures;
- validation;
- auth requirements;
- examples where useful.

5. **Repository structure documentation**.

6. **Import/seed documentation** covering:
- source files;
- import order;
- id generation;
- handling of updates/reloads;
- ignored JSON fields;
- asset handling.

7. **Testing strategy documentation**.

8. **Configuration documentation** including sample `.env` or equivalent config values.

The docs should be concrete and aligned to the actual generated code.

---

## Required repository content

Generate a coherent monorepo, for example:

- `/README.md`
- `/docker-compose.yml`
- `/docs/...`
- `/backend/...`
- `/frontend/...`
- `/resources/json/...`
- `/resources/assets/...`

You may refine the exact structure, but it must be clear, scalable, and documented.

Include:

- `.gitignore`
- example env/config files
- Dockerfiles
- scripts if helpful
- test setup/config
- lint/format config where appropriate

---

## Frontend implementation guidance

Build a real Angular app with:

- route structure;
- authentication handling;
- route guards;
- interceptors for auth/error handling if appropriate;
- Angular Material UI components;
- responsive layout;
- reusable components;
- typed models/interfaces;
- SCSS theming and tokens;
- clear state handling;
- accessible dialogs/modals;
- iconography and visual feedback.

Use sprites/images where applicable for:

- pokemon
- habitats
- items
- housing-kits
- specialties

Ensure asset-path handling is documented and implemented consistently. imagePaths and spritePaths in the master import data can be mass-adjusted to change paths if needed before the data is imported for the first time of setting up the project.

---

## Backend implementation guidance

Build a real Spring Boot app with:

- modern project organization;
- entities + DTOs + mappers;
- repositories;
- services;
- controllers;
- security config;
- auth endpoints;
- user profile endpoints;
- pokemon/houses/items/habitats/admin endpoints;
- import service(s);
- export service(s) for admin JSON generation;
- exception handling;
- validation;
- clear configuration.

Prefer maintainable patterns over cleverness.

---

## Specific modeling and logic notes to preserve

Make sure the implementation and docs reflect all of these:

- registered Pokémon are tracked per user;
- a registered Pokémon can still be homeless;
- homeless = registered and not assigned to any house;
- a Pokémon can only belong to one house at a time;
- changing a house’s region can either move its Pokémon with it, or its assigned Pokémon homeless depending on user choice;
- deleting a house makes assigned Pokémon homeless;
- active favourites for a house are derived client-side during editing for instant UI feedback, and should also be reproducible via backend/domain logic as needed for consistency, but should not be stored as persistent state;
- suggestion logic must be explicit and documented;
- if a house is full, suggestions are empty;
- if no items exist, suggestion logic falls back to Pokémon already in house plus habitat matching;
- flavour favourites do not map to addable items;
- ignore `usedInHabitats` and `craftingRecipeId` from item source JSON;
- habitats link Pokémon by Pokémon `number` string, not entity UUID;
- multiple Pokémon can have the same `number`, in which case all are linked to the corresponding habitat;
- `idealHabitat` enum options are derived from source data values.

---

## Quality bar

The generated result must feel like a serious, maintainable project made by an experienced engineer.

That means:

- complete code, not stubs;
- consistent naming;
- no contradictory docs;
- explicit constraints and validations;
- meaningful tests;
- good separation of concerns;
- secure defaults;
- accessible UI;
- clean repository organization;
- clear setup instructions;
- clear comments only where they add value;
- no unnecessary placeholder text;
- no fake implementations masquerading as complete.

---

## Required output format from Claude

In **Phase 1**, output:

1. Requirement summary.
2. Assumptions.
3. Contradictions / ambiguities / questions.
4. Recommended decisions.
5. Proposed architecture.
6. Proposed data model and relationships.
7. Proposed auth/authz design.
8. Proposed import strategy.
9. Proposed repository structure.
10. Edge cases and business-rule clarifications.
11. A clear request for confirmation before Phase 2.

In **Phase 2**, output the project in a structured way that is easy to copy into files, including:

- repository tree;
- file-by-file content;
- docs;
- setup instructions;
- tests;
- config;
- Docker setup;
- any generated sample env files.

If the response is too large, split it into logical parts and label them clearly, but still aim to provide the **complete** project.

---

## Recommended architectural expectations

Unless a better confirmed choice is justified in Phase 1, prefer something like:

- Angular SPA frontend consuming REST APIs;
- Spring Boot REST backend;
- PostgreSQL relational database;
- JWT-based authentication with role claims;
- JPA entities with UUID ids;
- DTO-driven API boundaries;
- import services for JSON master data;
- admin-only edit/reload/export operations;
- clear distinction between master data and user-owned mutable data.

You may improve on these, but explain deviations first.

---

## Include these docs explicitly

Make sure the generated repository includes content documenting:

- API contract/endpoints;
- validation rules;
- business rules;
- edge cases;
- seed/import flow from JSON;
- asset-folder handling;
- test strategy for backend and frontend;
- local development steps;
- Docker development steps;
- configuration and sample values;
- security/authentication/authorization approach;
- repository structure and architecture decisions.

---

## Source/background references to account for

Background/source data is based on these repository resources and files:

Repository reference:
- `https://github.com/ChantalSchot/pokopia-tracker/tree/main/resources/json`

Expected input JSON files:
- `favourites.json`
- `habitats.json`
- `housing-kits.json`
- `items.json`
- `pokemon.json`
- `specialties.json`

Expected asset folders:
- `habitats`
- `housing-kits`
- `items`
- `pokemon`
- `specialties`

Use those source structures to inform import mapping and asset handling, but do not assume undocumented fields without calling them out in Phase 1.

---

## Final instruction

Be rigorous. If something is ambiguous, surface it in **Phase 1** instead of guessing silently. Do not begin Phase 2 until the user confirms.
