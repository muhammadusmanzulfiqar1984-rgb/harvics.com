# HARVICS OS FRONTEND V16 UI SPECIFICATION

> Official UI standard for all HARVICS OS domain interfaces
> Version: 16.0
> Last Updated: 2024

---

## 1. LAYOUT SHELL

### 1.1 Top Bar (Header)
- **Height**: 64px fixed
- **Background**: `#5a0000` (deep maroon) with subtle gradient
- **Content**:
  - Left: Logo + "Harvics OS" text
  - Center: Current domain name (e.g., "Legal OS", "Import/Export OS")
  - Right: 
    - Country/Language selector (geo context)
    - User menu (avatar, name, role)
    - Notifications icon
    - Logout button
- **Z-index**: 1000
- **Border**: Bottom border `1px solid rgba(212, 175, 55, 0.2)`

### 1.2 Sidebar Navigation
- **Width**: 280px (collapsed: 64px)
- **Background**: `#4a0000` (darker maroon)
- **Position**: Fixed left, below top bar
- **Height**: `calc(100vh - 64px)`
- **Structure**:
  ```
  - Domain Icon + Name (collapsible)
    - Dashboard (always first)
    - Sub-modules (Tier 2)
      - Lists
      - Forms
      - Maps
      - Reports
    - Settings (always last)
  ```
- **Active State**: Gold background `#d4af37`, dark text `#5a0000`
- **Hover State**: `rgba(212, 175, 55, 0.15)` background
- **Icons**: 20px, gold color `#d4af37`
- **Text**: 14px, white `#ffffff` (inactive), `#5a0000` (active)
- **Z-index**: 999

### 1.3 Main Content Area
- **Margin**: Left `280px` (when sidebar expanded), `64px` (when collapsed)
- **Padding**: `24px` (desktop), `16px` (mobile)
- **Background**: `#f5f5f5` (light gray)
- **Min-height**: `calc(100vh - 64px)`
- **Overflow**: Auto (scrollable)

---

## 2. STANDARD PAGE TEMPLATES

### 2.1 Dashboard Template
**Route Pattern**: `/os/{domain}/dashboard`

**Structure**:
```
┌─────────────────────────────────────┐
│ Page Header (h1 + description)     │
├─────────────────────────────────────┤
│ KPI Cards (grid: 2-4 columns)      │
│ - Icon, Label, Value, Trend         │
├─────────────────────────────────────┤
│ Charts/Graphs Section (optional)    │
│ - Line, Bar, Pie charts             │
├─────────────────────────────────────┤
│ Recent Activity / Alerts             │
│ - Table or list                     │
└─────────────────────────────────────┘
```

**Components**:
- `PageHeader`: Title + description + action buttons
- `KPICard`: Icon, label, value, optional trend indicator
- `ChartCard`: Wrapper for charts with title
- `ActivityFeed`: Recent items list

**Styling**:
- Header: `text-3xl font-bold text-[#5a0000] mb-2`
- KPI Cards: `bg-white rounded-lg shadow p-6`
- Spacing: `gap-6` between sections

### 2.2 List Template (Table + Filters)
**Route Pattern**: `/os/{domain}/{module}/list`

**Structure**:
```
┌─────────────────────────────────────┐
│ Page Header + "New" button          │
├─────────────────────────────────────┤
│ Filters Bar (collapsible)           │
│ - Search input                      │
│ - Date range                        │
│ - Status dropdown                   │
│ - Country/Geo filter                │
│ - Apply/Reset buttons               │
├─────────────────────────────────────┤
│ Data Table                          │
│ - Sortable columns                  │
│ - Pagination                        │
│ - Row actions (Edit, Delete, etc.)  │
│ - Bulk actions                      │
└─────────────────────────────────────┘
```

**Components**:
- `FilterBar`: Collapsible filter panel
- `DataTable`: Sortable, paginated table
- `Pagination`: Page numbers + per-page selector
- `BulkActions`: Checkbox selection + actions

**Styling**:
- Table: `bg-white rounded-lg shadow overflow-hidden`
- Table header: `bg-gray-50 text-gray-700 font-semibold`
- Table rows: `hover:bg-gray-50`
- Pagination: Bottom right, `gap-2`

### 2.3 Detail/Edit Template (Form)
**Route Pattern**: `/os/{domain}/{module}/[id]` or `/os/{domain}/{module}/new`

**Structure**:
```
┌─────────────────────────────────────┐
│ Breadcrumb + Back button            │
├─────────────────────────────────────┤
│ Form Header (Title + Save/Cancel)   │
├─────────────────────────────────────┤
│ Form Fields (grouped in sections)   │
│ - Section 1: Basic Info             │
│ - Section 2: Additional Details     │
│ - Section 3: Attachments/Notes      │
├─────────────────────────────────────┤
│ Action Buttons (Save, Cancel, etc.) │
└─────────────────────────────────────┘
```

**Components**:
- `Breadcrumb`: Navigation path
- `FormSection`: Grouped fields with title
- `FormField`: Label + input + validation
- `FormActions`: Button group (Save, Cancel, Delete)

**Styling**:
- Form: `bg-white rounded-lg shadow p-6`
- Sections: `mb-6 pb-6 border-b border-gray-200`
- Inputs: `border border-gray-300 rounded px-3 py-2`
- Buttons: Primary `bg-[#5a0000] text-white`, Secondary `bg-gray-200 text-gray-700`

### 2.4 Map/GPS Template
**Route Pattern**: `/os/{domain}/map` or `/os/{domain}/gps`

**Structure**:
```
┌─────────────────────────────────────┐
│ Map Controls (zoom, layers, etc.)  │
├─────────────────────────────────────┤
│ Full-width Map Container            │
│ - Interactive map (Mapbox/Google)   │
│ - Markers, routes, heatmaps         │
├─────────────────────────────────────┤
│ Side Panel (optional, collapsible)  │
│ - Filter controls                   │
│ - Selected item details             │
└─────────────────────────────────────┘
```

**Components**:
- `MapContainer`: Full-width map wrapper
- `MapControls`: Zoom, layer toggles
- `MapSidebar`: Collapsible filter/details panel

**Styling**:
- Map: `w-full h-[calc(100vh-200px)] rounded-lg overflow-hidden`
- Controls: Floating top-right, `bg-white rounded shadow p-2`

### 2.5 Compare/Intelligence Template
**Route Pattern**: `/os/{domain}/compare` or `/os/{domain}/intelligence`

**Structure**:
```
┌─────────────────────────────────────┐
│ Comparison Controls                 │
│ - Select entities to compare        │
│ - Time period                       │
├─────────────────────────────────────┤
│ Comparison Charts/Tables             │
│ - Side-by-side metrics              │
│ - Trend comparisons                 │
│ - Difference highlights             │
└─────────────────────────────────────┘
```

**Components**:
- `ComparisonSelector`: Multi-select for entities
- `ComparisonChart`: Side-by-side visualizations
- `DifferenceIndicator`: Highlight differences

---

## 3. BEHAVIOUR RULES

### 3.1 Localisation
- **Language**: Use `useTranslations()` from `next-intl`
- **Currency**: Format using `formatCurrency(value, currencyCode)`
- **Dates**: Format using `formatDate(date, locale)`
- **Numbers**: Use locale-aware formatting
- **RTL Support**: Auto-detect and apply for Arabic, Hebrew

### 3.2 Geo Context
- **Source**: `useCountry()` hook from `CountryContext`
- **Filtering**: All data queries must include `countryCode` parameter
- **Display**: Show current country in top bar
- **Switching**: Country change triggers data refresh

### 3.3 RBAC (Role-Based Access Control)
- **Menu Visibility**: Use `AuthGuard` with `allowedRoles` prop
- **Action Buttons**: Hide/disable based on permissions
- **API Calls**: Backend enforces, frontend shows appropriate UI
- **Error Handling**: Show "Access Denied" message for unauthorized actions

### 3.4 Loading States
- **Initial Load**: Show skeleton screens or spinner
- **Data Refresh**: Show subtle loading indicator (top-right)
- **Form Submission**: Disable submit button, show spinner
- **Table Loading**: Show skeleton rows
- **Error States**: Show error message with retry button

### 3.5 Error Handling
- **API Errors**: Display user-friendly message
- **Validation Errors**: Show inline field errors
- **Network Errors**: Show retry option
- **404/403**: Show appropriate error page

---

## 4. SIDEBAR NAVIGATION STRUCTURE

### 4.1 Legal OS Sidebar
```
Legal OS
├── Dashboard
├── IPR Management
│   ├── Trademarks
│   ├── Patents
│   └── Copyrights
├── Contracts
│   ├── Contract List
│   └── Contract Templates
├── Cases
│   ├── Case List
│   └── Case Details
├── Compliance
│   ├── Compliance Checklist
│   └── Compliance Reports
├── Counterfeit
│   ├── Counterfeit Reports
│   └── Anti-Counterfeit Actions
└── Settings
```

### 4.2 Import/Export OS Sidebar
```
Import/Export OS
├── Dashboard
├── Import Orders
│   ├── Order List
│   ├── New Import Order
│   └── Order Details
├── Export Orders
│   ├── Order List
│   ├── New Export Order
│   └── Order Details
├── Customs
│   ├── Customs Clearance
│   └── Customs Documents
├── Trade Documents
│   ├── Document List
│   └── Document Templates
└── Settings
```

### 4.3 GPS Tracking OS Sidebar
```
GPS Tracking OS
├── Dashboard
├── Real-Time Tracking
│   ├── Live Map
│   └── Vehicle List
├── Routes
│   ├── Route List
│   ├── Route Planning
│   └── Route Analytics
├── Fleet
│   ├── Vehicle List
│   ├── Vehicle Details
│   └── Fleet Analytics
├── Geofencing
│   ├── Geofence List
│   └── Geofence Alerts
└── Settings
```

### 4.4 Competitor Intelligence OS Sidebar
```
Competitor Intelligence OS
├── Dashboard
├── Product Tracking
│   ├── Product List
│   ├── Product Comparison
│   └── Product Details
├── Price Intelligence
│   ├── Price Alerts
│   ├── Price Trends
│   └── Price Comparison
├── Market Analysis
│   ├── Market Share
│   ├── Market Trends
│   └── Market Reports
├── Competitors
│   ├── Competitor List
│   └── Competitor Profiles
└── Settings
```

---

## 5. UI COMPONENT STANDARDS

### 5.1 Buttons
- **Primary**: `bg-[#5a0000] text-white hover:bg-[#7a0000] px-4 py-2 rounded-lg`
- **Secondary**: `bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-lg`
- **Danger**: `bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg`
- **Gold Accent**: `bg-[#d4af37] text-[#5a0000] hover:bg-[#ffd700] px-4 py-2 rounded-lg`

### 5.2 Inputs
- **Standard**: `border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]`
- **Error**: `border-red-500 focus:ring-red-500`
- **Disabled**: `bg-gray-100 cursor-not-allowed`

### 5.3 Cards
- **Standard**: `bg-white rounded-lg shadow p-6`
- **Hover**: `hover:shadow-lg transition-shadow`
- **Header**: `border-b border-gray-200 pb-4 mb-4`

### 5.4 Tables
- **Container**: `bg-white rounded-lg shadow overflow-hidden`
- **Header**: `bg-gray-50 text-gray-700 font-semibold`
- **Rows**: `hover:bg-gray-50 border-b border-gray-200`
- **Actions**: Right-aligned, icon buttons

### 5.5 Typography
- **Page Title**: `text-3xl font-bold text-[#5a0000] mb-2`
- **Section Title**: `text-xl font-semibold text-gray-900 mb-4`
- **Card Title**: `text-lg font-semibold text-gray-700 mb-2`
- **Body**: `text-base text-gray-600`
- **Label**: `text-sm font-medium text-gray-700`

---

## 6. RESPONSIVE BREAKPOINTS

- **Mobile**: `< 640px` - Stack layout, collapsible sidebar
- **Tablet**: `640px - 1024px` - 2-column grids, sidebar toggle
- **Desktop**: `> 1024px` - Full layout, expanded sidebar

---

## 7. ACCESSIBILITY

- **ARIA Labels**: All interactive elements
- **Keyboard Navigation**: Full keyboard support
- **Focus Indicators**: Visible focus rings
- **Color Contrast**: WCAG AA compliant
- **Screen Readers**: Semantic HTML

---

*This spec must be followed for all new OS domain interfaces.*
