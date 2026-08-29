/**
 * HPay hosted checkout — first-party pay links for AR invoices (not Stripe).
 * Token URL: /{locale}/pay/hpay/{token}
 */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { invoicesDb, paymentsDb, journalDb, glAccountsDb, fiscalPeriodsDb } from '../core/db';
import { prisma } from '../core/prisma';

const DATA_DIR = path.join(process.cwd(), 'data');
const LINKS_PATH = path.join(DATA_DIR, 'hpay-pay-links.json');

export type HpayRail = 'wallet' | 'bank' | 'card';

export type HpayPayLink = {
  token: string;
  sessionId: string;
  invoiceId: string;
  invoiceNo: string;
  customerName: string;
  amount: number;
  currency: string;
  customerEmail?: string;
  status: 'open' | 'paid' | 'expired';
  rail?: HpayRail;
  paidAt?: string;
  paymentId?: string;
  createdAt: string;
};

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readLinks(): HpayPayLink[] {
  ensureDir();
  if (!fs.existsSync(LINKS_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(LINKS_PATH, 'utf8')) as HpayPayLink[];
  } catch {
    return [];
  }
}

function writeLinks(rows: HpayPayLink[]) {
  ensureDir();
  fs.writeFileSync(LINKS_PATH, JSON.stringify(rows, null, 2));
}

export function payLinkConfigured(): boolean {
  return true;
}

export function getPayLink(token: string): HpayPayLink | null {
  const key = String(token || '').trim();
  if (!key) return null;
  return readLinks().find((r) => r.token === key) || null;
}

export function publicCheckoutPayload(link: HpayPayLink) {
  return {
    token: link.token,
    invoiceNo: link.invoiceNo,
    customerName: link.customerName,
    amount: link.amount,
    currency: link.currency,
    status: link.status,
    rails: [
      { id: 'wallet', label: 'HPay Wallet' },
      { id: 'bank', label: 'Bank / TT' },
      { id: 'card', label: 'HPay Card' },
    ],
    merchant: 'Harvics Trade',
  };
}

export async function createInvoicePayLink(opts: {
  invoiceId: string;
  invoiceNo: string;
  customerName: string;
  amount: number;
  currency: string;
  origin: string;
  locale?: string;
  customerEmail?: string;
}): Promise<{ url: string; sessionId: string; token: string } | null> {
  if (opts.amount <= 0) return null;
  const token = crypto.randomBytes(18).toString('hex');
  const sessionId = `hpay_${token.slice(0, 16)}`;
  const locale = opts.locale || 'en';
  const origin = opts.origin.replace(/\/$/, '');
  const row: HpayPayLink = {
    token,
    sessionId,
    invoiceId: opts.invoiceId,
    invoiceNo: opts.invoiceNo,
    customerName: opts.customerName,
    amount: +Number(opts.amount).toFixed(2),
    currency: opts.currency || 'USD',
    customerEmail: opts.customerEmail,
    status: 'open',
    createdAt: new Date().toISOString(),
  };
  const rows = readLinks().filter((r) => !(r.invoiceId === opts.invoiceId && r.status === 'open'));
  rows.unshift(row);
  writeLinks(rows.slice(0, 500));
  return {
    url: `${origin}/${locale}/pay/hpay/${token}`,
    sessionId,
    token,
  };
}

async function postCollectionJournal(opts: {
  invoiceNo: string;
  amount: number;
  currency: string;
}) {
  const open = (await fiscalPeriodsDb.list({ status: 'Open' }, 1, 1)).data[0];
  if (!open) return null;
  const [debitAcct, creditAcct] = await Promise.all([
    glAccountsDb.getByCode('1000'),
    glAccountsDb.getByCode('1100'),
  ]);
  if (!debitAcct || !creditAcct) return null;
  const count = await journalDb.count();
  return journalDb.create(
    {
      entryNo: `JE-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`,
      description: `HPay collection ${opts.invoiceNo}`,
      debit: '1000',
      credit: '1100',
      amount: opts.amount,
      currency: opts.currency,
      postedDate: new Date().toISOString().slice(0, 10),
      status: 'Posted',
      periodCode: open.periodCode,
    },
    'finance.journal.posted',
  );
}

const RAIL_METHOD: Record<HpayRail, string> = {
  wallet: 'HPay Wallet',
  bank: 'HPay Bank',
  card: 'HPay Card',
};

export async function settleHpayCheckout(token: string, rail: HpayRail = 'wallet') {
  const link = getPayLink(token);
  if (!link) return { ok: false as const, status: 404, error: 'Pay link not found' };
  if (link.status === 'paid') {
    return {
      ok: true as const,
      alreadyPaid: true,
      invoiceNo: link.invoiceNo,
      paymentId: link.paymentId,
    };
  }
  if (link.status !== 'open') {
    return { ok: false as const, status: 400, error: `Link is ${link.status}` };
  }

  const matching = await invoicesDb.list({ invoiceNo: link.invoiceNo }, 1, 1);
  const inv = matching.data[0];
  if (!inv) return { ok: false as const, status: 404, error: 'Invoice not found' };

  const alreadyPaid = Array.isArray(inv.payments)
    ? inv.payments.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0)
    : 0;
  const outstanding = +(Number(inv.amount) - alreadyPaid).toFixed(2);
  if (outstanding <= 0.009) {
    markPaid(link.token, { paymentId: 'already-settled' });
    return { ok: true as const, alreadyPaid: true, invoiceNo: link.invoiceNo };
  }

  const amt = Math.min(link.amount, outstanding);
  const reference = `hpay:${link.sessionId}`;
  const dup = await prisma.payment.findFirst({ where: { reference } });
  if (dup) {
    markPaid(link.token, { paymentId: dup.id, rail });
    return { ok: true as const, alreadyPaid: true, invoiceNo: link.invoiceNo, paymentId: dup.id };
  }

  const payment = await paymentsDb.create(
    {
      invoiceNo: link.invoiceNo,
      amount: amt,
      currency: link.currency,
      method: RAIL_METHOD[rail] || 'HPay',
      reference,
      receivedDate: new Date().toISOString().slice(0, 10),
    },
    'finance.payment.received',
  );

  const newPaid = +(alreadyPaid + amt).toFixed(2);
  const nextStatus = newPaid >= Number(inv.amount) - 0.009 ? 'Paid' : 'Partial';
  await invoicesDb.update(inv.id, { status: nextStatus });
  await postCollectionJournal({ invoiceNo: link.invoiceNo, amount: amt, currency: link.currency });
  markPaid(link.token, { paymentId: payment.id, rail });

  return {
    ok: true as const,
    alreadyPaid: false,
    invoiceNo: link.invoiceNo,
    invoiceId: inv.id,
    paymentId: payment.id,
    invoiceStatus: nextStatus,
    amount: amt,
    rail: RAIL_METHOD[rail],
  };
}

function markPaid(token: string, extra: { paymentId?: string; rail?: HpayRail }) {
  const rows = readLinks();
  const idx = rows.findIndex((r) => r.token === token);
  if (idx < 0) return;
  rows[idx] = {
    ...rows[idx],
    status: 'paid',
    paidAt: new Date().toISOString(),
    paymentId: extra.paymentId,
    rail: extra.rail || rows[idx].rail,
  };
  writeLinks(rows);
}
