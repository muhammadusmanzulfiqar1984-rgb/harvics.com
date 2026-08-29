'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

interface CreditLimitsContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

interface CustomerCredit {
  id: string
  customerId: string
  name: string
  limit: number
  used: number
  available: number
  currency: string
  riskLevel: 'low' | 'medium' | 'high'
  status: 'active' | 'hold'
}

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) (h as Record<string, string>).Authorization = `Bearer ${token}`
  return h
}

export default function CreditLimitsContent({ locale }: CreditLimitsContentProps) {
  const [credits, setCredits] = useState<CustomerCredit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const r = await fetch('/api/crm/credit-limits', { cache: 'no-store', headers: authHeaders() })
        const j = await r.json()
        if (!r.ok || j.success === false) throw new Error(j.error || `HTTP ${r.status}`)
        if (!cancelled) setCredits(j.data || [])
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load credit data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const totalExposure = credits.reduce((sum, c) => sum + c.used, 0)
  const totalLimit = credits.reduce((sum, c) => sum + c.limit, 0)
  const utilizationRate = totalLimit > 0 ? (totalExposure / totalLimit) * 100 : 0
  const highRiskCount = credits.filter((c) => c.riskLevel === 'high').length

  if (loading) return <div className="p-12 text-center text-harvics-burgundy/50">Loading credit limits…</div>
  if (error) return <div className="p-12 text-center text-red-600">{error}</div>

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-harvics-burgundy">Credit Control</h3>
          <p className="mt-1 text-sm text-harvics-burgundy/55">Live from CRM CreditLimit — CPQ puts orders on hold when exceeded.</p>
        </div>
        <Link
          href={`/${locale}/os/crm/customers`}
          className="border border-harvics-gold/40 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy"
        >
          Customer 360
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['Total exposure', `$${totalExposure.toLocaleString()}`],
          ['Utilization', `${utilizationRate.toFixed(1)}%`],
          ['High risk', String(highRiskCount)],
          ['On hold', String(credits.filter((c) => c.status === 'hold').length)],
        ].map(([label, val]) => (
          <div key={label} className="border border-harvics-gold/25 bg-white px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-harvics-burgundy/45">{label}</p>
            <p className="mt-1 font-mono text-lg font-semibold text-harvics-burgundy">{val}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto border border-harvics-gold/25 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-harvics-burgundy text-left text-harvics-cream">
              {['Customer', 'Limit', 'Used', 'Available', 'Risk', 'Status', ''].map((h) => (
                <th key={h || 'link'} className="px-4 py-3 text-[10px] uppercase tracking-[0.12em]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-harvics-gold/10">
            {credits.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-harvics-burgundy/45">
                  No credit limits yet — set them on Customer 360.
                </td>
              </tr>
            ) : (
              credits.map((c) => (
                <tr key={c.id} className="hover:bg-harvics-cream/40">
                  <td className="px-4 py-3 font-medium text-harvics-burgundy">{c.name}</td>
                  <td className="px-4 py-3 font-mono">
                    {c.currency} {c.limit.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono">{c.used.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-harvics-gold">{c.available.toLocaleString()}</td>
                  <td className="px-4 py-3 uppercase text-xs">{c.riskLevel}</td>
                  <td className="px-4 py-3">
                    {c.status === 'hold' ? (
                      <span className="font-bold text-red-700">HOLD</span>
                    ) : (
                      <span className="text-harvics-burgundy">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/${locale}/os/crm/customers/${c.customerId}`}
                      className="text-[11px] font-bold uppercase tracking-wider text-harvics-gold hover:underline"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
