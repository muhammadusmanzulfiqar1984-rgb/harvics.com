'use client'

/**
 * HARVICS OS — Universal Module Screen (Session 39 · Wave 2)
 *
 * Renders any module from the registry via the generic factory endpoint
 * `GET /api/m/:moduleId`. Supports list, create, delete with optimistic UI.
 *
 * Design: HARVICS sharp-edge cards (burgundy #3D1212, gold #C3A35E, cream
 * #F5F0E8, borderRadius: 0). Mirrors OSDomainTierStructure visual language.
 */

import { useEffect, useMemo, useState } from 'react'
import { MODULE_REGISTRY, getModuleById } from '@/lib/modules/registry'

interface ModuleRecord {
  id: string
  moduleId: number
  status: string
  createdAt: string
  updatedAt: string
  [key: string]: any
}

interface UniversalModuleScreenProps {
  moduleId: number
}

const BURGUNDY = 'var(--harvics-burgundy)'
const GOLD = 'var(--harvics-gold)'
const CREAM = 'var(--harvics-cream)'

export default function UniversalModuleScreen({ moduleId }: UniversalModuleScreenProps) {
  const entry = getModuleById(moduleId)
  const [records, setRecords] = useState<ModuleRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [createJson, setCreateJson] = useState('{\n  "name": "New record"\n}')
  const [creating, setCreating] = useState(false)

  const fetchRecords = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/m/${moduleId}?limit=200`, { cache: 'no-store' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'fetch failed')
      setRecords(json.data || [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchRecords()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId])

  const handleCreate = async () => {
    setCreating(true)
    try {
      let body: any
      try {
        body = JSON.parse(createJson)
      } catch {
        alert('Invalid JSON')
        setCreating(false)
        return
      }
      const res = await fetch(`/api/m/${moduleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'create failed')
      setShowCreate(false)
      setCreateJson('{\n  "name": "New record"\n}')
      await fetchRecords()
    } catch (e: any) {
      alert(`Create failed: ${e?.message}`)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record?')) return
    try {
      const res = await fetch(`/api/m/${moduleId}/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'delete failed')
      await fetchRecords()
    } catch (e: any) {
      alert(`Delete failed: ${e?.message}`)
    }
  }

  const columns = useMemo(() => {
    if (records.length === 0) return []
    const skip = new Set(['id', 'moduleId', 'createdAt', 'updatedAt'])
    const keys = new Set<string>()
    records.forEach((r) => {
      Object.keys(r).forEach((k) => {
        if (!skip.has(k)) keys.add(k)
      })
    })
    return Array.from(keys).slice(0, 8)
  }, [records])

  if (!entry) {
    return (
      <div style={{ padding: 32, fontFamily: 'system-ui' }}>
        <h1 style={{ color: BURGUNDY }}>Module {moduleId} not found</h1>
        <p>Registry has {MODULE_REGISTRY.length} modules (ids 1–{MODULE_REGISTRY.length}).</p>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'system-ui', minHeight: '100vh', background: CREAM }}>
      {/* Header */}
      <div style={{ background: BURGUNDY, color: CREAM, padding: '24px 32px', borderBottom: `4px solid ${GOLD}` }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, letterSpacing: 2, opacity: 0.8 }}>MODULE #{entry.id}</div>
          <div style={{ fontSize: 12, letterSpacing: 1.5, color: GOLD }}>{entry.band.toUpperCase()}</div>
        </div>
        <h1 style={{ margin: '8px 0 4px', fontSize: 28, fontWeight: 600, fontFamily: 'Georgia, serif' }}>{entry.name}</h1>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12 }}>
          <span style={{ background: GOLD, color: BURGUNDY, padding: '3px 10px', fontWeight: 700, letterSpacing: 1 }}>
            {entry.status.toUpperCase()}
          </span>
          <span style={{ opacity: 0.85 }}>Intelligence {entry.intelligence}</span>
          <span style={{ opacity: 0.85 }}>{entry.reporting}</span>
          <code style={{ opacity: 0.7, fontSize: 11 }}>{entry.route}</code>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ padding: '16px 32px', borderBottom: `1px solid ${BURGUNDY}22`, display: 'flex', gap: 12, alignItems: 'center', background: '#fff' }}>
        <button
          onClick={() => setShowCreate((s) => !s)}
          style={{ padding: '8px 20px', background: BURGUNDY, color: CREAM, border: `2px solid ${GOLD}`, fontWeight: 600, cursor: 'pointer', letterSpacing: 0.5 }}
        >
          + CREATE RECORD
        </button>
        <button
          onClick={fetchRecords}
          style={{ padding: '8px 20px', background: 'transparent', color: BURGUNDY, border: `2px solid ${BURGUNDY}`, fontWeight: 600, cursor: 'pointer' }}
        >
          REFRESH
        </button>
        <span style={{ marginLeft: 'auto', color: BURGUNDY, fontWeight: 600 }}>
          {loading ? 'Loading…' : `${records.length} record${records.length === 1 ? '' : 's'}`}
        </span>
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{ padding: '16px 32px', background: '#fff', borderBottom: `1px solid ${BURGUNDY}22` }}>
          <div style={{ fontSize: 12, color: BURGUNDY, marginBottom: 6, fontWeight: 600 }}>RECORD JSON</div>
          <textarea
            value={createJson}
            onChange={(e) => setCreateJson(e.target.value)}
            rows={6}
            style={{ width: '100%', fontFamily: 'monospace', fontSize: 13, padding: 12, border: `2px solid ${BURGUNDY}`, background: CREAM }}
          />
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button
              onClick={handleCreate}
              disabled={creating}
              style={{ padding: '8px 20px', background: GOLD, color: BURGUNDY, border: 0, fontWeight: 700, cursor: 'pointer' }}
            >
              {creating ? 'SAVING…' : 'SAVE'}
            </button>
            <button
              onClick={() => setShowCreate(false)}
              style={{ padding: '8px 20px', background: 'transparent', color: BURGUNDY, border: `1px solid ${BURGUNDY}`, cursor: 'pointer' }}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: 16, margin: 24, background: '#fee', color: '#900', border: '1px solid #f00' }}>
          {error}
        </div>
      )}

      {/* Records table */}
      <div style={{ padding: 24 }}>
        {records.length === 0 && !loading ? (
          <div style={{ padding: 48, background: '#fff', textAlign: 'center', color: BURGUNDY, border: `1px solid ${BURGUNDY}22` }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>No records yet</div>
            <div style={{ fontSize: 13, marginTop: 6, opacity: 0.7 }}>Click CREATE RECORD to add one.</div>
          </div>
        ) : (
          <div style={{ background: '#fff', border: `1px solid ${BURGUNDY}33`, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: BURGUNDY, color: CREAM, textAlign: 'left' }}>
                  <th style={{ padding: 10, fontWeight: 600, letterSpacing: 0.5 }}>ID</th>
                  <th style={{ padding: 10, fontWeight: 600 }}>STATUS</th>
                  {columns.map((c) => (
                    <th key={c} style={{ padding: 10, fontWeight: 600 }}>{c.toUpperCase()}</th>
                  ))}
                  <th style={{ padding: 10, fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, idx) => (
                  <tr key={r.id} style={{ background: idx % 2 === 0 ? '#fff' : CREAM, borderBottom: `1px solid ${BURGUNDY}11` }}>
                    <td style={{ padding: 10, fontFamily: 'monospace', fontSize: 11, color: BURGUNDY }}>{String(r.id).slice(0, 12)}…</td>
                    <td style={{ padding: 10 }}>
                      <span style={{ background: GOLD, color: BURGUNDY, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                        {r.status}
                      </span>
                    </td>
                    {columns.map((c) => (
                      <td key={c} style={{ padding: 10, color: '#333' }}>
                        {formatCell(r[c])}
                      </td>
                    ))}
                    <td style={{ padding: 10, textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(r.id)}
                        style={{ padding: '4px 10px', background: 'transparent', color: '#900', border: '1px solid #900', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}
                      >
                        DELETE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 32px', textAlign: 'center', color: BURGUNDY, fontSize: 11, opacity: 0.6 }}>
        HARVICS OS · Universal Module Renderer · Module {entry.id} of {MODULE_REGISTRY.length}
      </div>
    </div>
  )
}

function formatCell(v: any): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'object') return JSON.stringify(v).slice(0, 60)
  const s = String(v)
  return s.length > 60 ? s.slice(0, 57) + '…' : s
}
