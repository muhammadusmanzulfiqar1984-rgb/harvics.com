/**
 * Live domain overviews — Prisma-backed aggregates per module (no cross-module wiring).
 */

import { prisma } from '../../core/prisma';
import { customersDb, invoicesDb, ordersDb, inventoryDb } from '../../core/db';
import type {
  CountryCRMData,
  CountryExecutiveData,
  CountryFinanceData,
  CountryHRData,
  CountryInventoryData,
  CountryOrdersData,
} from './domains.data';

function monthBuckets(): string[] {
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
}

function emptyMonthly(): number[] {
  return monthBuckets().map(() => 0);
}

export async function liveOrdersOverview(): Promise<Partial<CountryOrdersData> & Record<string, any>> {
  const result = await ordersDb.list({}, 1, 200);
  const rows = result.data || [];
  const pending = rows.filter((o: any) => o.status === 'Pending').length;
  const completed = rows.filter((o: any) => o.status === 'Completed').length;
  const inTransit = rows.filter((o: any) => o.status === 'In Transit').length;
  const revenue = rows.reduce((s: number, o: any) => s + (Number(o.amount) || 0), 0);
  const byChannel: Record<string, { count: number; revenue: number }> = {};
  for (const o of rows) {
    const ch = o.channel || 'General';
    if (!byChannel[ch]) byChannel[ch] = { count: 0, revenue: 0 };
    byChannel[ch].count++;
    byChannel[ch].revenue += Number(o.amount) || 0;
  }
  return {
    total: result.total || rows.length,
    pending,
    completed,
    inTransit,
    cancelled: rows.filter((o: any) => o.status === 'Cancelled').length,
    revenue,
    revenueByMonth: emptyMonthly(),
    ordersByChannel: Object.entries(byChannel).map(([channel, v]) => ({
      channel,
      count: v.count,
      revenue: v.revenue,
    })),
    orders: rows.map((o: any) => ({
      id: o.id,
      customer: o.customerName || o.customer || '—',
      amount: Number(o.amount) || 0,
      status: o.status || 'Pending',
      date: o.createdAt || o.date || '',
      channel: o.channel || '—',
      country: o.city || o.country || '—',
    })),
  };
}

export async function liveCRMOverview(): Promise<Record<string, any>> {
  const customers = await customersDb.list({}, 1, 500);
  const rows = customers.data || [];
  let leads: any[] = [];
  try {
    leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  } catch {
    leads = [];
  }
  const byRegion: Record<string, { count: number; revenue: number }> = {};
  for (const c of rows) {
    const region = c.country || c.segment || 'Other';
    if (!byRegion[region]) byRegion[region] = { count: 0, revenue: 0 };
    byRegion[region].count++;
    byRegion[region].revenue += Number(c.lifetimeValue) || 0;
  }
  return {
    totalCustomers: customers.total || rows.length,
    activeCustomers: rows.filter((c: any) => (c.status || 'Active') === 'Active').length,
    newCustomers: rows.filter((c: any) => {
      const d = c.createdAt ? new Date(c.createdAt) : null;
      if (!d) return false;
      const days = (Date.now() - d.getTime()) / 86400000;
      return days <= 30;
    }).length,
    satisfaction: null,
    revenueByMonth: emptyMonthly(),
    customersByRegion: Object.entries(byRegion).map(([region, v]) => ({
      region,
      count: v.count,
      revenue: v.revenue,
    })),
    customers: rows.map((c: any) => ({
      id: c.id,
      name: c.name,
      type: c.segment || c.segmentText || 'Customer',
      country: c.country || '—',
      status: c.status || 'Active',
      lifetimeValue: Number(c.lifetimeValue) || 0,
      orders: 0,
      lastOrder: '—',
    })),
    leads: leads.map((l) => ({
      id: l.id,
      company: l.company,
      contact: l.contact || '—',
      estimatedValue: Number(l.value) || 0,
      stage: l.stage || 'Lead',
      probability: l.aiScore ?? null,
    })),
    complaints: [],
  };
}

export async function liveFinanceOverview(): Promise<Partial<CountryFinanceData> & Record<string, any>> {
  const inv = await invoicesDb.list({}, 1, 500);
  const rows = inv.data || [];
  const ar = rows.filter((i: any) => i.type === 'AR');
  const ap = rows.filter((i: any) => i.type === 'AP');
  const revenue = ar.reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
  const expenses = ap.reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
  const pendingPayments = ar.filter((i: any) => i.status !== 'Paid').reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
  const arBalance = pendingPayments;
  return {
    revenue,
    expenses,
    profit: revenue - expenses,
    netProfit: revenue - expenses,
    pendingPayments,
    arBalance,
    currency: 'USD',
    revenueByMonth: emptyMonthly(),
    expenseByMonth: emptyMonthly(),
    invoices: rows.map((i: any) => ({
      id: i.invoiceNo || i.id,
      customer: i.customerName || '—',
      amount: Number(i.amount) || 0,
      status: (i.status || 'Unpaid').toLowerCase(),
      dueDate: i.dueDate || '',
      currency: i.currency || 'USD',
    })),
  };
}

export async function liveInventoryOverview(): Promise<Partial<CountryInventoryData> & Record<string, any>> {
  try {
    let items: any[] = [];
    try {
      items = await prisma.inventoryItem.findMany({ take: 500, orderBy: { sku: 'asc' } });
    } catch {
      items = [];
    }
    if (!items.length) {
      const legacy = await inventoryDb.list({}, 1, 500);
      items = (legacy.data || []).map((i: any) => ({
        sku: i.sku,
        description: i.description || i.name,
        category: i.category,
        onHand: i.onHand,
        minStock: i.minStock || i.reorderPoint || 0,
        unitCost: i.unitCost || 0,
      }));
    }
    const totalValue = items.reduce((s, i) => s + (Number(i.onHand) || 0) * (Number(i.unitCost) || 0), 0);
    const lowStock = items.filter((i) => (i.onHand ?? 0) < (i.minStock ?? 0)).length;
    const byCat: Record<string, { value: number; skus: number }> = {};
    for (const i of items) {
      const cat = i.category || 'Other';
      if (!byCat[cat]) byCat[cat] = { value: 0, skus: 0 };
      byCat[cat].value += (Number(i.onHand) || 0) * (Number(i.unitCost) || 0);
      byCat[cat].skus++;
    }
    return {
      totalValue,
      lowStock,
      totalSkus: items.length,
      warehouseCount: 0,
      turnoverDays: null,
      valueByCategory: Object.entries(byCat).map(([category, v]) => ({
        category,
        value: v.value,
        skus: v.skus,
      })),
      stockTrend: emptyMonthly(),
      skus: items.map((i) => ({
        sku: i.sku,
        description: i.description || i.sku,
        category: i.category || '—',
        onHand: Number(i.onHand) || 0,
        minStock: Number(i.minStock) || 0,
        value: (Number(i.onHand) || 0) * (Number(i.unitCost) || 0),
        status: (i.onHand ?? 0) < (i.minStock ?? 0) ? 'Low' : 'OK',
      })),
    };
  } catch {
    return { totalValue: 0, lowStock: 0, totalSkus: 0, skus: [], valueByCategory: [], stockTrend: emptyMonthly() };
  }
}

export async function liveHROverview(): Promise<Partial<CountryHRData> & Record<string, any>> {
  try {
    const leave = await prisma.leaveRequest.findMany({ take: 200 });
    const employees = new Set(leave.map((l) => l.employeeId).filter(Boolean));
    return {
      totalEmployees: employees.size || leave.length,
      fieldForce: 0,
      salesOfficers: 0,
      attendanceRate: null,
    };
  } catch {
    return { totalEmployees: 0, fieldForce: 0, salesOfficers: 0, attendanceRate: null };
  }
}

export async function liveExecutiveOverview(): Promise<Partial<CountryExecutiveData> & Record<string, any>> {
  const { buildExecutiveDashboard } = await import('../executive/executive.live');
  const dash = await buildExecutiveDashboard();
  return {
    totalRevenue: dash.kpis.totalRevenue,
    netProfit: dash.kpis.netProfit,
    profitMargin: dash.kpis.profitMargin,
    growthYoY: dash.kpis.growthYoY,
    marketShare: dash.kpis.marketShare,
    roi: dash.kpis.roi,
    customerRetention: dash.kpis.customerRetention,
    employeeSatisfaction: dash.kpis.employeeSatisfaction,
    kpiTrend: [],
    alerts: dash.alerts,
    profit: dash.kpis.netProfit,
    growth: 0,
    narrative: dash.narrative,
  };
}
