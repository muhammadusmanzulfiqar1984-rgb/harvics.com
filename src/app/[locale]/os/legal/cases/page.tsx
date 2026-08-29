'use client'

import { useState, useEffect, useCallback } from 'react'
import LocalizationBar from '@/components/shared/LocalizationBar'

interface LegalCase {
  id: string
  caseTitle: string
  caseType: string
  country: string
  description?: string | null
  assignedTo?: string | null
  status: string
  hearingDate?: string | null
  documents?: string[]
  createdAt: string
}

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) (h as Record<string, string>).Authorization = `Bearer ${token}`
  return h
}

export default function LegalCasesPage() {
  const [cases, setCases] = useState<LegalCase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null)
  const [formData, setFormData] = useState({
    caseTitle: '',
    caseType: '',
    country: '',
    description: '',
    assignedTo: '',
    status: 'open',
    hearingDate: '',
  })

  const loadCases = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v2/legal/cases', { cache: 'no-store', headers: authHeaders() })
      const json = await res.json()
      if (!res.ok || json.success === false) throw new Error(json.error || `HTTP ${res.status}`)
      setCases(json.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load cases')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCases()
  }, [loadCases])

  const handleStatusUpdate = async (caseId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/v2/legal/cases/${caseId}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus }),
      })
      const json = await res.json()
      if (!res.ok || json.success === false) throw new Error(json.error)
      await loadCases()
    } catch (e) {
      console.error(e)
    }
  }

  const saveCase = async () => {
    try {
      setError(null)
      const body = {
        caseTitle: formData.caseTitle,
        caseType: formData.caseType,
        country: formData.country.toUpperCase(),
        description: formData.description || null,
        assignedTo: formData.assignedTo || null,
        status: formData.status,
        hearingDate: formData.hearingDate || null,
      }
      const url = selectedCase ? `/api/v2/legal/cases/${selectedCase.id}` : '/api/v2/legal/cases'
      const res = await fetch(url, {
        method: selectedCase ? 'PATCH' : 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok || json.success === false) throw new Error(json.error)
      setShowForm(false)
      setSelectedCase(null)
      await loadCases()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      open: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-harvics-gold/20 text-harvics-gold',
      closed: 'bg-green-100 text-green-800',
      cancelled: 'bg-white text-harvics-gold/90',
    }
    return statusStyles[status] || 'bg-white text-harvics-gold/90'
  }

  const statusOptions = ['open', 'in-progress', 'closed', 'cancelled']

  return (
    <div>
      <LocalizationBar orientation="horizontal" compact showLabels={false} showGeo={false} className="mb-4" />
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-harvics-gold">Legal Cases</h1>
            <p className="text-harvics-gold/90">Module #39 — live case registry</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedCase(null)
              setFormData({
                caseTitle: '',
                caseType: '',
                country: '',
                description: '',
                assignedTo: '',
                status: 'open',
                hearingDate: '',
              })
              setShowForm(true)
            }}
            className="bg-white px-6 py-2 font-semibold text-harvics-gold/90 transition-colors hover:bg-white/90"
          >
            + New Case
          </button>
        </div>
      </div>

      {error && <div className="mb-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/40" onClick={() => setShowForm(false)} />
            <div className="relative inline-block w-full max-w-2xl overflow-hidden bg-white text-left shadow-xl sm:my-8">
              <div className="px-6 py-5">
                <h3 className="mb-4 text-2xl font-bold text-harvics-gold">
                  {selectedCase ? 'Edit Case' : 'New Legal Case'}
                </h3>
                <div className="space-y-4">
                  <input
                    className="w-full border border-gray-200 px-3 py-2"
                    placeholder="Case title *"
                    value={formData.caseTitle}
                    onChange={(e) => setFormData({ ...formData, caseTitle: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      className="border border-gray-200 px-3 py-2"
                      placeholder="Case type *"
                      value={formData.caseType}
                      onChange={(e) => setFormData({ ...formData, caseType: e.target.value })}
                    />
                    <input
                      className="border border-gray-200 px-3 py-2"
                      placeholder="Country ISO *"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <textarea
                    className="w-full border border-gray-200 px-3 py-2"
                    placeholder="Description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  <input
                    className="w-full border border-gray-200 px-3 py-2"
                    placeholder="Assigned to"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  />
                  <input
                    className="w-full border border-gray-200 px-3 py-2"
                    type="date"
                    value={formData.hearingDate}
                    onChange={(e) => setFormData({ ...formData, hearingDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t px-6 py-4">
                <button type="button" onClick={() => setShowForm(false)} className="border px-4 py-2 text-sm">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void saveCase()}
                  className="bg-harvics-burgundy px-4 py-2 text-sm font-semibold text-harvics-cream"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden border border-black200 bg-white">
        {loading ? (
          <div className="p-8 text-center text-harvics-gold/90">Loading cases…</div>
        ) : cases.length === 0 ? (
          <div className="p-8 text-center text-harvics-gold/90">No legal cases — create the first case.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-black200 bg-white">
                <tr>
                  {['Title', 'Type', 'Country', 'Assigned', 'Status', 'Hearing', ''].map((h) => (
                    <th key={h || 'act'} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-harvics-gold/90">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {cases.map((legalCase) => (
                  <tr key={legalCase.id} className="hover:bg-harvics-cream/30">
                    <td className="px-6 py-4 text-sm font-medium text-harvics-gold/90">{legalCase.caseTitle}</td>
                    <td className="px-6 py-4 text-sm">{legalCase.caseType}</td>
                    <td className="px-6 py-4 text-sm">{legalCase.country}</td>
                    <td className="px-6 py-4 text-sm">{legalCase.assignedTo || '—'}</td>
                    <td className="px-6 py-4">
                      <select
                        value={legalCase.status}
                        onChange={(e) => void handleStatusUpdate(legalCase.id, e.target.value)}
                        className={`rounded-full border-0 px-2 py-1 text-xs font-semibold ${getStatusBadge(legalCase.status)}`}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {legalCase.hearingDate ? new Date(legalCase.hearingDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCase(legalCase)
                          setFormData({
                            caseTitle: legalCase.caseTitle,
                            caseType: legalCase.caseType,
                            country: legalCase.country,
                            description: legalCase.description || '',
                            assignedTo: legalCase.assignedTo || '',
                            status: legalCase.status,
                            hearingDate: legalCase.hearingDate ? legalCase.hearingDate.slice(0, 10) : '',
                          })
                          setShowForm(true)
                        }}
                        className="font-semibold text-harvics-gold"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
