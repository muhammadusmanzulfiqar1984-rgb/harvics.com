'use client'

/**
 * G/L Account 360 — ledger movements, status, drill to documents.
 * Mirrors CRM Customer 360 pattern for Module #1.
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

export default function GlAccountDetailPage() {
  const locale = useLocale()
  const params = useParams()
  const code = decodeURIComponent(String(params?.code || ''))

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [data, setData] = useState<any>(null)

  const load = useCallback(async () => {
    if (!code) return
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/finance/gl-accounts/${encodeURIComponent(code)}/ledger`)
      setData(r.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load account')
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    void load()
  }, [load])

  const toggle = async () => {
    if (!data?.account?.id) return
    try {
      setError('')
      await api(`/api/finance/gl-accounts/${data.account.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: data.account.status === 'Active' ? 'Inactive' : 'Active',
        }),
      })
      setMessage('Account status updated')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const acct = data?.account

  return (
    <HarvicsOSShell
      title={acct ? `${acct.accountCode} · ${acct.name}` : `G/L ${code}`}
      subtitle="Account 360 — ledger · status · document drill-down"
      activeDomain="finance"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Finance', href: '/os/finance' },
        { label: code },
      ]}
    >
      <div className="p-6 space-y-5">
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/${locale}/os/finance`}
            className="px-3 py-1.5 text-xs font-semibold border border-[#E8E0D4] rounded-md bg-white"
          >
            ← GL Workspace
          </Link>
          {acct && (
            <button
              type="button"
              onClick={toggle}
              className="px-3 py-1.5 text-xs font-semibold border border-[#E8E0D4] rounded-md bg-white"
            >
              {acct.status === 'Active' ? 'Deactivate' : 'Activate'}
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
        ) : !acct ? (
          <p className="text-sm text-[#6B5E52]">Account not found.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Type', value: acct.type },
                { label: 'Normal balance', value: acct.normalBalance },
                { label: 'Status', value: acct.status },
                { label: 'Closing', value: fmt(data.closingBalance) },
              ].map((k) => (
                <div key={k.label} className="rounded-xl border border-[#E8E0D4] bg-white px-4 py-3">
                  <p className="text-[10px] uppercase tracking-wider text-[#6B5E52] font-bold">{k.label}</p>
                  <p className="text-sm font-semibold text-[#3D1212] mt-1">{k.value}</p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto border border-[#E8E0D4] rounded-xl bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E8E0D4] text-left text-[10px] uppercase tracking-wider text-[#6B5E52]">
                    <th className="px-4 py-3">Document</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Text</th>
                    <th className="px-4 py-3">Contra</th>
                    <th className="px-4 py-3 text-right">Debit</th>
                    <th className="px-4 py-3 text-right">Credit</th>
                    <th className="px-4 py-3 text-right">Balance</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.lines || []).length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-[#6B5E52]">
                        No postings on this account.
                      </td>
                    </tr>
                  ) : (
                    data.lines.map((l: any) => (
                      <tr key={l.id} className="border-b border-[#F0EAE1]">
                        <td className="px-4 py-2.5 font-mono text-xs">
                          <Link
                            href={`/${locale}/os/finance/journals/${l.id}`}
                            className="underline text-harvics-burgundy"
                          >
                            {l.entryNo}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5 text-xs">{l.postedDate || '—'}</td>
                        <td className="px-4 py-2.5">{l.description}</td>
                        <td className="px-4 py-2.5 font-mono text-xs">
                          {l.contra ? (
                            <Link href={`/${locale}/os/finance/accounts/${encodeURIComponent(l.contra)}`} className="underline">
                              {l.contra}
                            </Link>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums">{l.debit ? fmt(l.debit) : '—'}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums">{l.credit ? fmt(l.credit) : '—'}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums font-medium">{fmt(l.balance)}</td>
                        <td className="px-4 py-2.5 text-xs">{l.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </HarvicsOSShell>
  )
}
