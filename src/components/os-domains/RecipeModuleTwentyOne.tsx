'use client'

/**
 * Module #21 — Recipe Management
 * DoD: recipes + ingredients + scale + activate/deactivate via /api/wave4/recipes/*
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'recipes' | 'builder' | 'scale'

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

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0)

export default function RecipeModuleTwentyOne() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('recipes')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [sel, setSel] = useState<any | null>(null)
  const [form, setForm] = useState({ code: '', name: '', category: '', baseYield: '1', baseUom: 'L' })
  const [ing, setIng] = useState({ ingredient: '', qty: '1', uom: 'kg', unitCost: '0' })
  const [target, setTarget] = useState('10')
  const [scaled, setScaled] = useState<any>(null)

  const load = useCallback(async (keepId?: string) => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/wave4/recipes')
      const data = r.data || []
      setRows(data)
      if (keepId) setSel(data.find((x: any) => x.id === keepId) || null)
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #21')
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
      const r = await api('/api/wave4/recipes', {
        method: 'POST',
        body: JSON.stringify({
          code: form.code,
          name: form.name,
          category: form.category || null,
          baseYield: Number(form.baseYield) || 1,
          baseUom: form.baseUom || 'L',
        }),
      })
      setForm({ code: '', name: '', category: '', baseYield: '1', baseUom: 'L' })
      setMessage(`Recipe ${r.data?.code} created`)
      await load(r.data?.id)
      setTab('builder')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const addIng = async () => {
    try {
      setError('')
      if (!sel) throw new Error('Select a recipe')
      if (!ing.ingredient || !(Number(ing.qty) > 0)) throw new Error('Ingredient and qty required')
      await api(`/api/wave4/recipes/${sel.id}/ingredients`, {
        method: 'POST',
        body: JSON.stringify({
          ingredient: ing.ingredient,
          qty: Number(ing.qty),
          uom: ing.uom,
          unitCost: Number(ing.unitCost) || 0,
        }),
      })
      setIng({ ingredient: '', qty: '1', uom: 'kg', unitCost: '0' })
      setMessage('Ingredient added')
      await load(sel.id)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const setActive = async (id: string, active: boolean) => {
    try {
      setError('')
      await api(`/api/wave4/recipes/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ active }),
      })
      setMessage(active ? 'Recipe activated' : 'Recipe deactivated')
      await load(sel?.id === id ? id : undefined)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const doScale = async () => {
    try {
      setError('')
      if (!sel) throw new Error('Select a recipe')
      const r = await api(`/api/wave4/recipes/${sel.id}/scale?yield=${encodeURIComponent(target)}`)
      setScaled(r.data)
      setMessage(`Scaled ${r.data?.factor}× · ${fmt(r.data?.totalCost)}`)
      setTab('scale')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const activeCount = rows.filter((r) => r.active !== false).length
  const ingCount = rows.reduce((s, r) => s + (r.ingredients?.length || 0), 0)

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #21 · Manufacturing</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Recipe Management
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            F&B recipes with ingredient costing, yield scaling, and activate/deactivate workflow.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
        >
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}

      <OsSapAiPanel
        title="Recipe advisor"
        subtitle="Formulation completeness and scale-up readiness"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'recipe' }}
        cta="Advise recipes"
      />


      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Recipes', value: rows.length },
          { label: 'Active', value: activeCount },
          { label: 'Ingredients', value: ingCount },
          { label: 'Selected', value: sel?.code || '—' },
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
            ['recipes', 'Recipes'],
            ['builder', 'Ingredients'],
            ['scale', 'Scale & cost'],
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

      {!loading && tab === 'recipes' ? (
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New recipe</p>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Code *" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <input className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="number" placeholder="Base yield" value={form.baseYield} onChange={(e) => setForm((f) => ({ ...f, baseYield: e.target.value }))} />
              <input className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="UoM" value={form.baseUom} onChange={(e) => setForm((f) => ({ ...f, baseUom: e.target.value }))} />
            </div>
            <button type="button" onClick={() => void create()} className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
              Create recipe
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Code', 'Name', 'Yield', 'Ings', 'Status', ''].map((h) => (
                    <th key={h || 'a'} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">No recipes yet.</td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr
                      key={r.id}
                      className={`cursor-pointer ${sel?.id === r.id ? 'bg-harvics-cream' : i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}`}
                      onClick={() => {
                        setSel(r)
                        setScaled(null)
                      }}
                    >
                      <td className="px-3 py-2 font-mono font-semibold">
                        <Link href={`/${locale}/os/recipes/${r.id}`} className="underline decoration-harvics-gold/50" onClick={(e) => e.stopPropagation()}>
                          {r.code}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{r.name}</td>
                      <td className="px-3 py-2 font-mono">
                        {r.baseYield} {r.baseUom}
                      </td>
                      <td className="px-3 py-2 font-mono">{r.ingredients?.length || 0}</td>
                      <td className="px-3 py-2">{r.active !== false ? 'Active' : 'Inactive'}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            void setActive(r.id, r.active === false)
                          }}
                          className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase"
                        >
                          {r.active === false ? 'Activate' : 'Deactivate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'builder' ? (
        <div className="space-y-4">
          {!sel ? (
            <p className="py-10 text-center text-sm text-harvics-burgundy/50">Select a recipe from the Recipes tab.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3 border border-harvics-burgundy/15 bg-harvics-cream/40 px-4 py-3">
                <span className="font-mono font-semibold">{sel.code}</span>
                <span>{sel.name}</span>
                <Link href={`/${locale}/os/recipes/${sel.id}`} className="ml-auto text-[10px] font-bold uppercase tracking-[0.14em] underline decoration-harvics-gold/50">
                  Open document →
                </Link>
              </div>
              <div className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                <input className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Ingredient *" value={ing.ingredient} onChange={(e) => setIng((f) => ({ ...f, ingredient: e.target.value }))} />
                <input className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="number" placeholder="Qty" value={ing.qty} onChange={(e) => setIng((f) => ({ ...f, qty: e.target.value }))} />
                <input className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="UoM" value={ing.uom} onChange={(e) => setIng((f) => ({ ...f, uom: e.target.value }))} />
                <input className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="number" placeholder="Unit cost" value={ing.unitCost} onChange={(e) => setIng((f) => ({ ...f, unitCost: e.target.value }))} />
                <button type="button" onClick={() => void addIng()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase text-harvics-cream">
                  Add
                </button>
              </div>
              <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                      {['Ingredient', 'Qty', 'UoM', 'Unit cost', 'Line'].map((h) => (
                        <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(sel.ingredients || []).map((i: any, idx: number) => (
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
            </>
          )}
        </div>
      ) : null}

      {!loading && tab === 'scale' ? (
        <div className="space-y-4">
          {!sel ? (
            <p className="py-10 text-center text-sm text-harvics-burgundy/50">Select a recipe first.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-end gap-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
                <label className="text-sm">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">Scale to ({sel.baseUom})</span>
                  <input className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
                </label>
                <button type="button" onClick={() => void doScale()} className="bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
                  Scale
                </button>
                {scaled ? (
                  <div className="ml-auto text-sm">
                    Factor <strong>{scaled.factor}×</strong> · Total <strong>{fmt(scaled.totalCost)}</strong> · Per unit{' '}
                    <strong>{fmt(scaled.costPerUnit)}</strong>
                  </div>
                ) : null}
              </div>
              {scaled ? (
                <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                        {['Ingredient', 'Scaled qty', 'UoM', 'Line cost'].map((h) => (
                          <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(scaled.ingredients || []).map((s: any, i: number) => (
                        <tr key={i} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                          <td className="px-3 py-2">{s.ingredient}</td>
                          <td className="px-3 py-2 font-mono font-semibold">{s.qty}</td>
                          <td className="px-3 py-2">{s.uom}</td>
                          <td className="px-3 py-2 font-mono">{fmt(s.lineCost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}
