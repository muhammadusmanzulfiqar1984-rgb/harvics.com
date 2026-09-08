import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * End meeting + optional AI summary (OpenAI) from provided transcript text.
 * Deepgram live STT hooks in later via LiveKit egress / data channel.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params
  try {
    const body = (await req.json().catch(() => ({}))) as {
      transcript?: string
      generateSummary?: boolean
    }
    const meeting = await prisma.meetMeeting.findUnique({ where: { slug } })
    if (!meeting) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    let summaryText = meeting.summaryText
    let actionItems = meeting.actionItems

    if (body.generateSummary && body.transcript && process.env.OPENAI_API_KEY) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MEET_MODEL || 'gpt-4o-mini',
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'Summarize a meeting transcript. Return JSON: {"summary":"2-4 paragraphs","decisions":["..."],"actionItems":[{"owner":"","task":"","due":null}]}',
            },
            { role: 'user', content: body.transcript.slice(0, 12000) },
          ],
        }),
      })
      const json: any = await res.json().catch(() => ({}))
      const raw = json?.choices?.[0]?.message?.content
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          summaryText = parsed.summary || raw
          actionItems = {
            decisions: parsed.decisions || [],
            actionItems: parsed.actionItems || [],
          }
        } catch {
          summaryText = String(raw)
        }
      }
    }

    const updated = await prisma.meetMeeting.update({
      where: { id: meeting.id },
      data: {
        status: 'Ended',
        endedAt: new Date(),
        summaryText: summaryText || undefined,
        actionItems: actionItems || undefined,
        transcriptUrl: body.transcript ? `inline://${meeting.id}` : meeting.transcriptUrl,
      },
    })

    return NextResponse.json({ success: true, meeting: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'end failed' }, { status: 500 })
  }
}
