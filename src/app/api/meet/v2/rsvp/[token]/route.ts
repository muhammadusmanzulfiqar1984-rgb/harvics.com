import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params
  const url = new URL(req.url)
  const v = (url.searchParams.get('v') || '').trim()
  if (!['Yes', 'Maybe', 'No'].includes(v)) {
    return NextResponse.json({ error: 'v must be Yes|Maybe|No' }, { status: 400 })
  }

  const guest = await prisma.meetGuest.findUnique({
    where: { inviteToken: token },
    include: { meeting: true },
  })
  if (!guest) return NextResponse.json({ error: 'Invite not found' }, { status: 404 })

  await prisma.meetGuest.update({
    where: { id: guest.id },
    data: { rsvp: v, respondedAt: new Date() },
  })

  const joinPath = `/en/apps/meet/${guest.meeting.slug}?token=${guest.inviteToken}`
  // Browser-friendly redirect for email links
  if (req.headers.get('accept')?.includes('text/html')) {
    return NextResponse.redirect(new URL(joinPath, url.origin))
  }

  return NextResponse.json({
    success: true,
    rsvp: v,
    meeting: { slug: guest.meeting.slug, title: guest.meeting.title },
    joinUrl: joinPath,
  })
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params
  const body = (await req.json().catch(() => ({}))) as { rsvp?: string; name?: string }
  const v = body.rsvp
  if (!v || !['Yes', 'Maybe', 'No'].includes(v)) {
    return NextResponse.json({ error: 'rsvp must be Yes|Maybe|No' }, { status: 400 })
  }
  const guest = await prisma.meetGuest.findUnique({
    where: { inviteToken: token },
    include: { meeting: true },
  })
  if (!guest) return NextResponse.json({ error: 'Invite not found' }, { status: 404 })

  const updated = await prisma.meetGuest.update({
    where: { id: guest.id },
    data: {
      rsvp: v,
      respondedAt: new Date(),
      name: body.name || guest.name,
    },
  })

  return NextResponse.json({
    success: true,
    guest: updated,
    meeting: { slug: guest.meeting.slug, title: guest.meeting.title },
  })
}
