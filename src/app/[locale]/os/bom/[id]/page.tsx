'use client'

/** BOM document — Module #19 */

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

export default function BomDocumentPage() {
  const locale = useLocale()
  const params = useParams()
  const id = String(params?.id || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [doc, setDoc] = useState<any>(null)
  const [qty, setQty] = useState('1')
  const [tree, setTree] = useState<any>(null)
  const [sum, setSum] = useState<any>(null)
  const [comp, setComp] = useState({
    componentSku: '',
    componentName: '',
    qtyPer: '1',
    uom: 'EA',
    scrapPercent: '0',
    unitCost: '0',
  })

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/wave4/boms/${id}`)
      setDoc(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load BOM')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const addComp = async () => {
    try {
      setError('')
      if (!comp.componentSku) throw new Error('Component SKU required')
      await api(`/api/wave4/boms/${id}/components`, {
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
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const toggle = async () => {
    try {
      setError('')
      await api(`/api/wave4/boms/${id}/activate`, {
        method: 'POST',
        body: JSON.stringify({ active: !doc.active }),
      })
      setMessage(doc.active ? 'Deactivated' : 'Activated')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const explode = async () => {
    try {
      setError('')
      const r = await api(`/api/wave4/boms/explode/${encodeURIComponent(doc.productSku)}?qty=${qty}`)
      setTree(r.data)
      setSum(r.summary)
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <HarvicsOSShell
      title={doc?.productSku || 'BOM'}
      subtitle="Module #19 — bill of materials"
      activeDomain="manufacturing"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'BOM', href: '/os/bom' },
        { label: doc?.productSku || 'Document' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <Link href={`/${locale}/os/bom`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
          ← BOM workspace
        </Link>
        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}
        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['SKU', doc.productSku],
                ['Name', doc.productName],
                ['Version', doc.version],
                ['UoM', doc.uom],
                ['Active', doc.active ? 'Yes' : 'No'],
                ['Components', String((doc.components || []).length)],
              ].map(([k, v]) => (
                <div key={k} className="border border-harvics-burgundy/15 bg-white p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void toggle()}
                className="border border-harvics-burgundy/30 px-3 py-2 text-[10px] font-bold uppercase"
              >
                {doc.active ? 'Deactivate' : 'Activate'}
              </button>
              <input
                type="number"
                className="border border-harvics-burgundy/20 px-3 py-2 text-sm"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
              <button
                type="button"
                onClick={() => void explode()}
                className="bg-harvics-burgundy px-3 py-2 text-[10px] font-bold uppercase text-harvics-cream"
              >
                Explode
              </button>
              {sum ? (
                <span className="self-center text-sm">
                  Cost <strong className="font-mono">${Number(sum.totalCost).toLocaleString()}</strong>
                </span>
              ) : null}
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
                placeholder="Qty"
                value={comp.qtyPer}
                onChange={(e) => setComp((f) => ({ ...f, qtyPer: e.target.value }))}
              />
              <input
                className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm"
                placeholder="Scrap %"
                type="number"
                value={comp.scrapPercent}
                onChange={(e) => setComp((f) => ({ ...f, scrapPercent: e.target.value }))}
              />
              <input
                className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm"
                placeholder="Unit cost"
                type="number"
                value={comp.unitCost}
                onChange={(e) => setComp((f) => ({ ...f, unitCost: e.target.value }))}
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
                    {['SKU', 'Name', 'Qty', 'Scrap %', 'Unit cost'].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(doc.components || []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-harvics-burgundy/45">
                        No components.
                      </td>
                    </tr>
                  ) : (
                    doc.components.map((c: any, i: number) => (
                      <tr key={c.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                        <td className="px-3 py-2 font-mono">{c.componentSku}</td>
                        <td className="px-3 py-2">{c.componentName || '—'}</td>
                        <td className="px-3 py-2 font-mono">
                          {c.qtyPer} {c.uom}
                        </td>
                        <td className="px-3 py-2">{c.scrapPercent}%</td>
                        <td className="px-3 py-2 font-mono">${c.unitCost}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {tree ? (
              <pre className="overflow-auto border border-harvics-burgundy/15 bg-white p-3 text-[11px]">
                {JSON.stringify(tree, null, 2)}
              </pre>
            ) : null}
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
