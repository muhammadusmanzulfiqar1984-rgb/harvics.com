'use client'

import React from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import RouteListContent from '@/components/domains/logistics/RouteListContent'
import ActiveVehiclesContent from '@/components/domains/logistics/ActiveVehiclesContent'
import DeliveryQueueContent from '@/components/domains/logistics/DeliveryQueueContent'
import PendingReturnsContent from '@/components/domains/logistics/PendingReturnsContent'
import { LogisticsAnalyticsCharts } from '@/components/os-domains/DomainAnalyticsCharts'

interface LogisticsDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function LogisticsDomainContent({ persona, locale }: LogisticsDomainContentProps) {
  // Tier 2 Modules for Logistics Domain
  const tier2Modules: Tier2Module[] = [
    {
      id: 'route-planning',
      label: 'Route Planning',
      icon: '️',
      description: 'AI-powered route optimization and territory management',
      component: (
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-black mb-2">
              ️ Route Planning
            </h3>
            <p className="text-black">AI-powered route optimization and territory management</p>
          </div>
        </div>
      ),
      tier3Screens: [
        {
          id: 'route-list',
          label: 'Route List',
          icon: '',
          component: <RouteListContent persona={persona} locale={locale} />
        },
        {
          id: 'route-optimization',
          label: 'Route Optimization',
          icon: '',
          component: (
            <div className="p-6 space-y-6">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">AI Route Optimization</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[{ label: 'Fuel Saved', value: '18%' }, { label: 'Distance Reduced', value: '24 km/day' }, { label: 'Time Saved', value: '2.4 hr/route' }, { label: 'CO₂ Reduction', value: '12 tonnes/mo' }].map(s => (
                  <div key={s.label} className="bg-[#F5F5F7] p-4" style={{ borderRadius: 0 }}>
                    <div className="text-xl font-semibold text-[#1A1A1A]">{s.value}</div>
                    <div className="text-xs text-[#8E8E93] mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Route</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Old Dist (km)</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Optimized (km)</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Saving</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Stops</th></tr></thead>
                  <tbody>
                    {[{ route: 'Dubai North A', old: 148, opt: 112, stops: 18 }, { route: 'Dubai South B', old: 162, opt: 124, stops: 22 }, { route: 'Sharjah Loop', old: 95, opt: 78, stops: 14 }, { route: 'Abu Dhabi Central', old: 210, opt: 168, stops: 26 }].map((r, i) => (
                      <tr key={r.route} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{r.route}</td>
                        <td className="px-4 py-3 text-right text-[#8E8E93] line-through">{r.old}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#1A1A1A]">{r.opt}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#1A1A1A]">-{r.old - r.opt} km</td>
                        <td className="px-4 py-3 text-right">{r.stops}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        },
        {
          id: 'route-analytics',
          label: 'Route Analytics',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Route Performance Analytics</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Route</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">On-Time %</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Avg Duration</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Deliveries/Day</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Fuel Cost</th></tr></thead>
                  <tbody>
                    {[{ route: 'Dubai North A', ot: 96, dur: '5h 20m', del: 18, fuel: 'AED 84' }, { route: 'Dubai South B', ot: 91, dur: '6h 10m', del: 22, fuel: 'AED 96' }, { route: 'Sharjah Loop', ot: 98, dur: '4h 00m', del: 14, fuel: 'AED 62' }, { route: 'Abu Dhabi Central', ot: 88, dur: '7h 30m', del: 26, fuel: 'AED 118' }].map((r, i) => (
                      <tr key={r.route} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{r.route}</td>
                        <td className="px-4 py-3 text-right font-semibold">{r.ot}%</td>
                        <td className="px-4 py-3 text-right">{r.dur}</td>
                        <td className="px-4 py-3 text-right">{r.del}</td>
                        <td className="px-4 py-3 text-right">{r.fuel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'fleet-tracking',
      label: 'Fleet & Vehicle Tracking',
      icon: '',
      description: 'Real-time GPS tracking, vehicle management, and driver monitoring',
      tier3Screens: [
        {
          id: 'active-vehicles',
          label: 'Active Vehicles',
          icon: '',
          component: <ActiveVehiclesContent persona={persona} locale={locale} />
        },
        {
          id: 'vehicle-status',
          label: 'Vehicle Status',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Fleet Vehicle Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[{ label: 'Total Vehicles', value: '42' }, { label: 'On Route', value: '28' }, { label: 'In Maintenance', value: '4' }, { label: 'Available', value: '10' }].map(s => (
                  <div key={s.label} className="bg-[#F5F5F7] p-4" style={{ borderRadius: 0 }}>
                    <div className="text-xl font-semibold text-[#1A1A1A]">{s.value}</div>
                    <div className="text-xs text-[#8E8E93] mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Vehicle</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Driver</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Mileage</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Next Service</th><th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Status</th></tr></thead>
                  <tbody>
                    {[{ veh: 'DXB-TRK-001', driver: 'Hamdan Ali', km: 48200, service: '2026-04-15', status: 'On Route' }, { veh: 'DXB-TRK-002', driver: 'Majid Hassan', km: 62400, service: '2026-03-30', status: 'On Route' }, { veh: 'AUH-VAN-001', driver: 'Saeed Ibrahim', km: 31800, service: '2026-05-10', status: 'Available' }, { veh: 'SHJ-TRK-001', driver: '—', km: 78900, service: '2026-03-25', status: 'Maintenance' }].map((v, i) => (
                      <tr key={v.veh} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1A1A1A]">{v.veh}</td>
                        <td className="px-4 py-3">{v.driver}</td>
                        <td className="px-4 py-3 text-right">{v.km.toLocaleString()} km</td>
                        <td className="px-4 py-3 text-xs">{v.service}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${v.status === 'On Route' ? 'bg-[#1A1A1A] text-white' : v.status === 'Maintenance' ? 'bg-[#6B1F2B] text-white' : 'bg-[#F5F5F7] text-[#8E8E93]'}`} style={{ borderRadius: 0 }}>{v.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        },
        {
          id: 'gps-map',
          label: 'GPS Map View',
          icon: '️',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Live GPS — Vehicle Positions</h3>
              <div className="bg-[#F5F5F7] border-2 border-dashed border-[#E5E5EA]/40 h-56 flex items-center justify-center" style={{ borderRadius: 0 }}>
                <div className="text-center">
                  <div className="text-3xl mb-2">️</div>
                  <div className="font-semibold text-[#1A1A1A]">28 vehicles tracked live</div>
                  <div className="text-sm text-[#8E8E93] mt-1">Coverage: Dubai, Abu Dhabi, Sharjah</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Vehicle</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Last Location</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Speed</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Updated</th></tr></thead>
                  <tbody>
                    {[{ veh: 'DXB-TRK-001', loc: 'Al Quoz Industrial, Dubai', speed: '42 km/h', time: '1 min ago' }, { veh: 'DXB-TRK-002', loc: 'Deira, Dubai', speed: '0 km/h', time: '2 min ago' }, { veh: 'AUH-VAN-001', loc: 'Hamdan St, Abu Dhabi', speed: '65 km/h', time: '1 min ago' }].map((g, i) => (
                      <tr key={g.veh} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1A1A1A]">{g.veh}</td>
                        <td className="px-4 py-3">{g.loc}</td>
                        <td className="px-4 py-3 text-right">{g.speed}</td>
                        <td className="px-4 py-3 text-xs text-[#8E8E93]">{g.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'delivery-execution',
      label: 'Delivery Execution',
      icon: '',
      description: 'Delivery scheduling, proof of delivery (POD), and delivery confirmations',
      tier3Screens: [
        {
          id: 'delivery-queue',
          label: 'Delivery Queue',
          icon: '',
          component: <DeliveryQueueContent persona={persona} locale={locale} />
        },
        {
          id: 'pod-tracking',
          label: 'POD Tracking',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Proof of Delivery</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[{ label: 'Confirmed Today', value: 186, dark: true }, { label: 'Pending Signature', value: 12, dark: false }, { label: 'Disputed', value: 2, dark: false }].map(s => (
                  <div key={s.label} className={`p-4 text-center ${s.dark ? 'bg-[#1A1A1A] text-white' : 'bg-[#F5F5F7]'}`} style={{ borderRadius: 0 }}>
                    <div className="text-2xl font-semibold">{s.value}</div>
                    <div className={`text-xs mt-1 ${s.dark ? 'text-[#AEAEB2]' : 'text-[#8E8E93]'}`}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Delivery ID</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Customer</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Driver</th><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Time</th><th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">POD</th></tr></thead>
                  <tbody>
                    {[{ id: 'DEL-2841', customer: 'Al Fardan Supermarket', driver: 'Hamdan Ali', time: '09:24', pod: 'Signed' }, { id: 'DEL-2840', customer: 'Carrefour Deira', driver: 'Majid Hassan', time: '10:05', pod: 'Signed' }, { id: 'DEL-2839', customer: 'Union Coop JBR', driver: 'Saeed Ibrahim', time: '11:30', pod: 'Pending' }, { id: 'DEL-2838', customer: 'Lulu Hypermarket', driver: 'Ahmed Nasser', time: '08:15', pod: 'Disputed' }].map((d, i) => (
                      <tr key={d.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-mono text-xs text-[#8E8E93]">{d.id}</td>
                        <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{d.customer}</td>
                        <td className="px-4 py-3">{d.driver}</td>
                        <td className="px-4 py-3 text-xs">{d.time}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${d.pod === 'Signed' ? 'bg-[#1A1A1A] text-white' : d.pod === 'Disputed' ? 'bg-[#6B1F2B] text-white' : 'bg-[#F5F5F7] text-[#8E8E93]'}`} style={{ borderRadius: 0 }}>{d.pod}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        },
        {
          id: 'delivery-reports',
          label: 'Delivery Reports',
          icon: '',
          component: (
            <div className="p-6 space-y-6">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Delivery Performance Reports</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[{ label: 'On-Time Rate', value: '94.2%' }, { label: 'Avg Delivery Time', value: '3.8 hrs' }, { label: 'First Attempt Success', value: '91.4%' }, { label: 'Returns Rate', value: '2.1%' }].map(s => (
                  <div key={s.label} className="bg-[#F5F5F7] p-4" style={{ borderRadius: 0 }}>
                    <div className="text-xl font-semibold text-[#1A1A1A]">{s.value}</div>
                    <div className="text-xs text-[#8E8E93] mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Route</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Deliveries</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">On-Time %</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Avg Time</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Returns</th></tr></thead>
                  <tbody>
                    {[{ route: 'Dubai North A', del: 1248, ot: 96, avg: '3.4h', ret: '1.8%' }, { route: 'Dubai South B', del: 1098, ot: 91, avg: '4.1h', ret: '2.4%' }, { route: 'Sharjah Loop', del: 842, ot: 98, avg: '3.0h', ret: '1.2%' }, { route: 'Abu Dhabi Central', del: 920, ot: 88, avg: '4.8h', ret: '2.8%' }].map((r, i) => (
                      <tr key={r.route} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{r.route}</td>
                        <td className="px-4 py-3 text-right">{r.del.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-semibold">{r.ot}%</td>
                        <td className="px-4 py-3 text-right">{r.avg}</td>
                        <td className="px-4 py-3 text-right">{r.ret}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'returns',
      label: 'Returns Management',
      icon: '↩️',
      description: 'Handle returns, damages, and expiry-related returns',
      tier3Screens: [
        {
          id: 'pending-returns',
          label: 'Pending Returns',
          icon: '⏳',
          component: <PendingReturnsContent persona={persona} locale={locale} />
        },
        {
          id: 'return-reasons',
          label: 'Return Reasons',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Return Reason Analysis</h3>
              <div className="space-y-3">
                {[{ reason: 'Product Damaged in Transit', count: 84, pct: 38 }, { reason: 'Wrong Product Delivered', count: 42, pct: 19 }, { reason: 'Near Expiry / Expired', count: 38, pct: 17 }, { reason: 'Customer Refused', count: 28, pct: 13 }, { reason: 'Overstock at Retailer', count: 18, pct: 8 }, { reason: 'Other', count: 11, pct: 5 }].map(r => (
                  <div key={r.reason} className="flex items-center gap-4">
                    <div className="w-48 text-sm text-[#1A1A1A] flex-shrink-0">{r.reason}</div>
                    <div className="flex-1 bg-[#F5F5F7] h-6 relative" style={{ borderRadius: 0 }}>
                      <div className="bg-[#6B1F2B] h-6 flex items-center justify-end pr-2" style={{ width: `${r.pct}%`, borderRadius: 0 }}>
                        <span className="text-white text-xs font-bold">{r.pct}%</span>
                      </div>
                    </div>
                    <div className="w-12 text-right text-sm font-semibold text-[#1A1A1A]">{r.count}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        },
        {
          id: 'return-analytics',
          label: 'Return Analytics',
          icon: '',
          component: (
            <div className="p-6 space-y-6">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Returns Trend Analytics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[{ label: 'Returns This Month', value: '221' }, { label: 'Return Rate', value: '2.1%' }, { label: 'Value of Returns', value: 'AED 18,400' }, { label: 'Recovery Rate', value: '68%' }].map(s => (
                  <div key={s.label} className="bg-[#F5F5F7] p-4" style={{ borderRadius: 0 }}>
                    <div className="text-xl font-semibold text-[#1A1A1A]">{s.value}</div>
                    <div className="text-xs text-[#8E8E93] mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Month</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Total Returns</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Rate</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Value</th><th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Top Reason</th></tr></thead>
                  <tbody>
                    {[{ month: 'Mar 2026', ret: 221, rate: '2.1%', value: 'AED 18,400', top: 'Damaged' }, { month: 'Feb 2026', ret: 198, rate: '1.9%', value: 'AED 16,200', top: 'Wrong Delivery' }, { month: 'Jan 2026', ret: 246, rate: '2.4%', value: 'AED 20,800', top: 'Expired' }].map((r, i) => (
                      <tr key={r.month} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{r.month}</td>
                        <td className="px-4 py-3 text-right">{r.ret}</td>
                        <td className="px-4 py-3 text-right">{r.rate}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#6B1F2B]">{r.value}</td>
                        <td className="px-4 py-3 text-right text-[#8E8E93]">{r.top}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'gps-heatmap',
      label: 'GPS Heatmap & Coverage',
      icon: '️',
      description: 'Retailer density heatmaps, coverage gaps, and route coverage analysis',
      tier3Screens: [
        {
          id: 'coverage-map',
          label: 'Coverage Map',
          icon: '',
          component: (
            <div className="p-6 space-y-6">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Retailer Coverage Heatmap</h3>
              <div className="bg-[#F5F5F7] h-48 flex items-center justify-center border-2 border-dashed border-[#E5E5EA]/30" style={{ borderRadius: 0 }}>
                <div className="text-center"><div className="text-3xl mb-2">️</div><div className="font-semibold text-[#1A1A1A]">Interactive Heatmap</div><div className="text-sm text-[#8E8E93]">972 tracked retailers across 23 active routes</div></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[{ label: 'High Density', count: 12, color: 'bg-[#F5F5F7] text-[#1A1A1A]' }, { label: 'Medium', count: 28, color: 'bg-[#F5F5F7] text-[#1A1A1A]' }, { label: 'Low', count: 15, color: 'bg-[#F5F5F7] text-[#1A1A1A]' }, { label: 'No Coverage', count: 8, color: 'bg-[#F5F5F7] text-[#1A1A1A]' }].map(z => (
                  <div key={z.label} className="border border-[#E5E5EA]/30 p-4" style={{ borderRadius: 0 }}>
                    <div className="text-sm text-[#8E8E93]">{z.label}</div>
                    <div className="text-2xl font-semibold text-[#1A1A1A]">{z.count} zones</div>
                    <span className={`px-2 py-1 text-xs font-bold ${z.color}`} style={{ borderRadius: 0 }}>{z.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'trade-flow',
      label: 'Trade Flow Tracking',
      icon: '',
      description: 'End-to-end goods movement from origin to destination with customs integration',
      tier3Screens: [
        {
          id: 'active-flows',
          label: 'Active Flows',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Active Trade Flows</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Flow ID</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Type</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Origin</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Destination</th><th className="px-5 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Progress</th></tr></thead>
                  <tbody>
                    {[{ id: 'TF-001', type: 'Import', origin: 'Shanghai, CN', dest: 'Dubai, UAE', status: 'In Transit', progress: 65 }, { id: 'TF-002', type: 'Export', origin: 'Dubai, UAE', dest: 'Frankfurt, DE', status: 'Customs', progress: 45 }, { id: 'TF-003', type: 'Import', origin: 'Bangkok, TH', dest: 'Karachi, PK', status: 'Loading', progress: 20 }].map((f, i) => (
                      <tr key={f.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{f.id}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-bold ${f.type === 'Import' ? 'bg-[#F5F5F7] text-[#1A1A1A]' : 'bg-[#F5F5F7] text-[#1A1A1A]'}`} style={{ borderRadius: 0 }}>{f.type}</span></td>
                        <td className="px-4 py-3">{f.origin}</td>
                        <td className="px-4 py-3">{f.dest}</td>
                        <td className="px-4 py-3 text-center"><span className="px-2 py-1 text-xs font-bold bg-[#F5F5F7] text-[#1A1A1A]" style={{ borderRadius: 0 }}>{f.status}</span></td>
                        <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-24 bg-[#F5F5F7] h-2" style={{ borderRadius: 0 }}><div className="bg-[#6B1F2B] h-2" style={{ width: `${f.progress}%`, borderRadius: 0 }}></div></div><span className="text-xs">{f.progress}%</span></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }
      ]
    }
  ]

  tier2Modules.unshift({
    id: 'logistics-analytics',
    label: 'Analytics Dashboard',
    icon: '',
    description: 'Logistics analytics — delivery rates, shipment volumes, cost breakdown, trade routes',
    component: <LogisticsAnalyticsCharts />,
    tier3Screens: [{ id: 'logistics-charts', label: 'Logistics Charts', icon: '', component: <LogisticsAnalyticsCharts /> }]
  })

  return (
    <OSDomainTierStructure
      domainId="logistics"
      domainName="Logistics OS"
      tier2Modules={tier2Modules}
      defaultModule="logistics-analytics"
    />
  )
}

