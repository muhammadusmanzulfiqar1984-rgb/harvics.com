'use client'

/**
 * Customer 360 — contacts, credit limit, orders, AR link, activities.
 */
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useParams } from 'next/navigation'

type Customer = {
  id: string
  name: string
  segment?: string
  segmentText?: string
  country?: string
  city?: string
  contactEmail?: string
  creditRating?: string
  lifetimeValue?: number
}

type Contact = {
  id: string
  name: string
  title?: string | null
  email?: string | null
  phone?: string | null
  isPrimary?: boolean
}

type Credit = {
  approvedLimit: number
  usedAmount: number
  availableAmount: number
  currency: string
  basis?: string | null
  notes?: string | null
} | null

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token || 'demo-token-company_admin'}`,
  }
}

async function api(path: string, init?: RequestInit) {
  const r = await fetch(path, {
    cache: 'no-store',
    ...init,
    headers: { ...authHeaders(), ...(init?.headers || {}) },
  })
  const j = await r.json()
  if (!r.ok || j.success === false) throw new Error(j.error || `HTTP ${r.status}`)
  return j
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

export default function Customer360Page() {
  const locale = useLocale()
  const params = useParams()
  const id = String(params?.id || '')
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [credit, setCredit] = useState<Credit>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const [contactForm, setContactForm] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    isPrimary: false,
  })
  const [creditForm, setCreditForm] = useState({
    approvedLimit: '',
    usedAmount: '0',
    currency: 'USD',
    notes: '',
  })
  const [actForm, setActForm] = useState({
    type: 'note',
    subject: '',
    body: '',
  })

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const [c, a, ct, cr, o] = await Promise.all([
        api(`/api/crm/customers/${encodeURIComponent(id)}`),
        api(`/api/wave8/activities?customerId=${encodeURIComponent(id)}`).catch(() => ({ data: [] })),
        api(`/api/crm/customers/${encodeURIComponent(id)}/contacts`).catch(() => ({ data: [] })),
        api(`/api/crm/customers/${encodeURIComponent(id)}/credit`).catch(() => ({ data: null })),
        api(`/api/crm/customers/${encodeURIComponent(id)}/orders`).catch(() => ({ data: [] })),
      ])
      setCustomer(c.data)
      setActivities(a.data || [])
      setContacts(ct.data || [])
      setCredit(cr.data)
      setOrders(o.data || [])
      if (cr.data) {
        setCreditForm({
          approvedLimit: String(cr.data.approvedLimit ?? ''),
          usedAmount: String(cr.data.usedAmount ?? 0),
          currency: cr.data.currency || 'USD',
          notes: cr.data.notes || '',
        })
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load customer')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const addContact = async () => {
    try {
      setError(null)
      setMessage('')
      if (!contactForm.name.trim()) throw new Error('Contact name required')
      await api(`/api/crm/customers/${encodeURIComponent(id)}/contacts`, {
        method: 'POST',
        body: JSON.stringify({
          name: contactForm.name.trim(),
          title: contactForm.title || null,
          email: contactForm.email || null,
          phone: contactForm.phone || null,
          isPrimary: contactForm.isPrimary,
        }),
      })
      setContactForm({ name: '', title: '', email: '', phone: '', isPrimary: false })
      setMessage('Contact added')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const saveCredit = async () => {
    try {
      setError(null)
      setMessage('')
      const limit = Number(creditForm.approvedLimit)
      if (!(limit > 0)) throw new Error('Approved credit limit must be positive')
      await api(`/api/crm/customers/${encodeURIComponent(id)}/credit`, {
        method: 'PUT',
        body: JSON.stringify({
          approvedLimit: limit,
          usedAmount: Number(creditForm.usedAmount) || 0,
          currency: creditForm.currency || 'USD',
          notes: creditForm.notes || null,
        }),
      })
      setMessage('Credit limit saved')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const logActivity = async () => {
    try {
      setError(null)
      setMessage('')
      if (!actForm.subject.trim()) throw new Error('Activity subject required')
      await api('/api/wave8/activities', {
        method: 'POST',
        body: JSON.stringify({
          type: actForm.type,
          subject: actForm.subject.trim(),
          body: actForm.body || undefined,
          customerId: id,
        }),
      })
      setActForm({ type: 'note', subject: '', body: '' })
      setMessage('Activity logged')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-harvics-gold">CRM · Customer 360</p>
          <h2 className="mt-1 font-serif text-2xl text-harvics-burgundy">
            {loading ? 'Loading…' : customer?.name || 'Customer'}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {customer?.name ? (
            <Link
              href={`/${locale}/os/ar/customers/${encodeURIComponent(customer.name)}`}
              className="border border-harvics-gold/50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy hover:border-harvics-gold"
            >
              AR statement
            </Link>
          ) : null}
          <Link
            href={`/${locale}/os/crm`}
            className="border border-harvics-gold/40 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy hover:border-harvics-gold"
          >
            CRM
          </Link>
          <Link
            href={`/${locale}/os/pipeline`}
            className="border border-harvics-gold/40 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-harvics-burgundy hover:border-harvics-gold"
          >
            Pipeline
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}
      {message && (
        <div className="mb-4 border border-harvics-gold/40 bg-harvics-cream px-4 py-3 text-sm text-harvics-burgundy">
          {message}
        </div>
      )}

      {customer && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            ['Segment', customer.segmentText || customer.segment || '—'],
            ['Country', customer.country || '—'],
            ['City', customer.city || '—'],
            ['Email', customer.contactEmail || '—'],
            ['Credit rating', customer.creditRating || '—'],
            [
              'Lifetime value',
              typeof customer.lifetimeValue === 'number'
                ? customer.lifetimeValue.toLocaleString()
                : '—',
            ],
          ].map(([label, value]) => (
            <div key={label} className="border border-harvics-gold/25 bg-white px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-burgundy/45">
                {label}
              </p>
              <p className="mt-2 text-[15px] font-medium text-harvics-burgundy">{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="border border-harvics-gold/25 bg-white">
          <div className="border-b border-harvics-gold/20 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-burgundy/50">
            Contacts
          </div>
          <ul className="divide-y divide-harvics-gold/10">
            {contacts.map((c) => (
              <li key={c.id} className="px-4 py-3 text-sm text-harvics-burgundy">
                <span className="font-semibold">{c.name}</span>
                {c.isPrimary ? (
                  <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-harvics-gold">
                    Primary
                  </span>
                ) : null}
                <p className="mt-1 text-[13px] text-harvics-burgundy/60">
                  {[c.title, c.email, c.phone].filter(Boolean).join(' · ') || '—'}
                </p>
              </li>
            ))}
            {!contacts.length && (
              <li className="px-4 py-4 text-center text-sm text-harvics-burgundy/45">No contacts yet</li>
            )}
          </ul>
          <div className="grid gap-2 border-t border-harvics-gold/15 p-4 sm:grid-cols-2">
            <input
              className="border border-harvics-burgundy/20 px-3 py-2 text-sm"
              placeholder="Name *"
              value={contactForm.name}
              onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              className="border border-harvics-burgundy/20 px-3 py-2 text-sm"
              placeholder="Title"
              value={contactForm.title}
              onChange={(e) => setContactForm((f) => ({ ...f, title: e.target.value }))}
            />
            <input
              className="border border-harvics-burgundy/20 px-3 py-2 text-sm"
              placeholder="Email"
              value={contactForm.email}
              onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
            />
            <input
              className="border border-harvics-burgundy/20 px-3 py-2 text-sm"
              placeholder="Phone"
              value={contactForm.phone}
              onChange={(e) => setContactForm((f) => ({ ...f, phone: e.target.value }))}
            />
            <label className="flex items-center gap-2 text-[12px] text-harvics-burgundy/70 sm:col-span-2">
              <input
                type="checkbox"
                checked={contactForm.isPrimary}
                onChange={(e) => setContactForm((f) => ({ ...f, isPrimary: e.target.checked }))}
              />
              Primary contact
            </label>
            <button
              type="button"
              onClick={() => void addContact()}
              className="bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream sm:col-span-2"
            >
              Add contact
            </button>
          </div>
        </div>

        <div className="border border-harvics-gold/25 bg-white">
          <div className="border-b border-harvics-gold/20 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-burgundy/50">
            Credit limit
          </div>
          <div className="space-y-3 p-4">
            {credit ? (
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-harvics-burgundy/45">Approved</p>
                  <p className="font-mono font-semibold">
                    {credit.approvedLimit.toLocaleString()} {credit.currency}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-harvics-burgundy/45">Used</p>
                  <p className="font-mono">{credit.usedAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-harvics-burgundy/45">Available</p>
                  <p className="font-mono font-semibold text-harvics-gold">
                    {credit.availableAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-harvics-burgundy/50">No credit limit set — orders may still convert without hold.</p>
            )}
            <input
              className="w-full border border-harvics-burgundy/20 px-3 py-2 text-sm"
              placeholder="Approved limit *"
              type="number"
              value={creditForm.approvedLimit}
              onChange={(e) => setCreditForm((f) => ({ ...f, approvedLimit: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 px-3 py-2 text-sm"
              placeholder="Used amount"
              type="number"
              value={creditForm.usedAmount}
              onChange={(e) => setCreditForm((f) => ({ ...f, usedAmount: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 px-3 py-2 text-sm"
              placeholder="Currency"
              value={creditForm.currency}
              onChange={(e) => setCreditForm((f) => ({ ...f, currency: e.target.value }))}
            />
            <input
              className="w-full border border-harvics-burgundy/20 px-3 py-2 text-sm"
              placeholder="Notes"
              value={creditForm.notes}
              onChange={(e) => setCreditForm((f) => ({ ...f, notes: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => void saveCredit()}
              className="w-full bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
            >
              Save credit limit
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 border border-harvics-gold/25 bg-white">
        <div className="border-b border-harvics-gold/20 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-burgundy/50">
          Orders
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-harvics-gold/15 text-left text-[10px] uppercase tracking-[0.12em] text-harvics-burgundy/50">
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Channel</th>
                <th className="px-4 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={o.id} className={i % 2 ? 'bg-harvics-cream/30' : 'bg-white'}>
                  <td className="px-4 py-2 font-semibold text-harvics-burgundy">{o.status}</td>
                  <td className="px-4 py-2 font-mono">{fmt(o.amount)}</td>
                  <td className="px-4 py-2 text-harvics-burgundy/70">{o.channel || '—'}</td>
                  <td className="px-4 py-2 text-harvics-burgundy/50">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
              {!orders.length ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-harvics-burgundy/45">
                    No orders linked to this customer
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-3 border border-harvics-gold/25 bg-harvics-cream/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-gold">Log activity</p>
          <select
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            value={actForm.type}
            onChange={(e) => setActForm((f) => ({ ...f, type: e.target.value }))}
          >
            {['note', 'call', 'email', 'meeting', 'task', 'demo'].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Subject *"
            value={actForm.subject}
            onChange={(e) => setActForm((f) => ({ ...f, subject: e.target.value }))}
          />
          <textarea
            className="w-full border border-harvics-burgundy/20 bg-white px-3 py-2 text-sm"
            placeholder="Body"
            rows={3}
            value={actForm.body}
            onChange={(e) => setActForm((f) => ({ ...f, body: e.target.value }))}
          />
          <button
            type="button"
            onClick={() => void logActivity()}
            className="w-full bg-harvics-burgundy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-harvics-cream"
          >
            Post activity
          </button>
        </div>

        <div className="border border-harvics-gold/25 bg-white">
          <div className="border-b border-harvics-gold/20 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-harvics-burgundy/50">
            Recent activities
          </div>
          <ul className="divide-y divide-harvics-gold/10">
            {activities.map((a) => (
              <li key={a.id} className="px-4 py-3 text-sm text-harvics-burgundy">
                <span className="font-semibold">{a.subject}</span>
                <span className="text-harvics-burgundy/45"> · {a.type}</span>
                {a.body && <p className="mt-1 text-[13px] text-harvics-burgundy/60">{a.body}</p>}
              </li>
            ))}
            {!activities.length && (
              <li className="px-4 py-6 text-center text-sm text-harvics-burgundy/45">
                No activities yet — log one on the left.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
