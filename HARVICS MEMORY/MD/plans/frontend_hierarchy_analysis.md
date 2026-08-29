# Frontend Hierarchy Architecture

## 1. Next.js App Router Structure
The application uses the Next.js App Router (`src/app`).
- **Root**: `src/app/layout.tsx` is a passthrough layout.
- **Localized Routes**: `src/app/[locale]/...` supports localized pages like Media and Portals.
- **OS Domain Routes**: `src/app/os/...` holds the core operating system UI, specifically routing to Intelligence and likely extending to other modules.
- **API Routes**: Located in `src/app/api/...` for handling backend proxying or lightweight API logic (e.g., auth, health, home).

## 2. Component Hierarchy (`src/components/`)
The component architecture is well-organized into specific conceptual domains:
- **Layout (`components/layout/`)**: Structural components for the public-facing site, headers, footers, heros, and large sections (e.g., `SupremeNavBar`, `SupplyChainWheel`).
- **UI (`components/ui/`)**: Reusable primitives and generic widgets (e.g., `SmartImage`, `SearchModal`, `CountrySelector`, `AI Widgets`).
- **Portals (`components/portals/`)**: Specialized dashboards for different user types (e.g., `DistributorDashboard`, `SupplierDashboard`, `CompanyDashboard`) and structural layout wrappers for these domains.
- **OS Domains (`components/os-domains/`)**: Modules corresponding to the core business logic domains (Competitor, Executive, Import/Export, Investor).
- **Widgets (`components/widgets/`)**: Standalone functional modules like `WeatherWidget`, `ExchangeRatesWidget`.
- **Charts (`components/charts/`)**: Data visualization wrappers for reusability.

## 3. Feature Apps (`src/apps/`)
- **CRM App**: Structured under `src/apps/crm/`, treating the CRM as an internal micro-app with its own controllers, routes, and services separated from standard page components.

## 4. State Management, Contexts, and Hooks
- **Contexts (`src/contexts/` & `src/context/`)**: React Contexts for global state management like `LocaleProvider`, `GeoProvider`, `CountryContext`, `RegionContext`, `TerritoryContext`, and `BackendStatusContext`.
- **Hooks (`src/hooks/`)**: Custom hooks designed to encapsulate business logic, API fetching, and UI state (e.g., `useAlphaEngine`, `useDashboardData`, `useGeographicScope`, `useTimezone`).

## 5. Supporting Directories
- **Config & Data (`src/config/`, `src/data/`)**: Static constants, configuration files (locales, tier-colors), and static mock/seed data.
- **Lib & Utils (`src/lib/`, `src/utils/`)**: Helper functions, API client wrappers, and generic utilities.
- **Types (`src/types/`)**: TypeScript interface definitions for core entities (e.g., logistics, rbac, distributor).
- **Services (`src/services/`)**: Client-side singletons or API managers for external services like `aiService`, `frontendRecoveryMode`, `auto-bug-detector`.

## 6. Styles (`src/styles/`)
Global styles and modular CSS (e.g., `harvics-design-system.css`, `premium-animations.css`) maintaining a custom design system approach.

## Summary
The frontend architecture effectively segregates public marketing elements from the complex B2B OS Portals. The `app` directory handles routing, while the heavy lifting is delegated to neatly organized domains within `components` and `apps`, tightly coupled with a robust Context and Hook ecosystem for state.