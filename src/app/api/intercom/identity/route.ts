import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'

export const runtime = 'nodejs'

/**
 * Intercom identity verification — HMAC-SHA256(user_id, INTERCOM_IDENTITY_SECRET).
 * Required when the Intercom workspace enforces identity verification.
 */
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.INTERCOM_IDENTITY_SECRET || process.env.INTERCOM_CLIENT_SECRET
    if (!secret) {
      return NextResponse.json({ error: 'identity_secret_missing' }, { status: 503 })
    }

    const body = (await req.json().catch(() => ({}))) as { user_id?: string }
    const userId = typeof body.user_id === 'string' ? body.user_id.trim() : ''
    if (!userId || userId.length > 200) {
      return NextResponse.json({ error: 'invalid_user_id' }, { status: 400 })
    }

    const user_hash = createHmac('sha256', secret).update(userId).digest('hex')
    return NextResponse.json({ user_hash })
  } catch {
    return NextResponse.json({ error: 'identity_failed' }, { status: 500 })
  }
}
