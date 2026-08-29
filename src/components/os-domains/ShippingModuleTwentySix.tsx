'use client'

/**
 * Module #26 — Shipping & Freight (SAP+ workspace)
 * Tabs: Shipments · Track · Book
 * Status: Booked → InTransit|Exception · InTransit → Delivered|Exception · Exception → InTransit
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'shipments' | 'track' | 'book'

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

const SHIP_NEXT: Record<string, string[]> = {
  Booked: ['InTransit', 'Exception'],
  InTransit: ['Delivered', 'Exception'],
  Delivered: [],
  Exception: ['InTransit'],
}

const STATUS_LABEL: Record<string, string> = {
  InTransit: 'In transit',
  Exception: 'Exception',
  Delivered: 'Delivered',
  Booked: 'Booked',
}

export default function ShippingModuleTwentySix() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('shipments')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState<any[]>([])
  const [sel, setSel] = useState<string | null>(null)
  const [form, setForm] = useState({
    trackingNo: '',
    origin: '',
    destination: '',
    carrier: '',
    service: 'road',
    weightKg: '0',
  })
  const [evForm, setEvForm] = useState({ location: '', status: 'In Transit', description: '' })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api('/api/wave3/shipping/shipments')
      setRows(r.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #26')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const create = async () => {
    try {
      setError('')
      setMessage('')
      if (!form.trackingNo || !form.origin || !form.destination) throw new Error('Tracking, origin, destination required')
      const r = await api('/api/wave3/shipping/shipments', {
        method: 'POST',
        body: JSON.stringify({
          trackingNo: form.trackingNo,
          origin: form.origin,
          destination: form.destination,
          carrier: form.carrier || null,
          service: form.service,
          weightKg: Number(form.weightKg) || 0,
        }),
      })
      setForm({ trackingNo: '', origin: '', destination: '', carrier: '', service: 'road', weightKg: '0' })
      setMessage(`Shipment ${r.data?.trackingNo} booked`)
      await load()
      setTab('shipments')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const setStatus = async (id: string, status: string) => {
    try {
      setError('')
      setMessage('')
      await api(`/api/wave3/shipping/shipments/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      })
      setMessage(`Shipment → ${STATUS_LABEL[status] || status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const addEvent = async () => {
    try {
      setError('')
      setMessage('')
      if (!sel) throw new Error('Select a shipment')
      if (!evForm.location || !evForm.status) throw new Error('Location and status required')
      await api(`/api/wave3/shipping/shipments/${sel}/events`, {
        method: 'POST',
        body: JSON.stringify({
          location: evForm.location,
          status: evForm.status,
          description: evForm.description || null,
        }),
      })
      setEvForm({ location: '', status: 'In Transit', description: '' })
      setMessage('Tracking event added')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const selected = rows.find((r) => r.id === sel)

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #26 · Logistics</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Shipping & Freight
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            SAP+ book, track, and advance shipment status with events.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${locale}/os/import-export`}
            className="border border-harvics-burgundy/25 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
          >
            Trade
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

      <OsSapAiPanel
        title="Shipping coach"
        subtitle="Shipment status risk and freight exceptions"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'shipping' }}
        cta="Advise shipping"
      />


      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Shipments', value: rows.length },
          { label: 'Booked', value: rows.filter((r) => r.status === 'Booked').length },
          { label: 'In transit', value: rows.filter((r) => r.status === 'InTransit').length },
          { label: 'Delivered', value: rows.filter((r) => r.status === 'Delivered').length },
        ].map((k) => (
          <div key={k.label} className="border border-harvics-burgundy/15 bg-white p-3" style={{ borderTop: '3px solid var(--harvics-gold)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy/50">{k.label}</div>
            <div className="mt-1 font-mono text-lg font-semibold">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-harvics-burgundy/15 pb-2">
        {(
          [
            ['shipments', 'Shipments'],
            ['track', 'Track'],
            ['book', 'Book'],
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

      {!loading && tab === 'shipments' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Tracking', 'Lane', 'Carrier', 'Svc', 'Status', 'Act'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-harvics-burgundy/45">
                    No shipments yet. Open Book.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => {
                  const next = SHIP_NEXT[r.status] || []
                  return (
                    <tr key={r.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                      <td className="px-3 py-2 font-mono font-semibold">
                        <Link
                          href={`/${locale}/os/shipping-trade/${r.id}`}
                          className="underline decoration-harvics-gold/50 underline-offset-2"
                        >
                          {r.trackingNo}
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        {r.origin} → {r.destination}
                      </td>
                      <td className="px-3 py-2">{r.carrier || '—'}</td>
                      <td className="px-3 py-2">{r.service || '—'}</td>
                      <td className="px-3 py-2">{r.status}</td>
                      <td className="space-x-1 px-3 py-2">
                        <Link
                          href={`/${locale}/os/shipping-trade/${r.id}`}
                          className="border border-harvics-burgundy/20 px-2 py-0.5 text-[9px] font-bold uppercase"
                        >
                          Open
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setSel(r.id)
                            setTab('track')
                          }}
                          className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase"
                        >
                          Track
                        </button>
                        {next.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => void setStatus(r.id, s)}
                            className={`px-2 py-0.5 text-[9px] font-bold uppercase ${
                              s === 'Delivered'
                                ? 'border border-harvics-gold/50'
                                : 'border border-harvics-burgundy/25'
                            }`}
                          >
                            {STATUS_LABEL[s] || s}
                          </button>
                        ))}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && tab === 'track' ? (
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <div className="space-y-2 border border-harvics-burgundy/15 bg-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Select shipment</p>
            {rows.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSel(r.id)}
                className={`block w-full px-3 py-2 text-left text-sm ${
                  sel === r.id ? 'bg-harvics-burgundy text-harvics-cream' : 'border border-harvics-burgundy/15'
                }`}
              >
                <span className="font-mono font-semibold">{r.trackingNo}</span>
                <span className="ml-2 text-[11px] opacity-70">{r.status}</span>
              </button>
            ))}
          </div>
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Add tracking event</p>
            {!sel ? (
              <p className="text-sm text-harvics-burgundy/50">Select a shipment.</p>
            ) : (
              <>
                <p className="text-sm">
                  <Link
                    href={`/${locale}/os/shipping-trade/${sel}`}
                    className="font-mono font-semibold underline decoration-harvics-gold/50"
                  >
                    {selected?.trackingNo}
                  </Link>
                  <span className="ml-2 text-harvics-burgundy/60">{selected?.status}</span>
                </p>
                {(SHIP_NEXT[selected?.status || ''] || []).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(SHIP_NEXT[selected?.status || ''] || []).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => void setStatus(sel, s)}
                        className="border border-harvics-burgundy/30 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em]"
                      >
                        {STATUS_LABEL[s] || s}
                      </button>
                    ))}
                  </div>
                ) : null}
                <input
                  className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                  placeholder="Location *"
                  value={evForm.location}
                  onChange={(e) => setEvForm((f) => ({ ...f, location: e.target.value }))}
                />
                <input
                  className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                  placeholder="Status *"
                  value={evForm.status}
                  onChange={(e) => setEvForm((f) => ({ ...f, status: e.target.value }))}
                />
                <input
                  className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
                  placeholder="Description"
                  value={evForm.description}
                  onChange={(e) => setEvForm((f) => ({ ...f, description: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => void addEvent()}
                  className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
                >
                  Add event
                </button>
                <div className="max-h-56 overflow-y-auto border border-harvics-burgundy/10 bg-white">
                  {(selected?.events || []).length === 0 ? (
                    <p className="px-3 py-4 text-center text-sm text-harvics-burgundy/45">No events yet.</p>
                  ) : (
                    (selected?.events || []).map((e: any) => (
                      <div key={e.id} className="border-b border-harvics-burgundy/10 px-3 py-2 text-[12px]">
                        <strong>{e.status}</strong> · {e.location}
                        {e.description ? <span className="text-harvics-burgundy/50"> — {e.description}</span> : null}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {!loading && tab === 'book' ? (
        <div className="mx-auto max-w-md space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Book shipment</p>
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Tracking # *"
            value={form.trackingNo}
            onChange={(e) => setForm((f) => ({ ...f, trackingNo: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Origin *"
            value={form.origin}
            onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Destination *"
            value={form.destination}
            onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
          />
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Carrier"
            value={form.carrier}
            onChange={(e) => setForm((f) => ({ ...f, carrier: e.target.value }))}
          />
          <select
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            value={form.service}
            onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
          >
            <option value="air">air</option>
            <option value="sea">sea</option>
            <option value="road">road</option>
            <option value="rail">rail</option>
          </select>
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            type="number"
            placeholder="Weight kg"
            value={form.weightKg}
            onChange={(e) => setForm((f) => ({ ...f, weightKg: e.target.value }))}
          />
          <button
            type="button"
            onClick={() => void create()}
            className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
          >
            Book
          </button>
        </div>
      ) : null}
    </div>
  )
}
