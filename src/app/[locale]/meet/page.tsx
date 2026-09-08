import Link from 'next/link'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'
import { MEET_APP_NAME } from '@/lib/harvicsMeet'
import MeetCreateWizard from '@/components/harvics-meet/MeetCreateWizard'
import OpsAccessGate from '@/components/auth/OpsAccessGate'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export default async function MeetWebModulePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <main className="relative min-h-screen overflow-hidden pt-[136px]" style={{ background: '#0a0808' }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, #3D1212 0%, transparent 55%), radial-gradient(circle at 90% 80%, #C3A35E 0%, transparent 40%)',
        }}
      />
      <section className="relative z-10 mx-auto flex max-w-[1100px] flex-col items-center px-4 py-16 md:py-24">
        <OpsAccessGate
          title={MEET_APP_NAME}
          subtitle="Same Meet module as Apps — create, invite, RSVP, LiveKit rooms, AI artifacts."
        >
          <MeetCreateWizard locale={locale} />
        </OpsAccessGate>
        <p className="mt-8 max-w-md text-center text-xs leading-relaxed text-white/30">
          Web module at /meet · Apps shell at{' '}
          <Link href={`/${locale}/apps/meet`} className="text-[#c3a35e] hover:underline">
            /apps/meet
          </Link>
          . Video via LiveKit Cloud.
        </p>
      </section>
    </main>
  )
}
