/**
 * HARVICS OS — In-Memory Data Store
 * 
 * Unified CRUD store for all domains. Each domain gets its own collection.
 * Ready for PostgreSQL swap — just replace the store methods with DB queries.
 * 
 * Every mutation emits a domain event via the event bus.
 */

import { eventBus, DomainEvent } from './eventBus';

// Simple UUID generator (no dependency)
const genId = () => {
  const s = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 12; i++) id += s[Math.floor(Math.random() * s.length)];
  return id;
};

export interface StoreRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

class DomainStore<T extends StoreRecord = StoreRecord> {
  private items: Map<string, T> = new Map();
  private domainName: string;

  constructor(domainName: string, seed: Partial<T>[] = []) {
    this.domainName = domainName;
    seed.forEach(item => {
      const record = {
        id: genId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...item
      } as T;
      this.items.set(record.id, record);
    });
  }

  list(filters?: Record<string, any>, page = 1, limit = 50): { data: T[]; total: number; page: number; pages: number } {
    let arr = Array.from(this.items.values());
    if (filters) {
      arr = arr.filter(item => {
        return Object.entries(filters).every(([key, val]) => {
          if (val === undefined || val === null || val === '') return true;
          return String(item[key]).toLowerCase().includes(String(val).toLowerCase());
        });
      });
    }
    const total = arr.length;
    const pages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return { data: arr.slice(start, start + limit), total, page, pages };
  }

  get(id: string): T | undefined {
    return this.items.get(id);
  }

  create(data: Partial<T>, event?: DomainEvent): T {
    const record = {
      id: genId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    } as T;
    this.items.set(record.id, record);
    if (event) eventBus.emitDomain(event, record, this.domainName);
    return record;
  }

  update(id: string, data: Partial<T>, event?: DomainEvent): T | null {
    const existing = this.items.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() } as T;
    this.items.set(id, updated);
    if (event) eventBus.emitDomain(event, updated, this.domainName);
    return updated;
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }

  count(): number {
    return this.items.size;
  }

  clear(): void {
    this.items.clear();
  }
}

// ── DOMAIN STORES (seeded with demo data) ──────────────────────────

export const ordersStore = new DomainStore('orders', [
  { customer: 'Al Madina Trading', city: 'Dubai', channel: 'Direct', amount: 45000, currency: 'AED', status: 'Pending', items: [{ sku: 'FMCG-001', qty: 500 }] },
  { customer: 'Lahore Wholesale', city: 'Lahore', channel: 'Distributor', amount: 32000, currency: 'PKR', status: 'Completed', items: [{ sku: 'TEX-010', qty: 200 }] },
  { customer: 'London Retail Ltd', city: 'London', channel: 'E-commerce', amount: 18500, currency: 'GBP', status: 'In Transit', items: [{ sku: 'FMCG-025', qty: 1000 }] },
  { customer: 'Cairo Foods Co', city: 'Cairo', channel: 'Direct', amount: 27000, currency: 'EGP', status: 'Pending', items: [{ sku: 'FMCG-003', qty: 300 }] },
  { customer: 'Shanghai Import', city: 'Shanghai', channel: 'B2B', amount: 95000, currency: 'CNY', status: 'In Transit', items: [{ sku: 'COM-015', qty: 2000 }] },
]);

export const inventoryStore = new DomainStore('inventory', [
  { sku: 'FMCG-001', description: 'Chicken Nuggets 500g', category: 'Frozen Foods', onHand: 12000, minStock: 5000, warehouse: 'DXB-W1', unitCost: 4.5 },
  { sku: 'FMCG-025', description: 'Organic Olive Oil 1L', category: 'Culinary', onHand: 3200, minStock: 2000, warehouse: 'LHR-W2', unitCost: 12.0 },
  { sku: 'TEX-010', description: 'Cotton T-Shirt Blank', category: 'Apparel', onHand: 8500, minStock: 3000, warehouse: 'KHI-W1', unitCost: 2.8 },
  { sku: 'COM-015', description: 'Arabica Coffee Beans 25kg', category: 'Commodities', onHand: 1500, minStock: 2000, warehouse: 'DXB-W3', unitCost: 85.0 },
  { sku: 'IND-003', description: 'Industrial Lubricant 20L', category: 'Industrial', onHand: 600, minStock: 500, warehouse: 'JED-W1', unitCost: 45.0 },
]);

export const customersStore = new DomainStore('crm', [
  { name: 'Al Madina Trading', segment: 'Wholesale', country: 'AE', city: 'Dubai', creditRating: 'A', lifetimeValue: 2400000, contactEmail: 'procurement@almadina.ae' },
  { name: 'Lahore Wholesale', segment: 'Distributor', country: 'PK', city: 'Lahore', creditRating: 'B', lifetimeValue: 850000, contactEmail: 'orders@lahorewholesale.pk' },
  { name: 'London Retail Ltd', segment: 'Retail', country: 'GB', city: 'London', creditRating: 'A', lifetimeValue: 1200000, contactEmail: 'buying@londonretail.co.uk' },
  { name: 'Cairo Foods Co', segment: 'Wholesale', country: 'EG', city: 'Cairo', creditRating: 'B', lifetimeValue: 560000, contactEmail: 'imports@cairofoods.eg' },
]);

export const leadsStore = new DomainStore('crm-leads', [
  { company: 'Riyadh Fresh Markets', contact: 'Ahmed Al-Rashid', email: 'ahmed@riyadhfresh.sa', stage: 'Qualified', value: 150000, source: 'Trade Show' },
  { company: 'Nairobi Distributors', contact: 'Jane Mwangi', email: 'jane@nairobidist.ke', stage: 'Lead', value: 80000, source: 'Website' },
  { company: 'Istanbul Imports', contact: 'Mehmet Yilmaz', email: 'mehmet@istanbulimports.tr', stage: 'Proposal', value: 320000, source: 'Referral' },
]);

export const campaignsStore = new DomainStore('crm-campaigns', [
  { name: 'Ramadan FMCG Push', type: 'Seasonal', status: 'Active', budget: 50000, spent: 32000, leads: 145, conversions: 23, startDate: '2026-02-15', endDate: '2026-03-31' },
  { name: 'GCC Expansion Q1', type: 'Regional', status: 'Active', budget: 120000, spent: 45000, leads: 89, conversions: 12, startDate: '2026-01-01', endDate: '2026-03-31' },
]);

export const employeesStore = new DomainStore('hr', [
  { name: 'Fatima Al-Hashimi', department: 'Operations', position: 'Regional Manager', country: 'AE', city: 'Dubai', salary: 25000, currency: 'AED', status: 'Active', joinDate: '2020-03-15' },
  { name: 'Usman Zulfiqar', department: 'Technology', position: 'CTO', country: 'PK', city: 'Lahore', salary: 450000, currency: 'PKR', status: 'Active', joinDate: '2019-01-01' },
  { name: 'Sarah Johnson', department: 'Sales', position: 'Sales Director', country: 'GB', city: 'London', salary: 75000, currency: 'GBP', status: 'Active', joinDate: '2021-06-01' },
  { name: 'Mohammed Al-Farsi', department: 'Logistics', position: 'Fleet Manager', country: 'AE', city: 'Abu Dhabi', salary: 18000, currency: 'AED', status: 'Active', joinDate: '2022-01-10' },
  { name: 'Aisha Khan', department: 'Finance', position: 'CFO', country: 'PK', city: 'Karachi', salary: 500000, currency: 'PKR', status: 'Active', joinDate: '2019-06-01' },
]);

export const invoicesStore = new DomainStore('finance', [
  { invoiceNo: 'INV-2026-001', customerId: '', customer: 'Al Madina Trading', amount: 45000, currency: 'AED', status: 'Unpaid', dueDate: '2026-04-01', type: 'AR' },
  { invoiceNo: 'INV-2026-002', customerId: '', customer: 'Lahore Wholesale', amount: 32000, currency: 'PKR', status: 'Paid', dueDate: '2026-03-15', type: 'AR' },
  { invoiceNo: 'INV-2026-003', customerId: '', customer: 'London Retail Ltd', amount: 18500, currency: 'GBP', status: 'Overdue', dueDate: '2026-02-28', type: 'AR' },
]);

export const paymentsStore = new DomainStore('finance-payments', [
  { invoiceNo: 'INV-2026-002', amount: 32000, currency: 'PKR', method: 'Bank Transfer', reference: 'TXN-9823', receivedDate: '2026-03-10' },
]);

export const journalStore = new DomainStore('finance-journal', [
  { entryNo: 'JE-2026-001', description: 'Monthly payroll — March 2026', debit: 'Salaries Expense', credit: 'Cash', amount: 850000, currency: 'AED', postedDate: '2026-03-01' },
  { entryNo: 'JE-2026-002', description: 'Office rent — Q1 2026', debit: 'Rent Expense', credit: 'Accounts Payable', amount: 120000, currency: 'AED', postedDate: '2026-01-01' },
]);

export const routesStore = new DomainStore('logistics', [
  { routeId: 'RT-DXB-001', origin: 'Dubai Warehouse', destination: 'Al Ain', driver: 'Rashid', vehicle: 'TRK-045', status: 'In Transit', eta: '2026-03-05T14:00:00Z', distance: 160 },
  { routeId: 'RT-LHR-002', origin: 'Lahore Hub', destination: 'Islamabad', driver: 'Imran', vehicle: 'TRK-022', status: 'Completed', eta: '2026-03-04T10:00:00Z', distance: 375 },
  { routeId: 'RT-LON-003', origin: 'London DC', destination: 'Manchester', driver: 'James', vehicle: 'VAN-011', status: 'Pending', eta: '2026-03-06T08:00:00Z', distance: 330 },
]);

export const purchaseOrdersStore = new DomainStore('procurement', [
  { poNumber: 'PO-2026-001', supplier: 'Vietnam Textiles Co', items: [{ sku: 'TEX-010', qty: 5000, unitPrice: 2.2 }], total: 11000, currency: 'USD', status: 'Approved', expectedDate: '2026-04-15' },
  { poNumber: 'PO-2026-002', supplier: 'Brazil Coffee Exports', items: [{ sku: 'COM-015', qty: 500, unitPrice: 78 }], total: 39000, currency: 'USD', status: 'Pending', expectedDate: '2026-04-30' },
]);

export const approvalsStore = new DomainStore('approvals', [
  { type: 'purchase_order', referenceId: 'PO-2026-002', description: 'Brazil Coffee — 500 bags', amount: 39000, currency: 'USD', requestedBy: 'procurement', tier: 'country', status: 'Pending', requiredRole: 'country_manager' },
]);

export {
  DomainStore,
  genId,
};
