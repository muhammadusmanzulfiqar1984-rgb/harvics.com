# 🚀 Harvics OS CRM - Implementation Guide

**How to Implement the Critical Improvements**

---

## 📋 Table of Contents

1. [Reporting Enhancements](#1-reporting-enhancements)
2. [Legal Module Implementation](#2-legal-module-implementation)
3. [Import/Export Module Completion](#3-importexport-module-completion)
4. [Workflow Engine Implementation](#4-workflow-engine-implementation)
5. [GPS Tracking Enhancement](#5-gps-tracking-enhancement)

---

## 1. Reporting Enhancements

### 1.1 Custom Report Builder

**Step 1: Create Report Builder Component**

```typescript
// src/components/ReportBuilder.tsx
'use client'

import { useState } from 'react'

interface ReportBuilderProps {
  dataSource: string // 'orders' | 'inventory' | 'finance' | etc.
  onGenerate: (report: ReportConfig) => void
}

interface ReportConfig {
  name: string
  dataSource: string
  columns: string[]
  filters: FilterConfig[]
  groupBy?: string
  sortBy?: string
  chartType?: 'table' | 'bar' | 'line' | 'pie'
}

export default function ReportBuilder({ dataSource, onGenerate }: ReportBuilderProps) {
  // Implementation here
}
```

**Step 2: Add Export Functionality**

```typescript
// src/lib/reportExporter.ts
export async function exportToPDF(reportData: any, config: ReportConfig) {
  // Use jsPDF or similar library
}

export async function exportToExcel(reportData: any, config: ReportConfig) {
  // Use xlsx or similar library
}
```

**Step 3: Add to Each Tab**

Update each tab component (OrdersTab, InventoryTab, etc.) to include:
- Report builder button
- Export buttons with actual functionality
- Chart visualization options

### 1.2 Scheduled Reports

**Step 1: Create Report Scheduler Service**

```typescript
// src/services/reportScheduler.ts
export interface ScheduledReport {
  id: string
  name: string
  config: ReportConfig
  schedule: 'daily' | 'weekly' | 'monthly'
  recipients: string[]
  format: 'pdf' | 'excel' | 'both'
}

export async function createScheduledReport(report: ScheduledReport) {
  // Store in database
  // Set up cron job or scheduled task
}
```

**Step 2: Add UI Component**

```typescript
// src/components/ScheduledReports.tsx
// Component to manage scheduled reports
```

### 1.3 Advanced Visualizations

**Step 1: Install Chart Libraries**

```bash
npm install recharts chart.js react-chartjs-2
```

**Step 2: Create Chart Components**

```typescript
// src/components/charts/LineChart.tsx
// src/components/charts/BarChart.tsx
// src/components/charts/PieChart.tsx
// src/components/charts/Heatmap.tsx
```

**Step 3: Add Charts to Tabs**

Update OverviewTab and other tabs to include:
- Trend charts (line charts)
- Distribution charts (pie/bar)
- Comparison charts
- Heatmaps for geographic data

---

## 2. Legal Module Implementation

### 2.1 Create Legal Module Structure

**Step 1: Create Legal Tab Component**

```typescript
// src/components/EnterpriseCRM.tsx - Add to tabs
'legal-ipr': <LegalIPRTab 
  selectedCountry={selectedCountry}
  countryData={countryData}
  data={data?.legal}
/>
```

**Step 2: Create LegalIPRTab Component**

```typescript
// src/components/tabs/LegalIPRTab.tsx
'use client'

export default function LegalIPRTab({ selectedCountry, countryData, data }: LegalTabProps) {
  const [subTab, setSubTab] = useState<'overview' | 'ipr' | 'counterfeit' | 'compliance' | 'contracts' | 'litigation'>('overview')
  
  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-2 border-b">
        {['overview', 'ipr', 'counterfeit', 'compliance', 'contracts', 'litigation'].map(tab => (
          <button onClick={() => setSubTab(tab)}>
            {tab}
          </button>
        ))}
      </div>
      
      {/* Content based on subTab */}
    </div>
  )
}
```

### 2.2 IPR Management

**Step 1: Create IPR Data Model**

```typescript
// src/types/legal.ts
export interface Trademark {
  id: string
  brandName: string
  class: number
  country: string
  applicationNo: string
  status: 'pending' | 'registered' | 'expired'
  expiryDate: string
  documents: string[]
}

export interface Patent {
  id: string
  title: string
  country: string
  applicationNo: string
  status: string
  expiryDate: string
}
```

**Step 2: Create IPR Management UI**

```typescript
// src/components/tabs/legal/IPRManagement.tsx
// Table with trademarks/patents
// Add/Edit/View modals
// Renewal reminders
```

### 2.3 Counterfeit Detection

**Step 1: Create Counterfeit Reporting Form**

```typescript
// src/components/tabs/legal/CounterfeitDetection.tsx
export default function CounterfeitDetection() {
  return (
    <div>
      <form>
        {/* Report counterfeit product */}
        {/* Upload images */}
        {/* Location details */}
        {/* Submit for investigation */}
      </form>
      
      {/* List of reported counterfeits */}
      {/* Investigation status */}
      {/* Legal actions taken */}
    </div>
  )
}
```

### 2.4 Backend API Endpoints

```typescript
// server/routes/legal.ts
router.get('/api/legal/trademarks', getTrademarks)
router.post('/api/legal/trademarks', createTrademark)
router.put('/api/legal/trademarks/:id', updateTrademark)
router.get('/api/legal/counterfeits', getCounterfeits)
router.post('/api/legal/counterfeits', reportCounterfeit)
// etc.
```

---

## 3. Import/Export Module Completion

### 3.1 Enhance Import/Export Tab

**Step 1: Create Comprehensive Import/Export UI**

```typescript
// src/components/tabs/ImportExportTab.tsx
export default function ImportExportTab() {
  const [subTab, setSubTab] = useState<'overview' | 'import' | 'export' | 'customs' | 'docs' | 'rules'>('overview')
  
  return (
    <div>
      {/* Sub-tabs */}
      {/* Import Orders Management */}
      {/* Export Orders Management */}
      {/* Customs & Tariffs */}
      {/* Trade Documentation */}
      {/* Country Rules */}
    </div>
  )
}
```

### 3.2 Customs & Tariff Management

**Step 1: Create HS Code Database**

```typescript
// src/data/hsCodes.ts
export interface HSCode {
  code: string
  description: string
  category: string
}

export const hsCodes: HSCode[] = [
  // HS Code database
]

export function getTariffRate(hsCode: string, country: string): number {
  // Lookup tariff rate
}
```

**Step 2: Create Customs Calculator**

```typescript
// src/components/tabs/importexport/CustomsCalculator.tsx
export default function CustomsCalculator() {
  const calculateDuty = (product: Product, country: string) => {
    const hsCode = product.hsCode
    const tariffRate = getTariffRate(hsCode, country)
    const duty = product.value * (tariffRate / 100)
    return duty
  }
}
```

### 3.3 Trade Documentation Generator

**Step 1: Create Document Templates**

```typescript
// src/lib/documentGenerator.ts
export async function generateCommercialInvoice(order: Order): Promise<Blob> {
  // Generate PDF invoice
}

export async function generatePackingList(order: Order): Promise<Blob> {
  // Generate packing list
}

export async function generateCertificateOfOrigin(order: Order): Promise<Blob> {
  // Generate certificate
}
```

**Step 2: Add to Import/Export Tab**

```typescript
// In ImportExportTab component
<button onClick={() => generateCommercialInvoice(order)}>
  Generate Commercial Invoice
</button>
```

---

## 4. Workflow Engine Implementation

### 4.1 Create Workflow Engine

**Step 1: Define Workflow Data Model**

```typescript
// src/types/workflow.ts
export interface Workflow {
  id: string
  name: string
  trigger: 'order_created' | 'inventory_low' | 'payment_received'
  steps: WorkflowStep[]
  status: 'active' | 'inactive'
}

export interface WorkflowStep {
  id: string
  type: 'approval' | 'notification' | 'action' | 'condition'
  config: any
  nextStep?: string
}
```

**Step 2: Create Workflow Designer**

```typescript
// src/components/workflows/WorkflowDesigner.tsx
export default function WorkflowDesigner() {
  // Drag-and-drop workflow builder
  // Visual workflow editor
  // Save/load workflows
}
```

### 4.3 Approval Workflows

**Step 1: Create Approval System**

```typescript
// src/components/workflows/ApprovalWorkflow.tsx
export default function ApprovalWorkflow({ orderId }: { orderId: string }) {
  // Show pending approvals
  // Approve/Reject buttons
  // Approval history
}
```

**Step 2: Add to Orders Tab**

```typescript
// In OrdersTab component
{order.requiresApproval && (
  <ApprovalWorkflow orderId={order.id} />
)}
```

---

## 5. GPS Tracking Enhancement

### 5.1 Real-Time GPS Integration

**Step 1: Set Up WebSocket Connection**

```typescript
// src/lib/gpsTracking.ts
export class GPSTracker {
  private ws: WebSocket
  
  connect() {
    this.ws = new WebSocket('ws://localhost:4000/gps')
    this.ws.onmessage = (event) => {
      const location = JSON.parse(event.data)
      this.updateLocation(location)
    }
  }
  
  updateLocation(location: VehicleLocation) {
    // Update map with real-time location
  }
}
```

**Step 2: Create Real-Time Map Component**

```typescript
// src/components/maps/RealTimeMap.tsx
import { MapContainer, TileLayer, Marker } from 'react-leaflet'

export default function RealTimeMap({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <MapContainer center={[0, 0]} zoom={2}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {vehicles.map(vehicle => (
        <Marker position={[vehicle.lat, vehicle.lng]}>
          {/* Vehicle info */}
        </Marker>
      ))}
    </MapContainer>
  )
}
```

### 5.2 Route Visualization

**Step 1: Create Route Map Component**

```typescript
// src/components/maps/RouteMap.tsx
export default function RouteMap({ route }: { route: Route }) {
  return (
    <MapContainer>
      <Polyline positions={route.waypoints} />
      {/* Show route on map */}
    </MapContainer>
  )
}
```

---

## 6. Quick Start Implementation Plan

### Week 1-2: Reporting Enhancements
1. ✅ Install chart libraries
2. ✅ Create chart components
3. ✅ Add charts to Overview tab
4. ✅ Implement PDF/Excel export
5. ✅ Add report builder UI

### Week 3-4: Legal Module
1. ✅ Create LegalIPRTab component
2. ✅ Implement IPR management
3. ✅ Create counterfeit reporting
4. ✅ Add compliance tracking
5. ✅ Create backend APIs

### Week 5-6: Import/Export Completion
1. ✅ Enhance Import/Export tab
2. ✅ Create HS Code database
3. ✅ Implement customs calculator
4. ✅ Create document generators
5. ✅ Add country rules engine

### Week 7-8: Workflow Engine
1. ✅ Create workflow data model
2. ✅ Build workflow designer
3. ✅ Implement approval workflows
4. ✅ Add to Orders/Inventory tabs
5. ✅ Create workflow execution engine

### Week 9-10: GPS Enhancement
1. ✅ Set up WebSocket for real-time tracking
2. ✅ Create real-time map component
3. ✅ Implement route visualization
4. ✅ Add geofencing
5. ✅ Create GPS analytics

---

## 7. Code Examples

### Example 1: Add Chart to Overview Tab

```typescript
// In OverviewTab component
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const revenueData = [
  { month: 'Jan', revenue: 4000 },
  { month: 'Feb', revenue: 3000 },
  // ...
]

<LineChart width={600} height={300} data={revenueData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="revenue" stroke="#d4af37" />
</LineChart>
```

### Example 2: Add Export Functionality

```typescript
// In OrdersTab component
import { exportToPDF, exportToExcel } from '@/lib/reportExporter'

const handleExportPDF = async () => {
  const reportData = {
    orders: data?.orders || [],
    filters: currentFilters,
    dateRange: selectedDateRange
  }
  await exportToPDF(reportData, {
    name: 'Orders Report',
    columns: ['id', 'customer', 'amount', 'status', 'date']
  })
}
```

### Example 3: Create Legal IPR Table

```typescript
// In LegalIPRTab component
<table>
  <thead>
    <tr>
      <th>Brand Name</th>
      <th>Class</th>
      <th>Country</th>
      <th>Status</th>
      <th>Expiry Date</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {trademarks.map(tm => (
      <tr>
        <td>{tm.brandName}</td>
        <td>{tm.class}</td>
        <td>{tm.country}</td>
        <td>{tm.status}</td>
        <td>{tm.expiryDate}</td>
        <td>
          <button onClick={() => handleRenew(tm.id)}>Renew</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

---

## 8. Testing Strategy

### Unit Tests
- Test each component in isolation
- Test data transformations
- Test API calls

### Integration Tests
- Test workflow between modules
- Test data flow
- Test error handling

### E2E Tests
- Test complete user workflows
- Test role-based access
- Test geographic filtering

---

## 9. Deployment Checklist

- [ ] All components tested
- [ ] Backend APIs implemented
- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] Documentation updated
- [ ] User training materials prepared

---

## 10. Next Steps

1. **Review this guide** with your team
2. **Prioritize** which features to implement first
3. **Set up development environment** if needed
4. **Start with Reporting** (easiest, high impact)
5. **Then Legal Module** (critical for compliance)
6. **Then Import/Export** (essential for global operations)

---

**Need help with specific implementation?** Let me know which feature you'd like to start with, and I can provide detailed code!

