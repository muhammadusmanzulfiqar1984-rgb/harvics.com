/**
 * AR credit gate + living catalog — durable enough to beat NetSuite path length.
 * CreditLimit via Prisma when available; open-AR fallback always.
 * Catalog persisted as JSON under data/ar-catalog.json (survives restarts).
 */
import fs from 'fs';
import path from 'path';
import { prisma } from '../core/prisma';
import { invoicesDb } from '../core/db';
import { getCustomerMaster } from './arMasterData.service';

const CATALOG_PATH = path.join(process.cwd(), 'data', 'ar-catalog.json');

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
  const master = getCustomerMaster(name);
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

function ensureCatalogFile(): CatalogItem[] {
  const dir = path.dirname(CATALOG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(CATALOG_PATH)) {
    const seed: CatalogItem[] = [
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
    fs.writeFileSync(CATALOG_PATH, JSON.stringify(seed, null, 2));
    return seed;
  }
  try {
    return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  } catch {
    return [];
  }
}

function saveCatalog(items: CatalogItem[]) {
  const dir = path.dirname(CATALOG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(items, null, 2));
}

export function listCatalog(): CatalogItem[] {
  return ensureCatalogFile().filter((i) => i.active !== false);
}

export function upsertCatalogItem(input: Partial<CatalogItem> & { description: string }): CatalogItem {
  const items = ensureCatalogFile();
  const id = input.id || `cat-${Date.now().toString(36)}`;
  const existing = items.findIndex((i) => i.id === id || (input.sku && i.sku === input.sku));
  const row: CatalogItem = {
    id: existing >= 0 ? items[existing].id : id,
    sku: String(input.sku || items[existing]?.sku || 'SKU'),
    hsCode: input.hsCode || items[existing]?.hsCode,
    description: String(input.description),
    uom: String(input.uom || items[existing]?.uom || 'EA'),
    unitPrice: Number(input.unitPrice ?? items[existing]?.unitPrice ?? 0),
    taxPercent: Number(input.taxPercent ?? items[existing]?.taxPercent ?? 0),
    currency: String(input.currency || items[existing]?.currency || 'USD'),
    active: input.active !== false,
    updatedAt: new Date().toISOString(),
  };
  if (existing >= 0) items[existing] = row;
  else items.push(row);
  saveCatalog(items);
  return row;
}

/** Sync invoice lines into catalog (prices learn like a living master). */
export function learnCatalogFromLines(lines: any[]) {
  if (!Array.isArray(lines)) return;
  for (const l of lines) {
    if (!l?.description) continue;
    upsertCatalogItem({
      sku: l.sku || undefined,
      hsCode: l.hsCode || undefined,
      description: l.description,
      uom: l.uom || 'EA',
      unitPrice: Number(l.unitPrice) || 0,
      taxPercent: Number(l.taxPercent) || 0,
    });
  }
}
