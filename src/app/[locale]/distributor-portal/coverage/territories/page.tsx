'use client'

import React from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

export default function MyTerritories() {
  const locale = useLocale()

  const territories = [
    { country: 'United States', region: 'West Coast', city: 'Los Angeles', territoryId: 'TER-US-WEST-001', routes: 15, outlets: 245, status: 'Active' },
    { country: 'United States', region: 'East Coast', city: 'New York', territoryId: 'TER-US-EAST-002', routes: 12, outlets: 198, status: 'Active' },
    { country: 'Pakistan', region: 'North', city: 'Lahore', territoryId: 'TER-PK-NORTH-003', routes: 8, outlets: 156, status: 'Active' },
    { country: 'UAE', region: 'Dubai', city: 'Dubai', territoryId: 'TER-AE-DXB-004', routes: 5, outlets: 89, status: 'Active' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#C3A35E]">My Territories</h1>
        <Link
          href={`/${locale}/distributor-portal/coverage/request`}
          className="bg-white text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Request Additional Territory
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-black200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Country</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Region</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">City</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Territory ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Routes/Outlets</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#C3A35E]/90">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {territories.map((territory, index) => (
                <tr key={index} className="hover:bg-white">
                  <td className="px-6 py-4 font-semibold text-[#C3A35E]/90">{territory.country}</td>
                  <td className="px-6 py-4 text-sm text-[#C3A35E]/90">{territory.region}</td>
                  <td className="px-6 py-4 text-sm text-[#C3A35E]/90">{territory.city}</td>
                  <td className="px-6 py-4 text-sm font-mono text-[#C3A35E]/90">{territory.territoryId}</td>
                  <td className="px-6 py-4 text-sm text-[#C3A35E]/90">
                    <div>{territory.routes} routes</div>
                    <div className="text-xs text-[#C3A35E]/90">{territory.outlets} outlets</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      territory.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-white text-[#C3A35E]/90'
                    }`}>
                      {territory.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

