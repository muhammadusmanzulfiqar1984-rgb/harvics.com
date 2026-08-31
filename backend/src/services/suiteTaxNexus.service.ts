/**
 * SuiteTax-style nexus engine — jurisdiction registration, economic nexus, tax determination.
 * PostgreSQL-backed via FhTaxNexusRegistration + FhTaxJurisdictionRule.
 */
import { prisma } from '../core/prisma';
import { ensureFinanceDbSeeded } from './financeDbBootstrap.service';
import { getTaxCode, getTaxCodeForCountry, listTaxCodes } from './arMasterData.service';
import { getLegalEntity, resolveEntityForCountry } from './entityMaster.service';

export type NexusType = 'PHYSICAL' | 'ECONOMIC' | 'MARKETPLACE' | 'EXPORT';

export type NexusRegistration = {
  id: string;
  entityCode: string;
  country: string;
  region: string | null;
  nexusType: NexusType;
  taxType: string;
  registrationNumber: string | null;
  effectiveFrom: string;
  thresholdAmount: number | null;
  thresholdTransactions: number | null;
  ytdSales: number;
  ytdTransactions: number;
  defaultTaxCode: string;
  active: boolean;
  notes?: string;
};

export type JurisdictionRule = {
  country: string;
  taxType: string;
  defaultRate: number;
  originBased: boolean;
  exportZeroRated: boolean;
  requiresRegion?: boolean;
};

function mapNexus(row: {
  id: string;
  entityCode: string;
  country: string;
  region: string | null;
  nexusType: string;
  taxType: string;
  registrationNumber: string | null;
  effectiveFrom: string;
  thresholdAmount: number | null;
  thresholdTransactions: number | null;
  ytdSales: number;
  ytdTransactions: number;
  defaultTaxCode: string;
  active: boolean;
  notes: string | null;
}): NexusRegistration {
  return {
    id: row.id,
    entityCode: row.entityCode,
    country: row.country,
    region: row.region,
    nexusType: row.nexusType as NexusType,
    taxType: row.taxType,
    registrationNumber: row.registrationNumber,
    effectiveFrom: row.effectiveFrom,
    thresholdAmount: row.thresholdAmount,
    thresholdTransactions: row.thresholdTransactions,
    ytdSales: row.ytdSales,
    ytdTransactions: row.ytdTransactions,
    defaultTaxCode: row.defaultTaxCode,
    active: row.active,
    notes: row.notes || undefined,
  };
}

export async function listNexusRegistrations(filters?: { entityCode?: string; country?: string; active?: boolean }) {
  await ensureFinanceDbSeeded();
  const rows = await prisma.fhTaxNexusRegistration.findMany({
    where: {
      ...(filters?.entityCode ? { entityCode: filters.entityCode.toUpperCase() } : {}),
      ...(filters?.country ? { OR: [{ country: filters.country.toUpperCase() }, { country: '*' }] } : {}),
      ...(filters?.active !== false ? { active: true } : {}),
    },
  });
  return rows.map(mapNexus);
}

export async function listJurisdictionRules(): Promise<JurisdictionRule[]> {
  await ensureFinanceDbSeeded();
  const rows = await prisma.fhTaxJurisdictionRule.findMany();
  return rows.map((j) => ({
    country: j.country,
    taxType: j.taxType,
    defaultRate: j.defaultRate,
    originBased: j.originBased,
    exportZeroRated: j.exportZeroRated,
    requiresRegion: j.requiresRegion,
  }));
}

export async function upsertNexusRegistration(input: Partial<NexusRegistration> & { entityCode: string; country: string }) {
  await ensureFinanceDbSeeded();
  const entityCode = input.entityCode.toUpperCase();
  const country = input.country.toUpperCase();
  const region = input.region || null;
  const id =
    input.id || `nx-${entityCode}-${country}${region ? `-${region}` : ''}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');

  const existing = await prisma.fhTaxNexusRegistration.findFirst({
    where: { entityCode, country, region },
  });

  const data = {
    entityCode,
    country,
    region,
    nexusType: (input.nexusType as NexusType) || 'PHYSICAL',
    taxType: input.taxType || 'VAT',
    registrationNumber: input.registrationNumber ?? null,
    effectiveFrom: input.effectiveFrom || new Date().toISOString().slice(0, 10),
    thresholdAmount: input.thresholdAmount ?? null,
    thresholdTransactions: input.thresholdTransactions ?? null,
    ytdSales: input.ytdSales ?? 0,
    ytdTransactions: input.ytdTransactions ?? 0,
    defaultTaxCode: input.defaultTaxCode || 'ZERO',
    active: input.active !== false,
    notes: input.notes || null,
  };

  const row = existing
    ? await prisma.fhTaxNexusRegistration.update({ where: { id: existing.id }, data })
    : await prisma.fhTaxNexusRegistration.create({ data: { id, ...data } });

  return mapNexus(row);
}

async function findNexus(entityCode: string, shipCountry: string, shipRegion?: string | null): Promise<NexusRegistration | null> {
  const regs = await listNexusRegistrations({ entityCode, active: true });
  const country = shipCountry.toUpperCase();
  const region = shipRegion?.toUpperCase() || null;

  const exact = regs.find((r) => r.country === country && (r.region || null) === region && r.nexusType !== 'EXPORT');
  if (exact) return exact;

  const countryOnly = regs.find((r) => r.country === country && !r.region && r.nexusType !== 'EXPORT');
  if (countryOnly) return countryOnly;

  return null;
}

async function jurisdictionRule(country: string): Promise<JurisdictionRule | null> {
  const rules = await listJurisdictionRules();
  return rules.find((j) => j.country === country.toUpperCase()) || null;
}

export type TaxDeterminationInput = {
  sellerEntityCode?: string;
  shipToCountry: string;
  shipToRegion?: string | null;
  billToCountry?: string;
  customerCountry?: string;
  amount: number;
  isExport?: boolean;
  productType?: 'goods' | 'services' | 'digital';
  lineTaxCode?: string;
};

export type TaxDeterminationResult = {
  taxable: boolean;
  taxCode: string;
  taxType: string;
  rate: number;
  taxAmount: number;
  total: number;
  nexusId: string | null;
  nexusType: NexusType | null;
  nexusReason: string;
  sellerEntityCode: string;
  shipToCountry: string;
  shipToRegion: string | null;
  warnings: string[];
};

export async function determineTax(input: TaxDeterminationInput): Promise<TaxDeterminationResult> {
  await ensureFinanceDbSeeded();
  const warnings: string[] = [];
  const shipCountry = input.shipToCountry.toUpperCase();
  const shipRegion = input.shipToRegion?.toUpperCase() || null;
  const amount = +Number(input.amount).toFixed(2);

  const seller =
    (input.sellerEntityCode && (await getLegalEntity(input.sellerEntityCode))) ||
    (await resolveEntityForCountry(input.customerCountry || input.billToCountry || shipCountry));

  const sellerEntity = seller.code;
  const sellerCountry = seller.country.toUpperCase();

  if (input.lineTaxCode) {
    const tc = await getTaxCode(input.lineTaxCode);
    if (tc) {
      const taxAmount = +((amount * tc.rate) / 100).toFixed(2);
      return {
        taxable: tc.rate > 0,
        taxCode: tc.code,
        taxType: tc.type,
        rate: tc.rate,
        taxAmount,
        total: +(amount + taxAmount).toFixed(2),
        nexusId: null,
        nexusType: null,
        nexusReason: 'Explicit line tax code override',
        sellerEntityCode: sellerEntity,
        shipToCountry: shipCountry,
        shipToRegion: shipRegion,
        warnings,
      };
    }
  }

  const isExport =
    input.isExport === true || (shipCountry !== sellerCountry && !(await findNexus(sellerEntity, shipCountry, shipRegion)));
  const rule = await jurisdictionRule(shipCountry);

  if (isExport && rule?.exportZeroRated) {
    const tc = (await getTaxCode('ZERO')) || (await getTaxCodeForCountry('*'));
    return {
      taxable: false,
      taxCode: tc?.code || 'ZERO',
      taxType: 'Zero',
      rate: 0,
      taxAmount: 0,
      total: amount,
      nexusId: null,
      nexusType: 'EXPORT',
      nexusReason: `Export / no nexus — seller ${sellerEntity} → ship ${shipCountry}`,
      sellerEntityCode: sellerEntity,
      shipToCountry: shipCountry,
      shipToRegion: shipRegion,
      warnings,
    };
  }

  const nexus = await findNexus(sellerEntity, shipCountry, shipRegion);
  if (!nexus) {
    if (rule?.requiresRegion && !shipRegion) {
      warnings.push(`US sales tax requires ship-to state/region for ${shipCountry}`);
    }
    const fallback = (await getTaxCodeForCountry(shipCountry)) || (await getTaxCode('ZERO'));
    const rate = fallback?.rate ?? rule?.defaultRate ?? 0;
    const taxAmount = +((amount * rate) / 100).toFixed(2);
    return {
      taxable: rate > 0,
      taxCode: fallback?.code || 'ZERO',
      taxType: fallback?.type || rule?.taxType || 'Sales',
      rate,
      taxAmount,
      total: +(amount + taxAmount).toFixed(2),
      nexusId: null,
      nexusType: null,
      nexusReason: `No registered nexus — fallback jurisdiction rate for ${shipCountry}`,
      sellerEntityCode: sellerEntity,
      shipToCountry: shipCountry,
      shipToRegion: shipRegion,
      warnings,
    };
  }

  if (nexus.nexusType === 'ECONOMIC') {
    if (nexus.thresholdAmount != null && nexus.ytdSales < nexus.thresholdAmount) {
      warnings.push(
        `Economic nexus threshold not met: ${nexus.ytdSales}/${nexus.thresholdAmount} in ${nexus.country}${nexus.region ? `-${nexus.region}` : ''}`,
      );
    }
    if (nexus.thresholdTransactions != null && nexus.ytdTransactions < nexus.thresholdTransactions) {
      warnings.push(`Transaction threshold not met: ${nexus.ytdTransactions}/${nexus.thresholdTransactions}`);
    }
  }

  const tc = (await getTaxCode(nexus.defaultTaxCode)) || (await getTaxCodeForCountry(shipCountry));
  const rate = tc?.rate ?? rule?.defaultRate ?? 0;
  const taxAmount = +((amount * rate) / 100).toFixed(2);

  return {
    taxable: rate > 0,
    taxCode: tc?.code || nexus.defaultTaxCode,
    taxType: nexus.taxType,
    rate,
    taxAmount,
    total: +(amount + taxAmount).toFixed(2),
    nexusId: nexus.id,
    nexusType: nexus.nexusType,
    nexusReason: `${nexus.nexusType} nexus — ${nexus.entityCode} registered in ${nexus.country}${nexus.region ? `-${nexus.region}` : ''}`,
    sellerEntityCode: sellerEntity,
    shipToCountry: shipCountry,
    shipToRegion: shipRegion,
    warnings,
  };
}

export async function determineLineTaxes(
  lines: Array<{ amount: number; taxCode?: string; description?: string }>,
  context: Omit<TaxDeterminationInput, 'amount' | 'lineTaxCode'>,
) {
  const results = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const det = await determineTax({
      ...context,
      amount: line.amount,
      lineTaxCode: line.taxCode,
    });
    results.push({ lineIndex: i, description: line.description, ...det });
  }
  return results;
}

export async function recordNexusSale(entityCode: string, country: string, region: string | null, amount: number) {
  await ensureFinanceDbSeeded();
  const row = await prisma.fhTaxNexusRegistration.findFirst({
    where: {
      entityCode: entityCode.toUpperCase(),
      country: country.toUpperCase(),
      region: region || null,
    },
  });
  if (!row) return null;
  const updated = await prisma.fhTaxNexusRegistration.update({
    where: { id: row.id },
    data: {
      ytdSales: +(row.ytdSales + amount).toFixed(2),
      ytdTransactions: row.ytdTransactions + 1,
    },
  });
  return mapNexus(updated);
}

export async function getNexusAlerts() {
  const regs = await listNexusRegistrations();
  const alerts: { level: 'warn' | 'critical'; entityCode: string; jurisdiction: string; message: string; pct: number }[] = [];
  for (const r of regs) {
    if (r.nexusType !== 'ECONOMIC' || !r.thresholdAmount) continue;
    const pct = (r.ytdSales / r.thresholdAmount) * 100;
    if (pct >= 100) {
      alerts.push({
        level: 'critical',
        entityCode: r.entityCode,
        jurisdiction: `${r.country}${r.region ? `-${r.region}` : ''}`,
        message: `Economic nexus threshold exceeded — registration required`,
        pct,
      });
    } else if (pct >= 80) {
      alerts.push({
        level: 'warn',
        entityCode: r.entityCode,
        jurisdiction: `${r.country}${r.region ? `-${r.region}` : ''}`,
        message: `Approaching economic nexus threshold (${pct.toFixed(0)}%)`,
        pct,
      });
    }
  }
  return alerts;
}

export async function getSuiteTaxSummary() {
  return {
    registrations: (await listNexusRegistrations()).length,
    jurisdictions: (await listJurisdictionRules()).length,
    taxCodes: (await listTaxCodes()).length,
    alerts: await getNexusAlerts(),
  };
}
