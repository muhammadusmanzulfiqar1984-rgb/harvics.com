import Link from 'next/link'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'
import { LA_PRES_NAME } from '@/data/presentationAccess'
import PresentationAccessGate from '@/components/presentations/PresentationAccessGate'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export default async function LaPresPage({
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
            'radial-gradient(ellipse at 50% 0%, #6B1F2B 0%, transparent 55%), radial-gradient(circle at 90% 80%, #C3A35E 0%, transparent 40%)',
        }}
      />
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[length:48px_48px] bg-[linear-gradient(#C3A35E_1px,transparent_1px),linear-gradient(90deg,#C3A35E_1px,transparent_1px)]" />

      <section className="relative z-10 max-w-[1100px] mx-auto px-4 py-16 md:py-24 flex flex-col items-center">
        <Link
          href={`/${locale}/portals`}
          className="self-start inline-flex items-center text-xs uppercase tracking-[0.16em] text-[#C3A35E]/80 hover:text-[#C3A35E] transition-colors mb-12"
        >
          ← Portals
        </Link>

        <PresentationAccessGate />

        <p className="mt-10 text-xs text-white/30 text-center max-w-sm leading-relaxed">
          {LA_PRES_NAME} is separate from company sign-in at /login.
        </p>
      </section>
    </main>
  )
}
