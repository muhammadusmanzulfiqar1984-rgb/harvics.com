'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import {
  LA_PRES_NAME,
  laPresUrl,
  resolveAccessCode,
  savePresentationSession,
  type PresentationAccessGrant,
} from '@/data/presentationAccess'

function redirectPathForGrant(locale: string, grant: PresentationAccessGrant): string {
  if (grant.deckId) return laPresUrl(locale, grant.deckId)
  if (grant.zone === 'lobby') return laPresUrl(locale, 'lobby')
  return laPresUrl(locale, 'lounge')
}

export default function PresentationAccessGate() {
  const locale = useLocale()
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const grant = resolveAccessCode(code)
    if (!grant) {
      setError('Invalid programme code. Please try again.')
      setCode('')
      return
    }
    savePresentationSession(grant)
    router.push(redirectPathForGrant(locale, grant))
  }

  return (
    <div
      className="border border-[#C3A35E]/35 bg-[#141010]/95 backdrop-blur-sm p-8 md:p-10 max-w-md w-full mx-auto"
      style={{ borderRadius: '12px' }}
    >
      <p className="text-[10px] uppercase tracking-[0.28em] text-[#C3A35E] font-bold mb-3">
        Harvics
      </p>
      <h2 className="text-3xl md:text-4xl font-semibold text-white mb-2 tracking-tight">
        {LA_PRES_NAME}
      </h2>
      <p className="text-sm text-white/50 mb-8 leading-relaxed">
        Enter the programme code shared with you. Your code opens Lobby, Lounge, or your deck
        directly.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="la-pres-code" className="sr-only">
          Programme code
        </label>
        <input
          id="la-pres-code"
          type="password"
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            setError('')
          }}
          placeholder="Programme code"
          autoComplete="off"
          className="w-full px-4 py-3.5 border border-[#C3A35E]/30 bg-black/40 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#C3A35E]"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full py-3.5 bg-[#C3A35E] text-[#1a0d00] text-xs font-bold uppercase tracking-[0.18em] hover:bg-[#d4b46e] transition-colors"
        >
          Enter {LA_PRES_NAME}
        </button>
      </form>
    </div>
  )
}
