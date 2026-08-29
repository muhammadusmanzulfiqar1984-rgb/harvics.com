import { NextResponse } from 'next/server';
import { appendSendLog } from '@/lib/harvyx/sendLog';
import { sendHarvyxEmail } from '@/lib/harvyx/email';
import { resolveAuthContext } from '../auth';

export const dynamic = 'force-dynamic';

async function markLeadContacted(leadId: string, origin: string) {
  try {
    await fetch(`${origin}/api/harvyx/leads`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.HARVYX_API_KEY
          ? { 'x-api-key': process.env.HARVYX_API_KEY }
          : {}),
      },
      body: JSON.stringify({ id: leadId, status: 'contacted' }),
    });
  } catch {
    /* non-fatal — send already succeeded */
  }
}

export async function POST(req: Request) {
  try {
    const auth = await resolveAuthContext(req);
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const to = String(body.to || '').trim();
    const subject = String(body.subject || '').trim();
    const content = String(body.content || body.body || '').trim();
    const leadId = body.leadId ? String(body.leadId).trim() : '';
    const updateStatus = body.updateStatus !== false;
    const fromRaw = body.from ? String(body.from).trim() : undefined;

    const result = await sendHarvyxEmail({
      to,
      subject,
      content,
      fromRaw,
      resendApiKeyOverride: auth.org.resendApiKey,
    });

    if (!result.ok) {
      await appendSendLog({
        to,
        subject,
        body: content,
        leadId: leadId || null,
        provider: result.provider || 'sendgrid',
        channel: 'email',
        status: 'failed',
        error: result.error,
      });
      return NextResponse.json(
        { error: result.error },
        { status: result.status && result.status >= 400 ? result.status : 500 },
      );
    }

    await appendSendLog({
      to,
      subject,
      body: content,
      leadId: leadId || null,
      provider: result.provider,
      channel: 'email',
      messageId: result.messageId,
      status: 'sent',
    });

    if (leadId && updateStatus) {
      const origin = new URL(req.url).origin;
      await markLeadContacted(leadId, origin);
    }

    return NextResponse.json({
      ok: true,
      provider: result.provider,
      to,
      messageId: result.messageId,
      leadId: leadId || null,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
