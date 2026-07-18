import { NextResponse } from 'next/server'
import { getMeetServerConfig, realtimeApiBase } from '@/data/meetAccess'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Adds a guest participant to an existing RealtimeKit meeting and returns a
 * fresh authToken so they can join. Requires a valid meetingId (shared link).
 */
export async function POST(req: Request) {
  let cfg
  try {
    cfg = getMeetServerConfig()
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Meet not configured' }, { status: 500 })
  }

  let body: { meetingId?: string; name?: string; asHost?: boolean } = {}
  try {
    body = await req.json()
  } catch {
    // handled below
  }

  const meetingId = (body.meetingId || '').toString().trim()
  const displayName = (body.name || 'Guest').toString().slice(0, 60)
  if (!meetingId) {
    return NextResponse.json({ error: 'meetingId is required' }, { status: 400 })
  }

  const base = realtimeApiBase(cfg.accountId, cfg.appId)
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${cfg.apiToken}`,
  }

  try {
    const partRes = await fetch(`${base}/meetings/${meetingId}/participants`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: displayName,
        preset_name: body.asHost ? cfg.hostPreset : cfg.guestPreset,
        custom_participant_id: `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      }),
    })
    const partData: any = await partRes.json().catch(() => ({}))
    if (!partRes.ok) {
      const notFound = partRes.status === 404
      return NextResponse.json(
        {
          error: notFound ? 'Meeting not found or has ended' : 'Failed to join meeting',
          detail: partData,
        },
        { status: partRes.status },
      )
    }
    const authToken: string | undefined =
      partData?.result?.token ?? partData?.data?.token ?? partData?.token

    if (!authToken) {
      return NextResponse.json(
        { error: 'No auth token returned', detail: partData },
        { status: 502 },
      )
    }

    return NextResponse.json({ success: true, meetingId, authToken })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}
