/**
 * AR master data — customer master, tax codes.
 * PostgreSQL-backed via ArCustomerMaster + ArTaxCode.
 */
import { prisma } from '../core/prisma';
import { evaluateCredit } from './arCreditCatalog.service';
import { ensureFinanceDbSeeded } from './financeDbBootstrap.service';

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

function mapCustomer(row: {
  id: string;
  code: string;
  name: string;
  legalName: string | null;
  billToLine1: string | null;
  billToLine2: string | null;
  city: string | null;
  country: string | null;
  postalCode: string | null;
  vatNumber: string | null;
  taxId: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  paymentTerms: string;
  currency: string;
  creditLimit: number;
  active: boolean;
  updatedAt: Date;
}): ArCustomerMaster {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    legalName: row.legalName || undefined,
    billToLine1: row.billToLine1 || undefined,
    billToLine2: row.billToLine2 || undefined,
    city: row.city || undefined,
    country: row.country || undefined,
    postalCode: row.postalCode || undefined,
    vatNumber: row.vatNumber || undefined,
    taxId: row.taxId || undefined,
    contactEmail: row.contactEmail || undefined,
    contactPhone: row.contactPhone || undefined,
    paymentTerms: row.paymentTerms,
    currency: row.currency,
    creditLimit: row.creditLimit,
    active: row.active,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapTax(row: {
  id: string;
  code: string;
  name: string;
  rate: number;
  country: string;
  type: string;
  active: boolean;
}): ArTaxCode {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    rate: row.rate,
    country: row.country,
    type: row.type as ArTaxCode['type'],
    active: row.active,
  };
}

async function seedDefaultsIfEmpty() {
  await ensureFinanceDbSeeded();
  if ((await prisma.arCustomerMaster.count()) === 0) {
    for (const c of SEED_CUSTOMERS) {
      await prisma.arCustomerMaster.create({
        data: {
          id: c.id,
          code: c.code,
          name: c.name,
          legalName: c.legalName || null,
          billToLine1: c.billToLine1 || null,
          billToLine2: c.billToLine2 || null,
          city: c.city || null,
          country: c.country || null,
          postalCode: c.postalCode || null,
          vatNumber: c.vatNumber || null,
          contactEmail: c.contactEmail || null,
          paymentTerms: c.paymentTerms,
          currency: c.currency,
          creditLimit: c.creditLimit,
        },
      });
    }
  }
  if ((await prisma.arTaxCode.count()) === 0) {
    for (const t of SEED_TAX) {
      await prisma.arTaxCode.create({ data: t });
    }
  }
}

export async function listCustomerMaster(): Promise<ArCustomerMaster[]> {
  await seedDefaultsIfEmpty();
  const rows = await prisma.arCustomerMaster.findMany({ where: { active: true }, orderBy: { name: 'asc' } });
  return rows.map(mapCustomer);
}

export async function getCustomerMaster(idOrCode: string): Promise<ArCustomerMaster | null> {
  await seedDefaultsIfEmpty();
  const key = idOrCode.toLowerCase();
  const row = await prisma.arCustomerMaster.findFirst({
    where: {
      active: true,
      OR: [
        { id: idOrCode },
        { code: { equals: idOrCode, mode: 'insensitive' } },
        { name: { equals: idOrCode, mode: 'insensitive' } },
      ],
    },
  });
  if (row) return mapCustomer(row);
  const all = await listCustomerMaster();
  return all.find((c) => c.name.toLowerCase() === key) || null;
}

export async function upsertCustomerMaster(input: Partial<ArCustomerMaster> & { name: string }): Promise<ArCustomerMaster> {
  await seedDefaultsIfEmpty();
  const id = input.id || `cust-${Date.now().toString(36)}`;
  const existing = input.code
    ? await prisma.arCustomerMaster.findFirst({ where: { code: input.code } })
    : await prisma.arCustomerMaster.findUnique({ where: { id } });

  const row = await prisma.arCustomerMaster.upsert({
    where: { id: existing?.id || id },
    create: {
      id,
      code: String(input.code || `C-${Date.now()}`),
      name: String(input.name),
      legalName: input.legalName || null,
      billToLine1: input.billToLine1 || null,
      billToLine2: input.billToLine2 || null,
      city: input.city || null,
      country: input.country || 'AE',
      postalCode: input.postalCode || null,
      vatNumber: input.vatNumber || null,
      taxId: input.taxId || null,
      contactEmail: input.contactEmail || null,
      contactPhone: input.contactPhone || null,
      paymentTerms: String(input.paymentTerms || 'Net 30'),
      currency: String(input.currency || 'USD'),
      creditLimit: Number(input.creditLimit ?? 100000),
      active: input.active !== false,
    },
    update: {
      name: String(input.name),
      legalName: input.legalName,
      billToLine1: input.billToLine1,
      billToLine2: input.billToLine2,
      city: input.city,
      country: input.country,
      postalCode: input.postalCode,
      vatNumber: input.vatNumber,
      taxId: input.taxId,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      paymentTerms: input.paymentTerms ? String(input.paymentTerms) : undefined,
      currency: input.currency ? String(input.currency) : undefined,
      creditLimit: input.creditLimit != null ? Number(input.creditLimit) : undefined,
      active: input.active !== false,
    },
  });

  const mapped = mapCustomer(row);
  void syncCustomerToPrisma(mapped);
  return mapped;
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
  const row = (await getCustomerMaster(customerName)) || (await upsertCustomerMaster({ name: customerName, creditLimit: approvedLimit }));
  await upsertCustomerMaster({ ...row, creditLimit: approvedLimit });
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

export async function listTaxCodes(): Promise<ArTaxCode[]> {
  await seedDefaultsIfEmpty();
  const rows = await prisma.arTaxCode.findMany({ where: { active: true }, orderBy: { code: 'asc' } });
  return rows.map(mapTax);
}

export async function getTaxCode(code: string): Promise<ArTaxCode | null> {
  await seedDefaultsIfEmpty();
  const row = await prisma.arTaxCode.findFirst({
    where: {
      active: true,
      OR: [{ code: { equals: code, mode: 'insensitive' } }, { id: code }],
    },
  });
  return row ? mapTax(row) : null;
}

export async function getTaxCodeForCountry(country?: string): Promise<ArTaxCode | null> {
  const codes = await listTaxCodes();
  if (!country) return (await getTaxCode('ZERO')) || codes[0] || null;
  const key = country.toUpperCase();
  return codes.find((t) => t.country === key) || codes.find((t) => t.country === '*') || (await getTaxCode('ZERO'));
}

export async function upsertTaxCode(input: Partial<ArTaxCode> & { code: string; name: string; rate: number }): Promise<ArTaxCode> {
  await seedDefaultsIfEmpty();
  const id = input.id || `tax-${Date.now().toString(36)}`;
  const existing = await prisma.arTaxCode.findFirst({
    where: { OR: [{ code: input.code }, { id }] },
  });
  const row = await prisma.arTaxCode.upsert({
    where: { id: existing?.id || id },
    create: {
      id,
      code: String(input.code),
      name: String(input.name),
      rate: Number(input.rate) || 0,
      country: String(input.country || '*'),
      type: String(input.type || 'VAT'),
      active: input.active !== false,
    },
    update: {
      name: String(input.name),
      rate: Number(input.rate) || 0,
      country: input.country ? String(input.country) : undefined,
      type: input.type ? String(input.type) : undefined,
      active: input.active !== false,
    },
  });
  return mapTax(row);
}

export function billToFromCustomer(c: ArCustomerMaster): string {
  return [c.legalName || c.name, c.billToLine1, c.billToLine2, [c.city, c.country].filter(Boolean).join(', ')]
    .filter(Boolean)
    .join(' · ');
}
