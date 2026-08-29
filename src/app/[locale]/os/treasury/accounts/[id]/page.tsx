'use client'

/**
 * Treasury bank account document — cash moves · freeze · transfer.
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

const fmt = (n: number, ccy = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: ccy, maximumFractionDigits: 2 }).format(n || 0)

export default function TreasuryAccountDocumentPage() {
  const locale = useLocale()
  const params = useParams()
  const id = String(params?.id || '')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [doc, setDoc] = useState<any>(null)
  const [accounts, setAccounts] = useState<any[]>([])
  const [txForm, setTxForm] = useState({ type: 'Credit' as 'Credit' | 'Debit', amount: '', reference: '', description: '' })
  const [xferTo, setXferTo] = useState('')
  const [xferAmount, setXferAmount] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const [r, list] = await Promise.all([
        api(`/api/v2/treasury/accounts/${id}`),
        api('/api/v2/treasury/accounts'),
      ])
      setDoc(r.data)
      setAccounts((list.data || []).filter((a: any) => a.id !== id))
    } catch (e: any) {
      setError(e.message || 'Failed to load account')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const postTx = async () => {
    try {
      setError('')
      setMessage('')
      await api(`/api/v2/treasury/accounts/${id}/transactions`, {
        method: 'POST',
        body: JSON.stringify({
          type: txForm.type,
          amount: Number(txForm.amount),
          currency: doc?.currency || 'USD',
          reference: txForm.reference || undefined,
          description: txForm.description || undefined,
        }),
      })
      setTxForm({ type: 'Credit', amount: '', reference: '', description: '' })
      setMessage('Cash movement posted')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const transfer = async () => {
    try {
      setError('')
      setMessage('')
      await api('/api/v2/treasury/transfer', {
        method: 'POST',
        body: JSON.stringify({
          fromAccountId: id,
          toAccountId: xferTo,
          amount: Number(xferAmount),
        }),
      })
      setXferAmount('')
      setMessage('Transfer posted')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const toggleFreeze = async () => {
    try {
      setError('')
      const path = doc?.status === 'Frozen' ? 'unfreeze' : 'freeze'
      const r = await api(`/api/v2/treasury/accounts/${id}/${path}`, {
        method: 'POST',
        body: JSON.stringify({}),
      })
      setMessage(r.message || path)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const frozen = doc?.status === 'Frozen'

  return (
    <HarvicsOSShell
      title={doc?.accountNo || 'Bank Account'}
      subtitle="Module #5 — treasury account"
      activeDomain="treasury"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Treasury', href: '/os/treasury-banking' },
        { label: doc?.accountNo || 'Account' },
      ]}
    >
      <div className="space-y-5 p-5 text-harvics-burgundy">
        <Link
          href={`/${locale}/os/treasury-banking`}
          className="text-[10px] font-bold uppercase tracking-[0.14em] underline"
        >
          ← Treasury workspace
        </Link>

        {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
        {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
        {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading…</p> : null}

        {!loading && doc ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Status', doc.status],
                ['Bank', doc.bankName],
                ['Type', doc.accountType],
                ['Balance', fmt(doc.balance, doc.currency || 'USD')],
                ['Currency', doc.currency || 'USD'],
                ['Country', doc.country || '—'],
                ['Account #', doc.accountNo],
                ['Opened', doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '—'],
              ].map(([k, v]) => (
                <div key={k} className="border border-harvics-burgundy/15 bg-white p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k}</div>
                  <div className="mt-1 text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
              <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Post cash movement</p>
                {frozen ? (
                  <p className="text-sm text-red-800">Account frozen — unfreeze to post movements.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                      value={txForm.type}
                      onChange={(e) => setTxForm((f) => ({ ...f, type: e.target.value as 'Credit' | 'Debit' }))}
                    >
                      <option value="Credit">Credit (in)</option>
                      <option value="Debit">Debit (out)</option>
                    </select>
                    <input
                      className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                      type="number"
                      placeholder="Amount"
                      value={txForm.amount}
                      onChange={(e) => setTxForm((f) => ({ ...f, amount: e.target.value }))}
                    />
                    <input
                      className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                      placeholder="Reference"
                      value={txForm.reference}
                      onChange={(e) => setTxForm((f) => ({ ...f, reference: e.target.value }))}
                    />
                    <input
                      className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                      placeholder="Description"
                      value={txForm.description}
                      onChange={(e) => setTxForm((f) => ({ ...f, description: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={() => void postTx()}
                      className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream sm:col-span-2"
                    >
                      Post movement
                    </button>
                  </div>
                )}
                {!frozen ? (
                  <div className="mt-4 grid gap-3 border-t border-harvics-burgundy/10 pt-4 sm:grid-cols-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold sm:col-span-3">
                      Transfer out
                    </p>
                    <select
                      className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm sm:col-span-2"
                      value={xferTo}
                      onChange={(e) => setXferTo(e.target.value)}
                    >
                      <option value="">Destination account</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id} disabled={a.status === 'Frozen'}>
                          {a.accountNo} — {a.bankName}
                        </option>
                      ))}
                    </select>
                    <input
                      className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                      type="number"
                      placeholder="Amount"
                      value={xferAmount}
                      onChange={(e) => setXferAmount(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => void transfer()}
                      className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] sm:col-span-3"
                    >
                      Transfer
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="flex flex-col gap-2 border border-harvics-burgundy/15 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Workflows</p>
                <button
                  type="button"
                  onClick={() => void toggleFreeze()}
                  className={`px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] ${
                    frozen
                      ? 'bg-harvics-burgundy text-harvics-cream'
                      : 'border border-red-300 text-red-800'
                  }`}
                >
                  {frozen ? 'Unfreeze account' : 'Freeze account'}
                </button>
                <Link
                  href={`/${locale}/os/payment-runs`}
                  className="border border-harvics-burgundy/30 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-[0.12em]"
                >
                  HPay payment runs
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
              <p className="border-b border-harvics-burgundy/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">
                Cash movements
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                    {['Type', 'Amount', 'Reference', 'Description', 'When'].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!doc.transactions?.length ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-harvics-burgundy/45">
                        No movements yet.
                      </td>
                    </tr>
                  ) : (
                    doc.transactions.map((t: any, i: number) => (
                      <tr key={t.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                        <td className="px-3 py-2">{t.type}</td>
                        <td className="px-3 py-2 font-mono">{fmt(t.amount, t.currency || doc.currency)}</td>
                        <td className="px-3 py-2">{t.reference || '—'}</td>
                        <td className="px-3 py-2 text-harvics-burgundy/60">{t.description || '—'}</td>
                        <td className="px-3 py-2">{t.postedAt ? new Date(t.postedAt).toLocaleString() : '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </HarvicsOSShell>
  )
}
