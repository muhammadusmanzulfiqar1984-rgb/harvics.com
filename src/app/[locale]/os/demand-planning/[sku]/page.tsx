'use client'

/**
 * Demand SKU document — history + forecasts (Module #24).
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

export default function DemandSkuDocumentPage() {
  const locale = useLocale()
  const params = useParams()
  const sku = decodeURIComponent(String(params?.sku || ''))

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [doc, setDoc] = useState<any>(null)
  const [paramsFc, setParamsFc] = useState({ nextPeriods: '3', window: '3', seasonality: '1' })

  const load = useCallback(async () => {
    if (!sku) return
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/wave4/demand/sku/${encodeURIComponent(sku)}`)
      setDoc(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load demand SKU')
    } finally {
      setLoading(false)
    }
  }, [sku])

  useEffect(() => {
    void load()
  }, [load])

  const runForecast = async () => {
    try {
      setError('')
      setMessage('')
      const r = await api('/api/wave4/demand/forecast', {
        method: 'POST',
        body: JSON.stringify({
          sku,
          nextPeriods: Number(paramsFc.nextPeriods) || 3,
          window: Number(paramsFc.window) || 3,
          seasonality: Number(paramsFc.seasonality) || 1,
        }),
      })
      setMessage(`Forecast · avg ${r.summary?.movingAvg} · conf ${((r.summary?.confidence || 0) * 100).toFixed(0)}%`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <HarvicsOSShell
      title={sku || 'Demand SKU'}
      subtitle="Module #24 — demand planning document"
      activeDomain="inventory"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Demand Planning', href: '/os/demand-planning' },
        { label: sku || 'SKU' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <Link href={`/${locale}/os/demand-planning`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
          ← Demand workspace
        </Link>

        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['SKU', doc.sku],
                ['History periods', String(doc.summary?.historyPeriods || 0)],
                ['Forecast periods', String(doc.summary?.forecastPeriods || 0)],
                ['Last units', String(doc.summary?.lastUnits ?? '—')],
              ].map(([k, v]) => (
                <div key={k} className="border border-harvics-burgundy/15 bg-white p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-end gap-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
              <p className="w-full text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Workflow · regenerate forecast</p>
              <input className="w-16 border border-harvics-burgundy/20 bg-white px-2 py-2 text-sm" type="number" value={paramsFc.window} onChange={(e) => setParamsFc((p) => ({ ...p, window: e.target.value }))} title="Window" />
              <input className="w-16 border border-harvics-burgundy/20 bg-white px-2 py-2 text-sm" type="number" value={paramsFc.nextPeriods} onChange={(e) => setParamsFc((p) => ({ ...p, nextPeriods: e.target.value }))} title="Next" />
              <input className="w-20 border border-harvics-burgundy/20 bg-white px-2 py-2 text-sm" type="number" step="0.1" value={paramsFc.seasonality} onChange={(e) => setParamsFc((p) => ({ ...p, seasonality: e.target.value }))} title="Seasonality" />
              <button type="button" onClick={() => void runForecast()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
                Run forecast
              </button>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
                <p className="border-b border-harvics-burgundy/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">History</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                      {['Period', 'Units', 'Revenue'].map((h) => (
                        <th key={h} className="px-3 py-2 text-[10px] uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(doc.history || []).map((h: any, i: number) => (
                      <tr key={h.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                        <td className="px-3 py-2 font-mono">{h.period}</td>
                        <td className="px-3 py-2 font-mono">{h.units.toLocaleString()}</td>
                        <td className="px-3 py-2 font-mono">${h.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
                <p className="border-b border-harvics-burgundy/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">Forecasts</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                      {['Period', 'Units', 'Conf'].map((h) => (
                        <th key={h} className="px-3 py-2 text-[10px] uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(doc.forecasts || []).length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-3 py-6 text-center text-harvics-burgundy/45">No forecasts yet.</td>
                      </tr>
                    ) : (
                      (doc.forecasts || []).map((f: any, i: number) => (
                        <tr key={f.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                          <td className="px-3 py-2 font-mono">{f.period}</td>
                          <td className="px-3 py-2 font-mono font-semibold">{f.forecastUnits.toLocaleString()}</td>
                          <td className="px-3 py-2">{(f.confidence * 100).toFixed(0)}%</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
