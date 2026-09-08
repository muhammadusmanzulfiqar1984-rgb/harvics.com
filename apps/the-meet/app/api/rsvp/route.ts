import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { mapUiRsvpToEnum } from '@/lib/meetings'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  const v = url.searchParams.get('v')
  if (!token || !v) {
    return NextResponse.json({ error: 'token + v required' }, { status: 400 })
  }
  const status = mapUiRsvpToEnum(v)
  if (!status || status === 'PENDING') {
    return NextResponse.json({ error: 'v must be ACCEPTED|TENTATIVE|DECLINED (or Yes|Maybe|No)' }, { status: 400 })
  }

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { meeting: true },
  })
  if (!invitation) return NextResponse.json({ error: 'Invite not found' }, { status: 404 })

  await prisma.$transaction([
    prisma.invitation.update({
      where: { id: invitation.id },
      data: { status, respondedAt: new Date() },
    }),
    prisma.participant.updateMany({
      where: { meetingId: invitation.meetingId, email: invitation.email },
      data: { rsvp: status },
    }),
  ])

  return NextResponse.redirect(new URL(`/invite/${token}?done=${status}`, url.origin))
}

export async function POST(req: Request) {
  const body = (await req.json()) as { token?: string; rsvp?: string; name?: string }
  if (!body.token || !body.rsvp) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
  const status = mapUiRsvpToEnum(body.rsvp)
  if (!status || status === 'PENDING') {
    return NextResponse.json({ error: 'Invalid RSVP' }, { status: 400 })
  }

  const invitation = await prisma.invitation.findUnique({ where: { token: body.token } })
  if (!invitation) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [updated] = await prisma.$transaction([
    prisma.invitation.update({
      where: { id: invitation.id },
      data: { status, respondedAt: new Date() },
    }),
    prisma.participant.updateMany({
      where: { meetingId: invitation.meetingId, email: invitation.email },
      data: {
        rsvp: status,
        ...(body.name ? { displayName: body.name } : {}),
      },
    }),
  ])

  return NextResponse.json({
    success: true,
    meetingId: invitation.meetingId,
    invitation: updated,
  })
}
