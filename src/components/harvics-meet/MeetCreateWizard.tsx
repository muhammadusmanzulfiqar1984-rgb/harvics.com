'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MEET_APP_NAME } from '@/lib/harvicsMeet'

type GuestRow = { email: string; name: string }

export default function MeetCreateWizard({ locale }: { locale: string }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [hostName, setHostName] = useState('')
  const [hostEmail, setHostEmail] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [durationMins, setDurationMins] = useState(60)
  const [description, setDescription] = useState('')
  const [waitingRoom, setWaitingRoom] = useState(true)
  const [sendInvites, setSendInvites] = useState(true)
  const [guestText, setGuestText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<{ joinUrl: string; slug: string; ics?: string | null } | null>(null)

  const guests: GuestRow[] = useMemo(() => {
    return guestText
      .split(/[\n,;]+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const m = line.match(/^(.+?)\s*<([^>]+)>$/)
        if (m) return { name: m[1].trim(), email: m[2].trim() }
        if (line.includes('@')) return { name: '', email: line }
        return { name: line, email: '' }
      })
      .filter((g) => g.email.includes('@'))
  }, [guestText])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setCreated(null)
    try {
      const body: any = {
        title: title.trim(),
        hostName: hostName.trim(),
        hostEmail: hostEmail.trim() || undefined,
        description: description.trim() || undefined,
        durationMins,
        waitingRoom,
        sendInvites,
        guests,
      }
      if (scheduledAt) body.scheduledAt = new Date(scheduledAt).toISOString()

      const res = await fetch('/api/meet/v2/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create meeting')
      setCreated({ joinUrl: json.joinUrl, slug: json.meeting.slug, ics: json.ics })
    } catch (err: any) {
      setError(err.message || 'Create failed')
    } finally {
      setLoading(false)
    }
  }

  if (created) {
    return (
      <div className="w-full max-w-2xl mx-auto rounded-2xl border border-[#3d2a1a] bg-[#141010]/95 p-6 md:p-8 text-white">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#c3a35e] font-bold mb-2">Meeting created</p>
        <h2 className="text-2xl font-semibold mb-4">{title || MEET_APP_NAME}</h2>
        <p className="text-sm text-white/60 mb-2">Share this link</p>
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <input
            readOnly
            value={created.joinUrl}
            className="flex-1 rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm"
          />
          <button
            type="button"
            className="rounded-lg bg-[#c3a35e] text-[#1a0d00] px-4 py-2 text-xs font-bold uppercase tracking-wider"
            onClick={() => navigator.clipboard.writeText(created.joinUrl)}
          >
            Copy
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-lg bg-white text-black px-5 py-2.5 text-sm font-semibold"
            onClick={() => router.push(`/${locale}/apps/meet/${created.slug}?host=1`)}
          >
            Enter room
          </button>
          {created.ics && (
            <a
              className="rounded-lg border border-white/20 px-5 py-2.5 text-sm"
              href={`data:text/calendar;charset=utf-8,${encodeURIComponent(created.ics)}`}
              download={`${created.slug}.ics`}
            >
              Download calendar (.ics)
            </a>
          )}
          <button
            type="button"
            className="rounded-lg border border-white/20 px-5 py-2.5 text-sm text-white/70"
            onClick={() => setCreated(null)}
          >
            Create another
          </button>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-2xl mx-auto rounded-2xl border border-[#3d2a1a] bg-[#141010]/95 p-6 md:p-8 text-white space-y-4"
    >
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#c3a35e] font-bold mb-1">{MEET_APP_NAME}</p>
        <h2 className="text-xl md:text-2xl font-semibold">Create meeting</h2>
        <p className="text-sm text-white/50 mt-1">Title · schedule · guests · calendar · email invitations</p>
      </div>

      <label className="block text-xs text-white/50">
        Title *
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white" placeholder="Weekly leadership sync" />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block text-xs text-white/50">
          Host name *
          <input required value={hostName} onChange={(e) => setHostName(e.target.value)} className="mt-1 w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white" />
        </label>
        <label className="block text-xs text-white/50">
          Host email
          <input type="email" value={hostEmail} onChange={(e) => setHostEmail(e.target.value)} className="mt-1 w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white" />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block text-xs text-white/50">
          Date / time
          <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="mt-1 w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white" />
        </label>
        <label className="block text-xs text-white/50">
          Duration (minutes)
          <input type="number" min={15} max={480} value={durationMins} onChange={(e) => setDurationMins(parseInt(e.target.value || '60', 10))} className="mt-1 w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white" />
        </label>
      </div>

      <label className="block text-xs text-white/50">
        Guests (email per line, optional Name &lt;email&gt;)
        <textarea value={guestText} onChange={(e) => setGuestText(e.target.value)} rows={4} className="mt-1 w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white font-mono" placeholder={'alice@company.com\nBob <bob@company.com>'} />
        <span className="text-white/30">{guests.length} guest{guests.length === 1 ? '' : 's'} parsed</span>
      </label>

      <label className="block text-xs text-white/50">
        Agenda / notes
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1 w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white" />
      </label>

      <div className="flex flex-wrap gap-4 text-sm text-white/70">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={waitingRoom} onChange={(e) => setWaitingRoom(e.target.checked)} />
          Waiting room
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={sendInvites} onChange={(e) => setSendInvites(e.target.checked)} />
          Email invitations (Resend)
        </label>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[#c3a35e] text-[#1a0d00] py-3 text-sm font-bold uppercase tracking-wider disabled:opacity-60"
      >
        {loading ? 'Creating…' : 'Create meeting'}
      </button>
    </form>
  )
}
