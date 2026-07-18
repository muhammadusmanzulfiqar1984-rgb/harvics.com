import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM = process.env.SENDGRID_FROM || process.env.OUTREACH_FROM || '';
const SENDGRID_FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Harvics Global';

function isEmail(v: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const to = String(body.to || '').trim();
    const subject = String(body.subject || '').trim();
    const content = String(body.content || body.body || '').trim();
    const from = String(body.from || SENDGRID_FROM).trim();

    if (!SENDGRID_API_KEY) {
      return NextResponse.json({ error: 'SENDGRID_API_KEY not configured.' }, { status: 500 });
    }
    if (!from || !isEmail(from)) {
      return NextResponse.json(
        { error: 'No verified sender. Set SENDGRID_FROM in .env.local to a SendGrid-verified email.' },
        { status: 400 },
      );
    }
    if (!isEmail(to)) {
      return NextResponse.json({ error: 'Recipient "to" is missing or invalid.' }, { status: 400 });
    }
    if (!subject || !content) {
      return NextResponse.json({ error: 'subject and content are required.' }, { status: 400 });
    }

    // Convert plain-text body to simple HTML (preserve line breaks).
    const html = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');

    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from, name: SENDGRID_FROM_NAME },
        subject,
        content: [
          { type: 'text/plain', value: content },
          { type: 'text/html', value: html },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `SendGrid ${res.status}: ${err}` }, { status: res.status });
    }

    return NextResponse.json({ ok: true, to, messageId: res.headers.get('x-message-id') || null });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
