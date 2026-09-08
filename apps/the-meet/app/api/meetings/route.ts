import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { generateMeetingCode, roomNameFromCode } from '@/lib/meetings'
import { buildIcs } from '@/lib/calendar'
import { emailConfigured, sendMeetingInvitation } from '@/lib/email'
import { livekitConfigured } from '@/lib/livekit'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const runtime = 'nodejs'

const CreateSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().max(2000).optional(),
  hostName: z.string().min(1).max(80),
  hostEmail: z.string().email().optional().or(z.literal('')),
  scheduledAt: z.string().datetime().optional(),
  durationMins: z.number().int().min(15).max(480).optional(),
  timezone: z.string().max(64).optional(),
  waitingRoom: z.boolean().optional(),
  accessType: z.enum(['OPEN', 'INVITED', 'RESTRICTED']).optional(),
  guests: z
    .array(z.object({ email: z.string().email(), name: z.string().max(80).optional() }))
    .max(50)
    .optional(),
  sendInvites: z.boolean().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ data: [] })
  const data = await prisma.meeting.findMany({
    where: { host: { email } },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { participants: true, invitations: true } } },
    take: 50,
  })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  try {
    const body = CreateSchema.parse(await req.json())
    const session = await getServerSession(authOptions)
    const durationMins = body.durationMins ?? 60
    const timezone = body.timezone || 'UTC'
    const startTime = body.scheduledAt ? new Date(body.scheduledAt) : new Date()
    const endTime = new Date(startTime.getTime() + durationMins * 60_000)
    const meetingCode = generateMeetingCode()
    const roomName = roomNameFromCode(meetingCode)
    const guests = body.guests || []

    const hostEmail =
      (body.hostEmail || session?.user?.email || '').toLowerCase().trim() ||
      `${meetingCode}-host@meet.local`

    const host = await prisma.user.upsert({
      where: { email: hostEmail },
      create: { email: hostEmail, name: body.hostName },
      update: { name: body.hostName },
    })

    const meeting = await prisma.meeting.create({
      data: {
        title: body.title,
        description: body.description,
        hostId: host.id,
        startTime,
        endTime,
        timezone,
        status: 'SCHEDULED',
        accessType: body.accessType || 'INVITED',
        meetingCode,
        roomName,
        waitingRoom: body.waitingRoom ?? false,
        participants: {
          create: [
            {
              userId: host.id,
              email: hostEmail,
              displayName: body.hostName,
              role: 'HOST',
              rsvp: 'ACCEPTED',
            },
            ...guests.map((g) => ({
              email: g.email.toLowerCase(),
              displayName: g.name?.trim() || g.email.split('@')[0],
              role: 'PARTICIPANT' as const,
              rsvp: 'PENDING' as const,
            })),
          ],
        },
        invitations: {
          create: guests.map((g) => ({
            email: g.email.toLowerCase(),
            status: 'PENDING' as const,
            sentAt: body.sendInvites !== false ? new Date() : undefined,
          })),
        },
      },
      include: {
        host: true,
        participants: true,
        invitations: true,
      },
    })

    const origin = process.env.NEXTAUTH_URL || new URL(req.url).origin
    const joinUrl = `${origin}/meeting/${meeting.id}/prejoin`
    const inviteResults: Array<{ email: string; sent: boolean; error?: string }> = []

    if (body.sendInvites !== false && emailConfigured()) {
      const whenLabel = `${startTime.toUTCString()} · ${durationMins} min`
      for (const inv of meeting.invitations) {
        const base = `${origin}/invite/${inv.token}`
        const result = await sendMeetingInvitation({
          to: inv.email,
          hostName: body.hostName,
          title: meeting.title,
          whenLabel,
          joinUrl: `${joinUrl}?token=${inv.token}`,
          rsvpYesUrl: `${base}?v=ACCEPTED`,
          rsvpMaybeUrl: `${base}?v=TENTATIVE`,
          rsvpNoUrl: `${base}?v=DECLINED`,
        })
        inviteResults.push({ email: inv.email, sent: result.sent, error: result.error })
      }
    }

    const ics = buildIcs({
      uid: `${meeting.meetingCode}@meet.harvics.com`,
      title: meeting.title,
      description: meeting.description || `Join: ${joinUrl}`,
      start: startTime,
      durationMins,
      url: joinUrl,
      organizerEmail: hostEmail,
    })

    return NextResponse.json({
      success: true,
      meeting,
      joinUrl,
      ics,
      livekitConfigured: livekitConfigured(),
      emailConfigured: emailConfigured(),
      inviteResults,
    })
  } catch (e: any) {
    if (e?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', detail: e.issues }, { status: 400 })
    }
    return NextResponse.json({ error: e?.message || 'create failed' }, { status: 500 })
  }
}
