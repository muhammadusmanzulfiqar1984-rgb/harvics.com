const RESEND_KEY = () => process.env.RESEND_API_KEY || process.env.HX_RESEND_API_KEY || ''
const FROM = () =>
  process.env.MEET_FROM_EMAIL ||
  process.env.HX_RESEND_FROM ||
  process.env.RESEND_FROM ||
  'Harvics Meet <meet@harvics.com>'

export function emailConfigured() {
  return Boolean(RESEND_KEY())
}

function esc(s: string) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export async function sendMeetingInvitation(opts: {
  to: string
  hostName: string
  title: string
  whenLabel: string
  joinUrl: string
  rsvpYesUrl: string
  rsvpMaybeUrl: string
  rsvpNoUrl: string
}) {
  const key = RESEND_KEY()
  if (!key) return { sent: false as const, error: 'RESEND_API_KEY missing' }

  const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#0a0808;color:#f5f5f5;padding:24px">
<div style="max-width:560px;margin:0 auto;background:#141010;border:1px solid #3d2a1a;border-radius:12px;padding:28px">
  <p style="margin:0 0 8px;color:#c3a35e;font-size:11px;letter-spacing:.18em;text-transform:uppercase">Harvics Meet</p>
  <h1 style="margin:0 0 12px;font-size:20px;color:#fff">${esc(opts.title)}</h1>
  <p style="margin:0 0 8px;color:#d4d4d4">${esc(opts.hostName)} invited you.</p>
  <p style="margin:0 0 20px;color:#a3a3a3">${esc(opts.whenLabel)}</p>
  <p style="margin:0 0 16px"><a href="${esc(opts.joinUrl)}" style="display:inline-block;background:#c3a35e;color:#1a0d00;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:700">Join meeting</a></p>
  <p style="margin:0 0 8px;color:#737373;font-size:13px">RSVP:</p>
  <p style="margin:0">
    <a href="${esc(opts.rsvpYesUrl)}" style="color:#6ee7b7;margin-right:12px">Yes</a>
    <a href="${esc(opts.rsvpMaybeUrl)}" style="color:#fbbf24;margin-right:12px">Maybe</a>
    <a href="${esc(opts.rsvpNoUrl)}" style="color:#f87171">No</a>
  </p>
</div></body></html>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM(),
      to: [opts.to],
      subject: `Meeting invitation: ${opts.title}`,
      html,
    }),
  })
  const json: any = await res.json().catch(() => ({}))
  if (!res.ok) return { sent: false as const, error: json?.message || `Resend ${res.status}` }
  return { sent: true as const, messageId: json.id as string }
}
