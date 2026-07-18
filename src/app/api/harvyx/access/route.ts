import { NextRequest, NextResponse } from 'next/server'
import {
  createAccessToken,
  getAccessCode,
  hasOpsAccess,
  isAccessRequired,
  setAccessCookie,
  verifyAccessCode,
} from '@/lib/harvyx/accessAuth'

export const dynamic = 'force-dynamic'

/** Check whether the browser has a valid ops session. */
export async function GET(request: NextRequest) {
  const ok = await hasOpsAccess(request)
  return NextResponse.json({
    ok,
    required: isAccessRequired(),
    configured: Boolean(getAccessCode()),
  })
}

/** Validate access code and set httpOnly cookie. */
export async function POST(request: NextRequest) {
  if (!isAccessRequired()) {
    const token = await createAccessToken()
    const res = NextResponse.json({ ok: true, required: false })
    setAccessCookie(res, token)
    return res
  }

  let body: { code?: string } = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const code = String(body.code || '').trim()
  if (!verifyAccessCode(code)) {
    return NextResponse.json({ ok: false, error: 'Invalid access code' }, { status: 401 })
  }

  const token = await createAccessToken()
  const res = NextResponse.json({ ok: true, required: true })
  setAccessCookie(res, token)
  return res
}
