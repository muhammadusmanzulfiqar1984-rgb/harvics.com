'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import {
  canAccessDeck,
  canAccessZone,
  LA_PRES_ENTRY_PATH,
  readPresentationSession,
  type PresentationZone,
} from '@/data/presentationAccess'
import type { PresentationCategory, PresentationId } from '@/data/presentationsCatalog'

type GuardMode =
  | { type: 'zone'; zone: PresentationZone }
  | { type: 'deck'; deckId: PresentationId; deckCategory: PresentationCategory }

export default function PresentationZoneGuard({
  children,
  mode,
}: {
  children: React.ReactNode
  mode: GuardMode
}) {
  const locale = useLocale()
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const session = readPresentationSession()
    const ok =
      mode.type === 'zone'
        ? canAccessZone(session, mode.zone)
        : canAccessDeck(session, mode.deckId, mode.deckCategory)

    if (ok) {
      setAllowed(true)
      return
    }
    router.replace(`/${locale}/${LA_PRES_ENTRY_PATH}`)
  }, [locale, mode, router])

  if (!allowed) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center pt-[136px]">
        <p className="text-sm text-harvics-burgundy/50 uppercase tracking-widest">Checking access…</p>
      </div>
    )
  }

  return <>{children}</>
}
