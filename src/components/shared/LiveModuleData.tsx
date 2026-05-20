'use client'

import React, { useEffect, useState } from 'react'

interface LiveModuleDataProps {
  endpoint: string         // e.g. '/api/v2/projects'
  title: string            // e.g. 'Live Projects'
  columns: Array<{ key: string; label: string; format?: (v: any) => string }>
  emptyMessage?: string
}

/**
 * Reusable panel that fetches a list from a /api/v2/* endpoint and renders it as a table.
 * Used by OS module pages to show Postgres-backed live data alongside existing UI.
 */
export default function LiveModuleData({ endpoint, title, columns, emptyMessage = 'No records yet.' }: LiveModuleDataProps) {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshAt, setRefreshAt] = useState<number>(Date.now())

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(endpoint, { cache: 'no-store' })
      .then(r => r.json())
      .then(json => {
        if (cancelled) return
        if (json?.success === false) { setError(json.error || 'Failed to load'); setRows([]); }
        else { setRows(Array.isArray(json?.data) ? json.data : []); setError(null); }
      })
      .catch(e => { if (!cancelled) setError(e?.message || 'Network error') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [endpoint, refreshAt])

  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">Live from Postgres · {endpoint}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{loading ? 'Loading…' : `${rows.length} record${rows.length === 1 ? '' : 's'}`}</span>
          <button
            onClick={() => setRefreshAt(Date.now())}
            className="text-xs px-2 py-1 bg-[#6B1F2B] text-white rounded hover:bg-[#50000b] transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
              <tr key={row.id || i} className="hover:bg-gray-50">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-2 text-gray-900">
                    {col.format ? col.format(row[col.key]) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
