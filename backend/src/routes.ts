import { Router, Request, Response } from 'express';
import localisationRouter, { getLanguagesHandler, getTranslationsHandler } from './modules/localisation/localisation.controller';
import { getCountryProfile, getWorkflowConfig } from './modules/localisation/ruleEngine.controller';
import gpsRouter from './modules/gps/gps.controller';
import satelliteRouter from './modules/satellite/satellite.controller';
import tradeRouter from './modules/trade/trade.controller';
import procurementRouter from './modules/procurement/procurement.controller';
import graphRouter from './modules/fmcgGraph/graph.controller';
import aiRouter from './modules/ai/ai.controller';
import imageGeneratorRouter from './modules/ai/imageGenerator';
import dataOceanRouter from './modules/dataOcean/dataOcean.controller';
import systemRouter from './modules/system/system.controller';
import authRouter from './modules/auth/auth.controller';
import bffRouter from './modules/bff/bff.controller';
import domainsRouter from './modules/domains/domains.controller';
import productsRouter from './modules/products/products.controller';
import navigationRouter from './modules/navigation/navigation.controller';
import territoryRouter from './modules/territory/territory.controller';
import { requireAuthScope } from './middleware/authScope';
import { enforceAIProtocol, requireAIEngine } from './middleware/aiProtocolEnforcement';
import { neuralGovernance } from './middleware/neuralGovernance';
import { buildLocalisationPayload, listCountryProfiles } from './modules/localisation/localisation.service';
import { auditLogRouter } from './modules/admin/auditLog.controller';
import { commsRouter } from './modules/comms/comms.controller';
import { notificationService } from './modules/comms/notification.service';
import { eventBus } from './core/eventBus';
import { customersDb, leadsDb, employeesDb, inventoryDb } from './core/db';
import productionRouter from './modules/production/production.controller';

// In-memory demo store for command-center Orders CRUD (no DB dependency)
type DemoOrder = {
  id: string;
  customer: string;
  city: string;
  amount: number;
  currency: string;
  status: string;
  items: Array<{ sku: string; qty: number }>;
  createdAt: string;
};

type DemoInventoryItem = {
  sku: string;
  name: string;
  category: string;
  warehouse: string;
  qty: number;
  reserved: number;
  unitPrice: number;
  currency: string;
  updatedAt: string;
};

type DemoInvoice = {
  id: string;
  orderId: string;
  customer: string;
  amount: number;
  currency: string;
  status: 'Draft' | 'Issued' | 'Paid' | 'Cancelled';
  issuedAt: string;
};

type WorkflowEvent = {
  id: string;
  type: string;
  message: string;
  ref?: string;
  at: string;
};

type DemoPurchaseOrder = {
  id: string;
  vendor: string;
  status: 'Draft' | 'Issued' | 'Received' | 'Paid' | 'Cancelled';
  items: Array<{ sku: string; qty: number; unitPrice: number }>;
  amount: number;
  currency: string;
  createdAt: string;
};

type DemoVendorInvoice = {
  id: string;
  poId: string;
  vendor: string;
  amount: number;
  currency: string;
  status: 'Pending' | 'Paid' | 'Cancelled';
  receivedAt: string;
};

// ── ERP Tier-1 demo types ───────────────────────────────────────────────────
type DemoEmployee = {
  id: string;
  name: string;
  role: string;
  department: string;
  salary: number;
  currency: string;
  status: 'Active' | 'OnLeave' | 'Terminated';
  hiredAt: string;
};

type DemoCustomer = {
  id: string;
  name: string;
  company: string;
  country: string;
  segment: string;
  ltv: number;
  currency: string;
  createdAt: string;
};

type DemoLead = {
  id: string;
  name: string;
  company: string;
  source: string;
  stage: 'New' | 'Qualified' | 'Proposal' | 'Won' | 'Lost';
  value: number;
  currency: string;
  owner: string;
  createdAt: string;
};

type DemoLedgerEntry = {
  id: string;
  date: string;
  account: string;
  debit: number;
  credit: number;
  ref?: string;
  memo: string;
};

type DemoShipment = {
  id: string;
  orderId: string;
  origin: string;
  destination: string;
  carrier: string;
  status: 'Pending' | 'InTransit' | 'Delivered' | 'Returned';
  eta: string;
  createdAt: string;
};

type DemoWorkOrder = {
  id: string;
  sku: string;
  qty: number;
  status: 'Draft' | 'InProgress' | 'Completed' | 'Cancelled';
  startDate: string;
  completedAt?: string;
};

// File-based persistence (survives backend restart, no schema changes)
import * as fs from 'fs';
import * as path from 'path';
const DATA_DIR = path.resolve(__dirname, '../data');
const STORE_FILE = path.join(DATA_DIR, 'demo-store.json');

interface PersistedStore {
  orders: DemoOrder[];
  orderSeq: number;
  inventory: DemoInventoryItem[];
  invoices: DemoInvoice[];
  invoiceSeq: number;
  workflow: WorkflowEvent[];
  workflowSeq: number;
  purchaseOrders: DemoPurchaseOrder[];
  poSeq: number;
  vendorInvoices: DemoVendorInvoice[];
  vendorInvoiceSeq: number;
  employees: DemoEmployee[];
  employeeSeq: number;
  customers: DemoCustomer[];
  customerSeq: number;
  leads: DemoLead[];
  leadSeq: number;
  ledger: DemoLedgerEntry[];
  ledgerSeq: number;
  shipments: DemoShipment[];
  shipmentSeq: number;
  workOrders: DemoWorkOrder[];
  workOrderSeq: number;
}

const SEED: PersistedStore = {
  orders: [
    { id: 'demo-001', customer: 'Global Retail LLC', city: 'Dubai', amount: 12500, currency: 'USD', status: 'Pending', items: [{ sku: 'FMCG-001', qty: 100 }], createdAt: new Date().toISOString() },
    { id: 'demo-002', customer: 'North Hub Distribution', city: 'Islamabad', amount: 8200, currency: 'USD', status: 'Processing', items: [{ sku: 'FMCG-002', qty: 50 }], createdAt: new Date().toISOString() },
    { id: 'demo-003', customer: 'Emirates Trade Co', city: 'Abu Dhabi', amount: 31000, currency: 'USD', status: 'Completed', items: [{ sku: 'FMCG-003', qty: 200 }], createdAt: new Date().toISOString() },
  ],
  orderSeq: 4,
  inventory: [
    { sku: 'FMCG-001', name: 'Premium Coffee 500g', category: 'Beverages', warehouse: 'Dubai-W1', qty: 1200, reserved: 0, unitPrice: 12.5, currency: 'USD', updatedAt: new Date().toISOString() },
    { sku: 'FMCG-002', name: 'Organic Tea Pack', category: 'Beverages', warehouse: 'Islamabad-W1', qty: 800, reserved: 0, unitPrice: 8.0, currency: 'USD', updatedAt: new Date().toISOString() },
    { sku: 'FMCG-003', name: 'Whole Wheat Flour 5kg', category: 'Staples', warehouse: 'Dubai-W2', qty: 450, reserved: 0, unitPrice: 15.0, currency: 'USD', updatedAt: new Date().toISOString() },
    { sku: 'FMCG-004', name: 'Dates Premium 1kg', category: 'Snacks', warehouse: 'Abu-Dhabi-W1', qty: 320, reserved: 0, unitPrice: 22.0, currency: 'USD', updatedAt: new Date().toISOString() },
  ],
  invoices: [],
  invoiceSeq: 1,
  workflow: [],
  workflowSeq: 1,
  purchaseOrders: [],
  poSeq: 1,
  vendorInvoices: [],
  vendorInvoiceSeq: 1,
  employees: [
    { id: 'emp-001', name: 'Ayesha Khan', role: 'Country Manager', department: 'Operations', salary: 9500, currency: 'USD', status: 'Active', hiredAt: new Date().toISOString() },
    { id: 'emp-002', name: 'Omar Farouk', role: 'Sales Lead', department: 'Sales', salary: 6200, currency: 'USD', status: 'Active', hiredAt: new Date().toISOString() },
    { id: 'emp-003', name: 'Priya Mehta', role: 'Warehouse Supervisor', department: 'Logistics', salary: 4100, currency: 'USD', status: 'Active', hiredAt: new Date().toISOString() },
    { id: 'emp-004', name: 'Ali Raza', role: 'Production Engineer', department: 'Manufacturing', salary: 5400, currency: 'USD', status: 'OnLeave', hiredAt: new Date().toISOString() },
  ],
  employeeSeq: 5,
  customers: [
    { id: 'cust-001', name: 'Khalid Mansour', company: 'Global Retail LLC', country: 'AE', segment: 'Enterprise', ltv: 145000, currency: 'USD', createdAt: new Date().toISOString() },
    { id: 'cust-002', name: 'Sara Ahmed', company: 'North Hub Distribution', country: 'PK', segment: 'Distributor', ltv: 82000, currency: 'USD', createdAt: new Date().toISOString() },
    { id: 'cust-003', name: 'Yusuf Trading', company: 'Emirates Trade Co', country: 'AE', segment: 'Wholesaler', ltv: 211000, currency: 'USD', createdAt: new Date().toISOString() },
  ],
  customerSeq: 4,
  leads: [
    { id: 'lead-001', name: 'Hassan Al-Mutairi', company: 'Gulf FMCG Holdings', source: 'Trade Show', stage: 'Qualified', value: 35000, currency: 'USD', owner: 'Omar Farouk', createdAt: new Date().toISOString() },
    { id: 'lead-002', name: 'Mei Lin', company: 'Asia Pacific Foods', source: 'Inbound', stage: 'Proposal', value: 78000, currency: 'USD', owner: 'Omar Farouk', createdAt: new Date().toISOString() },
    { id: 'lead-003', name: 'Carlos Rivera', company: 'LatAm Grocers', source: 'Referral', stage: 'New', value: 12000, currency: 'USD', owner: 'Ayesha Khan', createdAt: new Date().toISOString() },
  ],
  leadSeq: 4,
  ledger: [
    { id: 'gl-0001', date: new Date().toISOString(), account: 'Cash', debit: 50000, credit: 0, memo: 'Opening balance' },
    { id: 'gl-0002', date: new Date().toISOString(), account: 'Equity', debit: 0, credit: 50000, memo: 'Owner contribution' },
  ],
  ledgerSeq: 3,
  shipments: [
    { id: 'ship-0001', orderId: 'demo-003', origin: 'Dubai-W2', destination: 'Abu Dhabi', carrier: 'Aramex', status: 'Delivered', eta: new Date().toISOString(), createdAt: new Date().toISOString() },
  ],
  shipmentSeq: 2,
  workOrders: [
    { id: 'wo-0001', sku: 'FMCG-001', qty: 500, status: 'InProgress', startDate: new Date().toISOString() },
  ],
  workOrderSeq: 2,
};

function loadStore(): PersistedStore {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf8');
      const parsed = JSON.parse(raw) as Partial<PersistedStore>;
      return { ...SEED, ...parsed };
    }
  } catch (err) {
    console.error('[demo-store] load failed, using seed:', (err as Error).message);
  }
  return JSON.parse(JSON.stringify(SEED));
}

let saveTimer: NodeJS.Timeout | null = null;
function persistStore() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      const snapshot: PersistedStore = {
        orders: demoOrdersStore,
        orderSeq: demoOrderSeq,
        inventory: demoInventoryStore,
        invoices: demoInvoicesStore,
        invoiceSeq: demoInvoiceSeq,
        workflow: workflowLog,
        workflowSeq,
        purchaseOrders: demoPOStore,
        poSeq: demoPOSeq,
        vendorInvoices: demoVendorInvoicesStore,
        vendorInvoiceSeq: demoVendorInvoiceSeq,
        employees: demoEmployeesStore,
        employeeSeq: demoEmployeeSeq,
        customers: demoCustomersStore,
        customerSeq: demoCustomerSeq,
        leads: demoLeadsStore,
        leadSeq: demoLeadSeq,
        ledger: demoLedgerStore,
        ledgerSeq: demoLedgerSeq,
        shipments: demoShipmentsStore,
        shipmentSeq: demoShipmentSeq,
        workOrders: demoWorkOrdersStore,
        workOrderSeq: demoWorkOrderSeq,
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(snapshot, null, 2));
    } catch (err) {
      console.error('[demo-store] save failed:', (err as Error).message);
    }
  }, 200);
}

const __initialStore = loadStore();
const demoOrdersStore: DemoOrder[] = __initialStore.orders;
let demoOrderSeq = __initialStore.orderSeq;
const demoInventoryStore: DemoInventoryItem[] = __initialStore.inventory;
const demoInvoicesStore: DemoInvoice[] = __initialStore.invoices;
let demoInvoiceSeq = __initialStore.invoiceSeq;
const workflowLog: WorkflowEvent[] = __initialStore.workflow;
let workflowSeq = __initialStore.workflowSeq;
const demoPOStore: DemoPurchaseOrder[] = __initialStore.purchaseOrders;
let demoPOSeq = __initialStore.poSeq;
const demoVendorInvoicesStore: DemoVendorInvoice[] = __initialStore.vendorInvoices;
let demoVendorInvoiceSeq = __initialStore.vendorInvoiceSeq;
const demoEmployeesStore: DemoEmployee[] = __initialStore.employees;
let demoEmployeeSeq = __initialStore.employeeSeq;
const demoCustomersStore: DemoCustomer[] = __initialStore.customers;
let demoCustomerSeq = __initialStore.customerSeq;
const demoLeadsStore: DemoLead[] = __initialStore.leads;
let demoLeadSeq = __initialStore.leadSeq;
const demoLedgerStore: DemoLedgerEntry[] = __initialStore.ledger;
let demoLedgerSeq = __initialStore.ledgerSeq;
const demoShipmentsStore: DemoShipment[] = __initialStore.shipments;
let demoShipmentSeq = __initialStore.shipmentSeq;
const demoWorkOrdersStore: DemoWorkOrder[] = __initialStore.workOrders;
let demoWorkOrderSeq = __initialStore.workOrderSeq;

function newDemoId() {
  const id = `demo-${String(demoOrderSeq++).padStart(3, '0')}`;
  persistStore();
  return id;
}

function newInvoiceId() {
  const id = `inv-${String(demoInvoiceSeq++).padStart(4, '0')}`;
  persistStore();
  return id;
}

function newPOId() {
  const id = `po-${String(demoPOSeq++).padStart(4, '0')}`;
  persistStore();
  return id;
}

function newVendorInvoiceId() {
  const id = `vinv-${String(demoVendorInvoiceSeq++).padStart(4, '0')}`;
  persistStore();
  return id;
}

function logWorkflow(type: string, message: string, ref?: string) {
  const event: WorkflowEvent = {
    id: `evt-${String(workflowSeq++).padStart(5, '0')}`,
    type,
    message,
    ref,
    at: new Date().toISOString(),
  };
  workflowLog.unshift(event);
  if (workflowLog.length > 100) workflowLog.length = 100;
  persistStore();
  return event;
}

// ── ERP Tier-1 ID generators + helpers ──────────────────────────────────────
function newEmployeeId() {
  const id = `emp-${String(demoEmployeeSeq++).padStart(3, '0')}`;
  persistStore();
  return id;
}
function newCustomerId() {
  const id = `cust-${String(demoCustomerSeq++).padStart(3, '0')}`;
  persistStore();
  return id;
}
function newLeadId() {
  const id = `lead-${String(demoLeadSeq++).padStart(3, '0')}`;
  persistStore();
  return id;
}
function newLedgerId() {
  const id = `gl-${String(demoLedgerSeq++).padStart(4, '0')}`;
  persistStore();
  return id;
}
function newShipmentId() {
  const id = `ship-${String(demoShipmentSeq++).padStart(4, '0')}`;
  persistStore();
  return id;
}
function newWorkOrderId() {
  const id = `wo-${String(demoWorkOrderSeq++).padStart(4, '0')}`;
  persistStore();
  return id;
}

function postLedger(account: string, debit: number, credit: number, ref: string | undefined, memo: string) {
  const entry: DemoLedgerEntry = {
    id: newLedgerId(),
    date: new Date().toISOString(),
    account,
    debit: Math.max(0, Number(debit) || 0),
    credit: Math.max(0, Number(credit) || 0),
    ref,
    memo,
  };
  demoLedgerStore.unshift(entry);
  if (demoLedgerStore.length > 500) demoLedgerStore.length = 500;
  logWorkflow('ledger.posted', `${account} D:${entry.debit} C:${entry.credit} — ${memo}`, ref);
  // High-value entries route for approval
  const max = Math.max(entry.debit, entry.credit);
  if (max >= 50000) {
    eventBus.emit('finance.high-value-entry', entry);
  }
  return entry;
}

import { HarvicsAlphaEngine } from './services/harvicsAlphaEngine';

// CRUD Controllers (Domain WRITE + full CRUD)
import ordersCrudRouter from './modules/orders/orders.crud.controller';
import inventoryCrudRouter from './modules/inventory/inventory.crud.controller';
import financeCrudRouter from './modules/finance/finance.crud.controller';
import crmCrudRouter from './modules/crm/crm.crud.controller';
import hrCrudRouter from './modules/hr/hr.crud.controller';
import logisticsCrudRouter from './modules/logistics/logistics.crud.controller';
import procurementCrudRouter from './modules/procurement/procurement.crud.controller';
import { t14 } from './modules/t14/t14.store';
import { stubCatalogRouter } from './modules/stub-catalog/stub.catalog';
import { buildGenericRouter, seedAllModules } from './modules/generic/mount';
import {
  manufacturingCrudRouter,
  qualityCrudRouter,
  projectManagementCrudRouter,
  biCrudRouter,
  treasuryCrudRouter,
  digitalFinanceCrudRouter,
  marketingCrudRouter,
  shippingTradeCrudRouter,
} from './modules/services/missing-modules.crud.controller';
import intelligenceRouter from './modules/intelligence/intelligence.controller';
import servicesRouter from './modules/services/services.controller';

const router = Router();

const CONTRACT_READY_SEGMENTS = new Set([
  'orders',
  'inventory',
  'finance',
  'payments',
  'crm',
  'hr',
  'warehouse',
  'assets',
  'maintenance',
  'facilities',
  'logistics',
  'grc',
  'governance',
  'procurement',
  'procurement-crud',
  'manufacturing',
  'quality',
  'projects',
  'bi',
  'treasury',
  'digital-finance',
  'marketing',
  'shipping-trade',
  'platform',
  'documents',
  'integration',
  'admin',
  'distributor',
  'universe',
  'portals',
  'intelligence',
  'comms',
  'audit-log',
  'data-ocean',
  'localisation',
  'localization',
  'gps',
  'satellite',
  'trade',
  'graph',
  'navigation',
  'territory',
  'auth',
  'services',
  'ai'
]);

const PROTECTED_SEGMENTS = new Set([
  'orders',
  'inventory',
  'finance',
  'payments',
  'crm',
  'hr',
  'logistics',
  'procurement-crud',
  'manufacturing',
  'quality',
  'projects',
  'bi',
  'treasury',
  'digital-finance',
  'marketing',
  'shipping-trade',
  'intelligence',
  'services',
  'data-ocean',
  'ai',
  'audit-log'
]);

const CORE_MODULE_CONTRACTS: Record<string, any> = {
  orders: {
    module: 'orders',
    version: 'v1',
    endpoints: {
      list: 'GET /api/orders',
      get: 'GET /api/orders/:id',
      create: 'POST /api/orders',
      update: 'PUT /api/orders/:id',
      patchStatus: 'PATCH /api/orders/:id/status',
      remove: 'DELETE /api/orders/:id'
    },
    requiredCreateFields: ['customer', 'items'],
    fieldTypes: {
      customer: 'string',
      items: 'array'
    },
    sampleCreatePayload: {
      customer: 'Global Retail LLC',
      city: 'Dubai',
      channel: 'B2B',
      amount: 12500,
      currency: 'USD',
      items: [{ sku: 'FMCG-001', qty: 100 }],
      shippingAddress: 'Warehouse District, Dubai'
    },
    governance: ['legal', 'budget', 'contract', 'security', 'compliance']
  },
  inventory: {
    module: 'inventory',
    version: 'v1',
    endpoints: {
      list: 'GET /api/inventory',
      get: 'GET /api/inventory/:id',
      create: 'POST /api/inventory',
      adjust: 'POST /api/inventory/adjust',
      transfer: 'POST /api/inventory/transfer',
      remove: 'DELETE /api/inventory/:id'
    },
    requiredCreateFields: ['sku', 'description'],
    fieldTypes: {
      sku: 'string',
      description: 'string'
    },
    sampleCreatePayload: {
      sku: 'FMCG-001',
      description: 'Chicken Nuggets 500g',
      category: 'Frozen Foods',
      onHand: 12000,
      minStock: 3000,
      warehouse: 'DXB-W1',
      unitCost: 4.25
    },
    governance: ['legal', 'budget', 'contract', 'security', 'compliance']
  },
  finance: {
    module: 'finance',
    version: 'v1',
    endpoints: {
      invoicesList: 'GET /api/finance/invoices',
      invoicesCreate: 'POST /api/finance/invoices',
      paymentsList: 'GET /api/finance/payments',
      paymentsCreate: 'POST /api/finance/payments',
      journalList: 'GET /api/finance/journal',
      journalCreate: 'POST /api/finance/journal'
    },
    requiredCreateFields: ['customer', 'amount'],
    fieldTypes: {
      customer: 'string',
      amount: 'number'
    },
    sampleCreatePayload: {
      customer: 'North Hub Distribution',
      amount: 9500,
      currency: 'USD',
      dueDate: '2026-06-30',
      type: 'AR'
    },
    governance: ['legal', 'budget', 'contract', 'security', 'compliance']
  },
  crm: {
    module: 'crm',
    version: 'v1',
    endpoints: {
      customersList: 'GET /api/crm/customers',
      customersCreate: 'POST /api/crm/customers',
      leadsList: 'GET /api/crm/leads',
      leadsCreate: 'POST /api/crm/leads',
      campaignsList: 'GET /api/crm/campaigns',
      campaignsCreate: 'POST /api/crm/campaigns'
    },
    requiredCreateFields: ['name'],
    fieldTypes: {
      name: 'string'
    },
    sampleCreatePayload: {
      name: 'New Trade Partner',
      segment: 'Retail',
      country: 'AE',
      city: 'Dubai',
      contactEmail: 'ops@tradepartner.example'
    },
    governance: ['legal', 'budget', 'contract', 'security', 'compliance']
  },
  hr: {
    module: 'hr',
    version: 'v1',
    endpoints: {
      employeesList: 'GET /api/hr/employees',
      employeesCreate: 'POST /api/hr/employees',
      payrollList: 'GET /api/hr/payroll',
      payrollCreate: 'POST /api/hr/payroll'
    },
    requiredCreateFields: ['name', 'department'],
    fieldTypes: {
      name: 'string',
      department: 'string'
    },
    sampleCreatePayload: {
      name: 'Aisha Rahman',
      department: 'Operations',
      position: 'Regional Planner',
      country: 'AE',
      city: 'Dubai',
      salary: 8500,
      currency: 'USD'
    },
    governance: ['legal', 'budget', 'contract', 'security', 'compliance']
  }
};

const SEGMENT_DEFAULT_CONTRACTS: Record<string, any> = {
  logistics: { requiredCreateFields: ['name'], fieldTypes: { name: 'string' }, sampleCreatePayload: { name: 'LGT-ROUTE-001', mode: 'Road', status: 'Planned' } },
  procurement: { requiredCreateFields: ['name'], fieldTypes: { name: 'string' }, sampleCreatePayload: { name: 'PR-REQ-001', amount: 15000, vendor: 'Preferred Supplier' } },
  'procurement-crud': { requiredCreateFields: ['name'], fieldTypes: { name: 'string' }, sampleCreatePayload: { name: 'PO-2026-1001', amount: 42000, status: 'Draft' } },
  manufacturing: { requiredCreateFields: ['name'], fieldTypes: { name: 'string' }, sampleCreatePayload: { name: 'WO-2026-001', plannedQty: 10000, status: 'Planned' } },
  quality: { requiredCreateFields: ['name'], fieldTypes: { name: 'string' }, sampleCreatePayload: { name: 'QC-LOT-001', decision: 'Pass', severity: 'Low' } },
  projects: { requiredCreateFields: ['name'], fieldTypes: { name: 'string' }, sampleCreatePayload: { name: 'Project Alpha', budget: 250000, status: 'In Progress' } },
  bi: { requiredCreateFields: ['name'], fieldTypes: { name: 'string' }, sampleCreatePayload: { name: 'Executive Dashboard', type: 'Scheduled', cadence: 'Weekly' } },
  treasury: { requiredCreateFields: ['name'], fieldTypes: { name: 'string' }, sampleCreatePayload: { name: 'Main Treasury Account', currency: 'USD', balance: 1000000 } },
  'digital-finance': { requiredCreateFields: ['name'], fieldTypes: { name: 'string' }, sampleCreatePayload: { name: 'HPAY Wallet', asset: 'USDT', balance: 250000 } },
  marketing: { requiredCreateFields: ['name'], fieldTypes: { name: 'string' }, sampleCreatePayload: { name: 'Ramadan Campaign', channel: 'Multi', status: 'Planned' } },
  'shipping-trade': { requiredCreateFields: ['name'], fieldTypes: { name: 'string' }, sampleCreatePayload: { name: 'SHP-2026-9001', mode: 'Sea', compliance: 'Cleared' } },
  intelligence: { requiredCreateFields: ['name'], fieldTypes: { name: 'string' }, sampleCreatePayload: { name: 'Demand Insight Request', domain: 'sales', metric: 'demand' } },
  'data-ocean': { requiredCreateFields: ['name'], fieldTypes: { name: 'string' }, sampleCreatePayload: { name: 'Bronze Ingest Event', source: 'orders', layer: 'bronze' } },
  ai: { requiredCreateFields: ['name'], fieldTypes: { name: 'string' }, sampleCreatePayload: { name: 'AI Job', model: 'demand', priority: 'normal' } },
  comms: { requiredCreateFields: ['title'], fieldTypes: { title: 'string' }, sampleCreatePayload: { title: 'System Alert', body: 'Low stock warning', priority: 'high' } },
  services: { requiredCreateFields: ['name'], fieldTypes: { name: 'string' }, sampleCreatePayload: { name: 'Background Service Task', type: 'maintenance' } },
  default: { requiredCreateFields: ['name'], fieldTypes: { name: 'string' }, sampleCreatePayload: { name: 'Generic Module Record' } }
};

function getSegmentFromApiPath(path: string): string {
  const cleaned = String(path || '').trim().replace(/^\//, '');
  const normalized = cleaned.startsWith('api/') ? cleaned.slice(4) : cleaned;
  return normalized.split('/')[0] || '';
}

function buildDefaultContract(segment: string, path: string) {
  const template = SEGMENT_DEFAULT_CONTRACTS[segment] || SEGMENT_DEFAULT_CONTRACTS.default;
  return {
    module: segment,
    version: 'v1',
    endpoints: {
      list: `GET ${path}`,
      create: `POST ${path}`,
      get: `GET ${path}/:id`,
      update: `PUT ${path}/:id`,
      remove: `DELETE ${path}/:id`
    },
    requiredCreateFields: template.requiredCreateFields,
    fieldTypes: template.fieldTypes,
    sampleCreatePayload: template.sampleCreatePayload,
    governance: ['legal', 'budget', 'contract', 'security', 'compliance']
  };
}

function buildProbeData(path: string) {
  const segment = getSegmentFromApiPath(path);
  const contractReady = CONTRACT_READY_SEGMENTS.has(segment);
  const protectedRoute = PROTECTED_SEGMENTS.has(segment);
  const coreContract = CORE_MODULE_CONTRACTS[segment] || null;
  const generatedContract = contractReady ? buildDefaultContract(segment, `/api/${segment}`) : null;
  const contract = coreContract || generatedContract;

  return {
    path,
    segment,
    contractReady,
    protected: protectedRoute,
    status: contractReady ? (protectedRoute ? 'contract-ready-protected' : 'contract-ready-public') : 'planned',
    nextAction: contractReady ? 'bind-module-ui' : 'implement-backend-module',
    contract,
    contractStandardized: Boolean(contract)
  };
}

// Health check endpoint for /api/health
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'harvics-backend-api',
    timestamp: new Date().toISOString()
  });
});

// Public demo orders endpoints for command-center CRUD workspace (in-memory, no DB required).
router.get('/modules/demo/orders', (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 20));
  const statusFilter = String(req.query.status || '').trim().toLowerCase();
  const customerFilter = String(req.query.customer || '').trim().toLowerCase();

  let result = [...demoOrdersStore].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (statusFilter) result = result.filter(o => o.status.toLowerCase().includes(statusFilter));
  if (customerFilter) result = result.filter(o => o.customer.toLowerCase().includes(customerFilter));

  const total = result.length;
  const data = result.slice((page - 1) * limit, page * limit);
  return res.json({ success: true, data, total, page, pages: Math.ceil(total / limit) });
});

router.post('/modules/demo/orders', (req: Request, res: Response) => {
  const payload = req.body || {};
  if (!payload.customer || !Array.isArray(payload.items) || payload.items.length === 0) {
    return res.status(400).json({ success: false, error: 'customer and items are required' });
  }

  const items = payload.items.map((i: any) => ({ sku: String(i.sku || ''), qty: Number(i.qty || 1) }));

  // Workflow step 1: validate inventory availability
  const shortages: Array<{ sku: string; need: number; available: number }> = [];
  for (const item of items) {
    const inv = demoInventoryStore.find(i => i.sku === item.sku);
    const available = inv ? inv.qty - inv.reserved : 0;
    if (!inv || available < item.qty) {
      shortages.push({ sku: item.sku, need: item.qty, available });
    }
  }
  if (shortages.length > 0) {
    return res.status(409).json({
      success: false,
      error: 'inventory shortage',
      shortages,
    });
  }

  // Compute amount from inventory unit prices if not provided
  const computedAmount = items.reduce((sum: number, it: { sku: string; qty: number }) => {
    const inv = demoInventoryStore.find(i => i.sku === it.sku);
    return sum + (inv ? inv.unitPrice * it.qty : 0);
  }, 0);

  const order: DemoOrder = {
    id: newDemoId(),
    customer: String(payload.customer),
    city: String(payload.city || 'Dubai'),
    amount: Number(payload.amount) || computedAmount,
    currency: String(payload.currency || 'USD'),
    status: String(payload.status || 'Pending'),
    items,
    createdAt: new Date().toISOString(),
  };

  demoOrdersStore.unshift(order);
  logWorkflow('order.created', `Order ${order.id} created for ${order.customer}`, order.id);

  // Workflow step 2: reserve inventory
  for (const item of items) {
    const inv = demoInventoryStore.find(i => i.sku === item.sku);
    if (inv) {
      inv.reserved += item.qty;
      inv.updatedAt = new Date().toISOString();
    }
  }
  logWorkflow('inventory.reserved', `Reserved ${items.reduce((s: number, i: { qty: number }) => s + i.qty, 0)} units across ${items.length} SKUs`, order.id);

  // Workflow step 3: auto-generate draft invoice
  const invoice: DemoInvoice = {
    id: newInvoiceId(),
    orderId: order.id,
    customer: order.customer,
    amount: order.amount,
    currency: order.currency,
    status: 'Issued',
    issuedAt: new Date().toISOString(),
  };
  demoInvoicesStore.unshift(invoice);
  logWorkflow('invoice.issued', `Invoice ${invoice.id} issued for ${invoice.currency} ${invoice.amount.toLocaleString()}`, invoice.id);

  // Workflow step 4: auto-create shipment (Pending) for the new order
  const firstSku = items[0]?.sku;
  const sourceWarehouse = (firstSku && demoInventoryStore.find(i => i.sku === firstSku)?.warehouse) || 'Dubai-W1';
  const shipment: DemoShipment = {
    id: newShipmentId(),
    orderId: order.id,
    origin: sourceWarehouse,
    destination: order.city,
    carrier: 'Aramex',
    status: 'Pending',
    eta: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  };
  demoShipmentsStore.unshift(shipment);
  logWorkflow('shipment.created', `Shipment ${shipment.id} pending dispatch for ${order.id}`, shipment.id);

  return res.status(201).json({ success: true, data: order, invoice, shipment });
});

router.patch('/modules/demo/orders/:id/status', (req: Request, res: Response) => {
  const status = String(req.body?.status || '').trim();
  if (!status) return res.status(400).json({ success: false, error: 'status is required' });

  const order = demoOrdersStore.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, error: 'order not found' });

  const previousStatus = order.status;
  order.status = status;
  logWorkflow('order.status', `Order ${order.id}: ${previousStatus} → ${status}`, order.id);

  // If completed, release reserved inventory and decrement actual qty
  if (status === 'Completed' && previousStatus !== 'Completed') {
    for (const item of order.items) {
      const inv = demoInventoryStore.find(i => i.sku === item.sku);
      if (inv) {
        inv.reserved = Math.max(0, inv.reserved - item.qty);
        inv.qty = Math.max(0, inv.qty - item.qty);
        inv.updatedAt = new Date().toISOString();
      }
    }
    // Mark invoice paid
    const invoice = demoInvoicesStore.find(inv => inv.orderId === order.id);
    if (invoice && invoice.status !== 'Paid') {
      invoice.status = 'Paid';
      logWorkflow('invoice.paid', `Invoice ${invoice.id} marked paid`, invoice.id);
      // Post revenue to general ledger
      postLedger('AR', invoice.amount, 0, invoice.id, `Receivable cleared ${invoice.id}`);
      postLedger('Revenue', 0, invoice.amount, invoice.id, `Sales revenue ${invoice.id}`);
    }
    // Mark shipment delivered
    const ship = demoShipmentsStore.find(s => s.orderId === order.id);
    if (ship && ship.status !== 'Delivered') {
      ship.status = 'Delivered';
      logWorkflow('shipment.delivered', `Shipment ${ship.id} delivered to ${ship.destination}`, ship.id);
      eventBus.emit('shipment.delivered', ship);
    }
    logWorkflow('inventory.shipped', `Shipped order ${order.id}, inventory decremented`, order.id);
  }

  // If cancelled, release reservations
  if (status === 'Cancelled' && previousStatus !== 'Cancelled') {
    for (const item of order.items) {
      const inv = demoInventoryStore.find(i => i.sku === item.sku);
      if (inv) {
        inv.reserved = Math.max(0, inv.reserved - item.qty);
        inv.updatedAt = new Date().toISOString();
      }
    }
    const invoice = demoInvoicesStore.find(inv => inv.orderId === order.id);
    if (invoice && invoice.status !== 'Cancelled') {
      invoice.status = 'Cancelled';
    }
    logWorkflow('inventory.released', `Released reservations for ${order.id}`, order.id);
  }

  return res.json({ success: true, data: order });
});

router.delete('/modules/demo/orders/:id', (req: Request, res: Response) => {
  const idx = demoOrdersStore.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'order not found' });

  const order = demoOrdersStore[idx];
  // Release any reservations if pending
  if (order.status === 'Pending' || order.status === 'Processing') {
    for (const item of order.items) {
      const inv = demoInventoryStore.find(i => i.sku === item.sku);
      if (inv) {
        inv.reserved = Math.max(0, inv.reserved - item.qty);
        inv.updatedAt = new Date().toISOString();
      }
    }
  }
  demoOrdersStore.splice(idx, 1);
  logWorkflow('order.deleted', `Order ${order.id} deleted`, order.id);
  return res.json({ success: true, message: 'Deleted' });
});

// ── Inventory CRUD (in-memory demo) ─────────────────────────────
router.get('/modules/demo/inventory', (req: Request, res: Response) => {
  const search = String(req.query.search || '').trim().toLowerCase();
  let result = [...demoInventoryStore];
  if (search) {
    result = result.filter(i =>
      i.sku.toLowerCase().includes(search) ||
      i.name.toLowerCase().includes(search) ||
      i.category.toLowerCase().includes(search)
    );
  }
  return res.json({ success: true, data: result, total: result.length });
});

router.post('/modules/demo/inventory', (req: Request, res: Response) => {
  const payload = req.body || {};
  if (!payload.sku || !payload.name) {
    return res.status(400).json({ success: false, error: 'sku and name are required' });
  }
  if (demoInventoryStore.find(i => i.sku === payload.sku)) {
    return res.status(409).json({ success: false, error: 'SKU already exists' });
  }
  const item: DemoInventoryItem = {
    sku: String(payload.sku),
    name: String(payload.name),
    category: String(payload.category || 'General'),
    warehouse: String(payload.warehouse || 'Dubai-W1'),
    qty: Number(payload.qty || 0),
    reserved: 0,
    unitPrice: Number(payload.unitPrice || 0),
    currency: String(payload.currency || 'USD'),
    updatedAt: new Date().toISOString(),
  };
  demoInventoryStore.push(item);
  logWorkflow('inventory.created', `New SKU ${item.sku} (${item.name}) added`, item.sku);
  return res.status(201).json({ success: true, data: item });
});

router.patch('/modules/demo/inventory/:sku', (req: Request, res: Response) => {
  const item = demoInventoryStore.find(i => i.sku === req.params.sku);
  if (!item) return res.status(404).json({ success: false, error: 'SKU not found' });

  const payload = req.body || {};
  if (typeof payload.qty === 'number') item.qty = Math.max(0, payload.qty);
  if (typeof payload.unitPrice === 'number') item.unitPrice = Math.max(0, payload.unitPrice);
  if (payload.warehouse) item.warehouse = String(payload.warehouse);
  item.updatedAt = new Date().toISOString();
  logWorkflow('inventory.updated', `SKU ${item.sku} updated (qty=${item.qty})`, item.sku);
  return res.json({ success: true, data: item });
});

router.delete('/modules/demo/inventory/:sku', (req: Request, res: Response) => {
  const idx = demoInventoryStore.findIndex(i => i.sku === req.params.sku);
  if (idx === -1) return res.status(404).json({ success: false, error: 'SKU not found' });
  const removed = demoInventoryStore.splice(idx, 1)[0];
  logWorkflow('inventory.deleted', `SKU ${removed.sku} removed`, removed.sku);
  return res.json({ success: true, message: 'Deleted' });
});

// ── Invoices (read-only + status) ────────────────────────────────
router.get('/modules/demo/invoices', (_req: Request, res: Response) => {
  return res.json({ success: true, data: demoInvoicesStore, total: demoInvoicesStore.length });
});

router.patch('/modules/demo/invoices/:id/status', (req: Request, res: Response) => {
  const status = String(req.body?.status || '').trim() as DemoInvoice['status'];
  if (!['Draft', 'Issued', 'Paid', 'Cancelled'].includes(status)) {
    return res.status(400).json({ success: false, error: 'invalid status' });
  }
  const invoice = demoInvoicesStore.find(i => i.id === req.params.id);
  if (!invoice) return res.status(404).json({ success: false, error: 'invoice not found' });
  invoice.status = status;
  logWorkflow('invoice.status', `Invoice ${invoice.id}: → ${status}`, invoice.id);
  return res.json({ success: true, data: invoice });
});

// ── Workflow event log ───────────────────────────────────────────
router.get('/modules/demo/workflow', (_req: Request, res: Response) => {
  return res.json({ success: true, data: workflowLog.slice(0, 30), total: workflowLog.length });
});

// ── Live KPI summary ─────────────────────────────────────────────
router.get('/modules/demo/kpis', (_req: Request, res: Response) => {
  const totalOrders = demoOrdersStore.length;
  const completedOrders = demoOrdersStore.filter(o => o.status === 'Completed').length;
  const pendingOrders = demoOrdersStore.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
  const totalRevenue = demoInvoicesStore
    .filter(i => i.status === 'Paid')
    .reduce((sum, i) => sum + i.amount, 0);
  const issuedRevenue = demoInvoicesStore
    .filter(i => i.status === 'Issued')
    .reduce((sum, i) => sum + i.amount, 0);
  const inventoryValue = demoInventoryStore.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
  const skuCount = demoInventoryStore.length;
  const lowStockCount = demoInventoryStore.filter(i => i.qty - i.reserved < 100).length;

  return res.json({
    success: true,
    data: {
      orders: { total: totalOrders, completed: completedOrders, pending: pendingOrders },
      invoices: { paid: totalRevenue, outstanding: issuedRevenue },
      inventory: { value: inventoryValue, skus: skuCount, lowStock: lowStockCount },
      procurement: {
        purchaseOrders: demoPOStore.length,
        received: demoPOStore.filter(p => p.status === 'Received' || p.status === 'Paid').length,
        outstanding: demoVendorInvoicesStore.filter(v => v.status === 'Pending').reduce((s, v) => s + v.amount, 0),
      },
    },
  });
});

// ── Procure-to-Pay (P3) ────────────────────────────────────────────
router.get('/modules/demo/purchase-orders', (_req: Request, res: Response) => {
  return res.json({ success: true, data: [...demoPOStore].reverse(), total: demoPOStore.length });
});

router.post('/modules/demo/purchase-orders', (req: Request, res: Response) => {
  const payload = req.body || {};
  if (!payload.vendor || !Array.isArray(payload.items) || payload.items.length === 0) {
    return res.status(400).json({ success: false, error: 'vendor and items are required' });
  }
  const items = payload.items.map((i: any) => ({
    sku: String(i.sku || ''),
    qty: Number(i.qty || 1),
    unitPrice: Number(i.unitPrice || 0),
  }));
  const amount = items.reduce((s: number, i: { qty: number; unitPrice: number }) => s + i.qty * i.unitPrice, 0);
  const po: DemoPurchaseOrder = {
    id: newPOId(),
    vendor: String(payload.vendor),
    status: 'Issued',
    items,
    amount,
    currency: String(payload.currency || 'USD'),
    createdAt: new Date().toISOString(),
  };
  demoPOStore.push(po);
  logWorkflow('po.issued', `PO ${po.id} issued to ${po.vendor} for ${po.currency} ${amount.toLocaleString()}`, po.id);
  return res.status(201).json({ success: true, data: po });
});

router.post('/modules/demo/purchase-orders/:id/receive', (req: Request, res: Response) => {
  const po = demoPOStore.find(p => p.id === req.params.id);
  if (!po) return res.status(404).json({ success: false, error: 'PO not found' });
  if (po.status !== 'Issued') return res.status(409).json({ success: false, error: 'PO not in Issued state' });

  // Increment inventory
  for (const item of po.items) {
    let inv = demoInventoryStore.find(i => i.sku === item.sku);
    if (!inv) {
      inv = {
        sku: item.sku,
        name: item.sku,
        category: 'General',
        warehouse: 'Dubai-W1',
        qty: 0,
        reserved: 0,
        unitPrice: item.unitPrice,
        currency: po.currency,
        updatedAt: new Date().toISOString(),
      };
      demoInventoryStore.push(inv);
    }
    inv.qty += item.qty;
    inv.updatedAt = new Date().toISOString();
  }
  po.status = 'Received';
  logWorkflow('inventory.received', `Goods receipt for ${po.id}: ${po.items.length} SKUs added`, po.id);

  // Auto-generate vendor invoice
  const vinv: DemoVendorInvoice = {
    id: newVendorInvoiceId(),
    poId: po.id,
    vendor: po.vendor,
    amount: po.amount,
    currency: po.currency,
    status: 'Pending',
    receivedAt: new Date().toISOString(),
  };
  demoVendorInvoicesStore.unshift(vinv);
  logWorkflow('vendor-invoice.created', `Vendor invoice ${vinv.id} pending payment`, vinv.id);

  return res.json({ success: true, data: po, vendorInvoice: vinv });
});

router.get('/modules/demo/vendor-invoices', (_req: Request, res: Response) => {
  return res.json({ success: true, data: demoVendorInvoicesStore, total: demoVendorInvoicesStore.length });
});

router.patch('/modules/demo/vendor-invoices/:id/pay', (req: Request, res: Response) => {
  const vinv = demoVendorInvoicesStore.find(v => v.id === req.params.id);
  if (!vinv) return res.status(404).json({ success: false, error: 'invoice not found' });
  if (vinv.status === 'Paid') return res.json({ success: true, data: vinv });
  vinv.status = 'Paid';
  const po = demoPOStore.find(p => p.id === vinv.poId);
  if (po) po.status = 'Paid';
  logWorkflow('vendor-invoice.paid', `Paid vendor invoice ${vinv.id} (${vinv.currency} ${vinv.amount.toLocaleString()})`, vinv.id);
  // Post payable settlement to ledger
  postLedger('AP', vinv.amount, 0, vinv.id, `AP cleared ${vinv.id}`);
  postLedger('Cash', 0, vinv.amount, vinv.id, `Cash paid to ${vinv.vendor}`);
  return res.json({ success: true, data: vinv });
});

// ════════════════════════════════════════════════════════════════════════════
// ERP TIER-1 MODULE ENDPOINTS (HR · CRM · Finance · Logistics · Manufacturing)
// In-memory + persisted to demo-store.json. No auth (demo workspace only).
// ════════════════════════════════════════════════════════════════════════════

// ── HR: Employees (Prisma-backed) ───────────────────────────────────────────
const mapEmployee = (e: any) => e ? { ...e, role: e.position || 'Staff', hiredAt: e.joinDate || e.createdAt?.toISOString?.() || new Date().toISOString() } : e;

router.get('/modules/demo/employees', async (_req: Request, res: Response) => {
  try {
    const result = await employeesDb.list({}, 1, 1000);
    return res.json({ success: true, data: result.data.map(mapEmployee), total: result.total });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'db error' });
  }
});

router.post('/modules/demo/employees', async (req: Request, res: Response) => {
  const p = req.body || {};
  if (!p.name || !p.role) {
    return res.status(400).json({ success: false, error: 'name and role are required' });
  }
  try {
    const emp = await employeesDb.create({
      name: String(p.name),
      position: String(p.role),
      department: String(p.department || 'General'),
      salary: Number(p.salary) || 0,
      currency: String(p.currency || 'USD'),
      status: String(p.status || 'Active'),
      joinDate: new Date().toISOString(),
    });
    logWorkflow('hr.employee.hired', `${emp.name} hired as ${p.role} (${emp.department})`, emp.id);
    eventBus.emit('hr.employee.hired', emp);
    return res.status(201).json({ success: true, data: mapEmployee(emp) });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'db error' });
  }
});

router.patch('/modules/demo/employees/:id', async (req: Request, res: Response) => {
  const p = req.body || {};
  const patch: any = {};
  if (p.status) patch.status = String(p.status);
  if (typeof p.salary === 'number') patch.salary = p.salary;
  if (p.role) patch.position = String(p.role);
  if (p.department) patch.department = String(p.department);
  const updated = await employeesDb.update(req.params.id, patch);
  if (!updated) return res.status(404).json({ success: false, error: 'employee not found' });
  logWorkflow('hr.employee.updated', `${updated.name} updated (${updated.status}, ${updated.position})`, updated.id);
  return res.json({ success: true, data: mapEmployee(updated) });
});

router.delete('/modules/demo/employees/:id', async (req: Request, res: Response) => {
  const existing = await employeesDb.get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'employee not found' });
  await employeesDb.delete(req.params.id);
  logWorkflow('hr.employee.terminated', `${existing.name} removed from roster`, existing.id);
  return res.json({ success: true, data: mapEmployee(existing) });
});

// ── CRM: Customers (Prisma-backed) ──────────────────────────────────────────
const mapCustomer = (c: any) => c ? { ...c, company: c.name, ltv: c.lifetimeValue || 0, currency: 'USD' } : c;

router.get('/modules/demo/customers', async (_req: Request, res: Response) => {
  try {
    const result = await customersDb.list({}, 1, 1000);
    return res.json({ success: true, data: result.data.map(mapCustomer), total: result.total });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'db error' });
  }
});

router.post('/modules/demo/customers', async (req: Request, res: Response) => {
  const p = req.body || {};
  if (!p.name || !p.company) {
    return res.status(400).json({ success: false, error: 'name and company are required' });
  }
  try {
    const c = await customersDb.create({
      name: String(p.company),
      segment: String(p.segment || 'Retail'),
      country: String(p.country || 'AE'),
      lifetimeValue: Number(p.ltv) || 0,
      contactEmail: String(p.name),
    }, 'crm.customer.created');
    logWorkflow('crm.customer.created', `Customer ${c.name} added (${c.segment})`, c.id);
    return res.status(201).json({ success: true, data: mapCustomer(c) });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'db error' });
  }
});

router.delete('/modules/demo/customers/:id', async (req: Request, res: Response) => {
  const existing = await customersDb.get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'customer not found' });
  await customersDb.delete(req.params.id);
  logWorkflow('crm.customer.deleted', `Customer ${existing.name} removed`, existing.id);
  return res.json({ success: true, data: mapCustomer(existing) });
});

// ── CRM: Leads (Prisma-backed, with stage transition + auto-convert on Won) ─
const mapLead = (l: any) => l ? { ...l, name: l.contact || l.company, currency: 'USD', owner: 'Unassigned' } : l;

router.get('/modules/demo/leads', async (_req: Request, res: Response) => {
  try {
    const result = await leadsDb.list({}, 1, 1000);
    return res.json({ success: true, data: result.data.map(mapLead), total: result.total });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'db error' });
  }
});

router.post('/modules/demo/leads', async (req: Request, res: Response) => {
  const p = req.body || {};
  if (!p.name || !p.company) {
    return res.status(400).json({ success: false, error: 'name and company are required' });
  }
  try {
    const lead = await leadsDb.create({
      company: String(p.company),
      contact: String(p.name),
      email: String(p.email || ''),
      source: String(p.source || 'Inbound'),
      stage: String(p.stage || 'Lead'),
      value: Number(p.value) || 0,
    }, 'crm.lead.created');
    logWorkflow('crm.lead.created', `Lead ${lead.company} (${lead.stage}) — USD ${(lead.value || 0).toLocaleString()}`, lead.id);
    return res.status(201).json({ success: true, data: mapLead(lead) });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'db error' });
  }
});

router.patch('/modules/demo/leads/:id/stage', async (req: Request, res: Response) => {
  const lead = await leadsDb.get(req.params.id);
  if (!lead) return res.status(404).json({ success: false, error: 'lead not found' });
  const stage = String(req.body?.stage || '');
  const valid = ['New', 'Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
  if (!valid.includes(stage)) return res.status(400).json({ success: false, error: 'invalid stage' });
  const prev = lead.stage;
  const updated = await leadsDb.update(req.params.id, { stage });
  if (!updated) return res.status(500).json({ success: false, error: 'update failed' });
  logWorkflow('crm.lead.stage', `Lead ${updated.company}: ${prev} → ${stage}`, updated.id);

  // Auto-convert on Won
  let convertedCustomer: any = null;
  if (stage === 'Won' && prev !== 'Won') {
    convertedCustomer = await customersDb.create({
      name: updated.company,
      segment: 'Converted Lead',
      country: 'AE',
      lifetimeValue: updated.value || 0,
      contactEmail: updated.contact || updated.email || '',
    }, 'crm.customer.created');
    logWorkflow('crm.lead.converted', `Lead ${updated.id} converted → customer ${convertedCustomer.id}`, updated.id);
    eventBus.emit('crm.lead.won', updated);
  }
  return res.json({ success: true, data: mapLead(updated), customer: convertedCustomer ? mapCustomer(convertedCustomer) : null });
});

router.delete('/modules/demo/leads/:id', async (req: Request, res: Response) => {
  const existing = await leadsDb.get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'lead not found' });
  await leadsDb.delete(req.params.id);
  logWorkflow('crm.lead.deleted', `Lead ${existing.company} removed`, existing.id);
  return res.json({ success: true, data: mapLead(existing) });
});

// ── Finance: General Ledger ─────────────────────────────────────────────────
router.get('/modules/demo/ledger', (_req: Request, res: Response) => {
  // Compute trial balance per account
  const balances: Record<string, { debit: number; credit: number; balance: number }> = {};
  for (const e of demoLedgerStore) {
    if (!balances[e.account]) balances[e.account] = { debit: 0, credit: 0, balance: 0 };
    balances[e.account].debit += e.debit;
    balances[e.account].credit += e.credit;
    balances[e.account].balance = balances[e.account].debit - balances[e.account].credit;
  }
  return res.json({
    success: true,
    data: demoLedgerStore.slice(0, 100),
    total: demoLedgerStore.length,
    trialBalance: balances,
  });
});

router.post('/modules/demo/ledger', (req: Request, res: Response) => {
  const p = req.body || {};
  if (!p.account || (typeof p.debit !== 'number' && typeof p.credit !== 'number')) {
    return res.status(400).json({ success: false, error: 'account and debit/credit are required' });
  }
  const entry = postLedger(
    String(p.account),
    Number(p.debit) || 0,
    Number(p.credit) || 0,
    p.ref ? String(p.ref) : undefined,
    String(p.memo || 'Manual entry'),
  );
  return res.status(201).json({ success: true, data: entry });
});

// ── Logistics: Shipments ────────────────────────────────────────────────────
router.get('/modules/demo/shipments', (_req: Request, res: Response) => {
  return res.json({ success: true, data: [...demoShipmentsStore], total: demoShipmentsStore.length });
});

router.post('/modules/demo/shipments', (req: Request, res: Response) => {
  const p = req.body || {};
  if (!p.orderId || !p.destination) {
    return res.status(400).json({ success: false, error: 'orderId and destination are required' });
  }
  const ship: DemoShipment = {
    id: newShipmentId(),
    orderId: String(p.orderId),
    origin: String(p.origin || 'Dubai-W1'),
    destination: String(p.destination),
    carrier: String(p.carrier || 'Aramex'),
    status: 'Pending',
    eta: String(p.eta || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()),
    createdAt: new Date().toISOString(),
  };
  demoShipmentsStore.unshift(ship);
  logWorkflow('shipment.created', `Shipment ${ship.id} created for ${ship.orderId}`, ship.id);
  persistStore();
  return res.status(201).json({ success: true, data: ship });
});

router.patch('/modules/demo/shipments/:id/status', (req: Request, res: Response) => {
  const ship = demoShipmentsStore.find(s => s.id === req.params.id);
  if (!ship) return res.status(404).json({ success: false, error: 'shipment not found' });
  const status = String(req.body?.status || '') as DemoShipment['status'];
  const valid: DemoShipment['status'][] = ['Pending', 'InTransit', 'Delivered', 'Returned'];
  if (!valid.includes(status)) return res.status(400).json({ success: false, error: 'invalid status' });
  const prev = ship.status;
  ship.status = status;
  logWorkflow('shipment.status', `Shipment ${ship.id}: ${prev} → ${status}`, ship.id);
  persistStore();
  return res.json({ success: true, data: ship });
});

router.delete('/modules/demo/shipments/:id', (req: Request, res: Response) => {
  const idx = demoShipmentsStore.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'shipment not found' });
  const [removed] = demoShipmentsStore.splice(idx, 1);
  logWorkflow('shipment.deleted', `Shipment ${removed.id} removed`, removed.id);
  persistStore();
  return res.json({ success: true, data: removed });
});

// ── Manufacturing: Work Orders (Complete → adds to inventory) ──────────────
router.get('/modules/demo/work-orders', (_req: Request, res: Response) => {
  return res.json({ success: true, data: [...demoWorkOrdersStore].reverse(), total: demoWorkOrdersStore.length });
});

router.post('/modules/demo/work-orders', (req: Request, res: Response) => {
  const p = req.body || {};
  if (!p.sku || !p.qty) {
    return res.status(400).json({ success: false, error: 'sku and qty are required' });
  }
  const wo: DemoWorkOrder = {
    id: newWorkOrderId(),
    sku: String(p.sku),
    qty: Number(p.qty),
    status: 'InProgress',
    startDate: new Date().toISOString(),
  };
  demoWorkOrdersStore.push(wo);
  logWorkflow('mfg.workorder.opened', `Work order ${wo.id} opened: produce ${wo.qty} × ${wo.sku}`, wo.id);
  persistStore();
  return res.status(201).json({ success: true, data: wo });
});

router.patch('/modules/demo/work-orders/:id/complete', (req: Request, res: Response) => {
  const wo = demoWorkOrdersStore.find(w => w.id === req.params.id);
  if (!wo) return res.status(404).json({ success: false, error: 'work order not found' });
  if (wo.status === 'Completed') return res.json({ success: true, data: wo });
  wo.status = 'Completed';
  wo.completedAt = new Date().toISOString();

  // Auto-add produced units to inventory
  let inv = demoInventoryStore.find(i => i.sku === wo.sku);
  if (!inv) {
    inv = {
      sku: wo.sku,
      name: wo.sku,
      category: 'Manufactured',
      warehouse: 'Dubai-W1',
      qty: 0,
      reserved: 0,
      unitPrice: 10,
      currency: 'USD',
      updatedAt: new Date().toISOString(),
    };
    demoInventoryStore.push(inv);
  }
  inv.qty += wo.qty;
  inv.updatedAt = new Date().toISOString();
  logWorkflow('mfg.workorder.completed', `Work order ${wo.id} done: +${wo.qty} ${wo.sku} to stock`, wo.id);
  eventBus.emit('mfg.workorder.completed', wo);
  persistStore();
  return res.json({ success: true, data: wo, inventory: inv });
});

router.patch('/modules/demo/work-orders/:id/cancel', (req: Request, res: Response) => {
  const wo = demoWorkOrdersStore.find(w => w.id === req.params.id);
  if (!wo) return res.status(404).json({ success: false, error: 'work order not found' });
  wo.status = 'Cancelled';
  logWorkflow('mfg.workorder.cancelled', `Work order ${wo.id} cancelled`, wo.id);
  persistStore();
  return res.json({ success: true, data: wo });
});

// ── ERP-wide rollup KPIs ────────────────────────────────────────────────────
router.get('/modules/demo/erp-kpis', (_req: Request, res: Response) => {
  const cashAcct = demoLedgerStore.reduce((s, e) => s + (e.account === 'Cash' ? e.debit - e.credit : 0), 0);
  const revenue = demoLedgerStore.reduce((s, e) => s + (e.account === 'Revenue' ? e.credit - e.debit : 0), 0);
  return res.json({
    success: true,
    data: {
      hr: {
        headcount: demoEmployeesStore.length,
        active: demoEmployeesStore.filter(e => e.status === 'Active').length,
        payroll: demoEmployeesStore.reduce((s, e) => s + (e.status === 'Active' ? e.salary : 0), 0),
      },
      crm: {
        customers: demoCustomersStore.length,
        leads: demoLeadsStore.length,
        pipelineValue: demoLeadsStore
          .filter(l => l.stage !== 'Lost' && l.stage !== 'Won')
          .reduce((s, l) => s + l.value, 0),
        won: demoLeadsStore.filter(l => l.stage === 'Won').length,
      },
      finance: {
        cash: cashAcct,
        revenue,
        entries: demoLedgerStore.length,
      },
      logistics: {
        shipments: demoShipmentsStore.length,
        inTransit: demoShipmentsStore.filter(s => s.status === 'InTransit').length,
        delivered: demoShipmentsStore.filter(s => s.status === 'Delivered').length,
      },
      manufacturing: {
        workOrders: demoWorkOrdersStore.length,
        inProgress: demoWorkOrdersStore.filter(w => w.status === 'InProgress').length,
        completed: demoWorkOrdersStore.filter(w => w.status === 'Completed').length,
      },
    },
  });
});

// ── ERP Demo: Notifications & Approvals (no-auth proxy to real service) ─────
// Uses the production notificationService — same code path real auth uses.
router.get('/modules/demo/notifications', (_req: Request, res: Response) => {
  // Surface notifications for hq + country_manager (the demo persona scope)
  const hq = notificationService.getForUser('demo-viewer', 'hq', { limit: 50, offset: 0 });
  const cm = notificationService.getForUser('demo-viewer', 'country_manager', { limit: 50, offset: 0 });
  const sales = notificationService.getForUser('demo-viewer', 'sales_officer', { limit: 50, offset: 0 });
  const seen = new Set<string>();
  const merged: any[] = [];
  for (const list of [hq.notifications, cm.notifications, sales.notifications]) {
    for (const n of list) {
      if (!seen.has(n.id)) { seen.add(n.id); merged.push(n); }
    }
  }
  merged.sort((a, b) => (a.ts < b.ts ? 1 : -1));
  return res.json({ success: true, data: merged.slice(0, 50), total: merged.length });
});

router.get('/modules/demo/approvals', (_req: Request, res: Response) => {
  const all = notificationService.getAllApprovals({ limit: 100, offset: 0 });
  return res.json({ success: true, data: all.approvals, total: all.total });
});

router.post('/modules/demo/approvals/:id/decide', (req: Request, res: Response) => {
  const decision = String(req.body?.decision || '');
  if (decision !== 'approved' && decision !== 'rejected') {
    return res.status(400).json({ success: false, error: 'decision must be approved|rejected' });
  }
  const result = notificationService.decideApproval({
    approvalId: req.params.id,
    deciderId: 'demo-viewer',
    deciderRole: 'hq',
    decision: decision as 'approved' | 'rejected',
    note: req.body?.note ? String(req.body.note) : undefined,
  });
  if (!result) return res.status(404).json({ success: false, error: 'Approval not found or already decided' });
  return res.json({ success: true, data: result });
});

// ── AI Engine (P5) ────────────────────────────────────────────────────────
// Production-grade interface with a deterministic local engine that derives
// real signals from the live demo store. When `process.env.AI_ENGINE_URL` is
// set, we proxy to the Python FastAPI engine; otherwise we serve high-quality
// computed results so the UX stays continuous.
function computeOrderRecommendations() {
  const recs: Array<{ id: string; type: string; priority: 'low' | 'medium' | 'high' | 'critical'; title: string; rationale: string; suggestedAction: string; relatedRef?: string; confidence: number }> = [];

  // 1. Reorder signals from low-stock inventory
  for (const inv of demoInventoryStore) {
    const available = inv.qty - inv.reserved;
    if (available < 100) {
      recs.push({
        id: `rec-stock-${inv.sku}`,
        type: 'reorder',
        priority: available < 25 ? 'critical' : 'high',
        title: `Reorder ${inv.sku} — ${inv.name}`,
        rationale: `Available stock at ${available} units (reserved ${inv.reserved}). Below 100-unit reorder threshold.`,
        suggestedAction: `Issue PO for ${Math.max(500, inv.qty)} units to ${inv.warehouse}`,
        relatedRef: inv.sku,
        confidence: 0.92,
      });
    }
  }

  // 2. Cash-flow signals from outstanding invoices
  const outstanding = demoInvoicesStore.filter(i => i.status === 'Issued');
  if (outstanding.length >= 3) {
    const total = outstanding.reduce((s, i) => s + i.amount, 0);
    recs.push({
      id: 'rec-collections',
      type: 'collections',
      priority: total > 50000 ? 'high' : 'medium',
      title: `${outstanding.length} invoices awaiting payment`,
      rationale: `Outstanding AR is $${total.toLocaleString()} across ${outstanding.length} invoices. Average days outstanding above policy.`,
      suggestedAction: 'Trigger automated dunning sequence for invoices > 14 days old',
      confidence: 0.86,
    });
  }

  // 3. Sales opportunity from pipeline
  const hotLeads = demoLeadsStore.filter(l => l.stage === 'Proposal' || l.stage === 'Qualified');
  if (hotLeads.length > 0) {
    const value = hotLeads.reduce((s, l) => s + l.value, 0);
    recs.push({
      id: 'rec-pipeline',
      type: 'sales',
      priority: 'medium',
      title: `${hotLeads.length} active opportunities — $${value.toLocaleString()} pipeline`,
      rationale: 'Leads in Proposal/Qualified stages with no activity logged in 7+ days.',
      suggestedAction: 'Assign follow-up tasks to lead owners; advance Proposal stage to negotiation',
      confidence: 0.78,
    });
  }

  return recs;
}

function computeAnomalies() {
  const anomalies: Array<{ id: string; severity: 'low' | 'medium' | 'high'; module: string; signal: string; observedAt: string }> = [];
  // Inventory variance: any SKU with reserved > qty (impossible if wires correct)
  for (const inv of demoInventoryStore) {
    if (inv.reserved > inv.qty) {
      anomalies.push({
        id: `anom-inv-${inv.sku}`,
        severity: 'high',
        module: 'inventory',
        signal: `Reserved (${inv.reserved}) exceeds available qty (${inv.qty}) for ${inv.sku}`,
        observedAt: new Date().toISOString(),
      });
    }
  }
  // Cancelled orders without released reservations
  const cancelled = demoOrdersStore.filter(o => o.status === 'Cancelled');
  if (cancelled.length > 5) {
    anomalies.push({
      id: 'anom-cancel-rate',
      severity: 'medium',
      module: 'orders',
      signal: `${cancelled.length} cancelled orders detected — investigate fulfilment friction`,
      observedAt: new Date().toISOString(),
    });
  }
  return anomalies;
}

function computeInsights() {
  const totalRevenue = demoLedgerStore
    .filter(e => e.account === 'Revenue')
    .reduce((s, e) => s + e.credit - e.debit, 0);
  const inventoryValue = demoInventoryStore.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const headcount = demoEmployeesStore.filter(e => e.status === 'Active').length;
  const pipelineValue = demoLeadsStore
    .filter(l => l.stage !== 'Won' && l.stage !== 'Lost')
    .reduce((s, l) => s + l.value, 0);

  return [
    {
      id: 'ins-revenue-velocity',
      module: 'finance',
      headline: 'Revenue velocity',
      value: `$${totalRevenue.toLocaleString()}`,
      delta: totalRevenue > 0 ? '+' : '0',
      narrative: `${demoLedgerStore.length} ledger entries posted; revenue auto-flowing from completed orders.`,
    },
    {
      id: 'ins-inventory-coverage',
      module: 'inventory',
      headline: 'Inventory book value',
      value: `$${inventoryValue.toLocaleString()}`,
      delta: '',
      narrative: `${demoInventoryStore.length} active SKUs across ${new Set(demoInventoryStore.map(i => i.warehouse)).size} warehouses.`,
    },
    {
      id: 'ins-pipeline-health',
      module: 'crm',
      headline: 'Pipeline health',
      value: `$${pipelineValue.toLocaleString()}`,
      delta: '',
      narrative: `${demoLeadsStore.length} leads in pipeline; ${demoCustomersStore.length} converted customers.`,
    },
    {
      id: 'ins-workforce',
      module: 'hr',
      headline: 'Active workforce',
      value: String(headcount),
      delta: '',
      narrative: `Monthly payroll commitment computed live from active roster.`,
    },
  ];
}

router.get('/intelligence/recommendations/orders', (_req: Request, res: Response) => {
  const recommendations = computeOrderRecommendations();
  res.json({ success: true, recommendations, count: recommendations.length, engine: 'local-deterministic' });
});
router.get('/intelligence/anomalies', (_req: Request, res: Response) => {
  const data = computeAnomalies();
  res.json({ success: true, data, count: data.length, engine: 'local-deterministic' });
});
router.get('/intelligence/insights', (_req: Request, res: Response) => {
  const data = computeInsights();
  res.json({ success: true, data, count: data.length, engine: 'local-deterministic' });
});

// Public module probe endpoint for CRM 71-module explorer.
// This validates route contract state without requiring auth tokens.
router.get('/modules/probe', (req: Request, res: Response) => {
  const path = String(req.query.path || '');
  if (!path) {
    return res.status(400).json({ success: false, error: 'path query param is required' });
  }
  return res.json({
    success: true,
    data: buildProbeData(path)
  });
});

router.post('/modules/probe', (req: Request, res: Response) => {
  const path = String(req.body?.path || '');
  if (!path) {
    return res.status(400).json({ success: false, error: 'path is required' });
  }
  return res.json({
    success: true,
    data: buildProbeData(path)
  });
});

// Stub catalog — placeholder demo data for the previously-stub modules so the
// 71-module explorer can render a coherent preview for every module.
// Public (no auth) to match the rest of /modules/* probe endpoints.
router.use('/modules', stubCatalogRouter);

router.get('/modules/contracts', (_req: Request, res: Response) => {
  const generated = Array.from(CONTRACT_READY_SEGMENTS)
    .filter((segment) => !CORE_MODULE_CONTRACTS[segment])
    .map((segment) => buildDefaultContract(segment, `/api/${segment}`));

  return res.json({
    success: true,
    data: [...Object.values(CORE_MODULE_CONTRACTS), ...generated],
    total: Object.keys(CORE_MODULE_CONTRACTS).length + generated.length
  });
});

router.get('/modules/contracts/:segment', (req: Request, res: Response) => {
  const segment = String(req.params.segment || '').trim();
  const contract = CORE_MODULE_CONTRACTS[segment] || (CONTRACT_READY_SEGMENTS.has(segment) ? buildDefaultContract(segment, `/api/${segment}`) : null);
  if (!contract) {
    return res.status(404).json({ success: false, error: `Contract not found for segment '${segment}'` });
  }
  return res.json({ success: true, data: contract });
});

router.post('/modules/contracts/validate', (req: Request, res: Response) => {
  const segment = String(req.body?.segment || '').trim();
  const payload = req.body?.payload;

  if (!segment) {
    return res.status(400).json({ success: false, error: 'segment is required' });
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return res.status(400).json({ success: false, error: 'payload object is required' });
  }

  const contract = CORE_MODULE_CONTRACTS[segment] || (CONTRACT_READY_SEGMENTS.has(segment) ? buildDefaultContract(segment, `/api/${segment}`) : null);
  if (!contract) {
    return res.status(404).json({ success: false, error: `Contract not found for segment '${segment}'` });
  }

  const requiredFields: string[] = contract.requiredCreateFields || [];
  const fieldTypes: Record<string, string> = contract.fieldTypes || {};

  const missingFields = requiredFields.filter((field) => {
    const value = (payload as Record<string, unknown>)[field];
    return value === undefined || value === null || value === '';
  });

  const typeErrors = Object.entries(fieldTypes)
    .filter(([field]) => (payload as Record<string, unknown>)[field] !== undefined)
    .map(([field, expectedType]) => {
      const value = (payload as Record<string, unknown>)[field];
      if (expectedType === 'array') {
        return Array.isArray(value)
          ? null
          : { field, expectedType, actualType: Array.isArray(value) ? 'array' : typeof value };
      }
      return typeof value === expectedType
        ? null
        : { field, expectedType, actualType: Array.isArray(value) ? 'array' : typeof value };
    })
    .filter(Boolean);

  const valid = missingFields.length === 0 && typeErrors.length === 0;

  return res.json({
    success: true,
    data: {
      segment,
      valid,
      missingFields,
      typeErrors,
      contractVersion: contract.version || 'v1',
      validatedAt: new Date().toISOString()
    }
  });
});

const createPlaceholderRouter = (moduleName: string) => {
  const moduleRouter = Router();
  moduleRouter.all('*', (_req: Request, res: Response) => {
    res.status(501).json({
      module: moduleName,
      status: 'not_implemented',
      message: `${moduleName} module will be available soon`
    });
  });
  return moduleRouter;
};

// Core localisation module
// Languages endpoint is public (no auth required) - add before protected routes
router.get('/localisation/languages', getLanguagesHandler);
router.get('/localization/languages', getLanguagesHandler); // Alias for American spelling
// Translations endpoint is public (no auth required)
router.get('/localisation/translations/:locale', getTranslationsHandler);
router.get('/localization/translations/:locale', getTranslationsHandler); // Alias
// Language preference handler function
const languagePreferenceHandler = async (req: Request, res: Response) => {
  try {
    const { languageCode, countryCode } = req.body;
    
    if (!languageCode) {
      return res.status(400).json({
        success: false,
        error: 'Language code is required'
      });
    }

    // Support all 38 languages from the frontend
    const validLanguages = [
      'en', 'ar', 'fr', 'es', 'de', 'zh', 'ur', 'hi', 'pt', 'ru', 'it', 'tr',
      'he', 'ja', 'ko', 'nl', 'pl', 'vi', 'th', 'id', 'ms', 'sw', 'uk', 'ro',
      'cs', 'sv', 'da', 'fi', 'no', 'el', 'hu', 'bg', 'hr', 'sk', 'sr', 'bn',
      'fa', 'ps'
    ];
    if (!validLanguages.includes(languageCode)) {
      return res.status(400).json({
        success: false,
        error: `Invalid language code: ${languageCode}`
      });
    }

    // In a real implementation, this would store in database
    // For now, we'll just validate and return success
    return res.json({
      success: true,
      message: 'Language preference saved',
      data: {
        languageCode,
        countryCode: countryCode || null,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error saving language preference:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save language preference'
    });
  }
};

// Language preference endpoint is public (no auth required) - language switching should work for everyone
router.post('/localisation/language-preference', languagePreferenceHandler);

// Country Rule Engine Endpoints
router.get('/localisation/rules/:countryCode', getCountryProfile);
router.get('/localisation/workflow/:countryCode', getWorkflowConfig);

router.post('/localization/language-preference', languagePreferenceHandler); // Alias for American spelling

// --- HARVICS ALPHA INTELLIGENCE ENDPOINT ---
router.get('/intelligence/attack-plan', async (req: Request, res: Response) => {
  try {
    const targets = ['US', 'PK', 'AE', 'GB', 'CN'];
    const plan = await HarvicsAlphaEngine.generateDailyAttackPlan(targets);
    res.json({
      timestamp: new Date().toISOString(),
      status: 'active',
      plan
    });
  } catch (error) {
    console.error('Alpha Engine Error:', error);
    // Return mock plan so dashboard doesn't break when AI engine is offline
    res.json({
      timestamp: new Date().toISOString(),
      status: 'active',
      plan: [
        { territory: 'US', sku: 'HVCS-SNACK-001', strategy: 'PREMIUM_PUSH', targetPrice: 4.99, margin: '28%', alert: 'Strong demand signal', passport: { origin: 'PK', farmerId: 'F-001', fairTradeStatus: 'Certified', ethicalScore: 92 } },
        { territory: 'AE', sku: 'HVCS-BVRG-012', strategy: 'AGGRESSIVE_ARBITRAGE', targetPrice: 12.50, margin: '34%', alert: 'INFLATION_RISK: Monitor', passport: { origin: 'AE', farmerId: 'F-002', fairTradeStatus: 'Certified', ethicalScore: 88 } },
        { territory: 'PK', sku: 'HVCS-FMCG-007', strategy: 'VOLUME_PLAY', targetPrice: 1.25, margin: '18%', alert: 'High volume opportunity', passport: { origin: 'PK', farmerId: 'F-003', fairTradeStatus: 'Pending', ethicalScore: 79 } },
        { territory: 'GB', sku: 'HVCS-HLTH-003', strategy: 'PREMIUM_PUSH', targetPrice: 8.99, margin: '31%', alert: 'Competitor out of stock', passport: { origin: 'UK', farmerId: 'F-004', fairTradeStatus: 'Certified', ethicalScore: 95 } },
        { territory: 'CN', sku: 'HVCS-COMD-021', strategy: 'MARKET_ENTRY', targetPrice: 6.75, margin: '22%', alert: 'New market entry vector', passport: { origin: 'CN', farmerId: 'F-005', fairTradeStatus: 'In Review', ethicalScore: 81 } },
      ]
    });
  }
});


const computeGrade = (score: number): string => {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  return 'D';
};

const toSlug = (name: string): string =>
  name.trim().toLowerCase().replace(/\s+/g, '-');

const countriesSummaryHandler = async (_req: Request, res: Response) => {
  try {
    const profiles = listCountryProfiles();
    const data = await Promise.all(profiles.map(async (profile) => {
      const payload = await buildLocalisationPayload(profile);
      const score = payload.marketScore;
      const grade = computeGrade(score);
      return {
        code: toSlug(profile.name),
        isoCode: profile.code,
        name: profile.name,
        score,
        grade,
        priceBand: payload.priceBand,
        lastAnalyzed: null
      };
    }));
    return res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('Error building countries summary:', error);
    return res.status(500).json({ success: false, error: 'Failed to build countries summary' });
  }
};

// Public countries summary endpoints (MUST be before protected routes)
router.get('/localisation/countries/summary', countriesSummaryHandler);
router.get('/localization/countries/summary', countriesSummaryHandler);

// Protected localisation routes (require auth) - but countries/summary is already public
// Countries, Regions, Cities routes (from countries.controller)
import countriesRouter from './modules/localisation/countries.controller';
// Mount countries routes before protected routes (public endpoints)
router.use('/localisation', countriesRouter);
router.use('/localization', countriesRouter); // Alias

// Protected localisation routes (require auth)
router.use('/localisation', requireAuthScope, localisationRouter);
// Alias to support both British and American spelling in frontend API paths
router.use('/localization', requireAuthScope, localisationRouter);
router.use('/gps', requireAuthScope, gpsRouter);
router.use('/satellite', requireAuthScope, satelliteRouter);
router.use('/trade', requireAuthScope, tradeRouter);
router.use('/procurement', requireAuthScope, procurementRouter);
router.use('/graph', requireAuthScope, graphRouter);
// AI Image Generator (public - no auth for image generation)
router.use('/ai-images', imageGeneratorRouter);
// Protected AI routes
router.use('/ai', requireAuthScope, enforceAIProtocol, requireAIEngine, aiRouter);
router.use('/data-ocean', requireAuthScope, dataOceanRouter);
router.use('/system', systemRouter);
router.use('/auth', authRouter);
router.use('/bff', requireAuthScope, bffRouter);
router.use('/domains', requireAuthScope, domainsRouter);
router.use('/products', productsRouter);
// Navigation routes (public - no auth required for menu data)
router.use('/navigation', navigationRouter);
// Territory/Geographic hierarchy routes (public - no auth required for geographic data)
router.use('/territory', territoryRouter);

// ── DOMAIN CRUD ROUTES (PROTECTED - AUTH + NEURAL GOVERNANCE) ──────────────────
router.use('/orders',           requireAuthScope, neuralGovernance, ordersCrudRouter);
router.use('/inventory',        requireAuthScope, neuralGovernance, inventoryCrudRouter);
router.use('/finance',          requireAuthScope, neuralGovernance, financeCrudRouter);
// /api/payments/* — alias so existing frontend api-payments.ts clients don't 404
router.use('/payments',         requireAuthScope, neuralGovernance, financeCrudRouter);
router.use('/crm',              requireAuthScope, neuralGovernance, crmCrudRouter);
// Production v2 routes — 15 new Prisma-backed tables (manufacturing, quality, projects, treasury, marketing, documents, comms, audit, assets)
router.use('/v2',               productionRouter);
router.use('/hr',               requireAuthScope, neuralGovernance, hrCrudRouter);
router.use('/logistics',        requireAuthScope, neuralGovernance, logisticsCrudRouter);
router.use('/procurement-crud', requireAuthScope, neuralGovernance, procurementCrudRouter);
router.use('/manufacturing',    requireAuthScope, neuralGovernance, manufacturingCrudRouter);
router.use('/quality',          requireAuthScope, neuralGovernance, qualityCrudRouter);
router.use('/projects',         requireAuthScope, neuralGovernance, projectManagementCrudRouter);
router.use('/bi',               requireAuthScope, neuralGovernance, biCrudRouter);
router.use('/treasury',         requireAuthScope, neuralGovernance, treasuryCrudRouter);
router.use('/digital-finance',  requireAuthScope, neuralGovernance, digitalFinanceCrudRouter);
router.use('/marketing',        requireAuthScope, neuralGovernance, marketingCrudRouter);
router.use('/shipping-trade',   requireAuthScope, neuralGovernance, shippingTradeCrudRouter);

// ── GENERIC MODULE FACTORY (Session 39 · Wave 0+1) ──────────────────────────
// Auto-mounts CRUD for every demo/live module in the registry that does NOT
// already have a bespoke controller. Backed by `GenericModuleRecord` table.
// Mounted LAST so all bespoke routes above take precedence.
const _generic = buildGenericRouter();
router.use('/', _generic.router);
// eslint-disable-next-line no-console
console.log(`[generic-factory] mounted ${_generic.mounted} canonical + ${_generic.uniformMounted} at /api/m/:id, skipped ${_generic.reserved} reserved`);
// Fire-and-forget seed — safe to ignore failures; routes will just return empty arrays.
void seedAllModules().then(({ seeded, skipped }) => {
  // eslint-disable-next-line no-console
  console.log(`[generic-factory] seeded ${seeded} module bucket(s), skipped ${skipped}`);
});

// ── AI INTELLIGENCE ROUTES (PROTECTED - AUTH REQUIRED) ───────────────
router.use('/intelligence', requireAuthScope, intelligenceRouter);

// ── EXPOSED SERVICES (PROTECTED - AUTH REQUIRED) ─────────────────────
router.use('/services', requireAuthScope, servicesRouter);

// ── ADMIN: AUDIT LOG (company + hq only — enforced inside router) ─────
router.use('/audit-log', auditLogRouter);

// ── DOMAIN 17: COMMUNICATION LAYER ──────────────────────────────────────────
router.use('/comms', commsRouter);

// ── DOMAIN EVENT → NOTIFICATION WIRING ──────────────────────────────────────
// These fire automatically when any domain emits an event via the eventBus.
// No polling. No manual triggering.

eventBus.on('procurement.po.created', (data: any) => {
  const amount = data?.totalAmount ?? data?.amount ?? 0;
  if (amount >= 10000) {
    notificationService.requestApproval({
      requesterId: data?.createdBy ?? 'system',
      requesterRole: data?.createdByRole ?? 'sales_officer',
      entityType: 'PurchaseOrder',
      entityId: data?.id ?? data?.poId ?? 'unknown',
      entitySummary: `PO ${data?.poNumber ?? data?.id} — $${Number(amount).toLocaleString()} — ${data?.vendorName ?? 'Vendor'}`,
      amount,
      priority: amount >= 100000 ? 'critical' : 'high',
    });
  }
});

eventBus.on('inventory.low-stock', (data: any) => {
  notificationService.systemAlert({
    toRole: 'country_manager',
    category: 'inventory_alert',
    priority: 'high',
    title: 'Low Stock Alert',
    body: `SKU ${data?.sku ?? 'unknown'} is below reorder point. Current stock: ${data?.qty ?? 0} ${data?.uom ?? 'units'}.`,
    actionUrl: '/os/inventory',
    relatedEntityId: data?.sku,
    relatedEntityType: 'InventoryItem',
  });
});

eventBus.on('finance.payment.received', (data: any) => {
  notificationService.systemAlert({
    toRole: 'hq',
    category: 'finance_alert',
    priority: 'normal',
    title: 'Payment Received',
    body: `Payment of $${Number(data?.amount ?? 0).toLocaleString()} received from ${data?.customer ?? 'customer'}.`,
    actionUrl: '/os/finance',
    relatedEntityId: data?.invoiceId,
    relatedEntityType: 'Invoice',
  });
});

eventBus.on('ai.anomaly.detected', (data: any) => {
  notificationService.systemAlert({
    toRole: 'hq',
    category: 'ai_insight',
    priority: 'critical',
    title: 'AI Anomaly Detected',
    body: data?.message ?? 'The Intelligence System has detected an anomaly requiring review.',
    actionUrl: '/os/intelligence',
    relatedEntityType: 'AIInsight',
  });
});

// ── ERP TIER-1 EVENT WIRES (auto-fire from new module flows) ────────────────
eventBus.on('hr.employee.hired', (data: any) => {
  notificationService.systemAlert({
    toRole: 'hq',
    category: 'hr_alert',
    priority: 'normal',
    title: 'New employee hired',
    body: `${data?.name ?? 'New employee'} joined as ${data?.role ?? 'staff'} (${data?.department ?? 'General'}).`,
    actionUrl: '/admin/portal/manager/crm',
    relatedEntityId: data?.id,
    relatedEntityType: 'Employee',
  });
});

eventBus.on('crm.lead.won', (data: any) => {
  notificationService.systemAlert({
    toRole: 'sales_officer',
    category: 'crm_alert',
    priority: 'high',
    title: 'Deal won',
    body: `${data?.company ?? 'Lead'} closed for $${Number(data?.value ?? 0).toLocaleString()}. Auto-converted to customer.`,
    actionUrl: '/admin/portal/manager/crm',
    relatedEntityId: data?.id,
    relatedEntityType: 'Lead',
  });
});

eventBus.on('mfg.workorder.completed', (data: any) => {
  notificationService.systemAlert({
    toRole: 'country_manager',
    category: 'inventory_alert',
    priority: 'normal',
    title: 'Production batch completed',
    body: `Work order ${data?.id} produced ${data?.qty ?? 0} units of ${data?.sku ?? 'SKU'}. Inventory updated.`,
    actionUrl: '/admin/portal/manager/crm',
    relatedEntityId: data?.id,
    relatedEntityType: 'WorkOrder',
  });
});

eventBus.on('shipment.delivered', (data: any) => {
  notificationService.systemAlert({
    toRole: 'sales_officer',
    category: 'logistics_alert',
    priority: 'normal',
    title: 'Shipment delivered',
    body: `Shipment ${data?.id} for order ${data?.orderId} delivered to ${data?.destination}.`,
    actionUrl: '/admin/portal/manager/crm',
    relatedEntityId: data?.id,
    relatedEntityType: 'Shipment',
  });
});

eventBus.on('finance.high-value-entry', (data: any) => {
  // Any single ledger entry > $50k routes for HQ approval
  notificationService.requestApproval({
    requesterId: data?.postedBy ?? 'system',
    requesterRole: data?.postedByRole ?? 'sales_officer',
    entityType: 'LedgerEntry',
    entityId: data?.id ?? 'unknown',
    entitySummary: `${data?.account}: D${data?.debit ?? 0} / C${data?.credit ?? 0} — ${data?.memo ?? ''}`,
    amount: Math.max(Number(data?.debit ?? 0), Number(data?.credit ?? 0)),
    priority: 'high',
  });
});

// ── BATCH 2: COMMERCIAL RING (10 modules) ───────────────────────────────────

import { BATCH_2_EMPTY } from './batch2-commercial';

const batch2 = BATCH_2_EMPTY;

// Pricing module
router.get('/modules/demo/batch2/pricing', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch2.pricing, total: batch2.pricing.length });
});

// Sales Ops module
router.get('/modules/demo/batch2/sales-ops', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch2.salesOps, total: batch2.salesOps.length });
});

// Customer Service module
router.get('/modules/demo/batch2/customer-service', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch2.customerService, total: batch2.customerService.length });
});

// Marketing module
router.get('/modules/demo/batch2/marketing', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch2.marketing, total: batch2.marketing.length });
});

// Contracts module
router.get('/modules/demo/batch2/contracts', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch2.contracts, total: batch2.contracts.length });
});

// Competitor Analysis module
router.get('/modules/demo/batch2/competitors', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch2.competitors, total: batch2.competitors.length });
});

// Territory Management module
router.get('/modules/demo/batch2/territories', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch2.territories, total: batch2.territories.length });
});

// Commission Tracking module — Prisma-backed (T14)
router.get('/modules/demo/batch2/commissions', async (_req: Request, res: Response) => {
  const rows = await t14.listCommissions();
  return res.json({ success: true, data: rows, total: rows.length });
});

// Deal Desk module — Prisma-backed (T14)
router.get('/modules/demo/batch2/deal-desk', async (_req: Request, res: Response) => {
  const rows = await t14.listDeals();
  return res.json({ success: true, data: rows, total: rows.length });
});

router.post('/modules/demo/batch2/deal-desk/:id/approve', async (req: Request, res: Response) => {
  try {
    const approvedDiscount = typeof req.body?.approvedDiscount === 'number' ? req.body.approvedDiscount : undefined;
    const deal = await t14.approveDeal(req.params.id, approvedDiscount);
    return res.json({ success: true, data: deal });
  } catch {
    return res.status(404).json({ success: false, error: 'Deal not found' });
  }
});

// Sales Forecasting module — Prisma-backed (T14)
router.get('/modules/demo/batch2/forecasts', async (_req: Request, res: Response) => {
  const rows = await t14.listForecasts();
  return res.json({ success: true, data: rows, total: rows.length });
});

// ── BATCH 4: FINANCE + PEOPLE RING (10 modules) ────────────────────────────
import { BATCH_4_EMPTY } from './batch4-finance-people';

const batch4 = BATCH_4_EMPTY;

router.get('/modules/demo/batch4/payroll', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch4.payroll, total: batch4.payroll.length });
});

router.post('/modules/demo/batch4/payroll/:id/approve', (req: Request, res: Response) => {
  const rec = batch4.payroll.find(r => r.id === req.params.id);
  if (!rec) return res.status(404).json({ success: false, error: 'Payroll not found' });
  rec.status = 'Approved';
  return res.json({ success: true, data: rec });
});

router.get('/modules/demo/batch4/ar', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch4.ar, total: batch4.ar.length });
});

router.get('/modules/demo/batch4/ap', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch4.ap, total: batch4.ap.length });
});

router.get('/modules/demo/batch4/treasury', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch4.treasury, total: batch4.treasury.length });
});

router.get('/modules/demo/batch4/financial-plan', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch4.financialPlan, total: batch4.financialPlan.length });
});

router.get('/modules/demo/batch4/recruitment', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch4.recruitment, total: batch4.recruitment.length });
});

router.get('/modules/demo/batch4/performance', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch4.performance, total: batch4.performance.length });
});

router.get('/modules/demo/batch4/learning', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch4.learning, total: batch4.learning.length });
});

router.get('/modules/demo/batch4/workforce-plan', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch4.workforcePlan, total: batch4.workforcePlan.length });
});

router.get('/modules/demo/batch4/talent-acquisition', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch4.talentAcquisition, total: batch4.talentAcquisition.length });
});

// ── BATCH 5: OPS + ASSET + GRC RING (10 modules) ─────────────────────────
import { BATCH_5_EMPTY } from './batch5-ops-grc';

const batch5 = BATCH_5_EMPTY;

router.get('/modules/demo/batch5/projects', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch5.projects, total: batch5.projects.length });
});

router.get('/modules/demo/batch5/maintenance', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch5.maintenance, total: batch5.maintenance.length });
});

router.get('/modules/demo/batch5/assets', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch5.assets, total: batch5.assets.length });
});

router.get('/modules/demo/batch5/grc', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch5.grc, total: batch5.grc.length });
});

router.get('/modules/demo/batch5/audit', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch5.audit, total: batch5.audit.length });
});

router.get('/modules/demo/batch5/compliance', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch5.compliance, total: batch5.compliance.length });
});

router.get('/modules/demo/batch5/risk', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch5.risk, total: batch5.risk.length });
});

router.get('/modules/demo/batch5/facilities', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch5.facilities, total: batch5.facilities.length });
});

router.get('/modules/demo/batch5/incidents', async (_req: Request, res: Response) => {
  const rows = await t14.listIncidents();
  return res.json({ success: true, data: rows, total: rows.length });
});

router.get('/modules/demo/batch5/audit-trail', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch5.auditTrail, total: batch5.auditTrail.length });
});

// ── BATCH 6 + 7: ANALYTICS + AI + PLATFORM + UNIVERSE + PORTALS (21 modules) ─
import { BATCH_67_SEED } from './batch67-analytics-universe';

const b67 = BATCH_67_SEED;

// ── Batch 6: Analytics + AI + Platform ──────────────────────────────────────
router.get('/modules/demo/batch6/bi-reports', (_req: Request, res: Response) => res.json({ success: true, data: b67.biReports, total: b67.biReports.length }));
router.get('/modules/demo/batch6/okr', async (_req: Request, res: Response) => { const rows = await t14.listOkr(); return res.json({ success: true, data: rows, total: rows.length }); });
router.get('/modules/demo/batch6/ai-insights', (_req: Request, res: Response) => res.json({ success: true, data: b67.aiInsights, total: b67.aiInsights.length }));
router.get('/modules/demo/batch6/tax', (_req: Request, res: Response) => res.json({ success: true, data: b67.taxRecords, total: b67.taxRecords.length }));
router.get('/modules/demo/batch6/fx', (_req: Request, res: Response) => res.json({ success: true, data: b67.fxRates, total: b67.fxRates.length }));
router.get('/modules/demo/batch6/documents', (_req: Request, res: Response) => res.json({ success: true, data: b67.documents, total: b67.documents.length }));
router.get('/modules/demo/batch6/integrations', (_req: Request, res: Response) => res.json({ success: true, data: b67.integrations, total: b67.integrations.length }));
router.get('/modules/demo/batch6/admin-users', (_req: Request, res: Response) => res.json({ success: true, data: b67.adminUsers, total: b67.adminUsers.length }));
router.get('/modules/demo/batch6/data-ocean', (_req: Request, res: Response) => res.json({ success: true, data: b67.dataOcean, total: b67.dataOcean.length }));
router.get('/modules/demo/batch6/board-packs', (_req: Request, res: Response) => res.json({ success: true, data: b67.boardPacks, total: b67.boardPacks.length }));

// ── Batch 7: Universe + Portals ──────────────────────────────────────────────
router.get('/modules/demo/batch7/funfeed', (_req: Request, res: Response) => res.json({ success: true, data: b67.funFeed, total: b67.funFeed.length }));
router.get('/modules/demo/batch7/mall', (_req: Request, res: Response) => res.json({ success: true, data: b67.mallListings, total: b67.mallListings.length }));
router.get('/modules/demo/batch7/trade-floor', (_req: Request, res: Response) => res.json({ success: true, data: b67.tradeFloor, total: b67.tradeFloor.length }));
router.get('/modules/demo/batch7/crypto', (_req: Request, res: Response) => res.json({ success: true, data: b67.crypto, total: b67.crypto.length }));
router.get('/modules/demo/batch7/harvicoins', (_req: Request, res: Response) => res.json({ success: true, data: b67.harvicoins, total: b67.harvicoins.length }));
router.get('/modules/demo/batch7/hpay', (_req: Request, res: Response) => res.json({ success: true, data: b67.hpay, total: b67.hpay.length }));
router.get('/modules/demo/batch7/referrals', (_req: Request, res: Response) => res.json({ success: true, data: b67.referrals, total: b67.referrals.length }));
router.get('/modules/demo/batch7/jobs', (_req: Request, res: Response) => res.json({ success: true, data: b67.jobs, total: b67.jobs.length }));
router.get('/modules/demo/batch7/experts', (_req: Request, res: Response) => res.json({ success: true, data: b67.experts, total: b67.experts.length }));
router.get('/modules/demo/batch7/portals', (_req: Request, res: Response) => res.json({ success: true, data: b67.portalActivity, total: b67.portalActivity.length }));
router.get('/modules/demo/batch7/playroom', (_req: Request, res: Response) => res.json({ success: true, data: b67.playroom, total: b67.playroom.length }));

// ── BATCH 3: SUPPLY RING (10 modules) ──────────────────────────────────────
type SupplyStatus = 'Active' | 'At Risk' | 'Pending' | 'Completed';

const batch3 = {
  warehouse: [
    { id: 'whm-001', warehouse: 'Dubai-W1', utilizationPct: 72, capacityUnits: 50000, occupiedUnits: 36000, status: 'Active' as SupplyStatus },
    { id: 'whm-002', warehouse: 'Islamabad-W1', utilizationPct: 64, capacityUnits: 30000, occupiedUnits: 19200, status: 'Active' as SupplyStatus },
  ],
  quality: [
    { id: 'qc-001', sku: 'FMCG-001', lot: 'LOT-2401', passRatePct: 97, defects: 3, inspections: 100, status: 'Completed' as SupplyStatus },
    { id: 'qc-002', sku: 'FMCG-004', lot: 'LOT-2402', passRatePct: 91, defects: 9, inspections: 100, status: 'At Risk' as SupplyStatus },
  ],
  compliance: [
    { id: 'cmp-001', rule: 'Halal Certificate', owner: 'Operations', dueDate: '2026-08-01', status: 'Active' as SupplyStatus },
    { id: 'cmp-002', rule: 'Import Permit Renewal', owner: 'Legal', dueDate: '2026-06-15', status: 'Pending' as SupplyStatus },
  ],
  vendors: [
    { id: 'ven-001', name: 'Mega Foods Supply', region: 'PK', score: 87, onTimePct: 93, qualityPct: 95, status: 'Active' as SupplyStatus },
    { id: 'ven-002', name: 'Desert Logistics', region: 'AE', score: 74, onTimePct: 82, qualityPct: 88, status: 'At Risk' as SupplyStatus },
  ],
  purchasePlans: [
    { id: 'pp-001', period: 'Q3-2026', sku: 'FMCG-001', plannedQty: 12000, approvedQty: 10000, status: 'Pending' as SupplyStatus },
    { id: 'pp-002', period: 'Q3-2026', sku: 'FMCG-003', plannedQty: 8000, approvedQty: 8000, status: 'Completed' as SupplyStatus },
  ],
  replenishment: [
    { id: 'rep-001', sku: 'FMCG-004', reorderPoint: 300, currentAvail: 280, suggestedQty: 1200, status: 'Pending' as SupplyStatus },
    { id: 'rep-002', sku: 'FMCG-002', reorderPoint: 500, currentAvail: 750, suggestedQty: 0, status: 'Completed' as SupplyStatus },
  ],
  receiving: [
    { id: 'grn-001', poId: 'po-0001', receivedQty: 500, expectedQty: 500, warehouse: 'Dubai-W1', status: 'Completed' as SupplyStatus },
    { id: 'grn-002', poId: 'po-0002', receivedQty: 350, expectedQty: 500, warehouse: 'Islamabad-W1', status: 'At Risk' as SupplyStatus },
  ],
  returns: [
    { id: 'ret-001', orderId: 'demo-001', reason: 'Damaged packaging', qty: 8, resolution: 'Replace', status: 'Pending' as SupplyStatus },
    { id: 'ret-002', orderId: 'demo-002', reason: 'Wrong SKU', qty: 4, resolution: 'Refund', status: 'Completed' as SupplyStatus },
  ],
  supplierScorecards: [
    { id: 'score-001', vendorId: 'ven-001', period: '2026-Q2', costScore: 82, qualityScore: 91, deliveryScore: 93, overall: 89, status: 'Completed' as SupplyStatus },
    { id: 'score-002', vendorId: 'ven-002', period: '2026-Q2', costScore: 78, qualityScore: 86, deliveryScore: 79, overall: 81, status: 'Completed' as SupplyStatus },
  ],
  tradeDocs: [
    { id: 'doc-001', shipmentId: 'ship-0001', docType: 'Bill of Lading', verified: true, status: 'Completed' as SupplyStatus },
    { id: 'doc-002', shipmentId: 'ship-0002', docType: 'Certificate of Origin', verified: false, status: 'Pending' as SupplyStatus },
  ],
};

router.get('/modules/demo/batch3/warehouse', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch3.warehouse, total: batch3.warehouse.length });
});
router.get('/modules/demo/batch3/quality', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch3.quality, total: batch3.quality.length });
});
router.get('/modules/demo/batch3/compliance', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch3.compliance, total: batch3.compliance.length });
});
router.get('/modules/demo/batch3/vendors', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch3.vendors, total: batch3.vendors.length });
});
router.get('/modules/demo/batch3/purchase-plans', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch3.purchasePlans, total: batch3.purchasePlans.length });
});
router.get('/modules/demo/batch3/replenishment', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch3.replenishment, total: batch3.replenishment.length });
});
router.get('/modules/demo/batch3/receiving', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch3.receiving, total: batch3.receiving.length });
});
router.get('/modules/demo/batch3/returns', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch3.returns, total: batch3.returns.length });
});
router.post('/modules/demo/batch3/returns/:id/close', (req: Request, res: Response) => {
  const record = batch3.returns.find(r => r.id === req.params.id);
  if (!record) return res.status(404).json({ success: false, error: 'Return not found' });
  record.status = 'Completed';
  return res.json({ success: true, data: record });
});
router.get('/modules/demo/batch3/supplier-scorecards', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch3.supplierScorecards, total: batch3.supplierScorecards.length });
});
router.get('/modules/demo/batch3/trade-docs', (_req: Request, res: Response) => {
  return res.json({ success: true, data: batch3.tradeDocs, total: batch3.tradeDocs.length });
});

export default router;
