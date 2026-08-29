/**
 * BFF live aggregates — company dashboard from module APIs (no fake KPIs).
 */

import { customersDb, invoicesDb, ordersDb, employeesDb } from '../../core/db';
import { prisma } from '../../core/prisma';

export async function buildCompanyDashboardLive() {
  const [orders, customers, invoices, employees, leadsCount, incidents] = await Promise.all([
    ordersDb.list({}, 1, 500),
    customersDb.list({}, 1, 500),
    invoicesDb.list({ type: 'AR' }, 1, 500),
    employeesDb.list({ status: 'Active' }, 1, 500),
    prisma.lead.count().catch(() => 0),
    prisma.incident
      ? prisma.incident.findMany({ take: 200 }).catch(() => [])
      : Promise.resolve([]),
  ]);

  const orderRows = orders.data || [];
  const customerRows = customers.data || [];
  const invoiceRows = invoices.data || [];
  const totalRevenue = invoiceRows.reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
  const totalOrders = orders.total || orderRows.length;

  const countries = new Set(customerRows.map((c: any) => c.country).filter(Boolean));

  const byCountry: Record<string, number> = {};
  for (const c of customerRows) {
    const k = c.country || 'Other';
    byCountry[k] = (byCountry[k] || 0) + (Number(c.lifetimeValue) || 0);
  }
  const topMarkets = Object.entries(byCountry)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([country, revenue]) => ({ country, revenue, change: 0 }));

  const topDistributors = customerRows
    .slice(0, 5)
    .map((c: any) => ({
      name: c.name,
      country: c.country || '—',
      revenue: Number(c.lifetimeValue) || 0,
      onTimePercentage: null,
    }));

  const trendData = orderRows.slice(0, 14).map((o: any, i: number) => ({
    date: o.createdAt?.slice?.(0, 10) || `Day-${i + 1}`,
    revenue: Number(o.amount) || 0,
    orders: 1,
  }));

  const incidentRows = Array.isArray(incidents) ? incidents : [];
  const riskAlerts = incidentRows
    .filter((i: any) => i.status !== 'Closed' && i.status !== 'Resolved')
    .slice(0, 8)
    .map((i: any) => ({
      id: i.id,
      domain: 'GRC',
      title: i.title || i.summary || 'Incident',
      severity: i.severity === 'Critical' || i.severity === 'High' ? 'critical' : 'warning',
      date: i.createdAt || new Date().toISOString(),
    }));

  const overdue = invoiceRows.filter((i: any) => i.status === 'Overdue').length;

  return {
    kpis: {
      totalRevenue,
      totalOrders,
      activeDistributors: customerRows.filter((c: any) => (c.status || 'Active') === 'Active').length,
      activeCountries: countries.size,
    },
    trendData,
    aiInsights: overdue > 0
      ? [{
          id: 'ar-overdue',
          title: 'Overdue AR',
          description: `${overdue} invoice(s) overdue — review AR aging.`,
          category: 'Finance',
          priority: 'high' as const,
        }]
      : leadsCount > 0
        ? [{
            id: 'leads-pipeline',
            title: 'CRM pipeline',
            description: `${leadsCount} lead(s) in Smart CRM.`,
            category: 'CRM',
            priority: 'medium' as const,
          }]
        : [],
    topMarkets,
    topDistributors,
    riskAlerts,
    meta: {
      employees: employees.total || 0,
      source: 'live',
    },
  };
}
