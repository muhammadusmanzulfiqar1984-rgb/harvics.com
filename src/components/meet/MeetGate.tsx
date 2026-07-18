'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MEET_NAME, MEET_NAME_KEY, meetUrl } from '@/data/meetAccess'

/** Extract a meeting id from either a raw id or a pasted /meet/<id> link. */
function parseMeetingId(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''
  const match = trimmed.match(/meet\/([^/?#\s]+)/i)
  return match ? match[1] : trimmed
}

export default function MeetGate({ locale }: { locale: string }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [joinInput, setJoinInput] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const rememberName = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(MEET_NAME_KEY, name.trim() || 'Host')
    }
  }

  const handleStart = async () => {
    if (!name.trim()) {
      setError('Enter your name to start a meeting.')
      return
    }
    setError(null)
    setCreating(true)
    try {
      const res = await fetch('/api/meet/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), title: `${name.trim()}'s Harvics Meeting` }),
      })
      const data = await res.json()
      if (!res.ok || !data?.meetingId || !data?.authToken) {
        setError(data?.error || 'Could not start the meeting. Check server configuration.')
        setCreating(false)
        return
      }
      rememberName()
      // Reuse the host token issued at creation to avoid a second round-trip.
      sessionStorage.setItem(`harvics_meet_token_${data.meetingId}`, data.authToken)
      router.push(meetUrl(locale, data.meetingId))
    } catch (err: any) {
      setError(err?.message || 'Network error while starting the meeting.')
      setCreating(false)
    }
  }

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    const id = parseMeetingId(joinInput)
    if (!id) {
      setError('Paste a meeting link or ID to join.')
      return
    }
    setError(null)
    rememberName()
    router.push(meetUrl(locale, id))
  }

  return (
    <div className="w-full max-w-md">
      <p className="text-[10px] uppercase tracking-[0.32em] text-harvics-gold font-semibold mb-3">
        Harvics Global Ventures
      </p>
      <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-white mb-3">
        {MEET_NAME}
      </h1>
      <p className="text-sm text-white/50 leading-relaxed mb-8">
        Secure video rooms for buyer &amp; supplier calls, board sessions, and internal meetings.
        Start a room and share the link — no account needed to join.
      </p>

      <label className="block text-[10px] uppercase tracking-[0.2em] text-harvics-gold/80 font-semibold mb-2">
        Your name
      </label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Ali Raza"
        className="w-full bg-white/5 border border-harvics-gold/25 text-white placeholder-white/30 px-4 py-3 mb-5 outline-none focus:border-harvics-gold/70 transition-colors"
      />

      <button
        type="button"
        onClick={handleStart}
        disabled={creating}
        className="w-full px-5 py-3.5 bg-harvics-gold text-harvics-burgundy text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#d4b56d] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {creating ? 'Creating room…' : 'Start a meeting'}
      </button>

      <div className="flex items-center gap-4 my-7">
        <span className="h-px flex-1 bg-harvics-gold/20" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">or join</span>
        <span className="h-px flex-1 bg-harvics-gold/20" />
      </div>

      <form onSubmit={handleJoin}>
        <label className="block text-[10px] uppercase tracking-[0.2em] text-harvics-gold/80 font-semibold mb-2">
          Meeting link or ID
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={joinInput}
            onChange={(e) => setJoinInput(e.target.value)}
            placeholder="Paste link or ID"
            className="flex-1 min-w-0 bg-white/5 border border-harvics-gold/25 text-white placeholder-white/30 px-4 py-3 outline-none focus:border-harvics-gold/70 transition-colors"
          />
          <button
            type="submit"
            className="shrink-0 px-5 py-3 border border-harvics-gold/40 text-harvics-gold text-xs font-semibold uppercase tracking-[0.14em] hover:bg-harvics-gold/10 hover:border-harvics-gold/70 transition-all"
          >
            Join
          </button>
        </div>
      </form>

      {error && (
        <p className="mt-5 text-sm text-red-300/90 border border-red-400/30 bg-red-500/10 px-4 py-3">
          {error}
        </p>
      )}

      <div className="mt-10">
        <Link
          href={`/${locale}/login`}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/40 hover:text-harvics-gold transition-colors"
        >
          ← Back to sign in
        </Link>
      </div>
    </div>
  )
}
