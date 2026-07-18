'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { LA_PRES_ENTRY_PATH, LA_PRES_NAME } from '@/data/presentationAccess'
import { getPresentationForVertical } from '@/data/presentationsCatalog'

export default function PresentationAccessBanner({ verticalKey }: { verticalKey: string }) {
  const locale = useLocale()
  const presentation = getPresentationForVertical(verticalKey)

  if (!presentation) return null

  const areaLabel = presentation.category === 'lounge' ? 'Lounge' : 'Lobby'

  return (
    <div className="border border-harvics-gold/30 bg-harvics-burgundy/95 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-harvics-gold font-bold mb-1">
          {LA_PRES_NAME} · {areaLabel}
        </p>
        <p className="text-sm text-white/80">{presentation.title}</p>
      </div>
      <Link
        href={`/${locale}/${LA_PRES_ENTRY_PATH}`}
        className="inline-flex items-center justify-center px-6 py-2.5 bg-harvics-gold text-harvics-burgundy text-xs font-bold uppercase tracking-[0.14em] hover:bg-[#d4b46e] transition-colors shrink-0"
      >
        Enter {LA_PRES_NAME}
      </Link>
    </div>
  )
}
