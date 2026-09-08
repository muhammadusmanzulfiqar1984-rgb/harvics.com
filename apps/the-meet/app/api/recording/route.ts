import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/** Recording egress webhook / start placeholder — LiveKit Cloud egress next. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  return NextResponse.json({
    ok: true,
    message: 'Recording pipeline stub — configure LiveKit egress + R2',
    received: body,
  })
}
