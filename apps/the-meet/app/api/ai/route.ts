import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { summarizeMeetingTranscript } from '@/lib/ai/meeting-summary'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { meetingId?: string; transcript?: string }
    if (!body.meetingId || !body.transcript) {
      return NextResponse.json({ error: 'meetingId + transcript required' }, { status: 400 })
    }
    const summary = await summarizeMeetingTranscript(body.transcript)

    const [meeting] = await prisma.$transaction([
      prisma.meeting.update({
        where: { id: body.meetingId },
        data: { status: 'ENDED' },
      }),
      prisma.meetingArtifact.create({
        data: {
          meetingId: body.meetingId,
          type: 'transcript',
          content: body.transcript,
        },
      }),
      prisma.meetingArtifact.create({
        data: {
          meetingId: body.meetingId,
          type: 'summary',
          content: summary.summary,
        },
      }),
      prisma.meetingArtifact.create({
        data: {
          meetingId: body.meetingId,
          type: 'action_items',
          content: JSON.stringify(summary),
        },
      }),
    ])

    return NextResponse.json({ success: true, meeting, summary })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'ai failed' }, { status: 500 })
  }
}
