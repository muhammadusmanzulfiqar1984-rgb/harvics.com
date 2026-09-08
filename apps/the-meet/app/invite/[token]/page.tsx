'use client'

import { use, useState } from 'react'
import Link from 'next/link'

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [meetingId, setMeetingId] = useState('')

  async function rsvp(choice: 'ACCEPTED' | 'TENTATIVE' | 'DECLINED') {
    setStatus('loading')
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rsvp: choice }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'RSVP failed')
      setMeetingId(json.meetingId || '')
      setMessage(`RSVP recorded: ${choice}`)
      setStatus('done')
    } catch (e: any) {
      setMessage(e.message)
      setStatus('error')
    }
  }

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 text-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-meet-gold">Invitation</p>
      <h1 className="mt-2 text-2xl font-semibold">Will you join?</h1>
      <div className="mt-6 flex flex-col gap-2">
        {(
          [
            { v: 'ACCEPTED' as const, label: 'Yes, I’ll be there' },
            { v: 'TENTATIVE' as const, label: 'Maybe' },
            { v: 'DECLINED' as const, label: 'No, can’t make it' },
          ] as const
        ).map((r) => (
          <button
            key={r.v}
            disabled={status === 'loading'}
            onClick={() => rsvp(r.v)}
            className="rounded-lg border border-white/15 bg-meet-panel py-3 text-sm font-medium hover:border-meet-gold/50 disabled:opacity-50"
          >
            {r.label}
          </button>
        ))}
      </div>
      {message && (
        <p className={`mt-4 text-sm ${status === 'error' ? 'text-red-400' : 'text-emerald-300'}`}>{message}</p>
      )}
      {meetingId && (
        <Link href={`/meeting/${meetingId}/prejoin?token=${token}`} className="mt-4 text-sm text-meet-gold hover:underline">
          Continue to pre-join →
        </Link>
      )}
    </main>
  )
}
