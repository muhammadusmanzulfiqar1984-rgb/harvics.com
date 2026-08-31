/**
 * Real commercial invoice documents — PDF + Resend email.
 * Ahead of NetSuite on path: AI draft already done; this is real deliverable output.
 */
import fs from 'fs';
import path from 'path';
import os from 'os';

const RESEND_KEY = () => process.env.RESEND_API_KEY || process.env.HX_RESEND_API_KEY || '';
const RESEND_FROM = () =>
  process.env.HX_RESEND_FROM ||
  process.env.RESEND_FROM ||
  'Harvics Trade <founder@harvics.com>';

export function emailConfigured(): boolean {
  return Boolean(RESEND_KEY());
}

function money(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(
    Number(n) || 0,
  );
}

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

/** Letterhead HTML used for PDF + email body. */
export function buildInvoiceHtml(inv: any): string {
  const { meta, notes } = unpackMeta(inv.notesRaw || inv.notes);
  const currency = inv.currency || 'USD';
  const lines = Array.isArray(inv.lines) ? inv.lines : [];
  const billTo = meta.billTo || inv.customerName || inv.customer || '—';
  const rows = lines.length
    ? lines
        .map(
          (l: any, i: number) => `
      <tr>
        <td>${l.lineNo || i + 1}</td>
        <td>${esc(l.sku || '—')}</td>
        <td>${esc(l.hsCode || '—')}</td>
        <td>${esc(l.description || '')}</td>
        <td style="text-align:right">${l.qty ?? ''}</td>
        <td>${esc(l.uom || 'EA')}</td>
        <td style="text-align:right">${money(l.unitPrice, currency)}</td>
        <td style="text-align:right">${l.taxPercent ?? 0}</td>
        <td style="text-align:right"><strong>${money(l.amount, currency)}</strong></td>
      </tr>`,
        )
        .join('')
    : `<tr><td colspan="9" style="text-align:center;padding:20px;color:#666">No line items</td></tr>`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>
  body{font-family:Helvetica,Arial,sans-serif;color:#3D1212;margin:0;padding:32px;font-size:12px}
  h1{margin:4px 0 0;font-size:22px;letter-spacing:-0.02em}
  .gold{color:#C3A35E;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase}
  .head{display:flex;justify-content:space-between;border-bottom:2px solid #3D1212;padding-bottom:14px}
  .grid{display:flex;justify-content:space-between;margin-top:18px;gap:24px}
  table{width:100%;border-collapse:collapse;margin-top:18px}
  th{background:#3D1212;color:#F5F0E8;text-align:left;padding:8px;font-size:9px;letter-spacing:0.1em;text-transform:uppercase}
  td{border-bottom:1px solid #e8dfd4;padding:8px;vertical-align:top}
  .tot{margin-top:16px;width:240px;margin-left:auto}
  .tot div{display:flex;justify-content:space-between;padding:4px 0}
  .tot .grand{border-top:1px solid #3D1212;margin-top:6px;padding-top:8px;font-size:14px;font-weight:700}
  .foot{margin-top:28px;font-size:10px;color:#7a5c5c;text-align:center;letter-spacing:0.12em;text-transform:uppercase}
</style></head><body>
  <div class="head">
    <div>
      <div class="gold">Harvics Trade</div>
      <h1>COMMERCIAL TAX INVOICE</h1>
      <div style="color:#7a5c5c;margin-top:4px">Global trading house</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:16px;font-weight:700">${esc(inv.invoiceNo)}</div>
      <div>Date: ${esc(meta.invoiceDate || String(inv.createdAt || '').slice(0, 10) || '—')}</div>
      <div>Due: ${esc(inv.dueDate || '—')}</div>
      <div>Status: ${esc(inv.status || '')}</div>
    </div>
  </div>
  <div class="grid">
    <div>
      <div class="gold">Bill to</div>
      <div style="font-weight:700;margin-top:4px;font-size:13px">${esc(billTo)}</div>
    </div>
    <div style="text-align:right">
      <div>Terms: ${esc(meta.paymentTerms || 'Net 30')}</div>
      <div>Incoterms: ${esc(meta.incoterms || '—')}</div>
      <div>PO: ${esc(meta.poNumber || '—')}</div>
      <div>Currency: ${esc(currency)}</div>
    </div>
  </div>
  <table>
    <thead><tr>
      <th>#</th><th>SKU</th><th>HS</th><th>Description</th><th>Qty</th><th>UoM</th><th>Unit</th><th>Tax%</th><th>Amount</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="tot">
    <div><span>Subtotal</span><span>${money(inv.subtotal ?? inv.amount, currency)}</span></div>
    <div><span>Tax</span><span>${money(inv.taxAmount ?? 0, currency)}</span></div>
    <div class="grand"><span>Total due</span><span>${money(inv.amount, currency)}</span></div>
  </div>
  ${notes ? `<p style="margin-top:18px">${esc(notes)}</p>` : ''}
  ${meta.bankDetails ? `<p><strong>Remit to:</strong> ${esc(meta.bankDetails)}</p>` : ''}
  <div class="foot">Harvics Invoice Intelligence · Module #3 AR</div>
</body></html>`;
}

function esc(s: any) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Generate a real PDF buffer (Puppeteer). */
export async function renderInvoicePdf(inv: any): Promise<Buffer> {
  const html = buildInvoiceHtml(inv);
  let puppeteer: any;
  try {
    puppeteer = require('puppeteer');
  } catch {
    throw new Error('puppeteer not installed — cannot render PDF');
  }
  const tmp = path.join(os.tmpdir(), `harvics-inv-${inv.invoiceNo || 'x'}-${Date.now()}.html`);
  fs.writeFileSync(tmp, html, 'utf8');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    const page = await browser.newPage();
    await page.goto(`file://${tmp}`, { waitUntil: 'networkidle0', timeout: 30000 });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close().catch(() => {});
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
}

export type SendInvoiceResult = {
  sent: boolean;
  provider: 'resend' | 'none';
  messageId?: string;
  error?: string;
  to: string;
  pdfAttached: boolean;
};

/** Real email via Resend, PDF attached when available. */
export async function sendInvoiceEmail(opts: {
  inv: any;
  toEmail: string;
  pdf?: Buffer | null;
}): Promise<SendInvoiceResult> {
  const to = String(opts.toEmail || '').trim();
  if (!to || !to.includes('@')) {
    return { sent: false, provider: 'none', error: 'Valid toEmail required', to, pdfAttached: false };
  }
  const key = RESEND_KEY();
  if (!key) {
    return { sent: false, provider: 'none', error: 'RESEND_API_KEY missing', to, pdfAttached: false };
  }

  const { meta } = unpackMeta(opts.inv.notesRaw || opts.inv.notes);
  const currency = opts.inv.currency || 'USD';
  const subject = `Tax Invoice ${opts.inv.invoiceNo} — ${opts.inv.customerName || 'Harvics'}`;
  const html = `
    <p>Dear ${esc(opts.inv.customerName || 'Customer')},</p>
    <p>Please find commercial tax invoice <strong>${esc(opts.inv.invoiceNo)}</strong>
    for <strong>${money(opts.inv.amount, currency)}</strong>.</p>
    <p>Due: ${esc(opts.inv.dueDate || 'per terms')}
    ${meta.paymentTerms ? ` · Terms: ${esc(meta.paymentTerms)}` : ''}
    ${meta.incoterms ? ` · Incoterms: ${esc(meta.incoterms)}` : ''}</p>
    ${meta.bankDetails ? `<p>Remit to: ${esc(meta.bankDetails)}</p>` : ''}
    ${meta.payLinkUrl ? `<p><a href="${esc(meta.payLinkUrl)}">Pay this invoice with HPay</a></p>` : ''}
    <p>${esc(meta.collectionsOpener || 'Kindly confirm receipt and expected settlement date.')}</p>
    <p>— Harvics Trade · Invoice Intelligence</p>
    <hr/>
    ${buildInvoiceHtml(opts.inv)}
  `;

  const body: any = {
    from: RESEND_FROM(),
    to: [to],
    subject,
    html,
    tags: [
      { name: 'module', value: 'ar-invoice' },
      { name: 'invoice', value: String(opts.inv.invoiceNo || '').slice(0, 40) },
    ],
  };
  if (opts.pdf && opts.pdf.length) {
    body.attachments = [
      {
        filename: `${opts.inv.invoiceNo || 'invoice'}.pdf`,
        content: opts.pdf.toString('base64'),
      },
    ];
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      sent: false,
      provider: 'resend',
      error: json?.message || json?.name || `Resend HTTP ${res.status}`,
      to,
      pdfAttached: Boolean(opts.pdf?.length),
    };
  }
  return {
    sent: true,
    provider: 'resend',
    messageId: json.id,
    to,
    pdfAttached: Boolean(opts.pdf?.length),
  };
}

export type SendDunningResult = {
  sent: boolean;
  provider: 'resend' | 'none';
  messageId?: string;
  error?: string;
  to: string;
};

/** Staged dunning letter via Resend (Oracle FBDI-style escalation). */
export async function sendDunningEmail(opts: {
  toEmail: string;
  subject: string;
  html: string;
  invoiceNo?: string;
  stage?: string;
}): Promise<SendDunningResult> {
  const to = String(opts.toEmail || '').trim();
  if (!to || !to.includes('@')) {
    return { sent: false, provider: 'none', error: 'Valid toEmail required', to };
  }
  const key = RESEND_KEY();
  if (!key) {
    return { sent: false, provider: 'none', error: 'RESEND_API_KEY missing', to };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: RESEND_FROM(),
      to: [to],
      subject: opts.subject,
      html: opts.html,
      tags: [
        { name: 'module', value: 'ar-dunning' },
        { name: 'stage', value: String(opts.stage || 'unknown').slice(0, 40) },
        { name: 'invoice', value: String(opts.invoiceNo || '').slice(0, 40) },
      ],
    }),
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      sent: false,
      provider: 'resend',
      error: json?.message || json?.name || `Resend HTTP ${res.status}`,
      to,
    };
  }
  return { sent: true, provider: 'resend', messageId: json.id, to };
}
