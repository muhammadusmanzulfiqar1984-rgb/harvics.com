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
