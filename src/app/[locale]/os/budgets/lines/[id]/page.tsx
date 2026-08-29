'use client'

/**
 * Budget line document — approve / close / variance vs Controlling.
 */

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useParams } from 'next/navigation'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'

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

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0)

export default function BudgetLineDocumentPage() {
  const locale = useLocale()
  const params = useParams()
  const id = String(params?.id || '')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [doc, setDoc] = useState<any>(null)
  const [budgeted, setBudgeted] = useState('')
  const [notes, setNotes] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/finance/budgets/${id}`)
      setDoc(r.data)
      setBudgeted(String(r.data?.budgeted ?? ''))
      setNotes(r.data?.notes || '')
    } catch (e: any) {
      setError(e.message || 'Failed to load budget line')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const save = async () => {
    try {
      setError('')
      setMessage('')
      const body = locked
        ? { notes: notes || null }
        : { budgeted: Number(budgeted), notes: notes || null }
      await api(`/api/finance/budgets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
      setMessage('Budget line updated')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const approve = async () => {
    try {
      setError('')
      const r = await api(`/api/finance/budgets/${id}/approve`, { method: 'POST', body: '{}' })
      setMessage(r.message || 'Approved')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const close = async () => {
    try {
      setError('')
      const r = await api(`/api/finance/budgets/${id}/close`, { method: 'POST', body: '{}' })
      setMessage(r.message || 'Closed')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const locked = doc && ['Approved', 'Closed'].includes(doc.status || 'Draft')
  const closed = doc?.status === 'Closed'

  return (
    <HarvicsOSShell
      title={doc ? `${doc.account} · ${doc.period}` : 'Budget Line'}
      subtitle="Module #7 — budget line"
      activeDomain="budgets"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Planning', href: '/os/budgets' },
        { label: doc?.period || 'Line' },
        { label: doc?.account || 'Line' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <div className="flex flex-wrap gap-3">
          <Link href={`/${locale}/os/budgets`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
            ← Planning workspace
          </Link>
          {doc?.period ? (
            <Link
              href={`/${locale}/os/budgets/${encodeURIComponent(doc.period)}`}
              className="text-[10px] font-bold uppercase tracking-[0.14em] underline decoration-harvics-gold/50"
            >
              Period {doc.period}
            </Link>
          ) : null}
          <Link
            href={`/${locale}/os/controlling`}
            className="text-[10px] font-bold uppercase tracking-[0.14em] underline decoration-harvics-gold/50"
          >
            Controlling
          </Link>
        </div>

        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Status', doc.status || 'Draft'],
                ['Period', doc.period],
                ['Account', doc.account],
                ['Cost center', doc.costCenter || '—'],
                ['Scenario', doc.scenario],
                ['Budgeted', fmt(doc.budgeted)],
                ['Actual', fmt(doc.actual || 0)],
                ['Variance', fmt(doc.variance || 0)],
              ].map(([k, v]) => (
                <div key={k} className="border border-harvics-burgundy/15 bg-white p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>

            {!closed ? (
              <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
                <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">
                    {locked ? 'Notes only (approved/locked)' : 'Edit draft'}
                  </p>
                  {!locked ? (
                    <input
                      className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                      type="number"
                      value={budgeted}
                      onChange={(e) => setBudgeted(e.target.value)}
                      placeholder="Budgeted"
                    />
                  ) : null}
                  <input
                    className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notes"
                  />
                  {!locked ? (
                    <button
                      type="button"
                      onClick={() => void save()}
                      className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void save()}
                      className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
                    >
                      Save notes
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-2 border border-harvics-burgundy/15 bg-white p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Workflows</p>
                  {(doc.status || 'Draft') === 'Draft' ? (
                    <button
                      type="button"
                      onClick={() => void approve()}
                      className="bg-harvics-burgundy px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-harvics-cream"
                    >
                      Approve
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void close()}
                    className="border border-red-300 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-red-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
