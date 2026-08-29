'use client'

/**
 * HS code document — Module #27 trade & customs (SAP-style).
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

export default function HsCodeDocumentPage() {
  const locale = useLocale()
  const params = useParams()
  const id = String(params?.id || '')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [doc, setDoc] = useState<any>(null)
  const [cifValue, setCifValue] = useState('')
  const [duty, setDuty] = useState<any | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/wave3/trade/hs-codes/${id}`)
      setDoc(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load HS code')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const runDuty = async () => {
    try {
      setError('')
      setMessage('')
      if (!doc?.code || !cifValue) throw new Error('CIF value required')
      const r = await api(
        `/api/wave3/trade/duty-calc?code=${encodeURIComponent(doc.code)}&cifValue=${encodeURIComponent(cifValue)}`,
      )
      setDuty(r.data)
      setMessage(`Duty ${fmt(r.data?.duty)} · landed ${fmt(r.data?.landedCost)}`)
    } catch (e: any) {
      setError(e.message)
      setDuty(null)
    }
  }

  return (
    <HarvicsOSShell
      title={doc?.code ? `HS ${doc.code}` : 'HS code'}
      subtitle="Module #27 — SAP+ HS code document"
      activeDomain="import-export"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Import / Export', href: '/os/import-export' },
        { label: doc?.code || 'HS' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <div className="flex flex-wrap gap-3">
          <Link href={`/${locale}/os/import-export`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
            ← Trade workspace
          </Link>
          <Link
            href={`/${locale}/os/shipping-trade`}
            className="text-[10px] font-bold uppercase tracking-[0.14em] underline decoration-harvics-gold/50"
          >
            Shipping
          </Link>
        </div>

        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['HS code', doc.code],
                ['Duty %', `${doc.dutyPercent}%`],
                ['Category', doc.category || '—'],
                ['Created', doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '—'],
              ].map(([k, v]) => (
                <div key={k} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>

            <div className="border border-harvics-burgundy/15 bg-white p-4 text-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">Description</p>
              <p className="mt-2">{doc.description}</p>
              {doc.notes ? (
                <>
                  <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">Notes</p>
                  <p className="mt-2 text-harvics-burgundy/70">{doc.notes}</p>
                </>
              ) : null}
            </div>

            <div className="max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Duty calculator</p>
              <input
                className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                type="number"
                placeholder="CIF value"
                value={cifValue}
                onChange={(e) => setCifValue(e.target.value)}
              />
              <button
                type="button"
                onClick={() => void runDuty()}
                className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
              >
                Calculate
              </button>
              {duty ? (
                <div className="border border-harvics-gold/40 bg-white p-3 text-sm">
                  <div>
                    Duty: <strong className="font-mono">{fmt(duty.duty)}</strong> ({duty.dutyPercent}%)
                  </div>
                  <div className="mt-1">
                    Landed: <strong className="font-mono">{fmt(duty.landedCost)}</strong>
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
