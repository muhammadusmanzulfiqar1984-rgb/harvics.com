/**
 * Intercom REST helpers for Fin voice handoff (server-only).
 */

const INTERCOM_API = 'https://api.intercom.io'

function token() {
  return process.env.INTERCOM_ACCESS_TOKEN || ''
}

export async function intercomRequest(
  path: string,
  init: RequestInit = {},
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const t = token()
  if (!t) return { ok: false, status: 0, data: { error: 'INTERCOM_ACCESS_TOKEN missing' } }

  const res = await fetch(`${INTERCOM_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${t}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Intercom-Version': '2.11',
      ...(init.headers || {}),
    },
  })

  const text = await res.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text.slice(0, 400) }
  }
  return { ok: res.ok, status: res.status, data }
}

/** Post an admin note into an existing conversation (Fin / Messenger). */
export async function postConversationNote(
  conversationId: string,
  body: string,
): Promise<boolean> {
  if (!conversationId || !body.trim()) return false
  const r = await intercomRequest(`/conversations/${conversationId}/reply`, {
    method: 'POST',
    body: JSON.stringify({
      message_type: 'note',
      type: 'admin',
      admin_id: process.env.INTERCOM_ADMIN_ID || undefined,
      body: body.slice(0, 8000),
    }),
  })
  // Some workspaces require admin_id; if missing, try comment as admin without it
  if (!r.ok && !process.env.INTERCOM_ADMIN_ID) {
    const r2 = await intercomRequest(`/conversations/${conversationId}/parts`, {
      method: 'POST',
      body: JSON.stringify({
        message_type: 'note',
        body: body.slice(0, 8000),
      }),
    })
    return r2.ok
  }
  return r.ok
}

/** Create an in-app user message (opens / continues a conversation). */
export async function createUserMessage(opts: {
  userId?: string
  email?: string
  body: string
}): Promise<boolean> {
  const from = opts.userId
    ? { type: 'user', user_id: opts.userId }
    : opts.email
      ? { type: 'user', email: opts.email }
      : null
  if (!from) return false

  const r = await intercomRequest('/messages', {
    method: 'POST',
    body: JSON.stringify({
      message_type: 'inapp',
      body: opts.body.slice(0, 8000),
      from,
    }),
  })
  return r.ok
}
