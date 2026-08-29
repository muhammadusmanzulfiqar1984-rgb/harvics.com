'use client'

/**
 * OsSapAiPanel — AI layer that makes HARVICS OS feel smarter than classic SAP.
 * Calls domain AI endpoints; shows headline, narrative, actions, optional priority rows.
 */

import React, { useState } from 'react'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) (h as Record<string, string>).Authorization = `Bearer ${token}`
  return h
}

export type OsSapAiResult = {
  headline?: string
  narrative?: string
  actions?: string[]
  risks?: string[]
  confidence?: number
  aiGenerated?: boolean
  priority?: Array<{ invoiceNo: string; why: string; script: string }>
  payNow?: string[]
  defer?: string[]
  [key: string]: unknown
}

type Props = {
  title?: string
  subtitle?: string
  /** POST path e.g. /api/finance/ai/ar-collections */
  endpoint: string
  /** Body builder — called when user clicks Run */
  buildBody?: () => Record<string, unknown>
  /** Pre-built body (static) */
  body?: Record<string, unknown>
  cta?: string
  className?: string
  onResult?: (r: OsSapAiResult) => void
}

export default function OsSapAiPanel({
  title = 'AI Advisor',
  subtitle = 'Beyond classic SAP — live intelligence on your documents',
  endpoint,
  buildBody,
  body,
  cta = 'Run AI',
  className = '',
  onResult,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<OsSapAiResult | null>(null)

  const run = async () => {
    setLoading(true)
    setError('')
    try {
      const payload = buildBody ? buildBody() : body || {}
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
      const data = (json.data || json) as OsSapAiResult
      setResult(data)
      onResult?.(data)
    } catch (e: any) {
      setError(e.message || 'AI failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`border border-harvics-gold/40 bg-gradient-to-br from-harvics-cream to-white p-4 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">AI · SAP+</p>
          <h4 className="mt-1 text-base font-semibold text-harvics-burgundy" >
            {title}
          </h4>
          <p className="mt-0.5 max-w-[48ch] text-[12px] text-harvics-burgundy/60">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => void run()}
          disabled={loading}
          className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream disabled:opacity-50"
        >
          {loading ? 'Thinking…' : cta}
        </button>
      </div>

      {error ? <p className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800">{error}</p> : null}

      {result ? (
        <div className="mt-4 space-y-3 border-t border-harvics-burgundy/10 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-harvics-burgundy">{result.headline}</p>
            <span className="text-[10px] uppercase tracking-[0.12em] text-harvics-burgundy/45">
              {result.aiGenerated ? 'LLM' : 'Heuristic'}
              {result.confidence != null ? ` · ${Math.round(Number(result.confidence) * 100)}%` : ''}
            </span>
          </div>
          {result.narrative ? <p className="text-[13px] leading-relaxed text-harvics-burgundy/80">{result.narrative}</p> : null}

          {result.actions?.length ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">Next actions</p>
              <ul className="mt-1 list-inside list-disc text-[12px] text-harvics-burgundy/75">
                {result.actions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.risks?.length ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-800/70">Risks</p>
              <ul className="mt-1 list-inside list-disc text-[12px] text-harvics-burgundy/70">
                {result.risks.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.priority?.length ? (
            <div className="overflow-x-auto border border-harvics-burgundy/10">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-harvics-burgundy/90 text-left text-harvics-cream">
                    {['Invoice', 'Why', 'Script'].map((h) => (
                      <th key={h} className="px-2 py-1.5 text-[10px] uppercase tracking-[0.1em]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.priority.map((p) => (
                    <tr key={p.invoiceNo} className="border-t border-harvics-burgundy/10">
                      <td className="px-2 py-1.5 font-mono font-semibold">{p.invoiceNo}</td>
                      <td className="px-2 py-1.5">{p.why}</td>
                      <td className="px-2 py-1.5 text-harvics-burgundy/70">{p.script}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {(result.payNow?.length || result.defer?.length) ? (
            <div className="grid gap-2 sm:grid-cols-2 text-[12px]">
              {result.payNow?.length ? (
                <div className="border border-emerald-200 bg-emerald-50/50 p-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-900">Pay now</p>
                  <p className="mt-1 font-mono">{result.payNow.join(', ')}</p>
                </div>
              ) : null}
              {result.defer?.length ? (
                <div className="border border-amber-200 bg-amber-50/40 p-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-900">Defer</p>
                  <p className="mt-1 font-mono">{result.defer.join(', ')}</p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
