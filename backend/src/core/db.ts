/**
 * HARVICS OS — Prisma-backed Database Access Layer
 * 
 * Replaces the in-memory DomainStore with real SQLite persistence via Prisma.
 * Same external API shape so controllers need minimal changes.
 */

import { prisma } from './prisma';
import { eventBus, DomainEvent } from './eventBus';

// Generic paginated list helper
function paginate<T>(data: T[], page: number, limit: number) {
  const total = data.length;
  const pages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  return { data: data.slice(start, start + limit), total, page, pages };
}

// ── ORDERS ──────────────────────────────────────────────────────────

export const ordersDb = {
  async list(filters: Record<string, any> = {}, page = 1, limit = 50) {
    const where: any = {};
    if (filters.status) where.status = { contains: filters.status };
    if (filters.customer) where.customer = { contains: filters.customer };
    if (filters.city) where.city = { contains: filters.city };

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  },

  async get(id: string) {
    return prisma.order.findUnique({ where: { id }, include: { items: true } });
  },

  async create(data: any, event?: DomainEvent) {
    const { items, ...orderData } = data;
    const order = await prisma.order.create({
      data: {
        ...orderData,
        items: items ? { create: items.map((i: any) => ({ sku: i.sku, qty: i.qty, unitPrice: i.unitPrice || 0 })) } : undefined,
      },
      include: { items: true },
    });
    if (event) eventBus.emitDomain(event, order, 'orders');
    return order;
  },

  async update(id: string, data: any, event?: DomainEvent) {
    try {
      const { items, ...rest } = data;
      const order = await prisma.order.update({ where: { id }, data: rest, include: { items: true } });
      if (event) eventBus.emitDomain(event, order, 'orders');
      return order;
    } catch { return null; }
  },

  async delete(id: string) {
    try {
      await prisma.order.delete({ where: { id } });
      return true;
    } catch { return false; }
  },

  async count() {
    return prisma.order.count();
  },
};

// ── INVENTORY ───────────────────────────────────────────────────────

export const inventoryDb = {
  async list(filters: Record<string, any> = {}, page = 1, limit = 50) {
    const where: any = {};
    if (filters.category) where.category = { contains: filters.category };
    if (filters.warehouse) where.warehouse = { contains: filters.warehouse };
    if (filters.sku) where.sku = { contains: filters.sku };

    const [data, total] = await Promise.all([
      prisma.inventoryItem.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.inventoryItem.count({ where }),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  },

  async get(id: string) {
    return prisma.inventoryItem.findUnique({ where: { id } });
  },

  async create(data: any) {
    return prisma.inventoryItem.create({ data });
  },

  async update(id: string, data: any, event?: DomainEvent) {
    try {
      const item = await prisma.inventoryItem.update({ where: { id }, data });
      if (event) eventBus.emitDomain(event, item, 'inventory');
      return item;
    } catch { return null; }
  },

  async delete(id: string) {
    try {
      await prisma.inventoryItem.delete({ where: { id } });
      return true;
    } catch { return false; }
  },

  async count() {
    return prisma.inventoryItem.count();
  },
};

// ── CRM ─────────────────────────────────────────────────────────────

export const customersDb = {
  async list(filters: Record<string, any> = {}, page = 1, limit = 50) {
    const where: any = {};
    if (filters.segment) where.segment = { contains: filters.segment };
    if (filters.country) where.country = { contains: filters.country };
    if (filters.city) where.city = { contains: filters.city };

    const [data, total] = await Promise.all([
      prisma.customer.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.customer.count({ where }),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  },

  async get(id: string) {
    return prisma.customer.findUnique({ where: { id } });
  },

  async create(data: any, event?: DomainEvent) {
    const customer = await prisma.customer.create({ data });
    if (event) eventBus.emitDomain(event, customer, 'crm');
    return customer;
  },

  async update(id: string, data: any) {
    try { return await prisma.customer.update({ where: { id }, data }); }
    catch { return null; }
  },

  async delete(id: string) {
    try { await prisma.customer.delete({ where: { id } }); return true; }
    catch { return false; }
  },

  async count() { return prisma.customer.count(); },
};

export const leadsDb = {
  async list(filters: Record<string, any> = {}, page = 1, limit = 50) {
    const where: any = {};
    if (filters.stage) where.stage = { contains: filters.stage };
    if (filters.source) where.source = { contains: filters.source };

    const [data, total] = await Promise.all([
      prisma.lead.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.lead.count({ where }),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  },

  async get(id: string) { return prisma.lead.findUnique({ where: { id } }); },

  async create(data: any, event?: DomainEvent) {
    const lead = await prisma.lead.create({ data });
    if (event) eventBus.emitDomain(event, lead, 'crm');
    return lead;
  },

  async update(id: string, data: any) {
    try { return await prisma.lead.update({ where: { id }, data }); }
    catch { return null; }
  },

  async delete(id: string) {
    try { await prisma.lead.delete({ where: { id } }); return true; }
    catch { return false; }
  },

  async count() { return prisma.lead.count(); },
};

export const campaignsDb = {
  async list(filters: Record<string, any> = {}, page = 1, limit = 50) {
    const where: any = {};
    if (filters.status) where.status = { contains: filters.status };
    if (filters.type) where.type = { contains: filters.type };

    const [data, total] = await Promise.all([
      prisma.campaign.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.campaign.count({ where }),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  },

  async create(data: any, event?: DomainEvent) {
    const campaign = await prisma.campaign.create({ data });
    if (event) eventBus.emitDomain(event, campaign, 'crm');
    return campaign;
  },

  async update(id: string, data: any) {
    try { return await prisma.campaign.update({ where: { id }, data }); }
    catch { return null; }
  },

  async delete(id: string) {
    try { await prisma.campaign.delete({ where: { id } }); return true; }
    catch { return false; }
  },

  async count() { return prisma.campaign.count(); },
};

// ── HR ──────────────────────────────────────────────────────────────

export const employeesDb = {
  async list(filters: Record<string, any> = {}, page = 1, limit = 50) {
    const where: any = {};
    if (filters.department) where.department = { contains: filters.department };
    if (filters.country) where.country = { contains: filters.country };
    if (filters.status) where.status = { contains: filters.status };

    const [data, total] = await Promise.all([
      prisma.employee.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.employee.count({ where }),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  },

  async get(id: string) { return prisma.employee.findUnique({ where: { id } }); },

  async create(data: any, event?: DomainEvent) {
    const emp = await prisma.employee.create({ data });
    if (event) eventBus.emitDomain(event, emp, 'hr');
    return emp;
  },

  async update(id: string, data: any) {
    try { return await prisma.employee.update({ where: { id }, data }); }
    catch { return null; }
  },

  async delete(id: string) {
    try { await prisma.employee.delete({ where: { id } }); return true; }
    catch { return false; }
  },

  async count() { return prisma.employee.count(); },
};

export const payrollDb = {
  async list(_filters: Record<string, any> = {}, page = 1, limit = 50) {
    const [data, total] = await Promise.all([
      prisma.payroll.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.payroll.count(),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  },

  async create(data: any, event?: DomainEvent) {
    const run = await prisma.payroll.create({ data });
    if (event) eventBus.emitDomain(event, run, 'hr');
    return run;
  },

  async count() { return prisma.payroll.count(); },
};

// ── FINANCE ─────────────────────────────────────────────────────────

export const invoicesDb = {
  async list(filters: Record<string, any> = {}, page = 1, limit = 50) {
    const where: any = {};
    if (filters.status) where.status = { contains: filters.status };
    if (filters.type) where.type = { contains: filters.type };
    if (filters.customer) where.customer = { contains: filters.customer };
    if (filters.invoiceNo) where.invoiceNo = { contains: filters.invoiceNo };

    const [data, total] = await Promise.all([
      prisma.invoice.findMany({ where, include: { payments: true }, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.invoice.count({ where }),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  },

  async get(id: string) { return prisma.invoice.findUnique({ where: { id }, include: { payments: true } }); },

  async create(data: any, event?: DomainEvent) {
    const inv = await prisma.invoice.create({ data });
    if (event) eventBus.emitDomain(event, inv, 'finance');
    return inv;
  },

  async update(id: string, data: any) {
    try { return await prisma.invoice.update({ where: { id }, data }); }
    catch { return null; }
  },

  async delete(id: string) {
    try { await prisma.invoice.delete({ where: { id } }); return true; }
    catch { return false; }
  },

  async count() { return prisma.invoice.count(); },
};

export const paymentsDb = {
  async list(_filters: Record<string, any> = {}, page = 1, limit = 50) {
    const [data, total] = await Promise.all([
      prisma.payment.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.payment.count(),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  },

  async create(data: any, event?: DomainEvent) {
    const payment = await prisma.payment.create({ data });
    if (event) eventBus.emitDomain(event, payment, 'finance');
    return payment;
  },

  async count() { return prisma.payment.count(); },
};

export const journalDb = {
  async list(_filters: Record<string, any> = {}, page = 1, limit = 50) {
    const [data, total] = await Promise.all([
      prisma.journalEntry.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.journalEntry.count(),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  },

  async create(data: any, event?: DomainEvent) {
    const entry = await prisma.journalEntry.create({ data });
    if (event) eventBus.emitDomain(event, entry, 'finance');
    return entry;
  },

  async count() { return prisma.journalEntry.count(); },
};

// ── LOGISTICS ───────────────────────────────────────────────────────

export const routesDb = {
  async list(filters: Record<string, any> = {}, page = 1, limit = 50) {
    const where: any = {};
    if (filters.status) where.status = { contains: filters.status };
    if (filters.driver) where.driver = { contains: filters.driver };

    const [data, total] = await Promise.all([
      prisma.route.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.route.count({ where }),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  },

  async get(id: string) { return prisma.route.findUnique({ where: { id } }); },

  async create(data: any, event?: DomainEvent) {
    const route = await prisma.route.create({ data });
    if (event) eventBus.emitDomain(event, route, 'logistics');
    return route;
  },

  async update(id: string, data: any) {
    try { return await prisma.route.update({ where: { id }, data }); }
    catch { return null; }
  },

  async delete(id: string) {
    try { await prisma.route.delete({ where: { id } }); return true; }
    catch { return false; }
  },

  async count() { return prisma.route.count(); },
};

// ── PROCUREMENT ─────────────────────────────────────────────────────

export const purchaseOrdersDb = {
  async list(filters: Record<string, any> = {}, page = 1, limit = 50) {
    const where: any = {};
    if (filters.status) where.status = { contains: filters.status };
    if (filters.supplier) where.supplier = { contains: filters.supplier };

    const [data, total] = await Promise.all([
      prisma.purchaseOrder.findMany({ where, include: { items: true }, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.purchaseOrder.count({ where }),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  },

  async get(id: string) { return prisma.purchaseOrder.findUnique({ where: { id }, include: { items: true } }); },

  async create(data: any, event?: DomainEvent) {
    const { items, ...poData } = data;
    const po = await prisma.purchaseOrder.create({
      data: {
        ...poData,
        items: items ? { create: items.map((i: any) => ({ sku: i.sku, qty: i.qty, unitPrice: i.unitPrice || 0 })) } : undefined,
      },
      include: { items: true },
    });
    if (event) eventBus.emitDomain(event, po, 'procurement');
    return po;
  },

  async update(id: string, data: any) {
    try { return await prisma.purchaseOrder.update({ where: { id }, data }); }
    catch { return null; }
  },

  async delete(id: string) {
    try { await prisma.purchaseOrder.delete({ where: { id } }); return true; }
    catch { return false; }
  },

  async count() { return prisma.purchaseOrder.count(); },
};

export const approvalsDb = {
  async list(filters: Record<string, any> = {}, page = 1, limit = 50) {
    const where: any = {};
    if (filters.status) where.status = { contains: filters.status };
    if (filters.type) where.type = { contains: filters.type };

    const [data, total] = await Promise.all([
      prisma.approval.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.approval.count({ where }),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  },

  async create(data: any) {
    return prisma.approval.create({ data });
  },

  async count() { return prisma.approval.count(); },
};

// ── GPS / TIER-2 ────────────────────────────────────────────────────

export const gpsRetailersDb = {
  async list(filters: Record<string, any> = {}, page = 1, limit = 50) {
    const where: any = {};
    if (filters.countryCode) where.countryCode = filters.countryCode;
    if (filters.city) where.city = { contains: filters.city };

    const [data, total] = await Promise.all([
      prisma.gPSRetailer.findMany({ where, skip: (page - 1) * limit, take: limit }),
      prisma.gPSRetailer.count({ where }),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  },

  async create(data: any) {
    return prisma.gPSRetailer.create({ data });
  },

  async count() { return prisma.gPSRetailer.count(); },
};

export const satelliteDb = {
  async list(filters: Record<string, any> = {}, page = 1, limit = 50) {
    const where: any = {};
    if (filters.region) where.region = { contains: filters.region };
    if (filters.type) where.type = { contains: filters.type };

    const [data, total] = await Promise.all([
      prisma.satellite.findMany({ where, skip: (page - 1) * limit, take: limit }),
      prisma.satellite.count({ where }),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  },

  async count() { return prisma.satellite.count(); },
};

export const territoryAssignmentsDb = {
  async list(filters: Record<string, any> = {}, page = 1, limit = 50) {
    const where: any = {};
    if (filters.status) where.status = { contains: filters.status };
    if (filters.region) where.region = { contains: filters.region };

    const [data, total] = await Promise.all([
      prisma.territoryAssignment.findMany({ where, skip: (page - 1) * limit, take: limit }),
      prisma.territoryAssignment.count({ where }),
    ]);
    return { data, total, page, pages: Math.ceil(total / limit) };
  },

  async count() { return prisma.territoryAssignment.count(); },
};
