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
    <article className="border border-[#C3A35E]/25 bg-white p-7 flex flex-col hover:border-[#C3A35E] transition-colors">
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#C3A35E] font-bold mb-3">
        {presentation.subtitle}
      </p>
      <h2 className="text-2xl font-semibold text-[#6B1F2B] mb-3">{presentation.title}</h2>
      <p className="text-sm text-[#6B1F2B]/60 leading-relaxed mb-5 flex-1">
        {presentation.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {presentation.verticals.map((tag) => (
          <span
            key={tag}
            className="text-[10px] uppercase tracking-wider px-2.5 py-1 border border-[#C3A35E]/30 text-[#6B1F2B]/70"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 text-xs text-[#6B1F2B]/50 mb-6">
        <span>{presentation.duration}</span>
        <span>{presentation.format}</span>
      </div>

      {presentation.accessNote && (
        <p className="text-xs text-[#6B1F2B]/45 mb-5">{presentation.accessNote}</p>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href={laPresUrl(locale, presentation.id)}
          className="inline-flex items-center justify-center px-6 py-3 bg-[#C3A35E] text-[#6B1F2B] text-xs font-bold uppercase tracking-[0.14em] hover:bg-[#d4b46e] transition-colors"
        >
          Open Deck
        </Link>
        <a
          href={presentation.launchPath}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-6 py-3 border border-[#6B1F2B]/20 text-[#6B1F2B] text-xs font-bold uppercase tracking-[0.14em] hover:border-[#C3A35E] transition-colors"
        >
          New Tab
        </a>
      </div>
    </article>
  )
}
