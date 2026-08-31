/**
 * Bootstrap Global House + AR master data from JSON seeds into PostgreSQL.
 * Idempotent — skips when FhLegalEntity rows already exist.
 */
import fs from 'fs';
import path from 'path';
import { prisma } from '../core/prisma';

const DATA_DIR = path.join(process.cwd(), 'data');

let seedPromise: Promise<void> | null = null;

function readJsonFile<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return null;
  }
}

function tableMissing(err: unknown): boolean {
  const code = (err as { code?: string })?.code;
  return code === 'P2021' || code === '42P01';
}

export async function ensureFinanceDbSeeded(): Promise<void> {
  if (seedPromise) return seedPromise;
  seedPromise = runSeed().catch((err) => {
    seedPromise = null;
    if (!tableMissing(err)) console.warn('[financeDbBootstrap]', (err as Error)?.message || err);
  });
  return seedPromise;
}

async function runSeed(): Promise<void> {
  let existing = 0;
  try {
    existing = await prisma.fhLegalEntity.count();
  } catch (err) {
    if (tableMissing(err)) return;
    throw err;
  }
  if (existing > 0) {
    await seedAuxiliaryTables();
    return;
  }

  const store = readJsonFile<{
    groupCode: string;
    groupName: string;
    reportingCurrency: string;
    entities: Array<Record<string, unknown>>;
    operatingUnits: Array<Record<string, unknown>>;
    corridors: Array<Record<string, unknown>>;
    eliminationRules: Array<Record<string, unknown>>;
  }>(path.join(DATA_DIR, 'legal-entities.json'));

  if (!store?.entities?.length) {
    console.warn('[financeDbBootstrap] legal-entities.json missing — skip entity seed');
    return;
  }

  await prisma.globalHouseGroup.upsert({
    where: { groupCode: store.groupCode || 'HGH' },
    create: {
      groupCode: store.groupCode || 'HGH',
      groupName: store.groupName || 'Harvics Global House',
      reportingCurrency: store.reportingCurrency || 'USD',
    },
    update: {
      groupName: store.groupName || 'Harvics Global House',
      reportingCurrency: store.reportingCurrency || 'USD',
    },
  });

  const sorted = [...store.entities].sort((a, b) => {
    const aRoot = !a.parentCode ? 0 : 1;
    const bRoot = !b.parentCode ? 0 : 1;
    return aRoot - bRoot;
  });

  for (const e of sorted) {
    await prisma.fhLegalEntity.upsert({
      where: { code: String(e.code).toUpperCase() },
      create: {
        id: String(e.id),
        code: String(e.code).toUpperCase(),
        name: String(e.name),
        legalName: String(e.legalName || e.name),
        entityType: String(e.entityType || 'OPERATING'),
        parentCode: e.parentCode ? String(e.parentCode).toUpperCase() : null,
        country: String(e.country).toUpperCase(),
        region: String(e.region || 'MENA'),
        city: (e.city as string) || null,
        address: (e.address as string) || null,
        functionalCurrency: String(e.functionalCurrency || 'USD'),
        reportingCurrency: String(e.reportingCurrency || store.reportingCurrency || 'USD'),
        taxId: (e.taxId as string) || null,
        vatNumber: (e.vatNumber as string) || null,
        consolidationMethod: String(e.consolidationMethod || 'FULL'),
        ownershipPercent: Number(e.ownershipPercent ?? 100),
        active: e.active !== false,
        roles: (e.roles as string[]) || [],
        corridors: (e.corridors as string[]) || null,
        groupCode: store.groupCode || 'HGH',
      },
      update: {
        name: String(e.name),
        legalName: String(e.legalName || e.name),
        active: e.active !== false,
        roles: (e.roles as string[]) || [],
      },
    });
  }

  for (const ou of store.operatingUnits || []) {
    await prisma.fhOperatingUnit.upsert({
      where: { code: String(ou.code).toUpperCase() },
      create: {
        id: String(ou.id),
        code: String(ou.code).toUpperCase(),
        name: String(ou.name),
        entityCode: String(ou.entityCode).toUpperCase(),
        type: String(ou.type),
        active: ou.active !== false,
      },
      update: { name: String(ou.name), active: ou.active !== false },
    });
  }

  for (const c of store.corridors || []) {
    await prisma.fhTradeCorridor.upsert({
      where: { id: String(c.id) },
      create: {
        id: String(c.id),
        fromCode: String(c.from).toUpperCase(),
        toCode: String(c.to).toUpperCase(),
        label: String(c.label),
        modes: (c.modes as string[]) || [],
        incoterms: (c.incoterms as string[]) || [],
        isPrimary: Boolean(c.primary),
      },
      update: { label: String(c.label), isPrimary: Boolean(c.primary) },
    });
  }

  for (const r of store.eliminationRules || []) {
    await prisma.fhEliminationRule.upsert({
      where: { code: String(r.code) },
      create: {
        id: String(r.id),
        code: String(r.code),
        label: String(r.label),
        debitAccount: String(r.debitAccount),
        creditAccount: String(r.creditAccount),
        description: String(r.description),
      },
      update: { label: String(r.label), description: String(r.description) },
    });
  }

  await seedAuxiliaryTables();
}

async function seedAuxiliaryTables(): Promise<void> {
  await seedTaxNexus();
  await seedArMaster();
  await seedIntercompany();
  await seedRevenueContracts();
  await seedConsolidationRuns();
  await seedJournalTags();
}

async function seedTaxNexus(): Promise<void> {
  const nexus = readJsonFile<{
    registrations: Array<Record<string, unknown>>;
    jurisdictionRules: Array<Record<string, unknown>>;
  }>(path.join(DATA_DIR, 'tax-nexus.json'));
  if (!nexus) return;

  try {
    if ((await prisma.fhTaxNexusRegistration.count()) === 0) {
      for (const r of nexus.registrations || []) {
        await prisma.fhTaxNexusRegistration.create({
          data: {
            id: String(r.id),
            entityCode: String(r.entityCode).toUpperCase(),
            country: String(r.country).toUpperCase(),
            region: (r.region as string) || null,
            nexusType: String(r.nexusType),
            taxType: String(r.taxType),
            registrationNumber: (r.registrationNumber as string) || null,
            effectiveFrom: String(r.effectiveFrom),
            thresholdAmount: r.thresholdAmount != null ? Number(r.thresholdAmount) : null,
            thresholdTransactions: r.thresholdTransactions != null ? Number(r.thresholdTransactions) : null,
            ytdSales: Number(r.ytdSales ?? 0),
            ytdTransactions: Number(r.ytdTransactions ?? 0),
            defaultTaxCode: String(r.defaultTaxCode),
            active: r.active !== false,
            notes: (r.notes as string) || null,
          },
        });
      }
    }
    if ((await prisma.fhTaxJurisdictionRule.count()) === 0) {
      for (const j of nexus.jurisdictionRules || []) {
        await prisma.fhTaxJurisdictionRule.create({
          data: {
            country: String(j.country).toUpperCase(),
            taxType: String(j.taxType),
            defaultRate: Number(j.defaultRate ?? 0),
            originBased: Boolean(j.originBased),
            exportZeroRated: Boolean(j.exportZeroRated),
            requiresRegion: Boolean(j.requiresRegion),
          },
        });
      }
    }
  } catch (err) {
    if (!tableMissing(err)) throw err;
  }
}

async function seedArMaster(): Promise<void> {
  const customers = readJsonFile<Array<Record<string, unknown>>>(path.join(DATA_DIR, 'ar-customers.json'));
  const taxCodes = readJsonFile<Array<Record<string, unknown>>>(path.join(DATA_DIR, 'ar-tax-codes.json'));
  const catalog = readJsonFile<Array<Record<string, unknown>>>(path.join(DATA_DIR, 'ar-catalog.json'));

  try {
    if (customers?.length && (await prisma.arCustomerMaster.count()) === 0) {
      for (const c of customers) {
        await prisma.arCustomerMaster.create({
          data: {
            id: String(c.id),
            code: String(c.code),
            name: String(c.name),
            legalName: (c.legalName as string) || null,
            billToLine1: (c.billToLine1 as string) || null,
            billToLine2: (c.billToLine2 as string) || null,
            city: (c.city as string) || null,
            country: (c.country as string) || null,
            postalCode: (c.postalCode as string) || null,
            vatNumber: (c.vatNumber as string) || null,
            taxId: (c.taxId as string) || null,
            contactEmail: (c.contactEmail as string) || null,
            contactPhone: (c.contactPhone as string) || null,
            paymentTerms: String(c.paymentTerms || 'Net 30'),
            currency: String(c.currency || 'USD'),
            creditLimit: Number(c.creditLimit ?? 100000),
            active: c.active !== false,
          },
        });
      }
    }

    if (taxCodes?.length && (await prisma.arTaxCode.count()) === 0) {
      for (const t of taxCodes) {
        await prisma.arTaxCode.create({
          data: {
            id: String(t.id),
            code: String(t.code),
            name: String(t.name),
            rate: Number(t.rate ?? 0),
            country: String(t.country),
            type: String(t.type),
            active: t.active !== false,
          },
        });
      }
    }

    if (catalog?.length && (await prisma.arCatalogItem.count()) === 0) {
      for (const item of catalog) {
        await prisma.arCatalogItem.upsert({
          where: { sku: String(item.sku) },
          create: {
            sku: String(item.sku),
            description: String(item.description || item.sku),
            uom: String(item.uom || 'EA'),
            unitPrice: Number(item.unitPrice ?? 0),
            taxPercent: Number(item.taxPercent ?? 0),
            currency: String(item.currency || 'USD'),
            hsCode: (item.hsCode as string) || null,
            taxCode: (item.taxCode as string) || null,
            active: item.active !== false,
          },
          update: {},
        });
      }
    }
  } catch (err) {
    if (!tableMissing(err)) throw err;
  }
}

async function seedIntercompany(): Promise<void> {
  const rows = readJsonFile<Array<Record<string, unknown>>>(path.join(DATA_DIR, 'intercompany-transactions.json'));
  if (!rows?.length) return;
  try {
    if ((await prisma.fhIntercompanyTransaction.count()) > 0) return;
    for (const t of rows) {
      await prisma.fhIntercompanyTransaction.create({
        data: {
          id: String(t.id),
          txnNo: String(t.txnNo),
          type: String(t.type),
          fromEntityCode: String(t.fromEntityCode).toUpperCase(),
          toEntityCode: String(t.toEntityCode).toUpperCase(),
          amount: Number(t.amount),
          currency: String(t.currency || 'USD'),
          description: String(t.description),
          status: String(t.status || 'DRAFT'),
          sellerJournalEntryNo: (t.sellerJournalEntryNo as string) || null,
          buyerJournalEntryNo: (t.buyerJournalEntryNo as string) || null,
          reference: (t.reference as string) || null,
          postedAt: t.postedAt ? new Date(String(t.postedAt)) : null,
          createdAt: t.createdAt ? new Date(String(t.createdAt)) : new Date(),
        },
      });
    }
  } catch (err) {
    if (!tableMissing(err)) throw err;
  }
}

async function seedRevenueContracts(): Promise<void> {
  const rows = readJsonFile<Array<Record<string, unknown>>>(path.join(DATA_DIR, 'revenue-contracts.json'));
  if (!rows?.length) return;
  try {
    if ((await prisma.fhRevenueContract.count()) > 0) return;
    for (const c of rows) {
      await prisma.fhRevenueContract.create({
        data: {
          id: String(c.id),
          contractNo: String(c.contractNo),
          invoiceId: (c.invoiceId as string) || null,
          invoiceNo: (c.invoiceNo as string) || null,
          salesOrderId: (c.salesOrderId as string) || null,
          customerName: String(c.customerName),
          entityCode: String(c.entityCode).toUpperCase(),
          currency: String(c.currency || 'USD'),
          transactionPrice: Number(c.transactionPrice),
          status: String(c.status || 'ACTIVE'),
          obligations: (c.obligations as object[]) || [],
          schedule: (c.schedule as object[]) || [],
          completedAt: c.completedAt ? new Date(String(c.completedAt)) : null,
          createdAt: c.createdAt ? new Date(String(c.createdAt)) : new Date(),
        },
      });
    }
  } catch (err) {
    if (!tableMissing(err)) throw err;
  }
}

async function seedConsolidationRuns(): Promise<void> {
  const rows = readJsonFile<Array<Record<string, unknown>>>(path.join(DATA_DIR, 'consolidation-runs.json'));
  if (!rows?.length) return;
  try {
    if ((await prisma.fhConsolidationRun.count()) > 0) return;
    for (const r of rows) {
      await prisma.fhConsolidationRun.create({
        data: {
          runNo: String(r.runNo),
          periodCode: (r.periodCode as string) || null,
          postedAt: new Date(String(r.postedAt)),
          dryRun: Boolean(r.dryRun),
          lines: (r.lines as object[]) || [],
          journals: (r.journals as object[]) || [],
          totalAmount: Number(r.totalAmount ?? 0),
          status: String(r.status),
        },
      });
    }
  } catch (err) {
    if (!tableMissing(err)) throw err;
  }
}

async function seedJournalTags(): Promise<void> {
  const tags = readJsonFile<Record<string, string>>(path.join(DATA_DIR, 'entity-journal-tags.json'));
  if (!tags) return;
  try {
    for (const [entryNo, entityCode] of Object.entries(tags)) {
      const journal = await prisma.journalEntry.findUnique({ where: { entryNo } });
      if (!journal) continue;
      await prisma.journalEntityTag.upsert({
        where: { entryNo },
        create: { entryNo, entityCode: entityCode.toUpperCase() },
        update: { entityCode: entityCode.toUpperCase() },
      });
      if (!journal.entityCode) {
        await prisma.journalEntry.update({
          where: { entryNo },
          data: { entityCode: entityCode.toUpperCase() },
        });
      }
    }
  } catch (err) {
    if (!tableMissing(err)) throw err;
  }
}
