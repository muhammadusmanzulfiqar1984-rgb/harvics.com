'use client'

/**
 * Module #1 — Financial Accounting (GL) — SAP+ workspace
 * CoA · Account Ledger · Park/Post/Reverse journals · Trial Balance · BS · P&L · Period control
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { OsBarChart, OsKpi, OsLivePulse, OsPanel, OsPieChart, OS } from '@/components/os/charts/OsCharts'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'coa' | 'ledger' | 'journals' | 'trial' | 'statements' | 'periods'

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
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

const fmt2 = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0)

const statusTone: Record<string, string> = {
  Posted: 'bg-harvics-cream text-harvics-burgundy border border-harvics-gold/40',
  Draft: 'bg-harvics-gold/15 text-harvics-burgundy border border-harvics-gold/50',
  Reversed: 'bg-harvics-burgundy/5 text-harvics-muted border border-harvics-burgundy/15',
  Open: 'bg-harvics-cream text-harvics-burgundy border border-harvics-gold/40',
  Closed: 'bg-[#F5F5F7] text-harvics-muted border border-harvics-burgundy/10',
  Active: 'bg-harvics-cream text-harvics-burgundy border border-harvics-gold/40',
  Inactive: 'bg-harvics-burgundy/5 text-harvics-muted border border-harvics-burgundy/15',
}

export default function FinanceModuleOneGL() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('coa')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [accounts, setAccounts] = useState<any[]>([])
  const [journals, setJournals] = useState<any[]>([])
  const [periods, setPeriods] = useState<any[]>([])
  const [trial, setTrial] = useState<any>(null)
  const [openPeriod, setOpenPeriod] = useState<any>(null)
  const [balanceSheet, setBalanceSheet] = useState<any>(null)
  const [profitLoss, setProfitLoss] = useState<any>(null)

  const [coaFilter, setCoaFilter] = useState('')
  const [coaType, setCoaType] = useState('All')
  const [ledgerCode, setLedgerCode] = useState('')
  const [ledger, setLedger] = useState<any>(null)

  const [acctForm, setAcctForm] = useState({ accountCode: '', name: '', type: 'Asset' })
  const [jeForm, setJeForm] = useState({ description: '', debit: '', credit: '', amount: '' })
  const [periodForm, setPeriodForm] = useState({
    name: '',
    year: String(new Date().getFullYear()),
    month: String(new Date().getMonth() + 1),
  })
  const [selectedJe, setSelectedJe] = useState<any>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [a, j, p, tb, bs, pl] = await Promise.all([
        api('/api/finance/gl-accounts?limit=500'),
        api('/api/finance/journal?limit=200'),
        api('/api/finance/fiscal-periods?limit=100'),
        api('/api/finance/trial-balance'),
        api('/api/finance/reports/balance-sheet'),
        api('/api/finance/reports/profit-loss'),
      ])
      setAccounts(a.data || [])
      setJournals(j.data || [])
      setPeriods(p.data || [])
      setTrial(tb.data || null)
      setBalanceSheet(bs.data || null)
      setProfitLoss(pl.data || null)
      setOpenPeriod((p.data || []).find((x: any) => x.status === 'Open') || null)
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #1 GL')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const openLedger = async (code: string) => {
    try {
      setError('')
      setLedgerCode(code)
      const r = await api(`/api/finance/gl-accounts/${encodeURIComponent(code)}/ledger`)
      setLedger(r.data)
      setTab('ledger')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const seedCoa = async () => {
    try {
      setMessage('')
      const r = await api('/api/finance/gl-accounts/seed-standard', { method: 'POST' })
      setMessage(r.message || 'Standard CoA seeded')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const createAccount = async () => {
    try {
      setError('')
      await api('/api/finance/gl-accounts', { method: 'POST', body: JSON.stringify(acctForm) })
      setAcctForm({ accountCode: '', name: '', type: 'Asset' })
      setMessage('G/L account created')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const toggleAccount = async (a: any) => {
    try {
      setError('')
      await api(`/api/finance/gl-accounts/${a.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: a.status === 'Active' ? 'Inactive' : 'Active' }),
      })
      setMessage(`${a.accountCode} set to ${a.status === 'Active' ? 'Inactive' : 'Active'}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const saveJournal = async (status: 'Draft' | 'Posted') => {
    try {
      setError('')
      setMessage('')
      const r = await api('/api/finance/journal', {
        method: 'POST',
        body: JSON.stringify({
          ...jeForm,
          amount: Number(jeForm.amount),
          periodCode: openPeriod?.periodCode,
          status,
        }),
      })
      setJeForm({ description: '', debit: '', credit: '', amount: '' })
      setMessage(status === 'Draft' ? `Parked ${r.data?.entryNo}` : `Posted ${r.data?.entryNo}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const postDraft = async (id: string) => {
    try {
      setError('')
      const r = await api(`/api/finance/journal/${id}/post`, { method: 'POST' })
      setMessage(r.message || 'Posted')
      setSelectedJe(null)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const reverseJe = async (id: string) => {
    const reason = window.prompt('Reversal reason (optional)') || undefined
    try {
      setError('')
      const r = await api(`/api/finance/journal/${id}/reverse`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      })
      setMessage(r.message || 'Reversed')
      setSelectedJe(null)
      await load()
      if (ledgerCode) await openLedger(ledgerCode)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const openDocument = async (id: string) => {
    try {
      setError('')
      const r = await api(`/api/finance/journal/${id}`)
      setSelectedJe(r.data)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const openPeriodAction = async () => {
    try {
      setError('')
      await api('/api/finance/fiscal-periods', {
        method: 'POST',
        body: JSON.stringify({
          name: periodForm.name || `${periodForm.year}-${periodForm.month}`,
          year: Number(periodForm.year),
          month: Number(periodForm.month),
        }),
      })
      setMessage('Fiscal period opened')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const closePeriod = async (id: string) => {
    try {
      setError('')
      await api(`/api/finance/fiscal-periods/${id}/close`, { method: 'POST' })
      setMessage('Period closed — postings blocked')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const reopenPeriod = async (id: string) => {
    try {
      setError('')
      await api(`/api/finance/fiscal-periods/${id}/reopen`, { method: 'POST' })
      setMessage('Period re-opened')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'coa', label: 'Chart of Accounts' },
    { id: 'ledger', label: 'Account Ledger' },
    { id: 'journals', label: 'Journal Documents' },
    { id: 'trial', label: 'Trial Balance' },
    { id: 'statements', label: 'Financial Statements' },
    { id: 'periods', label: 'Period Control' },
  ]

  const filteredAccounts = useMemo(() => {
    const q = coaFilter.trim().toLowerCase()
    return accounts.filter((a) => {
      if (coaType !== 'All' && a.type !== coaType) return false
      if (!q) return true
      return (
        String(a.accountCode).toLowerCase().includes(q) ||
        String(a.name).toLowerCase().includes(q)
      )
    })
  }, [accounts, coaFilter, coaType])

  const typePie = useMemo(() => {
    const map: Record<string, number> = {}
    for (const a of accounts) {
      const t = a.type || 'Other'
      map[t] = (map[t] || 0) + Math.abs(Number(a.balance) || 0)
    }
    const rows = Object.entries(map).map(([name, value]) => ({ name, value }))
    return rows.length ? rows : [{ name: 'Empty', value: 1 }]
  }, [accounts])

  const typeBars = useMemo(() => {
    return ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'].map((name) => ({
      name,
      value: accounts.filter((a) => a.type === name).length,
    }))
  }, [accounts])

  const draftCount = journals.filter((j) => j.status === 'Draft').length
  const postedCount = journals.filter((j) => j.status === 'Posted').length

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-harvics-burgundy">
            Module #1 · Financial Accounting · SAP+
          </p>
          <h2 className="text-xl font-semibold text-[#3D1212]">General Ledger Command Center</h2>
          <p className="text-sm text-[#6B5E52] mt-1 max-w-3xl">
            Document-driven G/L: park → post → reverse, account ledger drill-down, trial balance hard-close,
            balance sheet &amp; P&amp;L from posted journals.
            {openPeriod ? ` Open period: ${openPeriod.periodCode}` : ' No open period — open one before posting.'}
          </p>
        </div>
        <OsLivePulse label="GL LIVE" />
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <OsKpi label="G/L Accounts" value={accounts.length} live accent={OS.gold} />
        <OsKpi label="Posted docs" value={postedCount} />
        <OsKpi label="Parked" value={draftCount} accent={draftCount ? OS.gold : undefined} />
        <OsKpi
          label="TB"
          value={trial?.balanced ? 'Balanced' : trial ? 'Out of bal.' : '—'}
          accent={trial?.balanced ? OS.gold : OS.burgundy}
        />
        <OsKpi label="Net income" value={fmt(profitLoss?.netIncome || 0)} />
      </div>

      <OsSapAiPanel
        title="Period-close AI"
        subtitle="LLM close checklist from trial balance, parked journals, and open period — beyond classic SAP FI close lists"
        endpoint="/api/finance/ai/gl-close"
        cta="Advise close"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        <OsPanel title="Balance by type" subtitle="CoA mix">
          <OsPieChart data={typePie} height={200} />
        </OsPanel>
        <OsPanel title="Accounts by type" subtitle="Count">
          <OsBarChart data={typeBars} color={OS.burgundy} height={200} />
        </OsPanel>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {message && (
        <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm text-harvics-burgundy">{message}</div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-[#E8E0D4] pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md ${
              tab === t.id ? 'bg-harvics-burgundy text-white' : 'bg-white border border-[#E8E0D4] text-[#4A3728]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-[#6B5E52]">Loading…</p>
      ) : (
        <>
          {tab === 'coa' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                <button type="button" onClick={seedCoa} className="px-3 py-2 text-xs font-semibold border border-[#E8E0D4] bg-white rounded-md hover:border-harvics-burgundy/40">
                  Seed standard CoA
                </button>
                <button type="button" onClick={load} className="px-3 py-2 text-xs font-semibold border border-[#E8E0D4] bg-white rounded-md">
                  Refresh
                </button>
                <input
                  className="px-3 py-2 text-sm border border-[#E8E0D4] rounded-md min-w-[200px]"
                  placeholder="Search code or name…"
                  value={coaFilter}
                  onChange={(e) => setCoaFilter(e.target.value)}
                />
                <select
                  className="px-3 py-2 text-sm border border-[#E8E0D4] rounded-md"
                  value={coaType}
                  onChange={(e) => setCoaType(e.target.value)}
                >
                  {['All', 'Asset', 'Liability', 'Equity', 'Revenue', 'Expense'].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 p-4 border border-[#E8E0D4] rounded-xl bg-[#FFFEF9]">
                <input className="px-3 py-2 text-sm border border-[#E8E0D4] rounded-md" placeholder="Code e.g. 1000" value={acctForm.accountCode} onChange={(e) => setAcctForm({ ...acctForm, accountCode: e.target.value })} />
                <input className="px-3 py-2 text-sm border border-[#E8E0D4] rounded-md" placeholder="Account name" value={acctForm.name} onChange={(e) => setAcctForm({ ...acctForm, name: e.target.value })} />
                <select className="px-3 py-2 text-sm border border-[#E8E0D4] rounded-md" value={acctForm.type} onChange={(e) => setAcctForm({ ...acctForm, type: e.target.value })}>
                  {['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'].map((t) => <option key={t}>{t}</option>)}
                </select>
                <button type="button" onClick={createAccount} className="px-3 py-2 text-xs font-semibold bg-harvics-burgundy text-white rounded-md">Create G/L account</button>
              </div>

              {filteredAccounts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#D9D0C4] px-6 py-12 text-center text-sm text-[#6B5E52]">
                  No accounts — seed standard CoA or create accounts.
                </div>
              ) : (
                <div className="overflow-x-auto border border-[#E8E0D4] rounded-xl bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E8E0D4] text-left text-[10px] uppercase tracking-wider text-[#6B5E52]">
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Balance</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAccounts.map((a) => (
                        <tr key={a.id} className="border-b border-[#F0EAE1] hover:bg-[#FFFEF9]">
                          <td className="px-4 py-2.5 font-mono text-xs">
                            <Link
                              href={`/${locale}/os/finance/accounts/${encodeURIComponent(a.accountCode)}`}
                              className="text-harvics-burgundy font-semibold underline"
                            >
                              {a.accountCode}
                            </Link>
                          </td>
                          <td className="px-4 py-2.5">{a.name}</td>
                          <td className="px-4 py-2.5 text-[#6B5E52]">{a.type}</td>
                          <td className="px-4 py-2.5">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${statusTone[a.status] || ''}`}>{a.status}</span>
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{fmt(a.balance || 0)}</td>
                          <td className="px-4 py-2.5 text-right space-x-2">
                            <Link
                              href={`/${locale}/os/finance/accounts/${encodeURIComponent(a.accountCode)}`}
                              className="text-xs font-semibold text-harvics-burgundy underline"
                            >
                              Account 360
                            </Link>
                            <button type="button" className="text-xs font-semibold text-[#6B5E52] underline" onClick={() => openLedger(a.accountCode)}>Ledger</button>
                            <button type="button" className="text-xs font-semibold text-[#6B5E52] underline" onClick={() => toggleAccount(a)}>
                              {a.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'ledger' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 items-end">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#6B5E52] mb-1">G/L account</label>
                  <select
                    className="px-3 py-2 text-sm border border-[#E8E0D4] rounded-md min-w-[280px]"
                    value={ledgerCode}
                    onChange={(e) => {
                      if (e.target.value) void openLedger(e.target.value)
                    }}
                  >
                    <option value="">Select account…</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.accountCode}>{a.accountCode} — {a.name}</option>
                    ))}
                  </select>
                </div>
                {ledger && (
                  <div className="text-sm text-[#6B5E52] pb-2">
                    Closing {fmt2(ledger.closingBalance)} · {ledger.movementCount} movements · normal {ledger.account?.normalBalance}
                  </div>
                )}
              </div>

              {!ledger ? (
                <div className="rounded-xl border border-dashed border-[#D9D0C4] px-6 py-12 text-center text-sm text-[#6B5E52]">
                  Select an account (or click a code in CoA) for FBL3N-style line items.
                </div>
              ) : (
                <div className="overflow-x-auto border border-[#E8E0D4] rounded-xl bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E8E0D4] text-left text-[10px] uppercase tracking-wider text-[#6B5E52]">
                        <th className="px-4 py-3">Doc</th>
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
                      {ledger.lines.length === 0 ? (
                        <tr><td colSpan={8} className="px-4 py-8 text-center text-[#6B5E52]">No postings on this account yet.</td></tr>
                      ) : ledger.lines.map((l: any) => (
                        <tr key={l.id} className="border-b border-[#F0EAE1]">
                          <td className="px-4 py-2.5 font-mono text-xs">
                            <Link href={`/${locale}/os/finance/journals/${l.id}`} className="underline text-harvics-burgundy">{l.entryNo}</Link>
                          </td>
                          <td className="px-4 py-2.5 text-xs">{l.postedDate || '—'}</td>
                          <td className="px-4 py-2.5">{l.description}</td>
                          <td className="px-4 py-2.5 font-mono text-xs">{l.contra}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{l.debit ? fmt2(l.debit) : '—'}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{l.credit ? fmt2(l.credit) : '—'}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums font-medium">{fmt2(l.balance)}</td>
                          <td className="px-4 py-2.5"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${statusTone[l.status] || ''}`}>{l.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'journals' && (
            <div className="space-y-4">
              <div className="p-4 border border-[#E8E0D4] rounded-xl bg-[#FFFEF9] space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-harvics-burgundy">Create journal document</p>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <input className="md:col-span-2 px-3 py-2 text-sm border border-[#E8E0D4] rounded-md" placeholder="Document text / description" value={jeForm.description} onChange={(e) => setJeForm({ ...jeForm, description: e.target.value })} />
                  <select className="px-3 py-2 text-sm border border-[#E8E0D4] rounded-md" value={jeForm.debit} onChange={(e) => setJeForm({ ...jeForm, debit: e.target.value })}>
                    <option value="">Debit account</option>
                    {accounts.filter((a) => a.status === 'Active').map((a) => <option key={a.id} value={a.accountCode}>{a.accountCode} — {a.name}</option>)}
                  </select>
                  <select className="px-3 py-2 text-sm border border-[#E8E0D4] rounded-md" value={jeForm.credit} onChange={(e) => setJeForm({ ...jeForm, credit: e.target.value })}>
                    <option value="">Credit account</option>
                    {accounts.filter((a) => a.status === 'Active').map((a) => <option key={a.id} value={a.accountCode}>{a.accountCode} — {a.name}</option>)}
                  </select>
                  <input className="px-3 py-2 text-sm border border-[#E8E0D4] rounded-md" type="number" placeholder="Amount" value={jeForm.amount} onChange={(e) => setJeForm({ ...jeForm, amount: e.target.value })} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => saveJournal('Draft')} className="px-4 py-2 text-xs font-semibold border border-[#E8E0D4] bg-white rounded-md">
                    Park (Draft)
                  </button>
                  <button type="button" onClick={() => saveJournal('Posted')} className="px-4 py-2 text-xs font-semibold bg-harvics-burgundy text-white rounded-md">
                    Post document
                  </button>
                  <span className="text-xs text-[#6B5E52] self-center">
                    Park holds without affecting TB · Post updates ledgers immediately
                  </span>
                </div>
              </div>

              {selectedJe && (
                <div className="p-4 border border-harvics-burgundy/30 rounded-xl bg-white space-y-3">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-harvics-burgundy">Document display</p>
                      <h3 className="text-lg font-semibold text-[#3D1212] font-mono">{selectedJe.entryNo}</h3>
                      <p className="text-sm text-[#6B5E52]">{selectedJe.description}</p>
                    </div>
                    <div className="flex gap-2 items-start">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${statusTone[selectedJe.status] || ''}`}>{selectedJe.status}</span>
                      {selectedJe.status === 'Draft' && (
                        <button type="button" onClick={() => postDraft(selectedJe.id)} className="px-3 py-1.5 text-xs font-semibold bg-harvics-burgundy text-white rounded-md">Post</button>
                      )}
                      {selectedJe.status === 'Posted' && (
                        <button type="button" onClick={() => reverseJe(selectedJe.id)} className="px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-800 rounded-md">Reverse</button>
                      )}
                      <button type="button" onClick={() => setSelectedJe(null)} className="px-3 py-1.5 text-xs font-semibold border border-[#E8E0D4] rounded-md">Close</button>
                    </div>
                  </div>
                  <table className="w-full text-sm border border-[#E8E0D4] rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-[#FFFEF9] text-[10px] uppercase tracking-wider text-[#6B5E52] text-left">
                        <th className="px-3 py-2">Side</th>
                        <th className="px-3 py-2">Account</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedJe.lines || []).map((line: any, i: number) => (
                        <tr key={i} className="border-t border-[#F0EAE1]">
                          <td className="px-3 py-2 font-semibold">{line.side}</td>
                          <td className="px-3 py-2 font-mono text-xs">{line.accountCode}</td>
                          <td className="px-3 py-2">{line.accountName}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{fmt2(line.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-[#6B5E52]">Period {selectedJe.periodCode || '—'} · Posted {selectedJe.postedDate || 'not posted'} · {selectedJe.currency}</p>
                </div>
              )}

              {journals.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#D9D0C4] px-6 py-12 text-center text-sm text-[#6B5E52]">No journal documents yet.</div>
              ) : (
                <div className="overflow-x-auto border border-[#E8E0D4] rounded-xl bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E8E0D4] text-left text-[10px] uppercase tracking-wider text-[#6B5E52]">
                        <th className="px-4 py-3">Document</th>
                        <th className="px-4 py-3">Text</th>
                        <th className="px-4 py-3">Debit</th>
                        <th className="px-4 py-3">Credit</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3">Period</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {journals.map((j) => (
                        <tr key={j.id} className="border-b border-[#F0EAE1] hover:bg-[#FFFEF9]">
                          <td className="px-4 py-2.5 font-mono text-xs">
                            <Link href={`/${locale}/os/finance/journals/${j.id}`} className="underline text-harvics-burgundy">{j.entryNo}</Link>
                          </td>
                          <td className="px-4 py-2.5">{j.description}</td>
                          <td className="px-4 py-2.5 font-mono text-xs">
                            <button type="button" className="underline" onClick={() => openLedger(j.debit)}>{j.debit}</button>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-xs">
                            <button type="button" className="underline" onClick={() => openLedger(j.credit)}>{j.credit}</button>
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{fmt(j.amount)}</td>
                          <td className="px-4 py-2.5 text-[#6B5E52] text-xs">{j.periodCode || '—'}</td>
                          <td className="px-4 py-2.5"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${statusTone[j.status] || ''}`}>{j.status}</span></td>
                          <td className="px-4 py-2.5 text-right space-x-2">
                            <Link href={`/${locale}/os/finance/journals/${j.id}`} className="text-xs font-semibold underline text-harvics-burgundy">Display</Link>
                            {j.status === 'Draft' && (
                              <button type="button" className="text-xs font-semibold underline" onClick={() => postDraft(j.id)}>Post</button>
                            )}
                            {j.status === 'Posted' && (
                              <button type="button" className="text-xs font-semibold underline text-red-800" onClick={() => reverseJe(j.id)}>Reverse</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'trial' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm flex-wrap">
                <span className={`font-semibold ${trial?.balanced ? 'text-emerald-700' : 'text-red-700'}`}>
                  {trial?.balanced ? 'Balanced' : 'Out of balance'}
                </span>
                <span className="text-[#6B5E52]">Debits {fmt(trial?.totalDebits || 0)} · Credits {fmt(trial?.totalCredits || 0)} · {trial?.journalCount || 0} posted journals</span>
                <a href="/api/finance/reports/trial-balance/export?format=csv" className="ml-auto text-xs font-semibold text-harvics-burgundy underline" target="_blank" rel="noreferrer">Export CSV</a>
              </div>
              {!(trial?.rows?.length) ? (
                <div className="rounded-xl border border-dashed border-[#D9D0C4] px-6 py-12 text-center text-sm text-[#6B5E52]">No CoA / journals — nothing to balance.</div>
              ) : (
                <div className="overflow-x-auto border border-[#E8E0D4] rounded-xl bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E8E0D4] text-left text-[10px] uppercase tracking-wider text-[#6B5E52]">
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3 text-right">Debits</th>
                        <th className="px-4 py-3 text-right">Credits</th>
                        <th className="px-4 py-3 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trial.rows.filter((r: any) => r.debits || r.credits || r.balance).map((r: any) => (
                        <tr key={r.accountCode} className="border-b border-[#F0EAE1]">
                          <td className="px-4 py-2.5 font-mono text-xs">
                            <button type="button" className="underline text-harvics-burgundy" onClick={() => openLedger(r.accountCode)}>{r.accountCode}</button>
                          </td>
                          <td className="px-4 py-2.5">{r.name}</td>
                          <td className="px-4 py-2.5 text-[#6B5E52] text-xs">{r.type}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{fmt(r.debits)}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{fmt(r.credits)}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums font-medium">{fmt(r.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'statements' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="border border-[#E8E0D4] rounded-xl bg-white overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E8E0D4] bg-[#FFFEF9]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-harvics-burgundy">Balance Sheet</p>
                  <p className="text-sm text-[#6B5E52]">
                    As of {balanceSheet?.asOf} · {balanceSheet?.balanced ? 'Equation holds' : 'Check equation'}
                  </p>
                </div>
                <div className="p-4 space-y-4 text-sm">
                  {[
                    { title: 'Assets', block: balanceSheet?.assets },
                    { title: 'Liabilities', block: balanceSheet?.liabilities },
                    { title: 'Equity', block: balanceSheet?.equity },
                  ].map(({ title, block }) => (
                    <div key={title}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B5E52] mb-2">{title}</p>
                      {(block?.lines || []).map((l: any) => (
                        <div key={l.accountCode} className="flex justify-between py-1 border-b border-[#F0EAE1]">
                          <span className="font-mono text-xs text-harvics-burgundy">{l.accountCode}</span>
                          <span className="flex-1 px-3">{l.name}</span>
                          <span className="tabular-nums">{fmt(l.balance)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 font-semibold">
                        <span>Total {title}</span>
                        <span className="tabular-nums">{fmt(block?.total || 0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-[#E8E0D4] rounded-xl bg-white overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E8E0D4] bg-[#FFFEF9]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-harvics-burgundy">Profit &amp; Loss</p>
                  <p className="text-sm text-[#6B5E52]">
                    Net income {fmt(profitLoss?.netIncome || 0)} · Margin {(profitLoss?.marginPct || 0).toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 space-y-4 text-sm">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B5E52] mb-2">Revenue</p>
                    {(profitLoss?.revenue?.lines || []).map((l: any) => (
                      <div key={l.accountCode} className="flex justify-between py-1 border-b border-[#F0EAE1]">
                        <span className="font-mono text-xs">{l.accountCode}</span>
                        <span className="flex-1 px-3">{l.name}</span>
                        <span className="tabular-nums">{fmt(l.balance)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 font-semibold">
                      <span>Total Revenue</span>
                      <span className="tabular-nums">{fmt(profitLoss?.revenue?.total || 0)}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B5E52] mb-2">Expenses</p>
                    {(profitLoss?.expenses?.lines || []).map((l: any) => (
                      <div key={l.accountCode} className="flex justify-between py-1 border-b border-[#F0EAE1]">
                        <span className="font-mono text-xs">{l.accountCode}</span>
                        <span className="flex-1 px-3">{l.name}</span>
                        <span className="tabular-nums">{fmt(l.balance)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 font-semibold">
                      <span>Total Expenses</span>
                      <span className="tabular-nums">{fmt(profitLoss?.expenses?.total || 0)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between pt-2 text-base font-bold text-harvics-burgundy border-t border-[#E8E0D4]">
                    <span>Net Income</span>
                    <span className="tabular-nums">{fmt(profitLoss?.netIncome || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'periods' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                Period close requires a balanced trial balance for that period. Closed periods block new postings and reversals until re-opened (controlled reopen — audit logged).
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 p-4 border border-[#E8E0D4] rounded-xl bg-[#FFFEF9]">
                <input className="px-3 py-2 text-sm border border-[#E8E0D4] rounded-md" placeholder="Name e.g. March 2026" value={periodForm.name} onChange={(e) => setPeriodForm({ ...periodForm, name: e.target.value })} />
                <input className="px-3 py-2 text-sm border border-[#E8E0D4] rounded-md" type="number" placeholder="Year" value={periodForm.year} onChange={(e) => setPeriodForm({ ...periodForm, year: e.target.value })} />
                <input className="px-3 py-2 text-sm border border-[#E8E0D4] rounded-md" type="number" min={1} max={12} placeholder="Month" value={periodForm.month} onChange={(e) => setPeriodForm({ ...periodForm, month: e.target.value })} />
                <button type="button" onClick={openPeriodAction} className="px-3 py-2 text-xs font-semibold bg-harvics-burgundy text-white rounded-md">Open period</button>
              </div>

              {periods.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#D9D0C4] px-6 py-12 text-center text-sm text-[#6B5E52]">No fiscal periods — open the current month to start posting.</div>
              ) : (
                <div className="overflow-x-auto border border-[#E8E0D4] rounded-xl bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E8E0D4] text-left text-[10px] uppercase tracking-wider text-[#6B5E52]">
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Control</th>
                      </tr>
                    </thead>
                    <tbody>
                      {periods.map((p) => (
                        <tr key={p.id} className="border-b border-[#F0EAE1]">
                          <td className="px-4 py-2.5 font-mono text-xs">{p.periodCode}</td>
                          <td className="px-4 py-2.5">{p.name}</td>
                          <td className="px-4 py-2.5">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${statusTone[p.status] || ''}`}>{p.status}</span>
                          </td>
                          <td className="px-4 py-2.5 text-right space-x-3">
                            {p.status === 'Open' && (
                              <button type="button" onClick={() => closePeriod(p.id)} className="text-xs font-semibold text-harvics-burgundy underline">
                                Hard close (TB must balance)
                              </button>
                            )}
                            {p.status === 'Closed' && (
                              <button type="button" onClick={() => reopenPeriod(p.id)} className="text-xs font-semibold text-[#6B5E52] underline">
                                Re-open (audited)
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
