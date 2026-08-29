'use client'

/**
 * Journal document display — park/post/reverse (SAP FB03 / FB08 style).
 */

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
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

export default function JournalDocumentPage() {
  const locale = useLocale()
  const params = useParams()
  const router = useRouter()
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
      const r = await api(`/api/finance/journal/${id}`)
      setDoc(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load document')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const post = async () => {
    try {
      setError('')
      const r = await api(`/api/finance/journal/${id}/post`, { method: 'POST' })
      setMessage(r.message || 'Posted')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const reverse = async () => {
    const reason = window.prompt('Reversal reason (optional)') || undefined
    try {
      setError('')
      const r = await api(`/api/finance/journal/${id}/reverse`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      })
      setMessage(r.message || 'Reversed')
      if (r.data?.reversal?.id) {
        router.push(`/${locale}/os/finance/journals/${r.data.reversal.id}`)
        return
      }
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <HarvicsOSShell
      title={doc?.entryNo || 'Journal document'}
      subtitle="Document display · park / post / reverse"
      activeDomain="finance"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Finance', href: '/os/finance' },
        { label: doc?.entryNo || id },
      ]}
    >
      <div className="p-6 space-y-5 max-w-4xl">
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/${locale}/os/finance`}
            className="px-3 py-1.5 text-xs font-semibold border border-[#E8E0D4] rounded-md bg-white"
          >
            ← GL Workspace
          </Link>
          {doc?.status === 'Draft' && (
            <button type="button" onClick={post} className="px-3 py-1.5 text-xs font-semibold bg-harvics-burgundy text-white rounded-md">
              Post document
            </button>
          )}
          {doc?.status === 'Posted' && (
            <button type="button" onClick={reverse} className="px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-800 rounded-md bg-white">
              Reverse (FB08)
            </button>
          )}
          <button type="button" onClick={load} className="px-3 py-1.5 text-xs font-semibold border border-[#E8E0D4] rounded-md bg-white">
            Refresh
          </button>
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {message && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>}

        {loading ? (
          <p className="text-sm text-[#6B5E52]">Loading…</p>
        ) : !doc ? (
          <p className="text-sm text-[#6B5E52]">Document not found.</p>
        ) : (
          <>
            <div className="rounded-xl border border-[#E8E0D4] bg-white p-5 space-y-2">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-harvics-burgundy">Journal entry</p>
                  <h2 className="text-2xl font-semibold font-mono text-[#3D1212]">{doc.entryNo}</h2>
                  <p className="text-sm text-[#6B5E52] mt-1">{doc.description}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 h-fit rounded bg-[#F5F0E8] text-[#3D1212]">{doc.status}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 text-sm">
                <div><p className="text-[10px] uppercase text-[#6B5E52]">Period</p><p className="font-medium">{doc.periodCode || '—'}</p></div>
                <div><p className="text-[10px] uppercase text-[#6B5E52]">Posted</p><p className="font-medium">{doc.postedDate || '—'}</p></div>
                <div><p className="text-[10px] uppercase text-[#6B5E52]">Currency</p><p className="font-medium">{doc.currency}</p></div>
                <div><p className="text-[10px] uppercase text-[#6B5E52]">Amount</p><p className="font-medium tabular-nums">{fmt(doc.amount)}</p></div>
              </div>
            </div>

            <div className="overflow-hidden border border-[#E8E0D4] rounded-xl bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#FFFEF9] text-left text-[10px] uppercase tracking-wider text-[#6B5E52]">
                    <th className="px-4 py-3">Side</th>
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(doc.lines || []).map((line: any, i: number) => (
                    <tr key={i} className="border-t border-[#F0EAE1]">
                      <td className="px-4 py-3 font-semibold">{line.side}</td>
                      <td className="px-4 py-3 font-mono text-xs">
                        <Link
                          href={`/${locale}/os/finance/accounts/${encodeURIComponent(line.accountCode)}`}
                          className="underline text-harvics-burgundy"
                        >
                          {line.accountCode}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{line.accountName}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{fmt(line.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </HarvicsOSShell>
  )
}
