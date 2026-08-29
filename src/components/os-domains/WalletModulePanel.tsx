'use client'

/**
 * Shared wallet workspace for Modules #66 (Harvicoins) and #67 (HPay).
 * Tabs: Wallets · Open · Ledger
 * Workflow: Active → Frozen → Closed
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'wallets' | 'open' | 'ledger'
type Segment = 'harvicoins' | 'hpay'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) (h as Record<string, string>).Authorization = `Bearer ${token}`
  return h
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { ...authHeaders(), ...(init?.headers || {}) } })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.success === false) throw new Error(json?.error || `HTTP ${res.status}`)
  return json
}

const META: Record<
  Segment,
  { no: string; title: string; label: string; ccy: string; path: string; sibling: string; siblingPath: string }
> = {
  harvicoins: {
    no: '#66',
    title: 'Harvicoins Wallet',
    label: 'harvicoins',
    ccy: 'HCV',
    path: '/os/wallet',
    sibling: 'HPay',
    siblingPath: '/os/hpay-wallet',
  },
  hpay: {
    no: '#67',
    title: 'HPay Wallet',
    label: 'hpay',
    ccy: 'USD',
    path: '/os/hpay-wallet',
    sibling: 'Harvicoins',
    siblingPath: '/os/wallet',
  },
}

export default function WalletModulePanel({ segment }: { segment: Segment }) {
  const locale = useLocale()
  const meta = META[segment]
  const [tab, setTab] = useState<Tab>('wallets')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [selected, setSelected] = useState('')
  const [txns, setTxns] = useState<any[]>([])
  const [form, setForm] = useState({ ownerType: 'user', ownerId: '', currency: meta.ccy })
  const [topup, setTopup] = useState({ amount: '', reference: '' })
  const [xfer, setXfer] = useState({ toWalletId: '', amount: '', reference: '' })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api(`/api/wave6/wallets?label=${meta.label}`)
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load wallets')
    } finally {
      setLoading(false)
    }
  }, [meta.label])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!selected) {
      setTxns([])
      return
    }
    void api(`/api/wave6/wallets/${selected}/txns`)
      .then((r) => setTxns(r.data || []))
      .catch((e) => setError(e.message))
  }, [selected])

  const create = async () => {
    try {
      setError('')
      setMessage('')
      if (!form.ownerId.trim()) throw new Error('Owner ID required')
      await api('/api/wave6/wallets', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          currency: form.currency.toUpperCase() || meta.ccy,
          label: meta.label,
        }),
      })
      setForm({ ...form, ownerId: '' })
      setMessage('Wallet opened')
      await load()
      setTab('wallets')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const doTopup = async () => {
    try {
      setError('')
      setMessage('')
      if (!selected) throw new Error('Pick a wallet')
      const amount = Number(topup.amount)
      if (!(amount > 0)) throw new Error('Amount must be positive')
      await api(`/api/wave6/wallets/${selected}/topup`, {
        method: 'POST',
        body: JSON.stringify({ amount, reference: topup.reference || undefined }),
      })
      setTopup({ amount: '', reference: '' })
      setMessage('Top-up posted')
      await load()
      const r = await api(`/api/wave6/wallets/${selected}/txns`)
      setTxns(r.data || [])
      setTab('ledger')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const doXfer = async () => {
    try {
      setError('')
      setMessage('')
      if (!selected) throw new Error('Pick a wallet')
      const amount = Number(xfer.amount)
      if (!xfer.toWalletId || !(amount > 0)) throw new Error('To wallet + amount required')
      await api(`/api/wave6/wallets/${selected}/transfer`, {
        method: 'POST',
        body: JSON.stringify({
          toWalletId: xfer.toWalletId,
          amount,
          reference: xfer.reference || undefined,
        }),
      })
      setXfer({ toWalletId: '', amount: '', reference: '' })
      setMessage('Transfer posted')
      await load()
      const r = await api(`/api/wave6/wallets/${selected}/txns`)
      setTxns(r.data || [])
      setTab('ledger')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const setStatus = async (id: string, status: string) => {
    try {
      setError('')
      setMessage('')
      await api(`/api/wave6/wallets/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) })
      setMessage(`Status → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const sel = rows.find((w) => w.id === selected)
  const totalBal = rows.reduce((s, w) => s + (Number(w.balance) || 0), 0)
  const frozen = rows.filter((w) => w.status === 'Frozen').length

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">
            Module {meta.no} · Universe
          </p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            {meta.title}
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ ledger · Active→Frozen→Closed ·{' '}
            <Link href={`/${locale}${meta.siblingPath}`} className="underline">
              {meta.sibling}
            </Link>
            .
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
        title={segment === 'hpay' ? 'HPay wallet AI' : 'Harvicoins wallet AI'}
        subtitle="Flags frozen wallets, low balances, and ledger anomalies — classic SAP FI has no wallet coach"
        endpoint="/api/intelligence/advise"
        body={{
          domain: segment === 'hpay' ? 'hpay-wallet' : 'wallet',
          prompt:
            segment === 'hpay'
              ? 'Advise on HPay wallet risk: frozen accounts, low balances, and transfer anomalies.'
              : 'Advise on Harvicoins wallet health: frozen wallets, balance concentration, and ledger exceptions.',
        }}
        cta="Advise wallet"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Wallets', value: rows.length },
          { label: 'Balance', value: totalBal.toLocaleString() },
          { label: 'Frozen', value: frozen },
          { label: 'Selected txns', value: txns.length },
        ].map((k) => (
          <div
            key={k.label}
            className="border border-harvics-burgundy/15 bg-white p-3"
            style={{ borderTop: '3px solid var(--harvics-gold)' }}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k.label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['wallets', 'Wallets'],
            ['open', 'Open / Move'],
            ['ledger', 'Ledger'],
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

      {!loading && tab === 'wallets' ? (
        <div className="overflow-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full border-collapse text-left text-[12px]">
            <thead>
              <tr className="bg-harvics-burgundy text-harvics-cream">
                <th className="p-2">Owner</th>
                <th className="p-2">Ccy</th>
                <th className="p-2">Bal</th>
                <th className="p-2">Status</th>
                <th className="p-2">Workflow</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => (
                <tr
                  key={w.id}
                  className={`border-b border-harvics-burgundy/10 ${selected === w.id ? 'bg-harvics-cream' : ''}`}
                >
                  <td className="p-2">
                    <Link href={`/${locale}${meta.path}/${w.id}`} className="font-semibold underline">
                      {w.ownerType}/{String(w.ownerId).slice(-8)}
                    </Link>
                  </td>
                  <td className="p-2 font-mono">{w.currency}</td>
                  <td className="p-2 font-mono font-semibold">{Number(w.balance).toLocaleString()}</td>
                  <td className="p-2 font-semibold">{w.status}</td>
                  <td className="p-2 space-x-1">
                    <button
                      type="button"
                      className="border border-harvics-burgundy px-2 py-0.5 text-[10px] font-bold"
                      onClick={() => {
                        setSelected(w.id)
                        setTab('ledger')
                      }}
                    >
                      Pick
                    </button>
                    {['Active', 'Frozen', 'Closed'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => void setStatus(w.id, s)}
                        className={`px-2 py-0.5 text-[9px] font-bold uppercase ${
                          w.status === s
                            ? 'bg-harvics-burgundy text-harvics-cream'
                            : 'border border-harvics-burgundy/40'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-harvics-burgundy/50">No wallets yet.</p>
          ) : null}
        </div>
      ) : null}

      {!loading && tab === 'open' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Open wallet</p>
            <select
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={form.ownerType}
              onChange={(e) => setForm({ ...form, ownerType: e.target.value })}
            >
              {['user', 'tenant', 'customer', 'supplier'].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Owner ID *"
              value={form.ownerId}
              onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Currency"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
            />
            <button
              type="button"
              onClick={() => void create()}
              className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              + Open
            </button>
          </div>
          <div className="space-y-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">
              Top-up / transfer {sel ? `· ${sel.ownerId}` : ''}
            </p>
            {!sel ? (
              <p className="text-sm text-harvics-burgundy/50">Pick a wallet from the Wallets tab.</p>
            ) : (
              <>
                <div className="border-l-4 border-harvics-gold bg-white px-3 py-2 font-mono text-lg">
                  {sel.currency} {Number(sel.balance).toLocaleString()}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                    placeholder="Top-up amt"
                    value={topup.amount}
                    onChange={(e) => setTopup({ ...topup, amount: e.target.value })}
                  />
                  <input
                    className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                    placeholder="Reference"
                    value={topup.reference}
                    onChange={(e) => setTopup({ ...topup, reference: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void doTopup()}
                  className="border border-harvics-burgundy px-3 py-1.5 text-[10px] font-bold uppercase"
                >
                  Top up
                </button>
                <input
                  className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                  placeholder="To wallet ID"
                  value={xfer.toWalletId}
                  onChange={(e) => setXfer({ ...xfer, toWalletId: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                    placeholder="Amount"
                    value={xfer.amount}
                    onChange={(e) => setXfer({ ...xfer, amount: e.target.value })}
                  />
                  <input
                    className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                    placeholder="Reference"
                    value={xfer.reference}
                    onChange={(e) => setXfer({ ...xfer, reference: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void doXfer()}
                  className="border border-harvics-burgundy px-3 py-1.5 text-[10px] font-bold uppercase"
                >
                  Transfer
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}

      {!loading && tab === 'ledger' ? (
        <div className="overflow-auto border border-harvics-burgundy/15 bg-white">
          {!sel ? (
            <p className="py-8 text-center text-sm text-harvics-burgundy/50">Pick a wallet first.</p>
          ) : (
            <table className="w-full border-collapse text-left text-[12px]">
              <thead>
                <tr className="bg-harvics-burgundy text-harvics-cream">
                  <th className="p-2">When</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Bal after</th>
                  <th className="p-2">Ref</th>
                </tr>
              </thead>
              <tbody>
                {txns.map((t) => (
                  <tr key={t.id} className="border-b border-harvics-burgundy/10">
                    <td className="p-2 text-[11px]">{new Date(t.createdAt).toLocaleString()}</td>
                    <td className="p-2">{t.type}</td>
                    <td className="p-2 font-mono font-semibold">
                      {t.amount >= 0 ? '+' : ''}
                      {t.amount} {t.currency}
                    </td>
                    <td className="p-2 font-mono">{t.balanceAfter}</td>
                    <td className="p-2">{t.reference || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : null}
    </div>
  )
}
