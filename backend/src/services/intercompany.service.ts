/**
 * Intercompany transactions — paired due-to/due-from journals across legal entities.
 * PostgreSQL-backed via FhIntercompanyTransaction.
 */
import { fiscalPeriodsDb, glAccountsDb, journalDb } from '../core/db';
import { prisma } from '../core/prisma';
import { ensureFinanceDbSeeded } from './financeDbBootstrap.service';
import {
  entityTagPrefix,
  getLegalEntity,
  tagJournalEntry,
} from './entityMaster.service';

export type ICTransactionType =
  | 'TRADE'
  | 'INVENTORY_TRANSFER'
  | 'MANAGEMENT_FEE'
  | 'LOAN'
  | 'DIVIDEND'
  | 'LOGISTICS_CHARGE'
  | 'TREASURY_TRANSFER';

export type ICTransactionStatus = 'DRAFT' | 'POSTED' | 'SETTLED' | 'ELIMINATED';

export type ICTransaction = {
  id: string;
  txnNo: string;
  type: ICTransactionType;
  fromEntityCode: string;
  toEntityCode: string;
  amount: number;
  currency: string;
  description: string;
  status: ICTransactionStatus;
  sellerJournalEntryNo?: string;
  buyerJournalEntryNo?: string;
  reference?: string;
  postedAt?: string;
  createdAt: string;
};

function mapIc(row: {
  id: string;
  txnNo: string;
  type: string;
  fromEntityCode: string;
  toEntityCode: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  sellerJournalEntryNo: string | null;
  buyerJournalEntryNo: string | null;
  reference: string | null;
  postedAt: Date | null;
  createdAt: Date;
}): ICTransaction {
  return {
    id: row.id,
    txnNo: row.txnNo,
    type: row.type as ICTransactionType,
    fromEntityCode: row.fromEntityCode,
    toEntityCode: row.toEntityCode,
    amount: row.amount,
    currency: row.currency,
    description: row.description,
    status: row.status as ICTransactionStatus,
    sellerJournalEntryNo: row.sellerJournalEntryNo || undefined,
    buyerJournalEntryNo: row.buyerJournalEntryNo || undefined,
    reference: row.reference || undefined,
    postedAt: row.postedAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

async function postEntityJournal(opts: {
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
  const entryNo = `JE-IC-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
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
    'finance.ic.journal',
  );
  await tagJournalEntry(entryNo, opts.entityCode);
  return journal;
}

const IC_ACCOUNTS = {
  dueFrom: '1250',
  dueTo: '2250',
  icRevenue: '4900',
  icExpense: '5900',
  cash: '1000',
};

function journalPattern(type: ICTransactionType): { seller: { debit: string; credit: string }; buyer: { debit: string; credit: string } } {
  switch (type) {
    case 'LOAN':
    case 'TREASURY_TRANSFER':
      return {
        seller: { debit: IC_ACCOUNTS.dueFrom, credit: IC_ACCOUNTS.cash },
        buyer: { debit: IC_ACCOUNTS.cash, credit: IC_ACCOUNTS.dueTo },
      };
    case 'MANAGEMENT_FEE':
    case 'LOGISTICS_CHARGE':
      return {
        seller: { debit: IC_ACCOUNTS.dueFrom, credit: IC_ACCOUNTS.icRevenue },
        buyer: { debit: IC_ACCOUNTS.icExpense, credit: IC_ACCOUNTS.dueTo },
      };
    case 'DIVIDEND':
      return {
        seller: { debit: IC_ACCOUNTS.dueTo, credit: IC_ACCOUNTS.cash },
        buyer: { debit: IC_ACCOUNTS.cash, credit: IC_ACCOUNTS.dueFrom },
      };
    case 'INVENTORY_TRANSFER':
    case 'TRADE':
    default:
      return {
        seller: { debit: IC_ACCOUNTS.dueFrom, credit: IC_ACCOUNTS.icRevenue },
        buyer: { debit: IC_ACCOUNTS.icExpense, credit: IC_ACCOUNTS.dueTo },
      };
  }
}

export async function listICTransactions(filters?: { from?: string; to?: string; status?: string }) {
  await ensureFinanceDbSeeded();
  const rows = await prisma.fhIntercompanyTransaction.findMany({
    where: {
      ...(filters?.from ? { fromEntityCode: filters.from.toUpperCase() } : {}),
      ...(filters?.to ? { toEntityCode: filters.to.toUpperCase() } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapIc);
}

export async function getICTransaction(id: string): Promise<ICTransaction | null> {
  await ensureFinanceDbSeeded();
  const row = await prisma.fhIntercompanyTransaction.findUnique({ where: { id } });
  return row ? mapIc(row) : null;
}

export async function createICTransaction(input: {
  type: ICTransactionType;
  fromEntityCode: string;
  toEntityCode: string;
  amount: number;
  currency?: string;
  description?: string;
  reference?: string;
  post?: boolean;
}) {
  await ensureFinanceDbSeeded();
  const from = await getLegalEntity(input.fromEntityCode);
  const to = await getLegalEntity(input.toEntityCode);
  if (!from) return { ok: false, error: `Unknown seller entity: ${input.fromEntityCode}` };
  if (!to) return { ok: false, error: `Unknown buyer entity: ${input.toEntityCode}` };
  if (from.code === to.code) return { ok: false, error: 'Intercompany requires two different entities' };
  const amount = +Number(input.amount).toFixed(2);
  if (amount <= 0) return { ok: false, error: 'Amount must be positive' };

  const count = await prisma.fhIntercompanyTransaction.count();
  const txnNo = `IC-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  const currency = input.currency || from.functionalCurrency || 'USD';
  const desc = input.description || `${input.type} ${from.code} → ${to.code}`;

  let status: ICTransactionStatus = 'DRAFT';
  let sellerJournalEntryNo: string | undefined;
  let buyerJournalEntryNo: string | undefined;
  let postedAt: Date | undefined;

  if (input.post !== false) {
    const pattern = journalPattern(input.type);
    const sellerJe = await postEntityJournal({
      entityCode: from.code,
      description: `IC ${txnNo}: ${desc}`,
      debit: pattern.seller.debit,
      credit: pattern.seller.credit,
      amount,
      currency,
    });
    const buyerJe = await postEntityJournal({
      entityCode: to.code,
      description: `IC ${txnNo}: ${desc}`,
      debit: pattern.buyer.debit,
      credit: pattern.buyer.credit,
      amount,
      currency,
    });
    if (!sellerJe || !buyerJe) {
      const draft = await prisma.fhIntercompanyTransaction.create({
        data: {
          id: `ic-${Date.now()}-${count + 1}`,
          txnNo,
          type: input.type,
          fromEntityCode: from.code,
          toEntityCode: to.code,
          amount,
          currency,
          description: desc,
          status: 'DRAFT',
          reference: input.reference || null,
        },
      });
      return {
        ok: false,
        error: 'IC journal post failed — seed IC CoA accounts (1250, 2250, 4900, 5900) and open fiscal period',
        transaction: mapIc(draft),
      };
    }
    status = 'POSTED';
    sellerJournalEntryNo = sellerJe.entryNo;
    buyerJournalEntryNo = buyerJe.entryNo;
    postedAt = new Date();
  }

  const row = await prisma.fhIntercompanyTransaction.create({
    data: {
      id: `ic-${Date.now()}-${count + 1}`,
      txnNo,
      type: input.type,
      fromEntityCode: from.code,
      toEntityCode: to.code,
      amount,
      currency,
      description: desc,
      status,
      sellerJournalEntryNo: sellerJournalEntryNo || null,
      buyerJournalEntryNo: buyerJournalEntryNo || null,
      reference: input.reference || null,
      postedAt: postedAt || null,
    },
  });

  return { ok: true, transaction: mapIc(row) };
}

export async function computeICBalances() {
  const txns = (await listICTransactions()).filter((t) => t.status === 'POSTED' || t.status === 'SETTLED');
  const matrix: Record<string, Record<string, number>> = {};

  const bump = (from: string, to: string, amt: number) => {
    if (!matrix[from]) matrix[from] = {};
    matrix[from][to] = (matrix[from][to] || 0) + amt;
  };

  for (const t of txns) {
    bump(t.fromEntityCode, t.toEntityCode, t.amount);
  }

  const pairs: { from: string; to: string; grossDueFrom: number; grossDueTo: number; net: number }[] = [];
  const codes = new Set<string>();
  for (const t of txns) {
    codes.add(t.fromEntityCode);
    codes.add(t.toEntityCode);
  }
  const codeList = [...codes].sort();
  for (const a of codeList) {
    for (const b of codeList) {
      if (a >= b) continue;
      const ab = matrix[a]?.[b] || 0;
      const ba = matrix[b]?.[a] || 0;
      if (ab === 0 && ba === 0) continue;
      pairs.push({
        from: ab >= ba ? a : b,
        to: ab >= ba ? b : a,
        grossDueFrom: ab,
        grossDueTo: ba,
        net: +(ab - ba).toFixed(2),
      });
    }
  }
  return { matrix, pairs, transactionCount: txns.length };
}

export async function netICPair(fromCode: string, toCode: string) {
  const balances = await computeICBalances();
  const pair = balances.pairs.find(
    (p) =>
      (p.from === fromCode.toUpperCase() && p.to === toCode.toUpperCase()) ||
      (p.from === toCode.toUpperCase() && p.to === fromCode.toUpperCase()),
  );
  if (!pair || Math.abs(pair.net) < 0.01) {
    return { ok: false, error: 'No net IC balance to settle between these entities' };
  }
  const netAmount = Math.abs(pair.net);
  const payer = pair.net > 0 ? pair.to : pair.from;
  const receiver = pair.net > 0 ? pair.from : pair.to;
  const result = await createICTransaction({
    type: 'TREASURY_TRANSFER',
    fromEntityCode: payer,
    toEntityCode: receiver,
    amount: netAmount,
    description: `IC netting settlement ${payer} ↔ ${receiver}`,
    reference: `NET-${fromCode}-${toCode}`,
    post: true,
  });
  if (result.ok && result.transaction) {
    await prisma.fhIntercompanyTransaction.update({
      where: { id: result.transaction.id },
      data: { status: 'SETTLED' },
    });
    result.transaction.status = 'SETTLED';
  }
  return result;
}
