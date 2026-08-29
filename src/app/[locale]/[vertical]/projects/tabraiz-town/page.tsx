import Link from 'next/link'
import { notFound } from 'next/navigation'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'

export const dynamic = 'force-dynamic'

const PROJECT_VERTICAL = 'real-estate'
const LAUNCH_PATH = '/tabraiz-town/index.html'

export async function generateStaticParams() {
  const locales = generateAllLocaleParams()
  return locales.map(({ locale }) => ({
    locale,
    vertical: PROJECT_VERTICAL,
  }))
}

export default async function TabraizTownProjectPage({
  params,
}: {
  params: Promise<{ locale: string; vertical: string }>
}) {
  const { locale, vertical } = await params

  if (vertical !== PROJECT_VERTICAL) {
    notFound()
  }

  return (
    <main className="min-h-screen pt-[136px]" style={{ background: '#0a0a0a' }}>
      <section className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-harvics-gold font-bold mb-2">
              Real Estate · Featured Project
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold text-white">Tabraiz Town</h1>
            <p className="text-sm text-white/60 mt-1">
              Rahim Yar Khan — 30-Kanal vertical mixed-use monolith
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/real-estate`}
              className="inline-flex items-center justify-center px-5 py-2.5 border border-harvics-gold/40 text-harvics-gold text-xs font-bold uppercase tracking-[0.14em] hover:bg-harvics-gold/10 transition-colors"
            >
              ← Real Estate
            </Link>
            <a
              href={LAUNCH_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-harvics-gold text-[#1a0d00] text-xs font-bold uppercase tracking-[0.14em] hover:bg-[#d4b46e] transition-colors"
            >
              Full Screen
            </a>
          </div>
        </div>

        <div
          className="relative w-full overflow-hidden border border-harvics-gold/20 bg-black"
          style={{ height: 'calc(100vh - 220px)', minHeight: '560px' }}
        >
          <iframe
            title="Tabraiz Town — Rahim Yar Khan"
            src={LAUNCH_PATH}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen"
          />
        </div>
      </section>
    </main>
  )
}
