# GEMINI AUDIT NOTES: BLUEPRINT VS. CURRENT CODEBASE
**Date:** March 26, 2026
**Agent:** Gemini (Roo)
**Source Documents Analyzed:** 
- `HARVICS_360_VOLUME0_SOUL.docx`
- `HARVICS_UI_BLUEPRINT.docx`

---

## EXECUTIVE SUMMARY
There is a massive divergence between the official HARVICS Universe Blueprints and the current state of the codebase. The project is currently built around a legacy "SUPREME" design system (Maroon/Ivory) and contains mostly stubbed/mocked backend logic, whereas the Blueprints mandate a highly secure, real-time, AI-driven, deep-dark Navy/Gold glassmorphism OS.

Below is the line-by-line breakdown of the differences.

---

## 1. Colors & Visual Theme
- **The Blueprint Mandate:** Requires a "Rolls-Royce" deep space luxury dark theme.
  - Page background: `#050816` (deepest dark navy)
  - Card surfaces: `#0f172a` (dark glass)
  - Primary accents: Gold `#fbbf24`
  - Brand Blue: `#1B3A6B`
- **Current Codebase:** `tailwind.config.js` and global CSS variables are using a "SUPREME" palette consisting of Maroon (`#6B1F2B`), Deep Burgundy, and Ivory (`#F5F1E8`). The entire project looks maroon/gold/white instead of the mandated deep dark glassmorphism.

## 2. Typography
- **The Blueprint Mandate:** 
  - `Cormorant Garamond` (serif) for large display numbers (KPIs, balances).
  - `DM Sans` (sans-serif) for all body UI text.
  - `JetBrains Mono` for identifiers/IDs like `#ORD-4821`.
- **Current Codebase:** Currently uses `Playfair Display` for serif fonts and standard system sans-serif (`-apple-system`, `Segoe UI`) for the body. `JetBrains Mono` is completely missing.

## 3. Screen Layout (The 5-Element Rule)
- **The Blueprint Mandate:** Every single domain screen MUST follow a strict 5-element layout:
  1. **Header Bar:** Breadcrumbs and gold Harvoice mic.
  2. **KPI Card Row:** 3-5 real-time cards with accent bars.
  3. **Main Content Area:** Sortable table/grid.
  4. **AI Alerts Panel:** Fixed 240px wide on the right, light blue tinted background (`rgba(59,130,246,0.08)`) with 3-5 suggestions.
  5. **Primary Action Button:** Top right, Gold Pill shape (e.g., "+ New Order").
- **Current Codebase:** Pages are wildly fragmented. Some use a giant monolithic component (`EnterpriseCRM.tsx`), while the `/os/` pages (like `/os/orders`, `/os/finance`) are mostly empty shells. Almost none of the screens have the fixed 240px right-side AI Panel integrated as defined.

## 4. Component Architecture
- **The Blueprint Mandate:** Explicitly states that UI components must be shared from a central `@harvics/ui` library package (e.g., `HarvicsButton`, `HarvicsTable`, `HarvicsCard`, `HarvoiceWidget`). Buttons must be pill-shaped (`radius: 999px`) and cards must use a dark glass effect (`rgba(15, 23, 42, 0.97)`).
- **Current Codebase:** Components are scattered randomly across `src/components/ui`, `src/components/shared`, and `src/components/layout`. Buttons are hardcoded with various border radiuses and do not match the strict prop schemas defined in the Blueprint.

## 5. Neural Governance (The Immune System)
- **The Blueprint Mandate:** Before *any* transaction writes to the database (POST, PUT, PATCH, DELETE), 5 checks must fire simultaneously: Legal, Budget, Contract, Security, Compliance. If one fails, it's blocked and logged to an immutable `AuditLog`.
- **Current Codebase:** The backend API routes (`backend/src/routes.ts`) for Orders, Inventory, CRM, etc., currently have **NO** authentication middleware applied to them at all. The governance checks are either mocked out or missing completely.

## 6. The AI Engine (The Blood) & Data Ocean
- **The Blueprint Mandate:** Defines 8 active Python models (`demand.py`, `price.py`, `sku.py`, etc.) that read from a 3-layer PostgreSQL Data Ocean (Bronze, Silver, Gold). For example, `price.py` optimizes price based on demand elasticity and competitor data. The Voice AI (Harvoice) uses Gemini Live WebSocket streaming with ephemeral tokens.
- **Current Codebase:** The backend's AI controller (`intelligence.controller.ts`) currently fakes these forecasts using `Math.random()`. The Harvoice chat functionality relies on simple keyword matching (e.g., `if (msg.includes('order'))`) rather than streaming real WebSocket data.

## 7. App Routing Structure
- **The Blueprint Mandate:** Enforces strict paths mapping one route to exactly one screen: `/os/[domain]/[module]/[screen]` (e.g., `/os/finance/ar/invoices`).
- **Current Codebase:** The routing folder structure is a mix of `src/app/os/[domain]` and legacy `src/app/[locale]/...` pages, causing routing conflicts. There is no clean separation of the `[module]/[screen]` hierarchy.

---

## 8. Proposed Architecture & Execution Plan: Data Ocean & AI Engine

Based on the blueprint specifications, here is the technical roadmap for building the **Data Ocean** and **AI Engine**:

### Step 1: Establish the Data Ocean Layers (PostgreSQL & Prisma)
A structured data pipeline in the database using three specific layers:
- **Bronze Layer (Raw):** Append-only tables storing raw JSON responses directly from external APIs (Weather, FX rates, Sanctions, Cultural Calendars) exactly as received.
- **Silver Layer (Cleaned):** A transformation process to clean Bronze data (normalizing currencies, standardizing dates to UTC, converting country codes to ISO 3166).
- **Gold Layer (Analytics-Ready):** Pre-joined feature tables updated hourly (or every 60s for FX). This is the highly optimized layer that the Python AI models will query instantly.

### Step 2: Build the Ingestion Workers (Node.js)
A continuously running background service (`DataOceanService`) using `node-cron` or `BullMQ` to automatically fetch data from external APIs:
- **FX Rates:** Fetches every 60 seconds.
- **Weather:** Fetches based on territory GPS coordinates.
- **Cultural/Events:** Maintains dates for Ramadan, Chinese New Year, etc.
- **Sanctions/Compliance:** Fetches daily updates.
*(Can use free/mocked API endpoints initially to simulate data flow until real API keys are added).*

### Step 3: Build the Python AI Microservice (`/ai-engine`)
The Blueprint requires 8 active Python models. We will build a **FastAPI** server inside the `ai-engine` folder to host these scripts:
- `demand.py`: Calculates SKU demand using 90-day history + weather index + cultural events.
- `price.py`: Suggests optimal pricing based on demand elasticity and margins.
- `fraud_model.py`: Scores transactions (0.00 to 1.00) based on behavior and geography.
- Additional models: `strategy.py`, `coverage.py`, `sku.py`, `credit_scoring.py`, etc.

### Step 4: Wire the AI Engine to the Main Backend
Update the main Node.js backend controllers to communicate with the new Python FastAPI service. When a transaction occurs:
1. The Node.js backend grabs the user's context.
2. It sends an HTTP request to the Python AI service.
3. Python reads the **Gold Layer** of the Data Ocean, calculates the prediction in milliseconds, and returns it.
4. The Node.js backend formats this into the `aiSuggestions` array and sends it to the frontend's AI Alerts Panel.
