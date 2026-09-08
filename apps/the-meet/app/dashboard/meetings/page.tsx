import Link from 'next/link'

export default function DashboardMeetingsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-meet-gold">Meetings</p>
      <h1 className="mt-1 text-2xl font-semibold">All meetings</h1>
      <p className="mt-2 text-sm text-white/50">
        See hosted meetings on the <Link href="/dashboard" className="text-meet-gold hover:underline">main dashboard</Link>.
      </p>
    </main>
  )
}
