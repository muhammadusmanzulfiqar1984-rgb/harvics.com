'use client'

/**
 * Warehouse document — Module #23 warehouse + bins (SAP-style).
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

export default function WarehouseDocumentPage() {
  const locale = useLocale()
  const params = useParams()
  const id = String(params?.id || '')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [doc, setDoc] = useState<any>(null)
  const [binForm, setBinForm] = useState({
    code: '',
    aisle: '',
    rack: '',
    level: '',
    zone: 'pick',
    capacity: '100',
  })

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/wave4/warehouses/${id}`)
      setDoc(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load warehouse')
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
      await api(`/api/wave4/warehouses/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ active }),
      })
      setMessage(active ? 'Warehouse activated' : 'Warehouse deactivated')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const addBin = async () => {
    try {
      setError('')
      setMessage('')
      if (!binForm.code) throw new Error('Bin code required')
      await api(`/api/wave4/warehouses/${id}/bins`, {
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
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const bins = doc?.bins || []
  const occ = bins.reduce((s: number, b: any) => s + (b.occupied || 0), 0)
  const cap = bins.reduce((s: number, b: any) => s + (b.capacity || 0), 0)

  return (
    <HarvicsOSShell
      title={doc?.code || 'Warehouse'}
      subtitle="Module #23 — SAP+ warehouse document"
      activeDomain="inventory"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Warehouses', href: '/os/warehouses' },
        { label: doc?.code || 'Warehouse' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <div className="flex flex-wrap gap-3">
          <Link href={`/${locale}/os/warehouses`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
            ← Warehouses workspace
          </Link>
          <Link
            href={`/${locale}/os/inventory`}
            className="text-[10px] font-bold uppercase tracking-[0.14em] underline decoration-harvics-gold/50"
          >
            Inventory
          </Link>
        </div>

        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Code', doc.code],
                ['Name', doc.name],
                ['Type', doc.type],
                ['Status', doc.active === false ? 'Inactive' : 'Active'],
                ['Location', doc.location || '—'],
                ['Bins', bins.length],
                ['Occupied', occ],
                ['Capacity', cap],
              ].map(([k, v]) => (
                <div key={k} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
              <p className="w-full text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Workflow</p>
              {doc.active === false ? (
                <button
                  type="button"
                  onClick={() => void setActive(true)}
                  className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
                >
                  Activate
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void setActive(false)}
                  className="border border-harvics-burgundy/30 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
                >
                  Deactivate
                </button>
              )}
            </div>

            <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
              <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Add bin</p>
                <input
                  className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                  placeholder="Bin code *"
                  value={binForm.code}
                  onChange={(e) => setBinForm((f) => ({ ...f, code: e.target.value }))}
                />
                <select
                  className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                  value={binForm.zone}
                  onChange={(e) => setBinForm((f) => ({ ...f, zone: e.target.value }))}
                >
                  <option value="pick">pick</option>
                  <option value="reserve">reserve</option>
                  <option value="bulk">bulk</option>
                  <option value="cold">cold</option>
                </select>
                <input
                  className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                  placeholder="Aisle"
                  value={binForm.aisle}
                  onChange={(e) => setBinForm((f) => ({ ...f, aisle: e.target.value }))}
                />
                <input
                  className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                  placeholder="Rack"
                  value={binForm.rack}
                  onChange={(e) => setBinForm((f) => ({ ...f, rack: e.target.value }))}
                />
                <input
                  className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                  placeholder="Level"
                  value={binForm.level}
                  onChange={(e) => setBinForm((f) => ({ ...f, level: e.target.value }))}
                />
                <input
                  className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                  type="number"
                  placeholder="Capacity"
                  value={binForm.capacity}
                  onChange={(e) => setBinForm((f) => ({ ...f, capacity: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => void addBin()}
                  className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
                >
                  Add bin
                </button>
              </div>

              <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
                <p className="border-b border-harvics-burgundy/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">
                  Bins
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                      {['Code', 'Zone', 'Aisle', 'Rack', 'Level', 'Occ/Cap'].map((h) => (
                        <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bins.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-harvics-burgundy/45">
                          No bins.
                        </td>
                      </tr>
                    ) : (
                      bins.map((b: any, i: number) => (
                        <tr key={b.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                          <td className="px-3 py-2 font-mono font-semibold">{b.code}</td>
                          <td className="px-3 py-2">{b.zone || '—'}</td>
                          <td className="px-3 py-2 font-mono">{b.aisle || '—'}</td>
                          <td className="px-3 py-2 font-mono">{b.rack || '—'}</td>
                          <td className="px-3 py-2 font-mono">{b.level || '—'}</td>
                          <td className="px-3 py-2 font-mono">
                            {b.occupied}/{b.capacity}
                          </td>
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
