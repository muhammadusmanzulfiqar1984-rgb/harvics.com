/**
 * ASC 606 / IFRS 15 revenue recognition — contracts, performance obligations, deferred revenue.
 * PostgreSQL-backed via FhRevenueContract.
 */
import { fiscalPeriodsDb, glAccountsDb, journalDb } from '../core/db';
import { prisma } from '../core/prisma';
import { ensureFinanceDbSeeded } from './financeDbBootstrap.service';
import { entityTagPrefix, tagJournalEntry } from './entityMaster.service';

export type RecognitionMethod = 'POINT_IN_TIME' | 'OVER_TIME';
export type RecognitionTrigger = 'ORDER' | 'SHIPMENT' | 'DELIVERY' | 'ACCEPTANCE' | 'MILESTONE' | 'INVOICE';
export type ContractStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type ScheduleStatus = 'DEFERRED' | 'RECOGNIZED' | 'REVERSED';

export type PerformanceObligation = {
  id: string;
  description: string;
  allocatedAmount: number;
  recognitionMethod: RecognitionMethod;
  trigger: RecognitionTrigger;
  recognizedAmount: number;
  deferredAmount: number;
};

export type RecognitionEntry = {
  id: string;
  obligationId: string;
  amount: number;
  recognizedAt: string;
  trigger: RecognitionTrigger;
  journalEntryNo?: string;
  status: ScheduleStatus;
};

export type RevenueContract = {
  id: string;
  contractNo: string;
  invoiceId?: string;
  invoiceNo?: string;
  salesOrderId?: string;
  customerName: string;
  entityCode: string;
  currency: string;
  transactionPrice: number;
  status: ContractStatus;
  obligations: PerformanceObligation[];
  schedule: RecognitionEntry[];
  createdAt: string;
  completedAt?: string;
};

function mapContract(row: {
  id: string;
  contractNo: string;
  invoiceId: string | null;
  invoiceNo: string | null;
  salesOrderId: string | null;
  customerName: string;
  entityCode: string;
  currency: string;
  transactionPrice: number;
  status: string;
  obligations: unknown;
  schedule: unknown;
  completedAt: Date | null;
  createdAt: Date;
}): RevenueContract {
  return {
    id: row.id,
    contractNo: row.contractNo,
    invoiceId: row.invoiceId || undefined,
    invoiceNo: row.invoiceNo || undefined,
    salesOrderId: row.salesOrderId || undefined,
    customerName: row.customerName,
    entityCode: row.entityCode,
    currency: row.currency,
    transactionPrice: row.transactionPrice,
    status: row.status as ContractStatus,
    obligations: (row.obligations as PerformanceObligation[]) || [],
    schedule: (row.schedule as RecognitionEntry[]) || [],
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt?.toISOString(),
  };
}

async function postRevRecJournal(opts: {
  entityCode: string;
  description: string;
  debit: string;
  credit: string;
  amount: number;
  currency: string;
}) {
  const open = (await fiscalPeriodsDb.list({ status: 'Open' }, 1, 1)).data[0];
  if (!open) return null;
  const [debitAcct, creditAcct] = await Promise.all([
    glAccountsDb.getByCode(opts.debit),
    glAccountsDb.getByCode(opts.credit),
  ]);
  if (!debitAcct || !creditAcct) return null;
  const count = await journalDb.count();
  const entryNo = `JE-REV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  const journal = await journalDb.create(
    {
      entryNo,
      description: `${entityTagPrefix(opts.entityCode)} ${opts.description}`,
      debit: opts.debit,
      credit: opts.credit,
      amount: opts.amount,
      currency: opts.currency,
      postedDate: new Date().toISOString().slice(0, 10),
      status: 'Posted',
      periodCode: open.periodCode,
      entityCode: opts.entityCode,
    },
    'finance.revrec.posted',
  );
  await tagJournalEntry(entryNo, opts.entityCode);
  return journal;
}

export const REVREC_COA = [
  { accountCode: '2400', name: 'Deferred Revenue (Contract Liability)', type: 'Liability', normalBalance: 'Credit' },
  { accountCode: '4010', name: 'Recognized Revenue — ASC 606', type: 'Revenue', normalBalance: 'Credit' },
];

export async function listRevenueContracts(filters?: { status?: ContractStatus; customerName?: string }) {
  await ensureFinanceDbSeeded();
  const rows = await prisma.fhRevenueContract.findMany({
    where: {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.customerName
        ? { customerName: { contains: filters.customerName, mode: 'insensitive' } }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapContract);
}

export async function getRevenueContract(idOrNo: string): Promise<RevenueContract | null> {
  await ensureFinanceDbSeeded();
  const key = idOrNo.toLowerCase();
  const row = await prisma.fhRevenueContract.findFirst({
    where: {
      OR: [{ id: idOrNo }, { contractNo: { equals: idOrNo, mode: 'insensitive' } }, { invoiceId: idOrNo }],
    },
  });
  return row ? mapContract(row) : null;
}

export async function createContractFromInvoice(inv: any, opts?: { trigger?: RecognitionTrigger; entityCode?: string }) {
  await ensureFinanceDbSeeded();
  const existing = await prisma.fhRevenueContract.findFirst({ where: { invoiceId: inv.id } });
  if (existing) return { ok: true, contract: mapContract(existing), alreadyExists: true };

  const meta = inv.meta || {};
  const entityCode = opts?.entityCode || meta.legalEntity?.code || 'HT-AE';
  const trigger: RecognitionTrigger =
    opts?.trigger || (meta.o2c?.billTrigger === 'delivery' ? 'DELIVERY' : 'INVOICE');

  const amount = Number(inv.amount) || 0;
  const obligation: PerformanceObligation = {
    id: `po-${inv.id}-1`,
    description: `Performance obligation — ${inv.invoiceNo}`,
    allocatedAmount: amount,
    recognitionMethod: 'POINT_IN_TIME',
    trigger,
    recognizedAmount: 0,
    deferredAmount: amount,
  };

  const count = await prisma.fhRevenueContract.count();
  const contractNo = `RC-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  const row = await prisma.fhRevenueContract.create({
    data: {
      id: `rc-${Date.now()}`,
      contractNo,
      invoiceId: inv.id,
      invoiceNo: inv.invoiceNo,
      customerName: inv.customerName || inv.customer,
      entityCode: entityCode.toUpperCase(),
      currency: inv.currency || 'USD',
      transactionPrice: amount,
      status: 'ACTIVE',
      obligations: [obligation] as object[],
      schedule: [],
    },
  });
  return { ok: true, contract: mapContract(row), alreadyExists: false };
}

export async function deferRevenueOnInvoice(inv: any, entityCode: string) {
  const amount = Number(inv.amount) || 0;
  if (amount <= 0) return { ok: false, error: 'Zero amount invoice' };
  const journal = await postRevRecJournal({
    entityCode,
    description: `ASC 606 defer — invoice ${inv.invoiceNo}`,
    debit: '1100',
    credit: '2400',
    amount,
    currency: inv.currency || 'USD',
  });
  return { ok: Boolean(journal), journal, deferredAmount: amount };
}

export async function recognizeRevenue(
  contractId: string,
  opts?: { trigger?: RecognitionTrigger; amount?: number; postToGl?: boolean },
) {
  await ensureFinanceDbSeeded();
  const row = await prisma.fhRevenueContract.findFirst({
    where: { OR: [{ id: contractId }, { contractNo: contractId }] },
  });
  if (!row) return { ok: false, error: 'Revenue contract not found' };
  let contract = mapContract(row);

  if (contract.status === 'COMPLETED') {
    return { ok: true, contract, message: 'Contract already fully recognized', alreadyComplete: true };
  }

  const obligation = contract.obligations[0];
  if (!obligation) return { ok: false, error: 'No performance obligation' };

  const remaining = +(obligation.allocatedAmount - obligation.recognizedAmount).toFixed(2);
  const amount = opts?.amount != null ? Math.min(Number(opts.amount), remaining) : remaining;
  if (amount <= 0) return { ok: false, error: 'Nothing left to recognize' };

  let journal = null;
  if (opts?.postToGl !== false) {
    journal = await postRevRecJournal({
      entityCode: contract.entityCode,
      description: `ASC 606 recognize — ${contract.contractNo} / ${contract.invoiceNo || ''}`,
      debit: '2400',
      credit: '4010',
      amount,
      currency: contract.currency,
    });
    if (!journal) {
      return {
        ok: false,
        error: 'Rev rec GL failed — seed accounts 2400 + 4010 and open fiscal period',
        contract,
      };
    }
  }

  const entry: RecognitionEntry = {
    id: `re-${Date.now()}`,
    obligationId: obligation.id,
    amount,
    recognizedAt: new Date().toISOString(),
    trigger: opts?.trigger || obligation.trigger,
    journalEntryNo: journal?.entryNo,
    status: 'RECOGNIZED',
  };

  obligation.recognizedAmount = +(obligation.recognizedAmount + amount).toFixed(2);
  obligation.deferredAmount = +(obligation.allocatedAmount - obligation.recognizedAmount).toFixed(2);
  contract.schedule.unshift(entry);

  let status: ContractStatus = contract.status;
  let completedAt: Date | null = row.completedAt;
  if (obligation.deferredAmount <= 0.01) {
    status = 'COMPLETED';
    completedAt = new Date();
    contract.status = 'COMPLETED';
    contract.completedAt = completedAt.toISOString();
  }

  const updated = await prisma.fhRevenueContract.update({
    where: { id: row.id },
    data: {
      obligations: contract.obligations as object[],
      schedule: contract.schedule as object[],
      status,
      completedAt,
    },
  });
  contract = mapContract(updated);

  return {
    ok: true,
    contract,
    entry,
    journal,
    recognizedAmount: amount,
    remainingDeferred: obligation.deferredAmount,
    message: `Recognized ${amount} ${contract.currency} — ${contract.contractNo}`,
  };
}

export async function recognizeOnTrigger(
  invoiceId: string,
  trigger: RecognitionTrigger,
  opts?: { postToGl?: boolean },
) {
  const contract = await getRevenueContract(invoiceId);
  if (!contract) return { ok: false, error: 'No revenue contract for invoice' };
  const obligation = contract.obligations[0];
  if (obligation.trigger !== trigger && trigger !== 'INVOICE') {
    return {
      ok: false,
      error: `Trigger mismatch — obligation expects ${obligation.trigger}, got ${trigger}`,
      contract,
    };
  }
  return recognizeRevenue(contract.id, { trigger, postToGl: opts?.postToGl });
}

export async function getDeferredRevenueSummary() {
  const contracts = await listRevenueContracts();
  const active = contracts.filter((c) => c.status === 'ACTIVE');
  let totalDeferred = 0;
  let totalRecognized = 0;
  let totalContractValue = 0;
  for (const c of active) {
    totalContractValue += c.transactionPrice;
    for (const o of c.obligations) {
      totalDeferred += o.deferredAmount;
      totalRecognized += o.recognizedAmount;
    }
  }
  const completed = contracts.filter((c) => c.status === 'COMPLETED').length;
  return {
    activeContracts: active.length,
    completedContracts: completed,
    totalContractValue: +totalContractValue.toFixed(2),
    totalDeferred: +totalDeferred.toFixed(2),
    totalRecognized: +totalRecognized.toFixed(2),
  };
}

export async function processInvoiceRevRec(inv: any, opts?: {
  entityCode?: string;
  trigger?: RecognitionTrigger;
  deferOnCreate?: boolean;
  recognizeImmediately?: boolean;
}) {
  const meta = inv.meta || {};
  const entityCode = opts?.entityCode || meta.legalEntity?.code || 'HT-AE';
  const trigger = opts?.trigger || (meta.o2c?.billTrigger === 'delivery' ? 'DELIVERY' : 'INVOICE');

  const created = await createContractFromInvoice(inv, { trigger, entityCode });
  if (!created.ok || !created.contract) return { ok: false, error: 'Contract create failed' };

  let deferJournal = null;
  if (opts?.deferOnCreate !== false && !opts?.recognizeImmediately) {
    const defer = await deferRevenueOnInvoice(inv, entityCode);
    deferJournal = defer.journal;
  }

  let recognizeResult = null;
  if (opts?.recognizeImmediately || trigger === 'DELIVERY') {
    recognizeResult = await recognizeRevenue(created.contract.id, { trigger, postToGl: true });
  }

  return {
    ok: true,
    contract: created.contract,
    deferJournal,
    recognizeResult,
    message:
      trigger === 'DELIVERY'
        ? 'Bill-on-delivery: revenue recognized at invoice (performance obligation satisfied)'
        : 'Revenue deferred to contract liability — recognize on delivery',
  };
}
