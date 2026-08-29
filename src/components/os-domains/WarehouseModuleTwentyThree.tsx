'use client'

/**
 * Module #23 — Warehouse Management (SAP+ workspace)
 * Tabs: Warehouses · Bins · Putaway
 * Activate / deactivate via status endpoint
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'warehouses' | 'bins' | 'putaway'

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

export default function WarehouseModuleTwentyThree() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('warehouses')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [sel, setSel] = useState<any | null>(null)
  const [form, setForm] = useState({ code: '', name: '', location: '', type: 'DC' })
  const [binForm, setBinForm] = useState({
    code: '',
    aisle: '',
    rack: '',
    level: '',
    zone: 'pick',
    capacity: '100',
  })
  const [suggestForm, setSuggestForm] = useState({
    sku: '',
    qty: '1',
    warehouseId: '',
    strategy: 'least-full',
    preferZone: '',
  })
  const [suggestion, setSuggestion] = useState<any | null>(null)
  const [suggestMeta, setSuggestMeta] = useState('')
  const [execForm, setExecForm] = useState({
    sku: '',
    qty: '1',
    toBinId: '',
    fromBinId: '',
    strategy: 'least-full',
    movedBy: '',
  })

  const load = useCallback(async (keepId?: string) => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/wave4/warehouses')
      const data = r.data || []
      setRows(data)
      if (keepId) setSel(data.find((w: any) => w.id === keepId) || null)
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #23')
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
      const r = await api('/api/wave4/warehouses', {
        method: 'POST',
        body: JSON.stringify({
          code: form.code,
          name: form.name,
          location: form.location || null,
          type: form.type,
        }),
      })
      setForm({ code: '', name: '', location: '', type: 'DC' })
      setMessage(`Warehouse ${r.data?.code} created`)
      await load(r.data?.id)
      setTab('warehouses')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const setActive = async (id: string, active: boolean) => {
    try {
      setError('')
      setMessage('')
      await api(`/api/wave4/warehouses/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ active }),
      })
      setMessage(active ? 'Warehouse activated' : 'Warehouse deactivated')
      await load(id)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const addBin = async () => {
    try {
      setError('')
      setMessage('')
      if (!sel) throw new Error('Select a warehouse')
      if (!binForm.code) throw new Error('Bin code required')
      const whId = sel.id
      await api(`/api/wave4/warehouses/${whId}/bins`, {
        method: 'POST',
        body: JSON.stringify({
          code: binForm.code,
          aisle: binForm.aisle || null,
          rack: binForm.rack || null,
          level: binForm.level || null,
          zone: binForm.zone || null,
          capacity: Number(binForm.capacity) || 0,
          capacityUom: 'EA',
        }),
      })
      setBinForm({ code: '', aisle: '', rack: '', level: '', zone: 'pick', capacity: '100' })
      setMessage('Bin added')
      await load(whId)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const runSuggest = async () => {
    try {
      setError('')
      setMessage('')
      setSuggestion(null)
      setSuggestMeta('')
      if (!suggestForm.sku || !suggestForm.warehouseId) throw new Error('SKU and warehouse required')
      const r = await api('/api/wave4/putaway/suggest', {
        method: 'POST',
        body: JSON.stringify({
          sku: suggestForm.sku,
          qty: Number(suggestForm.qty) || 1,
          warehouseId: suggestForm.warehouseId,
          strategy: suggestForm.strategy,
          preferZone: suggestForm.preferZone || undefined,
        }),
      })
      if (!r.data) {
        setSuggestMeta(r.reason || 'No suitable bin')
        setMessage(r.reason || 'No suitable bin')
        return
      }
      setSuggestion(r.data)
      setExecForm((f) => ({
        ...f,
        sku: suggestForm.sku,
        qty: suggestForm.qty,
        toBinId: r.data.id,
        strategy: suggestForm.strategy,
      }))
      setMessage(`Suggested bin ${r.data.code}`)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const runExecute = async () => {
    try {
      setError('')
      setMessage('')
      if (!execForm.sku || !execForm.toBinId) throw new Error('SKU and destination bin required')
      const r = await api('/api/wave4/putaway/execute', {
        method: 'POST',
        body: JSON.stringify({
          sku: execForm.sku,
          qty: Number(execForm.qty) || 1,
          toBinId: execForm.toBinId,
          fromBinId: execForm.fromBinId || null,
          strategy: execForm.strategy || null,
          movedBy: execForm.movedBy || null,
        }),
      })
      setMessage(`Putaway executed · ${r.data?.id || 'ok'}`)
      setSuggestion(null)
      await load(suggestForm.warehouseId || sel?.id)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const binCount = rows.reduce((s, w) => s + (w.bins?.length || 0), 0)

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #23 · Inventory</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Warehouse Management
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ warehouses, bins, capacity, and putaway suggest/execute.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${locale}/os/inventory`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Inventory
          </Link>
          <button
            type="button"
            onClick={() => void load(sel?.id)}
            className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}

      <OsSapAiPanel
        title="Warehouse coach"
        subtitle="Bin coverage and putaway readiness"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'warehouse' }}
        cta="Advise warehouses"
      />


      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Warehouses', value: rows.length },
          { label: 'Bins', value: binCount },
          { label: 'Active', value: rows.filter((w) => w.active !== false).length },
          { label: 'Inactive', value: rows.filter((w) => w.active === false).length },
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
            ['warehouses', 'Warehouses'],
            ['bins', 'Bins'],
            ['putaway', 'Putaway'],
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

      {!loading && tab === 'warehouses' ? (
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New warehouse</p>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Code *"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Name *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
            <select
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            >
              <option value="DC">DC</option>
              <option value="Store">Store</option>
              <option value="Cold">Cold</option>
              <option value="Bonded">Bonded</option>
            </select>
            <button
              type="button"
              onClick={() => void create()}
              className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Create warehouse
            </button>
          </div>

          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Code', 'Name', 'Type', 'Bins', 'Status', 'Act'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">
                      No warehouses yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((w, i) => (
                    <tr key={w.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono font-semibold">
                        <Link
                          href={`/${locale}/os/warehouses/${w.id}`}
                          className="underline decoration-harvics-gold/50 underline-offset-2"
                        >
                          {w.code}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{w.name}</td>
                      <td className="px-3 py-2">{w.type}</td>
                      <td className="px-3 py-2 font-mono">{w.bins?.length || 0}</td>
                      <td className="px-3 py-2">{w.active === false ? 'Inactive' : 'Active'}</td>
                      <td className="space-x-1 px-3 py-2">
                        <Link
                          href={`/${locale}/os/warehouses/${w.id}`}
                          className="border border-harvics-burgundy/20 px-2 py-0.5 text-[9px] font-bold uppercase"
                        >
                          Open
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setSel(w)
                            setTab('bins')
                          }}
                          className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase"
                        >
                          Bins
                        </button>
                        {w.active === false ? (
                          <button
                            type="button"
                            onClick={() => void setActive(w.id, true)}
                            className="border border-harvics-gold/50 px-2 py-0.5 text-[9px] font-bold uppercase"
                          >
                            Activate
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void setActive(w.id, false)}
                            className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase"
                          >
                            Deactivate
                          </button>
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

      {!loading && tab === 'bins' ? (
        <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
          <div className="space-y-2 border border-harvics-burgundy/15 bg-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Select warehouse</p>
            {rows.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setSel(w)}
                className={`block w-full px-3 py-2 text-left text-sm ${
                  sel?.id === w.id ? 'bg-harvics-burgundy text-harvics-cream' : 'border border-harvics-burgundy/15'
                }`}
              >
                <span className="font-mono font-semibold">{w.code}</span>
                <span className="ml-2 text-[12px] opacity-70">{w.bins?.length || 0} bins</span>
              </button>
            ))}
          </div>
          <div className="space-y-3 border border-harvics-burgundy/15 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">
              {sel ? `Bins · ${sel.code}` : 'Select a warehouse'}
            </p>
            {sel ? (
              <>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  <input
                    className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                    placeholder="Bin code *"
                    value={binForm.code}
                    onChange={(e) => setBinForm((f) => ({ ...f, code: e.target.value }))}
                  />
                  <select
                    className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                    value={binForm.zone}
                    onChange={(e) => setBinForm((f) => ({ ...f, zone: e.target.value }))}
                  >
                    <option value="pick">pick</option>
                    <option value="reserve">reserve</option>
                    <option value="bulk">bulk</option>
                    <option value="cold">cold</option>
                  </select>
                  <input
                    className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                    placeholder="Aisle"
                    value={binForm.aisle}
                    onChange={(e) => setBinForm((f) => ({ ...f, aisle: e.target.value }))}
                  />
                  <input
                    className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                    placeholder="Rack"
                    value={binForm.rack}
                    onChange={(e) => setBinForm((f) => ({ ...f, rack: e.target.value }))}
                  />
                  <input
                    className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                    placeholder="Level"
                    value={binForm.level}
                    onChange={(e) => setBinForm((f) => ({ ...f, level: e.target.value }))}
                  />
                  <input
                    className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                    type="number"
                    placeholder="Capacity"
                    value={binForm.capacity}
                    onChange={(e) => setBinForm((f) => ({ ...f, capacity: e.target.value }))}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void addBin()}
                  className="bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
                >
                  Add bin
                </button>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                        {['Code', 'Zone', 'Aisle/Rack/Lvl', 'Occ/Cap'].map((h) => (
                          <th key={h} className="px-2 py-1 text-[10px] uppercase">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(sel.bins || []).length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-2 py-6 text-center text-harvics-burgundy/45">
                            No bins yet.
                          </td>
                        </tr>
                      ) : (
                        (sel.bins || []).map((b: any, i: number) => (
                          <tr key={b.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                            <td className="px-2 py-1 font-mono">{b.code}</td>
                            <td className="px-2 py-1">{b.zone || '—'}</td>
                            <td className="px-2 py-1 font-mono text-[12px]">
                              {[b.aisle, b.rack, b.level].filter(Boolean).join('/') || '—'}
                            </td>
                            <td className="px-2 py-1 font-mono">
                              {b.occupied}/{b.capacity}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="py-8 text-center text-sm text-harvics-burgundy/45">Pick a warehouse to manage bins.</p>
            )}
          </div>
        </div>
      ) : null}

      {!loading && tab === 'putaway' ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Suggest putaway</p>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="SKU *"
              value={suggestForm.sku}
              onChange={(e) => setSuggestForm((f) => ({ ...f, sku: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              type="number"
              placeholder="Qty *"
              value={suggestForm.qty}
              onChange={(e) => setSuggestForm((f) => ({ ...f, qty: e.target.value }))}
            />
            <select
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={suggestForm.warehouseId}
              onChange={(e) => setSuggestForm((f) => ({ ...f, warehouseId: e.target.value }))}
            >
              <option value="">Warehouse *</option>
              {rows.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.code} — {w.name}
                </option>
              ))}
            </select>
            <select
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={suggestForm.strategy}
              onChange={(e) => setSuggestForm((f) => ({ ...f, strategy: e.target.value }))}
            >
              <option value="least-full">least-full</option>
              <option value="nearest-pick">nearest-pick</option>
              <option value="zone-match">zone-match</option>
            </select>
            <select
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={suggestForm.preferZone}
              onChange={(e) => setSuggestForm((f) => ({ ...f, preferZone: e.target.value }))}
            >
              <option value="">Prefer zone (optional)</option>
              <option value="pick">pick</option>
              <option value="reserve">reserve</option>
              <option value="bulk">bulk</option>
              <option value="cold">cold</option>
            </select>
            <button
              type="button"
              onClick={() => void runSuggest()}
              className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Suggest
            </button>
            {suggestMeta ? <p className="text-sm text-harvics-burgundy/60">{suggestMeta}</p> : null}
            {suggestion ? (
              <div className="border border-harvics-gold/40 bg-white p-3 text-sm">
                <div>
                  Bin <strong className="font-mono">{suggestion.code}</strong> · zone {suggestion.zone || '—'}
                </div>
                <div className="mt-1 font-mono text-[12px]">
                  Occ {suggestion.occupied}/{suggestion.capacity} · id {suggestion.id}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-3 border border-harvics-burgundy/15 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Execute putaway</p>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="SKU *"
              value={execForm.sku}
              onChange={(e) => setExecForm((f) => ({ ...f, sku: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              type="number"
              placeholder="Qty *"
              value={execForm.qty}
              onChange={(e) => setExecForm((f) => ({ ...f, qty: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="To bin ID *"
              value={execForm.toBinId}
              onChange={(e) => setExecForm((f) => ({ ...f, toBinId: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="From bin ID (optional)"
              value={execForm.fromBinId}
              onChange={(e) => setExecForm((f) => ({ ...f, fromBinId: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Moved by"
              value={execForm.movedBy}
              onChange={(e) => setExecForm((f) => ({ ...f, movedBy: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => void runExecute()}
              className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Execute
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
