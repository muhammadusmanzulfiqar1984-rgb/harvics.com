'use client'

import { useEffect, useState } from 'react'
import { ConsoleShell, Card, inputCls, btnPrimary, api } from './_shell'

interface LedgerEntry {
  id: string
  date: string
  account: string
  debit: number
  credit: number
  ref?: string
  memo: string
}

interface Balance {
  debit: number
  credit: number
  balance: number
}

const ACCOUNTS = ['Cash', 'AR', 'AP', 'Revenue', 'Expense', 'Inventory', 'Equity', 'Tax']

export default function FinanceConsole() {
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [balances, setBalances] = useState<Record<string, Balance>>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ account: 'Cash', debit: '0', credit: '0', ref: '', memo: '' })

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/modules/demo/ledger')
      const json = await res.json()
      if (json?.success) {
        setEntries(json.data || [])
        setBalances(json.trialBalance || {})
      }
    } catch {
      setMessage('Load failed')
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const post = async () => {
    const debit = Number(form.debit) || 0
    const credit = Number(form.credit) || 0
    if (!form.account || (debit === 0 && credit === 0)) {
      setMessage('Account and debit or credit required')
      return
    }
    const r = await api('/api/modules/demo/ledger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account: form.account, debit, credit, ref: form.ref || undefined, memo: form.memo || 'Manual entry' }),
    })
    setMessage(r.ok ? `Posted to ${form.account}` : r.error || 'Post failed')
    if (r.ok) {
      setForm({ ...form, debit: '0', credit: '0', ref: '', memo: '' })
      load()
    }
  }

  const cash = balances.Cash?.balance || 0
  const revenue = (balances.Revenue?.credit || 0) - (balances.Revenue?.debit || 0)
  const ar = balances.AR?.balance || 0
  const ap = (balances.AP?.credit || 0) - (balances.AP?.debit || 0)

  return (
    <ConsoleShell
      title="Finance — General Ledger"
      subtitle="Post manual entries, watch revenue auto-flow from completed orders, AP from vendor payments."
      kpis={[
        { label: 'Cash', value: `$${cash.toLocaleString()}` },
        { label: 'Revenue', value: `$${revenue.toLocaleString()}` },
        { label: 'AR Outstanding', value: `$${Math.max(0, ar).toLocaleString()}` },
        { label: 'AP Outstanding', value: `$${Math.max(0, ap).toLocaleString()}` },
      ]}
      message={message}
      onRefresh={load}
      loading={loading}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Post Journal Entry">
          <div className="grid gap-2">
            <select className={inputCls} value={form.account} onChange={e => setForm({ ...form, account: e.target.value })}>
              {ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} type="number" placeholder="Debit" value={form.debit} onChange={e => setForm({ ...form, debit: e.target.value })} />
              <input className={inputCls} type="number" placeholder="Credit" value={form.credit} onChange={e => setForm({ ...form, credit: e.target.value })} />
            </div>
            <input className={inputCls} placeholder="Reference (optional)" value={form.ref} onChange={e => setForm({ ...form, ref: e.target.value })} />
            <input className={inputCls} placeholder="Memo" value={form.memo} onChange={e => setForm({ ...form, memo: e.target.value })} />
            <button type="button" onClick={post} className={btnPrimary}>Post Entry</button>
          </div>
        </Card>

        <Card title="Trial Balance" count={Object.keys(balances).length}>
          <div className="grid gap-1.5">
            <div className="grid grid-cols-4 gap-2 px-2 text-[10px] font-bold uppercase tracking-wider text-[#5d5d5d]">
              <span>Account</span>
              <span className="text-right">Debit</span>
              <span className="text-right">Credit</span>
              <span className="text-right">Balance</span>
            </div>
            {Object.entries(balances).map(([acct, b]) => (
              <div key={acct} className="grid grid-cols-4 items-center gap-2 rounded-lg border border-[#e8e2d5] px-2 py-1.5 text-xs">
                <span className="font-bold">{acct}</span>
                <span className="text-right font-mono">{b.debit.toLocaleString()}</span>
                <span className="text-right font-mono">{b.credit.toLocaleString()}</span>
                <span className={`text-right font-mono font-bold ${b.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {b.balance.toLocaleString()}
                </span>
              </div>
            ))}
            {Object.keys(balances).length === 0 ? <p className="text-xs text-[#5d5d5d]">No entries yet.</p> : null}
          </div>
        </Card>

        <Card title="Recent Journal" count={entries.length}>
          <div className="grid max-h-96 gap-1.5 overflow-auto">
            {entries.map(e => (
              <div key={e.id} className="rounded-lg border border-[#e8e2d5] p-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold">{e.id}</span>
                  <span className="text-[10px] text-[#5d5d5d]">{new Date(e.date).toLocaleString()}</span>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <span className="font-bold">{e.account}</span>
                  <span className="font-mono">
                    {e.debit > 0 ? <span className="text-emerald-700">D ${e.debit.toLocaleString()}</span> : null}
                    {e.credit > 0 ? <span className="text-rose-700">C ${e.credit.toLocaleString()}</span> : null}
                  </span>
                </div>
                <p className="text-[10px] text-[#5d5d5d]">{e.memo}{e.ref ? ` · ${e.ref}` : ''}</p>
              </div>
            ))}
            {entries.length === 0 ? <p className="text-xs text-[#5d5d5d]">No journal entries yet.</p> : null}
          </div>
        </Card>
      </div>
    </ConsoleShell>
  )
}
