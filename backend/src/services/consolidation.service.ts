/**
 * Group consolidation — entity-scoped trial balance, IC elimination preview, group rollup.
 * PostgreSQL-backed via FhConsolidationRun.
 */
import { fiscalPeriodsDb, glAccountsDb, journalDb } from '../core/db';
import { prisma } from '../core/prisma';
import { ensureFinanceDbSeeded } from './financeDbBootstrap.service';
import {
  buildEntityHierarchy,
  entityTagPrefix,
  getGlobalHouseOverview,
  getJournalEntityTags,
  listEliminationRules,
  listLegalEntities,
  parseEntityFromDescription,
  tagJournalEntry,
} from './entityMaster.service';
import { computeICBalances } from './intercompany.service';

const GROUP_ENTITY = 'HGH';

export type EliminationLine = {
  ruleCode: string;
  label: string;
  description: string;
  amount: number;
  debitAccount: string;
  creditAccount: string;
  detail?: string;
};

export type ConsolidationRun = {
  id: string;
  runNo: string;
  periodCode: string | null;
  postedAt: string;
  dryRun: boolean;
  lines: EliminationLine[];
  journals: { entryNo: string; ruleCode: string; amount: number }[];
  totalAmount: number;
  status: 'PREVIEW' | 'POSTED';
};

function mapRun(row: {
  id: string;
  runNo: string;
  periodCode: string | null;
  postedAt: Date;
  dryRun: boolean;
  lines: unknown;
  journals: unknown;
  totalAmount: number;
  status: string;
}): ConsolidationRun {
  return {
    id: row.id,
    runNo: row.runNo,
    periodCode: row.periodCode,
    postedAt: row.postedAt.toISOString(),
    dryRun: row.dryRun,
    lines: (row.lines as EliminationLine[]) || [],
    journals: (row.journals as ConsolidationRun['journals']) || [],
    totalAmount: row.totalAmount,
    status: row.status as ConsolidationRun['status'],
  };
}

async function allPostedJournals() {
  return journalDb.allPosted();
}

async function postEliminationJournal(opts: {
  description: string;
  debit: string;
  credit: string;
  amount: number;
  currency?: string;
  periodCode?: string | null;
}) {
  const open = (await fiscalPeriodsDb.list({ status: 'Open' }, 1, 1)).data[0];
  if (!open) return null;
  const periodCode = opts.periodCode || open.periodCode;
  const [debitAcct, creditAcct] = await Promise.all([
    glAccountsDb.getByCode(opts.debit),
    glAccountsDb.getByCode(opts.credit),
  ]);
  if (!debitAcct || !creditAcct) return null;
  const count = await journalDb.count();
  const entryNo = `JE-ELIM-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  const journal = await journalDb.create(
    {
      entryNo,
      description: `${entityTagPrefix(GROUP_ENTITY)} [ELIM] ${opts.description}`,
      debit: opts.debit,
      credit: opts.credit,
      amount: opts.amount,
      currency: opts.currency || 'USD',
      postedDate: new Date().toISOString().slice(0, 10),
      status: 'Posted',
      periodCode,
      entityCode: GROUP_ENTITY,
    },
    'finance.consolidation.elimination',
  );
  await tagJournalEntry(entryNo, GROUP_ENTITY);
  return journal;
}

export async function buildEliminationLines(periodCode?: string): Promise<EliminationLine[]> {
  const rules = await listEliminationRules();
  const ic = await computeICBalances();
  const groupTB = await buildGroupTrialBalance(periodCode);
  const lines: EliminationLine[] = [];

  const icAccount = (code: string) => {
    const row = groupTB.rows.find((r) => r.accountCode === code);
    return row ? Math.abs(row.balance) : 0;
  };

  const dueFrom = icAccount('1250') || icAccount('1260');
  const dueTo = icAccount('2250') || icAccount('2260');
  const icRev = icAccount('4900');
  const icCogs = icAccount('5900');

  const arApRule = rules.find((r) => r.code === 'IC_AR_AP');
  if (arApRule) {
    let amount = 0;
    if (dueFrom > 0 && dueTo > 0) {
      amount = +Math.min(dueFrom, dueTo).toFixed(2);
    } else {
      amount = +ic.pairs.reduce((s, p) => s + Math.abs(p.net), 0).toFixed(2);
    }
    if (amount >= 0.01) {
      lines.push({
        ruleCode: arApRule.code,
        label: arApRule.label,
        description: arApRule.description,
        amount,
        debitAccount: arApRule.debitAccount,
        creditAccount: arApRule.creditAccount,
        detail: dueFrom && dueTo
          ? `Group TB IC receivable/payable net — Dr ${dueTo.toFixed(0)} / Cr ${dueFrom.toFixed(0)}`
          : `IC pair net across ${ic.pairs.length} affiliate relationship(s)`,
      });
    }
  }

  const revRule = rules.find((r) => r.code === 'IC_REV_COGS');
  if (revRule) {
    let amount = 0;
    if (icRev > 0 && icCogs > 0) {
      amount = +Math.min(icRev, icCogs).toFixed(2);
    } else if (ic.transactionCount > 0) {
      amount = +ic.pairs.reduce((s, p) => s + p.grossDueFrom + p.grossDueTo, 0).toFixed(2);
    }
    if (amount >= 0.01) {
      lines.push({
        ruleCode: revRule.code,
        label: revRule.label,
        description: revRule.description,
        amount,
        debitAccount: revRule.debitAccount,
        creditAccount: revRule.creditAccount,
        detail: icRev && icCogs
          ? `Eliminate IC margin — revenue ${icRev.toFixed(0)} vs COGS ${icCogs.toFixed(0)}`
          : `IC trade volume — ${ic.transactionCount} posted transaction(s)`,
      });
    }
  }

  return lines;
}

export async function listConsolidationRuns(limit = 20) {
  await ensureFinanceDbSeeded();
  const rows = await prisma.fhConsolidationRun.findMany({
    orderBy: { postedAt: 'desc' },
    take: limit,
  });
  return rows.map(mapRun);
}

export async function getLastPostedRun(periodCode?: string | null) {
  const runs = (await listConsolidationRuns(100)).filter((r) => r.status === 'POSTED' && !r.dryRun);
  if (periodCode) return runs.find((r) => r.periodCode === periodCode) || null;
  return runs[0] || null;
}

export async function executeConsolidationEliminations(opts?: {
  periodCode?: string;
  dryRun?: boolean;
  force?: boolean;
  currency?: string;
}) {
  await ensureFinanceDbSeeded();
  const dryRun = Boolean(opts?.dryRun);
  const open = (await fiscalPeriodsDb.list({ status: 'Open' }, 1, 1)).data[0];
  const periodCode = opts?.periodCode || open?.periodCode || null;

  if (!dryRun && !open) {
    return { ok: false, error: 'No open fiscal period — open a period in Module #1 before posting eliminations' };
  }

  if (!dryRun && !opts?.force) {
    const last = await getLastPostedRun(periodCode);
    if (last) {
      return {
        ok: false,
        error: `Eliminations already posted for period ${periodCode} — run ${last.runNo}. Pass force:true to re-post.`,
        lastRun: last,
      };
    }
  }

  const lines = await buildEliminationLines(periodCode || undefined);
  if (!lines.length) {
    return {
      ok: false,
      error: 'No elimination entries required — post intercompany transactions and seed IC CoA (1250, 2250, 4900, 5900) first',
      lines: [],
    };
  }

  const postedCount = await prisma.fhConsolidationRun.count({ where: { status: 'POSTED' } });
  const runNo = `ELIM-${new Date().getFullYear()}-${String(postedCount + 1).padStart(4, '0')}`;
  const journals: ConsolidationRun['journals'] = [];

  if (!dryRun) {
    for (const line of lines) {
      const journal = await postEliminationJournal({
        description: `${line.label} — ${line.detail || line.ruleCode}`,
        debit: line.debitAccount,
        credit: line.creditAccount,
        amount: line.amount,
        currency: opts?.currency || 'USD',
        periodCode,
      });
      if (!journal) {
        return {
          ok: false,
          error: `Elimination GL failed for ${line.ruleCode} — ensure accounts ${line.debitAccount}/${line.creditAccount} exist (Seed IC CoA) and fiscal period is open`,
          lines,
          posted: journals,
        };
      }
      journals.push({ entryNo: journal.entryNo, ruleCode: line.ruleCode, amount: line.amount });
    }
  }

  const run: ConsolidationRun = {
    id: `elim-run-${Date.now()}`,
    runNo,
    periodCode,
    postedAt: new Date().toISOString(),
    dryRun,
    lines,
    journals,
    totalAmount: +lines.reduce((s, l) => s + l.amount, 0).toFixed(2),
    status: dryRun ? 'PREVIEW' : 'POSTED',
  };

  if (!dryRun) {
    const saved = await prisma.fhConsolidationRun.create({
      data: {
        runNo,
        periodCode,
        postedAt: new Date(),
        dryRun: false,
        lines: lines as object[],
        journals: journals as object[],
        totalAmount: run.totalAmount,
        status: 'POSTED',
      },
    });
    run.id = saved.id;
  }

  const groupTB = await buildGroupTrialBalance(periodCode || undefined);

  return {
    ok: true,
    dryRun,
    run,
    lines,
    journals,
    totalAmount: run.totalAmount,
    groupTrialBalanceAfter: groupTB,
    message: dryRun
      ? `Preview: ${lines.length} elimination line(s), ${fmtUsd(run.totalAmount)} total`
      : `Posted ${journals.length} elimination journal(s) — ${runNo}`,
  };
}

function fmtUsd(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export async function previewEliminations() {
  const rules = await listEliminationRules();
  const ic = await computeICBalances();
  return {
    rules,
    icBalances: ic,
    eliminationLines: [] as EliminationLine[],
    totalEliminationAmount: 0,
    hierarchy: await buildEntityHierarchy(),
    note: 'Use POST /global-house/consolidation/eliminate for live preview with group TB amounts',
  };
}

export async function previewEliminationsAsync(periodCode?: string) {
  const rules = await listEliminationRules();
  const ic = await computeICBalances();
  const eliminationLines = await buildEliminationLines(periodCode);
  const lastRun = await getLastPostedRun(periodCode || null);
  return {
    rules,
    icBalances: ic,
    eliminationLines,
    totalEliminationAmount: eliminationLines.reduce((s, l) => s + l.amount, 0),
    hierarchy: await buildEntityHierarchy(),
    lastPostedRun: lastRun,
    recentRuns: await listConsolidationRuns(5),
  };
}

export async function getConsolidationDashboard(periodCode?: string) {
  const [groupTB, elimPreview, overview] = await Promise.all([
    buildGroupTrialBalance(periodCode),
    previewEliminationsAsync(periodCode),
    getGlobalHouseOverview(),
  ]);
  return {
    overview,
    groupTrialBalance: groupTB,
    eliminations: elimPreview,
    periodCode: periodCode || null,
  };
}

export async function computeEntityTrialBalance(entityCode: string, periodCode?: string) {
  const entity = entityCode.toUpperCase();
  const accounts = (await glAccountsDb.list({ status: 'Active' }, 1, 500)).data;
  const tags = await getJournalEntityTags();
  const journals = periodCode
    ? (await journalDb.list({ status: 'Posted', periodCode }, 1, 10000)).data
    : await allPostedJournals();

  const entityJournals = journals.filter((j: any) => {
    const tagged = tags[j.entryNo] || j.entityCode || parseEntityFromDescription(j.description);
    return tagged === entity;
  });

  const debitMap: Record<string, number> = {};
  const creditMap: Record<string, number> = {};
  for (const j of entityJournals) {
    const amt = Number(j.amount) || 0;
    if (j.debit) debitMap[j.debit] = (debitMap[j.debit] || 0) + amt;
    if (j.credit) creditMap[j.credit] = (creditMap[j.credit] || 0) + amt;
  }

  const rows = accounts.map((a: any) => {
    const debits = debitMap[a.accountCode] || 0;
    const credits = creditMap[a.accountCode] || 0;
    const balance = a.normalBalance === 'Credit' ? credits - debits : debits - credits;
    return {
      accountCode: a.accountCode,
      name: a.name,
      type: a.type,
      debits,
      credits,
      balance,
    };
  }).filter((r) => Math.abs(r.debits) > 0.001 || Math.abs(r.credits) > 0.001 || Math.abs(r.balance) > 0.001);

  const totalDebits = rows.reduce((s, r) => s + r.debits, 0);
  const totalCredits = rows.reduce((s, r) => s + r.credits, 0);
  return {
    entityCode: entity,
    rows,
    totalDebits,
    totalCredits,
    journalCount: entityJournals.length,
    periodCode: periodCode || null,
  };
}

export async function buildGroupTrialBalance(periodCode?: string) {
  const entities = await listLegalEntities();
  const entityTBs = await Promise.all(entities.map((e) => computeEntityTrialBalance(e.code, periodCode)));
  const accountMap = new Map<string, { accountCode: string; name: string; type: string; debits: number; credits: number; byEntity: Record<string, number> }>();

  for (const tb of entityTBs) {
    for (const row of tb.rows) {
      if (!accountMap.has(row.accountCode)) {
        accountMap.set(row.accountCode, {
          accountCode: row.accountCode,
          name: row.name,
          type: row.type,
          debits: 0,
          credits: 0,
          byEntity: {},
        });
      }
      const acc = accountMap.get(row.accountCode)!;
      acc.debits += row.debits;
      acc.credits += row.credits;
      acc.byEntity[tb.entityCode] = (acc.byEntity[tb.entityCode] || 0) + row.balance;
    }
  }

  const rows = [...accountMap.values()].map((a) => ({
    ...a,
    balance: a.debits - a.credits,
  }));

  return {
    group: await getGlobalHouseOverview(),
    entities: entityTBs.map((tb) => ({
      entityCode: tb.entityCode,
      journalCount: tb.journalCount,
      totalDebits: tb.totalDebits,
      totalCredits: tb.totalCredits,
    })),
    rows,
    totalDebits: rows.reduce((s, r) => s + r.debits, 0),
    totalCredits: rows.reduce((s, r) => s + r.credits, 0),
  };
}
