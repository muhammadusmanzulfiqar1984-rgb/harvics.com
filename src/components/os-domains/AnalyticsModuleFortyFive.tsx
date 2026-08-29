'use client'

/**
 * Module #45 — Project Management (SAP+ workspace)
 * Tabs: Projects · Tasks · New
 * Status: Active → OnHold|Completed|Cancelled
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'projects' | 'tasks' | 'new'

const PROJECT_NEXT: Record<string, string[]> = {
  Active: ['OnHold', 'Completed', 'Cancelled'],
  OnHold: ['Active', 'Cancelled'],
  Completed: [],
  Cancelled: [],
}

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

const fmt = (n: number, ccy = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: ccy, maximumFractionDigits: 0 }).format(n || 0)

export default function AnalyticsModuleFortyFive() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('projects')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [form, setForm] = useState({
    code: `PRJ-${Date.now().toString().slice(-6)}`,
    name: '',
    description: '',
    status: 'Active',
    priority: 'Normal',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    budget: '',
    currency: 'USD',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/v2/projects')
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #45')
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
      if (!form.code || !form.name) throw new Error('Code and name required')
      const r = await api('/api/v2/projects', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          budget: Number(form.budget) || 0,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          description: form.description || null,
        }),
      })
      setForm({
        ...form,
        code: `PRJ-${Date.now().toString().slice(-6)}`,
        name: '',
        description: '',
        budget: '',
      })
      setMessage(`Project ${r.data?.code} created`)
      await load()
      setTab('projects')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const setStatus = async (id: string, status: string) => {
    try {
      setError('')
      setMessage('')
      await api(`/api/v2/projects/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) })
      setMessage(`Status → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const addTask = async (projectId: string) => {
    try {
      setError('')
      if (!taskTitle.trim()) throw new Error('Task title required')
      await api(`/api/v2/projects/${projectId}/tasks`, {
        method: 'POST',
        body: JSON.stringify({ title: taskTitle, status: 'Todo', priority: 'Normal' }),
      })
      setTaskTitle('')
      setMessage('Task added')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const open = rows.filter((r) => r.status === 'Active' || r.status === 'OnHold').length
  const selected = rows.find((r) => r.id === openId)

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #45 · Projects</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Project Management
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ projects · tasks · Active → OnHold | Completed | Cancelled.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
        >
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}


      <OsSapAiPanel
        title="Project risk AI"
        subtitle="Surfaces delayed projects and resource bottlenecks"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'projects', prompt: 'Advise on project portfolio risk and next recovery actions.' }}
        cta="Advise projects"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Projects', value: rows.length },
          { label: 'Open', value: open },
          { label: 'Budget', value: fmt(rows.reduce((s, r) => s + (r.budget || 0), 0)) },
          { label: 'Tasks', value: rows.reduce((s, r) => s + (r.tasks?.length || 0), 0) },
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
            ['projects', 'Projects'],
            ['tasks', 'Tasks'],
            ['new', 'New'],
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

      {!loading && tab === 'projects' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Code', 'Name', 'Budget', 'Status', 'Act'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-harvics-burgundy/10">
                  <td className="px-3 py-2 font-mono text-xs">
                    <Link href={`/${locale}/os/project-management/${r.id}`} className="font-semibold underline">
                      {r.code}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    {r.name}
                    <div className="text-[11px] text-harvics-burgundy/50">{r.tasks?.length || 0} tasks</div>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{fmt(r.budget, r.currency)}</td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenId(r.id)
                          setTab('tasks')
                        }}
                        className="border border-harvics-burgundy/25 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em]"
                      >
                        Tasks
                      </button>
                      {(PROJECT_NEXT[r.status] || []).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => void setStatus(r.id, s)}
                          className="bg-harvics-burgundy px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-harvics-cream"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? <p className="p-4 text-sm text-harvics-burgundy/50">No projects yet.</p> : null}
        </div>
      ) : null}

      {!loading && tab === 'tasks' ? (
        <div className="space-y-3">
          <select
            className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            value={openId || ''}
            onChange={(e) => setOpenId(e.target.value || null)}
          >
            <option value="">Select project…</option>
            {rows.map((r) => (
              <option key={r.id} value={r.id}>
                {r.code} — {r.name}
              </option>
            ))}
          </select>
          {selected ? (
            <>
              <div className="flex flex-wrap gap-2">
                <input
                  className="min-w-[200px] flex-1 border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                  placeholder="New task title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => void addTask(selected.id)}
                  className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
                >
                  Add task
                </button>
              </div>
              <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                      {['Title', 'Status', 'Priority'].map((h) => (
                        <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(selected.tasks || []).map((t: any) => (
                      <tr key={t.id} className="border-t border-harvics-burgundy/10">
                        <td className="px-3 py-2">{t.title}</td>
                        <td className="px-3 py-2">{t.status}</td>
                        <td className="px-3 py-2">{t.priority}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(selected.tasks || []).length === 0 ? <p className="p-4 text-sm text-harvics-burgundy/50">No tasks.</p> : null}
              </div>
            </>
          ) : (
            <p className="text-sm text-harvics-burgundy/50">Select a project to manage tasks.</p>
          )}
        </div>
      ) : null}

      {!loading && tab === 'new' ? (
        <div className="max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New project</p>
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Code *" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <textarea className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Budget" type="number" value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} />
          <button type="button" onClick={() => void create()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
            Create
          </button>
        </div>
      ) : null}
    </div>
  )
}
