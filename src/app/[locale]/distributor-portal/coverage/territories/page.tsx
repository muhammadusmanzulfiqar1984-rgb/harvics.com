'use client'

import React, { useEffect, useState } from 'react'
import LocalizationBar from '@/components/shared/LocalizationBar'
import { fetchTerritories } from '@/lib/distributorPortal'

export default function TerritoriesPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchTerritories().then(setRows).catch(() => setRows([])).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <LocalizationBar orientation="horizontal" compact showLabels={false} showGeo={false} />
      <h1 className="text-2xl font-bold text-harvics-burgundy">Territories</h1>
      {loading ? (
        <p className="text-sm text-gray-600">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-600">No territory assignments — configure in Module #58 Globalisation.</p>
      ) : (
        <table className="w-full text-sm bg-white border">
          <thead className="bg-[#F5F0E8]">
            <tr>
              {['Code', 'Manager', 'Coverage', 'Status'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.id || r.territoryCode}>
                <td className="px-4 py-3 font-semibold">{r.territoryCode || r.code}</td>
                <td className="px-4 py-3">{r.manager || r.assignedTo || '—'}</td>
                <td className="px-4 py-3">{r.coverage != null ? `${r.coverage}%` : '—'}</td>
                <td className="px-4 py-3">{r.status || 'Active'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
