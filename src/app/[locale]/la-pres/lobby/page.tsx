import Link from 'next/link'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'
import { getPresentationsByCategory, presentationAreas } from '@/data/presentationsCatalog'
import { laPresUrl } from '@/data/presentationAccess'
import PresentationCard from '@/components/presentations/PresentationCard'
import PresentationZoneGuard from '@/components/presentations/PresentationZoneGuard'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export default async function LaPresLobbyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const area = presentationAreas.lobby
  const decks = getPresentationsByCategory('lobby')

  return (
    <PresentationZoneGuard mode={{ type: 'zone', zone: 'lobby' }}>
      <main className="min-h-screen pt-[136px]" style={{ background: '#ffffff' }}>
        <section className="max-w-[1100px] mx-auto px-4 py-12">
          <Link
            href={laPresUrl(locale)}
            className="inline-flex items-center text-xs uppercase tracking-[0.16em] text-harvics-gold hover:text-harvics-burgundy transition-colors mb-8"
          >
            ← La Pres
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-harvics-burgundy mb-3">{area.title}</h1>
          <p className="text-sm md:text-base text-harvics-burgundy/60 max-w-[720px] leading-relaxed mb-10">
            {area.description}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {decks.map((presentation) => (
              <PresentationCard key={presentation.id} presentation={presentation} locale={locale} />
            ))}
          </div>
        </section>
      </main>
    </PresentationZoneGuard>
  )
}
