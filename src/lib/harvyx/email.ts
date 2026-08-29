/**
 * HarvyX outbound email — SendGrid and/or Resend.
 * Prefer HX_EMAIL_PROVIDER=sendgrid|resend; otherwise SendGrid if key set, else Resend.
 */

export type EmailProvider = 'sendgrid' | 'resend';

function env(...names: string[]) {
  for (const n of names) {
    const v = process.env[n]?.trim();
    if (v) return v;
  }
  return '';
}

export function sendgridConfigured(): boolean {
  return Boolean(env('SENDGRID_API_KEY', 'HX_SENDGRID_API_KEY'));
}

export function resendConfigured(): boolean {
  return Boolean(env('HX_RESEND_API_KEY', 'RESEND_API_KEY'));
}

export function emailConfigured(): boolean {
  return sendgridConfigured() || resendConfigured();
}

export function resolveEmailProvider(): EmailProvider | null {
  const pref = env('HX_EMAIL_PROVIDER', 'EMAIL_PROVIDER').toLowerCase();
  if (pref === 'sendgrid' && sendgridConfigured()) return 'sendgrid';
  if (pref === 'resend' && resendConfigured()) return 'resend';
  if (sendgridConfigured()) return 'sendgrid';
  if (resendConfigured()) return 'resend';
  return null;
}

export function defaultFromRaw(): string {
  return env('HX_SENDGRID_FROM', 'SENDGRID_FROM', 'HX_RESEND_FROM', 'FROM_EMAIL', 'OUTREACH_FROM');
}

export function replyToRaw(): string {
  return env('REPLY_TO', 'HX_REPLY_TO');
}

export function parseFrom(raw: string): { email: string; name?: string; formatted: string } {
  const s = String(raw || '').trim();
  const m = s.match(/^(.*?)\s*<([^>]+)>\s*$/);
  if (m) {
    const name = m[1].replace(/^["']|["']$/g, '').trim();
    const email = m[2].trim();
    return { email, name: name || undefined, formatted: name ? `${name} <${email}>` : email };
  }
  return { email: s, formatted: s };
}

function isEmail(v: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
}

export type SendEmailResult =
  | { ok: true; provider: EmailProvider; messageId: string | null }
  | { ok: false; provider?: EmailProvider; error: string; status?: number };

async function sendViaSendGrid(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
  from: { email: string; name?: string };
  replyTo?: string;
}): Promise<SendEmailResult> {
  const key = env('SENDGRID_API_KEY', 'HX_SENDGRID_API_KEY');
  if (!key) return { ok: false, provider: 'sendgrid', error: 'SENDGRID_API_KEY missing' };

  const body: Record<string, unknown> = {
    personalizations: [{ to: [{ email: opts.to }] }],
    from: opts.from.name ? { email: opts.from.email, name: opts.from.name } : { email: opts.from.email },
    subject: opts.subject,
    content: [
      { type: 'text/plain', value: opts.text },
      { type: 'text/html', value: opts.html },
    ],
  };
  if (opts.replyTo) body.reply_to = { email: opts.replyTo };

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  // SendGrid returns 202 with empty body on success
  if (res.status === 202 || res.ok) {
    const msgId = res.headers.get('x-message-id');
    return { ok: true, provider: 'sendgrid', messageId: msgId };
  }

  const data = (await res.json().catch(() => ({}))) as {
    errors?: { message?: string }[];
    message?: string;
  };
  const errMsg = data.errors?.[0]?.message || data.message || `SendGrid ${res.status}`;
  return { ok: false, provider: 'sendgrid', status: res.status, error: errMsg };
}

async function sendViaResend(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
  fromFormatted: string;
  replyTo?: string;
  apiKeyOverride?: string;
}): Promise<SendEmailResult> {
  const key = opts.apiKeyOverride || env('HX_RESEND_API_KEY', 'RESEND_API_KEY');
  if (!key) return { ok: false, provider: 'resend', error: 'RESEND_API_KEY missing' };

  const payload: Record<string, unknown> = {
    from: opts.fromFormatted,
    to: [opts.to],
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  };
  if (opts.replyTo) payload.reply_to = opts.replyTo;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
    error?: { message?: string };
  };

  if (!res.ok) {
    return {
      ok: false,
      provider: 'resend',
      status: res.status,
      error: data?.error?.message || data?.message || `Resend ${res.status}`,
    };
  }
  return { ok: true, provider: 'resend', messageId: data.id || null };
}

/** Send email via preferred provider; optional fallback to the other. */
export async function sendHarvyxEmail(opts: {
  to: string;
  subject: string;
  content: string;
  fromRaw?: string;
  resendApiKeyOverride?: string;
  prefer?: EmailProvider | null;
}): Promise<SendEmailResult> {
  if (!isEmail(opts.to)) return { ok: false, error: 'Recipient "to" is missing or invalid.' };

  const from = parseFrom(opts.fromRaw || defaultFromRaw());
  if (!from.email || !isEmail(from.email)) {
    return {
      ok: false,
      error: 'No verified sender. Set HX_SENDGRID_FROM / HX_RESEND_FROM / FROM_EMAIL.',
    };
  }

  const subject = String(opts.subject || '').trim();
  const content = String(opts.content || '').trim();
  if (!subject || !content) return { ok: false, error: 'subject and content are required.' };

  const html = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');

  const replyParsed = replyToRaw() ? parseFrom(replyToRaw()) : null;
  const replyTo =
    replyParsed && isEmail(replyParsed.email) ? replyParsed.email : undefined;

  const primary = opts.prefer || resolveEmailProvider();
  if (!primary) return { ok: false, error: 'No email provider configured (SendGrid or Resend).' };

  const order: EmailProvider[] =
    primary === 'sendgrid'
      ? sendgridConfigured() && resendConfigured()
        ? ['sendgrid', 'resend']
        : [primary]
      : resendConfigured() && sendgridConfigured()
        ? ['resend', 'sendgrid']
        : [primary];

  let last: SendEmailResult = { ok: false, error: 'No provider attempted' };
  for (const provider of order) {
    if (provider === 'sendgrid') {
      last = await sendViaSendGrid({
        to: opts.to,
        subject,
        text: content,
        html,
        from: { email: from.email, name: from.name },
        replyTo,
      });
    } else {
      last = await sendViaResend({
        to: opts.to,
        subject,
        text: content,
        html,
        fromFormatted: from.formatted,
        replyTo,
        apiKeyOverride: opts.resendApiKeyOverride,
      });
    }
    if (last.ok) return last;
  }
  return last;
}
