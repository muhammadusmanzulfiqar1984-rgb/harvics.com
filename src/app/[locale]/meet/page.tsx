import { generateAllLocaleParams } from '@/lib/generateLocaleParams'
import { MEET_NAME } from '@/data/meetAccess'
import MeetGate from '@/components/meet/MeetGate'
import OpsAccessGate from '@/components/auth/OpsAccessGate'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export default async function MeetPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <main className="min-h-screen pt-[136px] relative overflow-hidden" style={{ background: '#0a0808' }}>
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, #3D1212 0%, transparent 55%), radial-gradient(circle at 90% 80%, #C3A35E 0%, transparent 40%)',
        }}
      />
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[length:48px_48px] bg-[linear-gradient(#C3A35E_1px,transparent_1px),linear-gradient(90deg,#C3A35E_1px,transparent_1px)]" />

      <section className="relative z-10 max-w-[1100px] mx-auto px-4 py-16 md:py-24 flex flex-col items-center">
        <OpsAccessGate
          title={MEET_NAME}
          subtitle="Enter the ops access code to start or join secure video rooms."
        >
          <MeetGate locale={locale} />
        </OpsAccessGate>

        <p className="mt-10 text-xs text-white/30 text-center max-w-sm leading-relaxed">
          {MEET_NAME} is separate from company sign-in at /login. Rooms are powered by Cloudflare
          RealtimeKit.
        </p>
      </section>
    </main>
  )
}
