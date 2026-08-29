import Link from 'next/link'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'

export const dynamic = 'force-dynamic'

const LAUNCH_PATH = '/tabraiz-town/index.html'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export default async function TabraizTownProjectPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <main className="fixed inset-0 z-[80] bg-black flex flex-col">
      <header className="shrink-0 flex items-center justify-between gap-4 px-4 md:px-6 py-3 border-b border-harvics-gold/20 bg-[#0a0a0a]/90 backdrop-blur-sm">
        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-[0.22em] text-harvics-gold font-bold">
            Harvics · Real Estate
          </p>
          <h1 className="text-sm md:text-base font-semibold text-white truncate">
            Tabraiz Town — Rahim Yar Khan
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            href={`/${locale}/real-estate`}
            className="inline-flex items-center justify-center px-4 py-2 border border-harvics-gold/40 text-harvics-gold text-[10px] font-bold uppercase tracking-[0.14em] hover:bg-harvics-gold/10 transition-colors"
          >
            ← Real Estate
          </Link>
          <a
            href={LAUNCH_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 bg-harvics-gold text-[#1a0d00] text-[10px] font-bold uppercase tracking-[0.14em] hover:bg-[#d4b46e] transition-colors"
          >
            Full Screen
          </a>
        </div>
      </header>
      <iframe
        title="Tabraiz Town — Rahim Yar Khan"
        src={LAUNCH_PATH}
        className="flex-1 w-full border-0 bg-black"
        allow="autoplay; fullscreen"
      />
    </main>
  )
}
