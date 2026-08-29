'use client'

/** Shop floor operation document — Module #18 */

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

export default function ShopFloorOpDocumentPage() {
  const locale = useLocale()
  const params = useParams()
  const id = String(params?.id || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [doc, setDoc] = useState<any>(null)
  const [qtyDone, setQtyDone] = useState('')
  const [qtyScrap, setQtyScrap] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/wave5/shop-floor-ops/${id}`)
      setDoc(r.data)
      setQtyDone(String(r.data?.qtyDone ?? 0))
      setQtyScrap(String(r.data?.qtyScrap ?? 0))
    } catch (e: any) {
      setError(e.message || 'Failed to load operation')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const report = async (status?: string) => {
    try {
      setError('')
      await api(`/api/wave5/shop-floor-ops/${id}/report`, {
        method: 'POST',
        body: JSON.stringify({
          qtyDone: Number(qtyDone) || 0,
          qtyScrap: Number(qtyScrap) || 0,
          status,
        }),
      })
      setMessage(status ? `Status → ${status}` : 'Qty reported')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <HarvicsOSShell
      title={doc ? `Op ${doc.operationNo}` : 'Shop floor op'}
      subtitle="Module #18 — shop floor operation"
      activeDomain="manufacturing"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Shop Floor', href: '/os/shop-floor' },
        { label: doc ? `Op ${doc.operationNo}` : 'Document' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <Link href={`/${locale}/os/shop-floor`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
          ← Shop floor workspace
        </Link>
        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}
        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Status', doc.status],
                ['Work center', doc.workCenter],
                ['WO', doc.workOrderId || '—'],
                ['Operator', doc.operator || '—'],
                ['Planned', doc.qtyPlanned],
                ['Done', doc.qtyDone],
                ['Scrap', doc.qtyScrap],
                ['Setup / Run', `${doc.setupMins}m / ${doc.runMins}m`],
              ].map(([k, v]) => (
                <div key={k} className="border border-harvics-burgundy/15 bg-white p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>
            {doc.description ? (
              <p className="border border-harvics-burgundy/10 bg-harvics-cream/40 px-4 py-3 text-sm">{doc.description}</p>
            ) : null}
            {doc.status !== 'Completed' && doc.status !== 'Scrapped' ? (
              <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
                <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Report qty</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                      type="number"
                      value={qtyDone}
                      onChange={(e) => setQtyDone(e.target.value)}
                      placeholder="Qty done"
                    />
                    <input
                      className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                      type="number"
                      value={qtyScrap}
                      onChange={(e) => setQtyScrap(e.target.value)}
                      placeholder="Qty scrap"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => void report()}
                    className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
                  >
                    Save qty
                  </button>
                </div>
                <div className="flex flex-col gap-2 border border-harvics-burgundy/15 bg-white p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Workflows</p>
                  {doc.status === 'Queued' ? (
                    <button
                      type="button"
                      onClick={() => void report('InProgress')}
                      className="border border-harvics-gold/50 px-3 py-2 text-[10px] font-bold uppercase"
                    >
                      Start
                    </button>
                  ) : null}
                  {doc.status === 'InProgress' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void report('Paused')}
                        className="border border-harvics-burgundy/30 px-3 py-2 text-[10px] font-bold uppercase"
                      >
                        Pause
                      </button>
                      <button
                        type="button"
                        onClick={() => void report('Completed')}
                        className="border border-harvics-gold/50 px-3 py-2 text-[10px] font-bold uppercase"
                      >
                        Complete
                      </button>
                      <button
                        type="button"
                        onClick={() => void report('Scrapped')}
                        className="border border-red-300 px-3 py-2 text-[10px] font-bold uppercase text-red-800"
                      >
                        Scrap
                      </button>
                    </>
                  ) : null}
                  {doc.status === 'Paused' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void report('InProgress')}
                        className="border border-harvics-gold/50 px-3 py-2 text-[10px] font-bold uppercase"
                      >
                        Resume
                      </button>
                      <button
                        type="button"
                        onClick={() => void report('Completed')}
                        className="border border-harvics-burgundy/30 px-3 py-2 text-[10px] font-bold uppercase"
                      >
                        Complete
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
