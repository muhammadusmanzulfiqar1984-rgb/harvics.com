'use client'

/**
 * Module #19 — Bill of Materials (SAP+ workspace)
 * Tabs: BOMs · Components · Explode · New BOM
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'boms' | 'components' | 'explode' | 'create'

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

interface Comp {
  id: string
  componentSku: string
  componentName: string | null
  qtyPer: number
  uom: string
  scrapPercent: number
  unitCost: number
}

interface BOM {
  id: string
  productSku: string
  productName: string
  version: string
  uom: string
  active: boolean
  components: Comp[]
}

function ExplodeNode({ n, d }: { n: any; d: number }) {
  return (
    <div>
      <div
        className="flex gap-2 border-b border-harvics-burgundy/10 py-1.5 text-[12px]"
        style={{ paddingLeft: 8 + d * 16 }}
      >
        <span className="min-w-[90px] font-mono font-semibold text-harvics-burgundy">{n.sku}</span>
        <span className="flex-1">{n.name || (n.leaf ? '(raw)' : '')}</span>
        <span className="min-w-[80px] text-right font-mono">
          {n.qty || 1} {n.uom || ''}
        </span>
        {n.lineCost !== undefined ? (
          <span className="min-w-[80px] text-right font-mono font-semibold">${Number(n.lineCost).toLocaleString()}</span>
        ) : null}
      </div>
      {n.children?.map((c: any, i: number) => (
        <ExplodeNode key={i} n={c} d={d + 1} />
      ))}
    </div>
  )
}

export default function ManufacturingModuleNineteen() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('boms')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [boms, setBoms] = useState<BOM[]>([])
  const [sel, setSel] = useState<BOM | null>(null)
  const [form, setForm] = useState({ productSku: '', productName: '', version: 'v1', uom: 'EA' })
  const [comp, setComp] = useState({
    componentSku: '',
    componentName: '',
    qtyPer: '1',
    uom: 'EA',
    scrapPercent: '0',
    unitCost: '0',
  })
  const [qty, setQty] = useState('1')
  const [tree, setTree] = useState<any>(null)
  const [sum, setSum] = useState<any>(null)

  const load = useCallback(async (keepId?: string) => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/wave4/boms')
      const data = (r.data || []) as BOM[]
      setBoms(data)
      if (keepId) setSel(data.find((x) => x.id === keepId) || null)
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #19')
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
      if (!form.productSku || !form.productName) throw new Error('SKU and name required')
      const r = await api('/api/wave4/boms', { method: 'POST', body: JSON.stringify(form) })
      setForm({ productSku: '', productName: '', version: 'v1', uom: 'EA' })
      setMessage(`BOM ${r.data?.productSku} created`)
      await load()
      setTab('boms')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const addComp = async () => {
    try {
      setError('')
      if (!sel) throw new Error('Select a BOM first')
      if (!comp.componentSku || Number(comp.qtyPer) <= 0) throw new Error('Comp SKU and qty required')
      await api(`/api/wave4/boms/${sel.id}/components`, {
        method: 'POST',
        body: JSON.stringify({
          componentSku: comp.componentSku,
          componentName: comp.componentName || null,
          qtyPer: Number(comp.qtyPer),
          uom: comp.uom,
          scrapPercent: Number(comp.scrapPercent) || 0,
          unitCost: Number(comp.unitCost) || 0,
        }),
      })
      setComp({ componentSku: '', componentName: '', qtyPer: '1', uom: 'EA', scrapPercent: '0', unitCost: '0' })
      setMessage('Component added')
      await load(sel.id)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const toggleActive = async (id: string, active: boolean) => {
    try {
      setError('')
      await api(`/api/wave4/boms/${id}/activate`, { method: 'POST', body: JSON.stringify({ active }) })
      setMessage(active ? 'BOM activated' : 'BOM deactivated')
      await load(sel?.id)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const explode = async () => {
    try {
      setError('')
      if (!sel) throw new Error('Select a BOM first')
      const r = await api(`/api/wave4/boms/explode/${encodeURIComponent(sel.productSku)}?qty=${qty}`)
      setTree(r.data)
      setSum(r.summary)
      setTab('explode')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const activeCount = boms.filter((b) => b.active).length

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #19 · Manufacturing</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Bill of Materials
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            Multi-level BOM with scrap-aware explode and cost rollup.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${locale}/os/manufacturing`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Planning
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
        title="BOM advisor"
        subtitle="Component depth and explode risk before release"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'bom' }}
        cta="Advise BOMs"
      />


      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['BOMs', boms.length, '#3D1212'],
          ['Active', activeCount, '#2E7D32'],
          ['Components', boms.reduce((s, b) => s + (b.components?.length || 0), 0), '#B8860B'],
          ['Selected', sel ? sel.components.length : 0, '#1565C0'],
        ].map(([label, n, color]) => (
          <div key={String(label)} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: `3px solid ${color}` }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{n}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['boms', 'BOMs'],
            ['components', 'Components'],
            ['explode', 'Explode'],
            ['create', 'New BOM'],
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

      {!loading && tab === 'create' ? (
        <div className="max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New BOM</p>
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Product SKU *"
            value={form.productSku}
            onChange={(e) => setForm((f) => ({ ...f, productSku: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Product name *"
            value={form.productName}
            onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Version"
            value={form.version}
            onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="UoM"
            value={form.uom}
            onChange={(e) => setForm((f) => ({ ...f, uom: e.target.value }))}
          />
          <button
            type="button"
            onClick={() => void create()}
            className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
          >
            Create BOM
          </button>
        </div>
      ) : null}

      {!loading && tab === 'boms' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['SKU', 'Name', 'Ver', 'Comps', 'Active', 'Act'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {boms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No BOMs yet.
                  </td>
                </tr>
              ) : (
                boms.map((b, i) => (
                  <tr
                    key={b.id}
                    className={`${i % 2 ? 'bg-harvics-cream/40' : 'bg-white'} ${sel?.id === b.id ? 'outline outline-1 outline-harvics-gold' : ''}`}
                  >
                    <td className="px-3 py-2 font-mono font-semibold">
                      <Link href={`/${locale}/os/bom/${b.id}`} className="underline decoration-harvics-gold/50">
                        {b.productSku}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{b.productName}</td>
                    <td className="px-3 py-2">{b.version}</td>
                    <td className="px-3 py-2 font-mono">{b.components.length}</td>
                    <td className="px-3 py-2">{b.active ? 'Yes' : 'No'}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSel(b)
                            setTree(null)
                            setSum(null)
                            setTab('components')
                          }}
                          className="border border-harvics-burgundy/30 px-2 py-0.5 text-[9px] font-bold uppercase"
                        >
                          Select
                        </button>
                        <button
                          type="button"
                          onClick={() => void toggleActive(b.id, !b.active)}
                          className="border border-harvics-gold/50 px-2 py-0.5 text-[9px] font-bold uppercase"
                        >
                          {b.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && tab === 'components' ? (
        <div className="space-y-4">
          {!sel ? (
            <div className="border border-harvics-burgundy/15 bg-white px-3 py-8 text-center text-harvics-burgundy/45">
              Select a BOM from the BOMs tab first.
            </div>
          ) : (
            <>
              <div className="border-l-4 border-harvics-gold bg-harvics-cream/40 px-3 py-2 text-sm">
                Editing <strong className="font-mono">{sel.productSku}</strong> — {sel.productName}
              </div>
              <div className="grid gap-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-3 md:grid-cols-6">
                <input
                  className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm"
                  placeholder="Comp SKU *"
                  value={comp.componentSku}
                  onChange={(e) => setComp((f) => ({ ...f, componentSku: e.target.value }))}
                />
                <input
                  className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm"
                  placeholder="Name"
                  value={comp.componentName}
                  onChange={(e) => setComp((f) => ({ ...f, componentName: e.target.value }))}
                />
                <input
                  className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm"
                  type="number"
                  placeholder="Qty *"
                  value={comp.qtyPer}
                  onChange={(e) => setComp((f) => ({ ...f, qtyPer: e.target.value }))}
                />
                <input
                  className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm"
                  placeholder="UoM"
                  value={comp.uom}
                  onChange={(e) => setComp((f) => ({ ...f, uom: e.target.value }))}
                />
                <input
                  className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm"
                  type="number"
                  placeholder="Scrap %"
                  value={comp.scrapPercent}
                  onChange={(e) => setComp((f) => ({ ...f, scrapPercent: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => void addComp()}
                  className="bg-harvics-burgundy px-3 py-1.5 text-[10px] font-bold uppercase text-harvics-cream"
                >
                  Add
                </button>
              </div>
              <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                      {['SKU', 'Name', 'Qty', 'UoM', 'Scrap %', 'Unit cost'].map((h) => (
                        <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sel.components.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">
                          No components yet.
                        </td>
                      </tr>
                    ) : (
                      sel.components.map((c, i) => (
                        <tr key={c.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                          <td className="px-3 py-2 font-mono">{c.componentSku}</td>
                          <td className="px-3 py-2">{c.componentName || '—'}</td>
                          <td className="px-3 py-2 font-mono">{c.qtyPer}</td>
                          <td className="px-3 py-2">{c.uom}</td>
                          <td className="px-3 py-2">{c.scrapPercent}%</td>
                          <td className="px-3 py-2 font-mono">${c.unitCost}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      ) : null}

      {!loading && tab === 'explode' ? (
        <div className="space-y-4">
          {!sel ? (
            <div className="border border-harvics-burgundy/15 bg-white px-3 py-8 text-center text-harvics-burgundy/45">
              Select a BOM first, then explode.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-end gap-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Target qty</div>
                  <input
                    type="number"
                    className="mt-1 border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void explode()}
                  className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
                >
                  Explode {sel.productSku}
                </button>
                {sum ? (
                  <div className="text-sm">
                    Cost: <strong className="font-mono">${Number(sum.totalCost).toLocaleString()}</strong> · {sum.uniqueComponents}{' '}
                    unique parts
                  </div>
                ) : null}
              </div>
              {tree ? (
                <div className="border border-harvics-burgundy/15 bg-white">
                  <ExplodeNode n={tree} d={0} />
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}
