import { NextRequest, NextResponse } from 'next/server';
import { getOrgConfig, resolveOrgId } from '@/lib/harvyx/org';
import { assertSendBudget, recordSends, getUsage } from '@/lib/harvyx/usage';
import { twilioConfigured } from '@/lib/harvyx/twilio';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DEFAULT_MAX = 5;
const DELAY_MS = Number(process.env.BATCH_SEND_DELAY_MS || 1200);

type Channel = 'email' | 'sms' | 'whatsapp';

type LeadRow = {
  id?: string;
  email?: string;
  workEmail?: string;
  phone?: string;
  mobile?: string;
  contactName?: string;
  name?: string;
  company?: string;
  status?: string;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function pickEmail(l: LeadRow) {
  return String(l.email || l.workEmail || '').trim();
}

function pickPhone(l: LeadRow) {
  return String(l.phone || l.mobile || '').trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const org = await getOrgConfig(resolveOrgId(req));
    const HARD_MAX = org.batchSendHardMax;
    const channel = (String(body.channel || 'email').toLowerCase() || 'email') as Channel;
    if (channel !== 'email' && channel !== 'sms' && channel !== 'whatsapp') {
      return NextResponse.json({ error: 'channel must be email, sms, or whatsapp' }, { status: 400 });
    }

    if (channel !== 'email' && !twilioConfigured(channel)) {
      return NextResponse.json(
        {
          error: `Twilio ${channel} not configured`,
          hint: 'Set HX_TWILIO_ACCOUNT_SID, HX_TWILIO_AUTH_TOKEN, and SMS/WhatsApp from numbers',
        },
        { status: 503 },
      );
    }

    const status = String(body.status || 'new').trim().toLowerCase() || 'new';
    const dryRun = Boolean(body.dryRun);
    const angle = String(body.angle || body.topic || '').trim();
    const tone = String(body.tone || 'professional, warm, concise').trim();
    let maxLeads = Number(body.maxLeads ?? DEFAULT_MAX);
    if (!Number.isFinite(maxLeads) || maxLeads < 1) maxLeads = DEFAULT_MAX;
    maxLeads = Math.min(HARD_MAX, Math.floor(maxLeads));

    if (!dryRun) {
      const budgetErr = assertSendBudget(org.orgId, maxLeads, org.dailySendCap);
      if (budgetErr) {
        return NextResponse.json(
          { error: budgetErr, usage: getUsage(org.orgId), cap: org.dailySendCap },
          { status: 429 },
        );
      }
    }

    const origin = new URL(req.url).origin;
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (process.env.HARVYX_API_KEY) headers['x-api-key'] = process.env.HARVYX_API_KEY;

    const leadsUrl = new URL(`${origin}/api/harvyx/leads`);
    leadsUrl.searchParams.set('status', status);
    leadsUrl.searchParams.set('limit', String(maxLeads * 3));
    leadsUrl.searchParams.set('page', '1');

    const leadsRes = await fetch(leadsUrl, { headers, cache: 'no-store' });
    const leadsJson = (await leadsRes.json()) as { leads?: LeadRow[]; error?: string };
    if (!leadsRes.ok) {
      return NextResponse.json({ error: leadsJson.error || `leads ${leadsRes.status}` }, { status: leadsRes.status });
    }

    const candidates = (leadsJson.leads || [])
      .filter((l) => (channel === 'email' ? pickEmail(l) : pickPhone(l)))
      .slice(0, maxLeads);

    if (!candidates.length) {
      return NextResponse.json({
        ok: true,
        dryRun,
        channel,
        maxLeads,
        status,
        selected: 0,
        results: [],
        message:
          channel === 'email'
            ? `No leads with email for status=${status}`
            : `No leads with phone for status=${status}`,
      });
    }

    const genType = channel === 'email' ? 'email' : channel === 'sms' ? 'sms' : 'whatsapp';
    const results: Array<Record<string, unknown>> = [];

    for (const lead of candidates) {
      const to = channel === 'email' ? pickEmail(lead) : pickPhone(lead);
      const name = lead.contactName || lead.name || 'there';
      const company = lead.company || '';

      let subject = '';
      let content = '';
      let engine = 'none';
      try {
        const genRes = await fetch(`${origin}/api/harvyx/generate`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            type: genType,
            lead,
            topic: angle || `Intro from Harvics Global for ${company || name}`,
            tone,
          }),
        });
        const gen = (await genRes.json()) as {
          subject?: string;
          content?: string;
          body?: string;
          engine?: string;
          error?: string;
        };
        if (!genRes.ok) {
          results.push({ leadId: lead.id, to, channel, ok: false, stage: 'generate', error: gen.error || genRes.status });
          continue;
        }
        subject = String(gen.subject || `Introduction — Harvics Global`).trim();
        content = String(gen.content || gen.body || '').trim();
        engine = String(gen.engine || 'ai');
      } catch (e) {
        results.push({
          leadId: lead.id,
          to,
          channel,
          ok: false,
          stage: 'generate',
          error: e instanceof Error ? e.message : String(e),
        });
        continue;
      }

      if (dryRun) {
        results.push({
          leadId: lead.id,
          to,
          channel,
          ok: true,
          dryRun: true,
          engine,
          subject: channel === 'email' ? subject : `${channel.toUpperCase()} draft`,
          preview: content.slice(0, 280),
        });
        continue;
      }

      try {
        if (channel === 'email') {
          const sendRes = await fetch(`${origin}/api/harvyx/send-email`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              to,
              subject,
              content,
              leadId: lead.id,
              updateStatus: true,
            }),
          });
          const send = (await sendRes.json()) as { ok?: boolean; messageId?: string; error?: string };
          results.push({
            leadId: lead.id,
            to,
            channel,
            ok: sendRes.ok && send.ok,
            engine,
            subject,
            messageId: send.messageId || null,
            error: send.error || (!sendRes.ok ? `send ${sendRes.status}` : undefined),
          });
        } else {
          const sendRes = await fetch(`${origin}/api/harvyx/send-text`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              channel,
              to,
              content,
              leadId: lead.id,
              updateStatus: true,
            }),
          });
          const send = (await sendRes.json()) as { ok?: boolean; messageId?: string; error?: string };
          results.push({
            leadId: lead.id,
            to,
            channel,
            ok: sendRes.ok && send.ok,
            engine,
            subject: `${channel.toUpperCase()} sent`,
            messageId: send.messageId || null,
            error: send.error || (!sendRes.ok ? `send ${sendRes.status}` : undefined),
          });
        }
      } catch (e) {
        results.push({
          leadId: lead.id,
          to,
          channel,
          ok: false,
          stage: 'send',
          error: e instanceof Error ? e.message : String(e),
        });
      }

      await sleep(DELAY_MS);
    }

    const sent = results.filter((r) => r.ok && !r.dryRun).length;
    const previewed = results.filter((r) => r.dryRun).length;
    const failed = results.filter((r) => !r.ok).length;

    if (!dryRun && sent > 0) {
      recordSends(org.orgId, sent);
      try {
        const { emitOsEventViaHx } = await import('@/lib/harvyx/emitOsEvent');
        void emitOsEventViaHx({
          sourceModule: 'Harvics_Outreach',
          eventType: 'campaign.sent',
          payload: {
            orgId: org.orgId,
            channel,
            status,
            sent,
            failed,
            maxLeads,
          },
          meta: { correlationId: org.orgId },
        });
      } catch {
        /* ignore */
      }
    }

    return NextResponse.json({
      ok: failed === 0,
      dryRun,
      channel,
      maxLeads,
      status,
      selected: candidates.length,
      sent,
      previewed,
      failed,
      hardMax: HARD_MAX,
      orgId: org.orgId,
      usage: getUsage(org.orgId),
      results,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
