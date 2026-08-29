import { NextResponse } from 'next/server';
import { recentSendLogs } from '@/lib/harvyx/sendLog';
import { getOrgConfig, resolveOrgId } from '@/lib/harvyx/org';
import { getUsage } from '@/lib/harvyx/usage';
import { seatCount, isClerkConfigured } from '../auth';
import { isStripeConfigured } from '@/lib/harvyx/stripe';
import { twilioConfigured } from '@/lib/harvyx/twilio';
import { emailConfigured, resendConfigured, sendgridConfigured, resolveEmailProvider } from '@/lib/harvyx/email';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function keyPresent(...names: string[]) {
  return names.some((n) => Boolean(process.env[n]?.trim()));
}

async function pingHx(): Promise<{ ok: boolean; detail: string }> {
  const base = (process.env.HX_API_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');
  try {
    const r = await fetch(`${base}/health`, { cache: 'no-store', signal: AbortSignal.timeout(4000) });
    if (!r.ok) return { ok: false, detail: `HTTP ${r.status}` };
    const j = (await r.json()) as { ok?: boolean; service?: string };
    return { ok: Boolean(j?.ok), detail: j?.service || 'hx-api' };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : String(e) };
  }
}

async function leadsCount(origin: string): Promise<{ ok: boolean; total: number | null; detail: string }> {
  try {
    const headers: HeadersInit = {};
    if (process.env.HARVYX_API_KEY) headers['x-api-key'] = process.env.HARVYX_API_KEY;
    const r = await fetch(`${origin}/api/harvyx/stats`, { headers, cache: 'no-store', signal: AbortSignal.timeout(8000) });
    if (r.ok) {
      const j = (await r.json()) as { leads?: { total?: number } };
      const total = Number(j?.leads?.total ?? 0);
      if (total > 0) return { ok: true, total, detail: `${total.toLocaleString()} leads` };
    }
    // Local Node often has no D1 — fall back to leads list total
    const lr = await fetch(`${origin}/api/harvyx/leads?limit=1&page=1`, {
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    });
    if (!lr.ok) {
      return { ok: false, total: null, detail: r.ok ? '0 leads' : `stats ${r.status}` };
    }
    const lj = (await lr.json()) as { total?: number; counts?: { total?: number } };
    const total = Number(lj.total ?? lj.counts?.total ?? 0);
    return { ok: total >= 0, total, detail: `${total.toLocaleString()} leads (json)` };
  } catch (e) {
    return { ok: false, total: null, detail: e instanceof Error ? e.message : String(e) };
  }
}

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const [hx, leads, recent] = await Promise.all([
    pingHx(),
    leadsCount(origin),
    recentSendLogs(5),
  ]);

  const resend = resendConfigured();
  const sendgrid = sendgridConfigured();
  const email = emailConfigured();
  const emailProvider = resolveEmailProvider();
  const ai = {
    groq: keyPresent('GROQ_API_KEY', 'HX_GROQ_API_KEY'),
    openai: keyPresent('OPENAI_API_KEY'),
    deepseek: keyPresent('DEEPSEEK_API_KEY'),
    nvidia: keyPresent('NVIDIA_API_KEY'),
  };

  const checks = {
    leads,
    hxApi: hx,
    email: {
      ok: email,
      provider: emailProvider,
      detail: email
        ? `primary=${emailProvider}; sendgrid=${sendgrid ? 'on' : 'off'}; resend=${resend ? 'on' : 'off'}`
        : 'missing SendGrid/Resend key',
    },
    resend: { ok: resend, detail: resend ? 'configured' : 'missing key' },
    sendgrid: { ok: sendgrid, detail: sendgrid ? 'configured' : 'missing key' },
    ai,
    jwt: { ok: keyPresent('HX_JWT_SECRET'), detail: keyPresent('HX_JWT_SECRET') ? 'set' : 'missing' },
    kafka: {
      ok: keyPresent('KAFKA_BOOTSTRAP_SERVER') && keyPresent('KAFKA_API_KEY') && keyPresent('KAFKA_API_SECRET'),
      detail: keyPresent('KAFKA_BOOTSTRAP_SERVER') ? 'configured' : 'missing',
    },
    apollo: { ok: keyPresent('APOLLO_API_KEY', 'HX_APOLLO_API_KEY'), detail: keyPresent('APOLLO_API_KEY', 'HX_APOLLO_API_KEY') ? 'set' : 'missing' },
    twilio: {
      ok: twilioConfigured(),
      sms: twilioConfigured('sms'),
      whatsapp: twilioConfigured('whatsapp'),
      detail: twilioConfigured()
        ? `sms=${twilioConfigured('sms') ? 'on' : 'off'} wa=${twilioConfigured('whatsapp') ? 'on' : 'off'}`
        : 'missing keys',
    },
  };

  const org = await getOrgConfig(resolveOrgId(req));
  const usage = getUsage(org.orgId);

  const ready =
    checks.leads.ok && checks.email.ok && (checks.ai.groq || checks.ai.openai || checks.ai.deepseek);

  return NextResponse.json({
    ok: ready,
    ts: new Date().toISOString(),
    phase: '4b-saas',
    clerk: { configured: isClerkConfigured() },
    stripe: { configured: isStripeConfigured() },
    org: {
      orgId: org.orgId,
      name: org.name,
      plan: org.plan,
      seats: Math.max(org.seats, seatCount()),
      dailySendCap: org.dailySendCap,
      dailyEnrichCap: org.dailyEnrichCap,
      batchSendHardMax: org.batchSendHardMax,
    },
    usage,
    checks,
    recentSends: recent.map((s) => ({
      id: s.id,
      at: s.at,
      to: s.to,
      subject: s.subject,
      status: s.status,
      leadId: s.leadId,
    })),
  });
}
