'use client'

/**
 * Module #31 — Learning Management (SAP+ workspace)
 * Tabs: Courses · Enrollments
 * Enrollment: Enrolled → Completed|Failed (score ≥ 50)
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'courses' | 'enrollments'

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

export default function LMSModuleThirtyOne() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('courses')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [form, setForm] = useState({
    code: `COURSE-${Date.now().toString().slice(-5)}`,
    title: '',
    category: '',
    durationHrs: '1',
    level: 'Beginner',
  })
  const [enroll, setEnroll] = useState<Record<string, string>>({})
  const [score, setScore] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/wave5/courses')
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #31')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const create = async () => {
    try {
      setError('')
      setMessage('')
      if (!form.title) throw new Error('Title required')
      const r = await api('/api/wave5/courses', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          durationHrs: Number(form.durationHrs) || 1,
        }),
      })
      setForm({ ...form, code: `COURSE-${Date.now().toString().slice(-5)}`, title: '' })
      setMessage(`Course ${r.data?.code} created`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const doEnroll = async (cid: string) => {
    try {
      setError('')
      const eid = enroll[cid]
      if (!eid) throw new Error('Employee ID required')
      await api(`/api/wave5/courses/${cid}/enroll`, { method: 'POST', body: JSON.stringify({ employeeId: eid }) })
      setEnroll((x) => ({ ...x, [cid]: '' }))
      setMessage('Enrolled')
      await load()
      setTab('enrollments')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const complete = async (eid: string) => {
    try {
      setError('')
      const s = Number(score[eid] ?? 0)
      await api(`/api/wave5/enrollments/${eid}/complete`, { method: 'POST', body: JSON.stringify({ score: s }) })
      setMessage(`Enrollment scored ${s}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const toggleActive = async (id: string, active: boolean) => {
    try {
      setError('')
      await api(`/api/wave5/courses/${id}`, { method: 'PATCH', body: JSON.stringify({ active: !active }) })
      setMessage(active ? 'Course deactivated' : 'Course activated')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const enrollments = rows.flatMap((c) => (c.enrollments || []).map((e: any) => ({ ...e, course: c })))

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #31 · Human Capital</p>
          <h3 className="mt-1 text-2xl text-harvics-burgundy" >
            Learning Management
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ courses, enrollments, and pass/fail at 50% · audited.
          </p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}


      <OsSapAiPanel
        title="Learning gap AI"
        subtitle="Surfaces incomplete courses and compliance training risk"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'lms', prompt: 'Identify learning coverage gaps and recommend mandatory course completions.' }}
        cta="Advise LMS"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Courses', value: rows.length },
          { label: 'Active', value: rows.filter((c) => c.active).length },
          { label: 'Enrollments', value: enrollments.length },
          { label: 'Completed', value: enrollments.filter((e) => e.status === 'Completed').length },
        ].map((k) => (
          <div key={k.label} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k.label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['courses', 'Courses'],
            ['enrollments', 'Enrollments'],
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

      {!loading && tab === 'courses' ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New course</p>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Code *" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Title *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="number" placeholder="Duration hrs" value={form.durationHrs} onChange={(e) => setForm((f) => ({ ...f, durationHrs: e.target.value }))} />
            <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}>
              {['Beginner', 'Intermediate', 'Advanced'].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
            <button type="button" onClick={() => void create()} className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
              Create course
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Code', 'Title', 'Level', 'Hrs', 'Enrolled', 'Active', 'Act'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-harvics-burgundy/45">
                      No courses yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((c, i) => (
                    <tr key={c.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono font-semibold">
                        <Link href={`/${locale}/os/lms/courses/${c.id}`} className="underline decoration-harvics-gold/50">
                          {c.code}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{c.title}</td>
                      <td className="px-3 py-2">{c.level || '—'}</td>
                      <td className="px-3 py-2 font-mono">{c.durationHrs}</td>
                      <td className="px-3 py-2 font-mono">{c.enrollments?.length || 0}</td>
                      <td className="px-3 py-2">{c.active ? 'Yes' : 'No'}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap items-center gap-1">
                          <input
                            className="w-24 border border-harvics-burgundy/20 px-1 py-0.5 text-[11px]"
                            placeholder="Emp ID"
                            value={enroll[c.id] || ''}
                            onChange={(e) => setEnroll((x) => ({ ...x, [c.id]: e.target.value }))}
                          />
                          <button type="button" onClick={() => void doEnroll(c.id)} className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase">
                            Enroll
                          </button>
                          <button type="button" onClick={() => void toggleActive(c.id, !!c.active)} className="border border-harvics-gold/50 px-2 py-0.5 text-[9px] font-bold uppercase">
                            {c.active ? 'Off' : 'On'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'enrollments' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Course', 'Employee', 'Status', 'Score', 'Act'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No enrollments.
                  </td>
                </tr>
              ) : (
                enrollments.map((e, i) => (
                  <tr key={e.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 font-mono">
                      <Link href={`/${locale}/os/lms/courses/${e.course?.id}`} className="underline decoration-harvics-gold/50">
                        {e.course?.code}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{e.employeeId}</td>
                    <td className="px-3 py-2">{e.status}</td>
                    <td className="px-3 py-2 font-mono">{e.score ?? '—'}</td>
                    <td className="px-3 py-2">
                      {e.status === 'Enrolled' || e.status === 'InProgress' ? (
                        <div className="flex gap-1">
                          <input
                            className="w-16 border border-harvics-burgundy/20 px-1 py-0.5 text-[11px]"
                            type="number"
                            placeholder="Score"
                            value={score[e.id] ?? ''}
                            onChange={(ev) => setScore((x) => ({ ...x, [e.id]: ev.target.value }))}
                          />
                          <button type="button" onClick={() => void complete(e.id)} className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase">
                            Complete
                          </button>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
