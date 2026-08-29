# CRM Architecture Implementation Plan
*Based on HARVICS 360 VOLUME 0 SOUL & UI BLUEPRINT*

## 1. Routing & Domain Structure
- **Root Path:** `/os/crm/[module]/[screen]`
- **Modules to implement:** `leads`, `opportunities`, `customers`, `orders`, `quotes`, `campaigns`
- **Dynamic Context:** All routes will inherit the `LocalisationContext` (for currency, language, cultural events) and `User.industryVertical`.

## 2. Universal Layout Contract (The 5 Elements)
We will build a wrapper component (`CRMPageLayout.tsx`) that enforces the 5 mandatory UI elements for every CRM screen:
- **Element 1 (Header):** Domain name, breadcrumbs, AI indicator, and global icons (Harvoice mic, notifications).
- **Element 2 (KPI Cards):** Exactly 3 to 5 `HarvicsKPICard` instances using `Cormorant Garamond` and strict color-coded accent bars (Gold = revenue, Green = positive ops). Real-time via React Query `staleTime: 30s`.
- **Element 3 (Main Content):** `HarvicsTable` with sorting, filtering, and pagination. Statuses use `HarvicsBadge`. Data fetches strictly via TanStack Query (no `useEffect` fetching).
- **Element 4 (AI Alerts Panel):** A 240px right-sidebar (`HarvicsAIPanel`). Blue-tinted card with pulsing dot, displaying exactly 3-5 suggestions (from `aiSuggestions` payload), driven by `demand.py`, `strategy.py`, and `price.py`. Includes Harvoice command input at the bottom.
- **Element 5 (Primary Action Button):** Top right, gold, pill-shaped. Prefix with `+` for creations (e.g. `+ New Quote`).

## 3. AI & "Soul" Integrations in CRM
- **Lead/Opportunity Workflows:** When viewing or interacting with a lead, call `strategy.py` to get coverage scores and `credit_scoring.py` to evaluate credit limits.
- **Quoting / CPQ Engine:** Integrated with `price.py`. As the user changes quantities on a quote, instantly recalculate margin impacts via AI endpoints.
- **Order Placement:** Integrated with `demand.py` and `Data Ocean`. Auto-recommend optimal volumes based on cultural calendar events (e.g., Ramadan uplift).

## 4. Component Refactoring & Strict Boundaries
- **@harvics/ui Shared Imports:** We will rely *exclusively* on `HarvicsButton`, `HarvicsCard`, `HarvicsTable`, `HarvicsKPICard`, `HarvicsAIPanel`, and `HarvoiceWidget`. We will create any missing primitives to ensure no inline UI styling deviates from the exact hex codes (e.g., `#0f172a` glass surfaces, `#050816` backgrounds).
- **Governance Enforcement:** Ensure every write action (Save Lead, Create Quote, Submit Order) is wrapped to pass through the 5 Neural Governance checks (Legal, Budget, Contract, Security, Compliance).

## Next Steps for Execution (Code Mode)
1. **Scaffold CRM Routing:** Create Next.js App Router directories for `/app/os/crm/leads/`, `/app/os/crm/quotes/`, etc.
2. **Build `CRMPageLayout`:** Assemble the 5 mandatory UI elements into a reusable wrapper template.
3. **Implement Shared UI Components:** Ensure the `HarvicsAIPanel`, `HarvicsKPICard`, and `HarvoiceWidget` perfectly match the specifications defined in the blueprint.
4. **Migrate Workshop Code:** Port the logic from `CRM_WORKSHOP` into these newly enforced layout boundaries.