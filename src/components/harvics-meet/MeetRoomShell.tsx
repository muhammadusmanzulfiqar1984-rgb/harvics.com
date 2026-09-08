'use client'

import React, { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import '@livekit/components-styles'

const LiveKitRoomInner = dynamic(() => import('./LiveKitRoomInner'), {
  ssr: false,
  loading: () => <p className="text-white/50 text-sm">Loading room…</p>,
})

type MeetingMeta = {
  id: string
  slug: string
  title: string
  status: string
  scheduledAt?: string | null
  durationMins: number
  waitingRoom: boolean
  guests?: Array<{ email: string; name?: string | null; rsvp: string; role: string }>
}

export default function MeetRoomShell({
  locale,
  slug,
  inviteToken,
  asHost,
}: {
  locale: string
  slug: string
  inviteToken?: string
  asHost?: boolean
}) {
  const [meeting, setMeeting] = useState<MeetingMeta | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<'loading' | 'prejoin' | 'waiting' | 'live' | 'error'>('loading')
  const [error, setError] = useState('')
  const [token, setToken] = useState('')
  const [serverUrl, setServerUrl] = useState('')
  const [devicesOk, setDevicesOk] = useState({ cam: false, mic: false, speaker: true })

  useEffect(() => {
    fetch(`/api/meet/v2/${slug}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.error) throw new Error(j.error)
        setMeeting(j.meeting)
        setStep('prejoin')
      })
      .catch((e) => {
        setError(e.message)
        setStep('error')
      })
  }, [slug])

  useEffect(() => {
    let stream: MediaStream | null = null
    ;(async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        setDevicesOk({ cam: true, mic: true, speaker: true })
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
          setDevicesOk({ cam: false, mic: true, speaker: true })
        } catch {
          setDevicesOk({ cam: false, mic: false, speaker: true })
        }
      } finally {
        stream?.getTracks().forEach((t) => t.stop())
      }
    })()
  }, [])

  const join = useCallback(async () => {
    setError('')
    try {
      const res = await fetch(`/api/meet/v2/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: email || undefined,
          inviteToken,
          role: asHost ? 'host' : undefined,
        }),
      })
      const json = await res.json()
      if (json.waitingRoom) {
        setStep('waiting')
        return
      }
      if (!res.ok) throw new Error(json.error || 'Join failed')
      setToken(json.token)
      setServerUrl(json.url)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('harvics_meet_display_name', name)
      }
      setStep('live')
    } catch (e: any) {
      setError(e.message || 'Join failed')
    }
  }, [slug, name, email, inviteToken, asHost])

  if (step === 'loading') {
    return <p className="text-white/50 text-center">Loading meeting…</p>
  }
  if (step === 'error') {
    return <p className="text-red-400 text-center">{error}</p>
  }

  if (step === 'waiting') {
    return (
      <div className="max-w-md mx-auto text-center text-white space-y-3 rounded-2xl border border-[#3d2a1a] bg-[#141010] p-8">
        <h2 className="text-xl font-semibold">Waiting room</h2>
        <p className="text-sm text-white/60">The host will let you in shortly. RSVP Yes if you haven&apos;t yet.</p>
        <button type="button" className="text-[#c3a35e] text-sm" onClick={() => setStep('prejoin')}>
          Back to pre-join
        </button>
      </div>
    )
  }

  if (step === 'live' && token && serverUrl) {
    return (
      <div className="fixed inset-0 z-[90] bg-black">
        <LiveKitRoomInner
          token={token}
          serverUrl={serverUrl}
          onLeave={() => {
            setToken('')
            setServerUrl('')
            setStep('prejoin')
          }}
        />
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto rounded-2xl border border-[#3d2a1a] bg-[#141010]/95 p-6 md:p-8 text-white space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#c3a35e] font-bold">Pre-join check</p>
        <h2 className="text-xl font-semibold mt-1">{meeting?.title || 'Meeting'}</h2>
        {meeting?.scheduledAt && (
          <p className="text-sm text-white/50 mt-1">{new Date(meeting.scheduledAt).toLocaleString()} · {meeting.durationMins}m</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        {[
          { ok: devicesOk.cam, label: 'Camera' },
          { ok: devicesOk.mic, label: 'Mic' },
          { ok: devicesOk.speaker, label: 'Speaker' },
        ].map((d) => (
          <div key={d.label} className={`rounded-lg border px-2 py-3 ${d.ok ? 'border-emerald-700/50 text-emerald-300' : 'border-white/10 text-white/40'}`}>
            {d.label}
            <div className="mt-1 font-semibold">{d.ok ? 'OK' : 'Check'}</div>
          </div>
        ))}
      </div>

      <label className="block text-xs text-white/50">
        Display name *
        <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white" />
      </label>
      {!inviteToken && (
        <label className="block text-xs text-white/50">
          Email (optional)
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white" />
        </label>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="button"
        disabled={!name.trim()}
        onClick={join}
        className="w-full rounded-lg bg-[#c3a35e] text-[#1a0d00] py-3 text-sm font-bold uppercase tracking-wider disabled:opacity-50"
      >
        {asHost ? 'Start as host' : 'Join meeting'}
      </button>

      <a href={`/${locale}/apps/meet`} className="block text-center text-xs text-white/40 hover:text-white/70">
        ← Back to Harvics Meet
      </a>
    </div>
  )
}
