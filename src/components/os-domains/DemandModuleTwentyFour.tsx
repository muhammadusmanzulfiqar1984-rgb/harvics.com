'use client'

/**
 * Module #24 — Demand Planning
 * DoD: history + moving-average forecast via /api/wave4/demand/*
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'history' | 'forecast' | 'skus'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) (h as Record<string, string>).Authorization = `Bearer ${token}`
  return h
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { ...authHeaders(), ...(init?.headers || {}) } })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error || json?.issues?.[0]?.message || `HTTP ${res.status}`)
  return json
}

export default function DemandModuleTwentyFour() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('history')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [sku, setSku] = useState('')
  const [hist, setHist] = useState<any[]>([])
  const [fc, setFc] = useState<any[]>([])
  const [allFc, setAllFc] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [hForm, setHForm] = useState({ sku: '', period: '2026-01', units: '0', revenue: '0' })
  const [params, setParams] = useState({ nextPeriods: '3', window: '3', seasonality: '1' })

  const loadSku = useCallback(async (s: string) => {
    if (!s) {
      setHist([])
      setFc([])
      return
    }
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/wave4/demand/sku/${encodeURIComponent(s)}`)
      setHist(r.data?.history || [])
      setFc(r.data?.forecasts || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadForecasts = useCallback(async () => {
    try {
      const r = await api('/api/wave4/demand/forecasts')
      setAllFc(r.data || [])
    } catch {
      setAllFc([])
    }
  }, [])

  useEffect(() => {
    void loadSku(sku)
  }, [sku, loadSku])

  useEffect(() => {
    void loadForecasts()
  }, [loadForecasts])

  const addH = async () => {
    try {
      setError('')
      setMessage('')
      if (!hForm.sku || !hForm.period) throw new Error('SKU and period required')
      await api('/api/wave4/demand/history', {
        method: 'POST',
        body: JSON.stringify({
          sku: hForm.sku,
          period: hForm.period,
          units: Number(hForm.units) || 0,
          revenue: Number(hForm.revenue) || 0,
        }),
      })
      setMessage(`History logged for ${hForm.sku} · ${hForm.period}`)
      if (!sku) setSku(hForm.sku)
      else if (hForm.sku === sku) await loadSku(sku)
      setHForm((f) => ({ ...f, units: '0', revenue: '0' }))
      await loadForecasts()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const doForecast = async () => {
    try {
      setError('')
      setMessage('')
      if (!sku) throw new Error('Select or enter SKU')
      const r = await api('/api/wave4/demand/forecast', {
        method: 'POST',
        body: JSON.stringify({
          sku,
          nextPeriods: Number(params.nextPeriods) || 3,
          window: Number(params.window) || 3,
          seasonality: Number(params.seasonality) || 1,
        }),
      })
      setFc(r.data || [])
      setSummary(r.summary)
      setMessage(`Forecast generated · avg ${r.summary?.movingAvg}`)
      await loadForecasts()
      setTab('forecast')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const skus = Array.from(new Set([...hist.map((h) => h.sku), ...allFc.map((f) => f.sku), ...(sku ? [sku] : [])])).filter(Boolean)

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #24 · Inventory</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Demand Planning
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            Period history, moving-average forecast with seasonality, and SKU demand documents.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void loadSku(sku)
            void loadForecasts()
          }}
          className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
        >
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}

      <OsSapAiPanel
        title="Demand variance coach"
        subtitle="Forecast vs history gaps classic DP does not narrate"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'demand' }}
        cta="Advise demand"
      />


      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'SKU focus', value: sku || '—' },
          { label: 'History rows', value: hist.length },
          { label: 'Forecasts', value: fc.length },
          { label: 'Confidence', value: summary ? `${(summary.confidence * 100).toFixed(0)}%` : '—' },
        ].map((k) => (
          <div key={k.label} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k.label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
        <label className="flex-1 text-sm">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">Working SKU</span>
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="Enter SKU to load history / forecast"
          />
        </label>
        {sku ? (
          <Link href={`/${locale}/os/demand-planning/${encodeURIComponent(sku)}`} className="border border-harvics-burgundy/30 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
            Open SKU doc →
          </Link>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['history', 'Log history'],
            ['forecast', 'Forecast'],
            ['skus', 'All forecasts'],
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

      {loading ? <p className="py-6 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

      {!loading && tab === 'history' ? (
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Upsert period</p>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="SKU *" value={hForm.sku} onChange={(e) => setHForm((f) => ({ ...f, sku: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Period YYYY-MM *" value={hForm.period} onChange={(e) => setHForm((f) => ({ ...f, period: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="number" placeholder="Units" value={hForm.units} onChange={(e) => setHForm((f) => ({ ...f, units: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="number" placeholder="Revenue" value={hForm.revenue} onChange={(e) => setHForm((f) => ({ ...f, revenue: e.target.value }))} />
            <button type="button" onClick={() => void addH()} className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
              Log history
            </button>
            <p className="text-[11px] text-harvics-burgundy/55">Add ≥3 periods, then run forecast.</p>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Period', 'Units', 'Revenue'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hist.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-8 text-center text-harvics-burgundy/45">{sku ? 'No history for SKU.' : 'Enter working SKU above.'}</td>
                  </tr>
                ) : (
                  hist.map((h, i) => (
                    <tr key={h.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono">{h.period}</td>
                      <td className="px-3 py-2 font-mono font-semibold">{h.units.toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono">${h.revenue.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'forecast' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <label>
              <span className="mb-1 block text-[10px] font-bold uppercase text-harvics-gold">Window</span>
              <input className="w-16 border border-harvics-burgundy/20 bg-white px-2 py-2 text-sm" type="number" value={params.window} onChange={(e) => setParams((p) => ({ ...p, window: e.target.value }))} />
            </label>
            <label>
              <span className="mb-1 block text-[10px] font-bold uppercase text-harvics-gold">Next periods</span>
              <input className="w-16 border border-harvics-burgundy/20 bg-white px-2 py-2 text-sm" type="number" value={params.nextPeriods} onChange={(e) => setParams((p) => ({ ...p, nextPeriods: e.target.value }))} />
            </label>
            <label>
              <span className="mb-1 block text-[10px] font-bold uppercase text-harvics-gold">Seasonality</span>
              <input className="w-20 border border-harvics-burgundy/20 bg-white px-2 py-2 text-sm" type="number" step="0.1" value={params.seasonality} onChange={(e) => setParams((p) => ({ ...p, seasonality: e.target.value }))} />
            </label>
            <button type="button" onClick={() => void doForecast()} className="bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
              Run forecast
            </button>
            {summary ? (
              <span className="text-sm">
                Avg <strong>{summary.movingAvg}</strong> · Conf <strong>{(summary.confidence * 100).toFixed(0)}%</strong>
              </span>
            ) : null}
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Period', 'Forecast', 'Confidence', 'Seasonality'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fc.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-harvics-burgundy/45">Run forecast for working SKU.</td>
                  </tr>
                ) : (
                  fc.map((f, i) => (
                    <tr key={f.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono">{f.period}</td>
                      <td className="px-3 py-2 font-mono font-semibold">{f.forecastUnits.toLocaleString()}</td>
                      <td className="px-3 py-2">{(f.confidence * 100).toFixed(0)}%</td>
                      <td className="px-3 py-2">{f.seasonality}×</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'skus' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['SKU', 'Period', 'Forecast', 'Method', 'Doc'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allFc.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-harvics-burgundy/45">No forecasts stored yet.</td>
                </tr>
              ) : (
                allFc.map((f, i) => (
                  <tr key={f.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 font-mono font-semibold">{f.sku}</td>
                    <td className="px-3 py-2 font-mono">{f.period}</td>
                    <td className="px-3 py-2 font-mono">{f.forecastUnits.toLocaleString()}</td>
                    <td className="px-3 py-2">{f.method}</td>
                    <td className="px-3 py-2">
                      <Link href={`/${locale}/os/demand-planning/${encodeURIComponent(f.sku)}`} className="text-[10px] font-bold uppercase underline decoration-harvics-gold/50">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {skus.length > 0 ? (
            <div className="border-t border-harvics-burgundy/10 px-3 py-2 text-[11px] text-harvics-burgundy/60">
              Known SKUs: {skus.join(', ')}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
