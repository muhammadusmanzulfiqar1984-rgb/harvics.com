import { NextResponse } from 'next/server'
import { getMeetingById } from '@/lib/meetings'
import { livekitConfigured, mintRoomToken } from '@/lib/livekit'
import { canJoinWithRsvp } from '@/lib/permissions'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      meetingId: string
      name?: string
      email?: string
      inviteToken?: string
      asHost?: boolean
    }
    if (!body.meetingId) return NextResponse.json({ error: 'meetingId required' }, { status: 400 })

    const meeting = await getMeetingById(body.meetingId)
    if (!meeting) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (meeting.status === 'ENDED' || meeting.status === 'CANCELLED') {
      return NextResponse.json({ error: `Meeting is ${meeting.status}` }, { status: 409 })
    }

    const invitation = body.inviteToken
      ? meeting.invitations.find((i) => i.token === body.inviteToken)
      : undefined

    const participant = invitation
      ? meeting.participants.find((p) => p.email?.toLowerCase() === invitation.email.toLowerCase())
      : body.email
        ? meeting.participants.find((p) => p.email?.toLowerCase() === body.email!.toLowerCase())
        : undefined

    const role = body.asHost || participant?.role === 'HOST' || participant?.role === 'CO_HOST'
      ? participant?.role === 'CO_HOST'
        ? 'CO_HOST'
        : 'HOST'
      : 'PARTICIPANT'

    const rsvp = invitation?.status || participant?.rsvp || 'ACCEPTED'
    if (!canJoinWithRsvp(rsvp, role)) {
      return NextResponse.json({ error: 'RSVP declined' }, { status: 403 })
    }

    if (meeting.waitingRoom && role === 'PARTICIPANT' && rsvp === 'PENDING') {
      return NextResponse.json({
        waitingRoom: true,
        redirect: `/meeting/${meeting.id}/waiting`,
      })
    }

    if (!livekitConfigured()) {
      return NextResponse.json({ error: 'LiveKit not configured' }, { status: 503 })
    }

    const displayName = (body.name || participant?.displayName || invitation?.email || 'Guest').slice(0, 60)
    const identity = participant?.id || invitation?.id || `guest-${Date.now()}`
    const { token, url } = await mintRoomToken({
      roomName: meeting.roomName,
      identity,
      name: displayName,
      metadata: JSON.stringify({ role, meetingId: meeting.id }),
    })

    if (participant) {
      await prisma.participant.update({
        where: { id: participant.id },
        data: { joinedAt: new Date(), displayName },
      })
    }
    if (meeting.status === 'SCHEDULED') {
      await prisma.meeting.update({ where: { id: meeting.id }, data: { status: 'LIVE' } })
    }

    return NextResponse.json({
      success: true,
      token,
      url,
      roomName: meeting.roomName,
      role,
      meeting: {
        id: meeting.id,
        title: meeting.title,
        meetingCode: meeting.meetingCode,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'token failed' }, { status: 500 })
  }
}
