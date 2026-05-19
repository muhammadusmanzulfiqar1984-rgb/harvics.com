'use client'

import { useEffect, useState } from 'react'

interface Contract {
  module?: string
  version?: string
  endpoints?: Record<string, string>
  requiredCreateFields?: string[]
  sampleCreatePayload?: Record<string, any>
  governance?: string[]
}

interface Props {
  segment: string
  basePath: string
  onClose?: () => void
}

const FIELD_TYPES: Record<string, 'text' | 'number'> = {}

function inferType(key: string, value: any): 'text' | 'number' {
  if (typeof value === 'number') return 'number'
  if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('qty') || key.toLowerCase().includes('price')) {
    return 'number'
  }
  return 'text'
}

export default function ModuleWorkspace({ segment, basePath, onClose }: Props) {
  const [contract, setContract] = useState<Contract | null>(null)
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState<Record<string, string>>({})

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const c = await fetch(`/api/modules/contracts/${segment}`).then(r => r.json())
        if (!active) return
        if (c?.success) {
          setContract(c.data)
          // Seed form from sample payload (string-coerced)
          const seed: Record<string, string> = {}
          for (const [k, v] of Object.entries(c.data?.sampleCreatePayload || {})) {
            if (typeof v === 'object') continue
            seed[k] = String(v ?? '')
          }
          setForm(seed)
        } else {
          setMessage(c?.error || 'Contract not found')
        }
      } catch {
        if (active) setMessage('Contract fetch failed')
      }
    }
    load()
    return () => {
      active = false
    }
  }, [segment])

  const fetchList = async () => {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch(basePath)
      const payload = await res.json()
      if (res.ok && (payload?.success || Array.isArray(payload?.data))) {
        setList(Array.isArray(payload.data) ? payload.data : [])
      } else {
        setMessage(payload?.error || `GET ${basePath} returned ${res.status}`)
      }
    } catch {
      setMessage(`GET ${basePath} failed`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePath])

  const submitCreate = async () => {
    setMessage('')
    const sample = contract?.sampleCreatePayload || {}
    const payload: Record<string, any> = {}
    for (const [k, v] of Object.entries(sample)) {
      if (typeof v === 'object') {
        payload[k] = v
        continue
      }
      const raw = form[k]
      if (raw === undefined) continue
      payload[k] = inferType(k, v) === 'number' ? Number(raw) || 0 : raw
    }
    try {
      const res = await fetch(basePath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const reply = await res.json().catch(() => null)
      if (!res.ok || !(reply?.success || reply?.data)) {
        setMessage(reply?.error || `POST returned ${res.status}`)
      } else {
        setMessage(`Created via ${segment} contract`)
        await fetchList()
      }
    } catch {
      setMessage('Create failed')
    }
  }

  const fields = Object.entries(contract?.sampleCreatePayload || {}).filter(([, v]) => typeof v !== 'object')
  const required = new Set(contract?.requiredCreateFields || [])

  return (
    <div className="rounded-2xl border border-[#e8e2d5] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#1a1a1a]">Module Workspace · {contract?.module || segment}</h3>
          <p className="text-xs text-[#5e5e5e]">Auto-generated from contract {contract?.version || 'unknown'} · {basePath}</p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-[#d6d0c3] bg-white px-2 py-1 text-[11px] font-bold text-[#3a3a3a]"
          >
            Close
          </button>
        ) : null}
      </div>

      {message ? <p className="mb-2 text-[11px] text-[#5d5d5d]">{message}</p> : null}

      <div className="grid gap-3 lg:grid-cols-2">
        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-[#8d826d]">Create</h4>
          <div className="grid gap-2">
            {fields.length === 0 ? (
              <p className="text-xs text-[#5d5d5d]">No editable fields exposed by this contract.</p>
            ) : (
              fields.map(([key, value]) => (
                <label key={key} className="grid gap-1 text-[11px] text-[#3a3a3a]">
                  <span className="font-bold">
                    {key}
                    {required.has(key) ? <span className="text-[#b42318]"> *</span> : null}
                  </span>
                  <input
                    type={inferType(key, value) === 'number' ? 'number' : 'text'}
                    value={form[key] ?? ''}
                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="rounded-lg border border-[#d6d0c3] px-2 py-1.5 text-xs"
                  />
                </label>
              ))
            )}
            <button
              type="button"
              onClick={submitCreate}
              className="mt-1 rounded-lg border border-[#6b1f2b] bg-[#6b1f2b] px-2 py-1.5 text-xs font-bold text-white"
            >
              POST {basePath}
            </button>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-[0.1em] text-[#8d826d]">Records</h4>
            <button
              type="button"
              onClick={fetchList}
              disabled={loading}
              className="rounded border border-[#d6d0c3] bg-white px-2 py-1 text-[10px] font-bold text-[#3a3a3a]"
            >
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
          <div className="grid max-h-72 gap-1.5 overflow-auto">
            {list.length === 0 ? (
              <p className="text-xs text-[#5d5d5d]">No records returned. Endpoint may require auth or not yet exist.</p>
            ) : (
              list.slice(0, 25).map((row, idx) => (
                <pre
                  key={row?.id || row?.sku || idx}
                  className="overflow-x-auto rounded border border-[#e8e2d5] bg-[#fbf8f1] p-2 font-mono text-[10px] text-[#3a3a3a]"
                >
                  {JSON.stringify(row, null, 2)}
                </pre>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
