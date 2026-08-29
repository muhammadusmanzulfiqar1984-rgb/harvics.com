import { NextResponse } from 'next/server';
import { appendSendLog } from '@/lib/harvyx/sendLog';
import { resolveAuthContext } from '../auth';
import { normalizePhone, sendTwilioText, twilioConfigured, type TextChannel } from '@/lib/harvyx/twilio';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/harvyx/send-text
 * body: { channel: 'sms'|'whatsapp', to, content|body, leadId?, updateStatus? }
 */
export async function POST(req: Request) {
  try {
    const auth = await resolveAuthContext(req);
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const channel = String(body.channel || 'sms').toLowerCase() as TextChannel;
    if (channel !== 'sms' && channel !== 'whatsapp') {
      return NextResponse.json({ error: 'channel must be sms or whatsapp' }, { status: 400 });
    }
    if (!twilioConfigured(channel)) {
      return NextResponse.json(
        {
          error: `Twilio ${channel} not configured`,
          hint:
            channel === 'whatsapp'
              ? 'Set HX_TWILIO_ACCOUNT_SID, HX_TWILIO_AUTH_TOKEN, HX_TWILIO_WHATSAPP_FROM'
              : 'Set HX_TWILIO_ACCOUNT_SID, HX_TWILIO_AUTH_TOKEN, HX_TWILIO_SMS_FROM',
        },
        { status: 503 },
      );
    }

    const to = normalizePhone(String(body.to || body.phone || ''));
    const content = String(body.content || body.body || '').trim();
    const leadId = body.leadId ? String(body.leadId).trim() : '';
    const updateStatus = body.updateStatus !== false;

    if (!to) {
      return NextResponse.json({ error: 'Recipient phone "to" is missing or invalid' }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    const result = await sendTwilioText({ channel, to, body: content });
    if (!result.ok) {
      await appendSendLog({
        to,
        subject: `${channel.toUpperCase()} failed`,
        body: content,
        leadId: leadId || null,
        provider: 'twilio',
        channel,
        status: 'failed',
        error: result.error,
      });
      return NextResponse.json({ error: result.error }, { status: result.status || 502 });
    }

    await appendSendLog({
      to,
      subject: `${channel.toUpperCase()} sent`,
      body: content,
      leadId: leadId || null,
      provider: 'twilio',
      channel,
      messageId: result.sid,
      status: 'sent',
    });

    if (leadId && updateStatus) {
      const origin = new URL(req.url).origin;
      try {
        await fetch(`${origin}/api/harvyx/leads`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.HARVYX_API_KEY ? { 'x-api-key': process.env.HARVYX_API_KEY } : {}),
          },
          body: JSON.stringify({ id: leadId, status: 'contacted' }),
        });
      } catch {
        /* non-fatal */
      }
    }

    return NextResponse.json({
      ok: true,
      channel,
      to,
      messageId: result.sid,
      orgId: auth.org.orgId,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
