'use client'

/** Work order document — Module #17 */

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

const WO_NEXT: Record<string, string[]> = {
  Planned: ['Released', 'Cancelled'],
  Released: ['InProgress', 'Cancelled'],
  InProgress: ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
}

export default function WorkOrderDocumentPage() {
  const locale = useLocale()
  const params = useParams()
  const id = String(params?.id || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [doc, setDoc] = useState<any>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/v2/manufacturing/work-orders/${id}`)
      setDoc(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load work order')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const setStatus = async (status: string) => {
    try {
      setError('')
      await api(`/api/v2/manufacturing/work-orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setMessage(`Status → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <HarvicsOSShell
      title={doc?.workOrderNo || 'Work order'}
      subtitle="Module #17 — production work order"
      activeDomain="manufacturing"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Manufacturing', href: '/os/manufacturing' },
        { label: doc?.workOrderNo || 'Document' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <div className="flex flex-wrap gap-3">
          <Link href={`/${locale}/os/manufacturing`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline">
            ← Planning workspace
          </Link>
          <Link href={`/${locale}/os/shop-floor`} className="text-[10px] font-bold uppercase tracking-[0.14em] underline decoration-harvics-gold/50">
            Shop floor
          </Link>
        </div>
        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}
        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Status', doc.status],
                ['SKU', doc.productSku],
                ['Qty', doc.qty],
                ['Priority', doc.priority],
                ['Start', doc.startDate || '—'],
                ['Completion', doc.completionDate || '—'],
                ['BOM lines', String((doc.bomItems || []).length)],
              ].map(([k, v]) => (
                <div key={k} className="border border-harvics-burgundy/15 bg-white p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>
            {doc.notes ? <p className="border border-harvics-burgundy/10 bg-harvics-cream/40 px-4 py-3 text-sm">{doc.notes}</p> : null}
            <div className="flex flex-col gap-2 border border-harvics-burgundy/15 bg-white p-4 sm:max-w-xs">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Workflows</p>
              {(WO_NEXT[doc.status] || []).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void setStatus(s)}
                  className="border border-harvics-burgundy/30 px-3 py-2 text-[10px] font-bold uppercase"
                >
                  → {s}
                </button>
              ))}
              {!WO_NEXT[doc.status]?.length ? (
                <p className="text-[12px] text-harvics-burgundy/50">Terminal status</p>
              ) : null}
            </div>
            {(doc.bomItems || []).length > 0 ? (
              <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
                <p className="border-b border-harvics-burgundy/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">
                  BOM items
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                      {['Component', 'Qty', 'Unit cost'].map((h) => (
                        <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {doc.bomItems.map((b: any, i: number) => (
                      <tr key={b.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                        <td className="px-3 py-2 font-mono">{b.componentSku}</td>
                        <td className="px-3 py-2 font-mono">{b.qty}</td>
                        <td className="px-3 py-2 font-mono">${b.unitCost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
