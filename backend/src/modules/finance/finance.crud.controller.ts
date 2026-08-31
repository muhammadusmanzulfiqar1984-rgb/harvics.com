/**
 * FINANCE CRUD Controller (Prisma-backed)
 * 
 * Invoices:  POST/GET/PUT/DELETE /api/finance/invoices
 * Payments:  POST/GET /api/finance/payments
 * Journal:   POST/GET /api/finance/journal
 * Summary:   GET /api/finance/summary
 * 
 * LOCALIZATION: All responses are locale-aware based on req.locale
 */

import { Router, Request, Response } from 'express';
import { invoicesDb, paymentsDb, journalDb, glAccountsDb, fiscalPeriodsDb } from '../../core/db';
import { DomainStore } from '../../core/dataStore';
import { prisma } from '../../core/prisma';
import { translateError, translateMessage, t } from '../../core/translate';
import { emitAudit } from '../../services/audit.service';
import { eventBus } from '../../core/eventBus';
import {
  aiEnabled,
  arCollectionsCoach,
  apPaymentAdvisor,
  draftInvoiceFromBrief,
  explainVariance,
  glCloseAdvisor,
  oracleCrossCheck,
} from '../../services/aiService';
import {
  buildInvoiceHtml,
  emailConfigured,
  renderInvoicePdf,
  sendInvoiceEmail,
} from '../../services/invoiceDocument.service';
import {
  evaluateCredit,
  learnCatalogFromLines,
  listCatalog,
  upsertCatalogItem,
} from '../../services/arCreditCatalog.service';
import {
  billToFromCustomer,
  getCustomerMaster,
  getTaxCode,
  getTaxCodeForCountry,
  listCustomerMaster,
  listTaxCodes,
  setCustomerCreditLimit,
  upsertCustomerMaster,
  upsertTaxCode,
} from '../../services/arMasterData.service';
import {
  buildDunningQueue,
  DUNNING_STAGES,
  getDunningState,
  sendStagedDunning,
} from '../../services/dunning.service';
import {
  O2C_STAGES,
  billSalesOrderFromDelivery,
  deliverSalesOrder,
  getO2COrder,
  listO2CPipeline,
  releaseCreditHold,
  runO2CBillingBatch,
  shipSalesOrder,
} from '../../services/o2c.service';
import {
  INTERCOMPANY_COA,
  buildEntityHierarchy,
  getDefaultInvoicingEntity,
  getGlobalHouseOverview,
  getLegalEntity,
  listCorridors,
  listLegalEntities,
  listOperatingUnits,
  resolveEntityForCountry,
  upsertLegalEntity,
  upsertOperatingUnit,
} from '../../services/entityMaster.service';
import {
  computeICBalances,
  createICTransaction,
  listICTransactions,
  netICPair,
} from '../../services/intercompany.service';
import {
  buildGroupTrialBalance,
  computeEntityTrialBalance,
  executeConsolidationEliminations,
  getConsolidationDashboard,
  listConsolidationRuns,
  previewEliminationsAsync,
} from '../../services/consolidation.service';
import {
  determineTax,
  determineLineTaxes,
  getNexusAlerts,
  getSuiteTaxSummary,
  listJurisdictionRules,
  listNexusRegistrations,
  recordNexusSale,
  upsertNexusRegistration,
} from '../../services/suiteTaxNexus.service';
import {
  REVREC_COA,
  createContractFromInvoice,
  getDeferredRevenueSummary,
  getRevenueContract,
  listRevenueContracts,
  processInvoiceRevRec,
  recognizeRevenue,
} from '../../services/asc606.service';
import { createInvoicePayLink, payLinkConfigured } from '../../services/invoicePayLink.service';
import '../../middleware/locale';

/**
 * Module #1 — Financial Accounting (GL) lives on Prisma:
 *   CoA, journals (double-entry), fiscal periods, trial balance.
 * Module #2 — Controlling: Prisma CostCenter + CostPosting (+ allocations).
 * Module #7 — FP&A: Prisma BudgetLine.
 * Assets remain DomainStore until Module #34.
 */
const assetStore = new DomainStore('finance-fixed-assets', [
  { assetCode: 'FA-2026-001', name: 'Dubai Logistics City — Warehouse Fit-Out', category: 'Leasehold Improvement', industryVertical: 'All', purchaseDate: '2024-01-15', purchaseCost: 480000, salvageValue: 0, usefulLifeYears: 10, depreciationMethod: 'Straight-Line', accumulatedDepreciation: 112000, bookValue: 368000, currency: 'USD', location: 'DXB-W1', status: 'Active' },
  { assetCode: 'FA-2026-002', name: 'Isuzu NPR Fleet — 3 Trucks (KHI)', category: 'Vehicles', industryVertical: 'Logistics', purchaseDate: '2023-06-01', purchaseCost: 216000, salvageValue: 24000, usefulLifeYears: 5, depreciationMethod: 'Straight-Line', accumulatedDepreciation: 76800, bookValue: 139200, currency: 'USD', location: 'KHI-W1', status: 'Active' },
  { assetCode: 'FA-2026-003', name: 'Industrial Textile Loom — 2 Units', category: 'Machinery', industryVertical: 'Textiles', purchaseDate: '2022-03-20', purchaseCost: 240000, salvageValue: 20000, usefulLifeYears: 8, depreciationMethod: 'Declining-Balance', accumulatedDepreciation: 110000, bookValue: 130000, currency: 'USD', location: 'KHI-W1', status: 'Active' },
  { assetCode: 'FA-2026-004', name: 'HARVICS OS — ERP & Server Infrastructure', category: 'IT Equipment', industryVertical: 'All', purchaseDate: '2025-01-10', purchaseCost: 85000, salvageValue: 5000, usefulLifeYears: 4, depreciationMethod: 'Straight-Line', accumulatedDepreciation: 20000, bookValue: 65000, currency: 'USD', location: 'Cloud / Azure', status: 'Active' },
  { assetCode: 'FA-2026-005', name: 'Cold Chain Storage Unit — Lahore', category: 'Plant & Equipment', industryVertical: 'FMCG', purchaseDate: '2023-09-01', purchaseCost: 145000, salvageValue: 10000, usefulLifeYears: 12, depreciationMethod: 'Straight-Line', accumulatedDepreciation: 22917, bookValue: 122083, currency: 'USD', location: 'LHR-W2', status: 'Active' },
  { assetCode: 'FA-2026-006', name: 'Dubai Trade Office — Leasehold Fit-Out', category: 'Leasehold Improvement', industryVertical: 'All', purchaseDate: '2023-01-15', purchaseCost: 92000, salvageValue: 0, usefulLifeYears: 5, depreciationMethod: 'Straight-Line', accumulatedDepreciation: 36800, bookValue: 55200, currency: 'USD', location: 'Dubai DIFC', status: 'Active' },
  { assetCode: 'FA-2026-007', name: 'Forklift Fleet — 4 Units (DXB)', category: 'Material Handling', industryVertical: 'All', purchaseDate: '2023-03-01', purchaseCost: 128000, salvageValue: 12000, usefulLifeYears: 7, depreciationMethod: 'Straight-Line', accumulatedDepreciation: 32914, bookValue: 95086, currency: 'USD', location: 'DXB-W1', status: 'Active' },
  { assetCode: 'FA-2026-008', name: 'Commodity Testing Laboratory Equipment', category: 'Laboratory', industryVertical: 'Commodities', purchaseDate: '2024-06-01', purchaseCost: 58000, salvageValue: 3000, usefulLifeYears: 6, depreciationMethod: 'Straight-Line', accumulatedDepreciation: 12292, bookValue: 45708, currency: 'USD', location: 'DXB-W3', status: 'Active' },
]);

const router = Router();

const STANDARD_COA = [
  { accountCode: '1000', name: 'Cash & Bank', type: 'Asset', normalBalance: 'Debit' },
  { accountCode: '1100', name: 'Accounts Receivable', type: 'Asset', normalBalance: 'Debit' },
  { accountCode: '1200', name: 'Inventory', type: 'Asset', normalBalance: 'Debit' },
  { accountCode: '1500', name: 'Fixed Assets', type: 'Asset', normalBalance: 'Debit' },
  { accountCode: '2000', name: 'Accounts Payable', type: 'Liability', normalBalance: 'Credit' },
  { accountCode: '2100', name: 'Accrued Liabilities', type: 'Liability', normalBalance: 'Credit' },
  { accountCode: '3000', name: 'Share Capital', type: 'Equity', normalBalance: 'Credit' },
  { accountCode: '4000', name: 'Revenue — Trading', type: 'Revenue', normalBalance: 'Credit' },
  { accountCode: '5000', name: 'Cost of Goods Sold', type: 'Expense', normalBalance: 'Debit' },
  { accountCode: '6000', name: 'Operating Expenses', type: 'Expense', normalBalance: 'Debit' },
  { accountCode: '6100', name: 'Depreciation Expense', type: 'Expense', normalBalance: 'Debit' },
];

async function computeTrialBalance(periodCode?: string) {
  const accounts = (await glAccountsDb.list({ status: 'Active' }, 1, 500)).data;
  const journals = periodCode
    ? (await journalDb.list({ status: 'Posted', periodCode }, 1, 10000)).data
    : await journalDb.allPosted();

  const debitMap: Record<string, number> = {};
  const creditMap: Record<string, number> = {};
  for (const j of journals) {
    const d = j.debit || '';
    const c = j.credit || '';
    const amt = Number(j.amount) || 0;
    if (d) debitMap[d] = (debitMap[d] || 0) + amt;
    if (c) creditMap[c] = (creditMap[c] || 0) + amt;
  }

  const rows = accounts.map((a: any) => {
    const debits = debitMap[a.accountCode] || 0;
    const credits = creditMap[a.accountCode] || 0;
    const balance = a.normalBalance === 'Credit' ? credits - debits : debits - credits;
    return {
      accountCode: a.accountCode,
      name: a.name,
      type: a.type,
      normalBalance: a.normalBalance,
      debits,
      credits,
      balance,
    };
  });

  const totalDebits = rows.reduce((s, r) => s + r.debits, 0);
  const totalCredits = rows.reduce((s, r) => s + r.credits, 0);
  return {
    rows,
    totalDebits,
    totalCredits,
    balanced: Math.abs(totalDebits - totalCredits) < 0.01,
    journalCount: journals.length,
    periodCode: periodCode || null,
  };
}

// Helper to get locale
const getLocale = (req: Request): string => (req as any).locale || 'en';

// Helper to localize invoice status
const localizeInvoice = (inv: any, locale: string) => {
  if (!inv) return inv;
  const statusKey = inv.status?.toLowerCase() || 'unpaid';
  const paid = Array.isArray(inv.payments)
    ? inv.payments.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0)
    : 0;
  const outstanding = Math.max(0, +(Number(inv.amount || 0) - paid).toFixed(2));
  const lines = Array.isArray(inv.lines) ? inv.lines : inv.lines ? inv.lines : [];
  const unpacked = unpackInvoiceMeta(inv.notes);
  return {
    ...inv,
    customer: inv.customerName || inv.customer || null,
    paid,
    outstanding,
    lines: Array.isArray(lines) ? lines : [],
    subtotal: inv.subtotal != null ? Number(inv.subtotal) : Number(inv.amount) || 0,
    taxAmount: Number(inv.taxAmount) || 0,
    statusText: t(`finance.status.${statusKey}`, locale) || inv.status,
    meta: unpacked.meta,
    notes: unpacked.notes,
    notesRaw: inv.notes,
  };
};

/** Normalize invoice / bill line items → totals */
function packInvoiceMeta(meta: Record<string, any> | null | undefined, notes?: string): string | undefined {
  const clean = meta && typeof meta === 'object' ? meta : null;
  const note = notes ? String(notes).trim() : '';
  if (!clean && !note) return undefined;
  if (!clean) return note;
  return `[[META]]${JSON.stringify(clean)}[[/META]]${note ? `\n${note}` : ''}`;
}

function unpackInvoiceMeta(notes?: string | null): { meta: Record<string, any> | null; notes: string | null } {
  const raw = String(notes || '');
  const m = raw.match(/^\[\[META\]\]([\s\S]*?)\[\[\/META\]\]\n?([\s\S]*)$/);
  if (!m) return { meta: null, notes: raw || null };
  try {
    return { meta: JSON.parse(m[1]), notes: m[2]?.trim() || null };
  } catch {
    return { meta: null, notes: raw || null };
  }
}

async function buildInvoiceLines(raw: any[] | undefined): Promise<{
  lines: Array<{
    lineNo: number;
    sku: string | null;
    hsCode: string | null;
    description: string;
    qty: number;
    uom: string | null;
    unitPrice: number;
    taxPercent: number;
    taxCode: string | null;
    amount: number;
  }>;
  subtotal: number;
  taxAmount: number;
  amount: number;
} | null> {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const lines = [];
  for (let idx = 0; idx < raw.length; idx++) {
    const row = raw[idx];
    const qty = Number(row.qty ?? row.quantity);
    const unitPrice = Number(row.unitPrice ?? row.price);
    let taxPercent = Number(row.taxPercent ?? row.tax ?? 0) || 0;
    const taxCodeRaw = row.taxCode ? String(row.taxCode).trim() : '';
    const taxRow = taxCodeRaw ? await getTaxCode(taxCodeRaw) : null;
    if (taxRow) taxPercent = taxRow.rate;
    const description = String(row.description || row.name || row.sku || '').trim();
    if (!description || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) continue;
    const net = +(qty * unitPrice).toFixed(2);
    const tax = +((net * taxPercent) / 100).toFixed(2);
    lines.push({
      lineNo: idx + 1,
      sku: row.sku ? String(row.sku).trim() : null,
      hsCode: row.hsCode ? String(row.hsCode).trim() : null,
      description,
      qty,
      uom: row.uom ? String(row.uom).trim() : null,
      unitPrice,
      taxPercent,
      taxCode: taxRow?.code || taxCodeRaw || null,
      amount: +(net + tax).toFixed(2),
      net,
      tax,
    });
  }
  if (!lines.length) return null;
  const subtotal = +lines.reduce((s, l) => s + l.net, 0).toFixed(2);
  const taxAmount = +lines.reduce((s, l) => s + l.tax, 0).toFixed(2);
  const amount = +(subtotal + taxAmount).toFixed(2);
  return {
    lines: lines.map(({ net, tax, ...rest }) => rest),
    subtotal,
    taxAmount,
    amount,
  };
}

/** Module #3 — optional post into Module #1 GL (best-effort; never blocks AR write). */
async function postArJournal(opts: {
  description: string;
  debit: string;
  credit: string;
  amount: number;
  currency?: string;
  entityCode?: string;
}) {
  const { entityTagPrefix, tagJournalEntry } = await import('../../services/entityMaster.service');
  const open = (await fiscalPeriodsDb.list({ status: 'Open' }, 1, 1)).data[0];
  if (!open) return null;
  const [debitAcct, creditAcct] = await Promise.all([
    glAccountsDb.getByCode(opts.debit),
    glAccountsDb.getByCode(opts.credit),
  ]);
  if (!debitAcct || !creditAcct) return null;
  const count = await journalDb.count();
  const entryNo = `JE-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  const desc = opts.entityCode
    ? `${entityTagPrefix(opts.entityCode)} ${opts.description}`
    : opts.description;
  const journal = await journalDb.create(
    {
      entryNo,
      description: desc,
      debit: opts.debit,
      credit: opts.credit,
      amount: opts.amount,
      currency: opts.currency || 'USD',
      postedDate: new Date().toISOString().slice(0, 10),
      status: 'Posted',
      periodCode: open.periodCode,
    },
    'finance.journal.posted',
  );
  if (opts.entityCode) await tagJournalEntry(entryNo, opts.entityCode);
  return journal;
}

// ── SUMMARY ─────────────────────────────────────────────────────────
router.get('/summary', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const [invoices, payments, journalCount] = await Promise.all([
    invoicesDb.list({}, 1, 10000),
    paymentsDb.list({}, 1, 10000),
    journalDb.count(),
  ]);

  const totalAR = invoices.data.filter((i: any) => i.type === 'AR' && i.status !== 'Paid').reduce((s: number, i: any) => s + (i.amount || 0), 0);
  const totalPaid = payments.data.reduce((s: number, p: any) => s + (p.amount || 0), 0);
  const overdue = invoices.data.filter((i: any) => i.status === 'Overdue').length;

  res.json({
    success: true,
    message: translateMessage('fetched', locale),
    data: {
      totalReceivable: totalAR,
      totalCollected: totalPaid,
      overdueInvoices: overdue,
      totalInvoices: invoices.total,
      totalPayments: payments.total,
      totalJournalEntries: journalCount
    }
  });
});

// ── INVOICES ─────────────────────────────────────────────────────────
router.get('/invoices', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const { status, type, customer, page, limit } = req.query;
  const result = await invoicesDb.list({ status, type, customer }, Number(page) || 1, Number(limit) || 50);
  const localizedData = result.data.map((inv: any) => localizeInvoice(inv, locale));
  res.json({ success: true, ...result, data: localizedData });
});

router.get('/invoices/:id', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const inv = await invoicesDb.get(req.params.id);
  if (!inv) return res.status(404).json({ success: false, error: t('finance.messages.invoiceNotFound', locale) });
  res.json({ success: true, data: localizeInvoice(inv, locale) });
});

router.post('/invoices', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const {
    customer, customerName, vendor, vendorName, amount, currency, dueDate, type, postToGl, lines, notes, taxAmount,
    invoiceDate, paymentTerms, poNumber, billTo, billToAddress, incoterms, bankDetails, collectionsOpener,
    status: statusIn, saveAsDraft, legalEntityId, legalEntityCode, operatingUnitCode,
    shipToCountry, shipToRegion, useSuiteTax, asc606, revRecTrigger,
  } = req.body;
  const invType = String(type || 'AR').toUpperCase() === 'VENDOR' ? 'AP' : String(type || 'AR').toUpperCase() === 'AP' ? 'AP' : 'AR';
  const name = customerName || customer || vendorName || vendor;
  if (!name) return res.status(400).json({ success: false, error: translateError('missingFields', locale) });

  const asDraft = saveAsDraft === true || String(statusIn || '').toLowerCase() === 'draft';
  const shouldPostGl = !asDraft && postToGl !== false;
  const forceCredit = req.body?.forceCredit === true;
  const master = invType === 'AR' ? await getCustomerMaster(String(name)) : null;

  let built = await buildInvoiceLines(lines);
  if (built && lines?.length && useSuiteTax !== false && shipToCountry) {
    const entity =
      (await getLegalEntity(String(legalEntityCode || legalEntityId || ''))) ||
      (master?.country ? await resolveEntityForCountry(master.country) : await getDefaultInvoicingEntity());
    const nexusLines = await determineLineTaxes(
      (lines as any[]).map((row) => ({
        amount: +(Number(row.qty ?? row.quantity) * Number(row.unitPrice ?? row.price)).toFixed(2),
        taxCode: row.taxCode,
        description: row.description,
      })),
      {
        sellerEntityCode: entity.code,
        shipToCountry: String(shipToCountry),
        shipToRegion: shipToRegion ? String(shipToRegion) : null,
        customerCountry: master?.country,
      },
    );
    const enriched = (lines as any[]).map((row, i) => ({
      ...row,
      taxCode: nexusLines[i]?.taxCode || row.taxCode,
      taxPercent: nexusLines[i]?.rate ?? row.taxPercent,
    }));
    built = await buildInvoiceLines(enriched);
  }

  let amt: number;
  let linePayload: any = undefined;
  let subtotal: number | undefined;
  let taxAmt = 0;

  if (built) {
    amt = built.amount;
    linePayload = built.lines;
    subtotal = built.subtotal;
    taxAmt = built.taxAmount;
  } else {
    amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Provide line items (description, qty, unitPrice) or a positive amount',
      });
    }
    taxAmt = Number(taxAmount) || 0;
    subtotal = +(amt - taxAmt).toFixed(2);
  }

  let creditGate = null as any;
  if (!asDraft) {
    creditGate = await evaluateCredit(String(name), amt);
    if (!creditGate.ok && !forceCredit) {
      return res.status(409).json({
        success: false,
        error: creditGate.message,
        credit: creditGate,
        hint: 'Park as Draft, raise credit limit, or pass forceCredit:true after approval',
      });
    }
  }

  const effectiveCurrency = currency || master?.currency || 'USD';
  const effectivePaymentTerms = paymentTerms || master?.paymentTerms;

  const meta: Record<string, any> = {};
  if (invoiceDate) meta.invoiceDate = String(invoiceDate);
  if (effectivePaymentTerms) meta.paymentTerms = String(effectivePaymentTerms);
  if (poNumber) meta.poNumber = String(poNumber);
  const resolvedBillTo = billTo || billToAddress || (master ? billToFromCustomer(master) : undefined);
  if (resolvedBillTo) meta.billTo = String(resolvedBillTo);
  if (master?.vatNumber) meta.vatNumber = master.vatNumber;
  if (master?.contactEmail) meta.contactEmail = master.contactEmail;
  if (incoterms) meta.incoterms = String(incoterms);
  if (bankDetails) meta.bankDetails = String(bankDetails);
  if (collectionsOpener) meta.collectionsOpener = String(collectionsOpener);
  const entity =
    (await getLegalEntity(String(legalEntityCode || legalEntityId || ''))) ||
    (master?.country ? await resolveEntityForCountry(master.country) : await getDefaultInvoicingEntity());
  meta.legalEntity = {
    id: entity.id,
    code: entity.code,
    name: entity.name,
    legalName: entity.legalName,
    country: entity.country,
    vatNumber: entity.vatNumber || entity.taxId,
  };
  if (operatingUnitCode) meta.operatingUnitCode = String(operatingUnitCode);
  if (shipToCountry) {
    meta.shipTo = { country: String(shipToCountry), region: shipToRegion ? String(shipToRegion) : null };
    meta.suiteTax = await determineTax({
      sellerEntityCode: entity.code,
      shipToCountry: String(shipToCountry),
      shipToRegion: shipToRegion ? String(shipToRegion) : null,
      customerCountry: master?.country,
      amount: subtotal ?? amt,
    });
  }
  const useAsc606 = invType === 'AR' && asc606 !== false;
  if (useAsc606) {
    meta.asc606 = {
      enabled: true,
      trigger: revRecTrigger || 'INVOICE',
      status: 'DEFERRED',
    };
  }
  const packedNotes = packInvoiceMeta(Object.keys(meta).length ? meta : null, notes);

  let inv: any;
  try {
    const count = await invoicesDb.count();
    const prefix = invType === 'AP' ? 'AP' : 'INV';
    const data: any = {
      invoiceNo: `${prefix}-2026-${String(count + 1).padStart(3, '0')}`,
      customerName: name,
      amount: amt,
      currency: effectiveCurrency,
      dueDate: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      type: invType,
      status: asDraft ? 'Draft' : 'Unpaid',
    };
    if (linePayload) data.lines = linePayload;
    if (subtotal != null) data.subtotal = subtotal;
    if (taxAmt != null) data.taxAmount = taxAmt;
    if (packedNotes) data.notes = packedNotes;
    if (entity?.code) data.legalEntityCode = entity.code;
    if (shipToCountry) data.shipToCountry = String(shipToCountry);

    inv = await invoicesDb.create(data, 'finance.invoice.created');
  } catch (e: any) {
    const msg = String(e?.message || '');
    if (msg.includes('does not exist') || e?.code === 'P2021' || msg.includes('Unknown argument')) {
      // Retry without new columns if DB not migrated yet
      try {
        const count = await invoicesDb.count();
        const prefix = invType === 'AP' ? 'AP' : 'INV';
        inv = await invoicesDb.create({
          invoiceNo: `${prefix}-2026-${String(count + 1).padStart(3, '0')}`,
          customerName: name,
          amount: amt,
          currency: effectiveCurrency,
          dueDate: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          type: invType,
          status: asDraft ? 'Draft' : 'Unpaid',
        }, 'finance.invoice.created');
      } catch (e2: any) {
        return res.status(503).json({
          success: false,
          error: e2?.message || 'Invoice create failed — apply prisma/manual/module3_ar_invoice_lines.sql',
        });
      }
    } else {
      return res.status(500).json({ success: false, error: e?.message || 'invoice create failed' });
    }
  }

  let journal = null;
  let glNote: string | null = null;
  let revRec: any = null;
  if (shouldPostGl) {
    try {
      if (invType === 'AR') {
        journal = await postArJournal({
          description: `AR invoice ${inv.invoiceNo} — ${name}${useAsc606 ? ' (ASC 606 deferred)' : ''}`,
          debit: '1100',
          credit: useAsc606 ? '2400' : '4000',
          amount: amt,
          currency: inv.currency,
          entityCode: entity.code,
        });
      } else {
        journal = await postArJournal({
          description: `AP bill ${inv.invoiceNo} — ${name}`,
          debit: '6000',
          credit: '2000',
          amount: amt,
          currency: inv.currency,
        });
      }
      if (!journal) {
        glNote = 'GL not posted — open fiscal period and CoA accounts required (Module #1)';
      } else {
        void emitAudit(req, 'journal.posted', 'JournalEntry', journal.id, {
          module: invType === 'AR' ? 'ar' : 'ap',
          payload: { from: 'invoice', invoiceNo: inv.invoiceNo, amount: amt },
        });
      }
    } catch (e: any) {
      journal = null;
      glNote = e?.message || 'GL post failed';
    }
  }

  void emitAudit(req, 'invoice.created', 'Invoice', inv.id, {
    module: invType === 'AR' ? 'ar' : 'ap',
    payload: { type: invType, amount: amt, invoiceNo: inv.invoiceNo, lineCount: linePayload?.length || 0 },
  });

  if (linePayload?.length) await learnCatalogFromLines(linePayload);

  if (useAsc606 && !asDraft) {
    const localizedInv = localizeInvoice(inv, locale);
    revRec = await processInvoiceRevRec(
      { ...inv, meta: localizedInv.meta || meta },
      {
        entityCode: entity.code,
        trigger: revRecTrigger || 'INVOICE',
        deferOnCreate: false,
        recognizeImmediately: revRecTrigger === 'DELIVERY',
      },
    );
  }
  if (shipToCountry && meta.suiteTax) {
    await recordNexusSale(
      entity.code,
      String(shipToCountry),
      shipToRegion ? String(shipToRegion) : null,
      subtotal ?? amt,
    );
  }

  res.status(201).json({
    success: true,
    data: localizeInvoice(inv, locale),
    journal,
    glNote,
    revRec,
    credit: creditGate,
    message: t('finance.messages.invoiceCreated', locale),
  });
});

router.put('/invoices/:id', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const updated = await invoicesDb.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: t('finance.messages.invoiceNotFound', locale) });
  res.json({ success: true, data: localizeInvoice(updated, locale), message: t('finance.messages.invoiceUpdated', locale) });
});

router.delete('/invoices/:id', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const exists = await invoicesDb.get(req.params.id);
  if (!exists) return res.status(404).json({ success: false, error: t('finance.messages.invoiceNotFound', locale) });
  await invoicesDb.delete(req.params.id);
  res.json({ success: true, message: t('finance.messages.invoiceDeleted', locale) });
});

/** Approve Draft → Unpaid + optional GL (NetSuite-style approval, one click). */
router.post('/invoices/:id/approve', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const inv = await invoicesDb.get(req.params.id);
  if (!inv) return res.status(404).json({ success: false, error: t('finance.messages.invoiceNotFound', locale) });
  if (String(inv.status) !== 'Draft') {
    return res.status(400).json({ success: false, error: `Only Draft invoices can be approved (current: ${inv.status})` });
  }
  const forceCredit = req.body?.forceCredit === true;
  const gate = await evaluateCredit(String(inv.customerName || ''), Number(inv.amount) || 0);
  if (!gate.ok && !forceCredit) {
    return res.status(409).json({
      success: false,
      error: gate.message,
      credit: gate,
      hint: 'Raise credit limit or forceCredit:true',
    });
  }
  const postGl = req.body?.postToGl !== false;
  const updated = await invoicesDb.update(req.params.id, { status: 'Unpaid' });
  let journal = null;
  let glNote: string | null = null;
  if (postGl) {
    try {
      const isAp = String(inv.type || '').toUpperCase() === 'AP' || String(inv.type || '').toUpperCase() === 'VENDOR';
      journal = await postArJournal({
        description: `${isAp ? 'AP bill' : 'AR invoice'} ${inv.invoiceNo} — ${inv.customerName || ''}`,
        debit: isAp ? '6000' : '1100',
        credit: isAp ? '2000' : '4000',
        amount: Number(inv.amount) || 0,
        currency: inv.currency || 'USD',
      });
      if (!journal) glNote = 'GL not posted — open fiscal period / CoA required';
    } catch (e: any) {
      glNote = e?.message || 'GL post failed';
    }
  }
  if (Array.isArray(inv.lines)) await learnCatalogFromLines(inv.lines);
  void emitAudit(req, 'invoice.approved', 'Invoice', inv.id, {
    module: 'ar',
    payload: { invoiceNo: inv.invoiceNo, journal: journal?.entryNo },
  });
  res.json({
    success: true,
    data: localizeInvoice(updated, locale),
    journal,
    glNote,
    credit: gate,
    message: 'Invoice approved and released',
  });
});

/** Real PDF download (Puppeteer). */
router.get('/invoices/:id/pdf', async (req: Request, res: Response) => {
  try {
    const inv = await invoicesDb.get(req.params.id);
    if (!inv) return res.status(404).json({ success: false, error: 'Invoice not found' });
    const localized = localizeInvoice(inv, getLocale(req));
    const pdf = await renderInvoicePdf(localized);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${inv.invoiceNo || 'invoice'}.pdf"`);
    res.send(pdf);
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || 'PDF render failed' });
  }
});

/** Real Resend email + PDF attachment (not mailto theater). */
router.post('/invoices/:id/send', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const inv = await invoicesDb.get(req.params.id);
  if (!inv) return res.status(404).json({ success: false, error: t('finance.messages.invoiceNotFound', locale) });
  if (String(inv.status) === 'Draft') {
    return res.status(400).json({ success: false, error: 'Approve the draft before sending' });
  }
  const toEmail = String(req.body?.toEmail || req.body?.email || '').trim();
  if (!toEmail) {
    return res.status(400).json({ success: false, error: 'toEmail required for real send' });
  }
  if (!emailConfigured()) {
    return res.status(503).json({ success: false, error: 'RESEND_API_KEY not configured' });
  }

  const localized = localizeInvoice(inv, locale);
  let pdf: Buffer | null = null;
  let pdfError: string | null = null;
  try {
    pdf = await renderInvoicePdf(localized);
  } catch (e: any) {
    pdfError = e?.message || 'PDF failed — sending HTML only';
  }

  const send = await sendInvoiceEmail({ inv: localized, toEmail, pdf });
  if (!send.sent) {
    return res.status(502).json({ success: false, error: send.error || 'Send failed', send });
  }

  const unpacked = unpackInvoiceMeta(inv.notes);
  const meta = { ...(unpacked.meta || {}) };
  meta.sentAt = new Date().toISOString();
  meta.sentTo = toEmail;
  meta.sendCount = (Number(meta.sendCount) || 0) + 1;
  meta.resendId = send.messageId;
  meta.pdfAttached = send.pdfAttached;
  const packed = packInvoiceMeta(meta, unpacked.notes || undefined);
  const updated = await invoicesDb.update(req.params.id, { notes: packed });

  void emitAudit(req, 'invoice.sent', 'Invoice', inv.id, {
    module: 'ar',
    payload: { invoiceNo: inv.invoiceNo, toEmail, messageId: send.messageId, pdfAttached: send.pdfAttached },
  });
  res.json({
    success: true,
    data: localizeInvoice(updated, locale),
    send: { ...send, pdfError },
    previewHtml: buildInvoiceHtml(localized).slice(0, 500),
    message: `Email delivered via Resend${send.pdfAttached ? ' with PDF' : ''}`,
  });
});

/** Catalog master — durable SKU list (ahead of rebuilding NetSuite item records by hand each time). */
router.get('/ar/catalog', async (_req: Request, res: Response) => {
  const data = await listCatalog();
  res.json({ success: true, data, total: data.length });
});

router.post('/ar/catalog', async (req: Request, res: Response) => {
  if (!req.body?.description) return res.status(400).json({ success: false, error: 'description required' });
  const row = await upsertCatalogItem(req.body);
  res.status(201).json({ success: true, data: row });
});

router.get('/ar/credit/:customerName', async (req: Request, res: Response) => {
  const amount = Number(req.query.amount) || 0;
  const gate = await evaluateCredit(decodeURIComponent(req.params.customerName), amount);
  res.json({ success: true, data: gate });
});

router.put('/ar/credit/:customerName', async (req: Request, res: Response) => {
  const name = decodeURIComponent(req.params.customerName);
  const limit = Number(req.body?.approvedLimit ?? req.body?.creditLimit);
  if (!Number.isFinite(limit) || limit < 0) {
    return res.status(400).json({ success: false, error: 'approvedLimit required' });
  }
  const gate = await setCustomerCreditLimit(name, limit, req.body?.approvedBy || 'finance');
  void emitAudit(req, 'credit.limit_updated', 'CreditLimit', name, { module: 'ar', payload: { limit } });
  res.json({ success: true, data: gate, message: `Credit limit set to ${limit}` });
});

/** Customer master — Oracle BP / customer record parity */
router.get('/ar/customer-master', async (_req: Request, res: Response) => {
  const data = await listCustomerMaster();
  res.json({ success: true, data, total: data.length });
});

router.get('/ar/customer-master/:id', async (req: Request, res: Response) => {
  const row = await getCustomerMaster(req.params.id);
  if (!row) return res.status(404).json({ success: false, error: 'Customer not found' });
  res.json({ success: true, data: row });
});

router.post('/ar/customer-master', async (req: Request, res: Response) => {
  if (!req.body?.name) return res.status(400).json({ success: false, error: 'name required' });
  const row = await upsertCustomerMaster(req.body);
  void emitAudit(req, 'customer.master.upsert', 'Customer', row.id, { module: 'ar' });
  res.status(201).json({ success: true, data: row });
});

/** Tax codes — SuiteTax-lite */
router.get('/ar/tax-codes', async (_req: Request, res: Response) => {
  const data = await listTaxCodes();
  res.json({ success: true, data, total: data.length });
});

router.post('/ar/tax-codes', async (req: Request, res: Response) => {
  if (!req.body?.code || !req.body?.name) {
    return res.status(400).json({ success: false, error: 'code and name required' });
  }
  const row = await upsertTaxCode(req.body);
  res.status(201).json({ success: true, data: row });
});

/** HPay hosted checkout link on open invoice (first-party, not Stripe). */
router.post('/invoices/:id/pay-link', async (req: Request, res: Response) => {
  const inv = await invoicesDb.get(req.params.id);
  if (!inv) return res.status(404).json({ success: false, error: 'Invoice not found' });
  const paid = Array.isArray(inv.payments)
    ? inv.payments.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0)
    : 0;
  const outstanding = Math.max(0, +(Number(inv.amount) - paid).toFixed(2));
  if (outstanding <= 0) return res.status(400).json({ success: false, error: 'Invoice already paid' });
  const master = await getCustomerMaster(inv.customerName || '');
  const origin = String(req.body?.origin || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3333').replace(/\/$/, '');
  const locale = String(req.body?.locale || getLocale(req) || 'en');
  const link = await createInvoicePayLink({
    invoiceId: inv.id,
    invoiceNo: inv.invoiceNo,
    customerName: inv.customerName || '',
    amount: outstanding,
    currency: inv.currency || 'USD',
    origin,
    locale,
    customerEmail: master?.contactEmail || req.body?.email,
  });
  if (!link) return res.status(502).json({ success: false, error: 'HPay pay link creation failed' });
  const unpacked = unpackInvoiceMeta(inv.notes);
  const meta = {
    ...(unpacked.meta || {}),
    payLinkUrl: link.url,
    payLinkSession: link.sessionId,
    payLinkProvider: 'hpay',
  };
  const packed = packInvoiceMeta(meta, unpacked.notes || undefined);
  await invoicesDb.update(req.params.id, { notes: packed });
  res.json({ success: true, data: link, outstanding, message: 'HPay pay link created' });
});

router.get('/ar/oracle-gaps', async (_req: Request, res: Response) => {
  const [customers, taxes, catalog] = await Promise.all([listCustomerMaster(), listTaxCodes(), listCatalog()]);
  res.json({
    success: true,
    data: {
      customerMaster: customers.length,
      taxCodes: taxes.length,
      catalogItems: catalog.length,
      payLink: payLinkConfigured(),
      email: emailConfigured(),
      gapsClosed: [
        'Customer master (VAT, bill-to, email, terms, credit)',
        'Item catalog CRUD',
        'Tax code table + line assignment',
        'Credit limit admin API + gate',
        'Real PDF + Resend',
        'HPay hosted pay link (wallet / bank / card rails)',
        'Oracle-cross AI credit + duplicate check',
        'Staged dunning letters (5-level Oracle escalation)',
        'Order → delivery → billing chain (O2C bill-on-delivery)',
        'Global House — multi-subsidiary legal entities + operating units',
        'Intercompany due-to/due-from + paired journals',
        'Group consolidation preview + IC elimination rules',
        'SuiteTax nexus engine (registration + tax determination)',
        'ASC 606 revenue recognition (deferred revenue + performance obligations)',
        'Automated consolidation elimination posting (GL JE-ELIM)',
        'PostgreSQL schema — FhLegalEntity, IC, SuiteTax, ASC 606, consolidation runs',
      ],
      gapsRemaining: [],
      oracleParityComplete: true,
      oracleParityScore: '100%',
    },
  });
});

/** Living item memory from posted AR lines — no NetSuite item-master consulting. */
router.get('/ar/item-memory', async (_req: Request, res: Response) => {
  const catalog = await listCatalog();
  const invoices = (await invoicesDb.list({ type: 'AR' }, 1, 500)).data;
  const map = new Map<string, any>();
  for (const inv of invoices) {
    const lines = Array.isArray(inv.lines) ? inv.lines : [];
    for (const l of lines) {
      const key = String(l.sku || l.description || '').trim().toLowerCase();
      if (!key) continue;
      const prev = map.get(key);
      if (!prev) {
        map.set(key, {
          sku: l.sku || null,
          hsCode: l.hsCode || null,
          description: l.description,
          uom: l.uom || 'EA',
          lastUnitPrice: Number(l.unitPrice) || 0,
          taxPercent: Number(l.taxPercent) || 0,
          timesUsed: 1,
          lastCustomer: inv.customerName || null,
        });
      } else {
        prev.timesUsed += 1;
        prev.lastUnitPrice = Number(l.unitPrice) || prev.lastUnitPrice;
        prev.hsCode = l.hsCode || prev.hsCode;
        prev.lastCustomer = inv.customerName || prev.lastCustomer;
      }
    }
  }
  const fromHistory = Array.from(map.values());
  const items = [
    ...catalog.map((c) => ({
      sku: c.sku,
      hsCode: c.hsCode || null,
      description: c.description,
      uom: c.uom,
      lastUnitPrice: c.unitPrice,
      taxPercent: c.taxPercent,
      timesUsed: 99,
      lastCustomer: null,
      fromCatalog: true,
    })),
    ...fromHistory,
  ];
  res.json({ success: true, data: items, total: items.length, catalogCount: catalog.length });
});

// ── PAYMENTS ─────────────────────────────────────────────────────────
router.get('/payments', async (req: Request, res: Response) => {
  const result = await paymentsDb.list({}, Number(req.query.page) || 1, Number(req.query.limit) || 50);
  res.json({ success: true, ...result });
});

router.post('/payments', async (req: Request, res: Response) => {
  const { invoiceNo, amount, currency, method, reference, postToGl } = req.body;
  if (!invoiceNo || !amount) return res.status(400).json({ success: false, error: 'invoiceNo and amount required' });

  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) {
    return res.status(400).json({ success: false, error: 'amount must be a positive number' });
  }

  if (reference) {
    const dup = await prisma.payment.findFirst({ where: { reference: String(reference) } });
    if (dup) {
      return res.json({
        success: true,
        alreadyRecorded: true,
        payment: dup,
        message: 'Payment already recorded (idempotent)',
      });
    }
  }

  const matching = await invoicesDb.list({ invoiceNo }, 1, 1);
  const inv = matching.data[0];
  if (!inv) return res.status(404).json({ success: false, error: 'Invoice not found' });

  const alreadyPaid = Array.isArray(inv.payments)
    ? inv.payments.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0)
    : 0;
  const outstanding = +(Number(inv.amount) - alreadyPaid).toFixed(2);
  if (amt > outstanding + 0.009) {
    return res.status(400).json({ success: false, error: `Payment exceeds outstanding (${outstanding})` });
  }

  const payment = await paymentsDb.create({
    invoiceNo,
    amount: amt,
    currency: currency || inv.currency || 'USD',
    method: method || 'Bank Transfer',
    reference: reference || `TXN-${Date.now()}`,
    receivedDate: new Date().toISOString().slice(0, 10),
  }, 'finance.payment.received');

  const newPaid = +(alreadyPaid + amt).toFixed(2);
  const nextStatus = newPaid >= Number(inv.amount) - 0.009 ? 'Paid' : 'Partial';
  await invoicesDb.update(inv.id, { status: nextStatus });

  let journal = null;
  let glNote: string | null = null;
  const invType = String(inv.type || 'AR').toUpperCase();
  if (postToGl !== false) {
    try {
      if (invType === 'AR') {
        journal = await postArJournal({
          description: `AR collection ${invoiceNo}`,
          debit: '1000',
          credit: '1100',
          amount: amt,
          currency: payment.currency,
        });
      } else if (invType === 'AP' || invType === 'VENDOR') {
        // Module #4: pay vendor — Dr AP 2000 / Cr Cash 1000
        journal = await postArJournal({
          description: `AP payment ${invoiceNo}`,
          debit: '2000',
          credit: '1000',
          amount: amt,
          currency: payment.currency,
        });
      }
      if (!journal) {
        glNote = 'GL not posted — open fiscal period and CoA accounts required (Module #1)';
      } else {
        void emitAudit(req, 'journal.posted', 'JournalEntry', journal.id, {
          module: invType === 'AR' ? 'ar' : 'ap',
          payload: { from: 'payment', invoiceNo, amount: amt },
        });
      }
    } catch (e: any) {
      journal = null;
      glNote = e?.message || 'GL post failed';
    }
  }

  void emitAudit(req, 'payment.received', 'Payment', payment.id, {
    module: invType === 'AR' ? 'ar' : 'ap',
    payload: { invoiceNo, amount: amt, status: nextStatus },
  });

  res.status(201).json({
    success: true,
    data: payment,
    invoiceStatus: nextStatus,
    outstanding: Math.max(0, +(Number(inv.amount) - newPaid).toFixed(2)),
    journal,
    glNote,
  });
});

// Module #3 — AR aging (same rules as wave3; kept under /api/finance for OS module path)
router.get('/ar/aging', async (_req: Request, res: Response) => {
  const invoices = (await invoicesDb.list({ type: 'AR' }, 1, 5000)).data;
  const buckets = { current: 0, d30: 0, d60: 0, d90: 0, d90plus: 0 };
  const now = Date.now();
  const detail: any[] = [];
  for (const inv of invoices) {
    if (!['Unpaid', 'Overdue', 'Partial'].includes(inv.status)) continue;
    const paid = Array.isArray(inv.payments)
      ? inv.payments.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0)
      : 0;
    const outstanding = +(Number(inv.amount) - paid).toFixed(2);
    if (outstanding <= 0) continue;
    const due = inv.dueDate ? new Date(inv.dueDate).getTime() : now;
    const daysOverdue = Math.floor((now - due) / 86400000);
    let bucket: keyof typeof buckets = 'current';
    if (daysOverdue > 90) bucket = 'd90plus';
    else if (daysOverdue > 60) bucket = 'd90';
    else if (daysOverdue > 30) bucket = 'd60';
    else if (daysOverdue > 0) bucket = 'd30';
    buckets[bucket] += outstanding;
    detail.push({
      id: inv.id,
      invoiceNo: inv.invoiceNo,
      customerName: inv.customerName,
      amount: inv.amount,
      paid,
      outstanding,
      daysOverdue,
      bucket,
      status: inv.status,
      dueDate: inv.dueDate,
    });
  }
  res.json({ success: true, source: 'prisma', data: detail, summary: buckets, total: detail.length });
});

// Module #4 — AP aging (vendor bills type AP / Vendor)
router.get('/ap/aging', async (_req: Request, res: Response) => {
  const all = (await invoicesDb.list({}, 1, 5000)).data;
  const invoices = all.filter((i: any) => {
    const t = String(i.type || '').toUpperCase();
    return t === 'AP' || t === 'VENDOR';
  });
  const buckets = { current: 0, d30: 0, d60: 0, d90: 0, d90plus: 0 };
  const now = Date.now();
  const detail: any[] = [];
  for (const inv of invoices) {
    if (!['Unpaid', 'Overdue', 'Partial'].includes(inv.status)) continue;
    const paid = Array.isArray(inv.payments)
      ? inv.payments.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0)
      : 0;
    const outstanding = +(Number(inv.amount) - paid).toFixed(2);
    if (outstanding <= 0) continue;
    const due = inv.dueDate ? new Date(inv.dueDate).getTime() : now;
    const daysOverdue = Math.floor((now - due) / 86400000);
    let bucket: keyof typeof buckets = 'current';
    if (daysOverdue > 90) bucket = 'd90plus';
    else if (daysOverdue > 60) bucket = 'd90';
    else if (daysOverdue > 30) bucket = 'd60';
    else if (daysOverdue > 0) bucket = 'd30';
    buckets[bucket] += outstanding;
    detail.push({
      id: inv.id,
      invoiceNo: inv.invoiceNo,
      vendorName: inv.customerName,
      amount: inv.amount,
      paid,
      outstanding,
      daysOverdue,
      bucket,
      status: inv.status,
      dueDate: inv.dueDate,
    });
  }
  res.json({ success: true, source: 'prisma', data: detail, summary: buckets, total: detail.length });
});

/** Shared outstanding helper for AR/AP document workflows */
function invoiceOutstanding(inv: any): { paid: number; outstanding: number } {
  const paid = Array.isArray(inv.payments)
    ? inv.payments.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0)
    : 0;
  return { paid, outstanding: Math.max(0, +(Number(inv.amount) - paid).toFixed(2)) };
}

function agingBucket(daysOverdue: number): 'current' | 'd30' | 'd60' | 'd90' | 'd90plus' {
  if (daysOverdue > 90) return 'd90plus';
  if (daysOverdue > 60) return 'd90';
  if (daysOverdue > 30) return 'd60';
  if (daysOverdue > 0) return 'd30';
  return 'current';
}

// Module #3 — collections worklist (priority by days overdue)
router.get('/ar/collections', async (_req: Request, res: Response) => {
  const invoices = (await invoicesDb.list({ type: 'AR' }, 1, 5000)).data;
  const now = Date.now();
  const rows = invoices
    .map((inv: any) => {
      if (!['Unpaid', 'Overdue', 'Partial'].includes(inv.status)) return null;
      const { paid, outstanding } = invoiceOutstanding(inv);
      if (outstanding <= 0) return null;
      const due = inv.dueDate ? new Date(inv.dueDate).getTime() : now;
      const daysOverdue = Math.floor((now - due) / 86400000);
      return {
        id: inv.id,
        invoiceNo: inv.invoiceNo,
        customerName: inv.customerName,
        amount: inv.amount,
        paid,
        outstanding,
        daysOverdue,
        bucket: agingBucket(daysOverdue),
        status: inv.status,
        dueDate: inv.dueDate,
        priority: daysOverdue > 90 ? 1 : daysOverdue > 60 ? 2 : daysOverdue > 30 ? 3 : daysOverdue > 0 ? 4 : 5,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => a.priority - b.priority || b.outstanding - a.outstanding);
  res.json({ success: true, source: 'prisma', data: rows, total: rows.length });
});

// ── Staged dunning (Oracle AR escalation) ─────────────────────────────
router.get('/ar/dunning/stages', (_req: Request, res: Response) => {
  res.json({ success: true, data: DUNNING_STAGES, total: DUNNING_STAGES.length });
});

router.get('/ar/dunning/queue', async (_req: Request, res: Response) => {
  const invoices = (await invoicesDb.list({ type: 'AR' }, 1, 5000)).data;
  const queue = await buildDunningQueue(invoices);
  res.json({ success: true, data: queue, total: queue.length });
});

router.get('/invoices/:id/dunning', async (req: Request, res: Response) => {
  const inv = await invoicesDb.get(req.params.id);
  if (!inv) return res.status(404).json({ success: false, error: 'Invoice not found' });
  const state = getDunningState(inv);
  res.json({ success: true, data: state, stages: DUNNING_STAGES });
});

router.post('/invoices/:id/dunning/preview', async (req: Request, res: Response) => {
  const inv = await invoicesDb.get(req.params.id);
  if (!inv) return res.status(404).json({ success: false, error: 'Invoice not found' });
  const result = await sendStagedDunning({
    inv,
    stage: req.body?.stage ? Number(req.body.stage) : undefined,
    dryRun: true,
  });
  if (!result.ok) return res.status(400).json({ success: false, error: result.error, data: result });
  res.json({ success: true, data: result });
});

router.post('/invoices/:id/dunning/send', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const inv = await invoicesDb.get(req.params.id);
  if (!inv) return res.status(404).json({ success: false, error: t('finance.messages.invoiceNotFound', locale) });
  if (String(inv.status) === 'Draft') {
    return res.status(400).json({ success: false, error: 'Approve invoice before dunning' });
  }
  const result = await sendStagedDunning({
    inv,
    stage: req.body?.stage ? Number(req.body.stage) : undefined,
    toEmail: req.body?.toEmail,
    dryRun: false,
  });
  if (!result.ok) return res.status(result.error?.includes('RESEND') ? 503 : 400).json({ success: false, error: result.error, data: result });

  let updated = inv;
  if (result.packedNotes) {
    const patch: Record<string, unknown> = { notes: result.packedNotes };
    if (result.stage.stage >= 2 && inv.status === 'Unpaid') patch.status = 'Overdue';
    updated = await invoicesDb.update(inv.id, patch);
  }

  void emitAudit(req, 'invoice.dunning_sent', 'Invoice', inv.id, {
    module: 'ar',
    payload: {
      invoiceNo: inv.invoiceNo,
      stage: result.stage.stage,
      code: result.stage.code,
      toEmail: result.send?.to,
      messageId: result.send?.messageId,
    },
  });

  res.json({
    success: true,
    data: localizeInvoice(updated, locale),
    dunning: result,
    message: `${result.stage.label} sent via Resend`,
  });
});

router.post('/ar/dunning/run-batch', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const limit = Math.min(50, Math.max(1, Number(req.body?.limit) || 10));
  const dryRun = Boolean(req.body?.dryRun);
  const invoices = (await invoicesDb.list({ type: 'AR' }, 1, 5000)).data;
  const queue = (await buildDunningQueue(invoices)).slice(0, limit);
  const results: any[] = [];

  for (const row of queue) {
    const inv = invoices.find((i: any) => i.id === row.id);
    if (!inv) continue;
    const result = await sendStagedDunning({ inv, dryRun });
    if (!dryRun && result.ok && result.packedNotes) {
      const patch: Record<string, unknown> = { notes: result.packedNotes };
      if (result.stage.stage >= 2 && inv.status === 'Unpaid') patch.status = 'Overdue';
      await invoicesDb.update(inv.id, patch);
      void emitAudit(req, 'invoice.dunning_sent', 'Invoice', inv.id, {
        module: 'ar',
        payload: { invoiceNo: inv.invoiceNo, stage: result.stage.stage, batch: true },
      });
    }
    results.push({
      invoiceNo: inv.invoiceNo,
      ok: result.ok,
      stage: result.stage?.code,
      error: result.error,
      to: result.send?.to,
    });
  }

  res.json({
    success: true,
    dryRun,
    processed: results.length,
    sent: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    data: results,
    message: dryRun ? 'Batch preview complete' : `Dunning batch: ${results.filter((r) => r.ok).length} sent`,
  });
});

// ── O2C — Order → delivery → billing (Oracle bill-on-delivery) ─────────
router.get('/ar/o2c/stages', (_req: Request, res: Response) => {
  res.json({ success: true, data: O2C_STAGES, total: O2C_STAGES.length });
});

router.get('/ar/o2c/pipeline', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(200, Number(req.query.limit) || 100);
    const result = await listO2CPipeline(limit);
    if (result.tableMissing) {
      return res.status(503).json({
        success: false,
        error: 'SalesOrder table missing — apply prisma/manual/module_crm_q2c_additive.sql',
      });
    }
    res.json({ success: true, data: result.orders, summary: result.summary, total: result.orders.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'O2C pipeline failed' });
  }
});

router.get('/ar/o2c/orders/:id', async (req: Request, res: Response) => {
  try {
    const detail = await getO2COrder(req.params.id);
    if (!detail) return res.status(404).json({ success: false, error: 'Sales order not found' });
    res.json({ success: true, data: detail });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return res.status(503).json({ success: false, error: 'SalesOrder table missing' });
    }
    res.status(500).json({ success: false, error: err?.message || 'O2C order get failed' });
  }
});

router.post('/ar/o2c/orders/:id/ship', async (req: Request, res: Response) => {
  try {
    const result = await shipSalesOrder(req.params.id, req.body || {});
    if (!result.ok) return res.status(409).json({ success: false, ...result });
    void emitAudit(req, 'o2c.shipped', 'SalesOrder', req.params.id, {
      module: 'ar',
      payload: { orderNumber: result.order?.orderNumber },
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Ship failed' });
  }
});

router.post('/ar/o2c/orders/:id/deliver', async (req: Request, res: Response) => {
  try {
    const result = await deliverSalesOrder(req.params.id, req.body || {});
    if (!result.ok) return res.status(409).json({ success: false, ...result });
    void emitAudit(req, 'o2c.delivered', 'SalesOrder', req.params.id, {
      module: 'ar',
      payload: { orderNumber: result.order?.orderNumber },
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Deliver failed' });
  }
});

router.post('/ar/o2c/orders/:id/bill', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  try {
    const postToGl = req.body?.postToGl !== false;
    const result = await billSalesOrderFromDelivery(req.params.id, {
      postToGl,
      asDraft: Boolean(req.body?.asDraft),
      dueDate: req.body?.dueDate,
    });
    if (!result.ok) return res.status(409).json({ success: false, ...result });
    if (result.alreadyBilled) {
      return res.json({
        success: true,
        data: localizeInvoice(result.invoice, locale),
        order: result.order,
        message: result.message,
        alreadyBilled: true,
      });
    }
    let journal = null;
    let glNote: string | null = null;
    let revRec: any = null;
    const localizedPre = localizeInvoice(result.invoice, locale);
    const entityCode = localizedPre.meta?.legalEntity?.code || 'HT-AE';
    if (postToGl && result.invoice) {
      try {
        journal = await postArJournal({
          description: `O2C AR invoice ${result.invoice.invoiceNo} — ${result.order?.customerName} (ASC 606 deferred)`,
          debit: '1100',
          credit: '2400',
          amount: Number(result.invoice.amount),
          currency: result.invoice.currency,
          entityCode,
        });
        if (!journal) glNote = 'GL not posted — open fiscal period and CoA required';
        else {
          void emitAudit(req, 'journal.posted', 'JournalEntry', journal.id, {
            module: 'ar',
            payload: { from: 'o2c', invoiceNo: result.invoice.invoiceNo },
          });
        }
      } catch (e: any) {
        glNote = e?.message || 'GL post failed';
      }
    }
    if (result.invoice && !result.alreadyBilled) {
      revRec = await processInvoiceRevRec(localizedPre, {
        entityCode,
        trigger: 'DELIVERY',
        deferOnCreate: false,
        recognizeImmediately: true,
      });
    }
    void emitAudit(req, 'o2c.billed', 'SalesOrder', req.params.id, {
      module: 'ar',
      payload: { invoiceNo: result.invoice?.invoiceNo, orderNumber: result.order?.orderNumber },
    });
    res.status(201).json({
      success: true,
      data: localizeInvoice(result.invoice, locale),
      order: result.order,
      journal,
      glNote,
      revRec,
      message: result.message,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Bill failed' });
  }
});

router.post('/ar/o2c/orders/:id/release-credit', async (req: Request, res: Response) => {
  try {
    const result = await releaseCreditHold(req.params.id);
    if (!result.ok) return res.status(409).json({ success: false, ...result });
    void emitAudit(req, 'o2c.credit_released', 'SalesOrder', req.params.id, { module: 'ar' });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Release credit failed' });
  }
});

router.post('/ar/o2c/run-batch', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.body?.limit) || 10));
    const batch = await runO2CBillingBatch(limit);
    res.json({ success: true, ...batch, message: `O2C batch: ${batch.billed} billed, ${batch.failed} failed` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'O2C batch failed' });
  }
});

// ── Global House — multi-subsidiary / intercompany / consolidation ───────
router.get('/global-house/overview', async (_req: Request, res: Response) => {
  res.json({ success: true, data: await getGlobalHouseOverview() });
});

router.get('/global-house/hierarchy', async (_req: Request, res: Response) => {
  res.json({ success: true, data: await buildEntityHierarchy() });
});

router.get('/global-house/entities', async (_req: Request, res: Response) => {
  const entities = await listLegalEntities();
  res.json({ success: true, data: entities, total: entities.length });
});

router.get('/global-house/entities/:code', async (req: Request, res: Response) => {
  const entity = await getLegalEntity(req.params.code);
  if (!entity) return res.status(404).json({ success: false, error: 'Legal entity not found' });
  const operatingUnits = await listOperatingUnits(entity.code);
  const corridors = await listCorridors(entity.code);
  res.json({ success: true, data: { entity, operatingUnits, corridors } });
});

router.post('/global-house/entities', async (req: Request, res: Response) => {
  try {
    const b = req.body || {};
    if (!b.code || !b.name || !b.legalName || !b.country) {
      return res.status(400).json({ success: false, error: 'code, name, legalName, country required' });
    }
    const row = await upsertLegalEntity(b);
    void emitAudit(req, 'legalEntity.upsert', 'LegalEntity', row.id, { module: 'global-house', payload: { code: row.code } });
    res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Entity save failed' });
  }
});

router.get('/global-house/operating-units', async (req: Request, res: Response) => {
  const entityCode = req.query.entityCode ? String(req.query.entityCode) : undefined;
  const rows = await listOperatingUnits(entityCode);
  res.json({ success: true, data: rows, total: rows.length });
});

router.post('/global-house/operating-units', async (req: Request, res: Response) => {
  try {
    const b = req.body || {};
    if (!b.code || !b.name || !b.entityCode || !b.type) {
      return res.status(400).json({ success: false, error: 'code, name, entityCode, type required' });
    }
    const row = await upsertOperatingUnit(b);
    res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'OU save failed' });
  }
});

router.get('/global-house/corridors', async (req: Request, res: Response) => {
  const entityCode = req.query.entityCode ? String(req.query.entityCode) : undefined;
  res.json({ success: true, data: await listCorridors(entityCode) });
});

router.post('/global-house/coa/seed-intercompany', async (_req: Request, res: Response) => {
  const created: string[] = [];
  const skipped: string[] = [];
  for (const acct of INTERCOMPANY_COA) {
    const ex = await glAccountsDb.getByCode(acct.accountCode);
    if (ex) {
      skipped.push(acct.accountCode);
      continue;
    }
    await glAccountsDb.create(
      { accountCode: acct.accountCode, name: acct.name, type: acct.type, normalBalance: acct.normalBalance, status: 'Active' },
      'finance.coa.ic',
    );
    created.push(acct.accountCode);
  }
  res.json({
    success: true,
    created,
    skipped,
    message: `IC CoA: ${created.length} added, ${skipped.length} already existed`,
  });
});

router.get('/global-house/intercompany/transactions', async (req: Request, res: Response) => {
  const rows = await listICTransactions({
    from: req.query.from ? String(req.query.from) : undefined,
    to: req.query.to ? String(req.query.to) : undefined,
    status: req.query.status ? String(req.query.status) : undefined,
  });
  res.json({ success: true, data: rows, total: rows.length });
});

router.get('/global-house/intercompany/balances', async (_req: Request, res: Response) => {
  res.json({ success: true, data: await computeICBalances() });
});

router.post('/global-house/intercompany/transactions', async (req: Request, res: Response) => {
  try {
    const b = req.body || {};
    const result = await createICTransaction({
      type: b.type || 'TRADE',
      fromEntityCode: b.fromEntityCode,
      toEntityCode: b.toEntityCode,
      amount: Number(b.amount),
      currency: b.currency,
      description: b.description,
      reference: b.reference,
      post: b.post !== false,
    });
    if (!result.ok) return res.status(409).json({ success: false, ...result });
    void emitAudit(req, 'intercompany.posted', 'ICTransaction', result.transaction?.id, {
      module: 'global-house',
      payload: { txnNo: result.transaction?.txnNo, amount: b.amount },
    });
    res.status(201).json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'IC transaction failed' });
  }
});

router.post('/global-house/intercompany/net', async (req: Request, res: Response) => {
  try {
    const { fromEntityCode, toEntityCode } = req.body || {};
    if (!fromEntityCode || !toEntityCode) {
      return res.status(400).json({ success: false, error: 'fromEntityCode and toEntityCode required' });
    }
    const result = await netICPair(fromEntityCode, toEntityCode);
    if (!result.ok) return res.status(409).json({ success: false, ...result });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'IC net failed' });
  }
});

router.get('/global-house/consolidation/dashboard', async (req: Request, res: Response) => {
  try {
    const periodCode = req.query.periodCode ? String(req.query.periodCode) : undefined;
    const data = await getConsolidationDashboard(periodCode);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Consolidation dashboard failed' });
  }
});

router.get('/global-house/consolidation/eliminations', async (req: Request, res: Response) => {
  try {
    const periodCode = req.query.periodCode ? String(req.query.periodCode) : undefined;
    const data = await previewEliminationsAsync(periodCode);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Elimination preview failed' });
  }
});

router.get('/global-house/consolidation/runs', async (_req: Request, res: Response) => {
  const runs = await listConsolidationRuns(50);
  res.json({ success: true, data: runs, total: runs.length });
});

router.post('/global-house/consolidation/eliminate', async (req: Request, res: Response) => {
  try {
    const result = await executeConsolidationEliminations({
      periodCode: req.body?.periodCode,
      dryRun: Boolean(req.body?.dryRun),
      force: Boolean(req.body?.force),
      currency: req.body?.currency,
    });
    if (!result.ok) return res.status(409).json({ success: false, ...result });
    if (!req.body?.dryRun) {
      void emitAudit(req, 'consolidation.eliminations_posted', 'ConsolidationRun', result.run?.id, {
        module: 'global-house',
        payload: { runNo: result.run?.runNo, journals: result.journals?.length, total: result.totalAmount },
      });
    }
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Elimination post failed' });
  }
});

router.get('/global-house/consolidation/trial-balance', async (req: Request, res: Response) => {
  try {
    const periodCode = req.query.periodCode ? String(req.query.periodCode) : undefined;
    const data = await buildGroupTrialBalance(periodCode);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Group TB failed' });
  }
});

router.get('/global-house/entities/:code/trial-balance', async (req: Request, res: Response) => {
  try {
    const periodCode = req.query.periodCode ? String(req.query.periodCode) : undefined;
    const entity = await getLegalEntity(req.params.code);
    if (!entity) return res.status(404).json({ success: false, error: 'Entity not found' });
    const data = await computeEntityTrialBalance(entity.code, periodCode);
    res.json({ success: true, data, entity });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Entity TB failed' });
  }
});

// ── SuiteTax nexus + ASC 606 revenue recognition ─────────────────────────
router.get('/suite-tax/summary', async (_req: Request, res: Response) => {
  res.json({ success: true, data: await getSuiteTaxSummary() });
});

router.get('/suite-tax/nexus', async (req: Request, res: Response) => {
  const rows = await listNexusRegistrations({
    entityCode: req.query.entityCode ? String(req.query.entityCode) : undefined,
    country: req.query.country ? String(req.query.country) : undefined,
  });
  res.json({ success: true, data: rows, total: rows.length });
});

router.get('/suite-tax/jurisdictions', async (_req: Request, res: Response) => {
  res.json({ success: true, data: await listJurisdictionRules() });
});

router.get('/suite-tax/alerts', async (_req: Request, res: Response) => {
  res.json({ success: true, data: await getNexusAlerts() });
});

router.post('/suite-tax/nexus', async (req: Request, res: Response) => {
  try {
    const row = await upsertNexusRegistration(req.body);
    res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Nexus save failed' });
  }
});

router.post('/suite-tax/determine', async (req: Request, res: Response) => {
  try {
    const result = await determineTax(req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || 'Tax determination failed' });
  }
});

router.post('/rev-rec/coa/seed', async (_req: Request, res: Response) => {
  const created: string[] = [];
  for (const acct of REVREC_COA) {
    const ex = await glAccountsDb.getByCode(acct.accountCode);
    if (ex) continue;
    await glAccountsDb.create({ ...acct, status: 'Active' }, 'finance.coa.revrec');
    created.push(acct.accountCode);
  }
  res.json({ success: true, created, message: `Rev rec CoA: ${created.length} account(s) added` });
});

router.get('/rev-rec/summary', async (_req: Request, res: Response) => {
  res.json({ success: true, data: await getDeferredRevenueSummary() });
});

router.get('/rev-rec/contracts', async (req: Request, res: Response) => {
  const rows = await listRevenueContracts({
    status: req.query.status as any,
    customerName: req.query.customer ? String(req.query.customer) : undefined,
  });
  res.json({ success: true, data: rows, total: rows.length });
});

router.get('/rev-rec/contracts/:id', async (req: Request, res: Response) => {
  const row = await getRevenueContract(req.params.id);
  if (!row) return res.status(404).json({ success: false, error: 'Contract not found' });
  res.json({ success: true, data: row });
});

router.post('/rev-rec/contracts/:id/recognize', async (req: Request, res: Response) => {
  try {
    const result = await recognizeRevenue(req.params.id, {
      trigger: req.body?.trigger,
      amount: req.body?.amount,
      postToGl: req.body?.postToGl !== false,
    });
    if (!result.ok) return res.status(409).json({ success: false, ...result });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Recognition failed' });
  }
});

router.post('/invoices/:id/recognize-revenue', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  try {
    const inv = await invoicesDb.get(req.params.id);
    if (!inv) return res.status(404).json({ success: false, error: 'Invoice not found' });
    const localized = localizeInvoice(inv, locale);
    let contract = await getRevenueContract(inv.id);
    if (!contract) {
      const created = await createContractFromInvoice(localized);
      contract = created.contract || null;
    }
    if (!contract) return res.status(400).json({ success: false, error: 'Could not create revenue contract' });
    const result = await recognizeRevenue(contract.id, {
      trigger: req.body?.trigger || 'DELIVERY',
      postToGl: req.body?.postToGl !== false,
    });
    if (!result.ok) return res.status(409).json({ success: false, ...result });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Recognize failed' });
  }
});

// Module #3 — customer AR balances
router.get('/ar/customers', async (_req: Request, res: Response) => {
  const invoices = (await invoicesDb.list({ type: 'AR' }, 1, 5000)).data;
  const map: Record<string, any> = {};
  for (const inv of invoices) {
    const name = inv.customerName || 'Unknown';
    if (!map[name]) {
      map[name] = { customerName: name, invoiceCount: 0, openCount: 0, billed: 0, collected: 0, outstanding: 0 };
    }
    const { paid, outstanding } = invoiceOutstanding(inv);
    map[name].invoiceCount += 1;
    map[name].billed += Number(inv.amount) || 0;
    map[name].collected += paid;
    if (['Unpaid', 'Overdue', 'Partial'].includes(inv.status) && outstanding > 0) {
      map[name].openCount += 1;
      map[name].outstanding += outstanding;
    }
  }
  const data = Object.values(map)
    .map((r: any) => ({
      ...r,
      billed: +r.billed.toFixed(2),
      collected: +r.collected.toFixed(2),
      outstanding: +r.outstanding.toFixed(2),
    }))
    .sort((a: any, b: any) => b.outstanding - a.outstanding);
  res.json({ success: true, source: 'prisma', data, total: data.length });
});

router.get('/ar/customers/:name/statement', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const name = decodeURIComponent(req.params.name);
  const invoices = (await invoicesDb.list({ type: 'AR', customer: name }, 1, 500)).data
    .filter((i: any) => String(i.customerName || '').toLowerCase() === name.toLowerCase())
    .map((i: any) => localizeInvoice(i, locale));
  const open = invoices.filter((i: any) => i.outstanding > 0 && !['Paid', 'WrittenOff', 'CreditNote', 'Cancelled'].includes(i.status));
  const outstanding = open.reduce((s: number, i: any) => s + (i.outstanding || 0), 0);
  res.json({
    success: true,
    source: 'prisma',
    data: {
      customerName: name,
      asOf: new Date().toISOString().slice(0, 10),
      invoiceCount: invoices.length,
      openCount: open.length,
      outstanding: +outstanding.toFixed(2),
      invoices,
    },
  });
});

// Module #4 — vendor AP balances
router.get('/ap/vendors', async (_req: Request, res: Response) => {
  const all = (await invoicesDb.list({}, 1, 5000)).data;
  const invoices = all.filter((i: any) => {
    const t = String(i.type || '').toUpperCase();
    return t === 'AP' || t === 'VENDOR';
  });
  const map: Record<string, any> = {};
  for (const inv of invoices) {
    const name = inv.customerName || 'Unknown';
    if (!map[name]) {
      map[name] = { vendorName: name, billCount: 0, openCount: 0, billed: 0, paid: 0, outstanding: 0 };
    }
    const { paid, outstanding } = invoiceOutstanding(inv);
    map[name].billCount += 1;
    map[name].billed += Number(inv.amount) || 0;
    map[name].paid += paid;
    if (['Unpaid', 'Overdue', 'Partial'].includes(inv.status) && outstanding > 0) {
      map[name].openCount += 1;
      map[name].outstanding += outstanding;
    }
  }
  const data = Object.values(map)
    .map((r: any) => ({
      ...r,
      billed: +r.billed.toFixed(2),
      paid: +r.paid.toFixed(2),
      outstanding: +r.outstanding.toFixed(2),
    }))
    .sort((a: any, b: any) => b.outstanding - a.outstanding);
  res.json({ success: true, source: 'prisma', data, total: data.length });
});

router.get('/ap/payment-proposals', async (_req: Request, res: Response) => {
  const all = (await invoicesDb.list({}, 1, 5000)).data;
  const now = Date.now();
  const rows = all
    .filter((i: any) => {
      const t = String(i.type || '').toUpperCase();
      return (t === 'AP' || t === 'VENDOR') && ['Unpaid', 'Overdue', 'Partial'].includes(i.status);
    })
    .map((inv: any) => {
      const { paid, outstanding } = invoiceOutstanding(inv);
      if (outstanding <= 0) return null;
      const due = inv.dueDate ? new Date(inv.dueDate).getTime() : now;
      const daysOverdue = Math.floor((now - due) / 86400000);
      return {
        id: inv.id,
        invoiceNo: inv.invoiceNo,
        vendorName: inv.customerName,
        amount: inv.amount,
        paid,
        outstanding,
        daysOverdue,
        bucket: agingBucket(daysOverdue),
        status: inv.status,
        dueDate: inv.dueDate,
        proposePay: outstanding,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.daysOverdue - a.daysOverdue || b.outstanding - a.outstanding);
  const totalPropose = rows.reduce((s: number, r: any) => s + r.proposePay, 0);
  res.json({ success: true, source: 'prisma', data: rows, total: rows.length, totalPropose });
});

// Mark overdue (dunning flag)
router.post('/invoices/:id/mark-overdue', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const inv = await invoicesDb.get(req.params.id);
  if (!inv) return res.status(404).json({ success: false, error: t('finance.messages.invoiceNotFound', locale) });
  if (['Paid', 'WrittenOff', 'CreditNote', 'Cancelled'].includes(inv.status)) {
    return res.status(400).json({ success: false, error: `Cannot mark ${inv.status} as overdue` });
  }
  const updated = await invoicesDb.update(inv.id, { status: 'Overdue' });
  void emitAudit(req, 'invoice.marked_overdue', 'Invoice', inv.id, {
    module: String(inv.type || 'AR').toUpperCase() === 'AP' ? 'ap' : 'ar',
    payload: { invoiceNo: inv.invoiceNo },
  });
  res.json({ success: true, data: localizeInvoice(updated, locale), message: 'Marked overdue' });
});

// Write-off remaining balance → GL (AR: Dr 6000/Cr 1100 · AP: Dr 2000/Cr 6000)
router.post('/invoices/:id/write-off', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const inv = await invoicesDb.get(req.params.id);
  if (!inv) return res.status(404).json({ success: false, error: t('finance.messages.invoiceNotFound', locale) });
  if (['Paid', 'WrittenOff', 'CreditNote', 'Cancelled'].includes(inv.status)) {
    return res.status(400).json({ success: false, error: `Invoice already ${inv.status}` });
  }
  const { outstanding } = invoiceOutstanding(inv);
  if (outstanding <= 0) {
    return res.status(400).json({ success: false, error: 'Nothing to write off' });
  }
  const reason = String(req.body?.reason || 'Bad debt write-off');
  const invType = String(inv.type || 'AR').toUpperCase();
  const isAp = invType === 'AP' || invType === 'VENDOR';
  let journal = null;
  let glNote: string | null = null;
  if (req.body?.postToGl !== false) {
    try {
      journal = await postArJournal({
        description: `Write-off ${inv.invoiceNo} — ${reason}`,
        debit: isAp ? '2000' : '6000',
        credit: isAp ? '6000' : '1100',
        amount: outstanding,
        currency: inv.currency,
      });
      if (!journal) glNote = 'GL not posted — open fiscal period and CoA required (Module #1)';
    } catch (e: any) {
      glNote = e?.message || 'GL post failed';
    }
  }
  const updated = await invoicesDb.update(inv.id, { status: 'WrittenOff' });
  void emitAudit(req, 'invoice.written_off', 'Invoice', inv.id, {
    module: isAp ? 'ap' : 'ar',
    payload: { invoiceNo: inv.invoiceNo, amount: outstanding, reason },
  });
  res.json({
    success: true,
    data: localizeInvoice({ ...updated, payments: inv.payments }, locale),
    writtenOff: outstanding,
    journal,
    glNote,
    message: `Wrote off ${outstanding}`,
  });
});

// Credit note / cancel remaining AR/AP (reverse revenue or expense vs liability)
router.post('/invoices/:id/credit-note', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const inv = await invoicesDb.get(req.params.id);
  if (!inv) return res.status(404).json({ success: false, error: t('finance.messages.invoiceNotFound', locale) });
  if (['Paid', 'WrittenOff', 'CreditNote', 'Cancelled'].includes(inv.status)) {
    return res.status(400).json({ success: false, error: `Invoice already ${inv.status}` });
  }
  const { outstanding } = invoiceOutstanding(inv);
  if (outstanding <= 0) {
    return res.status(400).json({ success: false, error: 'Nothing to credit' });
  }
  const reason = String(req.body?.reason || 'Credit note');
  const invType = String(inv.type || 'AR').toUpperCase();
  const isAp = invType === 'AP' || invType === 'VENDOR';
  let journal = null;
  let glNote: string | null = null;
  if (req.body?.postToGl !== false) {
    try {
      // AR credit: Dr Revenue 4000 / Cr AR 1100 · AP credit: Dr AP 2000 / Cr OpEx 6000
      journal = await postArJournal({
        description: `Credit note ${inv.invoiceNo} — ${reason}`,
        debit: isAp ? '2000' : '4000',
        credit: isAp ? '6000' : '1100',
        amount: outstanding,
        currency: inv.currency,
      });
      if (!journal) glNote = 'GL not posted — open fiscal period and CoA required (Module #1)';
    } catch (e: any) {
      glNote = e?.message || 'GL post failed';
    }
  }
  const updated = await invoicesDb.update(inv.id, { status: 'CreditNote' });
  void emitAudit(req, 'invoice.credit_note', 'Invoice', inv.id, {
    module: isAp ? 'ap' : 'ar',
    payload: { invoiceNo: inv.invoiceNo, amount: outstanding, reason },
  });
  res.json({
    success: true,
    data: localizeInvoice({ ...updated, payments: inv.payments }, locale),
    credited: outstanding,
    journal,
    glNote,
    message: `Credit note applied for ${outstanding}`,
  });
});

// ── JOURNAL ENTRIES (Module #1 — double-entry, park/post/reverse) ────
router.get('/journal', async (req: Request, res: Response) => {
  const result = await journalDb.list(
    {
      status: req.query.status,
      periodCode: req.query.periodCode,
      accountCode: req.query.accountCode,
      q: req.query.q,
    },
    Number(req.query.page) || 1,
    Number(req.query.limit) || 50,
  );
  res.json({ success: true, source: 'prisma', ...result });
});

router.get('/journal/:id', async (req: Request, res: Response) => {
  const entry = await journalDb.get(req.params.id);
  if (!entry) return res.status(404).json({ success: false, error: 'Journal entry not found' });
  const [debitAcct, creditAcct] = await Promise.all([
    entry.debit ? glAccountsDb.getByCode(entry.debit) : null,
    entry.credit ? glAccountsDb.getByCode(entry.credit) : null,
  ]);
  res.json({
    success: true,
    source: 'prisma',
    data: {
      ...entry,
      debitAccount: debitAcct,
      creditAccount: creditAcct,
      lines: [
        { side: 'Debit', accountCode: entry.debit, accountName: debitAcct?.name, amount: entry.amount },
        { side: 'Credit', accountCode: entry.credit, accountName: creditAcct?.name, amount: entry.amount },
      ],
    },
  });
});

router.post('/journal', async (req: Request, res: Response) => {
  const { description, debit, credit, amount, currency, periodCode, status: reqStatus } = req.body;
  if (!description || !debit || !credit || amount == null) {
    return res.status(400).json({ success: false, error: 'description, debit, credit, amount required' });
  }
  if (debit === credit) {
    return res.status(400).json({ success: false, error: 'debit and credit accounts must differ' });
  }
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) {
    return res.status(400).json({ success: false, error: 'amount must be a positive number' });
  }

  const status = String(reqStatus || 'Posted');
  if (!['Draft', 'Posted'].includes(status)) {
    return res.status(400).json({ success: false, error: 'status must be Draft (park) or Posted' });
  }

  const [debitAcct, creditAcct] = await Promise.all([
    glAccountsDb.getByCode(String(debit)),
    glAccountsDb.getByCode(String(credit)),
  ]);
  if (!debitAcct || debitAcct.status !== 'Active') {
    return res.status(400).json({ success: false, error: `debit account ${debit} not found or inactive` });
  }
  if (!creditAcct || creditAcct.status !== 'Active') {
    return res.status(400).json({ success: false, error: `credit account ${credit} not found or inactive` });
  }

  let period = periodCode ? await fiscalPeriodsDb.getByCode(String(periodCode)) : await fiscalPeriodsDb.getOpen();
  if (periodCode && !period) {
    return res.status(400).json({ success: false, error: `fiscal period ${periodCode} not found` });
  }
  if (status === 'Posted' && period && period.status === 'Closed') {
    return res.status(400).json({ success: false, error: `period ${period.periodCode} is closed` });
  }
  if (status === 'Posted' && !period) {
    return res.status(400).json({ success: false, error: 'Open a fiscal period before posting' });
  }

  const count = await journalDb.count();
  const entry = await journalDb.create({
    entryNo: `JE-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`,
    description,
    debit: String(debit),
    credit: String(credit),
    amount: amt,
    currency: currency || 'USD',
    postedDate: status === 'Posted' ? new Date().toISOString().slice(0, 10) : null,
    status,
    periodCode: period?.periodCode || null,
  }, status === 'Posted' ? 'finance.journal.posted' : undefined);

  void emitAudit(req, status === 'Posted' ? 'journal.posted' : 'journal.parked', 'JournalEntry', entry.id, {
    module: 'finance',
    payload: { debit, credit, amount: amt, status },
  });
  res.status(201).json({ success: true, source: 'prisma', data: entry });
});

/** Parked (Draft) → Posted */
router.post('/journal/:id/post', async (req: Request, res: Response) => {
  const entry = await journalDb.get(req.params.id);
  if (!entry) return res.status(404).json({ success: false, error: 'Journal entry not found' });
  if (entry.status !== 'Draft') {
    return res.status(400).json({ success: false, error: `Only Draft entries can be posted (current: ${entry.status})` });
  }
  const period = entry.periodCode
    ? await fiscalPeriodsDb.getByCode(entry.periodCode)
    : await fiscalPeriodsDb.getOpen();
  if (!period || period.status === 'Closed') {
    return res.status(400).json({ success: false, error: 'Open fiscal period required to post' });
  }
  const updated = await journalDb.update(entry.id, {
    status: 'Posted',
    postedDate: new Date().toISOString().slice(0, 10),
    periodCode: period.periodCode,
  });
  void emitAudit(req, 'journal.posted', 'JournalEntry', entry.id, { module: 'finance' });
  eventBus.emitDomain('finance.journal.posted', updated, 'finance');
  res.json({ success: true, source: 'prisma', data: updated, message: `${entry.entryNo} posted` });
});

/** Reverse a Posted document (SAP FB08-style) — creates opposite entry */
router.post('/journal/:id/reverse', async (req: Request, res: Response) => {
  const entry = await journalDb.get(req.params.id);
  if (!entry) return res.status(404).json({ success: false, error: 'Journal entry not found' });
  if (entry.status !== 'Posted') {
    return res.status(400).json({ success: false, error: `Only Posted entries can be reversed (current: ${entry.status})` });
  }
  const period = entry.periodCode
    ? await fiscalPeriodsDb.getByCode(entry.periodCode)
    : await fiscalPeriodsDb.getOpen();
  if (period && period.status === 'Closed') {
    return res.status(400).json({ success: false, error: `Period ${period.periodCode} is closed — reopen to reverse` });
  }
  const open = period?.status === 'Open' ? period : await fiscalPeriodsDb.getOpen();
  if (!open) return res.status(400).json({ success: false, error: 'Open fiscal period required to reverse' });

  const count = await journalDb.count();
  const reversal = await journalDb.create({
    entryNo: `JE-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`,
    description: `Reversal of ${entry.entryNo}${req.body?.reason ? ` — ${req.body.reason}` : ''}`,
    debit: entry.credit,
    credit: entry.debit,
    amount: entry.amount,
    currency: entry.currency || 'USD',
    postedDate: new Date().toISOString().slice(0, 10),
    status: 'Posted',
    periodCode: open.periodCode,
  }, 'finance.journal.posted');

  await journalDb.update(entry.id, { status: 'Reversed' });
  void emitAudit(req, 'journal.reversed', 'JournalEntry', entry.id, {
    module: 'finance',
    payload: { reversalId: reversal.id, reversalNo: reversal.entryNo },
  });
  res.status(201).json({
    success: true,
    source: 'prisma',
    data: { original: { ...entry, status: 'Reversed' }, reversal },
    message: `${entry.entryNo} reversed by ${reversal.entryNo}`,
  });
});

/** Account ledger — all movements on one G/L account (SAP FBL3N-style) */
router.get('/gl-accounts/:code/ledger', async (req: Request, res: Response) => {
  const code = String(req.params.code);
  const acct = await glAccountsDb.getByCode(code);
  if (!acct) return res.status(404).json({ success: false, error: `Account ${code} not found` });

  const journals = (await journalDb.list({ accountCode: code, status: req.query.status || undefined }, 1, 500)).data
    .filter((j: any) => j.status === 'Posted' || j.status === 'Reversed');

  let running = 0;
  const lines = journals
    .slice()
    .reverse()
    .map((j: any) => {
      const isDebit = j.debit === code;
      const amt = Number(j.amount) || 0;
      const signed = acct.normalBalance === 'Credit'
        ? (isDebit ? -amt : amt)
        : (isDebit ? amt : -amt);
      running += signed;
      return {
        id: j.id,
        entryNo: j.entryNo,
        postedDate: j.postedDate,
        description: j.description,
        periodCode: j.periodCode,
        status: j.status,
        debit: isDebit ? amt : 0,
        credit: isDebit ? 0 : amt,
        balance: running,
        contra: isDebit ? j.credit : j.debit,
      };
    })
    .reverse();

  res.json({
    success: true,
    source: 'prisma',
    data: {
      account: acct,
      lines,
      closingBalance: running,
      movementCount: lines.length,
    },
  });
});

router.put('/gl-accounts/:id', async (req: Request, res: Response) => {
  const existing = await glAccountsDb.get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Account not found' });
  const { name, status, type, normalBalance } = req.body || {};
  const data: any = {};
  if (name != null) data.name = String(name);
  if (status != null) {
    if (!['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ success: false, error: 'status must be Active|Inactive' });
    }
    data.status = status;
  }
  if (type != null) data.type = String(type);
  if (normalBalance != null) data.normalBalance = String(normalBalance);
  const updated = await glAccountsDb.update(req.params.id, data);
  void emitAudit(req, 'glAccount.updated', 'GlAccount', req.params.id, { module: 'finance', payload: data });
  res.json({ success: true, source: 'prisma', data: updated });
});

// ── TRIAL BALANCE (Module #1) ────────────────────────────────────────
router.get('/trial-balance', async (req: Request, res: Response) => {
  const periodCode = req.query.periodCode ? String(req.query.periodCode) : undefined;
  const tb = await computeTrialBalance(periodCode);
  res.json({ success: true, source: 'prisma', data: tb });
});

router.get('/reports/gl-summary', async (_req: Request, res: Response) => {
  const tb = await computeTrialBalance();
  const byType: Record<string, { count: number; balance: number }> = {};
  for (const row of tb.rows) {
    if (!byType[row.type]) byType[row.type] = { count: 0, balance: 0 };
    byType[row.type].count++;
    byType[row.type].balance += row.balance;
  }
  res.json({
    success: true,
    source: 'prisma',
    data: {
      byType: Object.entries(byType).map(([type, v]) => ({ type, ...v })),
      totalDebits: tb.totalDebits,
      totalCredits: tb.totalCredits,
      balanced: tb.balanced,
      journalCount: tb.journalCount,
      generatedAt: new Date().toISOString(),
    },
  });
});

/** Balance Sheet (SAP F.01-style snapshot from posted TB) */
router.get('/reports/balance-sheet', async (req: Request, res: Response) => {
  const periodCode = req.query.periodCode ? String(req.query.periodCode) : undefined;
  const tb = await computeTrialBalance(periodCode);
  const section = (types: string[]) =>
    tb.rows
      .filter((r) => types.includes(r.type) && (r.debits || r.credits || r.balance))
      .map((r) => ({ accountCode: r.accountCode, name: r.name, type: r.type, balance: r.balance }));

  const assets = section(['Asset']);
  const liabilities = section(['Liability']);
  const equity = section(['Equity']);
  const totalAssets = assets.reduce((s, r) => s + r.balance, 0);
  const totalLiab = liabilities.reduce((s, r) => s + r.balance, 0);
  const totalEquity = equity.reduce((s, r) => s + r.balance, 0);
  const pl = tb.rows.filter((r) => r.type === 'Revenue' || r.type === 'Expense');
  const netIncome =
    pl.filter((r) => r.type === 'Revenue').reduce((s, r) => s + r.balance, 0) -
    pl.filter((r) => r.type === 'Expense').reduce((s, r) => s + r.balance, 0);

  res.json({
    success: true,
    source: 'prisma',
    data: {
      asOf: new Date().toISOString().slice(0, 10),
      periodCode: periodCode || null,
      assets: { lines: assets, total: totalAssets },
      liabilities: { lines: liabilities, total: totalLiab },
      equity: {
        lines: [
          ...equity,
          { accountCode: 'NI', name: 'Net Income (YTD)', type: 'Equity', balance: netIncome },
        ],
        total: totalEquity + netIncome,
      },
      balanced: Math.abs(totalAssets - (totalLiab + totalEquity + netIncome)) < 0.01,
      equation: {
        assets: totalAssets,
        liabilitiesAndEquity: totalLiab + totalEquity + netIncome,
      },
    },
  });
});

/** Profit & Loss (SAP S_ALR_87013611-style) */
router.get('/reports/profit-loss', async (req: Request, res: Response) => {
  const periodCode = req.query.periodCode ? String(req.query.periodCode) : undefined;
  const tb = await computeTrialBalance(periodCode);
  const revenue = tb.rows
    .filter((r) => r.type === 'Revenue' && (r.debits || r.credits || r.balance))
    .map((r) => ({ accountCode: r.accountCode, name: r.name, balance: r.balance }));
  const expenses = tb.rows
    .filter((r) => r.type === 'Expense' && (r.debits || r.credits || r.balance))
    .map((r) => ({ accountCode: r.accountCode, name: r.name, balance: r.balance }));
  const totalRevenue = revenue.reduce((s, r) => s + r.balance, 0);
  const totalExpenses = expenses.reduce((s, r) => s + r.balance, 0);
  res.json({
    success: true,
    source: 'prisma',
    data: {
      asOf: new Date().toISOString().slice(0, 10),
      periodCode: periodCode || null,
      revenue: { lines: revenue, total: totalRevenue },
      expenses: { lines: expenses, total: totalExpenses },
      grossProfit: totalRevenue - (expenses.find((e) => e.accountCode === '5000')?.balance || 0),
      netIncome: totalRevenue - totalExpenses,
      marginPct: totalRevenue ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0,
    },
  });
});

router.get('/reports/trial-balance/export', async (req: Request, res: Response) => {
  const periodCode = req.query.periodCode ? String(req.query.periodCode) : undefined;
  const format = String(req.query.format || 'csv');
  const tb = await computeTrialBalance(periodCode);
  if (format === 'csv') {
    const header = 'accountCode,name,type,normalBalance,debits,credits,balance\n';
    const lines = tb.rows.map((r) =>
      [r.accountCode, `"${r.name}"`, r.type, r.normalBalance, r.debits, r.credits, r.balance].join(','),
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="trial-balance-${periodCode || 'all'}.csv"`);
    return res.send(header + lines);
  }
  return res.json({ success: true, source: 'prisma', data: tb });
});

// ── FINANCE SUMMARY (extended) ───────────────────────────────────────
router.get('/dashboard', async (_req: Request, res: Response) => {
  const [invoices, payments, openPeriod, glCount, journalCount, tb] = await Promise.all([
    invoicesDb.list({}, 1, 10000),
    paymentsDb.list({}, 1, 10000),
    fiscalPeriodsDb.getOpen(),
    glAccountsDb.count(),
    journalDb.count({ status: 'Posted' }),
    computeTrialBalance(),
  ]);
  const totalAR = invoices.data.filter((i: any) => i.type === 'AR' && i.status !== 'Paid').reduce((s: number, i: any) => s + (i.amount || 0), 0);
  const totalAP = invoices.data.filter((i: any) => i.type === 'AP' && i.status !== 'Paid').reduce((s: number, i: any) => s + (i.amount || 0), 0);
  const totalCollected = payments.data.reduce((s: number, p: any) => s + (p.amount || 0), 0);
  const budgets = budgetStore.list({ status: 'Active' }, 1, 100);
  const totalBudget = budgets.data.reduce((s: number, b: any) => s + (b.totalBudget || 0), 0);
  const totalActual = budgets.data.reduce((s: number, b: any) => s + (b.totalActual || 0), 0);
  const totalAssetValue = assetStore.list({}, 1, 1000).data.reduce((s: number, a: any) => s + (a.bookValue || 0), 0);
  res.json({
    success: true,
    data: {
      totalAR, totalAP, totalCollected,
      totalInvoices: invoices.total,
      totalPayments: payments.total,
      totalBudget, totalActualSpend: totalActual,
      budgetUtilisationPct: totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0,
      totalFixedAssets: assetStore.count(),
      totalAssetBookValue: totalAssetValue,
      costCenters: costCenterStore.count(),
      openPeriod: openPeriod?.name || null,
      openPeriodCode: openPeriod?.periodCode || null,
      glAccounts: glCount,
      postedJournals: journalCount,
      trialBalanceBalanced: tb.balanced,
      module1: true,
      demoStores: ['assets', 'costCenters', 'budgets'],
    }
  });
});

// ── GL ACCOUNTS (Module #1 — Prisma) ─────────────────────────────────
router.get('/gl-accounts', async (req: Request, res: Response) => {
  const result = await glAccountsDb.list(
    { type: req.query.type, status: req.query.status },
    Number(req.query.page) || 1,
    Number(req.query.limit) || 100,
  );
  const tb = await computeTrialBalance();
  const balanceByCode = Object.fromEntries(tb.rows.map((r) => [r.accountCode, r.balance]));
  res.json({
    success: true,
    source: 'prisma',
    ...result,
    data: result.data.map((a: any) => ({ ...a, balance: balanceByCode[a.accountCode] || 0 })),
  });
});

router.post('/gl-accounts', async (req: Request, res: Response) => {
  const { accountCode, name, type, normalBalance, industryVertical } = req.body;
  if (!accountCode || !name || !type) {
    return res.status(400).json({ success: false, error: 'accountCode, name, type required' });
  }
  const existing = await glAccountsDb.getByCode(String(accountCode));
  if (existing) return res.status(409).json({ success: false, error: 'accountCode already exists' });
  const account = await glAccountsDb.create({
    accountCode: String(accountCode),
    name,
    type,
    normalBalance: normalBalance || (['Liability', 'Equity', 'Revenue'].includes(type) ? 'Credit' : 'Debit'),
    industryVertical: industryVertical || 'All',
    currency: 'USD',
    status: 'Active',
  }, 'finance.gl.account.created');
  void emitAudit(req, 'glAccount.created', 'GlAccount', account.id, { module: 'finance' });
  res.status(201).json({ success: true, source: 'prisma', data: account });
});

router.post('/gl-accounts/seed-standard', async (_req: Request, res: Response) => {
  const count = await glAccountsDb.count();
  if (count > 0) {
    return res.status(400).json({ success: false, error: `CoA already has ${count} accounts — seed skipped` });
  }
  await glAccountsDb.createMany(
    STANDARD_COA.map((a) => ({
      ...a,
      currency: 'USD',
      status: 'Active',
      industryVertical: 'All',
    })),
  );
  const result = await glAccountsDb.list({}, 1, 100);
  res.status(201).json({ success: true, source: 'prisma', message: `Seeded ${result.total} standard accounts`, ...result });
});

// ── FIXED ASSETS ─────────────────────────────────────────────────────
router.get('/assets', (req: Request, res: Response) => {
  const { category, status, industryVertical } = req.query;
  const result = assetStore.list({ category, status, industryVertical }, Number(req.query.page) || 1, Number(req.query.limit) || 100);
  res.json({ success: true, ...result });
});

router.get('/assets/:id', (req: Request, res: Response) => {
  const asset = assetStore.get(req.params.id);
  if (!asset) return res.status(404).json({ success: false, error: 'Asset not found' });
  res.json({ success: true, data: asset });
});

router.post('/assets', (req: Request, res: Response) => {
  const { name, category, industryVertical, purchaseCost, salvageValue, usefulLifeYears, depreciationMethod, purchaseDate, location, currency } = req.body;
  if (!name || !purchaseCost || !usefulLifeYears) return res.status(400).json({ success: false, error: 'name, purchaseCost, usefulLifeYears required' });
  const count = assetStore.count();
  const asset = assetStore.create({
    assetCode: `FA-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`,
    name, category: category || 'Other',
    industryVertical: industryVertical || 'All',
    purchaseDate: purchaseDate || new Date().toISOString().slice(0, 10),
    purchaseCost, salvageValue: salvageValue || 0,
    usefulLifeYears, depreciationMethod: depreciationMethod || 'Straight-Line',
    accumulatedDepreciation: 0,
    bookValue: purchaseCost - (salvageValue || 0),
    currency: currency || 'USD',
    location: location || '', status: 'Active'
  }, 'finance.asset.created');
  res.status(201).json({ success: true, data: asset });
});

router.put('/assets/:id', (req: Request, res: Response) => {
  const updated = assetStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Asset not found' });
  res.json({ success: true, data: updated });
});

// Run monthly depreciation for all active assets
router.post('/assets/depreciate', (_req: Request, res: Response) => {
  const all = assetStore.list({ status: 'Active' }, 1, 1000);
  const results: any[] = [];
  all.data.forEach((asset: any) => {
    let monthlyDep = 0;
    if (asset.depreciationMethod === 'Straight-Line') {
      monthlyDep = (asset.purchaseCost - asset.salvageValue) / (asset.usefulLifeYears * 12);
    } else if (asset.depreciationMethod === 'Declining-Balance') {
      const rate = (2 / asset.usefulLifeYears) / 12;
      monthlyDep = asset.bookValue * rate;
    }
    const newAccDep = Math.min(asset.accumulatedDepreciation + monthlyDep, asset.purchaseCost - asset.salvageValue);
    const newBookValue = asset.purchaseCost - newAccDep;
    const updated = assetStore.update(asset.id, {
      accumulatedDepreciation: Math.round(newAccDep * 100) / 100,
      bookValue: Math.round(newBookValue * 100) / 100,
      status: newBookValue <= 0 ? 'Fully Depreciated' : 'Active'
    });
    results.push({ assetCode: asset.assetCode, monthlyDepreciation: Math.round(monthlyDep * 100) / 100, newBookValue: updated?.bookValue });
  });
  res.json({ success: true, data: results, message: `Depreciation run for ${results.length} assets` });
});

// ── MODULE #2 CONTROLLING (Prisma CostCenter + CostPosting) ───────────
router.get('/cost-centers', async (_req: Request, res: Response) => {
  try {
    const rows = await prisma.costCenter.findMany({ orderBy: { code: 'asc' } });
    res.json({ success: true, source: 'prisma', data: rows, total: rows.length });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return res.status(503).json({
        success: false,
        error: 'CostCenter table missing — apply prisma/manual/module2_controlling_additive.sql',
      });
    }
    res.status(500).json({ success: false, error: err?.message || 'list failed' });
  }
});

router.post('/cost-centers', async (req: Request, res: Response) => {
  const { code, name, manager, active } = req.body || {};
  if (!code || !name) return res.status(400).json({ success: false, error: 'code and name required' });
  try {
    const row = await prisma.costCenter.create({
      data: {
        code: String(code).trim(),
        name: String(name).trim(),
        manager: manager ? String(manager).trim() : null,
        active: active === undefined ? true : Boolean(active),
      },
    });
    void emitAudit(req, 'costCenter.created', 'CostCenter', row.id, { module: 'controlling' });
    eventBus.emitDomain('finance.costcenter.created', row, 'controlling');
    res.status(201).json({ success: true, source: 'prisma', data: row });
  } catch (err: any) {
    if (err?.code === 'P2002') return res.status(409).json({ success: false, error: 'Cost center code exists' });
    if (err?.code === 'P2021') {
      return res.status(503).json({
        success: false,
        error: 'CostCenter table missing — apply prisma/manual/module2_controlling_additive.sql',
      });
    }
    res.status(500).json({ success: false, error: err?.message || 'create failed' });
  }
});

router.put('/cost-centers/:id', async (req: Request, res: Response) => {
  const { name, manager, active } = req.body || {};
  try {
    const row = await prisma.costCenter.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined ? { name: String(name).trim() } : {}),
        ...(manager !== undefined ? { manager: manager ? String(manager).trim() : null } : {}),
        ...(active !== undefined ? { active: Boolean(active) } : {}),
      },
    });
    void emitAudit(req, 'costCenter.updated', 'CostCenter', row.id, {
      module: 'controlling',
      payload: { name: row.name, active: row.active },
    });
    res.json({ success: true, source: 'prisma', data: row });
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ success: false, error: 'Cost center not found' });
    res.status(500).json({ success: false, error: err?.message || 'update failed' });
  }
});

/** Cost center 360 — postings + plan/actual for period and YTD */
router.get('/cost-centers/:code', async (req: Request, res: Response) => {
  const code = String(req.params.code).trim();
  const period = String(req.query.period || new Date().toISOString().slice(0, 7));
  const year = period.slice(0, 4);
  try {
    const cc = await prisma.costCenter.findUnique({ where: { code } });
    if (!cc) return res.status(404).json({ success: false, error: 'Cost center not found' });
    const [periodPosts, ytdPosts, allocs] = await Promise.all([
      prisma.costPosting.findMany({
        where: { costCenterId: cc.id, period },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.costPosting.findMany({
        where: { costCenterId: cc.id, period: { startsWith: year } },
      }),
      prisma.costAllocation.findMany({
        where: { toCostCenter: code, period },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);
    const sumType = (rows: typeof periodPosts, type: string) =>
      rows.filter((p) => p.type === type).reduce((s, p) => s + p.amount, 0);
    const periodActual = sumType(periodPosts, 'Actual');
    const periodPlan = sumType(periodPosts, 'Plan');
    const ytdActual = sumType(ytdPosts, 'Actual');
    const ytdPlan = sumType(ytdPosts, 'Plan');
    res.json({
      success: true,
      source: 'prisma',
      data: {
        ...cc,
        period,
        year,
        periodActual: +periodActual.toFixed(2),
        periodPlan: +periodPlan.toFixed(2),
        periodVariance: +(periodActual - periodPlan).toFixed(2),
        ytdActual: +ytdActual.toFixed(2),
        ytdPlan: +ytdPlan.toFixed(2),
        ytdVariance: +(ytdActual - ytdPlan).toFixed(2),
        postings: periodPosts,
        allocations: allocs,
      },
    });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return res.status(503).json({
        success: false,
        error: 'Controlling tables missing — apply prisma/manual/module2_controlling_additive.sql',
      });
    }
    res.status(500).json({ success: false, error: err?.message || 'get failed' });
  }
});

router.get('/cost-postings', async (req: Request, res: Response) => {
  const period = req.query.period ? String(req.query.period) : undefined;
  const costCenterCode = req.query.costCenterCode ? String(req.query.costCenterCode) : undefined;
  try {
    const where: any = {};
    if (period) where.period = period;
    if (costCenterCode) {
      const cc = await prisma.costCenter.findUnique({ where: { code: costCenterCode } });
      if (!cc) return res.json({ success: true, source: 'prisma', data: [], total: 0 });
      where.costCenterId = cc.id;
    }
    const rows = await prisma.costPosting.findMany({
      where,
      include: { costCenter: true },
      orderBy: [{ period: 'desc' }, { createdAt: 'desc' }],
      take: Math.min(Number(req.query.limit) || 200, 500),
    });
    res.json({
      success: true,
      source: 'prisma',
      data: rows.map((r) => ({
        ...r,
        costCenterCode: r.costCenter.code,
        costCenterName: r.costCenter.name,
      })),
      total: rows.length,
    });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return res.status(503).json({
        success: false,
        error: 'CostPosting table missing — apply prisma/manual/module2_controlling_additive.sql',
      });
    }
    res.status(500).json({ success: false, error: err?.message || 'list failed' });
  }
});

router.post('/cost-postings', async (req: Request, res: Response) => {
  const {
    costCenterCode,
    period,
    account,
    amount,
    description,
    type = 'Actual',
    postToGl = true,
  } = req.body || {};
  if (!costCenterCode || !period || !account || amount === undefined) {
    return res.status(400).json({
      success: false,
      error: 'costCenterCode, period (YYYY-MM), account, amount required',
    });
  }
  if (!/^\d{4}-\d{2}$/.test(String(period))) {
    return res.status(400).json({ success: false, error: 'period must be YYYY-MM' });
  }
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt < 0) {
    return res.status(400).json({ success: false, error: 'amount must be a non-negative number' });
  }
  const postingType = type === 'Plan' ? 'Plan' : 'Actual';
  try {
    const cc = await prisma.costCenter.findUnique({ where: { code: String(costCenterCode).trim() } });
    if (!cc) return res.status(404).json({ success: false, error: 'Cost center not found' });
    if (!cc.active) return res.status(400).json({ success: false, error: 'Cost center inactive' });

    const row = await prisma.costPosting.create({
      data: {
        costCenterId: cc.id,
        period: String(period),
        account: String(account).trim(),
        amount: amt,
        description: description ? String(description).trim() : null,
        type: postingType,
      },
      include: { costCenter: true },
    });

    let journal = null;
    let glNote: string | null = null;
    // Actual spend → optional Module #1: Dr 6000 OpEx / Cr 1000 Cash
    if (postingType === 'Actual' && postToGl !== false && amt > 0) {
      try {
        journal = await postArJournal({
          description: `CO-${cc.code} ${period} ${account}${description ? ` — ${description}` : ''}`,
          debit: '6000',
          credit: '1000',
          amount: amt,
        });
        if (!journal) {
          glNote = 'GL not posted — open fiscal period and CoA accounts 6000/1000 required (Module #1)';
        } else {
          void emitAudit(req, 'journal.posted', 'JournalEntry', journal.id, {
            module: 'controlling',
            payload: { from: 'cost-posting', costCenter: cc.code, amount: amt },
          });
        }
      } catch (e: any) {
        journal = null;
        glNote = e?.message || 'GL post failed';
      }
    }

    void emitAudit(req, 'costPosting.created', 'CostPosting', row.id, {
      module: 'controlling',
      payload: { type: postingType, amount: amt, period, gl: Boolean(journal) },
    });
    eventBus.emitDomain(
      'finance.costposting.created',
      { ...row, costCenterCode: cc.code, journalId: journal?.id || null },
      'controlling',
    );

    res.status(201).json({
      success: true,
      source: 'prisma',
      data: {
        ...row,
        costCenterCode: row.costCenter.code,
        costCenterName: row.costCenter.name,
      },
      journal,
      glNote,
    });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return res.status(503).json({
        success: false,
        error: 'CostPosting table missing — apply prisma/manual/module2_controlling_additive.sql',
      });
    }
    res.status(500).json({ success: false, error: err?.message || 'create failed' });
  }
});

router.get('/controlling/report', async (req: Request, res: Response) => {
  const period = String(req.query.period || new Date().toISOString().slice(0, 7));
  try {
    const ccs = await prisma.costCenter.findMany({
      where: { active: true },
      include: { postings: { where: { period } } },
      orderBy: { code: 'asc' },
    });
    const rows = ccs.map((cc) => {
      const actual = cc.postings.filter((p) => p.type === 'Actual').reduce((s, p) => s + p.amount, 0);
      const plan = cc.postings.filter((p) => p.type === 'Plan').reduce((s, p) => s + p.amount, 0);
      const variance = +(actual - plan).toFixed(2);
      const variancePct = plan !== 0 ? +((variance / plan) * 100).toFixed(1) : null;
      return {
        code: cc.code,
        name: cc.name,
        manager: cc.manager,
        actual: +actual.toFixed(2),
        plan: +plan.toFixed(2),
        variance,
        variancePct,
        status: variance > 0 ? 'Over' : variance < 0 ? 'Under' : 'OnTrack',
      };
    });
    const totals = rows.reduce(
      (t, r) => ({ actual: t.actual + r.actual, plan: t.plan + r.plan }),
      { actual: 0, plan: 0 },
    );
    res.json({
      success: true,
      source: 'prisma',
      period,
      data: rows,
      totals: {
        actual: +totals.actual.toFixed(2),
        plan: +totals.plan.toFixed(2),
        variance: +(totals.actual - totals.plan).toFixed(2),
      },
    });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return res.status(503).json({
        success: false,
        error: 'Controlling tables missing — apply prisma/manual/module2_controlling_additive.sql',
      });
    }
    res.status(500).json({ success: false, error: err?.message || 'report failed' });
  }
});

router.get('/allocations', async (req: Request, res: Response) => {
  const where: any = {};
  if (req.query.period) where.period = String(req.query.period);
  if (req.query.toCostCenter) where.toCostCenter = String(req.query.toCostCenter);
  try {
    const rows = await prisma.costAllocation.findMany({ where, orderBy: { period: 'desc' }, take: 200 });
    res.json({ success: true, source: 'prisma', data: rows, total: rows.length });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return res.status(503).json({
        success: false,
        error: 'CostAllocation table missing — apply prisma/manual/module2_controlling_additive.sql',
      });
    }
    res.status(500).json({ success: false, error: err?.message || 'list failed' });
  }
});

router.post('/allocations', async (req: Request, res: Response) => {
  const { period, fromAccount, toCostCenter, amount, currency, basis, notes } = req.body || {};
  if (!period || !fromAccount || !toCostCenter || amount === undefined) {
    return res.status(400).json({ success: false, error: 'period, fromAccount, toCostCenter, amount required' });
  }
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt < 0) {
    return res.status(400).json({ success: false, error: 'amount must be non-negative' });
  }
  try {
    const cc = await prisma.costCenter.findUnique({ where: { code: String(toCostCenter).trim() } });
    if (!cc) return res.status(404).json({ success: false, error: 'Target cost center not found' });
    const row = await prisma.costAllocation.create({
      data: {
        period: String(period),
        fromAccount: String(fromAccount).trim(),
        toCostCenter: cc.code,
        amount: amt,
        currency: currency || 'USD',
        basis: basis ? String(basis) : 'manual',
        notes: notes ? String(notes) : null,
      },
    });
    void emitAudit(req, 'allocation.created', 'CostAllocation', row.id, { module: 'controlling' });
    eventBus.emitDomain('finance.allocation.created', row, 'controlling');
    res.status(201).json({ success: true, source: 'prisma', data: row });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return res.status(503).json({
        success: false,
        error: 'CostAllocation table missing — apply prisma/manual/module2_controlling_additive.sql',
      });
    }
    res.status(500).json({ success: false, error: err?.message || 'create failed' });
  }
});

/** Execute allocation → Actual cost posting on target CC (+ optional GL) */
router.post('/allocations/:id/execute', async (req: Request, res: Response) => {
  try {
    const alloc = await prisma.costAllocation.findUnique({ where: { id: req.params.id } });
    if (!alloc) return res.status(404).json({ success: false, error: 'Allocation not found' });
    if (String(alloc.basis || '').includes('executed')) {
      return res.status(400).json({ success: false, error: 'Allocation already executed' });
    }
    const cc = await prisma.costCenter.findUnique({ where: { code: alloc.toCostCenter } });
    if (!cc) return res.status(404).json({ success: false, error: 'Target cost center not found' });
    if (!cc.active) return res.status(400).json({ success: false, error: 'Target cost center inactive' });

    const posting = await prisma.costPosting.create({
      data: {
        costCenterId: cc.id,
        period: alloc.period,
        account: alloc.fromAccount,
        amount: alloc.amount,
        description: `Allocation ${alloc.id.slice(0, 8)} — ${alloc.notes || alloc.basis || 'allocated'}`,
        type: 'Actual',
      },
      include: { costCenter: true },
    });

    let journal = null;
    let glNote: string | null = null;
    if (req.body?.postToGl !== false && alloc.amount > 0) {
      try {
        journal = await postArJournal({
          description: `CO alloc ${cc.code} ${alloc.period} ${alloc.fromAccount}`,
          debit: '6000',
          credit: '1000',
          amount: alloc.amount,
          currency: alloc.currency,
        });
        if (!journal) glNote = 'GL not posted — open fiscal period required (Module #1)';
      } catch (e: any) {
        glNote = e?.message || 'GL post failed';
      }
    }

    const updated = await prisma.costAllocation.update({
      where: { id: alloc.id },
      data: { basis: `${alloc.basis || 'manual'}|executed` },
    });

    void emitAudit(req, 'allocation.executed', 'CostAllocation', alloc.id, {
      module: 'controlling',
      payload: { postingId: posting.id, amount: alloc.amount, to: cc.code },
    });

    res.json({
      success: true,
      source: 'prisma',
      data: updated,
      posting: {
        ...posting,
        costCenterCode: posting.costCenter.code,
        costCenterName: posting.costCenter.name,
      },
      journal,
      glNote,
      message: 'Allocation executed as Actual posting',
    });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return res.status(503).json({
        success: false,
        error: 'Controlling tables missing — apply prisma/manual/module2_controlling_additive.sql',
      });
    }
    res.status(500).json({ success: false, error: err?.message || 'execute failed' });
  }
});

/** Idempotent sample cost centers + plan/actual for a period (local smoke only). */
router.post('/controlling/seed-demo', async (req: Request, res: Response) => {
  const period = String(req.body?.period || new Date().toISOString().slice(0, 7));
  const seeds = [
    { code: 'CC-FMCG', name: 'FMCG — Trade Operations', manager: 'Ahmed Hassan' },
    { code: 'CC-TXL', name: 'Textiles — Export', manager: 'Sara Malik' },
    { code: 'CC-COM', name: 'Commodities — Trading', manager: 'James Obi' },
    { code: 'CC-HQ', name: 'Corporate HQ', manager: 'Fatima Khan' },
  ];
  try {
    const created: string[] = [];
    for (const s of seeds) {
      const existing = await prisma.costCenter.findUnique({ where: { code: s.code } });
      if (!existing) {
        await prisma.costCenter.create({ data: { ...s, active: true } });
        created.push(s.code);
      }
    }
    const planActual: { code: string; plan: number; actual: number; account: string }[] = [
      { code: 'CC-FMCG', plan: 200000, actual: 214000, account: '6000' },
      { code: 'CC-TXL', plan: 150000, actual: 132000, account: '5000' },
      { code: 'CC-COM', plan: 180000, actual: 165000, account: '6000' },
      { code: 'CC-HQ', plan: 80000, actual: 76000, account: '6000' },
    ];
    let postings = 0;
    for (const p of planActual) {
      const cc = await prisma.costCenter.findUnique({ where: { code: p.code } });
      if (!cc) continue;
      const existing = await prisma.costPosting.count({ where: { costCenterId: cc.id, period } });
      if (existing > 0) continue;
      await prisma.costPosting.createMany({
        data: [
          {
            costCenterId: cc.id,
            period,
            account: p.account,
            amount: p.plan,
            type: 'Plan',
            description: 'Sample plan',
          },
          {
            costCenterId: cc.id,
            period,
            account: p.account,
            amount: p.actual,
            type: 'Actual',
            description: 'Sample actual',
          },
        ],
      });
      postings += 2;
    }
    res.status(201).json({
      success: true,
      period,
      costCentersCreated: created,
      postingsCreated: postings,
      message: 'Sample controlling data ready for variance report',
    });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return res.status(503).json({
        success: false,
        error: 'Controlling tables missing — apply prisma/manual/module2_controlling_additive.sql',
      });
    }
    res.status(500).json({ success: false, error: err?.message || 'seed failed' });
  }
});

// ── MODULE #7 FINANCIAL PLANNING (Prisma BudgetLine) ─────────────────
router.get('/budgets', async (req: Request, res: Response) => {
  const where: any = {};
  if (req.query.period) where.period = String(req.query.period);
  if (req.query.scenario) where.scenario = String(req.query.scenario);
  if (req.query.account) where.account = String(req.query.account);
  if (req.query.costCenter) where.costCenter = String(req.query.costCenter);
  if (req.query.status) where.status = String(req.query.status);
  try {
    const rows = await prisma.budgetLine.findMany({
      where,
      orderBy: [{ period: 'desc' }, { account: 'asc' }],
      take: Math.min(Number(req.query.limit) || 200, 500),
    });
    res.json({ success: true, source: 'prisma', data: rows, total: rows.length });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return res.status(503).json({
        success: false,
        error: 'BudgetLine table missing — apply prisma/manual/module2_controlling_additive.sql',
      });
    }
    res.status(500).json({ success: false, error: err?.message || 'list failed' });
  }
});

/** Distinct budget periods with rollups (for period navigator). */
router.get('/budgets/periods', async (req: Request, res: Response) => {
  const scenario = String(req.query.scenario || 'Base');
  try {
    const rows = await prisma.budgetLine.findMany({
      where: { scenario },
      select: { period: true, budgeted: true, status: true },
    });
    const byPeriod = new Map<string, { period: string; totalBudget: number; lines: number; draft: number; approved: number; closed: number }>();
    for (const r of rows) {
      const cur = byPeriod.get(r.period) || {
        period: r.period,
        totalBudget: 0,
        lines: 0,
        draft: 0,
        approved: 0,
        closed: 0,
      };
      cur.totalBudget += r.budgeted;
      cur.lines += 1;
      const st = (r as any).status || 'Draft';
      if (st === 'Approved') cur.approved += 1;
      else if (st === 'Closed') cur.closed += 1;
      else cur.draft += 1;
      byPeriod.set(r.period, cur);
    }
    const data = Array.from(byPeriod.values())
      .map((p) => ({ ...p, totalBudget: +p.totalBudget.toFixed(2) }))
      .sort((a, b) => b.period.localeCompare(a.period));
    res.json({ success: true, source: 'prisma', scenario, data, total: data.length });
  } catch (err: any) {
    if (err?.code === 'P2021' || err?.message?.includes('status')) {
      return res.status(503).json({
        success: false,
        error: 'BudgetLine.status missing — re-apply prisma/manual/module2_controlling_additive.sql',
      });
    }
    res.status(500).json({ success: false, error: err?.message || 'periods failed' });
  }
});

router.post('/budgets', async (req: Request, res: Response) => {
  const { period, account, costCenter, budgeted, scenario, notes, status } = req.body || {};
  if (!period || !account || budgeted === undefined) {
    return res.status(400).json({ success: false, error: 'period, account, budgeted required' });
  }
  const amt = Number(budgeted);
  if (!Number.isFinite(amt)) {
    return res.status(400).json({ success: false, error: 'budgeted must be a number' });
  }
  try {
    const row = await prisma.budgetLine.create({
      data: {
        period: String(period),
        account: String(account).trim(),
        costCenter: costCenter ? String(costCenter).trim() : null,
        budgeted: amt,
        scenario: scenario || 'Base',
        status: status === 'Approved' ? 'Approved' : 'Draft',
        notes: notes ? String(notes) : null,
      },
    });
    void emitAudit(req, 'budget.created', 'BudgetLine', row.id, { module: 'planning' });
    eventBus.emitDomain('finance.budget.created', row, 'planning');
    res.status(201).json({ success: true, source: 'prisma', data: row });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return res.status(409).json({ success: false, error: 'Budget line already exists for period/account/CC/scenario' });
    }
    if (err?.code === 'P2021') {
      return res.status(503).json({
        success: false,
        error: 'BudgetLine table missing — apply prisma/manual/module2_controlling_additive.sql',
      });
    }
    res.status(500).json({ success: false, error: err?.message || 'create failed' });
  }
});

/** Budget vs Controlling actuals (CostPosting type=Actual) for a period. */
router.get('/budgets/variance', async (req: Request, res: Response) => {
  const period = String(req.query.period || new Date().toISOString().slice(0, 7));
  const scenario = String(req.query.scenario || 'Base');
  try {
    const [budgets, postings] = await Promise.all([
      prisma.budgetLine.findMany({ where: { period, scenario } }),
      prisma.costPosting.findMany({
        where: { period, type: 'Actual' },
        include: { costCenter: true },
      }),
    ]);
    const byKey = new Map<string, { account: string; costCenter: string; budgeted: number; actual: number; status?: string; lineId?: string }>();
    for (const b of budgets) {
      const k = `${b.account}|${b.costCenter || ''}`;
      byKey.set(k, {
        account: b.account,
        costCenter: b.costCenter || '',
        budgeted: b.budgeted,
        actual: 0,
        status: (b as any).status || 'Draft',
        lineId: b.id,
      });
    }
    for (const p of postings) {
      const k = `${p.account}|${p.costCenter.code}`;
      const r = byKey.get(k) || {
        account: p.account,
        costCenter: p.costCenter.code,
        budgeted: 0,
        actual: 0,
      };
      r.actual += p.amount;
      byKey.set(k, r);
    }
    const rows = Array.from(byKey.values()).map((r) => ({
      ...r,
      actual: +r.actual.toFixed(2),
      variance: +(r.actual - r.budgeted).toFixed(2),
      variancePct: r.budgeted ? +(((r.actual - r.budgeted) / r.budgeted) * 100).toFixed(2) : null,
    }));
    const totalBudget = rows.reduce((s, r) => s + r.budgeted, 0);
    const totalActual = rows.reduce((s, r) => s + r.actual, 0);
    res.json({
      success: true,
      source: 'prisma',
      period,
      scenario,
      data: rows,
      summary: {
        period,
        scenario,
        totalBudget: +totalBudget.toFixed(2),
        totalActual: +totalActual.toFixed(2),
        variance: +(totalActual - totalBudget).toFixed(2),
      },
    });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return res.status(503).json({
        success: false,
        error: 'Budget/Controlling tables missing — apply prisma/manual/module2_controlling_additive.sql',
      });
    }
    res.status(500).json({ success: false, error: err?.message || 'variance failed' });
  }
});

router.get('/budgets/:id', async (req: Request, res: Response) => {
  try {
    const row = await prisma.budgetLine.findUnique({ where: { id: req.params.id } });
    if (!row) return res.status(404).json({ success: false, error: 'Budget line not found' });
    let actual = 0;
    try {
      const postings = await prisma.costPosting.findMany({
        where: {
          period: row.period,
          type: 'Actual',
          account: row.account,
          ...(row.costCenter
            ? { costCenter: { code: row.costCenter } }
            : {}),
        },
        include: { costCenter: true },
      });
      actual = postings
        .filter((p) => !row.costCenter || p.costCenter.code === row.costCenter)
        .reduce((s, p) => s + p.amount, 0);
    } catch {
      /* controlling optional */
    }
    res.json({
      success: true,
      source: 'prisma',
      data: {
        ...row,
        actual: +actual.toFixed(2),
        variance: +(actual - row.budgeted).toFixed(2),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'get failed' });
  }
});

router.put('/budgets/:id', async (req: Request, res: Response) => {
  const { budgeted, notes, scenario, status } = req.body || {};
  try {
    const existing = await prisma.budgetLine.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Budget line not found' });
    if ((existing as any).status === 'Closed') {
      return res.status(409).json({ success: false, error: 'Closed budget lines cannot be edited' });
    }
    if ((existing as any).status === 'Approved' && (budgeted !== undefined || scenario !== undefined)) {
      return res.status(409).json({ success: false, error: 'Approved lines are locked — close or keep as-is' });
    }
    const row = await prisma.budgetLine.update({
      where: { id: req.params.id },
      data: {
        ...(budgeted !== undefined ? { budgeted: Number(budgeted) } : {}),
        ...(notes !== undefined ? { notes: notes ? String(notes) : null } : {}),
        ...(scenario !== undefined ? { scenario: String(scenario) } : {}),
        ...(status !== undefined ? { status: String(status) } : {}),
      },
    });
    void emitAudit(req, 'budget.updated', 'BudgetLine', row.id, { module: 'planning', payload: req.body });
    res.json({ success: true, source: 'prisma', data: row });
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ success: false, error: 'Budget line not found' });
    res.status(500).json({ success: false, error: err?.message || 'update failed' });
  }
});

router.post('/budgets/:id/approve', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.budgetLine.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Budget line not found' });
    const st = (existing as any).status || 'Draft';
    if (st !== 'Draft') return res.status(409).json({ success: false, error: `Cannot approve from '${st}'` });
    const row = await prisma.budgetLine.update({ where: { id: existing.id }, data: { status: 'Approved' } });
    void emitAudit(req, 'budget.approved', 'BudgetLine', row.id, { module: 'planning' });
    eventBus.emitDomain('finance.budget.approved', row, 'planning');
    res.json({ success: true, data: row, message: 'Budget line approved' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'approve failed' });
  }
});

router.post('/budgets/:id/close', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.budgetLine.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Budget line not found' });
    const st = (existing as any).status || 'Draft';
    if (st === 'Closed') return res.status(409).json({ success: false, error: 'Already closed' });
    const row = await prisma.budgetLine.update({ where: { id: existing.id }, data: { status: 'Closed' } });
    void emitAudit(req, 'budget.closed', 'BudgetLine', row.id, { module: 'planning' });
    eventBus.emitDomain('finance.budget.closed', row, 'planning');
    res.json({ success: true, data: row, message: 'Budget line closed' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'close failed' });
  }
});

/** Approve all Draft lines for a period (+ optional scenario). */
router.post('/budgets/approve-period', async (req: Request, res: Response) => {
  const period = String(req.body?.period || '');
  const scenario = String(req.body?.scenario || 'Base');
  if (!period) return res.status(400).json({ success: false, error: 'period required' });
  try {
    const result = await prisma.budgetLine.updateMany({
      where: { period, scenario, status: 'Draft' },
      data: { status: 'Approved' },
    });
    void emitAudit(req, 'budget.period_approved', 'BudgetLine', period, {
      module: 'planning',
      payload: { period, scenario, count: result.count },
    });
    eventBus.emitDomain('finance.budget.approved', { period, scenario, count: result.count }, 'planning');
    res.json({ success: true, period, scenario, approved: result.count, message: `Approved ${result.count} draft lines` });
  } catch (err: any) {
    if (err?.code === 'P2021' || err?.message?.includes('status')) {
      return res.status(503).json({
        success: false,
        error: 'BudgetLine.status missing — re-apply prisma/manual/module2_controlling_additive.sql',
      });
    }
    res.status(500).json({ success: false, error: err?.message || 'approve-period failed' });
  }
});

// ── FISCAL PERIOD / PERIOD CLOSE (Module #1 — Prisma) ────────────────
router.get('/fiscal-periods', async (req: Request, res: Response) => {
  const result = await fiscalPeriodsDb.list(
    { status: req.query.status, year: req.query.year },
    Number(req.query.page) || 1,
    100,
  );
  res.json({ success: true, source: 'prisma', ...result });
});

router.post('/fiscal-periods', async (req: Request, res: Response) => {
  const { name, year, month } = req.body;
  const y = Number(year) || new Date().getFullYear();
  const m = Number(month) || (new Date().getMonth() + 1);
  if (!name) return res.status(400).json({ success: false, error: 'name required' });
  const periodCode = `FP-${y}-${String(m).padStart(2, '0')}`;
  const existing = await fiscalPeriodsDb.getByCode(periodCode);
  if (existing) return res.status(409).json({ success: false, error: 'period already exists' });
  const period = await fiscalPeriodsDb.create({
    periodCode,
    name,
    year: y,
    month: m,
    status: 'Open',
  }, 'finance.period.opened');
  res.status(201).json({ success: true, source: 'prisma', data: period });
});

router.post('/fiscal-periods/:id/close', async (req: Request, res: Response) => {
  const period = await fiscalPeriodsDb.get(req.params.id);
  if (!period) return res.status(404).json({ success: false, error: 'Fiscal period not found' });
  if (period.status === 'Closed') return res.status(400).json({ success: false, error: 'Period already closed' });

  const tb = await computeTrialBalance(period.periodCode);
  if (!tb.balanced) {
    return res.status(400).json({
      success: false,
      error: 'Cannot close — trial balance not balanced for this period',
      data: { totalDebits: tb.totalDebits, totalCredits: tb.totalCredits },
    });
  }

  const updated = await fiscalPeriodsDb.update(req.params.id, {
    status: 'Closed',
    closedBy: (req as any).user?.email || (req as any).user?.id || 'System',
    closedAt: new Date(),
  });
  void emitAudit(req, 'fiscalPeriod.closed', 'FiscalPeriod', updated.id, { module: 'finance', payload: { periodCode: period.periodCode } });
  res.json({ success: true, source: 'prisma', data: updated, message: `Period ${period.name} closed` });
});

router.post('/fiscal-periods/:id/reopen', async (req: Request, res: Response) => {
  const period = await fiscalPeriodsDb.get(req.params.id);
  if (!period) return res.status(404).json({ success: false, error: 'Fiscal period not found' });
  if (period.status !== 'Closed') return res.status(400).json({ success: false, error: 'Period is not closed' });
  const updated = await fiscalPeriodsDb.update(req.params.id, { status: 'Open', closedBy: null, closedAt: null });
  void emitAudit(req, 'fiscalPeriod.reopened', 'FiscalPeriod', updated.id, { module: 'finance' });
  res.json({ success: true, source: 'prisma', data: updated, message: `Period ${period.name} re-opened` });
});

// ── AI-SAP+ advisors (Groq with heuristic fallback) ─────────────────────
router.get('/ai/status', async (_req: Request, res: Response) => {
  res.json({
    success: true,
    aiEnabled: aiEnabled(),
    provider: aiEnabled() ? 'groq' : 'heuristic',
    capabilities: ['gl-close', 'ar-collections', 'ap-payments', 'controlling-variance', 'draft-invoice', 'oracle-cross'],
  });
});

router.post('/ai/draft-invoice', async (req: Request, res: Response) => {
  try {
    const brief = String(req.body?.brief || '').trim();
    if (!brief) return res.status(400).json({ success: false, error: 'brief is required' });
    const invoices = (await invoicesDb.list({ type: 'AR' }, 1, 200)).data;
    const customers = Array.from(
      new Set(invoices.map((i: any) => i.customerName).filter(Boolean)),
    ) as string[];
    const recentLines: string[] = [];
    for (const inv of invoices.slice(0, 40)) {
      const lines = Array.isArray(inv.lines) ? inv.lines : [];
      for (const l of lines.slice(0, 3)) {
        if (l?.description) {
          recentLines.push(
            `${inv.customerName || '?'} · ${l.description} · qty ${l.qty} @ ${l.unitPrice}`,
          );
        }
      }
    }
    const draft = await draftInvoiceFromBrief({ brief, customers, recentLines });
    void emitAudit(req, 'ai.draft_invoice', 'FinanceAI', 'draft-invoice', {
      module: 'ar',
      payload: { aiGenerated: draft.aiGenerated, customer: draft.customer, lines: draft.lines.length },
    });
    res.json({ success: true, data: draft });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || 'AI draft-invoice failed' });
  }
});

router.post('/ai/oracle-cross', async (req: Request, res: Response) => {
  try {
    const customer = String(req.body?.customer || '').trim();
    const amount = Number(req.body?.amount) || 0;
    const currency = String(req.body?.currency || 'USD');
    const lineCount = Number(req.body?.lineCount) || (Array.isArray(req.body?.lines) ? req.body.lines.length : 0);
    if (!customer) return res.status(400).json({ success: false, error: 'customer is required' });

    const invoices = (await invoicesDb.list({ type: 'AR' }, 1, 2000)).data;
    const sameCust = invoices.filter(
      (i: any) => String(i.customerName || '').toLowerCase() === customer.toLowerCase(),
    );
    let openExposure = 0;
    let openInvoiceCount = 0;
    const duplicateCandidates: Array<{ invoiceNo: string; amount: number; dueDate?: string }> = [];
    for (const inv of sameCust) {
      if (!['Unpaid', 'Overdue', 'Partial', 'Draft'].includes(inv.status)) continue;
      const paid = Array.isArray(inv.payments)
        ? inv.payments.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0)
        : 0;
      const outstanding = Math.max(0, +(Number(inv.amount) - paid).toFixed(2));
      if (outstanding > 0 || inv.status === 'Draft') {
        openExposure += outstanding || Number(inv.amount) || 0;
        openInvoiceCount += 1;
      }
      if (amount > 0 && Math.abs(Number(inv.amount) - amount) / Math.max(amount, 1) < 0.05) {
        duplicateCandidates.push({
          invoiceNo: inv.invoiceNo,
          amount: Number(inv.amount) || 0,
          dueDate: inv.dueDate,
        });
      }
    }

    const data = await oracleCrossCheck({
      customer,
      amount,
      currency,
      lineCount,
      openExposure: +openExposure.toFixed(2),
      openInvoiceCount,
      duplicateCandidates: duplicateCandidates.slice(0, 8),
    });
    void emitAudit(req, 'ai.oracle_cross', 'FinanceAI', 'oracle-cross', {
      module: 'ar',
      payload: { aiGenerated: data.aiGenerated, customer, creditSignal: data.creditSignal },
    });
    res.json({
      success: true,
      data,
      facts: { openExposure: +openExposure.toFixed(2), openInvoiceCount, duplicateCandidates },
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || 'AI oracle-cross failed' });
  }
});

router.post('/ai/gl-close', async (req: Request, res: Response) => {
  try {
    const open = (await fiscalPeriodsDb.list({ status: 'Open' }, 1, 1)).data[0];
    const tb = await computeTrialBalance(open?.periodCode);
    const drafts = (await journalDb.list({ status: 'Draft' }, 1, 500)).data;
    const advice = await glCloseAdvisor({
      trialBalanced: tb.balanced,
      openPeriod: open?.periodCode || null,
      draftCount: drafts.length,
      totalDebits: tb.totalDebits,
      totalCredits: tb.totalCredits,
      anomalies: req.body?.anomalies || [],
    });
    void emitAudit(req, 'ai.gl_close', 'FinanceAI', 'gl-close', {
      module: 'finance',
      payload: { aiGenerated: advice.aiGenerated, period: open?.periodCode },
    });
    res.json({ success: true, data: advice, period: open?.periodCode || null, draftCount: drafts.length, trialBalanced: tb.balanced });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || 'AI gl-close failed' });
  }
});

router.post('/ai/ar-collections', async (_req: Request, res: Response) => {
  try {
    const invoices = (await invoicesDb.list({ type: 'AR' }, 1, 5000)).data;
    const now = Date.now();
    const items = invoices
      .filter((inv: any) => ['Unpaid', 'Overdue', 'Partial'].includes(inv.status))
      .map((inv: any) => {
        const paid = Array.isArray(inv.payments)
          ? inv.payments.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0)
          : 0;
        const outstanding = Math.max(0, +(Number(inv.amount) - paid).toFixed(2));
        if (outstanding <= 0) return null;
        const due = inv.dueDate ? new Date(inv.dueDate).getTime() : now;
        const daysOverdue = Math.floor((now - due) / 86400000);
        return {
          invoiceNo: inv.invoiceNo,
          customerName: inv.customerName,
          outstanding,
          daysOverdue,
          bucket: daysOverdue > 90 ? 'd90plus' : daysOverdue > 60 ? 'd90' : daysOverdue > 30 ? 'd60' : daysOverdue > 0 ? 'd30' : 'current',
        };
      })
      .filter(Boolean) as any[];
    const advice = await arCollectionsCoach({ items });
    void emitAudit(_req, 'ai.ar_collections', 'FinanceAI', 'ar-collections', {
      module: 'ar',
      payload: { aiGenerated: advice.aiGenerated, open: items.length },
    });
    res.json({ success: true, data: advice, openCount: items.length });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || 'AI ar-collections failed' });
  }
});

router.post('/ai/ap-payments', async (req: Request, res: Response) => {
  try {
    const all = (await invoicesDb.list({}, 1, 5000)).data;
    const now = Date.now();
    const items = all
      .filter((i: any) => {
        const t = String(i.type || '').toUpperCase();
        return (t === 'AP' || t === 'VENDOR') && ['Unpaid', 'Overdue', 'Partial'].includes(i.status);
      })
      .map((inv: any) => {
        const paid = Array.isArray(inv.payments)
          ? inv.payments.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0)
          : 0;
        const outstanding = Math.max(0, +(Number(inv.amount) - paid).toFixed(2));
        if (outstanding <= 0) return null;
        const due = inv.dueDate ? new Date(inv.dueDate).getTime() : now;
        return {
          invoiceNo: inv.invoiceNo,
          vendorName: inv.customerName,
          outstanding,
          daysOverdue: Math.floor((now - due) / 86400000),
          dueDate: inv.dueDate,
        };
      })
      .filter(Boolean) as any[];
    const advice = await apPaymentAdvisor({
      cashAvailable: req.body?.cashAvailable != null ? Number(req.body.cashAvailable) : undefined,
      items,
    });
    void emitAudit(req, 'ai.ap_payments', 'FinanceAI', 'ap-payments', {
      module: 'ap',
      payload: { aiGenerated: advice.aiGenerated, open: items.length },
    });
    res.json({ success: true, data: advice, openCount: items.length });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || 'AI ap-payments failed' });
  }
});

router.post('/ai/controlling-variance', async (req: Request, res: Response) => {
  try {
    const period = String(req.body?.period || new Date().toISOString().slice(0, 7));
    const ccs = await prisma.costCenter.findMany({
      where: { active: true },
      include: { postings: { where: { period } } },
      orderBy: { code: 'asc' },
    });
    const rows = ccs.map((cc) => {
      const actual = cc.postings.filter((p) => p.type === 'Actual').reduce((s, p) => s + p.amount, 0);
      const plan = cc.postings.filter((p) => p.type === 'Plan').reduce((s, p) => s + p.amount, 0);
      const variance = +(actual - plan).toFixed(2);
      const variancePct = plan !== 0 ? +((variance / plan) * 100).toFixed(1) : null;
      return { code: cc.code, name: cc.name, plan, actual, variance, variancePct };
    });
    const advice = await explainVariance({ period, rows });
    void emitAudit(req, 'ai.controlling_variance', 'FinanceAI', period, {
      module: 'controlling',
      payload: { aiGenerated: advice.aiGenerated, lines: rows.length },
    });
    res.json({ success: true, data: advice, period, rows: rows.filter((r) => Math.abs(r.variance) >= 1).slice(0, 12) });
  } catch (e: any) {
    if (e?.code === 'P2021') {
      return res.status(503).json({ success: false, error: 'Controlling tables missing' });
    }
    res.status(500).json({ success: false, error: e?.message || 'AI controlling-variance failed' });
  }
});

export default router;
