/**
 * HARVICS OS — Database Seed Script
 * Migrates all in-memory mock data to SQLite via Prisma.
 * Run: npx tsx backend/src/core/seed.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding HARVICS OS database...\n');

  // Clear all existing data (in dependency order)
  console.log('🧹 Clearing existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.route.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.gPSRetailer.deleteMany();
  await prisma.satellite.deleteMany();
  await prisma.territoryAssignment.deleteMany();

  // ── ORDERS ──────────────────────────────────────────────────────
  console.log('📦 Seeding orders...');
  const ordersData = [
    { customer: 'Al Madina Trading', city: 'Dubai', channel: 'Direct', amount: 45000, currency: 'AED', status: 'Pending', items: [{ sku: 'FMCG-001', qty: 500 }] },
    { customer: 'Lahore Wholesale', city: 'Lahore', channel: 'Distributor', amount: 32000, currency: 'PKR', status: 'Completed', items: [{ sku: 'TEX-010', qty: 200 }] },
    { customer: 'London Retail Ltd', city: 'London', channel: 'E-commerce', amount: 18500, currency: 'GBP', status: 'In Transit', items: [{ sku: 'FMCG-025', qty: 1000 }] },
    { customer: 'Cairo Foods Co', city: 'Cairo', channel: 'Direct', amount: 27000, currency: 'EGP', status: 'Pending', items: [{ sku: 'FMCG-003', qty: 300 }] },
    { customer: 'Shanghai Import', city: 'Shanghai', channel: 'B2B', amount: 95000, currency: 'CNY', status: 'In Transit', items: [{ sku: 'COM-015', qty: 2000 }] },
    { customer: 'Riyadh Fresh Markets', city: 'Riyadh', channel: 'Wholesale', amount: 68000, currency: 'SAR', status: 'Completed', items: [{ sku: 'FMCG-001', qty: 800 }] },
    { customer: 'Istanbul Imports', city: 'Istanbul', channel: 'B2B', amount: 42000, currency: 'TRY', status: 'Pending', items: [{ sku: 'TEX-020', qty: 600 }] },
    { customer: 'Mumbai Distributors', city: 'Mumbai', channel: 'Distributor', amount: 156000, currency: 'INR', status: 'Completed', items: [{ sku: 'FMCG-012', qty: 2500 }] },
    { customer: 'Singapore Traders', city: 'Singapore', channel: 'Direct', amount: 38000, currency: 'SGD', status: 'In Transit', items: [{ sku: 'COM-008', qty: 400 }] },
    { customer: 'Nairobi Distributors', city: 'Nairobi', channel: 'Distributor', amount: 125000, currency: 'KES', status: 'Completed', items: [{ sku: 'FMCG-005', qty: 1200 }] },
    { customer: 'Tokyo Retail Group', city: 'Tokyo', channel: 'E-commerce', amount: 2800000, currency: 'JPY', status: 'Pending', items: [{ sku: 'TEX-015', qty: 3000 }] },
    { customer: 'Berlin Wholesale GmbH', city: 'Berlin', channel: 'Wholesale', amount: 52000, currency: 'EUR', status: 'In Transit', items: [{ sku: 'IND-007', qty: 450 }] },
    { customer: 'Sydney Importers', city: 'Sydney', channel: 'B2B', amount: 67000, currency: 'AUD', status: 'Completed', items: [{ sku: 'FMCG-018', qty: 900 }] },
    { customer: 'Mexico City Foods', city: 'Mexico City', channel: 'Direct', amount: 89000, currency: 'MXN', status: 'Pending', items: [{ sku: 'COM-022', qty: 650 }] },
    { customer: 'Paris Retail SA', city: 'Paris', channel: 'E-commerce', amount: 28000, currency: 'EUR', status: 'In Transit', items: [{ sku: 'FMCG-030', qty: 1100 }] },
  ];
  for (const o of ordersData) {
    await prisma.order.create({
      data: {
        customerName: o.customer, city: o.city, channel: o.channel,
        amount: o.amount, currency: o.currency, status: o.status,
        items: { create: o.items.map(i => ({ sku: i.sku, qty: i.qty, unitPrice: 0 })) },
      },
    });
  }
  console.log(`  ✅ ${ordersData.length} orders created`);

  // ── INVENTORY ───────────────────────────────────────────────────
  console.log('📋 Seeding inventory...');
  const inventoryData = [
    { sku: 'FMCG-001', description: 'Chicken Nuggets 500g', category: 'Frozen Foods', onHand: 12000, minStock: 5000, warehouse: 'DXB-W1', unitCost: 4.5 },
    { sku: 'FMCG-025', description: 'Organic Olive Oil 1L', category: 'Culinary', onHand: 3200, minStock: 2000, warehouse: 'LHR-W2', unitCost: 12.0 },
    { sku: 'TEX-010', description: 'Cotton T-Shirt Blank', category: 'Apparel', onHand: 8500, minStock: 3000, warehouse: 'KHI-W1', unitCost: 2.8 },
    { sku: 'COM-015', description: 'Arabica Coffee Beans 25kg', category: 'Commodities', onHand: 1500, minStock: 2000, warehouse: 'DXB-W3', unitCost: 85.0 },
    { sku: 'IND-003', description: 'Industrial Lubricant 20L', category: 'Industrial', onHand: 600, minStock: 500, warehouse: 'JED-W1', unitCost: 45.0 },
    { sku: 'FMCG-003', description: 'Premium Basmati Rice 5kg', category: 'Grains', onHand: 8900, minStock: 4000, warehouse: 'DXB-W1', unitCost: 8.2 },
    { sku: 'FMCG-005', description: 'Canned Tomatoes 400g', category: 'Pantry', onHand: 15000, minStock: 6000, warehouse: 'KHI-W1', unitCost: 1.5 },
    { sku: 'FMCG-012', description: 'Mineral Water 1.5L', category: 'Beverages', onHand: 22000, minStock: 10000, warehouse: 'DXB-W2', unitCost: 0.65 },
    { sku: 'FMCG-018', description: 'Dark Chocolate 100g', category: 'Confectionery', onHand: 4500, minStock: 2500, warehouse: 'LON-W1', unitCost: 2.8 },
    { sku: 'FMCG-030', description: 'Organic Honey 500g', category: 'Natural', onHand: 2800, minStock: 1500, warehouse: 'PAR-W1', unitCost: 9.5 },
    { sku: 'TEX-015', description: 'Denim Jeans - Blue', category: 'Apparel', onHand: 5600, minStock: 2000, warehouse: 'TOK-W1', unitCost: 18.5 },
    { sku: 'TEX-020', description: 'Cotton Bedsheet Set', category: 'Home Textiles', onHand: 3200, minStock: 1500, warehouse: 'IST-W1', unitCost: 15.0 },
    { sku: 'COM-008', description: 'Green Tea Leaves 1kg', category: 'Beverages', onHand: 6800, minStock: 3000, warehouse: 'SIN-W1', unitCost: 22.0 },
    { sku: 'COM-022', description: 'Vanilla Extract 250ml', category: 'Culinary', onHand: 1200, minStock: 800, warehouse: 'MEX-W1', unitCost: 28.5 },
    { sku: 'IND-007', description: 'Heavy Duty Gloves Box/100', category: 'Safety', onHand: 4200, minStock: 2000, warehouse: 'BER-W1', unitCost: 12.5 },
  ];
  for (const inv of inventoryData) {
    await prisma.inventoryItem.create({ data: inv });
  }
  console.log(`  ✅ ${inventoryData.length} inventory items created`);

  // ── CRM: CUSTOMERS ──────────────────────────────────────────────
  console.log('👥 Seeding customers...');
  const customersData = [
    { name: 'Al Madina Trading', segment: 'Wholesale', country: 'AE', city: 'Dubai', creditRating: 'A', lifetimeValue: 2400000, contactEmail: 'procurement@almadina.ae' },
    { name: 'Lahore Wholesale', segment: 'Distributor', country: 'PK', city: 'Lahore', creditRating: 'B', lifetimeValue: 850000, contactEmail: 'orders@lahorewholesale.pk' },
    { name: 'London Retail Ltd', segment: 'Retail', country: 'GB', city: 'London', creditRating: 'A', lifetimeValue: 1200000, contactEmail: 'buying@londonretail.co.uk' },
    { name: 'Cairo Foods Co', segment: 'Wholesale', country: 'EG', city: 'Cairo', creditRating: 'B', lifetimeValue: 560000, contactEmail: 'imports@cairofoods.eg' },
    { name: 'Riyadh Fresh Markets', segment: 'Retail', country: 'SA', city: 'Riyadh', creditRating: 'A', lifetimeValue: 1850000, contactEmail: 'buyer@riyadhfresh.sa' },
    { name: 'Istanbul Imports', segment: 'Distributor', country: 'TR', city: 'Istanbul', creditRating: 'B', lifetimeValue: 920000, contactEmail: 'mehmet@istanbulimports.tr' },
    { name: 'Mumbai Distributors', segment: 'Wholesale', country: 'IN', city: 'Mumbai', creditRating: 'A', lifetimeValue: 3200000, contactEmail: 'ops@mumbaidist.in' },
    { name: 'Singapore Traders', segment: 'B2B', country: 'SG', city: 'Singapore', creditRating: 'A+', lifetimeValue: 4100000, contactEmail: 'trading@sgtraders.sg' },
    { name: 'Nairobi Distributors', segment: 'Distributor', country: 'KE', city: 'Nairobi', creditRating: 'C', lifetimeValue: 480000, contactEmail: 'jane@nairobidist.ke' },
    { name: 'Tokyo Retail Group', segment: 'Retail', country: 'JP', city: 'Tokyo', creditRating: 'A', lifetimeValue: 2700000, contactEmail: 'buyer@tokyoretail.jp' },
  ];
  for (const c of customersData) {
    await prisma.customer.create({ data: c });
  }
  console.log(`  ✅ ${customersData.length} customers created`);

  // ── CRM: LEADS ──────────────────────────────────────────────────
  console.log('🎯 Seeding leads...');
  const leadsData = [
    { company: 'Riyadh Fresh Markets', contact: 'Ahmed Al-Rashid', email: 'ahmed@riyadhfresh.sa', stage: 'Qualified', value: 150000, source: 'Trade Show' },
    { company: 'Nairobi Distributors', contact: 'Jane Mwangi', email: 'jane@nairobidist.ke', stage: 'Lead', value: 80000, source: 'Website' },
    { company: 'Istanbul Imports', contact: 'Mehmet Yilmaz', email: 'mehmet@istanbulimports.tr', stage: 'Proposal', value: 320000, source: 'Referral' },
  ];
  for (const l of leadsData) {
    await prisma.lead.create({ data: l });
  }
  console.log(`  ✅ ${leadsData.length} leads created`);

  // ── CRM: CAMPAIGNS ─────────────────────────────────────────────
  console.log('📢 Seeding campaigns...');
  const campaignsData = [
    { name: 'Ramadan FMCG Push', type: 'Seasonal', status: 'Active', budget: 50000, spent: 32000, leads: 145, conversions: 23, startDate: '2026-02-15', endDate: '2026-03-31' },
    { name: 'GCC Expansion Q1', type: 'Regional', status: 'Active', budget: 120000, spent: 45000, leads: 89, conversions: 12, startDate: '2026-01-01', endDate: '2026-03-31' },
  ];
  for (const c of campaignsData) {
    await prisma.campaign.create({ data: c });
  }
  console.log(`  ✅ ${campaignsData.length} campaigns created`);

  // ── HR: EMPLOYEES ───────────────────────────────────────────────
  console.log('👨‍💼 Seeding employees...');
  const employeesData = [
    { name: 'Fatima Al-Hashimi', department: 'Operations', position: 'Regional Manager', country: 'AE', city: 'Dubai', salary: 25000, currency: 'AED', status: 'Active', joinDate: '2020-03-15' },
    { name: 'Usman Zulfiqar', department: 'Technology', position: 'CTO', country: 'PK', city: 'Lahore', salary: 450000, currency: 'PKR', status: 'Active', joinDate: '2019-01-01' },
    { name: 'Sarah Johnson', department: 'Sales', position: 'Sales Director', country: 'GB', city: 'London', salary: 75000, currency: 'GBP', status: 'Active', joinDate: '2021-06-01' },
    { name: 'Mohammed Al-Farsi', department: 'Logistics', position: 'Fleet Manager', country: 'AE', city: 'Abu Dhabi', salary: 18000, currency: 'AED', status: 'Active', joinDate: '2022-01-10' },
    { name: 'Aisha Khan', department: 'Finance', position: 'CFO', country: 'PK', city: 'Karachi', salary: 500000, currency: 'PKR', status: 'Active', joinDate: '2019-06-01' },
    { name: 'Omar Hassan', department: 'Sales', position: 'Account Executive', country: 'EG', city: 'Cairo', salary: 45000, currency: 'EGP', status: 'Active', joinDate: '2022-09-01' },
    { name: 'Li Wei', department: 'Operations', position: 'Warehouse Manager', country: 'CN', city: 'Shanghai', salary: 120000, currency: 'CNY', status: 'Active', joinDate: '2021-02-15' },
    { name: 'Raj Patel', department: 'Technology', position: 'DevOps Engineer', country: 'IN', city: 'Mumbai', salary: 850000, currency: 'INR', status: 'Active', joinDate: '2023-01-10' },
    { name: 'Elena Rodriguez', department: 'HR', position: 'HR Manager', country: 'MX', city: 'Mexico City', salary: 280000, currency: 'MXN', status: 'Active', joinDate: '2020-11-01' },
    { name: 'Yuki Tanaka', department: 'Quality', position: 'QA Lead', country: 'JP', city: 'Tokyo', salary: 6500000, currency: 'JPY', status: 'Active', joinDate: '2021-04-20' },
    { name: 'Ahmed Ibrahim', department: 'Procurement', position: 'Sourcing Manager', country: 'SA', city: 'Riyadh', salary: 22000, currency: 'SAR', status: 'Active', joinDate: '2022-03-01' },
    { name: 'Sophie Martin', department: 'Marketing', position: 'Marketing Manager', country: 'FR', city: 'Paris', salary: 52000, currency: 'EUR', status: 'Active', joinDate: '2021-08-15' },
  ];
  for (const e of employeesData) {
    await prisma.employee.create({ data: e });
  }
  console.log(`  ✅ ${employeesData.length} employees created`);

  // ── HR: PAYROLL ─────────────────────────────────────────────────
  console.log('💰 Seeding payroll...');
  const payrollData = [
    { period: '2026-02', totalAmount: 850000, currency: 'AED', employeeCount: 12, status: 'Processed', processedDate: '2026-03-01' },
    { period: '2026-03', totalAmount: 850000, currency: 'AED', employeeCount: 12, status: 'Pending', processedDate: null },
  ];
  for (const p of payrollData) {
    await prisma.payroll.create({ data: p });
  }
  console.log(`  ✅ ${payrollData.length} payroll records created`);

  // ── FINANCE: INVOICES ───────────────────────────────────────────
  console.log('🧾 Seeding invoices...');
  const invoicesData = [
    { invoiceNo: 'INV-2026-001', customerName: 'Al Madina Trading', amount: 45000, currency: 'AED', status: 'Unpaid', dueDate: '2026-04-01', type: 'AR' },
    { invoiceNo: 'INV-2026-002', customerName: 'Lahore Wholesale', amount: 32000, currency: 'PKR', status: 'Paid', dueDate: '2026-03-15', type: 'AR' },
    { invoiceNo: 'INV-2026-003', customerName: 'London Retail Ltd', amount: 18500, currency: 'GBP', status: 'Overdue', dueDate: '2026-02-28', type: 'AR' },
  ];
  for (const inv of invoicesData) {
    await prisma.invoice.create({ data: inv });
  }
  console.log(`  ✅ ${invoicesData.length} invoices created`);

  // ── FINANCE: PAYMENTS ───────────────────────────────────────────
  console.log('💳 Seeding payments...');
  await prisma.payment.create({
    data: { invoiceNo: 'INV-2026-002', amount: 32000, currency: 'PKR', method: 'Bank Transfer', reference: 'TXN-9823', receivedDate: '2026-03-10' },
  });
  console.log('  ✅ 1 payment created');

  // ── FINANCE: JOURNAL ENTRIES ────────────────────────────────────
  console.log('📝 Seeding journal entries...');
  const journalData = [
    { entryNo: 'JE-2026-001', description: 'Monthly payroll — March 2026', debit: 'Salaries Expense', credit: 'Cash', amount: 850000, currency: 'AED', postedDate: '2026-03-01' },
    { entryNo: 'JE-2026-002', description: 'Office rent — Q1 2026', debit: 'Rent Expense', credit: 'Accounts Payable', amount: 120000, currency: 'AED', postedDate: '2026-01-01' },
  ];
  for (const j of journalData) {
    await prisma.journalEntry.create({ data: j });
  }
  console.log(`  ✅ ${journalData.length} journal entries created`);

  // ── LOGISTICS: ROUTES ───────────────────────────────────────────
  console.log('🚚 Seeding routes...');
  const routesData = [
    { routeId: 'RT-DXB-001', origin: 'Dubai Warehouse', destination: 'Al Ain', driver: 'Rashid', vehicle: 'TRK-045', status: 'In Transit', eta: '2026-03-05T14:00:00Z', distance: 160.0 },
    { routeId: 'RT-LHR-002', origin: 'Lahore Hub', destination: 'Islamabad', driver: 'Imran', vehicle: 'TRK-022', status: 'Completed', eta: '2026-03-04T10:00:00Z', distance: 375.0 },
    { routeId: 'RT-LON-003', origin: 'London DC', destination: 'Manchester', driver: 'James', vehicle: 'VAN-011', status: 'Pending', eta: '2026-03-06T08:00:00Z', distance: 330.0 },
    { routeId: 'RT-CAI-004', origin: 'Cairo Hub', destination: 'Alexandria', driver: 'Mohamed', vehicle: 'TRK-033', status: 'In Transit', eta: '2026-03-05T16:00:00Z', distance: 220.0 },
    { routeId: 'RT-SHA-005', origin: 'Shanghai Port', destination: 'Hangzhou', driver: 'Li', vehicle: 'TRK-018', status: 'Completed', eta: '2026-03-04T12:00:00Z', distance: 180.0 },
    { routeId: 'RT-RYD-006', origin: 'Riyadh Hub', destination: 'Jeddah', driver: 'Abdullah', vehicle: 'TRK-029', status: 'In Transit', eta: '2026-03-06T10:00:00Z', distance: 950.0 },
    { routeId: 'RT-MUM-007', origin: 'Mumbai DC', destination: 'Pune', driver: 'Raj', vehicle: 'TRK-014', status: 'Completed', eta: '2026-03-04T14:00:00Z', distance: 150.0 },
    { routeId: 'RT-IST-008', origin: 'Istanbul Warehouse', destination: 'Ankara', driver: 'Mehmet', vehicle: 'VAN-007', status: 'Pending', eta: '2026-03-07T09:00:00Z', distance: 450.0 },
  ];
  for (const r of routesData) {
    await prisma.route.create({ data: r });
  }
  console.log(`  ✅ ${routesData.length} routes created`);

  // ── PROCUREMENT ─────────────────────────────────────────────────
  console.log('📑 Seeding purchase orders...');
  await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2026-001', supplier: 'Vietnam Textiles Co', total: 11000, currency: 'USD', status: 'Approved', expectedDate: '2026-04-15',
      items: { create: [{ sku: 'TEX-010', qty: 5000, unitPrice: 2.2 }] },
    },
  });
  await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2026-002', supplier: 'Brazil Coffee Exports', total: 39000, currency: 'USD', status: 'Pending', expectedDate: '2026-04-30',
      items: { create: [{ sku: 'COM-015', qty: 500, unitPrice: 78.0 }] },
    },
  });
  console.log('  ✅ 2 purchase orders created');

  // ── APPROVALS ───────────────────────────────────────────────────
  console.log('✅ Seeding approvals...');
  await prisma.approval.create({
    data: { type: 'purchase_order', referenceId: 'PO-2026-002', description: 'Brazil Coffee — 500 bags', amount: 39000, currency: 'USD', requestedBy: 'procurement', tier: 'country', status: 'Pending', requiredRole: 'country_manager' },
  });
  console.log('  ✅ 1 approval created');

  // ── GPS RETAILERS ───────────────────────────────────────────────
  console.log('📍 Seeding GPS retailers...');
  const gpsData = [
    { outletName: 'FreshCart Hypermarket', city: 'Dubai', outletType: 'modern_trade', lat: 25.2048, lng: 55.2708, countryCode: 'AE', monthlySales: 950000 },
    { outletName: 'Lulu Express', city: 'Abu Dhabi', outletType: 'modern_trade', lat: 24.4539, lng: 54.3773, countryCode: 'AE', monthlySales: 510000 },
    { outletName: 'Carrefour Market', city: 'Riyadh', outletType: 'modern_trade', lat: 24.7136, lng: 46.6753, countryCode: 'SA', monthlySales: 600000 },
    { outletName: 'Imtiaz Super Karachi', city: 'Karachi', outletType: 'cash_and_carry', lat: 24.8934, lng: 67.0281, countryCode: 'PK', monthlySales: 240000 },
    { outletName: 'Metro Lahore GT', city: 'Lahore', outletType: 'modern_trade', lat: 31.5204, lng: 74.3587, countryCode: 'PK', monthlySales: 210000 },
    { outletName: 'Shoprite Checkers', city: 'Cape Town', outletType: 'hypermarket', lat: -33.9249, lng: 18.4241, countryCode: 'ZA', monthlySales: 320000 },
    { outletName: 'Sedano Wholesale', city: 'Miami', outletType: 'cash_and_carry', lat: 25.7617, lng: -80.1918, countryCode: 'US', monthlySales: 380000 },
    { outletName: 'Reliance Smart', city: 'Mumbai', outletType: 'modern_trade', lat: 19.076, lng: 72.8777, countryCode: 'IN', monthlySales: 410000 },
  ];
  for (const g of gpsData) {
    await prisma.gPSRetailer.create({ data: g });
  }
  console.log(`  ✅ ${gpsData.length} GPS retailers created`);

  // ── SATELLITE ───────────────────────────────────────────────────
  console.log('🛰️ Seeding satellite data...');
  const satelliteData = [
    { region: 'GCC', type: 'whitespace', opportunity: 'FMCG distribution gap in Oman interior', coverageScore: 34, detectedAt: '2026-03-01T10:00:00Z' },
    { region: 'South Asia', type: 'whitespace', opportunity: 'Tier-2 city coverage void in Punjab', coverageScore: 28, detectedAt: '2026-03-02T08:00:00Z' },
    { region: 'East Africa', type: 'expansion', opportunity: 'Growing retail demand in Nairobi suburbs', coverageScore: 45, detectedAt: '2026-03-03T12:00:00Z' },
  ];
  for (const s of satelliteData) {
    await prisma.satellite.create({ data: s });
  }
  console.log(`  ✅ ${satelliteData.length} satellite records created`);

  // ── TERRITORY ASSIGNMENTS ───────────────────────────────────────
  console.log('🗺️ Seeding territory assignments...');
  const territoryData = [
    { territoryCode: 'GCC-AE', assignedTo: 'Rashid Al-Maktoum', region: 'West Asia', status: 'Active', retailers: 12, coverage: 85 },
    { territoryCode: 'SA-PK', assignedTo: 'Imran Khan', region: 'South Asia', status: 'Active', retailers: 8, coverage: 62 },
    { territoryCode: 'EU-GB', assignedTo: 'James Wilson', region: 'Western Europe', status: 'Active', retailers: 6, coverage: 78 },
    { territoryCode: 'AF-KE', assignedTo: 'David Ochieng', region: 'East Africa', status: 'Active', retailers: 4, coverage: 41 },
  ];
  for (const t of territoryData) {
    await prisma.territoryAssignment.create({ data: t });
  }
  console.log(`  ✅ ${territoryData.length} territory assignments created`);

  // ── SUMMARY ─────────────────────────────────────────────────────
  const counts = {
    orders: await prisma.order.count(),
    inventory: await prisma.inventoryItem.count(),
    customers: await prisma.customer.count(),
    leads: await prisma.lead.count(),
    campaigns: await prisma.campaign.count(),
    employees: await prisma.employee.count(),
    payroll: await prisma.payroll.count(),
    invoices: await prisma.invoice.count(),
    payments: await prisma.payment.count(),
    journals: await prisma.journalEntry.count(),
    routes: await prisma.route.count(),
    purchaseOrders: await prisma.purchaseOrder.count(),
    approvals: await prisma.approval.count(),
    gpsRetailers: await prisma.gPSRetailer.count(),
    satellite: await prisma.satellite.count(),
    territories: await prisma.territoryAssignment.count(),
  };
  console.log('\n🎉 Seeding complete!');
  console.log('Record counts:', counts);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log(`Total records: ${total}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
