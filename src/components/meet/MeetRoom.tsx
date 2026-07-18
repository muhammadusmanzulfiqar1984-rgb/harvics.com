'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  useRealtimeKitClient,
  RealtimeKitProvider,
} from '@cloudflare/realtimekit-react'
import { RtkMeeting } from '@cloudflare/realtimekit-react-ui'
import { MEET_NAME, MEET_NAME_KEY } from '@/data/meetAccess'

type Status = 'preparing' | 'need-name' | 'joining' | 'connecting' | 'ready' | 'error'

export default function MeetRoom({ meetingId, locale }: { meetingId: string; locale: string }) {
  const [meeting, initMeeting] = useRealtimeKitClient()
  const [status, setStatus] = useState<Status>('preparing')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [meetingLate, setMeetingLate] = useState(false)
  const initialized = useRef(false)
  const connectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearConnectTimer = () => {
    if (connectTimer.current) {
      clearTimeout(connectTimer.current)
      connectTimer.current = null
    }
  }

  const startWithToken = async (authToken: string) => {
    setStatus('connecting')
    setError(null)
    setMeetingLate(false)
    clearConnectTimer()
    connectTimer.current = setTimeout(() => setMeetingLate(true), 20000)

    try {
      const client = await initMeeting({
        authToken,
        defaults: { audio: true, video: true },
        modules: { devTools: { logs: process.env.NODE_ENV === 'development' } },
        onError: (sdkError: { message?: string; code?: string | number }) => {
          setError(sdkError?.message || `Meeting SDK error (${sdkError?.code ?? 'unknown'})`)
          setStatus('error')
          clearConnectTimer()
        },
      })
      if (!client) {
        setError('Could not initialize the meeting client. Check browser console for CSP/network errors.')
        setStatus('error')
        clearConnectTimer()
        return
      }
      setStatus('ready')
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to the meeting room.')
      setStatus('error')
      clearConnectTimer()
    }
  }

  const requestTokenAndJoin = async (displayName: string) => {
    setStatus('joining')
    setError(null)
    try {
      const res = await fetch('/api/meet/join', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId, name: displayName }),
      })
      const data = await res.json()
      if (!res.ok || !data?.authToken) {
        setError(data?.error || 'Could not join this meeting.')
        setStatus('error')
        return
      }
      await startWithToken(data.authToken)
    } catch (err: any) {
      setError(err?.message || 'Network error while joining.')
      setStatus('error')
    }
  }

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const hostToken =
      typeof window !== 'undefined'
        ? sessionStorage.getItem(`harvics_meet_token_${meetingId}`)
        : null
    if (hostToken) {
      sessionStorage.removeItem(`harvics_meet_token_${meetingId}`)
      void startWithToken(hostToken)
      return
    }

    const savedName =
      typeof window !== 'undefined' ? sessionStorage.getItem(MEET_NAME_KEY) : null
    if (savedName) {
      setName(savedName)
      void requestTokenAndJoin(savedName)
    } else {
      setStatus('need-name')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId])

  useEffect(() => {
    if (meeting) {
      clearConnectTimer()
      setMeetingLate(false)
    }
  }, [meeting])

  useEffect(() => () => clearConnectTimer(), [])

  const submitName = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    if (typeof window !== 'undefined') sessionStorage.setItem(MEET_NAME_KEY, trimmed)
    void requestTokenAndJoin(trimmed)
  }

  if (status === 'ready' && meeting) {
    return (
      <div className="fixed inset-0 z-[1100] bg-black">
        <RealtimeKitProvider value={meeting}>
          <RtkMeeting mode="fill" meeting={meeting} showSetupScreen={true} />
        </RealtimeKitProvider>
      </div>
    )
  }

  return (
    <main className="min-h-screen pt-[136px] relative overflow-hidden" style={{ background: '#0a0808' }}>
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, #3D1212 0%, transparent 55%), radial-gradient(circle at 90% 80%, #C3A35E 0%, transparent 40%)',
        }}
      />
      <section className="relative z-10 max-w-[520px] mx-auto px-4 py-16 md:py-24">
        <p className="text-[10px] uppercase tracking-[0.32em] text-harvics-gold font-semibold mb-3">
          {MEET_NAME}
        </p>

        {status === 'need-name' && (
          <>
            <h1 className="text-3xl font-semibold text-white mb-2">Join meeting</h1>
            <p className="text-sm text-white/50 mb-8">Enter your name to join this room.</p>
            <form onSubmit={submitName}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoFocus
                className="w-full bg-white/5 border border-harvics-gold/25 text-white placeholder-white/30 px-4 py-3 mb-5 outline-none focus:border-harvics-gold/70 transition-colors"
              />
              <button
                type="submit"
                className="w-full px-5 py-3.5 bg-harvics-gold text-harvics-burgundy text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#d4b56d] transition-colors"
              >
                Join now
              </button>
            </form>
          </>
        )}

        {(status === 'preparing' || status === 'joining') && (
          <>
            <h1 className="text-3xl font-semibold text-white mb-2">
              {status === 'joining' ? 'Joining…' : 'Preparing room…'}
            </h1>
            <p className="text-sm text-white/50">Setting up your secure meeting.</p>
          </>
        )}

        {status === 'connecting' && (
          <>
            <h1 className="text-3xl font-semibold text-white mb-2">Connecting to room…</h1>
            {!meetingLate ? (
              <p className="text-sm text-white/50">Establishing your secure video connection.</p>
            ) : (
              <>
                <p className="text-sm text-amber-300/90 border border-amber-400/30 bg-amber-500/10 px-4 py-3 mb-6">
                  Connection is slow. Allow camera/microphone if prompted, then reload. If it
                  persists, check that RealtimeKit is allowed in your browser/network.
                </p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 px-5 py-3 border border-harvics-gold/40 text-harvics-gold text-xs font-semibold uppercase tracking-[0.14em] hover:bg-harvics-gold/10 transition-all"
                >
                  Reload
                </button>
              </>
            )}
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-3xl font-semibold text-white mb-2">Unable to join</h1>
            <p className="text-sm text-red-300/90 border border-red-400/30 bg-red-500/10 px-4 py-3 mb-6">
              {error}
            </p>
            <Link
              href={`/${locale}/meet`}
              className="inline-flex items-center gap-2 px-5 py-3 border border-harvics-gold/40 text-harvics-gold text-xs font-semibold uppercase tracking-[0.14em] hover:bg-harvics-gold/10 transition-all"
            >
              ← Back to Harvics Meet
            </Link>
          </>
        )}
      </section>
    </main>
  )
}
