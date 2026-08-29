'use client'

/**
 * Module #10 — Sales & Distribution
 * DoD: channels, priority routing, delivery slots + status.
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'channels' | 'route' | 'slots' | 'orders'

const TYPES = ['direct', 'distributor', 'online', 'retail', 'wholesale'] as const
const SLOT_NEXT: Record<string, string[]> = {
  Scheduled: ['InTransit', 'Failed'],
  InTransit: ['Delivered', 'Failed'],
  Delivered: [],
  Failed: [],
}

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

export default function CommercialModuleTenSales() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('channels')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [channels, setChannels] = useState<any[]>([])
  const [slots, setSlots] = useState<any[]>([])
  const [salesOrders, setSalesOrders] = useState<any[]>([])
  const [routeResult, setRouteResult] = useState<any>(null)

  const [chForm, setChForm] = useState({
    code: '',
    name: '',
    type: 'direct',
    priority: '50',
    leadTimeDays: '2',
  })
  const [routeForm, setRouteForm] = useState({ customerType: 'direct', requestedBy: '' })
  const [slotForm, setSlotForm] = useState({
    orderId: '',
    channelCode: '',
    scheduledFor: '',
    windowStart: '09:00',
    windowEnd: '12:00',
    driver: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [c, s, so] = await Promise.all([
        api('/api/wave4/channels'),
        api('/api/wave4/delivery-slots'),
        api('/api/wave5/sales-orders?limit=50').catch(() => ({ data: [] })),
      ])
      setChannels(c.data || [])
      setSlots(s.data || [])
      setSalesOrders(so.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #10')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const seedChannels = async () => {
    try {
      setError('')
      setMessage('')
      const r = await api('/api/wave4/channels/seed-demo', { method: 'POST', body: '{}' })
      setMessage(`Sample channels +${(r.created || []).length}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const createChannel = async () => {
    try {
      setError('')
      setMessage('')
      await api('/api/wave4/channels', {
        method: 'POST',
        body: JSON.stringify({
          code: chForm.code,
          name: chForm.name,
          type: chForm.type,
          priority: Number(chForm.priority) || 50,
          leadTimeDays: Number(chForm.leadTimeDays) || 1,
        }),
      })
      setChForm({ code: '', name: '', type: 'direct', priority: '50', leadTimeDays: '2' })
      setMessage('Channel created')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const doRoute = async () => {
    try {
      setError('')
      setMessage('')
      const body: any = { customerType: routeForm.customerType }
      if (routeForm.requestedBy) body.requestedBy = routeForm.requestedBy
      const r = await api('/api/wave4/route-order', { method: 'POST', body: JSON.stringify(body) })
      setRouteResult(r)
      if (r.data?.picked) {
        setSlotForm((f) => ({ ...f, channelCode: r.data.picked.code }))
        setMessage(`Routed to ${r.data.picked.code}`)
      } else {
        setMessage(r.reason || 'No channel available')
      }
    } catch (e: any) {
      setError(e.message)
    }
  }

  const bookSlot = async () => {
    try {
      setError('')
      setMessage('')
      await api('/api/wave4/delivery-slots', {
        method: 'POST',
        body: JSON.stringify({
          orderId: slotForm.orderId || undefined,
          channelCode: slotForm.channelCode,
          scheduledFor: slotForm.scheduledFor,
          windowStart: slotForm.windowStart || undefined,
          windowEnd: slotForm.windowEnd || undefined,
          driver: slotForm.driver || undefined,
        }),
      })
      setSlotForm({
        orderId: '',
        channelCode: slotForm.channelCode,
        scheduledFor: '',
        windowStart: '09:00',
        windowEnd: '12:00',
        driver: '',
      })
      setMessage('Delivery slot booked')
      await load()
      setTab('slots')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const setSlotStatus = async (id: string, status: string) => {
    try {
      setError('')
      await api(`/api/wave4/delivery-slots/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      })
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const activeCount = channels.filter((c) => c.active).length
  const openSlots = slots.filter((s) => s.status === 'Scheduled' || s.status === 'InTransit').length

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #10 · Commercial</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Sales & Distribution
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            Channels, priority routing, delivery slots — after CRM quote acceptance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/${locale}/os/cpq`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            CPQ
          </Link>
          <button
            type="button"
            onClick={() => void seedChannels()}
            className="border border-harvics-gold/50 bg-harvics-cream px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Seed sample channels
          </button>
          <button
            type="button"
            onClick={() => void load()}
            className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      ) : null}
      {message ? (
        <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div>
      ) : null}

      <OsSapAiPanel
        title="Sales & distribution coach"
        subtitle="Channels, slots, and SO bottlenecks beyond static ATP"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'sales' }}
        cta="Advise sales"
      />


      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="border border-harvics-burgundy/15 bg-white p-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Channels</div>
          <div className="mt-1 font-mono text-lg font-semibold">{channels.length}</div>
        </div>
        <div className="border border-harvics-burgundy/15 bg-white p-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Active</div>
          <div className="mt-1 font-mono text-lg font-semibold">{activeCount}</div>
        </div>
        <div className="border border-harvics-burgundy/15 bg-white p-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Open slots</div>
          <div className="mt-1 font-mono text-lg font-semibold">{openSlots}</div>
        </div>
        <div className="border border-harvics-burgundy/15 bg-white p-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Sales orders</div>
          <div className="mt-1 font-mono text-lg font-semibold">{salesOrders.length}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['channels', 'Channels'],
            ['route', 'Route order'],
            ['slots', 'Delivery slots'],
            ['orders', 'Sales orders'],
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

      {!loading && tab === 'channels' ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">New channel</p>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Code *"
              value={chForm.code}
              onChange={(e) => setChForm((f) => ({ ...f, code: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Name *"
              value={chForm.name}
              onChange={(e) => setChForm((f) => ({ ...f, name: e.target.value }))}
            />
            <select
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={chForm.type}
              onChange={(e) => setChForm((f) => ({ ...f, type: e.target.value }))}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Priority (lower = prefer)"
              type="number"
              value={chForm.priority}
              onChange={(e) => setChForm((f) => ({ ...f, priority: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Lead time days"
              type="number"
              value={chForm.leadTimeDays}
              onChange={(e) => setChForm((f) => ({ ...f, leadTimeDays: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => void createChannel()}
              className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Add channel
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Code', 'Name', 'Type', 'Priority', 'Lead time', 'Active'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {channels.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">
                      No channels. Use Seed sample channels.
                    </td>
                  </tr>
                ) : (
                  channels.map((c, i) => (
                    <tr key={c.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono font-semibold">{c.code}</td>
                      <td className="px-3 py-2">{c.name}</td>
                      <td className="px-3 py-2">{c.type}</td>
                      <td className="px-3 py-2 font-mono">{c.priority}</td>
                      <td className="px-3 py-2">{c.leadTimeDays}d</td>
                      <td className="px-3 py-2">{c.active ? 'Yes' : 'No'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'route' ? (
        <div className="grid max-w-xl gap-4 border border-harvics-burgundy/15 bg-harvics-cream/40 p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Route by channel priority</p>
          <select
            className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            value={routeForm.customerType}
            onChange={(e) => setRouteForm((f) => ({ ...f, customerType: e.target.value }))}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            type="date"
            value={routeForm.requestedBy}
            onChange={(e) => setRouteForm((f) => ({ ...f, requestedBy: e.target.value }))}
          />
          <button
            type="button"
            onClick={() => void doRoute()}
            className="bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
          >
            Route order
          </button>
          {routeResult?.data?.picked ? (
            <div className="border-l-4 border-harvics-gold bg-white p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">Picked</div>
              <div className="mt-1 text-xl font-semibold">{routeResult.data.picked.name}</div>
              <div className="text-sm text-harvics-burgundy/70">
                {routeResult.data.picked.code} · {routeResult.data.picked.type} · priority{' '}
                {routeResult.data.picked.priority} · LT {routeResult.data.picked.leadTimeDays}d
              </div>
              {(routeResult.data.alternatives || []).length > 0 ? (
                <div className="mt-2 text-xs text-harvics-burgundy/50">
                  Alternatives: {routeResult.data.alternatives.map((a: any) => a.code).join(', ')}
                </div>
              ) : null}
            </div>
          ) : null}
          {routeResult && !routeResult.data ? (
            <div className="border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
              {routeResult.reason || 'No channel available'}
            </div>
          ) : null}
        </div>
      ) : null}

      {!loading && tab === 'slots' ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Book slot</p>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Order ID (optional)"
              value={slotForm.orderId}
              onChange={(e) => setSlotForm((f) => ({ ...f, orderId: e.target.value }))}
            />
            <select
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              value={slotForm.channelCode}
              onChange={(e) => setSlotForm((f) => ({ ...f, channelCode: e.target.value }))}
            >
              <option value="">Channel *</option>
              {channels.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              type="date"
              value={slotForm.scheduledFor}
              onChange={(e) => setSlotForm((f) => ({ ...f, scheduledFor: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                placeholder="From"
                value={slotForm.windowStart}
                onChange={(e) => setSlotForm((f) => ({ ...f, windowStart: e.target.value }))}
              />
              <input
                className="border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                placeholder="To"
                value={slotForm.windowEnd}
                onChange={(e) => setSlotForm((f) => ({ ...f, windowEnd: e.target.value }))}
              />
            </div>
            <input
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
              placeholder="Driver"
              value={slotForm.driver}
              onChange={(e) => setSlotForm((f) => ({ ...f, driver: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => void bookSlot()}
              className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Book slot
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Slot', 'Order', 'Channel', 'When', 'Window', 'Driver', 'Status'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slots.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-harvics-burgundy/45">
                      No delivery slots yet.
                    </td>
                  </tr>
                ) : (
                  slots.map((s, i) => (
                    <tr key={s.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono">
                        <Link
                          href={`/${locale}/os/sales-distribution/slots/${s.id}`}
                          className="underline decoration-harvics-gold/50 underline-offset-2"
                        >
                          {(s.id || '').slice(0, 8)}
                        </Link>
                      </td>
                      <td className="px-3 py-2 font-mono">{s.orderId || '—'}</td>
                      <td className="px-3 py-2 font-mono font-semibold">{s.channelCode}</td>
                      <td className="px-3 py-2">{s.scheduledFor ? new Date(s.scheduledFor).toLocaleDateString() : '—'}</td>
                      <td className="px-3 py-2">
                        {s.windowStart || '—'}–{s.windowEnd || '—'}
                      </td>
                      <td className="px-3 py-2">{s.driver || '—'}</td>
                      <td className="space-x-1 px-3 py-2">
                        <span className="mr-1">{s.status}</span>
                        {(SLOT_NEXT[s.status] || []).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => void setSlotStatus(s.id, st)}
                            className="border border-harvics-burgundy/25 px-1.5 py-0.5 text-[9px] font-bold uppercase"
                          >
                            {st}
                          </button>
                        ))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'orders' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Order', 'Customer', 'Total', 'Status', ''].map((h) => (
                  <th key={h || 'x'} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {salesOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No sales orders — accept a CPQ quote to create one.
                  </td>
                </tr>
              ) : (
                salesOrders.map((o, i) => (
                  <tr key={o.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 font-mono font-semibold">{o.orderNumber}</td>
                    <td className="px-3 py-2">{o.customerName}</td>
                    <td className="px-3 py-2 font-mono">{o.totalAmount}</td>
                    <td className="px-3 py-2">{o.status}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/${locale}/os/cpq/orders/${o.id}`}
                        className="border border-harvics-burgundy/25 px-2 py-1 text-[10px] font-bold uppercase"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
