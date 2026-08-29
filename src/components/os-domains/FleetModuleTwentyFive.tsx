'use client'

/**
 * Module #25 — Fleet Management
 * DoD: vehicles + trips + route opt via /api/wave4/vehicles|trips
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import OsSapAiPanel from '@/components/os/OsSapAiPanel'

type Tab = 'vehicles' | 'plan' | 'trips'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) (h as Record<string, string>).Authorization = `Bearer ${token}`
  return h
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { ...authHeaders(), ...(init?.headers || {}) } })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error || json?.issues?.[0]?.message || `HTTP ${res.status}`)
  return json
}

const SS: Record<string, string> = {
  Planned: '#666',
  Active: '#1565C0',
  Completed: '#2E7D32',
  Cancelled: '#B71C1C',
}

export default function FleetModuleTwentyFive() {
  const locale = useLocale()
  const [tab, setTab] = useState<Tab>('vehicles')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [vehs, setVehs] = useState<any[]>([])
  const [trips, setTrips] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [last, setLast] = useState<any>(null)
  const [vForm, setVForm] = useState({ plate: '', type: 'van', capacityKg: '1000', homeDepot: '', driver: '', fuelType: 'diesel' })
  const [tForm, setTForm] = useState({ vehicleId: '', driver: '', optimize: true, stopsText: '' })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [v, t, s] = await Promise.all([
        api('/api/wave4/vehicles'),
        api('/api/wave4/trips'),
        api('/api/wave4/fleet/summary').catch(() => ({ data: null })),
      ])
      setVehs(v.data || [])
      setTrips(t.data || [])
      setSummary(s.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load Module #25')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const addV = async () => {
    try {
      setError('')
      setMessage('')
      if (!vForm.plate) throw new Error('Plate required')
      await api('/api/wave4/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          plate: vForm.plate,
          type: vForm.type,
          capacityKg: Number(vForm.capacityKg) || 0,
          homeDepot: vForm.homeDepot || null,
          driver: vForm.driver || null,
          fuelType: vForm.fuelType || null,
        }),
      })
      setVForm((f) => ({ ...f, plate: '' }))
      setMessage('Vehicle added')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const setVehStatus = async (id: string, status: string) => {
    try {
      setError('')
      await api(`/api/wave4/vehicles/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) })
      setMessage(`Vehicle → ${status}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const plan = async () => {
    try {
      setError('')
      setMessage('')
      if (!tForm.vehicleId) throw new Error('Select a vehicle')
      const lines = tForm.stopsText.split('\n').map((l) => l.trim()).filter(Boolean)
      if (lines.length < 2) throw new Error('Need ≥2 stops: "label,lat,lng" per line')
      const stops = lines.map((line, i) => {
        const [address, lat, lng] = line.split(',').map((s) => s.trim())
        return { seq: i + 1, address, lat: +lat, lng: +lng }
      })
      if (stops.some((s) => !s.address || Number.isNaN(s.lat) || Number.isNaN(s.lng))) {
        throw new Error('Bad format. Use: address,lat,lng')
      }
      const r = await api('/api/wave4/trips', {
        method: 'POST',
        body: JSON.stringify({
          vehicleId: tForm.vehicleId,
          driver: tForm.driver || null,
          stops,
          optimize: tForm.optimize,
        }),
      })
      setLast(r)
      setMessage(`Trip planned · save ${r.optimization?.savingsKm ?? 0} km`)
      await load()
      setTab('trips')
    } catch (e: any) {
      setError(e.message)
    }
  }

  const tripAct = async (id: string, act: 'start' | 'complete' | 'cancel') => {
    try {
      setError('')
      await api(`/api/wave4/trips/${id}/${act}`, { method: 'POST', body: '{}' })
      setMessage(`Trip ${act}`)
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-5 p-5 text-harvics-burgundy">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">Module #25 · Logistics</p>
          <h3
            className="mt-1 text-2xl text-harvics-burgundy"
            
          >
            Fleet Management
          </h3>
          <p className="mt-1 max-w-[56ch] text-[13px] text-harvics-burgundy/60">
            Vehicles, nearest-neighbour trip planning, and Planned → Active → Completed workflow.
          </p>
        </div>
        <button type="button" onClick={() => void load()} className="border border-harvics-burgundy/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]">
          Refresh
        </button>
      </div>

      {error ? <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {message ? <div className="border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm">{message}</div> : null}

      <OsSapAiPanel
        title="Fleet coach"
        subtitle="Vehicle and trip exceptions for dispatch"
        endpoint="/api/intelligence/advise"
        body={{ domain: 'fleet' }}
        cta="Advise fleet"
      />


      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Vehicles', value: summary?.totalVehicles ?? vehs.length },
          { label: 'Active trips', value: summary?.activeTrips ?? trips.filter((t) => t.status === 'Active').length },
          { label: 'Completed', value: summary?.completedTrips ?? trips.filter((t) => t.status === 'Completed').length },
          { label: 'On-time', value: summary?.onTimeRate == null ? '—' : `${summary.onTimeRate}%` },
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
            ['vehicles', 'Vehicles'],
            ['plan', 'Plan trip'],
            ['trips', 'Trips'],
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

      {!loading && tab === 'vehicles' ? (
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Add vehicle</p>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Plate *" value={vForm.plate} onChange={(e) => setVForm((f) => ({ ...f, plate: e.target.value }))} />
            <select className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" value={vForm.type} onChange={(e) => setVForm((f) => ({ ...f, type: e.target.value }))}>
              {['van', 'truck', 'car', 'reefer'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" type="number" placeholder="Capacity kg" value={vForm.capacityKg} onChange={(e) => setVForm((f) => ({ ...f, capacityKg: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Home depot" value={vForm.homeDepot} onChange={(e) => setVForm((f) => ({ ...f, homeDepot: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Driver" value={vForm.driver} onChange={(e) => setVForm((f) => ({ ...f, driver: e.target.value }))} />
            <button type="button" onClick={() => void addV()} className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
              Add vehicle
            </button>
          </div>
          <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                  {['Plate', 'Type', 'Cap', 'Driver', 'Status', ''].map((h) => (
                    <th key={h || 'a'} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vehs.map((v, i) => (
                  <tr
                    key={v.id}
                    className={`cursor-pointer ${tForm.vehicleId === v.id ? 'bg-harvics-cream' : i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}`}
                    onClick={() => setTForm((f) => ({ ...f, vehicleId: v.id, driver: v.driver || '' }))}
                  >
                    <td className="px-3 py-2 font-mono font-semibold">
                      <Link href={`/${locale}/os/fleet/vehicles/${v.id}`} className="underline decoration-harvics-gold/50" onClick={(e) => e.stopPropagation()}>
                        {v.plate}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{v.type}</td>
                    <td className="px-3 py-2 font-mono">{v.capacityKg}kg</td>
                    <td className="px-3 py-2">{v.driver || '—'}</td>
                    <td className="px-3 py-2">{v.status}</td>
                    <td className="px-3 py-2">
                      <select
                        className="border border-harvics-burgundy/20 bg-white px-1 py-0.5 text-[10px]"
                        value={v.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => void setVehStatus(v.id, e.target.value)}
                      >
                        {['Available', 'InRoute', 'Maintenance', 'OffDuty'].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === 'plan' ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-3 border border-harvics-burgundy/15 bg-harvics-cream/40 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Plan trip</p>
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Vehicle ID (click row on Vehicles)" value={tForm.vehicleId} onChange={(e) => setTForm((f) => ({ ...f, vehicleId: e.target.value }))} />
            <input className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm" placeholder="Driver" value={tForm.driver} onChange={(e) => setTForm((f) => ({ ...f, driver: e.target.value }))} />
            <textarea
              className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 font-mono text-sm"
              rows={6}
              placeholder={`Depot, 25.276, 55.296\nCustomer A, 25.197, 55.274\nCustomer B, 25.246, 55.351`}
              value={tForm.stopsText}
              onChange={(e) => setTForm((f) => ({ ...f, stopsText: e.target.value }))}
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={tForm.optimize} onChange={(e) => setTForm((f) => ({ ...f, optimize: e.target.checked }))} />
              Optimize route (nearest-neighbour)
            </label>
            <button type="button" onClick={() => void plan()} className="w-full bg-harvics-burgundy px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream">
              Plan trip
            </button>
          </div>
          <div className="border border-harvics-burgundy/15 bg-white p-4 text-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Last optimization</p>
            {last?.optimization ? (
              <div className="mt-3 space-y-1">
                <div>Naive: <strong>{last.optimization.naiveKm} km</strong></div>
                <div>Optimized: <strong>{last.optimization.optimizedKm} km</strong></div>
                <div>
                  Savings: <strong className="text-green-800">{last.optimization.savingsKm} km ({last.optimization.percentSaved}%)</strong>
                </div>
                {last.data?.id ? (
                  <Link href={`/${locale}/os/fleet/trips/${last.data.id}`} className="mt-3 inline-block text-[10px] font-bold uppercase underline decoration-harvics-gold/50">
                    Open trip document →
                  </Link>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-harvics-burgundy/50">Plan a trip to see savings.</p>
            )}
          </div>
        </div>
      ) : null}

      {!loading && tab === 'trips' ? (
        <div className="overflow-x-auto border border-harvics-burgundy/15 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-harvics-burgundy text-left text-harvics-cream">
                {['Trip', 'Vehicle', 'Driver', 'Stops', 'Opt km', 'Save', 'Status', 'Act'].map((h) => (
                  <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-[0.12em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-harvics-burgundy/45">No trips yet.</td>
                </tr>
              ) : (
                trips.map((t, i) => (
                  <tr key={t.id} className={i % 2 ? 'bg-harvics-cream/40' : 'bg-white'}>
                    <td className="px-3 py-2 font-mono">
                      <Link href={`/${locale}/os/fleet/trips/${t.id}`} className="underline decoration-harvics-gold/50">
                        {t.id.slice(-8)}
                      </Link>
                    </td>
                    <td className="px-3 py-2 font-mono">{vehs.find((v) => v.id === t.vehicleId)?.plate || t.vehicleId.slice(-6)}</td>
                    <td className="px-3 py-2">{t.driver || '—'}</td>
                    <td className="px-3 py-2 font-mono">{Array.isArray(t.stops) ? t.stops.length : 0}</td>
                    <td className="px-3 py-2 font-mono">{t.optimizedKm} km</td>
                    <td className="px-3 py-2 font-mono font-semibold text-green-800">{t.savingsKm} km</td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: SS[t.status] || '#666' }}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 space-x-1">
                      {t.status === 'Planned' ? (
                        <>
                          <button type="button" onClick={() => void tripAct(t.id, 'start')} className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase">
                            Start
                          </button>
                          <button type="button" onClick={() => void tripAct(t.id, 'cancel')} className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase">
                            Cancel
                          </button>
                        </>
                      ) : null}
                      {t.status === 'Active' ? (
                        <>
                          <button type="button" onClick={() => void tripAct(t.id, 'complete')} className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase">
                            Complete
                          </button>
                          <button type="button" onClick={() => void tripAct(t.id, 'cancel')} className="border border-harvics-burgundy/25 px-2 py-0.5 text-[9px] font-bold uppercase">
                            Cancel
                          </button>
                        </>
                      ) : null}
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
