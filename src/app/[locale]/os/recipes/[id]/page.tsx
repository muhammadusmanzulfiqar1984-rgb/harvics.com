'use client'

/**
 * Recipe document — activate / deactivate + scale (Module #21).
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

export default function RecipeDocumentPage() {
  const locale = useLocale()
  const params = useParams()
  const id = String(params?.id || '')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [doc, setDoc] = useState<any>(null)
  const [target, setTarget] = useState('10')
  const [scaled, setScaled] = useState<any>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/wave4/recipes/${id}`)
      setDoc(r.data)
      if (r.data?.baseYield) setTarget(String(r.data.baseYield * 10))
    } catch (e: any) {
      setError(e.message || 'Failed to load recipe')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const setActive = async (active: boolean) => {
    try {
      setError('')
      setMessage('')
      await api(`/api/wave4/recipes/${id}/status`, { method: 'POST', body: JSON.stringify({ active }) })
      setMessage(active ? 'Activated' : 'Deactivated')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const doScale = async () => {
    try {
      setError('')
      const r = await api(`/api/wave4/recipes/${id}/scale?yield=${encodeURIComponent(target)}`)
      setScaled(r.data)
      setMessage(`Scaled ${r.data?.factor}×`)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const totalCost = (doc?.ingredients || []).reduce((s: number, i: any) => s + i.qty * i.unitCost, 0)

  return (
    <HarvicsOSShell
      title={doc?.code || 'Recipe'}
      subtitle="Module #21 — recipe document"
      activeDomain="manufacturing"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Recipes', href: '/os/recipes' },
        { label: doc?.code || 'Recipe' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <Link href={`/${locale}/os/recipes`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
          ← Recipe workspace
        </Link>

        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Status', doc.active !== false ? 'Active' : 'Inactive'],
                ['Name', doc.name],
                ['Yield', `${doc.baseYield} ${doc.baseUom}`],
                ['Base cost', fmt(totalCost)],
                ['Category', doc.category || '—'],
                ['Ingredients', String(doc.ingredients?.length || 0)],
              ].map(([k, v]) => (
                <div key={k} className="border border-harvics-burgundy/15 bg-white p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
              <p className="w-full text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Workflow</p>
              {doc.active !== false ? (
                <button type="button" onClick={() => void setActive(false)} className="border border-harvics-burgundy/30 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
                  Deactivate
                </button>
              ) : (
                <button type="button" onClick={() => void setActive(true)} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
                  Activate
                </button>
              )}
            </div>

            <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
              <p className="border-b border-harvics-burgundy/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">Ingredients</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                    {['Ingredient', 'Qty', 'UoM', 'Unit', 'Line'].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(doc.ingredients || []).map((i: any, idx: number) => (
                    <tr key={i.id} className={idx % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2">{i.ingredient}</td>
                      <td className="px-3 py-2 font-mono">{i.qty}</td>
                      <td className="px-3 py-2">{i.uom}</td>
                      <td className="px-3 py-2 font-mono">{fmt(i.unitCost)}</td>
                      <td className="px-3 py-2 font-mono font-semibold">{fmt(i.qty * i.unitCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 border border-harvics-burgundy/15 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">Scale</p>
              <div className="flex flex-wrap gap-3">
                <input className="border border-harvics-burgundy/20 px-3 py-2 text-sm" type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
                <button type="button" onClick={() => void doScale()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase text-harvics-cream">
                  Scale
                </button>
                {scaled ? (
                  <span className="text-sm">
                    {scaled.factor}× · {fmt(scaled.totalCost)} · {fmt(scaled.costPerUnit)}/unit
                  </span>
                ) : null}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
