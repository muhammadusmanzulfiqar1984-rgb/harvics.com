/**
 * AR master data — closes Oracle NetSuite gaps: customer master, tax codes, credit admin.
 * Persisted under data/ (survives restarts; no SuiteScript consulting).
 */
import fs from 'fs';
import path from 'path';
import { prisma } from '../core/prisma';
import { evaluateCredit } from './arCreditCatalog.service';

const DATA_DIR = path.join(process.cwd(), 'data');
const CUSTOMERS_PATH = path.join(DATA_DIR, 'ar-customers.json');
const TAX_CODES_PATH = path.join(DATA_DIR, 'ar-tax-codes.json');

export type ArCustomerMaster = {
  id: string;
  code: string;
  name: string;
  legalName?: string;
  billToLine1?: string;
  billToLine2?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  vatNumber?: string;
  taxId?: string;
  contactEmail?: string;
  contactPhone?: string;
  paymentTerms: string;
  currency: string;
  creditLimit: number;
  active: boolean;
  updatedAt: string;
};

export type ArTaxCode = {
  id: string;
  code: string;
  name: string;
  rate: number;
  country: string;
  type: 'VAT' | 'GST' | 'Sales' | 'Zero';
  active: boolean;
};

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson<T>(file: string, seed: T[]): T[] {
  ensureDir();
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(seed, null, 2));
    return seed;
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T[];
  } catch {
    return seed;
  }
}

function writeJson<T>(file: string, rows: T[]) {
  ensureDir();
  fs.writeFileSync(file, JSON.stringify(rows, null, 2));
}

const SEED_CUSTOMERS: ArCustomerMaster[] = [
  {
    id: 'cust-gulf-foods',
    code: 'GF-001',
    name: 'Gulf Foods Trading',
    legalName: 'Gulf Foods Trading LLC',
    billToLine1: 'Dubai Multi Commodities Centre',
    billToLine2: 'Jumeirah Lakes Towers',
    city: 'Dubai',
    country: 'AE',
    postalCode: '00000',
    vatNumber: 'AE100123456700003',
    contactEmail: 'ap@gulffoods.example',
    paymentTerms: 'Net 30',
    currency: 'USD',
    creditLimit: 100000,
    active: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cust-demo-trading',
    code: 'DT-001',
    name: 'Demo Trading LLC',
    billToLine1: 'Business Bay',
    city: 'Dubai',
    country: 'AE',
    vatNumber: 'AE100987654300001',
    contactEmail: 'finance@demotrading.example',
    paymentTerms: 'Net 30',
    currency: 'USD',
    creditLimit: 75000,
    active: true,
    updatedAt: new Date().toISOString(),
  },
];

const SEED_TAX: ArTaxCode[] = [
  { id: 'tax-uae-vat5', code: 'VAT-AE-5', name: 'UAE VAT 5%', rate: 5, country: 'AE', type: 'VAT', active: true },
  { id: 'tax-zero', code: 'ZERO', name: 'Zero rated export', rate: 0, country: '*', type: 'Zero', active: true },
  { id: 'tax-us-sales', code: 'US-SALES', name: 'US Sales tax (placeholder)', rate: 0, country: 'US', type: 'Sales', active: true },
  { id: 'tax-pk-gst', code: 'GST-PK-17', name: 'Pakistan GST 17%', rate: 17, country: 'PK', type: 'GST', active: true },
];

export function listCustomerMaster(): ArCustomerMaster[] {
  return readJson(CUSTOMERS_PATH, SEED_CUSTOMERS).filter((c) => c.active !== false);
}

export function getCustomerMaster(idOrCode: string): ArCustomerMaster | null {
  const key = idOrCode.toLowerCase();
  return (
    listCustomerMaster().find(
      (c) => c.id.toLowerCase() === key || c.code.toLowerCase() === key || c.name.toLowerCase() === key,
    ) || null
  );
}

export function upsertCustomerMaster(input: Partial<ArCustomerMaster> & { name: string }): ArCustomerMaster {
  const rows = readJson<ArCustomerMaster>(CUSTOMERS_PATH, SEED_CUSTOMERS);
  const id = input.id || `cust-${Date.now().toString(36)}`;
  const idx = rows.findIndex((r) => r.id === id || (input.code && r.code === input.code));
  const row: ArCustomerMaster = {
    id: idx >= 0 ? rows[idx].id : id,
    code: String(input.code || rows[idx]?.code || `C-${rows.length + 1}`),
    name: String(input.name),
    legalName: input.legalName || rows[idx]?.legalName,
    billToLine1: input.billToLine1 || rows[idx]?.billToLine1,
    billToLine2: input.billToLine2 || rows[idx]?.billToLine2,
    city: input.city || rows[idx]?.city,
    country: input.country || rows[idx]?.country || 'AE',
    postalCode: input.postalCode || rows[idx]?.postalCode,
    vatNumber: input.vatNumber || rows[idx]?.vatNumber,
    taxId: input.taxId || rows[idx]?.taxId,
    contactEmail: input.contactEmail || rows[idx]?.contactEmail,
    contactPhone: input.contactPhone || rows[idx]?.contactPhone,
    paymentTerms: String(input.paymentTerms || rows[idx]?.paymentTerms || 'Net 30'),
    currency: String(input.currency || rows[idx]?.currency || 'USD'),
    creditLimit: Number(input.creditLimit ?? rows[idx]?.creditLimit ?? 100000),
    active: input.active !== false,
    updatedAt: new Date().toISOString(),
  };
  if (idx >= 0) rows[idx] = row;
  else rows.push(row);
  writeJson(CUSTOMERS_PATH, rows);
  void syncCustomerToPrisma(row);
  return row;
}

async function syncCustomerToPrisma(row: ArCustomerMaster) {
  try {
    let customer = await prisma.customer.findFirst({
      where: { name: { equals: row.name, mode: 'insensitive' } },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: row.name,
          segment: 'Trade',
          country: row.country,
          city: row.city,
          contactEmail: row.contactEmail,
          creditRating: 'B',
        },
      });
    } else if (row.contactEmail || row.city || row.country) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          contactEmail: row.contactEmail || customer.contactEmail,
          city: row.city || customer.city,
          country: row.country || customer.country,
        },
      });
    }
    const existing = await prisma.creditLimit.findUnique({ where: { customerId: customer.id } });
    if (!existing) {
      await prisma.creditLimit.create({
        data: {
          customerId: customer.id,
          approvedLimit: row.creditLimit,
          usedAmount: 0,
          availableAmount: row.creditLimit,
          basis: 'AR customer master',
          approvedBy: 'master-data',
          approvedAt: new Date(),
        },
      });
    } else if (existing.approvedLimit !== row.creditLimit) {
      const gate = await evaluateCredit(row.name, 0);
      const used = gate.usedAmount;
      await prisma.creditLimit.update({
        where: { id: existing.id },
        data: {
          approvedLimit: row.creditLimit,
          usedAmount: used,
          availableAmount: Math.max(0, row.creditLimit - used),
        },
      });
    }
  } catch {
    /* Prisma optional offline */
  }
}

export async function setCustomerCreditLimit(customerName: string, approvedLimit: number, approvedBy?: string) {
  const row = getCustomerMaster(customerName) || upsertCustomerMaster({ name: customerName, creditLimit: approvedLimit });
  row.creditLimit = approvedLimit;
  upsertCustomerMaster(row);
  try {
    const customer = await prisma.customer.findFirst({
      where: { name: { equals: customerName, mode: 'insensitive' } },
    });
    if (!customer) return evaluateCredit(customerName, 0);
    const gate = await evaluateCredit(customerName, 0);
    await prisma.creditLimit.upsert({
      where: { customerId: customer.id },
      create: {
        customerId: customer.id,
        approvedLimit,
        usedAmount: gate.usedAmount,
        availableAmount: Math.max(0, approvedLimit - gate.usedAmount),
        basis: 'Manual credit update',
        approvedBy: approvedBy || 'finance',
        approvedAt: new Date(),
      },
      update: {
        approvedLimit,
        usedAmount: gate.usedAmount,
        availableAmount: Math.max(0, approvedLimit - gate.usedAmount),
        approvedBy: approvedBy || 'finance',
        approvedAt: new Date(),
      },
    });
  } catch {
    /* fallback */
  }
  return evaluateCredit(customerName, 0);
}

export function listTaxCodes(): ArTaxCode[] {
  return readJson(TAX_CODES_PATH, SEED_TAX).filter((t) => t.active !== false);
}

export function getTaxCode(code: string): ArTaxCode | null {
  const key = code.toLowerCase();
  return listTaxCodes().find((t) => t.code.toLowerCase() === key || t.id.toLowerCase() === key) || null;
}

/** Default tax code for a customer country (SuiteTax-lite). */
export function getTaxCodeForCountry(country?: string): ArTaxCode | null {
  const codes = listTaxCodes();
  if (!country) return getTaxCode('ZERO') || codes[0] || null;
  const key = country.toUpperCase();
  return codes.find((t) => t.country === key) || codes.find((t) => t.country === '*') || getTaxCode('ZERO');
}

export function upsertTaxCode(input: Partial<ArTaxCode> & { code: string; name: string; rate: number }): ArTaxCode {
  const rows = readJson<ArTaxCode>(TAX_CODES_PATH, SEED_TAX);
  const id = input.id || `tax-${Date.now().toString(36)}`;
  const idx = rows.findIndex((r) => r.code === input.code || r.id === id);
  const row: ArTaxCode = {
    id: idx >= 0 ? rows[idx].id : id,
    code: String(input.code),
    name: String(input.name),
    rate: Number(input.rate) || 0,
    country: String(input.country || rows[idx]?.country || '*'),
    type: (input.type as ArTaxCode['type']) || rows[idx]?.type || 'VAT',
    active: input.active !== false,
  };
  if (idx >= 0) rows[idx] = row;
  else rows.push(row);
  writeJson(TAX_CODES_PATH, rows);
  return row;
}

export function billToFromCustomer(c: ArCustomerMaster): string {
  return [c.legalName || c.name, c.billToLine1, c.billToLine2, [c.city, c.country].filter(Boolean).join(', ')]
    .filter(Boolean)
    .join(' · ');
}
