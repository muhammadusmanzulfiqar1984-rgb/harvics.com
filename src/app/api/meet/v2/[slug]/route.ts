import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { livekitConfigured, mintLiveKitToken } from '@/lib/harvicsMeet'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params
  const meeting = await prisma.meetMeeting.findUnique({
    where: { slug },
    include: { guests: { orderBy: { createdAt: 'asc' } } },
  })
  if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
  return NextResponse.json({ meeting, livekitConfigured: livekitConfigured() })
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params
  try {
    const body = (await req.json().catch(() => ({}))) as {
      name?: string
      email?: string
      inviteToken?: string
      role?: 'host' | 'guest'
    }
    const meeting = await prisma.meetMeeting.findUnique({
      where: { slug },
      include: { guests: true },
    })
    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    if (meeting.status === 'Cancelled' || meeting.status === 'Ended') {
      return NextResponse.json({ error: `Meeting is ${meeting.status}` }, { status: 409 })
    }

    let guest = body.inviteToken
      ? meeting.guests.find((g) => g.inviteToken === body.inviteToken)
      : body.email
        ? meeting.guests.find((g) => g.email.toLowerCase() === body.email!.toLowerCase())
        : undefined

    const displayName = (body.name || guest?.name || 'Guest').toString().slice(0, 60)
    const isHost =
      body.role === 'host' ||
      guest?.role === 'host' ||
      (body.email && meeting.hostEmail && body.email.toLowerCase() === meeting.hostEmail.toLowerCase())

    if (meeting.requireRsvp && guest && guest.role !== 'host' && guest.rsvp === 'No') {
      return NextResponse.json({ error: 'RSVP declined — cannot join' }, { status: 403 })
    }

    if (meeting.waitingRoom && !isHost && guest?.rsvp === 'Pending') {
      return NextResponse.json({
        waitingRoom: true,
        message: 'Host has enabled waiting room. Complete RSVP Yes or wait for admission.',
        meeting: { slug: meeting.slug, title: meeting.title, status: meeting.status },
      })
    }

    if (!livekitConfigured()) {
      return NextResponse.json(
        {
          error: 'LiveKit not configured. Set LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET.',
          meetingId: meeting.id,
          slug: meeting.slug,
        },
        { status: 503 },
      )
    }

    const identity = guest?.id || `guest-${Date.now()}`
    const { token, url } = await mintLiveKitToken({
      roomName: meeting.livekitRoom,
      identity,
      name: displayName,
      canPublish: true,
      canSubscribe: true,
      metadata: JSON.stringify({ role: isHost ? 'host' : 'guest', meetingSlug: meeting.slug }),
    })

    if (guest) {
      await prisma.meetGuest.update({
        where: { id: guest.id },
        data: { joinedAt: new Date(), name: displayName },
      })
    }
    if (meeting.status === 'Scheduled') {
      await prisma.meetMeeting.update({
        where: { id: meeting.id },
        data: { status: 'Live' },
      })
    }

    return NextResponse.json({
      success: true,
      token,
      url,
      roomName: meeting.livekitRoom,
      meeting: {
        id: meeting.id,
        slug: meeting.slug,
        title: meeting.title,
        status: 'Live',
        waitingRoom: meeting.waitingRoom,
      },
      role: isHost ? 'host' : 'guest',
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'join failed' }, { status: 500 })
  }
}
