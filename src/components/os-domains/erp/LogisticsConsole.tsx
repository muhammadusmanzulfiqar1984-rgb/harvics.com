'use client'

import { useEffect, useState } from 'react'
import { ConsoleShell, Card, StatusBadge, inputCls, btnPrimary, btnGhost, btnDanger, api } from './_shell'

interface Shipment {
  id: string
  orderId: string
  origin: string
  destination: string
  carrier: string
  status: 'Pending' | 'InTransit' | 'Delivered' | 'Returned'
  eta: string
  createdAt: string
}

const STATUSES: Shipment['status'][] = ['Pending', 'InTransit', 'Delivered', 'Returned']
const CARRIERS = ['Aramex', 'DHL', 'FedEx', 'TCS', 'Maersk', 'Local Fleet']

export default function LogisticsConsole() {
  const [list, setList] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ orderId: '', origin: 'Dubai-W1', destination: '', carrier: 'Aramex' })

  const load = async () => {
    setLoading(true)
    const r = await api<Shipment[]>('/api/modules/demo/shipments')
    if (r.ok && r.data) setList(r.data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    if (!form.orderId.trim() || !form.destination.trim()) {
      setMessage('Order ID and destination required')
      return
    }
    const r = await api('/api/modules/demo/shipments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setMessage(r.ok ? `Shipment created for ${form.orderId}` : r.error || 'Create failed')
    if (r.ok) {
      setForm({ ...form, orderId: '', destination: '' })
      load()
    }
  }

  const setStatus = async (id: string, status: Shipment['status']) => {
    const r = await api(`/api/modules/demo/shipments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setMessage(r.ok ? `${id} → ${status}` : r.error || 'Update failed')
    if (r.ok) load()
  }

  const remove = async (id: string) => {
    const r = await api(`/api/modules/demo/shipments/${id}`, { method: 'DELETE' })
    if (r.ok) {
      setMessage(`Removed ${id}`)
      load()
    }
  }

  const inTransit = list.filter(s => s.status === 'InTransit').length
  const delivered = list.filter(s => s.status === 'Delivered').length
  const pending = list.filter(s => s.status === 'Pending').length
  const onTimeRate = list.length === 0 ? 0 : Math.round((delivered / list.length) * 100)

  return (
    <ConsoleShell
      title="Logistics — Shipments"
      subtitle="Dispatch, transit, and delivery tracking. Shipments auto-create on every order."
      kpis={[
        { label: 'Total Shipments', value: list.length },
        { label: 'In Transit', value: inTransit },
        { label: 'Delivered', value: delivered, sub: `${onTimeRate}% completed` },
        { label: 'Pending Dispatch', value: pending },
      ]}
      message={message}
      onRefresh={load}
      loading={loading}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Create Shipment">
          <div className="grid gap-2">
            <input className={inputCls} placeholder="Order ID (e.g. demo-001)" value={form.orderId} onChange={e => setForm({ ...form, orderId: e.target.value })} />
            <input className={inputCls} placeholder="Origin warehouse" value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} />
            <input className={inputCls} placeholder="Destination city" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} />
            <select className={inputCls} value={form.carrier} onChange={e => setForm({ ...form, carrier: e.target.value })}>
              {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button type="button" onClick={create} className={btnPrimary}>Dispatch</button>
          </div>
        </Card>

        <Card title="Status Distribution">
          <div className="grid gap-1.5">
            {STATUSES.map(s => {
              const n = list.filter(x => x.status === s).length
              const pct = list.length === 0 ? 0 : Math.round((n / list.length) * 100)
              return (
                <div key={s} className="rounded-lg border border-[#e8e2d5] p-2">
                  <div className="flex items-center justify-between text-xs">
                    <StatusBadge status={s} />
                    <span className="font-mono font-bold">{n} · {pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#f0ead9]">
                    <div className="h-full rounded-full bg-[#6b1f2b]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card title="Active Shipments" count={list.length}>
          <div className="grid max-h-96 gap-2 overflow-auto">
            {list.map(s => (
              <div key={s.id} className="rounded-lg border border-[#e8e2d5] p-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold">{s.id}</p>
                    <p className="text-[11px] text-[#5d5d5d]">Order {s.orderId} · {s.carrier}</p>
                    <p className="text-[11px]">{s.origin} → <span className="font-bold">{s.destination}</span></p>
                    <p className="text-[10px] text-[#5d5d5d]">ETA {new Date(s.eta).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {STATUSES.filter(st => st !== s.status).map(st => (
                    <button key={st} type="button" onClick={() => setStatus(s.id, st)} className={btnGhost}>→ {st}</button>
                  ))}
                  <button type="button" onClick={() => remove(s.id)} className={`${btnDanger} ml-auto`}>×</button>
                </div>
              </div>
            ))}
            {list.length === 0 ? <p className="text-xs text-[#5d5d5d]">No shipments yet.</p> : null}
          </div>
        </Card>
      </div>
    </ConsoleShell>
  )
}
