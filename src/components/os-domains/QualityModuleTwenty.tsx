'use client'

/**
 * Module #20 — Quality Management (SAP+ workspace)
 * Tabs: Checks · NCRs · Open NCR form
 * Status: Pending → Passed|Failed · Open → Investigating → Closed
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'checks' | 'ncrs' | 'create-ncr'

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

export default function QualityModuleTwenty() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('checks')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [checks, setChecks] = useState<any[]>([])
  const [ncrs, setNcrs] = useState<any[]>([])
  const [checkForm, setCheckForm] = useState({
    checkNo: '',
    productSku: '',
    inspector: '',
    defectsFound: '0',
    notes: '',
  })
  const [ncrForm, setNcrForm] = useState({
    ncrNo: '',
    severity: 'Minor',
    description: '',
    assignedTo: '',
    qualityCheckId: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [c, n] = await Promise.all([api('/api/v2/quality/checks'), api('/api/v2/quality/ncrs')])
      setChecks(c.data || [])
      setNcrs(n.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #20')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const createCheck = async () => {
    try {
      setError('')
      setMessage('')
      if (!checkForm.checkNo || !checkForm.productSku) throw new Error('Check # and SKU required')
      const r = await api('/api/v2/quality/checks', {
        method: 'POST',
        body: JSON.stringify({
          checkNo: checkForm.checkNo,
          productSku: checkForm.productSku,
          inspector: checkForm.inspector || null,
          defectsFound: Number(checkForm.defectsFound) || 0,
          notes: checkForm.notes || null,
          status: 'Pending',
        }),
      })
      setCheckForm({ checkNo: '', productSku: '', inspector: '', defectsFound: '0', notes: '' })
      setMessage(`Check ${r.data?.checkNo} created`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const passFail = async (id: string, status: 'Passed' | 'Failed') => {
    try {
      setError('')
      await api(`/api/v2/quality/checks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setMessage(`Check → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const createNcr = async () => {
    try {
      setError('')
      setMessage('')
      if (!ncrForm.ncrNo || !ncrForm.description) throw new Error('NCR # and description required')
      const r = await api('/api/v2/quality/ncrs', {
        method: 'POST',
        body: JSON.stringify({
          ncrNo: ncrForm.ncrNo,
          severity: ncrForm.severity,
          description: ncrForm.description,
          assignedTo: ncrForm.assignedTo || null,
          qualityCheckId: ncrForm.qualityCheckId || null,
          status: 'Open',
        }),
      })
      setNcrForm({ ncrNo: '', severity: 'Minor', description: '', assignedTo: '', qualityCheckId: '' })
      setMessage(`NCR ${r.data?.ncrNo} opened`)
      await load()
      setTab('ncrs')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const setNcrStatus = async (id: string, status: string) => {
    try {
      setError('')
      await api(`/api/v2/quality/ncrs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setMessage(`NCR → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #20 · Manufacturing</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Quality Management
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            Inspection checks and non-conformance reports · audited status machine.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${locale}/os/shop-floor`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Shop floor
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
        title="Quality coach"
        subtitle="Fail rates and open NCRs — smarter than static QM lists"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'quality' }}
        cta="Advise quality"
      />


      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Checks', value: checks.length },
          { label: 'Pending', value: checks.filter((c) => c.status === 'Pending').length },
          { label: 'Open NCRs', value: ncrs.filter((n) => n.status === 'Open').length },
          { label: 'Defects found', value: checks.reduce((s, c) => s + (c.defectsFound || 0), 0) },
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
            ['checks', 'Quality checks'],
            ['ncrs', 'NCRs'],
            ['create-ncr', 'Open NCR'],
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

      {!loading && tab === 'checks' ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New check</p>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Check # *"
              value={checkForm.checkNo}
              onChange={(e) => setCheckForm((f) => ({ ...f, checkNo: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Product SKU *"
              value={checkForm.productSku}
              onChange={(e) => setCheckForm((f) => ({ ...f, productSku: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Inspector"
              value={checkForm.inspector}
              onChange={(e) => setCheckForm((f) => ({ ...f, inspector: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              type="number"
              placeholder="Defects"
              value={checkForm.defectsFound}
              onChange={(e) => setCheckForm((f) => ({ ...f, defectsFound: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Notes"
              value={checkForm.notes}
              onChange={(e) => setCheckForm((f) => ({ ...f, notes: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => void createCheck()}
              className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Create check
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Check #', 'SKU', 'Inspector', 'Defects', 'Status', 'Act'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {checks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">
                      No quality checks yet.
                    </td>
                  </tr>
                ) : (
                  checks.map((c, i) => (
                    <tr key={c.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono font-semibold">
                        <Link href={`/${locale}/os/quality/checks/${c.id}`} className="underline decoration-harvics-gold/50">
                          {c.checkNo}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{c.productSku}</td>
                      <td className="px-3 py-2">{c.inspector || '—'}</td>
                      <td className="px-3 py-2 font-mono">{c.defectsFound}</td>
                      <td className="px-3 py-2">{c.status}</td>
                      <td className="px-3 py-2">
                        {c.status === 'Pending' ? (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => void passFail(c.id, 'Passed')}
                              className="border border-green-700 px-2 py-0.5 text-[9px] font-bold uppercase text-green-800"
                            >
                              Pass
                            </button>
                            <button
                              type="button"
                              onClick={() => void passFail(c.id, 'Failed')}
                              className="border border-red-300 px-2 py-0.5 text-[9px] font-bold uppercase text-red-800"
                            >
                              Fail
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
        </div>
      ) : null}

      {!loading && tab === 'create-ncr' ? (
        <div className="max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Open NCR</p>
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="NCR # *"
            value={ncrForm.ncrNo}
            onChange={(e) => setNcrForm((f) => ({ ...f, ncrNo: e.target.value }))}
          />
          <select
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            value={ncrForm.severity}
            onChange={(e) => setNcrForm((f) => ({ ...f, severity: e.target.value }))}
          >
            <option>Minor</option>
            <option>Major</option>
            <option>Critical</option>
          </select>
          <textarea
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            rows={3}
            placeholder="Description *"
            value={ncrForm.description}
            onChange={(e) => setNcrForm((f) => ({ ...f, description: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Assigned to"
            value={ncrForm.assignedTo}
            onChange={(e) => setNcrForm((f) => ({ ...f, assignedTo: e.target.value }))}
          />
          <select
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            value={ncrForm.qualityCheckId}
            onChange={(e) => setNcrForm((f) => ({ ...f, qualityCheckId: e.target.value }))}
          >
            <option value="">Link check (optional)</option>
            {checks.map((c) => (
              <option key={c.id} value={c.id}>
                {c.checkNo} — {c.productSku}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void createNcr()}
            className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
          >
            Open NCR
          </button>
        </div>
      ) : null}

      {!loading && tab === 'ncrs' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['NCR #', 'Severity', 'Description', 'Assigned', 'Status', 'Act'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ncrs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No NCRs yet.
                  </td>
                </tr>
              ) : (
                ncrs.map((n, i) => (
                  <tr key={n.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 font-mono font-semibold">
                      <Link href={`/${locale}/os/quality/ncrs/${n.id}`} className="underline decoration-harvics-gold/50">
                        {n.ncrNo}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{n.severity}</td>
                    <td className="max-w-[28ch] truncate px-3 py-2">{n.description}</td>
                    <td className="px-3 py-2">{n.assignedTo || '—'}</td>
                    <td className="px-3 py-2">{n.status}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {n.status === 'Open' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void setNcrStatus(n.id, 'Investigating')}
                              className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase"
                            >
                              Investigate
                            </button>
                            <button
                              type="button"
                              onClick={() => void setNcrStatus(n.id, 'Closed')}
                              className="border border-harvics-gold/50 px-2 py-0.5 text-[9px] font-bold uppercase"
                            >
                              Close
                            </button>
                          </>
                        ) : null}
                        {n.status === 'Investigating' ? (
                          <button
                            type="button"
                            onClick={() => void setNcrStatus(n.id, 'Closed')}
                            className="border border-harvics-gold/50 px-2 py-0.5 text-[9px] font-bold uppercase"
                          >
                            Close
                          </button>
                        ) : null}
                        {n.status === 'Closed' ? <span className="text-harvics-burgundy/30">—</span> : null}
                      </div>
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
