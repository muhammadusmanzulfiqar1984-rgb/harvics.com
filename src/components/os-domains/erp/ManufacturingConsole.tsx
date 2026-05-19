'use client'

import { useEffect, useState } from 'react'
import { ConsoleShell, Card, StatusBadge, inputCls, btnPrimary, btnGhost, btnDanger, api } from './_shell'

interface WorkOrder {
  id: string
  sku: string
  qty: number
  status: 'Draft' | 'InProgress' | 'Completed' | 'Cancelled'
  startDate: string
  completedAt?: string
}

interface InventoryItem {
  sku: string
  name: string
  qty: number
}

export default function ManufacturingConsole() {
  const [list, setList] = useState<WorkOrder[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ sku: 'FMCG-001', qty: '100' })

  const load = async () => {
    setLoading(true)
    const [w, i] = await Promise.all([
      api<WorkOrder[]>('/api/modules/demo/work-orders'),
      api<InventoryItem[]>('/api/modules/demo/inventory'),
    ])
    if (w.ok && w.data) setList(w.data)
    if (i.ok && i.data) setInventory(i.data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    if (!form.sku.trim() || !form.qty) {
      setMessage('SKU and qty required')
      return
    }
    const r = await api('/api/modules/demo/work-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sku: form.sku.trim(), qty: Number(form.qty) }),
    })
    setMessage(r.ok ? `WO opened for ${form.sku}` : r.error || 'Create failed')
    if (r.ok) {
      setForm({ ...form, qty: '100' })
      load()
    }
  }

  const complete = async (id: string) => {
    const r = await api(`/api/modules/demo/work-orders/${id}/complete`, { method: 'PATCH' })
    setMessage(r.ok ? `${id} completed → stock added` : r.error || 'Complete failed')
    if (r.ok) load()
  }

  const cancel = async (id: string) => {
    const r = await api(`/api/modules/demo/work-orders/${id}/cancel`, { method: 'PATCH' })
    if (r.ok) {
      setMessage(`${id} cancelled`)
      load()
    }
  }

  const inProgress = list.filter(w => w.status === 'InProgress').length
  const completed = list.filter(w => w.status === 'Completed').length
  const totalUnits = list.filter(w => w.status === 'InProgress').reduce((s, w) => s + w.qty, 0)
  const skus = Array.from(new Set(inventory.map(i => i.sku)))

  return (
    <ConsoleShell
      title="Manufacturing — Work Orders"
      subtitle="Open production runs. Completing a work order auto-adds units to inventory."
      kpis={[
        { label: 'Total Work Orders', value: list.length },
        { label: 'In Progress', value: inProgress, sub: `${totalUnits.toLocaleString()} units` },
        { label: 'Completed', value: completed },
        { label: 'Cancelled', value: list.filter(w => w.status === 'Cancelled').length },
      ]}
      message={message}
      onRefresh={load}
      loading={loading}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Open Work Order">
          <div className="grid gap-2">
            <select className={inputCls} value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })}>
              {skus.length === 0 ? <option value={form.sku}>{form.sku}</option> : skus.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input className={inputCls} type="number" placeholder="Qty to produce" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} />
            <button type="button" onClick={create} className={btnPrimary}>Open WO</button>
            <p className="text-[10px] text-[#5d5d5d]">Completing the WO will increment inventory for the selected SKU.</p>
          </div>
        </Card>

        <Card title="Production Pipeline">
          <div className="grid gap-1.5">
            {(['Draft', 'InProgress', 'Completed', 'Cancelled'] as const).map(stage => {
              const n = list.filter(w => w.status === stage).length
              const pct = list.length === 0 ? 0 : Math.round((n / list.length) * 100)
              return (
                <div key={stage} className="rounded-lg border border-[#e8e2d5] p-2">
                  <div className="flex items-center justify-between text-xs">
                    <StatusBadge status={stage} />
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

        <Card title="Work Orders" count={list.length}>
          <div className="grid max-h-96 gap-2 overflow-auto">
            {list.map(w => (
              <div key={w.id} className="rounded-lg border border-[#e8e2d5] p-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold">{w.id}</p>
                    <p className="text-[11px] text-[#5d5d5d]">{w.sku} · {w.qty.toLocaleString()} units</p>
                    <p className="text-[10px] text-[#5d5d5d]">Started {new Date(w.startDate).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={w.status} />
                </div>
                {w.status === 'InProgress' ? (
                  <div className="mt-2 flex gap-1">
                    <button type="button" onClick={() => complete(w.id)} className={btnPrimary}>Complete</button>
                    <button type="button" onClick={() => cancel(w.id)} className={btnDanger}>Cancel</button>
                  </div>
                ) : null}
              </div>
            ))}
            {list.length === 0 ? <p className="text-xs text-[#5d5d5d]">No work orders yet.</p> : null}
          </div>
        </Card>
      </div>
    </ConsoleShell>
  )
}
