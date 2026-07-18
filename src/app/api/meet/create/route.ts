import { NextResponse } from 'next/server'
import { getMeetServerConfig, realtimeApiBase } from '@/data/meetAccess'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Creates a RealtimeKit meeting and adds the caller as the host participant.
 * Returns the meetingId (shareable) and an authToken (host, single-use join).
 */
export async function POST(req: Request) {
  let cfg
  try {
    cfg = getMeetServerConfig()
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Meet not configured' }, { status: 500 })
  }

  let body: { title?: string; name?: string } = {}
  try {
    body = await req.json()
  } catch {
    // empty body is fine
  }

  const title = (body.title || 'Harvics Meeting').toString().slice(0, 120)
  const displayName = (body.name || 'Host').toString().slice(0, 60)

  const base = realtimeApiBase(cfg.accountId, cfg.appId)
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${cfg.apiToken}`,
  }

  try {
    // 1. Create the meeting
    const createRes = await fetch(`${base}/meetings`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ title }),
    })
    const createData: any = await createRes.json().catch(() => ({}))
    if (!createRes.ok) {
      return NextResponse.json(
        { error: 'Failed to create meeting', detail: createData },
        { status: createRes.status },
      )
    }
    const meetingId: string | undefined =
      createData?.result?.id ?? createData?.data?.id ?? createData?.id
    if (!meetingId) {
      return NextResponse.json(
        { error: 'Meeting created but no id returned', detail: createData },
        { status: 502 },
      )
    }

    // 2. Add the caller as host participant → authToken
    const partRes = await fetch(`${base}/meetings/${meetingId}/participants`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: displayName,
        preset_name: cfg.hostPreset,
        custom_participant_id: `host-${Date.now()}`,
      }),
    })
    const partData: any = await partRes.json().catch(() => ({}))
    if (!partRes.ok) {
      return NextResponse.json(
        { error: 'Failed to add host participant', detail: partData, meetingId },
        { status: partRes.status },
      )
    }
    const authToken: string | undefined =
      partData?.result?.token ?? partData?.data?.token ?? partData?.token

    if (!authToken) {
      return NextResponse.json(
        { error: 'No auth token returned', detail: partData, meetingId },
        { status: 502 },
      )
    }

    return NextResponse.json({ success: true, meetingId, authToken })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}
