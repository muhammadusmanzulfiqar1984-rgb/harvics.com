'use client'

/**
 * Module #11 — Marketing Automation
 * DoD: email campaigns, send → CRM leads, social posts.
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'email' | 'social' | 'performance'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) (h as Record<string, string>).Authorization = `Bearer ${token}`
  return h
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { ...authHeaders(), ...(init?.headers || {}) } })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
  return json
}

export default function CommercialModuleElevenMarketing() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('email')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [emailForm, setEmailForm] = useState({ name: '', subject: '', segment: 'Retail' })
  const [postForm, setPostForm] = useState({ platform: 'LinkedIn', content: '' })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [c, p] = await Promise.all([
        api('/api/v2/marketing/email-campaigns'),
        api('/api/v2/marketing/social-posts'),
      ])
      setCampaigns(c.data || [])
      setPosts(p.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #11')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const createEmail = async () => {
    try {
      setError('')
      setMessage('')
      const r = await api('/api/v2/marketing/email-campaigns', {
        method: 'POST',
        body: JSON.stringify(emailForm),
      })
      setEmailForm({ name: '', subject: '', segment: 'Retail' })
      setMessage(`Campaign ${r.data?.name} drafted`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const sendEmail = async (id: string) => {
    try {
      setError('')
      setMessage('')
      const r = await api(`/api/v2/marketing/email-campaigns/${id}/send`, { method: 'POST', body: '{}' })
      setMessage(`Sent to ${r.sentCount || 0} · CRM leads +${r.leadsCreated || 0}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const scheduleEmail = async (id: string) => {
    try {
      setError('')
      setMessage('')
      await api(`/api/v2/marketing/email-campaigns/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: 'Scheduled' }),
      })
      setMessage('Campaign scheduled')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const createPost = async () => {
    try {
      setError('')
      setMessage('')
      await api('/api/v2/marketing/social-posts', {
        method: 'POST',
        body: JSON.stringify(postForm),
      })
      setPostForm({ platform: 'LinkedIn', content: '' })
      setMessage('Social post drafted')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const publishPost = async (id: string) => {
    try {
      setError('')
      await api(`/api/v2/marketing/social-posts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Published' }),
      })
      setMessage('Post published')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #11 · Commercial</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Marketing Automation
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            Email campaigns and social drafts. Send creates Module #8 CRM leads from the customer segment.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${locale}/os/crm`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            CRM
          </Link>
          <button
            type="button"
            onClick={() => void load()}
            className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}

      <OsSapAiPanel
        title="Campaign advisor"
        subtitle="Which drafts to send and which social posts stall — SAP has no marketing brain"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'marketing' }}
        cta="Advise marketing"
      />


      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="border border-harvics-burgundy/15 bg-white p-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Email campaigns</div>
          <div className="mt-1 font-mono text-lg font-semibold">{campaigns.length}</div>
        </div>
        <div className="border border-harvics-burgundy/15 bg-white p-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Sent</div>
          <div className="mt-1 font-mono text-lg font-semibold">
            {campaigns.filter((c) => c.status === 'Sent').length}
          </div>
        </div>
        <div className="border border-harvics-burgundy/15 bg-white p-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Social posts</div>
          <div className="mt-1 font-mono text-lg font-semibold">{posts.length}</div>
        </div>
        <div className="border border-harvics-burgundy/15 bg-white p-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Leads minted</div>
          <div className="mt-1 font-mono text-lg font-semibold">
            {campaigns.reduce((s, c) => s + (c.sentCount || 0), 0)}
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['email', 'Email'],
            ['social', 'Social'],
            ['performance', 'Performance'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] ${
              tab === id ? 'bg-harvics-burgundy text-harvics-cream' : 'border border-harvics-burgundy/25'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

      {!loading && tab === 'email' ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New campaign</p>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Name *"
              value={emailForm.name}
              onChange={(e) => setEmailForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Subject *"
              value={emailForm.subject}
              onChange={(e) => setEmailForm((f) => ({ ...f, subject: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Segment (matches CRM customers)"
              value={emailForm.segment}
              onChange={(e) => setEmailForm((f) => ({ ...f, segment: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => void createEmail()}
              className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Create draft
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Name', 'Subject', 'Segment', 'Status', 'Sent', 'Actions'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">No campaigns yet.</td>
                  </tr>
                ) : (
                  campaigns.map((c, i) => (
                    <tr key={c.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-semibold">
                        <Link
                          href={`/${locale}/os/marketing/campaigns/${c.id}`}
                          className="underline decoration-harvics-gold/50 underline-offset-2"
                        >
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{c.subject}</td>
                      <td className="px-3 py-2">{c.segment || '—'}</td>
                      <td className="px-3 py-2">{c.status}</td>
                      <td className="px-3 py-2 font-mono">{c.sentCount || 0}</td>
                      <td className="space-x-1 px-3 py-2">
                        <Link
                          href={`/${locale}/os/marketing/campaigns/${c.id}`}
                          className="border border-harvics-burgundy/20 px-2 py-1 text-[10px] font-bold uppercase"
                        >
                          Open
                        </Link>
                        {c.status === 'Draft' ? (
                          <button
                            type="button"
                            onClick={() => void scheduleEmail(c.id)}
                            className="border border-harvics-burgundy/30 px-2 py-1 text-[10px] font-bold uppercase"
                          >
                            Schedule
                          </button>
                        ) : null}
                        {c.status === 'Draft' || c.status === 'Scheduled' ? (
                          <button
                            type="button"
                            onClick={() => void sendEmail(c.id)}
                            className="border border-harvics-gold/50 px-2 py-1 text-[10px] font-bold uppercase"
                          >
                            Send
                          </button>
                        ) : (
                          <span className="text-harvics-burgundy/40">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'social' ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New post</p>
            <select
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={postForm.platform}
              onChange={(e) => setPostForm((f) => ({ ...f, platform: e.target.value }))}
            >
              {['LinkedIn', 'Instagram', 'X', 'Facebook'].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <textarea
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              rows={4}
              placeholder="Content *"
              value={postForm.content}
              onChange={(e) => setPostForm((f) => ({ ...f, content: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => void createPost()}
              className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Draft post
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Platform', 'Content', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-harvics-burgundy/45">No posts yet.</td>
                  </tr>
                ) : (
                  posts.map((p, i) => (
                    <tr key={p.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-semibold">{p.platform}</td>
                      <td className="px-3 py-2">{String(p.content || '').slice(0, 80)}</td>
                      <td className="px-3 py-2">{p.status}</td>
                      <td className="px-3 py-2">
                        {p.status !== 'Published' ? (
                          <button
                            type="button"
                            onClick={() => void publishPost(p.id)}
                            className="border border-harvics-burgundy/30 px-2 py-1 text-[10px] font-bold uppercase"
                          >
                            Publish
                          </button>
                        ) : (
                          <span className="text-harvics-burgundy/40">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'performance' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-harvics-burgundy/15 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Campaign funnel</p>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                ['Draft', campaigns.filter((c) => c.status === 'Draft').length],
                ['Scheduled', campaigns.filter((c) => c.status === 'Scheduled').length],
                ['Sent', campaigns.filter((c) => c.status === 'Sent').length],
                ['Cancelled', campaigns.filter((c) => c.status === 'Cancelled').length],
              ].map(([label, n]) => (
                <li key={String(label)} className="flex justify-between border-b border-harvics-burgundy/10 py-2">
                  <span>{label}</span>
                  <span className="font-mono font-semibold">{n}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-harvics-burgundy/15 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Engagement (sent campaigns)</p>
            <ul className="mt-3 space-y-2 text-sm">
              {campaigns.filter((c) => c.status === 'Sent').length === 0 ? (
                <li className="py-6 text-center text-harvics-burgundy/45">No sent campaigns yet.</li>
              ) : (
                campaigns
                  .filter((c) => c.status === 'Sent')
                  .map((c) => (
                    <li key={c.id} className="flex justify-between border-b border-harvics-burgundy/10 py-2">
                      <Link
                        href={`/${locale}/os/marketing/campaigns/${c.id}`}
                        className="underline decoration-harvics-gold/50"
                      >
                        {c.name}
                      </Link>
                      <span className="font-mono text-xs">
                        sent {c.sentCount || 0} · open {c.openCount || 0} · click {c.clickCount || 0}
                      </span>
                    </li>
                  ))
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}
