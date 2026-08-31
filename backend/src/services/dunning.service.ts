/**
 * Oracle-style staged dunning letters for AR.
 * Escalates by days overdue; history stored in invoice [[META]] dunning block.
 */
import { getCustomerMaster } from './arMasterData.service';
import { emailConfigured, sendDunningEmail } from './invoiceDocument.service';

export type DunningStage = {
  stage: number;
  code: string;
  minDaysOverdue: number;
  label: string;
  subjectPrefix: string;
};

export const DUNNING_STAGES: DunningStage[] = [
  { stage: 1, code: 'REMINDER', minDaysOverdue: 1, label: 'Payment reminder', subjectPrefix: 'Payment Reminder' },
  { stage: 2, code: 'NOTICE_1', minDaysOverdue: 14, label: 'First dunning notice', subjectPrefix: 'First Notice' },
  { stage: 3, code: 'NOTICE_2', minDaysOverdue: 30, label: 'Second dunning notice', subjectPrefix: 'Second Notice' },
  { stage: 4, code: 'FINAL', minDaysOverdue: 60, label: 'Final notice', subjectPrefix: 'Final Notice' },
  { stage: 5, code: 'PRE_LEGAL', minDaysOverdue: 90, label: 'Pre-legal escalation', subjectPrefix: 'Urgent — Pre-Legal' },
];

export type DunningHistoryEntry = {
  stage: number;
  code: string;
  sentAt: string;
  toEmail: string;
  messageId?: string;
  daysOverdue: number;
  outstanding: number;
};

function unpackMeta(notes?: string | null): { meta: Record<string, any>; notes: string } {
  const raw = String(notes || '');
  const m = raw.match(/^\[\[META\]\]([\s\S]*?)\[\[\/META\]\]\n?([\s\S]*)$/);
  if (!m) return { meta: {}, notes: raw };
  try {
    return { meta: JSON.parse(m[1]), notes: (m[2] || '').trim() };
  } catch {
    return { meta: {}, notes: raw };
  }
}

export function packMeta(meta: Record<string, any>, notes?: string): string | undefined {
  const note = notes ? String(notes).trim() : '';
  if (!Object.keys(meta).length && !note) return undefined;
  if (!Object.keys(meta).length) return note;
  return `[[META]]${JSON.stringify(meta)}[[/META]]${note ? `\n${note}` : ''}`;
}

export function invoiceOutstanding(inv: any): { paid: number; outstanding: number } {
  const paid = Array.isArray(inv.payments)
    ? inv.payments.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0)
    : 0;
  return { paid, outstanding: Math.max(0, +(Number(inv.amount) - paid).toFixed(2)) };
}

export function daysOverdue(inv: any): number {
  const now = Date.now();
  const due = inv.dueDate ? new Date(inv.dueDate).getTime() : now;
  return Math.max(0, Math.floor((now - due) / 86400000));
}

export function getDunningState(inv: any): {
  lastStage: number;
  history: DunningHistoryEntry[];
  nextStage: DunningStage | null;
  eligible: boolean;
  daysOverdue: number;
  outstanding: number;
} {
  const { meta } = unpackMeta(inv.notes);
  const dunning = meta.dunning || {};
  const history: DunningHistoryEntry[] = Array.isArray(dunning.history) ? dunning.history : [];
  const lastStage = Number(dunning.lastStage) || 0;
  const od = daysOverdue(inv);
  const { outstanding } = invoiceOutstanding(inv);
  const next = DUNNING_STAGES.find((s) => s.stage === lastStage + 1) || null;
  const eligible = Boolean(next && od >= next.minDaysOverdue && outstanding > 0);
  return { lastStage, history, nextStage: next, eligible, daysOverdue: od, outstanding };
}

function esc(s: string) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function money(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(
    Number(n) || 0,
  );
}

export function buildDunningLetter(opts: {
  inv: any;
  stage: DunningStage;
  daysOverdue: number;
  outstanding: number;
  master?: { contactEmail?: string; contactName?: string } | null;
}): { subject: string; html: string; text: string } {
  const { inv, stage, daysOverdue: od, outstanding } = opts;
  const customer = inv.customerName || 'Customer';
  const currency = inv.currency || 'USD';
  const { meta } = unpackMeta(inv.notes);
  const master = opts.master;
  const payLink = meta.payLinkUrl ? `<p><a href="${esc(meta.payLinkUrl)}">Pay now with HPay</a></p>` : '';
  const bank = meta.bankDetails ? `<p>Remit to: ${esc(meta.bankDetails)}</p>` : '';

  const bodies: Record<number, string> = {
    1: `<p>This is a courteous reminder that invoice <strong>${esc(inv.invoiceNo)}</strong> for <strong>${money(outstanding, currency)}</strong> was due on ${esc(inv.dueDate || 'the agreed date')} and is now ${od} day(s) past due.</p><p>Please arrange payment at your earliest convenience or advise us of any discrepancy.</p>`,
    2: `<p><strong>First formal notice.</strong> Invoice <strong>${esc(inv.invoiceNo)}</strong> remains unpaid: <strong>${money(outstanding, currency)}</strong> outstanding, ${od} days overdue.</p><p>Unless payment is received within 7 calendar days, your account may be placed on credit hold.</p>`,
    3: `<p><strong>Second dunning notice.</strong> Despite prior reminders, invoice <strong>${esc(inv.invoiceNo)}</strong> (${money(outstanding, currency)}) is ${od} days overdue.</p><p>Immediate settlement is required to avoid suspension of supply and referral to senior credit control.</p>`,
    4: `<p><strong>Final notice before escalation.</strong> Invoice <strong>${esc(inv.invoiceNo)}</strong> — ${money(outstanding, currency)} — is ${od} days overdue.</p><p>This is our final notice prior to credit hold, collection agency referral, and recovery of legal costs where applicable.</p>`,
    5: `<p><strong>Pre-legal escalation.</strong> Invoice <strong>${esc(inv.invoiceNo)}</strong> (${money(outstanding, currency)}, ${od} days overdue) will be passed to external recovery unless full payment is received within 5 business days.</p><p>All rights reserved under applicable trade and contract law.</p>`,
  };

  const body = bodies[stage.stage] || bodies[1];
  const subject = `${stage.subjectPrefix} — Invoice ${inv.invoiceNo} — ${customer}`;
  const html = `
    <p>Dear ${esc(master?.contactName || customer)},</p>
    ${body}
    ${bank}
    ${payLink}
    <p>Reference: ${esc(inv.invoiceNo)} · Original amount ${money(inv.amount, currency)} · Outstanding ${money(outstanding, currency)}</p>
    <p>— Harvics Trade · Accounts Receivable · Oracle-cross collections</p>
  `;
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return { subject, html, text };
}

export async function buildDunningQueue(invoices: any[]) {
  const queue = [];
  for (const inv of invoices) {
    if (!['Unpaid', 'Overdue', 'Partial'].includes(inv.status)) continue;
    const { outstanding } = invoiceOutstanding(inv);
    if (outstanding <= 0) continue;
    const state = getDunningState(inv);
    if (!state.eligible || !state.nextStage) continue;
    const master = await getCustomerMaster(inv.customerName || '');
    queue.push({
      id: inv.id,
      invoiceNo: inv.invoiceNo,
      customerName: inv.customerName,
      outstanding: state.outstanding,
      daysOverdue: state.daysOverdue,
      dueDate: inv.dueDate,
      lastStage: state.lastStage,
      nextStage: state.nextStage.stage,
      nextStageCode: state.nextStage.code,
      nextStageLabel: state.nextStage.label,
      contactEmail: master?.contactEmail || null,
      dunningCount: state.history.length,
      lastDunningAt: state.history.length ? state.history[state.history.length - 1].sentAt : null,
    });
  }
  return queue.sort((a: any, b: any) => b.daysOverdue - a.daysOverdue || b.outstanding - a.outstanding);
}

export async function sendStagedDunning(opts: {
  inv: any;
  stage?: number;
  toEmail?: string;
  dryRun?: boolean;
}): Promise<{
  ok: boolean;
  stage: DunningStage;
  preview?: { subject: string; html: string };
  send?: Awaited<ReturnType<typeof sendDunningEmail>>;
  error?: string;
  packedNotes?: string;
}> {
  const state = getDunningState(opts.inv);
  const stageDef =
    (opts.stage ? DUNNING_STAGES.find((s) => s.stage === opts.stage) : null) || state.nextStage;
  if (!stageDef) {
    return { ok: false, stage: DUNNING_STAGES[0], error: 'No dunning stage due for this invoice' };
  }
  if (state.lastStage >= stageDef.stage) {
    return { ok: false, stage: stageDef, error: `Stage ${stageDef.stage} already sent` };
  }
  if (state.daysOverdue < stageDef.minDaysOverdue) {
    return {
      ok: false,
      stage: stageDef,
      error: `Invoice must be ≥${stageDef.minDaysOverdue} days overdue (currently ${state.daysOverdue})`,
    };
  }

  const master = await getCustomerMaster(opts.inv.customerName || '');
  const letter = buildDunningLetter({
    inv: opts.inv,
    stage: stageDef,
    daysOverdue: state.daysOverdue,
    outstanding: state.outstanding,
    master,
  });

  if (opts.dryRun) {
    return { ok: true, stage: stageDef, preview: { subject: letter.subject, html: letter.html } };
  }

  const toEmail = String(opts.toEmail || master?.contactEmail || '').trim();
  if (!toEmail) {
    return { ok: false, stage: stageDef, error: 'No contact email — set on customer master or pass toEmail' };
  }
  if (!emailConfigured()) {
    return { ok: false, stage: stageDef, error: 'RESEND_API_KEY not configured' };
  }

  const send = await sendDunningEmail({
    toEmail,
    subject: letter.subject,
    html: letter.html,
    invoiceNo: opts.inv.invoiceNo,
    stage: stageDef.code,
  });

  if (!send.sent) {
    return { ok: false, stage: stageDef, send, error: send.error || 'Send failed' };
  }

  const { meta, notes } = unpackMeta(opts.inv.notes);
  const history: DunningHistoryEntry[] = Array.isArray(meta.dunning?.history) ? meta.dunning.history : [];
  const entry: DunningHistoryEntry = {
    stage: stageDef.stage,
    code: stageDef.code,
    sentAt: new Date().toISOString(),
    toEmail,
    messageId: send.messageId,
    daysOverdue: state.daysOverdue,
    outstanding: state.outstanding,
  };
  meta.dunning = {
    lastStage: stageDef.stage,
    lastSentAt: entry.sentAt,
    history: [...history, entry],
  };

  if (stageDef.stage >= 2 && opts.inv.status === 'Unpaid') {
    // Mark overdue from first formal notice onward (Oracle dunning level 1+)
  }

  return {
    ok: true,
    stage: stageDef,
    send,
    packedNotes: packMeta(meta, notes),
  };
}

export { emailConfigured };
