'use client'

import React, { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useCountry } from '@/contexts/CountryContext'
import OSDomainPageWrapper from '@/components/os-domains/OSDomainPageWrapper'
import KPICard from '@/components/shared/KPICard'
import { apiClient } from '@/lib/api'

export default function SupplyChainOSPage() {
  const locale = useLocale()
  const pathname = usePathname()
  const { selectedCountry } = useCountry()
  const [loading, setLoading] = useState(true)
  const [graphData, setGraphData] = useState<any>(null)

  const portal = pathname?.includes('/portal/distributor') ? 'distributor' :
                 pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  const countryCode = selectedCountry || 'AE'

  useEffect(() => {
    loadData()
  }, [countryCode])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await apiClient.request(`/graph/${countryCode}`)
      setGraphData(res?.data || res || {})
    } catch (error) {
      console.error('Error loading supply chain data:', error)
      setGraphData(null)
    } finally {
      setLoading(false)
    }
  }

  const nodes = graphData?.nodes || []
  const edges = graphData?.edges || []
  const manufacturers = nodes.filter((n: any) => n.type === 'manufacturer')
  const distributors = nodes.filter((n: any) => n.type === 'distributor')
  const retailers = nodes.filter((n: any) => n.type === 'retailer')

  // Interactive network viz state
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const layoutNodes = (list: any[], x: number) =>
    list.map((n, i) => ({
      ...n,
      x,
      y: 60 + i * (Math.max(40, 380 / Math.max(list.length, 1))),
    }))

  const positioned = [
    ...layoutNodes(manufacturers, 120),
    ...layoutNodes(distributors, 440),
    ...layoutNodes(retailers, 760),
  ]
  const posMap = new Map(positioned.map((n) => [n.id, n]))
  const isConnected = (nodeId: string) =>
    edges.some((e: any) => e.from === nodeId || e.to === nodeId)
  const isEdgeActive = (e: any) => {
    const focus = hoveredNode || selectedNode
    if (!focus) return false
    return e.from === focus || e.to === focus
  }
  const isNodeDimmed = (id: string) => {
    const focus = hoveredNode || selectedNode
    if (!focus) return false
    if (id === focus) return false
    const linked = edges.some(
      (e: any) =>
        (e.from === focus && e.to === id) || (e.to === focus && e.from === id)
    )
    return !linked
  }
  const colorFor = (type: string) =>
    type === 'manufacturer' ? '#3b82f6' :
    type === 'distributor' ? '#a855f7' :
    '#10b981'

  return (
    <OSDomainPageWrapper
      title="Supply Chain Network"
      description="FMCG supply chain graph, network analysis, and optimization"
      domain="supply-chain"
      portal={portal as any}
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C3A35E]"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPICard label="Network Nodes" value={nodes.length} icon="🔗" />
            <KPICard label="Connections" value={edges.length} icon="↔️" />
            <KPICard label="Manufacturers" value={manufacturers.length} icon="🏭" />
            <KPICard label="Retailers" value={retailers.length} icon="🏪" />
          </div>

          {/* Interactive Network Visualization */}
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-[#C3A35E]/30 rounded-lg p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-white">Live Network Map</h4>
                <p className="text-xs text-slate-400">
                  Hover or tap a node to highlight its flow • {nodes.length} nodes • {edges.length} flows
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span>
                  Manufacturer
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]"></span>
                  Distributor
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                  Retailer
                </span>
              </div>
            </div>

            {/* Background grid */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(195,163,94,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(195,163,94,0.15) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />

            {/* Dramatic background: aurora orbs + scanline + drifting particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="sc-orb sc-orb-1" />
              <div className="sc-orb sc-orb-2" />
              <div className="sc-orb sc-orb-3" />
              <div className="sc-scan" />
              <div className="sc-vignette" />
              {Array.from({ length: 28 }).map((_, i) => (
                <span
                  key={i}
                  className="sc-particle"
                  style={{
                    left: `${(i * 37) % 100}%`,
                    top: `${(i * 53) % 100}%`,
                    animationDelay: `${(i % 10) * 0.6}s`,
                    animationDuration: `${8 + (i % 6)}s`,
                  }}
                />
              ))}
            </div>

            <style jsx>{`
              @keyframes sc-orb-float {
                0%, 100% { transform: translate(0,0) scale(1); }
                33% { transform: translate(40px,-30px) scale(1.15); }
                66% { transform: translate(-30px,25px) scale(0.9); }
              }
              @keyframes sc-scan-move {
                0% { transform: translateY(-20%); opacity: 0; }
                10%, 90% { opacity: 0.6; }
                100% { transform: translateY(120%); opacity: 0; }
              }
              @keyframes sc-particle-rise {
                0% { transform: translateY(0) translateX(0); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translateY(-120px) translateX(20px); opacity: 0; }
              }
              .sc-orb {
                position: absolute;
                width: 380px; height: 380px;
                border-radius: 50%;
                filter: blur(80px);
                opacity: 0.45;
                animation: sc-orb-float 14s ease-in-out infinite;
              }
              .sc-orb-1 { top: -120px; left: -80px; background: radial-gradient(circle, #3b82f6 0%, transparent 70%); }
              .sc-orb-2 { top: 30%; left: 40%; background: radial-gradient(circle, #a855f7 0%, transparent 70%); animation-delay: -5s; }
              .sc-orb-3 { bottom: -100px; right: -60px; background: radial-gradient(circle, #10b981 0%, transparent 70%); animation-delay: -9s; }
              .sc-scan {
                position: absolute; left: 0; right: 0; height: 120px;
                background: linear-gradient(180deg, transparent 0%, rgba(195,163,94,0.18) 50%, transparent 100%);
                animation: sc-scan-move 6s linear infinite;
                mix-blend-mode: screen;
              }
              .sc-vignette {
                position: absolute; inset: 0;
                background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%);
              }
              .sc-particle {
                position: absolute;
                width: 3px; height: 3px;
                border-radius: 50%;
                background: #C3A35E;
                box-shadow: 0 0 8px #C3A35E, 0 0 16px rgba(195,163,94,0.6);
                animation: sc-particle-rise linear infinite;
                opacity: 0;
              }
            `}</style>

            <svg
              viewBox="0 0 880 460"
              className="w-full h-[460px] relative z-10"
              style={{ filter: 'drop-shadow(0 0 12px rgba(195,163,94,0.05))' }}
            >
              <defs>
                <linearGradient id="sc-edge" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="sc-edge-active" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#C3A35E" stopOpacity="1" />
                  <stop offset="100%" stopColor="#fef08a" stopOpacity="1" />
                </linearGradient>
                <filter id="sc-glow">
                  <feGaussianBlur stdDeviation="3" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <style>{`
                  @keyframes sc-dash { to { stroke-dashoffset: -24; } }
                  @keyframes sc-pulse {
                    0%, 100% { r: 14; opacity: 0.4; }
                    50% { r: 22; opacity: 0; }
                  }
                  .sc-flow { stroke-dasharray: 6 6; animation: sc-dash 1.2s linear infinite; }
                  .sc-ring { animation: sc-pulse 2.4s ease-out infinite; transform-origin: center; }
                `}</style>
              </defs>

              {/* Column headers */}
              <text x="120" y="28" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600" letterSpacing="2">MANUFACTURERS</text>
              <text x="440" y="28" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600" letterSpacing="2">DISTRIBUTORS</text>
              <text x="760" y="28" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600" letterSpacing="2">RETAILERS</text>

              {/* Edges */}
              {edges.map((e: any, idx: number) => {
                const a: any = posMap.get(e.from)
                const b: any = posMap.get(e.to)
                if (!a || !b) return null
                const active = isEdgeActive(e)
                const focus = hoveredNode || selectedNode
                const dim = focus && !active
                const midX = (a.x + b.x) / 2
                const path = `M ${a.x} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`
                return (
                  <path
                    key={idx}
                    d={path}
                    fill="none"
                    stroke={active ? 'url(#sc-edge-active)' : 'url(#sc-edge)'}
                    strokeWidth={active ? 2.5 : 1.4}
                    opacity={dim ? 0.08 : 0.85}
                    className={active ? 'sc-flow' : ''}
                    style={{ transition: 'opacity 0.25s, stroke-width 0.25s' }}
                  />
                )
              })}

              {/* Nodes */}
              {positioned.map((n: any) => {
                const focused = hoveredNode === n.id || selectedNode === n.id
                const dim = isNodeDimmed(n.id)
                const color = colorFor(n.type)
                const connected = isConnected(n.id)
                return (
                  <g
                    key={n.id}
                    transform={`translate(${n.x}, ${n.y})`}
                    style={{
                      cursor: 'pointer',
                      opacity: dim ? 0.25 : 1,
                      transition: 'opacity 0.25s',
                    }}
                    onMouseEnter={() => setHoveredNode(n.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => setSelectedNode(selectedNode === n.id ? null : n.id)}
                  >
                    {connected && (
                      <circle r="14" fill="none" stroke={color} strokeWidth="2" className="sc-ring" />
                    )}
                    <circle
                      r={focused ? 14 : 11}
                      fill={color}
                      filter="url(#sc-glow)"
                      style={{ transition: 'r 0.2s' }}
                    />
                    <circle r={focused ? 6 : 4} fill="#fff" opacity="0.9" />
                    <text
                      x={n.type === 'retailer' ? -18 : 18}
                      y="4"
                      textAnchor={n.type === 'retailer' ? 'end' : 'start'}
                      fill={focused ? '#fef08a' : '#e2e8f0'}
                      fontSize="11"
                      fontWeight={focused ? 700 : 500}
                      style={{ transition: 'fill 0.2s' }}
                    >
                      {n.name?.length > 22 ? n.name.slice(0, 22) + '…' : n.name}
                    </text>
                  </g>
                )
              })}
            </svg>

            {/* Selected node detail panel */}
            {selectedNode && (() => {
              const n: any = posMap.get(selectedNode)
              if (!n) return null
              const links = edges.filter((e: any) => e.from === selectedNode || e.to === selectedNode)
              return (
                <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 backdrop-blur border border-[#C3A35E]/40 rounded-md px-4 py-3 flex items-center justify-between z-20">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#C3A35E]">{n.type}</p>
                    <p className="text-white font-semibold">{n.name}</p>
                    <p className="text-xs text-slate-400">{links.length} active flow{links.length === 1 ? '' : 's'}</p>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-slate-400 hover:text-white text-sm px-3 py-1 border border-slate-700 rounded"
                  >
                    Close
                  </button>
                </div>
              )
            })()}

            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm z-10">
                No network data available for {countryCode}
              </div>
            )}
          </div>

          {/* Supply Chain Flow */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">Supply Chain Flow ({countryCode})</h4>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <p className="text-3xl mb-2">🏭</p>
                <p className="text-sm font-semibold text-black">Manufacturers</p>
                <p className="text-2xl font-bold text-blue-700">{manufacturers.length}</p>
                <div className="mt-2 space-y-1">
                  {manufacturers.map((m: any) => (
                    <p key={m.id} className="text-xs text-gray-600 truncate">{m.name}</p>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                <p className="text-3xl mb-2">🚚</p>
                <p className="text-sm font-semibold text-black">Distributors</p>
                <p className="text-2xl font-bold text-purple-700">{distributors.length}</p>
                <div className="mt-2 space-y-1">
                  {distributors.map((d: any) => (
                    <p key={d.id} className="text-xs text-gray-600 truncate">{d.name}</p>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-3xl mb-2">🏪</p>
                <p className="text-sm font-semibold text-black">Retailers</p>
                <p className="text-2xl font-bold text-green-700">{retailers.length}</p>
                <div className="mt-2 space-y-1">
                  {retailers.map((r: any) => (
                    <p key={r.id} className="text-xs text-gray-600 truncate">{r.name}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Network Edges Table */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">Network Connections ({edges.length})</h4>
            {edges.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-black">From</th>
                      <th className="text-left py-2 font-medium text-black">To</th>
                      <th className="text-left py-2 font-medium text-black">Relationship</th>
                    </tr>
                  </thead>
                  <tbody>
                    {edges.map((edge: any, idx: number) => {
                      const fromNode = nodes.find((n: any) => n.id === edge.from)
                      const toNode = nodes.find((n: any) => n.id === edge.to)
                      return (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-2 text-black">{fromNode?.name || edge.from}</td>
                          <td className="py-2 text-black">{toNode?.name || edge.to}</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              edge.type === 'sells_to' ? 'bg-blue-100 text-blue-700' :
                              edge.type === 'distributes' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {edge.type?.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No network data available for {countryCode}</p>
            )}
          </div>

          {/* All Nodes Table */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">All Network Nodes ({nodes.length})</h4>
            {nodes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-black">Name</th>
                      <th className="text-left py-2 font-medium text-black">Type</th>
                      <th className="text-left py-2 font-medium text-black">Node ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nodes.map((node: any) => (
                      <tr key={node.id} className="border-b border-gray-100">
                        <td className="py-2 text-black font-medium">{node.name}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs capitalize ${
                            node.type === 'manufacturer' ? 'bg-blue-100 text-blue-700' :
                            node.type === 'distributor' ? 'bg-purple-100 text-purple-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {node.type}
                          </span>
                        </td>
                        <td className="py-2 text-black font-mono text-xs">{node.id?.substring(0, 8)}...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No nodes available for {countryCode}</p>
            )}
          </div>
        </div>
      )}
    </OSDomainPageWrapper>
  )
}
