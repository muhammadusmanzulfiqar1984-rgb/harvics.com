'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MeetingForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [hostName, setHostName] = useState('')
  const [hostEmail, setHostEmail] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [durationMins, setDurationMins] = useState(60)
  const [description, setDescription] = useState('')
  const [guestText, setGuestText] = useState('')
  const [waitingRoom, setWaitingRoom] = useState(true)
  const [sendInvites, setSendInvites] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const guests = useMemo(
    () =>
      guestText
        .split(/[\n,;]+/)
        .map((l) => l.trim())
        .filter(Boolean)
        .map((line) => {
          const m = line.match(/^(.+?)\s*<([^>]+)>$/)
          if (m) return { name: m[1].trim(), email: m[2].trim() }
          return line.includes('@') ? { name: '', email: line } : null
        })
        .filter(Boolean) as { name: string; email: string }[],
    [guestText],
  )

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const body: any = {
        title,
        hostName,
        hostEmail: hostEmail || undefined,
        description: description || undefined,
        durationMins,
        waitingRoom,
        sendInvites,
        guests,
      }
      if (scheduledAt) body.scheduledAt = new Date(scheduledAt).toISOString()
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed')
      router.push(`/meeting/${json.meeting.id}/prejoin?host=1`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-meet-border bg-meet-panel p-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-meet-gold">Schedule</p>
        <h2 className="mt-1 text-xl font-semibold">Create meeting</h2>
      </div>
      <input required placeholder="Title *" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm" />
      <div className="grid gap-3 md:grid-cols-2">
        <input required placeholder="Host name *" value={hostName} onChange={(e) => setHostName(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm" />
        <input type="email" placeholder="Host email" value={hostEmail} onChange={(e) => setHostEmail(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm" />
        <input type="number" min={15} max={480} value={durationMins} onChange={(e) => setDurationMins(+e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm" />
      </div>
      <textarea placeholder="Guests (email per line)" rows={4} value={guestText} onChange={(e) => setGuestText(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm" />
      <p className="text-xs text-white/40">{guests.length} guests</p>
      <textarea placeholder="Agenda" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm" />
      <div className="flex flex-wrap gap-4 text-sm text-white/70">
        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={waitingRoom} onChange={(e) => setWaitingRoom(e.target.checked)} /> Waiting room</label>
        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={sendInvites} onChange={(e) => setSendInvites(e.target.checked)} /> Email invites</label>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button disabled={loading} className="w-full rounded-lg bg-meet-gold py-3 text-sm font-bold uppercase tracking-wider text-[#1a0d00] disabled:opacity-60">
        {loading ? 'Creating…' : 'Create meeting'}
      </button>
    </form>
  )
}
