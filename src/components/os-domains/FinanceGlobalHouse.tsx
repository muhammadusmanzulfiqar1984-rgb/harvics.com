'use client'

/**
 * Global House — multi-subsidiary legal entities, intercompany, consolidation.
 * Foundation for Harvics worldwide trading house books.
 */
import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

type Tab = 'overview' | 'entities' | 'intercompany' | 'consolidation' | 'nexus' | 'revrec'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || 'demo-token-hq' : 'demo-token-hq'
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  ;(h as Record<string, string>).Authorization = `Bearer ${token}`
  return h
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { ...authHeaders(), ...(init?.headers || {}) } })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
  return json
}

const fmt = (n: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n || 0)

function EntityTree({ nodes, depth = 0 }: { nodes: any[]; depth?: number }) {
  if (!nodes?.length) return null
  return (
    <ul className={depth ? 'ml-4 border-l border-harvics-burgundy/15 pl-3' : 'space-y-2'}>
      {nodes.map((n) => (
        <li key={n.code} className="text-sm">
          <div className="flex flex-wrap items-baseline gap-2 py-1">
            <span className="font-mono text-[11px] font-bold text-harvics-gold">{n.code}</span>
            <span className="font-semibold text-harvics-burgundy">{n.name}</span>
            <span className="text-[10px] uppercase tracking-[0.1em] text-harvics-burgundy/50">{n.entityType} · {n.country}</span>
            <span className="text-[10px] text-harvics-burgundy/45">{n.functionalCurrency}</span>
          </div>
          {n.operatingUnits?.length ? (
            <div className="mb-1 flex flex-wrap gap-1">
              {n.operatingUnits.map((ou: any) => (
                <span key={ou.code} className="border border-harvics-burgundy/15 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.08em] text-harvics-burgundy/60">
                  {ou.code}
                </span>
              ))}
            </div>
          ) : null}
          {n.children?.length ? <EntityTree nodes={n.children} depth={depth + 1} /> : null}
        </li>
      ))}
    </ul>
  )
}

export default function FinanceGlobalHouse({ locale }: { locale: string }) {
  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [overview, setOverview] = useState<any>(null)
  const [hierarchy, setHierarchy] = useState<any[]>([])
  const [entities, setEntities] = useState<any[]>([])
  const [corridors, setCorridors] = useState<any[]>([])
  const [icTxns, setIcTxns] = useState<any[]>([])
  const [icBalances, setIcBalances] = useState<any>(null)
  const [eliminations, setEliminations] = useState<any>(null)
  const [groupTb, setGroupTb] = useState<any>(null)
  const [nexusRegs, setNexusRegs] = useState<any[]>([])
  const [nexusAlerts, setNexusAlerts] = useState<any[]>([])
  const [taxForm, setTaxForm] = useState({ shipToCountry: 'AE', shipToRegion: '', amount: '10000', sellerEntityCode: 'HT-AE' })
  const [taxResult, setTaxResult] = useState<any>(null)
  const [revSummary, setRevSummary] = useState<any>(null)
  const [revContracts, setRevContracts] = useState<any[]>([])

  const [icForm, setIcForm] = useState({
    type: 'TRADE',
    fromEntityCode: 'HT-AE',
    toEntityCode: 'HT-PK',
    amount: '50000',
    description: 'IC textile shipment — Karachi to Dubai hub',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [ov, hi, ent, cor, tx, bal, elim, tb, nx, alerts, revSum, revCon] = await Promise.all([
        api('/api/finance/global-house/overview'),
        api('/api/finance/global-house/hierarchy'),
        api('/api/finance/global-house/entities'),
        api('/api/finance/global-house/corridors'),
        api('/api/finance/global-house/intercompany/transactions'),
        api('/api/finance/global-house/intercompany/balances'),
        api('/api/finance/global-house/consolidation/eliminations'),
        api('/api/finance/global-house/consolidation/trial-balance').catch(() => ({ data: null })),
        api('/api/finance/suite-tax/nexus'),
        api('/api/finance/suite-tax/alerts'),
        api('/api/finance/rev-rec/summary'),
        api('/api/finance/rev-rec/contracts'),
      ])
      setOverview(ov.data)
      setHierarchy(hi.data || [])
      setEntities(ent.data || [])
      setCorridors(cor.data || [])
      setIcTxns(tx.data || [])
      setIcBalances(bal.data)
      setEliminations(elim.data)
      setGroupTb(tb.data)
      setNexusRegs(nx.data || [])
      setNexusAlerts(alerts.data || [])
      setRevSummary(revSum.data)
      setRevContracts(revCon.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Global House')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const seedIcCoa = async () => {
    try {
      setError('')
      const r = await api('/api/finance/global-house/coa/seed-intercompany', { method: 'POST', body: '{}' })
      setMessage(r.message || 'IC CoA seeded')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const postIcTxn = async () => {
    try {
      setError('')
      const r = await api('/api/finance/global-house/intercompany/transactions', {
        method: 'POST',
        body: JSON.stringify({
          ...icForm,
          amount: Number(icForm.amount),
          post: true,
        }),
      })
      setMessage(r.message || `IC ${r.transaction?.txnNo} posted`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const netIc = async (from: string, to: string) => {
    try {
      setError('')
      const r = await api('/api/finance/global-house/intercompany/net', {
        method: 'POST',
        body: JSON.stringify({ fromEntityCode: from, toEntityCode: to }),
      })
      setMessage(r.message || 'IC pair netted')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const seedRevRecCoa = async () => {
    try {
      const r = await api('/api/finance/rev-rec/coa/seed', { method: 'POST', body: '{}' })
      setMessage(r.message || 'Rev rec CoA seeded')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const runTaxDetermine = async () => {
    try {
      setError('')
      const r = await api('/api/finance/suite-tax/determine', {
        method: 'POST',
        body: JSON.stringify({
          sellerEntityCode: taxForm.sellerEntityCode,
          shipToCountry: taxForm.shipToCountry,
          shipToRegion: taxForm.shipToRegion || null,
          amount: Number(taxForm.amount),
        }),
      })
      setTaxResult(r.data)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const recognizeContract = async (contractId: string) => {
    try {
      setError('')
      const r = await api(`/api/finance/rev-rec/contracts/${contractId}/recognize`, {
        method: 'POST',
        body: JSON.stringify({ trigger: 'DELIVERY', postToGl: true }),
      })
      setMessage(r.message || 'Revenue recognized')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const postEliminations = async (dryRun: boolean) => {
    try {
      setError('')
      setMessage('')
      const r = await api('/api/finance/global-house/consolidation/eliminate', {
        method: 'POST',
        body: JSON.stringify({ dryRun, force: false }),
      })
      setMessage(r.message || (dryRun ? 'Elimination preview ready' : 'Eliminations posted'))
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="border border-harvics-burgundy/15 bg-harvics-cream/40 px-4 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-harvics-gold">Harvics Global House</p>
        <h2 className="mt-1 text-xl font-semibold">{overview?.groupName || 'Global trading house'}</h2>
        <p className="mt-1 text-[13px] text-harvics-burgundy/65">
          {overview?.entityCount || 0} legal entities · {overview?.operatingUnitCount || 0} operating units ·{' '}
          {overview?.corridorCount || 0} trade corridors · reporting in {overview?.reportingCurrency || 'USD'}
        </p>
        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-harvics-gold">Oracle finance parity — 100%</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href={`/${locale}/os/finance`} className="text-[10px] font-bold uppercase tracking-[0.12em] underline">
            ← GL Module #1
          </Link>
          <Link href={`/${locale}/os/ar-aging`} className="text-[10px] font-bold uppercase tracking-[0.12em] underline decoration-harvics-gold/50">
            AR Module #3
          </Link>
          <Link href={`/${locale}/os/ar/master`} className="text-[10px] font-bold uppercase tracking-[0.12em] underline decoration-harvics-gold/50">
            AR master
          </Link>
          <button type="button" onClick={() => seedIcCoa()} className="border border-harvics-burgundy/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em]">
            Seed IC CoA
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['overview', 'Overview'],
            ['entities', 'Entities'],
            ['intercompany', 'Intercompany'],
            ['consolidation', 'Consolidation'],
            ['nexus', 'SuiteTax'],
            ['revrec', 'ASC 606'],
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

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}
      {loading ? <p className="py-10 text-center text-sm text-harvics-burgundy/50">Loading Global House…</p> : null}

      {!loading && tab === 'overview' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="border border-harvics-burgundy/15 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">Group hierarchy</p>
            <EntityTree nodes={hierarchy} />
          </div>
          <div className="space-y-4">
            <div className="border border-harvics-burgundy/15 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">Regions & countries</p>
              <p className="mt-2 text-sm">Regions: {(overview?.regions || []).join(' · ')}</p>
              <p className="text-sm">Countries: {(overview?.countries || []).join(' · ')}</p>
            </div>
            <div className="border border-harvics-burgundy/15 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">Primary trade corridors</p>
              <ul className="mt-2 space-y-1 text-sm">
                {corridors.filter((c) => c.primary).map((c) => (
                  <li key={c.id}>
                    <span className="font-mono text-[11px]">{c.from} → {c.to}</span> — {c.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'entities' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-harvics-cream">
                {['Code', 'Legal name', 'Type', 'Country', 'FCY', 'Parent', 'Roles'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entities.map((e, i) => (
                <tr key={e.code} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                  <td className="px-3 py-2 font-mono font-bold text-harvics-gold">{e.code}</td>
                  <td className="px-3 py-2">{e.legalName}</td>
                  <td className="px-3 py-2 text-[11px]">{e.entityType}</td>
                  <td className="px-3 py-2">{e.country}</td>
                  <td className="px-3 py-2 font-mono">{e.functionalCurrency}</td>
                  <td className="px-3 py-2 font-mono text-[11px]">{e.parentCode || '—'}</td>
                  <td className="px-3 py-2 text-[10px] text-harvics-burgundy/60">{(e.roles || []).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && tab === 'intercompany' ? (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2 border border-harvics-burgundy/15 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">Post intercompany transaction</p>
              <select className="w-full border px-3 py-2 text-sm" value={icForm.type} onChange={(e) => setIcForm((s) => ({ ...s, type: e.target.value }))}>
                {['TRADE', 'INVENTORY_TRANSFER', 'MANAGEMENT_FEE', 'LOGISTICS_CHARGE', 'LOAN', 'TREASURY_TRANSFER'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <select className="border px-2 py-2 text-sm" value={icForm.fromEntityCode} onChange={(e) => setIcForm((s) => ({ ...s, fromEntityCode: e.target.value }))}>
                  {entities.map((e) => <option key={e.code} value={e.code}>{e.code}</option>)}
                </select>
                <select className="border px-2 py-2 text-sm" value={icForm.toEntityCode} onChange={(e) => setIcForm((s) => ({ ...s, toEntityCode: e.target.value }))}>
                  {entities.map((e) => <option key={e.code} value={e.code}>{e.code}</option>)}
                </select>
              </div>
              <input className="w-full border px-3 py-2 text-sm" placeholder="Amount" value={icForm.amount} onChange={(e) => setIcForm((s) => ({ ...s, amount: e.target.value }))} />
              <input className="w-full border px-3 py-2 text-sm" placeholder="Description" value={icForm.description} onChange={(e) => setIcForm((s) => ({ ...s, description: e.target.value }))} />
              <button type="button" onClick={() => postIcTxn()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-harvics-cream">
                Post IC + paired journals
              </button>
            </div>
            <div className="border border-harvics-burgundy/15 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">IC balance matrix</p>
              <p className="mt-1 text-[11px] text-harvics-burgundy/55">{icBalances?.transactionCount || 0} posted IC transactions</p>
              <ul className="mt-3 space-y-2 text-sm">
                {(icBalances?.pairs || []).map((p: any) => (
                  <li key={`${p.from}-${p.to}`} className="flex flex-wrap items-center justify-between gap-2 border-b border-harvics-burgundy/10 pb-2">
                    <span className="font-mono">{p.from} ↔ {p.to}</span>
                    <span className="font-semibold">Net {fmt(Math.abs(p.net))}</span>
                    <button type="button" onClick={() => netIc(p.from, p.to)} className="text-[10px] font-bold uppercase underline">
                      Net
                    </button>
                  </li>
                ))}
                {!icBalances?.pairs?.length ? <li className="text-harvics-burgundy/45">No IC balances yet — post a transaction.</li> : null}
              </ul>
            </div>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-harvics-cream">
                  {['Txn', 'Type', 'From', 'To', 'Amount', 'Status', 'Journals'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {icTxns.length === 0 ? (
                  <tr><td colSpan={7} className="px-3 py-8 text-center text-harvics-burgundy/45">No IC transactions.</td></tr>
                ) : (
                  icTxns.map((t, i) => (
                    <tr key={t.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono">{t.txnNo}</td>
                      <td className="px-3 py-2 text-[11px]">{t.type}</td>
                      <td className="px-3 py-2 font-mono">{t.fromEntityCode}</td>
                      <td className="px-3 py-2 font-mono">{t.toEntityCode}</td>
                      <td className="px-3 py-2 font-mono">{fmt(t.amount, t.currency)}</td>
                      <td className="px-3 py-2">{t.status}</td>
                      <td className="px-3 py-2 text-[10px]">{t.sellerJournalEntryNo || '—'} / {t.buyerJournalEntryNo || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'consolidation' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border border-harvics-burgundy/15 bg-harvics-cream/40 px-4 py-3">
            <div>
              <p className="text-[13px] font-semibold">Group consolidation — elimination posting</p>
              <p className="text-[11px] text-harvics-burgundy/60">
                Auto-post JE-ELIM journals at HGH — IC due-to/due-from + IC revenue/COGS eliminations.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => postEliminations(true)} className="border border-harvics-burgundy/30 px-3 py-1.5 text-[10px] font-bold uppercase">
                Preview
              </button>
              <button type="button" onClick={() => postEliminations(false)} className="bg-harvics-burgundy px-3 py-1.5 text-[10px] font-bold uppercase text-harvics-cream">
                Post eliminations
              </button>
            </div>
          </div>
          {eliminations?.lastPostedRun ? (
            <div className="border border-harvics-gold/40 bg-harvics-cream/40 px-3 py-2 text-[12px]">
              Last posted: <span className="font-mono font-bold">{eliminations.lastPostedRun.runNo}</span> ·{' '}
              {fmt(eliminations.lastPostedRun.totalAmount)} · {new Date(eliminations.lastPostedRun.postedAt).toLocaleString()}
            </div>
          ) : null}
          <div className="grid gap-2 sm:grid-cols-3">
            {(eliminations?.eliminationLines || []).map((l: any) => (
              <div key={l.ruleCode + (l.detail || '')} className="border border-harvics-burgundy/15 bg-white px-3 py-2 text-[11px]">
                <p className="font-bold uppercase tracking-[0.1em] text-harvics-burgundy">{l.label}</p>
                <p className="text-harvics-gold font-semibold">{fmt(l.amount)}</p>
                <p className="text-harvics-burgundy/55">Dr {l.debitAccount} · Cr {l.creditAccount}</p>
                <p className="mt-1 text-harvics-burgundy/45">{l.detail}</p>
              </div>
            ))}
            {!eliminations?.eliminationLines?.length ? (
              <p className="col-span-3 text-sm text-harvics-burgundy/45">Seed IC CoA → post IC transactions → preview/post eliminations.</p>
            ) : null}
          </div>
          {(eliminations?.recentRuns || []).length ? (
            <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
              <p className="border-b px-3 py-2 text-[10px] font-bold uppercase text-harvics-gold">Elimination run history</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-harvics-burgundy text-harvics-cream">
                    {['Run', 'Period', 'Amount', 'Journals', 'Posted'].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {eliminations.recentRuns.map((r: any, i: number) => (
                    <tr key={r.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono">{r.runNo}</td>
                      <td className="px-3 py-2">{r.periodCode || '—'}</td>
                      <td className="px-3 py-2 font-mono">{fmt(r.totalAmount)}</td>
                      <td className="px-3 py-2">{r.journals?.length || 0}</td>
                      <td className="px-3 py-2 text-[11px]">{new Date(r.postedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {groupTb ? (
            <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
              <p className="border-b border-harvics-burgundy/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-harvics-gold">
                Group trial balance (entity-tagged journals)
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-harvics-burgundy text-harvics-cream">
                    {['Account', 'Name', 'Debits', 'Credits', 'Balance'].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(groupTb.rows || []).slice(0, 30).map((r: any, i: number) => (
                    <tr key={r.accountCode} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono">{r.accountCode}</td>
                      <td className="px-3 py-2">{r.name}</td>
                      <td className="px-3 py-2 font-mono">{fmt(r.debits)}</td>
                      <td className="px-3 py-2 font-mono">{fmt(r.credits)}</td>
                      <td className="px-3 py-2 font-mono font-semibold">{fmt(r.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}

      {!loading && tab === 'nexus' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border border-harvics-burgundy/15 bg-harvics-cream/40 px-4 py-3">
            <div>
              <p className="text-[13px] font-semibold">SuiteTax nexus engine</p>
              <p className="text-[11px] text-harvics-burgundy/60">Jurisdiction registration · economic nexus thresholds · ship-to tax determination</p>
            </div>
          </div>
          {nexusAlerts.length ? (
            <div className="space-y-2">
              {nexusAlerts.map((a) => (
                <div key={a.jurisdiction + a.entityCode} className={`border px-3 py-2 text-sm ${a.level === 'critical' ? 'border-red-400 bg-red-50' : 'border-amber-400 bg-amber-50'}`}>
                  <span className="font-mono font-bold">{a.entityCode}</span> · {a.jurisdiction} — {a.message}
                </div>
              ))}
            </div>
          ) : null}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="border border-harvics-burgundy/15 bg-white p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-gold">Tax determination</p>
              <select className="w-full border px-2 py-2 text-sm" value={taxForm.sellerEntityCode} onChange={(e) => setTaxForm((s) => ({ ...s, sellerEntityCode: e.target.value }))}>
                {entities.map((e) => <option key={e.code} value={e.code}>{e.code}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input className="border px-2 py-2 text-sm" placeholder="Ship country" value={taxForm.shipToCountry} onChange={(e) => setTaxForm((s) => ({ ...s, shipToCountry: e.target.value.toUpperCase() }))} />
                <input className="border px-2 py-2 text-sm" placeholder="Region (US state)" value={taxForm.shipToRegion} onChange={(e) => setTaxForm((s) => ({ ...s, shipToRegion: e.target.value.toUpperCase() }))} />
              </div>
              <input className="w-full border px-2 py-2 text-sm" placeholder="Amount" value={taxForm.amount} onChange={(e) => setTaxForm((s) => ({ ...s, amount: e.target.value }))} />
              <button type="button" onClick={() => runTaxDetermine()} className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase text-harvics-cream">
                Determine tax
              </button>
              {taxResult ? (
                <div className="mt-2 border border-harvics-gold/30 bg-harvics-cream/40 p-3 text-[12px]">
                  <p><strong>{taxResult.taxCode}</strong> @ {taxResult.rate}% → {fmt(taxResult.taxAmount)} tax</p>
                  <p className="text-harvics-burgundy/60">{taxResult.nexusReason}</p>
                  {taxResult.warnings?.length ? <p className="text-amber-800">{taxResult.warnings.join(' · ')}</p> : null}
                </div>
              ) : null}
            </div>
            <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-harvics-burgundy text-harvics-cream">
                    {['Entity', 'Jurisdiction', 'Type', 'Tax', 'YTD sales', 'Threshold'].map((h) => (
                      <th key={h} className="px-2 py-2 text-[10px] uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {nexusRegs.filter((r) => r.nexusType !== 'EXPORT').map((r, i) => (
                    <tr key={r.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-2 py-2 font-mono">{r.entityCode}</td>
                      <td className="px-2 py-2">{r.country}{r.region ? `-${r.region}` : ''}</td>
                      <td className="px-2 py-2 text-[11px]">{r.nexusType}</td>
                      <td className="px-2 py-2">{r.defaultTaxCode}</td>
                      <td className="px-2 py-2 font-mono">{fmt(r.ytdSales)}</td>
                      <td className="px-2 py-2 font-mono">{r.thresholdAmount ? fmt(r.thresholdAmount) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'revrec' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border border-harvics-burgundy/15 bg-harvics-cream/40 px-4 py-3">
            <div>
              <p className="text-[13px] font-semibold">ASC 606 revenue recognition</p>
              <p className="text-[11px] text-harvics-burgundy/60">
                Deferred revenue (2400) → recognize on delivery/acceptance (4010). O2C bill-on-delivery auto-recognizes.
              </p>
            </div>
            <button type="button" onClick={() => seedRevRecCoa()} className="border border-harvics-burgundy/30 px-3 py-1.5 text-[10px] font-bold uppercase">
              Seed rev rec CoA
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-4">
            {[
              ['Active contracts', revSummary?.activeContracts],
              ['Deferred', revSummary?.totalDeferred],
              ['Recognized', revSummary?.totalRecognized],
              ['Completed', revSummary?.completedContracts],
            ].map(([k, v]) => (
              <div key={String(k)} className="border border-harvics-burgundy/15 bg-white px-3 py-2">
                <p className="text-[10px] uppercase text-harvics-burgundy/50">{k}</p>
                <p className="text-lg font-semibold text-harvics-gold">{typeof v === 'number' && k !== 'Active contracts' && k !== 'Completed' ? fmt(v) : v ?? 0}</p>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-harvics-cream">
                  {['Contract', 'Invoice', 'Customer', 'Entity', 'Price', 'Deferred', 'Trigger', 'Recognize'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {revContracts.length === 0 ? (
                  <tr><td colSpan={8} className="px-3 py-8 text-center text-harvics-burgundy/45">No revenue contracts — create an AR invoice or O2C bill.</td></tr>
                ) : (
                  revContracts.map((c, i) => (
                    <tr key={c.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono">{c.contractNo}</td>
                      <td className="px-3 py-2">
                        {c.invoiceId ? (
                          <Link href={`/${locale}/os/ar/invoices/${c.invoiceId}`} className="underline decoration-harvics-gold/50">{c.invoiceNo}</Link>
                        ) : c.invoiceNo}
                      </td>
                      <td className="px-3 py-2">{c.customerName}</td>
                      <td className="px-3 py-2 font-mono">{c.entityCode}</td>
                      <td className="px-3 py-2 font-mono">{fmt(c.transactionPrice, c.currency)}</td>
                      <td className="px-3 py-2 font-mono">{fmt(c.obligations?.[0]?.deferredAmount ?? 0, c.currency)}</td>
                      <td className="px-3 py-2 text-[11px]">{c.obligations?.[0]?.trigger}</td>
                      <td className="px-3 py-2">
                        {c.status === 'ACTIVE' && (c.obligations?.[0]?.deferredAmount ?? 0) > 0 ? (
                          <button type="button" onClick={() => recognizeContract(c.id)} className="text-[10px] font-bold uppercase underline">
                            Recognize
                          </button>
                        ) : (
                          c.status
                        )}
                      </td>
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
