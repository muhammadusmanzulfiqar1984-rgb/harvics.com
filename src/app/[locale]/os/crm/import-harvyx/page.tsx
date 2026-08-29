'use client'

/**
 * Import HarvyX leads into OS Smart CRM (one commercial system).
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

type HxLead = {
  id?: string
  company?: string
  contactName?: string
  name?: string
  email?: string
  title?: string
  country?: string
  segment?: string
  vertical?: string
  icpScore?: number
}

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token || 'demo-token-company_admin'}`,
  }
}

export default function ImportHarvyXPage() {
  const locale = useLocale()
  const [rows, setRows] = useState<HxLead[]>([])
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch('/api/harvyx/leads?limit=50&offset=0', { cache: 'no-store' })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || `HarvyX ${r.status}`)
      const list = (j.leads || j.data || []) as HxLead[]
      setRows(list)
      const init: Record<string, boolean> = {}
      list.slice(0, 20).forEach((l, i) => {
        const key = String(l.id || l.email || i)
        init[key] = true
      })
      setSelected(init)
    } catch (e: any) {
      setError(e?.message || 'Failed to load HarvyX leads — sign in to HarvyX or check API.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const importSelected = async () => {
    setBusy(true)
    setMsg(null)
    setError(null)
    try {
      const picks = rows.filter((l, i) => selected[String(l.id || l.email || i)])
      if (!picks.length) throw new Error('Select at least one lead')
      const payload = {
        leads: picks.map((l) => ({
          company: l.company || 'Unknown company',
          contact: l.contactName || l.name || null,
          email: l.email || null,
          value: typeof l.icpScore === 'number' ? l.icpScore * 1000 : 0,
          vertical: l.vertical || l.segment || null,
          country: l.country || null,
          externalId: l.id || null,
          notes: l.title ? `Title: ${l.title}` : null,
        })),
      }
      const r = await fetch('/api/wave8/import/harvyx', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      })
      const j = await r.json()
      if (!r.ok || j.success === false) throw new Error(j.error || j.message || `Import ${r.status}`)
      setMsg(j.message || `Imported ${j.imported}`)
    } catch (e: any) {
      setError(e?.message || 'Import failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">
            Bridge · HarvyX → OS CRM
          </p>
          <h2 className="mt-1 font-serif text-2xl text-harvics-burgundy">Import HarvyX leads</h2>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${locale}/os/crm`}
            className="border border-harvics-gold/40 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy"
          >
            Smart CRM
          </Link>
          <button
            type="button"
            onClick={() => void load()}
            className="border border-harvics-gold/40 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy"
          >
            Refresh
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void importSelected()}
            className="bg-harvics-gold px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy disabled:opacity-50"
          >
            {busy ? 'Importing…' : 'Import selected'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}
      {msg && (
        <div className="mb-4 border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{msg}</div>
      )}

      <div className="border border-harvics-gold/25 bg-white">
        {loading ? (
          <p className="px-4 py-8 text-center text-harvics-burgundy/50">Loading HarvyX…</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-harvics-gold/20 text-[10px] uppercase tracking-[0.14em] text-harvics-burgundy/50">
                <th className="px-4 py-3">Pick</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Country</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l, i) => {
                const key = String(l.id || l.email || i)
                return (
                  <tr key={key} className="border-b border-harvics-gold/10">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={!!selected[key]}
                        onChange={(e) => setSelected((s) => ({ ...s, [key]: e.target.checked }))}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-harvics-burgundy">{l.company || '—'}</td>
                    <td className="px-4 py-3 text-harvics-burgundy/70">{l.contactName || l.name || '—'}</td>
                    <td className="px-4 py-3 text-harvics-burgundy/70">{l.email || '—'}</td>
                    <td className="px-4 py-3 text-harvics-burgundy/70">{l.country || '—'}</td>
                  </tr>
                )
              })}
              {!rows.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-harvics-burgundy/50">
                    No HarvyX leads returned.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
