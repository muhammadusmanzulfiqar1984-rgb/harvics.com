import Link from 'next/link'
import { notFound } from 'next/navigation'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'
import { getPresentation, presentationsCatalog } from '@/data/presentationsCatalog'
import { laPresUrl } from '@/data/presentationAccess'
import PresentationZoneGuard from '@/components/presentations/PresentationZoneGuard'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const locales = generateAllLocaleParams()
  return locales.flatMap(({ locale }) =>
    presentationsCatalog.map((presentation) => ({
      locale,
      id: presentation.id,
    }))
  )
}

export default async function LaPresDeckPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const presentation = getPresentation(id)

  if (!presentation) {
    notFound()
  }

  const backHref =
    presentation.category === 'lounge' ? laPresUrl(locale, 'lounge') : laPresUrl(locale, 'lobby')

  return (
    <PresentationZoneGuard
      mode={{ type: 'deck', deckId: presentation.id, deckCategory: presentation.category }}
    >
      <main className="min-h-screen pt-[136px]" style={{ background: '#0d0d0d' }}>
        <section className="max-w-[1200px] mx-auto px-4 py-10">
          <Link
            href={backHref}
            className="inline-flex items-center text-xs uppercase tracking-[0.16em] text-[#C3A35E] hover:text-[#e8cc8a] transition-colors mb-8"
          >
            ← Back
          </Link>

          <div className="border border-[#C3A35E]/25 bg-[#141414] p-6 md:p-8 mb-6">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#C3A35E] font-bold mb-3">
              {presentation.subtitle}
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-white mb-3">{presentation.title}</h1>
            <p className="text-sm md:text-base text-white/65 max-w-[760px] leading-relaxed">
              {presentation.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <a
              href={presentation.launchPath}
              className="inline-flex items-center justify-center px-7 py-3 bg-[#C3A35E] text-[#1a0d00] text-xs font-bold uppercase tracking-[0.14em] hover:bg-[#d4b46e] transition-colors"
            >
              Launch Full Screen
            </a>
            <a
              href={presentation.launchPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-7 py-3 border border-[#C3A35E]/40 text-[#C3A35E] text-xs font-bold uppercase tracking-[0.14em] hover:bg-[#C3A35E]/10 transition-colors"
            >
              Open in New Tab
            </a>
          </div>

          <div
            className="relative w-full overflow-hidden border border-[#C3A35E]/20 bg-black"
            style={{ height: '72vh' }}
          >
            <iframe
              title={presentation.title}
              src={presentation.launchPath}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen"
            />
          </div>
        </section>
      </main>
    </PresentationZoneGuard>
  )
}
