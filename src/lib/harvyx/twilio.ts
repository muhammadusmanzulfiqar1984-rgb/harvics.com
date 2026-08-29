/**
 * Twilio SMS + WhatsApp for HarvyX outreach.
 * Env: HX_TWILIO_ACCOUNT_SID / TWILIO_ACCOUNT_SID
 *      HX_TWILIO_AUTH_TOKEN / TWILIO_AUTH_TOKEN
 *      HX_TWILIO_SMS_FROM / TWILIO_PHONE_NUMBER  (E.164 SMS sender)
 *      HX_TWILIO_WHATSAPP_FROM                   (E.164 or whatsapp:+…)
 */

export type TextChannel = 'sms' | 'whatsapp';

export function twilioConfigured(channel?: TextChannel): boolean {
  const sid = (process.env.HX_TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID || '').trim();
  const token = (process.env.HX_TWILIO_AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN || '').trim();
  if (!sid || !token) return false;
  if (!channel) {
    return Boolean(smsFrom() || whatsappFrom());
  }
  if (channel === 'sms') return Boolean(smsFrom());
  return Boolean(whatsappFrom());
}

function accountSid() {
  return (process.env.HX_TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID || '').trim();
}

function authToken() {
  return (process.env.HX_TWILIO_AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN || '').trim();
}

function smsFrom() {
  return (process.env.HX_TWILIO_SMS_FROM || process.env.TWILIO_PHONE_NUMBER || '').trim();
}

function whatsappFrom() {
  const raw = (process.env.HX_TWILIO_WHATSAPP_FROM || '').trim();
  if (!raw) return '';
  return raw.startsWith('whatsapp:') ? raw : `whatsapp:${raw}`;
}

/** Normalize to E.164-ish digits with leading +. */
export function normalizePhone(raw: string): string | null {
  let s = String(raw || '').trim();
  if (!s) return null;
  s = s.replace(/^whatsapp:/i, '').trim();
  // keep leading + and digits
  const plus = s.startsWith('+');
  const digits = s.replace(/\D/g, '');
  if (digits.length < 8) return null;
  return plus || digits.length >= 10 ? `+${digits}` : null;
}

export async function sendTwilioText(opts: {
  channel: TextChannel;
  to: string;
  body: string;
}): Promise<{ ok: true; sid: string } | { ok: false; error: string; status?: number }> {
  const sid = accountSid();
  const token = authToken();
  if (!sid || !token) {
    return { ok: false, error: 'Twilio credentials missing (HX_TWILIO_ACCOUNT_SID / HX_TWILIO_AUTH_TOKEN)' };
  }

  const toPhone = normalizePhone(opts.to);
  if (!toPhone) return { ok: false, error: 'Invalid recipient phone' };

  const text = String(opts.body || '').trim();
  if (!text) return { ok: false, error: 'Message body is empty' };
  if (text.length > 1500) {
    return { ok: false, error: 'Message too long (max 1500 chars)' };
  }

  let from = '';
  let to = toPhone;
  if (opts.channel === 'whatsapp') {
    from = whatsappFrom();
    if (!from) return { ok: false, error: 'HX_TWILIO_WHATSAPP_FROM not set' };
    to = `whatsapp:${toPhone}`;
  } else {
    from = smsFrom();
    if (!from) return { ok: false, error: 'HX_TWILIO_SMS_FROM / TWILIO_PHONE_NUMBER not set' };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ From: from, To: to, Body: text }).toString(),
  });

  const data = (await res.json().catch(() => ({}))) as {
    sid?: string;
    message?: string;
    error_message?: string;
  };

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: data.error_message || data.message || `Twilio ${res.status}`,
    };
  }

  return { ok: true, sid: String(data.sid || '') };
}
