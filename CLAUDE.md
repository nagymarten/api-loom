# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

API Loom is an Angular-based OpenAPI/Swagger specification editor and viewer. It allows users to view, edit, and manage API specifications (both Swagger 2.0 and OpenAPI 3.x) with a visual interface. The application integrates with Keycloak for authentication and stores specifications both locally (localStorage) and remotely via a backend API.

## Development Commands

### Start Development Server
```bash
npm start
# or
ng serve
```
The dev server runs on `http://localhost:4200/` with a proxy configured to forward `/api` requests to `http://localhost:8085`.

### Build
```bash
npm run build              # Production build
ng build --configuration development  # Development build
```

### Linting
```bash
npm run lint
# or
ng lint
```

### Testing
```bash
npm test
# or
ng test
```

### Generate Components/Services
```bash
ng generate component component-name
ng generate service service-name
```

## Architecture Overview

### Authentication & Authorization
- **Keycloak Integration**: The app uses `keycloak-angular` for SSO authentication
  - Configured in `app.config.ts` with realm `apiloom` and client ID `apiloom-fe`
  - Default Keycloak server: `http://localhost:38082`
  - Auto-refresh token enabled with 15-minute session timeout
  - Login required on application load
- **AuthService** (`services/auth.service.ts`): Wrapper around KeycloakService for login/logout operations
- **API Client**: Uses `@ingenimind/apiloom-api-client` package with token injection via Keycloak

### State Management & Data Flow
- **ApiDataService** (`services/api-data.service.ts`): Central service managing Swagger/OpenAPI specifications
  - Stores specs in `localStorage` under keys: `swaggerSpec`, `swaggerSpecs`, `selectedSwaggerKey`
  - Manages multiple specs with selection state
  - Syncs with backend via `RawJsonService` from API client
  - Uses RxJS `BehaviorSubject` for reactive state updates
  - Key methods:
    - `getAllSwaggerSpecs()`: Gets all specs from localStorage
    - `setSelectedSwaggerSpec(key)`: Switches active spec
    - `updateSwaggerSpec(spec)`: Updates spec in memory and storage
    - `getAllSwaggerSpecsFromApi()`: Fetches from backend and syncs to localStorage
    - `saveSwaggerToDatabase()`: Persists spec to backend

### Swagger/OpenAPI Handling
- **Dual Version Support**: Handles both Swagger 2.0 (`definitions`) and OpenAPI 3.x (`components.schemas`)
- **ExtendedSwaggerSpec Interface**: Custom type extending base Swagger spec with OpenAPI 3.x properties
- **Version Detection**: Components check `spec.openapi` vs `spec.swagger` to determine structure

### Core Components

#### IndexComponent (`common/index`)
- Landing page/dashboard
- Displays authenticated user info
- Entry point for navigation

#### PathsComponent (`common/paths`)
- Edit API paths/endpoints with HTTP methods
- Tabs for: General info, Parameters, Request body, Responses
- Real-time updates to selected Swagger spec
- Parameter management via `ParametersComponent`
- Response management via `ResponsesComponent`

#### SchemasComponent (`common/schemas`)
- Visual schema/model editor
- Tree view for nested object structures
- Tabs for: Schema definition, Examples, Extensions
- Supports schema types: object, array, enum, allOf, oneOf, anyOf
- Schema renaming and updates propagate to entire spec

#### ResponsesComponent (`common/paths/responses`)
- Manages API responses per status code
- Edit response descriptions, headers, and body schemas
- Reference resolution for `$ref` pointers

#### ReferenceComponent (`common/reference`)
- View and navigate schema references
- Resolves `$ref` pointers across the spec

### Routing Structure
Routes are defined in `app.routes.ts`:
- `/` → IndexComponent
- `/path/:path/:method` → PathsComponent
- `/schemas` → SchemasComponent (list view)
- `/schemas/:schema` → SchemasComponent (specific schema)
- `/responses` → ResponsesComponent (list view)
- `/responses/:response` → ResponsesComponent (specific response)
- `/reference/:reference` → ReferenceComponent

### Internationalization (i18n)
- Uses `@ngx-translate/core` with JSON translation files
- Supported languages: English (en), German (de), Hungarian (hu)
- Translation files in `src/assets/i18n/`
- Language preference stored in localStorage under `language` key

### UI Framework
- **PrimeNG**: Primary component library (buttons, tables, tabs, dialogs, etc.)
- **Angular Material**: Secondary components (grid lists, form fields, icons)
- **Tailwind CSS**: Utility-first styling with PrimeUI theme
- **ag-grid**: Advanced data grids in schema views

### Proxy Configuration
The dev server proxies `/api` requests to the backend at `http://localhost:8085` (configured in `proxy.conf.json`). This avoids CORS issues during development.

## Important Patterns

### Updating Swagger Specs
When modifying a spec, always follow this pattern:
1. Get the current spec: `apiDataService.getSelectedSwaggerSpecValue()`
2. Modify the spec object
3. Update in service: `apiDataService.updateSwaggerSpec(spec)`
4. Save to storage: `apiDataService.saveSwaggerSpecToStorage(spec)`
5. Optionally save to backend: `apiDataService.saveSwaggerToDatabase(filename, spec)`

### Spec Version Handling
Check version before accessing schemas:
```typescript
if (swaggerSpec.openapi) {
  // OpenAPI 3.x - use swaggerSpec.components.schemas
} else {
  // Swagger 2.0 - use swaggerSpec.definitions
}
```

### Translation Keys
Translation keys follow the pattern: `COMPONENT.SECTION.KEY` (e.g., `PATHS.WARNINGS.API_PATH_NOT_FOUND`)

## TypeScript Configuration
- Strict mode enabled
- ES2022 target with bundler module resolution
- Path alias: `@ingenimind/apiloom-api-client` maps to node_modules package

## Key Dependencies
- **@ingenimind/apiloom-api-client**: Custom API client library for backend communication
- **keycloak-angular**: Authentication integration
- **primeng**: UI component library
- **@ngx-translate**: Internationalization
- **swagger-schema-official**: TypeScript types for Swagger/OpenAPI
- **js-yaml**: YAML parsing for spec files
- **highlight.js**: Code syntax highlighting
