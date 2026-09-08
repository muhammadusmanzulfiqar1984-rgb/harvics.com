import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { listMeetingsForHost, mapMeetingStatusLabel } from '@/lib/meetings'
import { RSVPStatus } from '@/components/scheduling/RSVPStatus'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  const meetings = email ? await listMeetingsForHost(email) : []

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-meet-gold">Dashboard</p>
          <h1 className="text-2xl font-semibold">Your meetings</h1>
        </div>
        <Link href="/schedule" className="rounded-lg bg-meet-gold px-4 py-2 text-xs font-bold uppercase text-[#1a0d00]">
          New
        </Link>
      </div>
      {!email && (
        <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
          <Link href="/login" className="text-meet-gold hover:underline">
            Sign in
          </Link>{' '}
          to see hosted meetings.
        </p>
      )}
      <div className="space-y-3">
        {meetings.map((m) => (
          <Link
            key={m.id}
            href={`/meeting/${m.id}/prejoin?host=1`}
            className="block rounded-xl border border-meet-border bg-meet-panel p-4 hover:border-meet-gold/40"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-medium">{m.title}</h2>
                <p className="text-xs text-white/45">
                  {new Date(m.startTime).toLocaleString()} · {m._count.participants} participants · code{' '}
                  {m.meetingCode}
                </p>
              </div>
              <RSVPStatus rsvp={mapMeetingStatusLabel(m.status)} />
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
