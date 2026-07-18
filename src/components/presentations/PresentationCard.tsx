import Link from 'next/link'
import type { PresentationEntry } from '@/data/presentationsCatalog'
import { laPresUrl } from '@/data/presentationAccess'

export default function PresentationCard({
  presentation,
  locale,
}: {
  presentation: PresentationEntry
  locale: string
}) {
  return (
    <article className="border border-harvics-gold/25 bg-white p-7 flex flex-col hover:border-harvics-gold transition-colors">
      <p className="text-[10px] uppercase tracking-[0.2em] text-harvics-gold font-bold mb-3">
        {presentation.subtitle}
      </p>
      <h2 className="text-2xl font-semibold text-harvics-burgundy mb-3">{presentation.title}</h2>
      <p className="text-sm text-harvics-burgundy/60 leading-relaxed mb-5 flex-1">
        {presentation.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {presentation.verticals.map((tag) => (
          <span
            key={tag}
            className="text-[10px] uppercase tracking-wider px-2.5 py-1 border border-harvics-gold/30 text-harvics-burgundy/70"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 text-xs text-harvics-burgundy/50 mb-6">
        <span>{presentation.duration}</span>
        <span>{presentation.format}</span>
      </div>

      {presentation.accessNote && (
        <p className="text-xs text-harvics-burgundy/45 mb-5">{presentation.accessNote}</p>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href={laPresUrl(locale, presentation.id)}
          className="inline-flex items-center justify-center px-6 py-3 bg-harvics-gold text-harvics-burgundy text-xs font-bold uppercase tracking-[0.14em] hover:bg-[#d4b46e] transition-colors"
        >
          Open Deck
        </Link>
        <a
          href={presentation.launchPath}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-6 py-3 border border-harvics-burgundy/20 text-harvics-burgundy text-xs font-bold uppercase tracking-[0.14em] hover:border-harvics-gold transition-colors"
        >
          New Tab
        </a>
      </div>
    </article>
  )
}
