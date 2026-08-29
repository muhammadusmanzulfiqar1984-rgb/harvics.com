'use client'

/**
 * Module #5 — Treasury & Risk (SAP+ workspace)
 * Accounts · transfers · cash positions · risk flags · FX.
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

type Tab = 'accounts' | 'transfers' | 'positions' | 'risk' | 'fx'

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
  new Intl.NumberFormat('en-US', { style: 'currency', currency: ccy, maximumFractionDigits: 0 }).format(n || 0)

export default function FinanceModuleFiveTreasury() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('accounts')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [accounts, setAccounts] = useState<any[]>([])
  const [fx, setFx] = useState<any[]>([])
  const [positions, setPositions] = useState<any>(null)
  const [riskFlags, setRiskFlags] = useState<any[]>([])
  const [riskSummary, setRiskSummary] = useState<any>(null)

  const [accForm, setAccForm] = useState({
    accountNo: '',
    bankName: '',
    currency: 'USD',
    accountType: 'Operating',
    balance: '0',
  })
  const [xferForm, setXferForm] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    reference: '',
    description: '',
  })
  const [fxForm, setFxForm] = useState({
    fromCcy: 'USD',
    toCcy: 'EUR',
    rate: '',
    effectiveDate: new Date().toISOString().slice(0, 10),
    source: 'Manual',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [a, f, pos, risk] = await Promise.all([
        api('/api/v2/treasury/accounts'),
        api('/api/v2/treasury/fx-rates'),
        api('/api/v2/treasury/positions'),
        api('/api/v2/treasury/risk'),
      ])
      setAccounts(a.data || [])
      setFx(f.data || [])
      setPositions(pos.data || null)
      setRiskFlags(risk.data || [])
      setRiskSummary(risk.summary || null)
      setXferForm((f) =>
        f.fromAccountId || !(a.data || []).length ? f : { ...f, fromAccountId: a.data[0].id },
      )
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #5 Treasury')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const cashTotal = positions?.totalCash ?? accounts.reduce((s, a) => s + (Number(a.balance) || 0), 0)
  const frozenCount = riskSummary?.frozenCount ?? accounts.filter((a) => a.status === 'Frozen').length
  const highRisk = riskSummary?.high ?? 0

  const createAccount = async () => {
    try {
      setError('')
      setMessage('')
      const r = await api('/api/v2/treasury/accounts', {
        method: 'POST',
        body: JSON.stringify({
          accountNo: accForm.accountNo,
          bankName: accForm.bankName,
          currency: accForm.currency,
          accountType: accForm.accountType,
          balance: Number(accForm.balance) || 0,
        }),
      })
      setAccForm({ accountNo: '', bankName: '', currency: 'USD', accountType: 'Operating', balance: '0' })
      setMessage(`Account ${r.data?.accountNo} opened`)
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
          fromAccountId: xferForm.fromAccountId,
          toAccountId: xferForm.toAccountId,
          amount: Number(xferForm.amount),
          reference: xferForm.reference || undefined,
          description: xferForm.description || undefined,
        }),
      })
      setXferForm((f) => ({ ...f, amount: '', reference: '', description: '' }))
      setMessage('Inter-account transfer posted')
      await load()
      setTab('positions')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const toggleFreeze = async (id: string, status: string) => {
    try {
      setError('')
      setMessage('')
      const path = status === 'Frozen' ? 'unfreeze' : 'freeze'
      const r = await api(`/api/v2/treasury/accounts/${id}/${path}`, {
        method: 'POST',
        body: JSON.stringify({ reason: path === 'freeze' ? 'Treasury risk hold' : 'Cleared' }),
      })
      setMessage(r.message || `Account ${path}d`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const createFx = async () => {
    try {
      setError('')
      setMessage('')
      await api('/api/v2/treasury/fx-rates', {
        method: 'POST',
        body: JSON.stringify({
          fromCcy: fxForm.fromCcy,
          toCcy: fxForm.toCcy,
          rate: Number(fxForm.rate),
          effectiveDate: fxForm.effectiveDate,
          source: fxForm.source || undefined,
        }),
      })
      setFxForm({ ...fxForm, rate: '' })
      setMessage('FX rate saved')
      await load()
      setTab('fx')
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #5 · Finance</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Treasury & Risk
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            Bank accounts, inter-account transfers, cash positions & risk flags — feeds Module #6 HPay and #49 FX.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/${locale}/os/payment-runs`}
            className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            HPay runs
          </Link>
          <button
            type="button"
            onClick={() => void load()}
            className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #6B1D2A' }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Cash position</div>
          <div className="mt-1 font-mono text-lg font-semibold">{fmt(cashTotal)}</div>
        </div>
        <div className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #B8860B' }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Accounts</div>
          <div className="mt-1 font-mono text-lg font-semibold">{accounts.length}</div>
        </div>
        <div className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #E65100' }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Frozen</div>
          <div className="mt-1 font-mono text-lg font-semibold">{frozenCount}</div>
        </div>
        <div className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid #B71C1C' }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">High risk</div>
          <div className="mt-1 font-mono text-lg font-semibold">{highRisk}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['accounts', 'Accounts'],
            ['transfers', 'Transfers'],
            ['positions', 'Positions'],
            ['risk', 'Risk flags'],
            ['fx', 'FX rates'],
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

      {!loading && tab === 'accounts' ? (
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Open account</p>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Account #"
              value={accForm.accountNo}
              onChange={(e) => setAccForm((f) => ({ ...f, accountNo: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Bank name"
              value={accForm.bankName}
              onChange={(e) => setAccForm((f) => ({ ...f, bankName: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Currency"
              value={accForm.currency}
              onChange={(e) => setAccForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))}
            />
            <select
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={accForm.accountType}
              onChange={(e) => setAccForm((f) => ({ ...f, accountType: e.target.value }))}
            >
              <option>Operating</option>
              <option>Sweep</option>
              <option>Payroll</option>
              <option>Reserve</option>
              <option>Collection</option>
            </select>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              type="number"
              placeholder="Opening balance"
              value={accForm.balance}
              onChange={(e) => setAccForm((f) => ({ ...f, balance: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => void createAccount()}
              className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Create account
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Account', 'Bank', 'Type', 'Balance', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">
                      No bank accounts yet.
                    </td>
                  </tr>
                ) : (
                  accounts.map((a, i) => (
                    <tr key={a.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2">
                        <Link
                          href={`/${locale}/os/treasury/accounts/${a.id}`}
                          className="font-mono font-semibold underline decoration-harvics-gold/50"
                        >
                          {a.accountNo}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{a.bankName}</td>
                      <td className="px-3 py-2">{a.accountType}</td>
                      <td className="px-3 py-2 font-mono">{fmt(a.balance, a.currency || 'USD')}</td>
                      <td className="px-3 py-2">{a.status}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => void toggleFreeze(a.id, a.status)}
                          className="border border-harvics-burgundy/30 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em]"
                        >
                          {a.status === 'Frozen' ? 'Unfreeze' : 'Freeze'}
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

      {!loading && tab === 'transfers' ? (
        <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Inter-account transfer</p>
            <select
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={xferForm.fromAccountId}
              onChange={(e) => setXferForm((f) => ({ ...f, fromAccountId: e.target.value }))}
            >
              <option value="">From account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id} disabled={a.status === 'Frozen'}>
                  {a.accountNo} — {fmt(a.balance, a.currency)} {a.status === 'Frozen' ? '(frozen)' : ''}
                </option>
              ))}
            </select>
            <select
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={xferForm.toAccountId}
              onChange={(e) => setXferForm((f) => ({ ...f, toAccountId: e.target.value }))}
            >
              <option value="">To account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id} disabled={a.status === 'Frozen' || a.id === xferForm.fromAccountId}>
                  {a.accountNo} — {a.bankName}
                </option>
              ))}
            </select>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              type="number"
              placeholder="Amount"
              value={xferForm.amount}
              onChange={(e) => setXferForm((f) => ({ ...f, amount: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Reference"
              value={xferForm.reference}
              onChange={(e) => setXferForm((f) => ({ ...f, reference: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Description"
              value={xferForm.description}
              onChange={(e) => setXferForm((f) => ({ ...f, description: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => void transfer()}
              className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Post transfer
            </button>
          </div>
          <div className="border border-harvics-burgundy/15 bg-white p-4 text-[13px] text-harvics-burgundy/70">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">Rules</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Same currency only (FX convert via rates tab first).</li>
              <li>Frozen accounts cannot send or receive.</li>
              <li>Insufficient balance is rejected server-side.</li>
              <li>Creates paired Debit / Credit cash movements with shared reference.</li>
            </ul>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'positions' ? (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
              <p className="border-b border-harvics-burgundy/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">
                By currency
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                    {['CCY', 'Balance', 'Accounts', 'Frozen'].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(positions?.byCurrency || []).map((r: any, i: number) => (
                    <tr key={r.currency} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono font-semibold">{r.currency}</td>
                      <td className="px-3 py-2 font-mono">{fmt(r.balance, r.currency)}</td>
                      <td className="px-3 py-2">{r.accounts}</td>
                      <td className="px-3 py-2">{r.frozen}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
              <p className="border-b border-harvics-burgundy/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">
                By account type
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                    {['Type', 'Balance', 'Accounts'].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(positions?.byType || []).map((r: any, i: number) => (
                    <tr key={r.accountType} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-semibold">{r.accountType}</td>
                      <td className="px-3 py-2 font-mono">{fmt(r.balance)}</td>
                      <td className="px-3 py-2">{r.accounts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <p className="border-b border-harvics-burgundy/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">
              Concentration
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Account', 'Bank', 'Balance', 'Share %'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(positions?.accounts || []).map((a: any, i: number) => (
                  <tr key={a.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2">
                      <Link
                        href={`/${locale}/os/treasury/accounts/${a.id}`}
                        className="font-mono font-semibold underline decoration-harvics-gold/50"
                      >
                        {a.accountNo}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{a.bankName}</td>
                    <td className="px-3 py-2 font-mono">{fmt(a.balance, a.currency)}</td>
                    <td className="px-3 py-2 font-mono">{a.sharePct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'risk' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Severity', 'Code', 'Message', 'Account'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {riskFlags.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No risk flags — cash position healthy.
                  </td>
                </tr>
              ) : (
                riskFlags.map((f, i) => (
                  <tr key={`${f.code}-${i}`} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td
                      className="px-3 py-2 font-semibold uppercase"
                      style={{
                        color: f.severity === 'high' ? '#B71C1C' : f.severity === 'medium' ? '#E65100' : '#B8860B',
                      }}
                    >
                      {f.severity}
                    </td>
                    <td className="px-3 py-2 font-mono text-[12px]">{f.code}</td>
                    <td className="px-3 py-2">{f.message}</td>
                    <td className="px-3 py-2">
                      {f.accountId ? (
                        <Link
                          href={`/${locale}/os/treasury/accounts/${f.accountId}`}
                          className="underline decoration-harvics-gold/50"
                        >
                          Open
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && tab === 'fx' ? (
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Add FX rate</p>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="From"
              value={fxForm.fromCcy}
              onChange={(e) => setFxForm((f) => ({ ...f, fromCcy: e.target.value.toUpperCase() }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="To"
              value={fxForm.toCcy}
              onChange={(e) => setFxForm((f) => ({ ...f, toCcy: e.target.value.toUpperCase() }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              type="number"
              step="0.0001"
              placeholder="Rate"
              value={fxForm.rate}
              onChange={(e) => setFxForm((f) => ({ ...f, rate: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              type="date"
              value={fxForm.effectiveDate}
              onChange={(e) => setFxForm((f) => ({ ...f, effectiveDate: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => void createFx()}
              className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Save rate
            </button>
            <Link href={`/${locale}/os/fx-engine`} className="block text-center text-[10px] font-bold uppercase underline">
              Open FX Engine →
            </Link>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Pair', 'Rate', 'Date', 'Source'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fx.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-harvics-burgundy/45">
                      No FX rates on file.
                    </td>
                  </tr>
                ) : (
                  fx.map((r, i) => (
                    <tr key={r.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono font-semibold">
                        {r.fromCcy}/{r.toCcy}
                      </td>
                      <td className="px-3 py-2 font-mono">{r.rate}</td>
                      <td className="px-3 py-2">{String(r.effectiveDate).slice(0, 10)}</td>
                      <td className="px-3 py-2">{r.source || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )
}
