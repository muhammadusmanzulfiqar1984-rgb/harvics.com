import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-4xl flex-col items-center justify-center px-4 text-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-meet-gold">Production Meet</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Harvics Meet</h1>
      <p className="mt-4 max-w-xl text-sm text-white/55">
        Schedule · invite · RSVP · pre-join · LiveKit room · AI summary. Next.js · Auth.js · Prisma · LiveKit Cloud.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/schedule" className="rounded-lg bg-meet-gold px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#1a0d00]">
          Schedule meeting
        </Link>
        <Link href="/dashboard" className="rounded-lg border border-white/20 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white/80">
          Dashboard
        </Link>
      </div>
    </main>
  )
}
