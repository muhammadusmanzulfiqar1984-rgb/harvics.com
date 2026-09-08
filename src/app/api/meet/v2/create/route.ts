import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { slugifyTitle, buildMeetIcs, livekitConfigured } from '@/lib/harvicsMeet'
import { meetEmailConfigured, sendMeetInvite } from '@/lib/meetEmail'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CreateSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().max(2000).optional(),
  hostName: z.string().min(1).max(80),
  hostEmail: z.string().email().optional().or(z.literal('')),
  scheduledAt: z.string().datetime().optional(),
  durationMins: z.number().int().min(15).max(480).optional(),
  timezone: z.string().max(64).optional(),
  waitingRoom: z.boolean().optional(),
  guests: z
    .array(
      z.object({
        email: z.string().email(),
        name: z.string().max(80).optional(),
      }),
    )
    .max(50)
    .optional(),
  sendInvites: z.boolean().optional(),
})

export async function POST(req: Request) {
  try {
    const body = CreateSchema.parse(await req.json())
    const slug = slugifyTitle(body.title)
    const livekitRoom = `harvics-meet-${slug}`
    const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null
    const durationMins = body.durationMins ?? 60
    const calendarUid = `${slug}@meet.harvics.com`

    const guests = body.guests || []
    const meeting = await prisma.meetMeeting.create({
      data: {
        slug,
        title: body.title,
        description: body.description || undefined,
        hostName: body.hostName,
        hostEmail: body.hostEmail || undefined,
        scheduledAt: scheduledAt || undefined,
        durationMins,
        timezone: body.timezone || 'UTC',
        livekitRoom,
        status: 'Scheduled',
        waitingRoom: body.waitingRoom ?? true,
        requireRsvp: true,
        calendarUid,
        guests: {
          create: [
            {
              email: body.hostEmail || `${slug}-host@meet.local`,
              name: body.hostName,
              role: 'host',
              rsvp: 'Yes',
              respondedAt: new Date(),
            },
            ...guests.map((g) => ({
              email: g.email.toLowerCase(),
              name: g.name || undefined,
              role: 'guest' as const,
              rsvp: 'Pending',
            })),
          ],
        },
      },
      include: { guests: true },
    })

    const origin = new URL(req.url).origin
    const locale = 'en'
    const joinUrl = `${origin}/${locale}/apps/meet/${meeting.slug}`
    const inviteResults: Array<{ email: string; sent: boolean; error?: string }> = []

    if (body.sendInvites !== false && meetEmailConfigured()) {
      const whenLabel = scheduledAt
        ? `${scheduledAt.toUTCString()} · ${durationMins} min · ${meeting.timezone}`
        : `Starts when host joins · ${durationMins} min`
      for (const g of meeting.guests.filter((x) => x.role !== 'host')) {
        const base = `${origin}/${locale}/apps/meet/rsvp/${g.inviteToken}`
        const result = await sendMeetInvite({
          to: g.email,
          hostName: meeting.hostName,
          title: meeting.title,
          whenLabel,
          joinUrl: `${joinUrl}?token=${g.inviteToken}`,
          rsvpYesUrl: `${base}?v=Yes`,
          rsvpMaybeUrl: `${base}?v=Maybe`,
          rsvpNoUrl: `${base}?v=No`,
        })
        inviteResults.push({ email: g.email, sent: result.sent, error: result.error })
      }
    }

    let ics: string | null = null
    if (scheduledAt) {
      ics = buildMeetIcs({
        uid: calendarUid,
        title: meeting.title,
        description: meeting.description || `Join: ${joinUrl}`,
        start: scheduledAt,
        durationMins,
        url: joinUrl,
        organizerEmail: meeting.hostEmail,
      })
    }

    return NextResponse.json({
      success: true,
      meeting,
      joinUrl,
      ics,
      livekitConfigured: livekitConfigured(),
      emailConfigured: meetEmailConfigured(),
      inviteResults,
    })
  } catch (e: any) {
    if (e?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', detail: e.errors || e.issues }, { status: 400 })
    }
    return NextResponse.json({ error: e?.message || 'create failed' }, { status: 500 })
  }
}
