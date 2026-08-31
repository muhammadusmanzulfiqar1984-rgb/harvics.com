/**
 * Global House — legal entities, operating units, trade corridors, consolidation rules.
 * PostgreSQL-backed via Prisma (FhLegalEntity* tables).
 */
import { prisma } from '../core/prisma';
import { ensureFinanceDbSeeded } from './financeDbBootstrap.service';

export type EntityType = 'HOLDING' | 'OPERATING' | 'TRADING' | 'WAREHOUSE' | 'SPV';
export type ConsolidationMethod = 'FULL' | 'PROPORTIONAL' | 'EQUITY' | 'NONE';

export type LegalEntity = {
  id: string;
  code: string;
  name: string;
  legalName: string;
  entityType: EntityType;
  parentCode: string | null;
  country: string;
  region: string;
  city?: string;
  address?: string;
  functionalCurrency: string;
  reportingCurrency: string;
  taxId?: string;
  vatNumber?: string;
  consolidationMethod: ConsolidationMethod;
  ownershipPercent: number;
  active: boolean;
  roles: string[];
  corridors?: string[];
  updatedAt?: string;
};

export type OperatingUnit = {
  id: string;
  code: string;
  name: string;
  entityCode: string;
  type: string;
  active: boolean;
};

export type TradeCorridor = {
  id: string;
  from: string;
  to: string;
  label: string;
  modes: string[];
  incoterms: string[];
  primary?: boolean;
};

export type EliminationRule = {
  id: string;
  code: string;
  label: string;
  debitAccount: string;
  creditAccount: string;
  description: string;
};

function mapEntity(row: {
  id: string;
  code: string;
  name: string;
  legalName: string;
  entityType: string;
  parentCode: string | null;
  country: string;
  region: string;
  city: string | null;
  address: string | null;
  functionalCurrency: string;
  reportingCurrency: string;
  taxId: string | null;
  vatNumber: string | null;
  consolidationMethod: string;
  ownershipPercent: number;
  active: boolean;
  roles: unknown;
  corridors: unknown;
  updatedAt: Date;
}): LegalEntity {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    legalName: row.legalName,
    entityType: row.entityType as EntityType,
    parentCode: row.parentCode,
    country: row.country,
    region: row.region,
    city: row.city || undefined,
    address: row.address || undefined,
    functionalCurrency: row.functionalCurrency,
    reportingCurrency: row.reportingCurrency,
    taxId: row.taxId || undefined,
    vatNumber: row.vatNumber || undefined,
    consolidationMethod: row.consolidationMethod as ConsolidationMethod,
    ownershipPercent: row.ownershipPercent,
    active: row.active,
    roles: Array.isArray(row.roles) ? (row.roles as string[]) : [],
    corridors: Array.isArray(row.corridors) ? (row.corridors as string[]) : undefined,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getGlobalHouseOverview() {
  await ensureFinanceDbSeeded();
  const [group, entities, ous, corridors] = await Promise.all([
    prisma.globalHouseGroup.findFirst(),
    prisma.fhLegalEntity.findMany({ where: { active: true } }),
    prisma.fhOperatingUnit.findMany({ where: { active: true } }),
    prisma.fhTradeCorridor.findMany(),
  ]);
  return {
    groupCode: group?.groupCode || 'HGH',
    groupName: group?.groupName || 'Harvics Global House',
    reportingCurrency: group?.reportingCurrency || 'USD',
    entityCount: entities.length,
    operatingUnitCount: ous.length,
    corridorCount: corridors.length,
    countries: [...new Set(entities.map((e) => e.country))].sort(),
    regions: [...new Set(entities.map((e) => e.region))].sort(),
    entityTypes: [...new Set(entities.map((e) => e.entityType))],
  };
}

export async function listLegalEntities(): Promise<LegalEntity[]> {
  await ensureFinanceDbSeeded();
  const rows = await prisma.fhLegalEntity.findMany({ where: { active: true }, orderBy: { code: 'asc' } });
  return rows.map(mapEntity);
}

export async function getLegalEntity(codeOrId: string): Promise<LegalEntity | null> {
  await ensureFinanceDbSeeded();
  const key = codeOrId.toUpperCase();
  const row = await prisma.fhLegalEntity.findFirst({
    where: {
      OR: [{ code: key }, { id: codeOrId }],
      active: true,
    },
  });
  return row ? mapEntity(row) : null;
}

export async function getDefaultInvoicingEntity(): Promise<LegalEntity> {
  const entities = await listLegalEntities();
  const def =
    entities.find((e) => e.roles?.includes('invoicing_default')) ||
    entities.find((e) => e.code === 'HT-AE') ||
    entities[0];
  if (!def) throw new Error('No legal entities configured');
  return def;
}

export async function resolveEntityForCountry(country?: string): Promise<LegalEntity> {
  const c = (country || 'AE').toUpperCase();
  const map: Record<string, string> = {
    AE: 'HT-AE',
    PK: 'HT-PK',
    SG: 'HT-SG',
    US: 'HT-US',
    GB: 'HT-GB',
    UK: 'HT-GB',
  };
  return (await getLegalEntity(map[c] || 'HT-AE')) || (await getDefaultInvoicingEntity());
}

export async function listOperatingUnits(entityCode?: string): Promise<OperatingUnit[]> {
  await ensureFinanceDbSeeded();
  const rows = await prisma.fhOperatingUnit.findMany({
    where: { active: true, ...(entityCode ? { entityCode: entityCode.toUpperCase() } : {}) },
    orderBy: { code: 'asc' },
  });
  return rows.map((o) => ({
    id: o.id,
    code: o.code,
    name: o.name,
    entityCode: o.entityCode,
    type: o.type,
    active: o.active,
  }));
}

export async function listCorridors(entityCode?: string): Promise<TradeCorridor[]> {
  await ensureFinanceDbSeeded();
  const rows = await prisma.fhTradeCorridor.findMany();
  const code = entityCode?.toUpperCase();
  const filtered = code
    ? rows.filter((c) => c.fromCode === code || c.toCode === code)
    : rows;
  return filtered.map((c) => ({
    id: c.id,
    from: c.fromCode,
    to: c.toCode,
    label: c.label,
    modes: (c.modes as string[]) || [],
    incoterms: (c.incoterms as string[]) || [],
    primary: c.isPrimary,
  }));
}

export async function listEliminationRules(): Promise<EliminationRule[]> {
  await ensureFinanceDbSeeded();
  const rows = await prisma.fhEliminationRule.findMany({ where: { active: true } });
  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    label: r.label,
    debitAccount: r.debitAccount,
    creditAccount: r.creditAccount,
    description: r.description,
  }));
}

export type EntityTreeNode = LegalEntity & { children: EntityTreeNode[]; operatingUnits: OperatingUnit[] };

export async function buildEntityHierarchy(): Promise<EntityTreeNode[]> {
  const entities = await listLegalEntities();
  const ous = await listOperatingUnits();
  const byCode = new Map(
    entities.map((e) => [e.code, { ...e, children: [] as EntityTreeNode[], operatingUnits: [] as OperatingUnit[] }]),
  );

  for (const ou of ous) {
    const node = byCode.get(ou.entityCode);
    if (node) node.operatingUnits.push(ou);
  }

  const roots: EntityTreeNode[] = [];
  for (const node of byCode.values()) {
    if (node.parentCode && byCode.has(node.parentCode)) {
      byCode.get(node.parentCode)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export async function upsertLegalEntity(
  input: Partial<LegalEntity> & { code: string; name: string; legalName: string; country: string },
): Promise<LegalEntity> {
  await ensureFinanceDbSeeded();
  const group = await prisma.globalHouseGroup.findFirst();
  const code = input.code.toUpperCase();
  const row = await prisma.fhLegalEntity.upsert({
    where: { code },
    create: {
      id: input.id || `ent-${code.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      code,
      name: input.name,
      legalName: input.legalName,
      entityType: input.entityType || 'OPERATING',
      parentCode: input.parentCode?.toUpperCase() ?? 'HGH',
      country: input.country.toUpperCase(),
      region: input.region || 'MENA',
      city: input.city || null,
      address: input.address || null,
      functionalCurrency: input.functionalCurrency || 'USD',
      reportingCurrency: input.reportingCurrency || group?.reportingCurrency || 'USD',
      taxId: input.taxId || null,
      vatNumber: input.vatNumber || null,
      consolidationMethod: input.consolidationMethod || 'FULL',
      ownershipPercent: input.ownershipPercent ?? 100,
      active: input.active !== false,
      roles: input.roles || [],
      corridors: input.corridors || null,
      groupCode: group?.groupCode || 'HGH',
    },
    update: {
      name: input.name,
      legalName: input.legalName,
      entityType: input.entityType,
      parentCode: input.parentCode?.toUpperCase(),
      country: input.country.toUpperCase(),
      region: input.region,
      city: input.city,
      address: input.address,
      functionalCurrency: input.functionalCurrency,
      reportingCurrency: input.reportingCurrency,
      taxId: input.taxId,
      vatNumber: input.vatNumber,
      consolidationMethod: input.consolidationMethod,
      ownershipPercent: input.ownershipPercent,
      active: input.active !== false,
      roles: input.roles,
      corridors: input.corridors,
    },
  });
  return mapEntity(row);
}

export async function upsertOperatingUnit(
  input: Partial<OperatingUnit> & { code: string; name: string; entityCode: string; type: string },
): Promise<OperatingUnit> {
  await ensureFinanceDbSeeded();
  const code = input.code.toUpperCase();
  const row = await prisma.fhOperatingUnit.upsert({
    where: { code },
    create: {
      id: input.id || `ou-${code.toLowerCase()}`,
      code,
      name: input.name,
      entityCode: input.entityCode.toUpperCase(),
      type: input.type,
      active: input.active !== false,
    },
    update: {
      name: input.name,
      entityCode: input.entityCode.toUpperCase(),
      type: input.type,
      active: input.active !== false,
    },
  });
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    entityCode: row.entityCode,
    type: row.type,
    active: row.active,
  };
}

/** Tag a posted journal entry with legal entity for entity-scoped TB. */
export async function tagJournalEntry(entryNo: string, entityCode: string) {
  await ensureFinanceDbSeeded();
  const code = entityCode.toUpperCase();
  await prisma.journalEntry.updateMany({
    where: { entryNo },
    data: { entityCode: code },
  });
  try {
    await prisma.journalEntityTag.upsert({
      where: { entryNo },
      create: { entryNo, entityCode: code },
      update: { entityCode: code },
    });
  } catch {
    /* journal row may not exist yet in edge cases */
  }
}

export async function getJournalEntityTags(): Promise<Record<string, string>> {
  await ensureFinanceDbSeeded();
  const rows = await prisma.journalEntityTag.findMany();
  return Object.fromEntries(rows.map((r) => [r.entryNo, r.entityCode]));
}

export function entityTagPrefix(entityCode: string): string {
  return `[ENTITY:${entityCode.toUpperCase()}]`;
}

export function parseEntityFromDescription(description?: string | null): string | null {
  const m = String(description || '').match(/^\[ENTITY:([A-Z0-9-]+)\]/);
  return m ? m[1] : null;
}

export const INTERCOMPANY_COA = [
  { accountCode: '1250', name: 'Due from Affiliates (IC Receivable)', type: 'Asset', normalBalance: 'Debit', ic: true },
  { accountCode: '1260', name: 'Intercompany Receivable — Trade', type: 'Asset', normalBalance: 'Debit', ic: true },
  { accountCode: '2250', name: 'Due to Affiliates (IC Payable)', type: 'Liability', normalBalance: 'Credit', ic: true },
  { accountCode: '2260', name: 'Intercompany Payable — Trade', type: 'Liability', normalBalance: 'Credit', ic: true },
  { accountCode: '3100', name: 'Investment in Subsidiaries', type: 'Equity', normalBalance: 'Debit', ic: true },
  { accountCode: '4900', name: 'Intercompany Revenue (elimination)', type: 'Revenue', normalBalance: 'Credit', ic: true },
  { accountCode: '5900', name: 'Intercompany COGS / Charges (elimination)', type: 'Expense', normalBalance: 'Debit', ic: true },
];
