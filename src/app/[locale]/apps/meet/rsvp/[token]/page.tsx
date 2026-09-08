import Link from 'next/link'
import { redirect } from 'next/navigation'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export default async function MeetRsvpPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; token: string }>
  searchParams: Promise<{ v?: string }>
}) {
  const { locale, token } = await params
  const { v } = await searchParams

  if (v && ['Yes', 'Maybe', 'No'].includes(v)) {
    const guest = await prisma.meetGuest.findUnique({
      where: { inviteToken: token },
      include: { meeting: true },
    })
    if (guest) {
      await prisma.meetGuest.update({
        where: { id: guest.id },
        data: { rsvp: v, respondedAt: new Date() },
      })
      if (v === 'Yes') {
        redirect(`/${locale}/apps/meet/${guest.meeting.slug}?token=${token}`)
      }
    }
  }

  const guest = await prisma.meetGuest.findUnique({
    where: { inviteToken: token },
    include: { meeting: true },
  })

  if (!guest) {
    return (
      <main className="min-h-screen bg-[#0a0808] px-4 py-24 text-center text-white">
        <p className="text-red-400">Invite not found.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0808] px-4 py-24 text-white">
      <div className="mx-auto max-w-md rounded-2xl border border-[#3d2a1a] bg-[#141010] p-8 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c3a35e]">RSVP</p>
        <h1 className="mt-2 text-xl font-semibold">{guest.meeting.title}</h1>
        <p className="mt-2 text-sm text-white/50">
          Hosted by {guest.meeting.hostName}
          {guest.meeting.scheduledAt
            ? ` · ${new Date(guest.meeting.scheduledAt).toLocaleString()}`
            : ''}
        </p>
        <p className="mt-4 text-sm text-white/70">Current: {guest.rsvp}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {(['Yes', 'Maybe', 'No'] as const).map((choice) => (
            <Link
              key={choice}
              href={`/${locale}/apps/meet/rsvp/${token}?v=${choice}`}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold ${
                choice === 'Yes'
                  ? 'bg-emerald-600 text-white'
                  : choice === 'Maybe'
                    ? 'bg-amber-600 text-white'
                    : 'bg-red-700 text-white'
              }`}
            >
              {choice}
            </Link>
          ))}
        </div>
        {guest.rsvp === 'Yes' && (
          <Link
            href={`/${locale}/apps/meet/${guest.meeting.slug}?token=${token}`}
            className="mt-6 inline-block text-sm text-[#c3a35e] hover:underline"
          >
            Join meeting →
          </Link>
        )}
      </div>
    </main>
  )
}
