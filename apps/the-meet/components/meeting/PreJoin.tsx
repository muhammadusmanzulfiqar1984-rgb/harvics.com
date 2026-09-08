'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DeviceSelector from './DeviceSelector'

export default function PreJoin({
  meetingId,
  inviteToken,
  asHost,
  title,
}: {
  meetingId: string
  inviteToken?: string
  asHost?: boolean
  title?: string
}) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [devices, setDevices] = useState({ cam: false, mic: false })

  useEffect(() => {
    let stream: MediaStream | null = null
    ;(async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        setDevices({ cam: true, mic: true })
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          setDevices({ cam: false, mic: true })
        } catch {
          setDevices({ cam: false, mic: false })
        }
      } finally {
        stream?.getTracks().forEach((t) => t.stop())
      }
    })()
  }, [])

  async function join() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/livekit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId, name, inviteToken, asHost }),
      })
      const json = await res.json()
      if (json.waitingRoom) {
        router.push(`/meeting/${meetingId}/waiting`)
        return
      }
      if (!res.ok) throw new Error(json.error || 'Join failed')
      sessionStorage.setItem(`meet_token_${meetingId}`, json.token)
      sessionStorage.setItem(`meet_url_${meetingId}`, json.url)
      router.push(`/meeting/${meetingId}/room`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-meet-border bg-meet-panel p-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-meet-gold">Pre-join</p>
        <h1 className="mt-1 text-xl font-semibold">{title || 'Meeting'}</h1>
      </div>
      <DeviceSelector cam={devices.cam} mic={devices.mic} />
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Display name"
        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        disabled={!name.trim() || loading}
        onClick={join}
        className="w-full rounded-lg bg-meet-gold py-3 text-sm font-bold uppercase tracking-wider text-[#1a0d00] disabled:opacity-50"
      >
        {loading ? 'Connecting…' : asHost ? 'Start as host' : 'Join'}
      </button>
    </div>
  )
}
