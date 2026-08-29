'use client'

import React, { useEffect, useState } from 'react'
import LocalizationBar from '@/components/shared/LocalizationBar'
import { fetchDocuments } from '@/lib/distributorPortal'

export default function AccountDocumentsPage() {
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchDocuments('Distributor').then(setDocs).catch(() => setDocs([])).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <LocalizationBar orientation="horizontal" compact showLabels={false} showGeo={false} />
      <h1 className="text-2xl font-bold text-harvics-burgundy">Account Documents</h1>
      {loading ? (
        <p className="text-sm text-gray-600">Loading…</p>
      ) : docs.length === 0 ? (
        <p className="text-sm text-gray-600">No documents yet — upload via Module #52 Document Vault or Legal OS.</p>
      ) : (
        <table className="w-full text-sm bg-white border">
          <thead className="bg-[#F5F0E8]">
            <tr>
              {['Title', 'Type', 'Category', 'Status', 'Expires'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {docs.map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-3 font-semibold">{d.title}</td>
                <td className="px-4 py-3">{d.type}</td>
                <td className="px-4 py-3">{d.category}</td>
                <td className="px-4 py-3">{d.status}</td>
                <td className="px-4 py-3">{d.expiryDate || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
