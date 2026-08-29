'use client'

/**
 * Module #1 — Finance console (legacy ERP shell)
 * Wired to live /api/finance/* — no /api/modules/demo/ledger.
 */

import { useEffect, useState } from 'react'
import { ConsoleShell, Card, inputCls, btnPrimary, api } from './_shell'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) (h as Record<string, string>).Authorization = `Bearer ${token}`
  return h
}

interface JournalRow {
  id: string
  entryNo?: string
  description?: string
  debit?: string
  credit?: string
  amount?: number
  postedDate?: string
  createdAt?: string
}

interface TrialRow {
  accountCode: string
  name: string
  debits: number
  credits: number
  balance: number
}

export default function FinanceConsole() {
  const [entries, setEntries] = useState<JournalRow[]>([])
  const [trialRows, setTrialRows] = useState<TrialRow[]>([])
  const [accounts, setAccounts] = useState<Array<{ accountCode: string; name: string }>>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ debit: '', credit: '', amount: '', description: '' })

  const load = async () => {
    setLoading(true)
    try {
      const headers = authHeaders()
      const [jRes, tbRes, aRes] = await Promise.all([
        fetch('/api/finance/journal?limit=50', { headers, cache: 'no-store' }),
        fetch('/api/finance/trial-balance', { headers, cache: 'no-store' }),
        fetch('/api/finance/gl-accounts?limit=200', { headers, cache: 'no-store' }),
      ])
      const jJson = await jRes.json().catch(() => ({}))
      const tbJson = await tbRes.json().catch(() => ({}))
      const aJson = await aRes.json().catch(() => ({}))
      if (!jRes.ok) throw new Error(jJson?.error || 'Journal load failed')
      setEntries(jJson.data || [])
      setTrialRows(tbJson.data?.rows || [])
      setAccounts((aJson.data || []).map((a: any) => ({ accountCode: a.accountCode, name: a.name })))
      setMessage('')
    } catch (e: any) {
      setMessage(e.message || 'Load failed — open /os/finance (Module #1)')
    }
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const post = async () => {
    const amount = Number(form.amount) || 0
    if (!form.debit || !form.credit || amount <= 0 || !form.description) {
      setMessage('Debit, credit, amount, and description required')
      return
    }
    const r = await api('/api/finance/journal', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        debit: form.debit,
        credit: form.credit,
        amount,
        description: form.description,
      }),
    })
    setMessage(r.ok ? `Posted ${form.debit} → ${form.credit}` : r.error || 'Post failed')
    if (r.ok) {
      setForm({ debit: '', credit: '', amount: '', description: '' })
      void load()
    }
  }

  const cash = trialRows.find((r) => /cash|1000/i.test(r.accountCode + r.name))?.balance ?? 0
  const revenue = trialRows
    .filter((r) => /revenue|income|4\d{3}/i.test(r.accountCode + r.name))
    .reduce((s, r) => s + Math.abs(r.balance), 0)
  const ar = trialRows.find((r) => /receivable|ar|1100/i.test(r.accountCode + r.name))?.balance ?? 0
  const ap = trialRows.find((r) => /payable|ap|2000/i.test(r.accountCode + r.name))?.balance ?? 0

  return (
    <ConsoleShell
      title="Finance — General Ledger (Module #1 live)"
      subtitle="Posts to /api/finance/journal · trial balance from Prisma. Prefer /os/finance for full workspace."
      kpis={[
        { label: 'Cash (est.)', value: `$${cash.toLocaleString()}` },
        { label: 'Revenue (est.)', value: `$${revenue.toLocaleString()}` },
        { label: 'AR (est.)', value: `$${Math.max(0, ar).toLocaleString()}` },
        { label: 'AP (est.)', value: `$${Math.abs(ap).toLocaleString()}` },
      ]}
      message={message}
      onRefresh={load}
      loading={loading}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Post Journal Entry">
          <div className="grid gap-2">
            {accounts.length === 0 ? (
              <p className="text-xs text-[#5d5d5d]">No CoA yet — seed accounts on /os/finance first.</p>
            ) : (
              <>
                <select className={inputCls} value={form.debit} onChange={(e) => setForm({ ...form, debit: e.target.value })}>
                  <option value="">Debit account *</option>
                  {accounts.map((a) => (
                    <option key={`d-${a.accountCode}`} value={a.accountCode}>
                      {a.accountCode} — {a.name}
                    </option>
                  ))}
                </select>
                <select className={inputCls} value={form.credit} onChange={(e) => setForm({ ...form, credit: e.target.value })}>
                  <option value="">Credit account *</option>
                  {accounts.map((a) => (
                    <option key={`c-${a.accountCode}`} value={a.accountCode}>
                      {a.accountCode} — {a.name}
                    </option>
                  ))}
                </select>
              </>
            )}
            <input
              className={inputCls}
              type="number"
              placeholder="Amount *"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <input
              className={inputCls}
              placeholder="Description *"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <button type="button" onClick={() => void post()} className={btnPrimary} disabled={accounts.length === 0}>
              Post Entry
            </button>
          </div>
        </Card>

        <Card title="Trial Balance" count={trialRows.length}>
          <div className="grid gap-1.5 max-h-96 overflow-auto">
            <div className="grid grid-cols-4 gap-2 px-2 text-[10px] font-bold uppercase tracking-wider text-[#5d5d5d]">
              <span>Account</span>
              <span className="text-right">Debit</span>
              <span className="text-right">Credit</span>
              <span className="text-right">Balance</span>
            </div>
            {trialRows.map((b) => (
              <div key={b.accountCode} className="grid grid-cols-4 items-center gap-2 rounded-lg border border-[#e8e2d5] px-2 py-1.5 text-xs">
                <span className="font-bold truncate" title={b.name}>
                  {b.accountCode}
                </span>
                <span className="text-right font-mono">{(b.debits || 0).toLocaleString()}</span>
                <span className="text-right font-mono">{(b.credits || 0).toLocaleString()}</span>
                <span className={`text-right font-mono font-bold ${b.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {b.balance.toLocaleString()}
                </span>
              </div>
            ))}
            {trialRows.length === 0 ? <p className="text-xs text-[#5d5d5d]">No balances yet.</p> : null}
          </div>
        </Card>

        <Card title="Recent Journal" count={entries.length}>
          <div className="grid max-h-96 gap-1.5 overflow-auto">
            {entries.map((e) => (
              <div key={e.id} className="rounded-lg border border-[#e8e2d5] p-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold">{e.entryNo || e.id.slice(-8)}</span>
                  <span className="text-[10px] text-[#5d5d5d]">
                    {e.postedDate || (e.createdAt ? new Date(e.createdAt).toLocaleString() : '—')}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <span className="font-bold">
                    {e.debit} → {e.credit}
                  </span>
                  <span className="font-mono">${Number(e.amount || 0).toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-[#5d5d5d]">{e.description}</p>
              </div>
            ))}
            {entries.length === 0 ? <p className="text-xs text-[#5d5d5d]">No journal entries yet.</p> : null}
          </div>
        </Card>
      </div>
    </ConsoleShell>
  )
}
