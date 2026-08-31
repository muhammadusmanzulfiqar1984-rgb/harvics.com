/**
 * AR credit gate + living catalog — durable enough to beat NetSuite path length.
 * CreditLimit via Prisma when available; catalog in ArCatalogItem table.
 */
import { prisma } from '../core/prisma';
import { invoicesDb } from '../core/db';
import { getCustomerMaster } from './arMasterData.service';
import { ensureFinanceDbSeeded } from './financeDbBootstrap.service';

export type CreditGate = {
  ok: boolean;
  customerId: string | null;
  customerName: string;
  approvedLimit: number;
  usedAmount: number;
  availableAmount: number;
  thisAmount: number;
  source: 'prisma' | 'open-ar-default';
  message: string;
};

async function openArForCustomer(customerName: string): Promise<number> {
  const invoices = (await invoicesDb.list({ type: 'AR' }, 1, 5000)).data;
  let used = 0;
  for (const inv of invoices) {
    if (String(inv.customerName || '').toLowerCase() !== customerName.toLowerCase()) continue;
    if (!['Unpaid', 'Overdue', 'Partial', 'Draft'].includes(inv.status)) continue;
    const paid = Array.isArray(inv.payments)
      ? inv.payments.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0)
      : 0;
    used += Math.max(0, Number(inv.amount) - paid);
  }
  return +used.toFixed(2);
}

/** Hard credit check before post/approve. Creates Customer+CreditLimit on first sight. */
export async function evaluateCredit(customerName: string, thisAmount: number): Promise<CreditGate> {
  const name = String(customerName || '').trim();
  const amt = Number(thisAmount) || 0;
  const used = await openArForCustomer(name);
  const master = await getCustomerMaster(name);
  const DEFAULT_LIMIT = master?.creditLimit ?? (Number(process.env.AR_DEFAULT_CREDIT_LIMIT) || 100000);

  try {
    let customer = await prisma.customer.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: { name, segment: 'Trade', creditRating: 'B' },
      });
    }
    let limit = await prisma.creditLimit.findUnique({ where: { customerId: customer.id } });
    if (!limit) {
      limit = await prisma.creditLimit.create({
        data: {
          customerId: customer.id,
          approvedLimit: DEFAULT_LIMIT,
          usedAmount: used,
          availableAmount: Math.max(0, DEFAULT_LIMIT - used),
          basis: 'Harvics default trade limit',
          approvedBy: 'system',
          approvedAt: new Date(),
        },
      });
    } else {
      const available = Math.max(0, Number(limit.approvedLimit) - used);
      limit = await prisma.creditLimit.update({
        where: { id: limit.id },
        data: { usedAmount: used, availableAmount: available },
      });
    }
    const approved = Number(limit.approvedLimit);
    const available = Math.max(0, approved - used);
    const ok = amt <= available + 0.009;
    return {
      ok,
      customerId: customer.id,
      customerName: name,
      approvedLimit: approved,
      usedAmount: used,
      availableAmount: available,
      thisAmount: amt,
      source: 'prisma',
      message: ok
        ? `Credit OK — ${available.toFixed(2)} available of ${approved.toFixed(2)}`
        : `Credit hold — need ${amt.toFixed(2)}, only ${available.toFixed(2)} available (limit ${approved.toFixed(2)}, used ${used.toFixed(2)})`,
    };
  } catch {
    const approved = DEFAULT_LIMIT;
    const available = Math.max(0, approved - used);
    const ok = amt <= available + 0.009;
    return {
      ok,
      customerId: null,
      customerName: name,
      approvedLimit: approved,
      usedAmount: used,
      availableAmount: available,
      thisAmount: amt,
      source: 'open-ar-default',
      message: ok
        ? `Credit OK (fallback limit ${approved}) — ${available.toFixed(2)} available`
        : `Credit hold (fallback) — need ${amt.toFixed(2)}, available ${available.toFixed(2)}`,
    };
  }
}

export type CatalogItem = {
  id: string;
  sku: string;
  hsCode?: string;
  description: string;
  uom: string;
  unitPrice: number;
  taxPercent: number;
  currency: string;
  active: boolean;
  updatedAt: string;
};

const SEED_CATALOG: CatalogItem[] = [
  {
    id: 'cat-basmati',
    sku: 'RICE-1121',
    hsCode: '1006.30',
    description: 'Basmati rice 1121 — 50kg bags',
    uom: 'BAG',
    unitPrice: 42.5,
    taxPercent: 5,
    currency: 'USD',
    active: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-freight',
    sku: 'FRT-OCEAN',
    hsCode: '9900.00',
    description: 'Ocean freight allocation',
    uom: 'LOT',
    unitPrice: 850,
    taxPercent: 0,
    currency: 'USD',
    active: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-pack',
    sku: 'PKG-EXP',
    hsCode: '9900.00',
    description: 'Export packing / fumigation',
    uom: 'LOT',
    unitPrice: 120,
    taxPercent: 0,
    currency: 'USD',
    active: true,
    updatedAt: new Date().toISOString(),
  },
];

async function seedCatalogIfEmpty() {
  await ensureFinanceDbSeeded();
  if ((await prisma.arCatalogItem.count()) > 0) return;
  for (const item of SEED_CATALOG) {
    await prisma.arCatalogItem.create({
      data: {
        sku: item.sku,
        description: item.description,
        uom: item.uom,
        unitPrice: item.unitPrice,
        taxPercent: item.taxPercent,
        currency: item.currency,
        hsCode: item.hsCode || null,
        active: item.active,
      },
    });
  }
}

function mapCatalog(row: {
  id: string;
  sku: string;
  description: string;
  uom: string;
  unitPrice: number;
  taxPercent: number;
  currency: string;
  hsCode: string | null;
  taxCode: string | null;
  active: boolean;
  updatedAt: Date;
}): CatalogItem {
  return {
    id: row.id,
    sku: row.sku,
    hsCode: row.hsCode || undefined,
    description: row.description,
    uom: row.uom,
    unitPrice: row.unitPrice,
    taxPercent: row.taxPercent,
    currency: row.currency,
    active: row.active,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listCatalog(): Promise<CatalogItem[]> {
  await seedCatalogIfEmpty();
  const rows = await prisma.arCatalogItem.findMany({ where: { active: true }, orderBy: { sku: 'asc' } });
  return rows.map(mapCatalog);
}

export async function upsertCatalogItem(input: Partial<CatalogItem> & { description: string }): Promise<CatalogItem> {
  await seedCatalogIfEmpty();
  const sku = String(input.sku || 'SKU');
  const existing = input.id
    ? await prisma.arCatalogItem.findUnique({ where: { id: input.id } })
    : await prisma.arCatalogItem.findUnique({ where: { sku } });

  const data = {
    sku,
    description: String(input.description),
    uom: String(input.uom || existing?.uom || 'EA'),
    unitPrice: Number(input.unitPrice ?? existing?.unitPrice ?? 0),
    taxPercent: Number(input.taxPercent ?? existing?.taxPercent ?? 0),
    currency: String(input.currency || existing?.currency || 'USD'),
    hsCode: input.hsCode ?? existing?.hsCode ?? null,
    taxCode: input.taxCode ?? existing?.taxCode ?? null,
    active: input.active !== false,
  };

  const row = existing
    ? await prisma.arCatalogItem.update({ where: { id: existing.id }, data })
    : await prisma.arCatalogItem.create({ data });

  return mapCatalog(row);
}

/** Sync invoice lines into catalog (prices learn like a living master). */
export async function learnCatalogFromLines(lines: any[]) {
  if (!Array.isArray(lines)) return;
  for (const l of lines) {
    if (!l?.description) continue;
    await upsertCatalogItem({
      sku: l.sku || undefined,
      hsCode: l.hsCode || undefined,
      description: l.description,
      uom: l.uom || 'EA',
      unitPrice: Number(l.unitPrice) || 0,
      taxPercent: Number(l.taxPercent) || 0,
    });
  }
}
