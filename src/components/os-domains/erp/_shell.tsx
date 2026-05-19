'use client'

import { ReactNode } from 'react'

export const STATUS_TONE: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700',
  OnLeave: 'bg-amber-100 text-amber-700',
  Terminated: 'bg-rose-100 text-rose-700',
  New: 'bg-slate-100 text-slate-700',
  Qualified: 'bg-sky-100 text-sky-700',
  Proposal: 'bg-amber-100 text-amber-700',
  Won: 'bg-emerald-100 text-emerald-700',
  Lost: 'bg-rose-100 text-rose-700',
  Pending: 'bg-amber-100 text-amber-700',
  InTransit: 'bg-sky-100 text-sky-700',
  Delivered: 'bg-emerald-100 text-emerald-700',
  Returned: 'bg-rose-100 text-rose-700',
  Draft: 'bg-slate-100 text-slate-700',
  InProgress: 'bg-sky-100 text-sky-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-rose-100 text-rose-700',
}

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_TONE[status] || 'bg-slate-100 text-slate-700'
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cls}`}>{status}</span>
}

export function ConsoleShell({
  title,
  subtitle,
  kpis,
  message,
  onRefresh,
  loading,
  children,
}: {
  title: string
  subtitle: string
  kpis?: Array<{ label: string; value: string | number; sub?: string }>
  message?: string
  onRefresh: () => void
  loading: boolean
  children: ReactNode
}) {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-[#c3a35e]/30 bg-[linear-gradient(140deg,#1f0f14_0%,#3d161f_45%,#5e1f2d_100%)] p-5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-sm text-white/75">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#f2dfb5]"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        {kpis && kpis.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            {kpis.map(k => (
              <div key={k.label} className="rounded-xl border border-[#c3a35e]/30 bg-white/10 p-3">
                <div className="text-[11px] uppercase tracking-[0.14em] text-white/70">{k.label}</div>
                <div className="font-mono text-2xl font-bold text-[#f2dfb5]">{k.value}</div>
                {k.sub ? <div className="text-xs text-white/70">{k.sub}</div> : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {message ? (
        <div className="rounded-xl border border-[#c3a35e]/40 bg-white px-4 py-2 text-xs text-[#5d5d5d] shadow-sm">
          {message}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export function Card({ title, count, children }: { title: string; count?: number | string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#e8e2d5] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold">{title}</h3>
        {count !== undefined ? <span className="text-xs text-[#5e5e5e]">{count}</span> : null}
      </div>
      {children}
    </div>
  )
}

export const inputCls = 'rounded-lg border border-[#d6d0c3] px-2 py-1.5 text-xs w-full'
export const btnPrimary = 'rounded-lg border border-[#6b1f2b] bg-[#6b1f2b] px-3 py-1.5 text-xs font-bold text-white'
export const btnGhost = 'rounded border border-[#d6d0c3] bg-white px-2 py-1 text-[10px] font-bold text-[#3a3a3a]'
export const btnDanger = 'rounded border border-[#d6d0c3] bg-white px-2 py-1 text-[10px] font-bold text-[#b42318]'

export async function api<T = any>(
  url: string,
  init?: RequestInit,
): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(url, init)
    const json = await res.json().catch(() => null)
    if (!res.ok || !json?.success) return { ok: false, error: json?.error || `HTTP ${res.status}` }
    return { ok: true, data: json.data ?? json }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}
