import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { emailConfigured, sendMeetingInvitation } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { meetingId?: string; invitationIds?: string[] }
    if (!body.meetingId) return NextResponse.json({ error: 'meetingId required' }, { status: 400 })
    if (!emailConfigured()) return NextResponse.json({ error: 'Email not configured' }, { status: 503 })

    const meeting = await prisma.meeting.findUnique({
      where: { id: body.meetingId },
      include: { host: true, invitations: true },
    })
    if (!meeting) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const origin = process.env.NEXTAUTH_URL || new URL(req.url).origin
    const targets = meeting.invitations.filter(
      (inv) => !body.invitationIds || body.invitationIds.includes(inv.id),
    )
    const results = []
    for (const inv of targets) {
      const base = `${origin}/invite/${inv.token}`
      const joinUrl = `${origin}/meeting/${meeting.id}/prejoin?token=${inv.token}`
      const whenLabel = meeting.startTime.toUTCString()
      const result = await sendMeetingInvitation({
        to: inv.email,
        hostName: meeting.host.name || meeting.host.email,
        title: meeting.title,
        whenLabel,
        joinUrl,
        rsvpYesUrl: `${base}?v=ACCEPTED`,
        rsvpMaybeUrl: `${base}?v=TENTATIVE`,
        rsvpNoUrl: `${base}?v=DECLINED`,
      })
      if (result.sent) {
        await prisma.invitation.update({
          where: { id: inv.id },
          data: { sentAt: new Date() },
        })
      }
      results.push({ email: inv.email, ...result })
    }
    return NextResponse.json({ success: true, results })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'invite failed' }, { status: 500 })
  }
}
