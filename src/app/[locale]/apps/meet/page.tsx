import Link from 'next/link'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'
import { MEET_APP_NAME } from '@/lib/harvicsMeet'
import MeetCreateWizard from '@/components/harvics-meet/MeetCreateWizard'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export const metadata = {
  title: 'Harvics Meet — Secure Video Meetings | Harvics Apps',
  description:
    'Create meetings, invite guests, RSVP, pre-join device checks, LiveKit rooms, and AI summaries.',
}

export default async function HarvicsMeetAppPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <main className="fixed inset-0 z-[80] overflow-y-auto bg-[#0a0808] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            'radial-gradient(ellipse at 20% 0%, #3D1212 0%, transparent 50%), radial-gradient(circle at 90% 20%, #C3A35E33 0%, transparent 35%)',
        }}
      />
      <header className="relative z-10 flex items-center justify-between gap-4 border-b border-[#c3a35e]/25 px-4 py-3 md:px-6 backdrop-blur-sm bg-[#0a0808]/80">
        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-[0.22em] text-[#c3a35e] font-bold">
            Harvics · Apps · Meet
          </p>
          <h1 className="truncate text-sm font-semibold md:text-base">{MEET_APP_NAME}</h1>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href={`/${locale}/apps`}
            className="inline-flex items-center justify-center border border-[#c3a35e]/40 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#c3a35e] hover:bg-[#c3a35e]/10"
          >
            ← Apps
          </Link>
          <Link
            href={`/${locale}/meet`}
            className="inline-flex items-center justify-center bg-[#c3a35e] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1a0d00]"
          >
            Web module
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1fr_280px] md:py-14">
        <MeetCreateWizard locale={locale} />
        <aside className="space-y-4 text-sm text-white/60">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#c3a35e]">Stack</p>
            <ul className="space-y-2 text-xs leading-relaxed">
              <li>Next.js app · Auth.js · Prisma / PostgreSQL</li>
              <li>LiveKit Cloud · WebRTC / SFU</li>
              <li>Deepgram transcript · OpenAI summary</li>
              <li>Resend invites · R2 artifacts · Inngest jobs</li>
              <li>Redis · Sentry · PostHog · Vercel</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#c3a35e]">Flow</p>
            <ol className="list-decimal space-y-1 pl-4 text-xs leading-relaxed">
              <li>Create (title · time · guests)</li>
              <li>Link + calendar + email</li>
              <li>RSVP Yes / Maybe / No</li>
              <li>Pre-join camera / mic / speaker</li>
              <li>Waiting room or direct join</li>
              <li>Meeting + AI layer</li>
              <li>Artifacts · follow-up</li>
            </ol>
          </div>
        </aside>
      </section>
    </main>
  )
}
