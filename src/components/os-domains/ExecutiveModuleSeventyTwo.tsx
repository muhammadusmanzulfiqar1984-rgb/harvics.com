'use client'

/**
 * Module #72 — Executive Intelligence (SAP+ workspace)
 * Tabs: Dashboard · Goals · Snapshots
 * Workflow: active → achieved / at_risk / cancelled
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { OS, OsKpi, OsPanel, OsPieChart, OsAreaChart } from '@/components/os/charts/OsCharts'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'dashboard' | 'goals' | 'snapshots'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) (h as Record<string, string>).Authorization = `Bearer ${token}`
  return h
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { ...authHeaders(), ...(init?.headers || {}) }, cache: 'no-store' })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.success === false) throw new Error(json?.error || `HTTP ${res.status}`)
  return json
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

export default function ExecutiveModuleSeventyTwo() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [dash, setDash] = useState<any>(null)
  const [goals, setGoals] = useState<any[]>([])
  const [snapshots, setSnapshots] = useState<any[]>([])
  const [goalForm, setGoalForm] = useState({
    title: '',
    metric: '',
    targetValue: '',
    unit: 'USD',
    period: new Date().toISOString().slice(0, 7),
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [d, g, s] = await Promise.all([
        api('/api/executive/dashboard'),
        api('/api/executive/goals'),
        api('/api/executive/snapshots?limit=20'),
      ])
      setDash(d.data || d)
      setGoals(g.data || [])
      setSnapshots(s.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #72')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    const t = setInterval(() => void load(), 40000)
    return () => clearInterval(t)
  }, [load])

  const saveSnapshot = async () => {
    try {
      setError('')
      setMessage('')
      await api('/api/executive/snapshots', {
        method: 'POST',
        body: JSON.stringify({ period: new Date().toISOString().slice(0, 7), periodType: 'monthly' }),
      })
      setMessage('Board snapshot saved')
      await load()
      setTab('snapshots')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const createGoal = async () => {
    try {
      setError('')
      setMessage('')
      if (!goalForm.title || !goalForm.metric || !goalForm.targetValue) throw new Error('Title + metric + target required')
      await api('/api/executive/goals', {
        method: 'POST',
        body: JSON.stringify({
          title: goalForm.title,
          metric: goalForm.metric,
          targetValue: Number(goalForm.targetValue),
          unit: goalForm.unit,
          period: goalForm.period,
        }),
      })
      setGoalForm({ title: '', metric: '', targetValue: '', unit: 'USD', period: goalForm.period })
      setMessage('Goal created')
      await load()
      setTab('goals')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const setGoalStatus = async (id: string, status: string) => {
    try {
      setError('')
      setMessage('')
      await api(`/api/executive/goals/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      setMessage(`Goal → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const bumpProgress = async (g: any) => {
    try {
      await api(`/api/executive/goals/${g.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ currentValue: Math.min(g.targetValue, g.currentValue + g.targetValue * 0.1) }),
      })
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const kpis = dash?.kpis || {}
  const ar = dash?.arAging
    ? [
        { name: 'Current', value: dash.arAging.current || 0 },
        { name: '1–30', value: dash.arAging.d30 || 0 },
        { name: '31–60', value: dash.arAging.d60 || 0 },
        { name: '61–90', value: dash.arAging.d90 || 0 },
        { name: '90+', value: dash.arAging.d90plus || 0 },
      ]
    : []

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #72 · Analytics</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Executive Intelligence
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ live KPIs · goals workflow · board snapshots · audited.
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
        title="CEO brief AI"
        subtitle="Executive snapshot: at-risk goals, cash, and board narrative — beyond classic SAP SEM"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'executive', prompt: 'Produce a concise CEO brief: at-risk goals, latest snapshots, and three decisions needed this week.' }}
        cta="CEO brief"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Revenue', value: fmt(kpis.totalRevenue) },
          { label: 'Net profit', value: fmt(kpis.netProfit) },
          { label: 'Goals', value: goals.length },
          { label: 'Snapshots', value: snapshots.length },
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
            ['dashboard', 'Dashboard'],
            ['goals', 'Goals'],
            ['snapshots', 'Snapshots'],
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

      {!loading && tab === 'dashboard' ? (
        <OS>
          <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <OsKpi label="Cash" value={fmt(kpis.cashOnHand)} />
            <OsKpi label="Margin" value={kpis.profitMargin != null ? `${kpis.profitMargin}%` : '—'} />
            <OsKpi label="Orders" value={String(kpis.totalOrders ?? 0)} />
            <OsKpi label="Open leads" value={String(kpis.openLeads ?? 0)} />
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void saveSnapshot()}
              className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Save board snapshot
            </button>
            <a
              href="/api/executive/reports/summary"
              target="_blank"
              rel="noreferrer"
              className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
            >
              Report JSON
            </a>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <OsPanel title="A/R Aging">
              <OsPieChart data={ar} />
            </OsPanel>
            <OsPanel title="Order trend">
              <OsAreaChart data={dash?.orderTrend || []} />
            </OsPanel>
          </div>
          {dash?.alerts?.length > 0 ? (
            <OsPanel title="Alerts" className="mt-6">
              <ul className="space-y-2 text-sm">
                {dash.alerts.map((a: any) => (
                  <li key={a.id}>
                    <span className="text-harvics-burgundy/50">{a.domain}: </span>
                    {a.message}
                  </li>
                ))}
              </ul>
            </OsPanel>
          ) : null}
        </OS>
      ) : null}

      {!loading && tab === 'goals' ? (
        <div className="space-y-4">
          <div className="grid gap-2 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4 md:grid-cols-5">
            <input
              className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm"
              placeholder="Title *"
              value={goalForm.title}
              onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
            />
            <input
              className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm"
              placeholder="Metric *"
              value={goalForm.metric}
              onChange={(e) => setGoalForm({ ...goalForm, metric: e.target.value })}
            />
            <input
              type="number"
              className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm"
              placeholder="Target *"
              value={goalForm.targetValue}
              onChange={(e) => setGoalForm({ ...goalForm, targetValue: e.target.value })}
            />
            <input
              className="border border-harvics-burgundy/20 bg-white px-2 py-1.5 text-sm"
              placeholder="Period"
              value={goalForm.period}
              onChange={(e) => setGoalForm({ ...goalForm, period: e.target.value })}
            />
            <button
              type="button"
              onClick={() => void createGoal()}
              className="bg-harvics-burgundy px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Add goal
            </button>
          </div>
          <div className="overflow-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full border-collapse text-left text-[12px]">
              <thead>
                <tr className="bg-harvics-burgundy text-harvics-cream">
                  <th className="p-2">Title</th>
                  <th className="p-2">Progress</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Workflow</th>
                </tr>
              </thead>
              <tbody>
                {goals.map((g) => (
                  <tr key={g.id} className="border-b border-harvics-burgundy/10">
                    <td className="p-2">
                      <Link href={`/${locale}/os/executive/goals/${g.id}`} className="font-semibold underline">
                        {g.title}
                      </Link>
                      <div className="text-[10px] text-harvics-burgundy/50">{g.metric}</div>
                    </td>
                    <td className="p-2 font-mono">
                      {g.currentValue} / {g.targetValue} {g.unit}
                    </td>
                    <td className="p-2 font-semibold">{g.status}</td>
                    <td className="p-2 space-x-1">
                      <button
                        type="button"
                        onClick={() => void bumpProgress(g)}
                        className="border border-harvics-burgundy px-2 py-0.5 text-[9px] font-bold uppercase"
                      >
                        +10%
                      </button>
                      {['active', 'achieved', 'at_risk', 'cancelled'].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => void setGoalStatus(g.id, s)}
                          className={`px-2 py-0.5 text-[9px] font-bold uppercase ${
                            g.status === s
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
            {goals.length === 0 ? (
              <p className="py-8 text-center text-sm text-harvics-burgundy/50">No goals yet.</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {!loading && tab === 'snapshots' ? (
        <div className="overflow-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full border-collapse text-left text-[12px]">
            <thead>
              <tr className="bg-harvics-burgundy text-harvics-cream">
                <th className="p-2">Period</th>
                <th className="p-2">Type</th>
                <th className="p-2">Generated</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {snapshots.map((s) => (
                <tr key={s.id} className="border-b border-harvics-burgundy/10">
                  <td className="p-2 font-semibold">{s.period}</td>
                  <td className="p-2">{s.periodType}</td>
                  <td className="p-2 text-[11px]">{new Date(s.generatedAt).toLocaleString()}</td>
                  <td className="p-2">
                    <Link
                      href={`/${locale}/os/executive/snapshots/${s.id}`}
                      className="text-[10px] font-bold uppercase underline"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {snapshots.length === 0 ? (
            <p className="py-8 text-center text-sm text-harvics-burgundy/50">No board snapshots yet.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
