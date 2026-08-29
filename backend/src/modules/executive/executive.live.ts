/**
 * Module #72 — Executive Intelligence live aggregates (no synthetic KPIs).
 */

import { prisma } from '../../core/prisma';
import { invoicesDb, ordersDb, customersDb } from '../../core/db';
import { liveFinanceOverview } from '../domains/domains.live';

export async function buildExecutiveDashboard() {
  const [
    fin,
    orders,
    customers,
    arInvoices,
    bankAccounts,
    leadsCount,
    projects,
    tickets,
    incidents,
    okrs,
    notifications,
    goals,
  ] = await Promise.all([
    liveFinanceOverview().catch(() => ({ revenue: 0, netProfit: 0, arBalance: 0, pendingPayments: 0 })),
    ordersDb.list({}, 1, 500).catch(() => ({ data: [], total: 0 })),
    customersDb.list({}, 1, 500).catch(() => ({ data: [], total: 0 })),
    invoicesDb.list({ type: 'AR' }, 1, 500).catch(() => ({ data: [], total: 0 })),
    prisma.bankAccount.findMany().catch(() => []),
    prisma.lead.count().catch(() => 0),
    prisma.project.findMany({ take: 200 }).catch(() => []),
    prisma.serviceTicket.findMany({ where: { status: { not: 'Closed' } }, take: 200 }).catch(() => []),
    prisma.incident.findMany({ where: { status: { notIn: ['Closed', 'Resolved'] } }, take: 50 }).catch(() => []),
    prisma.oKR.findMany({ take: 200 }).catch(() => []),
    prisma.notification.findMany({ where: { read: false }, take: 50 }).catch(() => []),
    prisma.executiveGoal.findMany({ where: { status: { not: 'cancelled' } }, take: 100 }).catch(() => []),
  ]);

  const orderRows = orders.data || [];
  const customerRows = customers.data || [];
  const arRows = arInvoices.data || [];
  const cash = bankAccounts.reduce((s, a) => s + (Number(a.balance) || 0), 0);
  const totalRevenue = Number(fin.revenue) || arRows.reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
  const netProfit = Number(fin.netProfit) || Number(fin.profit) || 0;
  const profitMargin = totalRevenue > 0 ? +((netProfit / totalRevenue) * 100).toFixed(1) : null;

  const arAging = { current: 0, d30: 0, d60: 0, d90: 0, d90plus: 0 };
  const now = Date.now();
  for (const inv of arRows) {
    const amt = Number(inv.amount) || 0;
    if (inv.status === 'Paid') continue;
    const due = inv.dueDate ? new Date(inv.dueDate).getTime() : now;
    const days = Math.floor((now - due) / 86400000);
    if (days <= 0) arAging.current += amt;
    else if (days <= 30) arAging.d30 += amt;
    else if (days <= 60) arAging.d60 += amt;
    else if (days <= 90) arAging.d90 += amt;
    else arAging.d90plus += amt;
  }

  const okrByStatus: Record<string, number> = {};
  for (const o of okrs) {
    const st = o.status || 'Open';
    okrByStatus[st] = (okrByStatus[st] || 0) + 1;
  }

  const goalProgress = (goals as any[]).map((g) => ({
    id: g.id,
    title: g.title,
    metric: g.metric,
    targetValue: g.targetValue,
    currentValue: g.currentValue,
    unit: g.unit,
    period: g.period,
    status: g.status,
    pct: g.targetValue > 0 ? Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)) : 0,
  }));

  const alerts = [
    ...incidents.map((i) => ({
      id: i.id,
      type: i.severity === 'Critical' || i.severity === 'High' ? 'error' : 'warning',
      domain: 'GRC',
      message: i.title,
      time: i.reportedDate?.toISOString?.()?.slice(0, 10) || '',
    })),
    ...notifications.slice(0, 5).map((n) => ({
      id: n.id,
      type: n.severity === 'critical' ? 'error' : 'info',
      domain: n.category || 'System',
      message: n.title,
      time: n.createdAt?.toISOString?.()?.slice(0, 10) || '',
    })),
  ];

  return {
    kpis: {
      totalRevenue,
      netProfit,
      profitMargin,
      cashOnHand: cash,
      arBalance: Number(fin.arBalance) || arAging.current + arAging.d30 + arAging.d60 + arAging.d90 + arAging.d90plus,
      totalOrders: orders.total || orderRows.length,
      activeCustomers: customerRows.filter((c: any) => (c.status || 'Active') === 'Active').length,
      openLeads: leadsCount,
      openProjects: projects.filter((p) => p.status !== 'Completed' && p.status !== 'Closed').length,
      openTickets: tickets.length,
      growthYoY: null,
      marketShare: null,
      roi: null,
      customerRetention: null,
      employeeSatisfaction: null,
    },
    arAging,
    apAging: { current: 0, d30: 0, d60: 0, d90: 0, d90plus: 0 },
    okrByStatus: Object.entries(okrByStatus).map(([name, value]) => ({ name, value })),
    orderTrend: orderRows.slice(0, 12).map((o: any, i: number) => ({
      name: o.createdAt?.slice?.(5, 10) || `O${i + 1}`,
      value: Number(o.amount) || 0,
    })),
    alerts,
    goals: goalProgress,
    narrative: `Live executive snapshot: ${orders.total || 0} orders, ${leadsCount} leads, ${(goals as any[]).length} executive goals, ${cash.toLocaleString()} cash.`,
    source: 'live',
    generatedAt: new Date().toISOString(),
  };
}
