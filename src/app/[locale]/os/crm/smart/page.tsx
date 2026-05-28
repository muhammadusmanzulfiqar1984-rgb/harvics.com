'use client'
/**
 * SMART CRM — AI-powered lead management (Groq Llama 3.3 70B)
 * Features: lead list, AI scoring, email drafting, activity timeline, pipeline view.
 */
import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { useCountry } from '@/contexts/CountryContext'
import { getCurrency } from '@/config/localeConfig'

const B = '#6B1F2B'
const G = '#C9A84C'

interface Lead {
  id: string
  company: string
  contact?: string | null
  email?: string | null
  stage: string
  value: number
  source?: string | null
  notes?: string | null
  aiScore?: number | null
  aiTier?: string | null
  aiScoredAt?: string | null
}

interface Insight {
  score: number
  tier: 'Hot' | 'Warm' | 'Cool' | 'Cold'
  reasoning: string
  nextAction: string
  aiGenerated: boolean
}

async function api(path: string, init?: RequestInit, marketHeaders?: Record<string, string>) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  const authHeader: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : { Authorization: 'Bearer demo-token-company_admin' } // dev fallback
  const r = await fetch(path, {
    cache: 'no-store',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...(marketHeaders || {}),
      ...(init?.headers || {}),
    },
  })
  const j = await r.json()
  if (!r.ok || j.success === false) throw new Error(j.error || `HTTP ${r.status}`)
  return j
}

const TIER_COLORS: Record<string, { bg: string; fg: string }> = {
  Hot: { bg: '#FEE2E2', fg: '#991B1B' },
  Warm: { bg: '#FEF3C7', fg: '#92400E' },
  Cool: { bg: '#DBEAFE', fg: '#1E40AF' },
  Cold: { bg: '#E5E7EB', fg: '#374151' },
}

function TierPill({ tier }: { tier?: string | null }) {
  if (!tier) return <span style={{ fontSize: 10, color: '#888' }}>—</span>
  const c = TIER_COLORS[tier] || TIER_COLORS.Cool
  return <span style={{ background: c.bg, color: c.fg, padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700 }}>{tier.toUpperCase()}</span>
}

export default function SmartCRM() {
  const locale = useLocale()
  const { selectedCountry, countryData } = useCountry()
  const [leads, setLeads] = useState<Lead[]>([])
  const [pipeline, setPipeline] = useState<any>(null)
  const [aiHealth, setAiHealth] = useState<any>(null)
  const [selected, setSelected] = useState<Lead | null>(null)
  const [timeline, setTimeline] = useState<any>(null)
  const [insight, setInsight] = useState<Insight | null>(null)
  const [draft, setDraft] = useState<any>(null)
  const [busy, setBusy] = useState<string>('')
  const [form, setForm] = useState({ company: '', contact: '', email: '', value: 0, source: 'Inbound', stage: 'Lead', notes: '' })
  const [activityForm, setActivityForm] = useState({ type: 'note', subject: '', body: '', outcome: 'neutral' })
  const [usdEquiv, setUsdEquiv] = useState<number | null>(null)

  const marketCurrency = (countryData?.currency?.code || getCurrency(locale) || 'USD').toUpperCase()
  const marketCountry = (selectedCountry || 'US').toUpperCase()
  const marketHeaders = {
    'x-locale': locale,
    'x-country': marketCountry,
    'x-currency': marketCurrency,
    'x-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  }

  const formatMoney = (value: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: marketCurrency, maximumFractionDigits: 0 }).format(value || 0)

  const formatDate = (value: string | Date) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).format(new Date(value))

  const load = async () => {
    const [l, p, h] = await Promise.all([
      api('/api/wave8/leads', undefined, marketHeaders),
      api('/api/wave8/pipeline', undefined, marketHeaders),
      api('/api/wave8/ai/health', undefined, marketHeaders),
    ])
    setLeads(l.data || [])
    setPipeline(p.data)
    setAiHealth(h)
  }
  useEffect(() => { void load() }, [locale, selectedCountry, countryData?.currency?.code])

  // Convert pipeline total → USD via backend FX
  useEffect(() => {
    if (!pipeline?.totals?.totalPipelineValue || marketCurrency === 'USD') {
      setUsdEquiv(null)
      return
    }
    fetch(`/api/services/fx/convert?from=${marketCurrency}&to=USD&amount=${pipeline.totals.totalPipelineValue}`)
      .then(r => r.json())
      .then(j => { if (j?.success) setUsdEquiv(j.amount) })
      .catch(() => setUsdEquiv(null))
  }, [pipeline?.totals?.totalPipelineValue, marketCurrency])

  const openLead = async (lead: Lead) => {
    setSelected(lead)
    setInsight(null)
    setDraft(null)
    const t = await api(`/api/wave8/leads/${lead.id}/timeline`, undefined, marketHeaders)
    setTimeline(t)
  }

  const createLead = async () => {
    if (!form.company) return alert('Company required')
    setBusy('create')
    try {
      await api('/api/wave8/leads', { method: 'POST', body: JSON.stringify({ ...form, value: +form.value || 0, email: form.email || null }) }, marketHeaders)
      setForm({ company: '', contact: '', email: '', value: 0, source: 'Inbound', stage: 'Lead', notes: '' })
      await load()
    } catch (e: any) { alert(e.message) } finally { setBusy('') }
  }

  const scoreLead = async (id: string) => {
    setBusy('score-' + id)
    try {
      const r = await api(`/api/wave8/leads/${id}/score`, { method: 'POST' }, marketHeaders)
      setInsight(r.insight)
      await load()
      if (selected?.id === id) await openLead({ ...selected, aiScore: r.data.aiScore, aiTier: r.data.aiTier })
    } catch (e: any) { alert(e.message) } finally { setBusy('') }
  }

  const bulkScore = async () => {
    setBusy('bulk')
    try {
      const r = await api('/api/wave8/leads/bulk-score', { method: 'POST' }, marketHeaders)
      alert(`Scored ${r.scored} leads ${r.aiEnabled ? 'with Groq AI 🚀' : '(heuristic fallback — add GROQ_API_KEY)'}`)
      await load()
    } catch (e: any) { alert(e.message) } finally { setBusy('') }
  }

  const draftMail = async (purpose: string) => {
    if (!selected) return
    setBusy('draft')
    try {
      const r = await api(`/api/wave8/leads/${selected.id}/email-draft`, { method: 'POST', body: JSON.stringify({ purpose }) }, marketHeaders)
      setDraft(r.data)
    } catch (e: any) { alert(e.message) } finally { setBusy('') }
  }

  const logActivity = async () => {
    if (!selected || !activityForm.subject) return
    setBusy('activity')
    try {
      await api('/api/wave8/activities', { method: 'POST', body: JSON.stringify({ ...activityForm, leadId: selected.id }) }, marketHeaders)
      setActivityForm({ type: 'note', subject: '', body: '', outcome: 'neutral' })
      await openLead(selected)
    } catch (e: any) { alert(e.message) } finally { setBusy('') }
  }

  const convertLead = async () => {
    if (!selected) return
    if (!confirm(`Convert "${selected.company}" to Deal?`)) return
    setBusy('convert')
    try {
      const r = await api(`/api/wave8/leads/${selected.id}/convert`, { method: 'POST' }, marketHeaders)
      alert(r.message)
      await load()
      setSelected(null); setTimeline(null)
    } catch (e: any) { alert(e.message) } finally { setBusy('') }
  }

  const inp: React.CSSProperties = { padding: '6px 8px', border: `1px solid ${B}33`, fontSize: 12, background: '#fff', color: '#111' }
  const btn: React.CSSProperties = { padding: '8px 14px', background: B, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 12, letterSpacing: '0.05em' }
  const btnGhost: React.CSSProperties = { ...btn, background: 'transparent', color: B, border: `1px solid ${B}` }
  const panel: React.CSSProperties = { background: '#fff', border: `1px solid ${B}22`, padding: 16, marginBottom: 12 }

  return (
    <div style={{ padding: 16, background: '#F5F1E8', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* HEADER + AI STATUS */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 10, color: G, letterSpacing: '0.15em', fontWeight: 700 }}>WAVE 8 · SMART CRM</div>
          <h1 style={{ fontSize: 28, color: B, margin: 0, fontWeight: 800 }}>AI Lead Pipeline</h1>
          <div style={{ fontSize: 12, color: '#666' }}>Lead scoring + email drafting + activity timeline — powered by Groq Llama 3.3 70B</div>
          <div style={{ fontSize: 11, color: '#888' }}>Market: {marketCountry} · Locale: {locale} · Currency: {marketCurrency}</div>
        </div>
        <div style={{ ...panel, marginBottom: 0, padding: '10px 14px' }}>
          {aiHealth?.aiEnabled ? (
            <div>
              <div style={{ fontSize: 10, color: G, fontWeight: 700, letterSpacing: '0.1em' }}>🟢 AI ONLINE</div>
              <div style={{ fontSize: 11, color: B, fontFamily: 'monospace' }}>{aiHealth.model}</div>
              <div style={{ fontSize: 10, color: '#888' }}>via {aiHealth.provider}</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 10, color: '#999', fontWeight: 700 }}>⚪ AI OFFLINE — heuristic only</div>
              <div style={{ fontSize: 10, color: '#888' }}>Add GROQ_API_KEY to .env.local</div>
            </div>
          )}
        </div>
      </div>

      {/* PIPELINE METRICS */}
      {pipeline && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
          <div style={panel}>
            <div style={{ fontSize: 10, color: G, fontWeight: 700 }}>TOTAL PIPELINE</div>
            <div style={{ fontSize: 28, color: B, fontWeight: 800 }}>{formatMoney(pipeline.totals.totalPipelineValue || 0)}</div>
            {usdEquiv !== null && (
              <div style={{ fontSize: 11, color: '#0F766E', fontWeight: 600 }}>
                ≈ {new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(usdEquiv)} USD
              </div>
            )}
            <div style={{ fontSize: 11, color: '#666' }}>Leads {formatMoney(pipeline.totals.totalLeadValue)} + Deals {formatMoney(pipeline.totals.totalDealValue)}</div>
          </div>
          <div style={panel}>
            <div style={{ fontSize: 10, color: G, fontWeight: 700 }}>LEADS BY STAGE</div>
            {pipeline.leads.length === 0 ? <div style={{ fontSize: 11, color: '#888' }}>No leads yet</div> : pipeline.leads.map((s: any) => (
              <div key={s.stage} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '2px 0' }}>
                <span style={{ color: '#111' }}>{s.stage}</span>
                <span style={{ color: B, fontWeight: 700 }}>{s.count}</span>
              </div>
            ))}
          </div>
          <div style={panel}>
            <div style={{ fontSize: 10, color: G, fontWeight: 700 }}>AI TIERS</div>
            {pipeline.aiTiers.length === 0 ? <div style={{ fontSize: 11, color: '#888' }}>Score leads to see breakdown</div> : pipeline.aiTiers.map((t: any) => (
              <div key={t.tier} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '2px 0', alignItems: 'center' }}>
                <TierPill tier={t.tier} />
                <span style={{ color: B, fontWeight: 700 }}>{t.count}</span>
              </div>
            ))}
          </div>
          <div style={panel}>
            <div style={{ fontSize: 10, color: G, fontWeight: 700 }}>QUICK ACTIONS</div>
            <button onClick={bulkScore} disabled={busy === 'bulk'} style={{ ...btn, width: '100%', marginTop: 6 }}>
              {busy === 'bulk' ? '🧠 Scoring…' : '🧠 AI-SCORE ALL LEADS'}
            </button>
            <div style={{ fontSize: 10, color: '#888', marginTop: 6 }}>Scores up to 25 leads per call</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 12 }}>
        {/* LEFT COLUMN — LIST + NEW */}
        <div>
          <div style={panel}>
            <div style={{ fontSize: 10, color: G, fontWeight: 700, marginBottom: 8 }}>NEW LEAD</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input style={inp} placeholder="Company *" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
              <input style={inp} placeholder="Contact" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
              <input style={inp} placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <input style={inp} placeholder={`Value (${marketCurrency})`} type="number" value={form.value} onChange={e => setForm({ ...form, value: +e.target.value })} />
              <select style={inp} value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
                {['Inbound', 'Referral', 'Outbound', 'Event', 'Partner', 'Demo'].map(s => <option key={s}>{s}</option>)}
              </select>
              <select style={inp} value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}>
                {['Lead', 'Qualified', 'Proposal', 'Negotiation'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <textarea style={{ ...inp, width: '100%', marginTop: 8, minHeight: 50 }} placeholder="Notes (helps AI score better)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            <button onClick={createLead} disabled={busy === 'create'} style={{ ...btn, marginTop: 8 }}>+ ADD LEAD</button>
          </div>

          <div style={panel}>
            <div style={{ fontSize: 10, color: G, fontWeight: 700, marginBottom: 8 }}>LEADS ({leads.length})</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${B}33`, textAlign: 'left' }}>
                  <th style={{ padding: 6 }}>Company</th>
                  <th style={{ padding: 6 }}>Stage</th>
                  <th style={{ padding: 6, textAlign: 'right' }}>Value</th>
                  <th style={{ padding: 6, textAlign: 'center' }}>AI Score</th>
                  <th style={{ padding: 6 }}>Tier</th>
                  <th style={{ padding: 6 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid #6B1F2B11', background: selected?.id === l.id ? '#F5F1E8' : '#fff', cursor: 'pointer' }} onClick={() => openLead(l)}>
                    <td style={{ padding: 6 }}>
                      <div style={{ fontWeight: 700, color: B }}>{l.company}</div>
                      <div style={{ fontSize: 10, color: '#888' }}>{l.contact || '—'} · {l.source || '—'}</div>
                    </td>
                    <td style={{ padding: 6 }}>{l.stage}</td>
                    <td style={{ padding: 6, textAlign: 'right', fontWeight: 700, color: B }}>{formatMoney(l.value)}</td>
                    <td style={{ padding: 6, textAlign: 'center', fontWeight: 700, fontSize: 16, color: (l.aiScore ?? 0) >= 75 ? '#991B1B' : (l.aiScore ?? 0) >= 55 ? '#92400E' : '#666' }}>
                      {l.aiScore ?? '—'}
                    </td>
                    <td style={{ padding: 6 }}><TierPill tier={l.aiTier} /></td>
                    <td style={{ padding: 6 }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => scoreLead(l.id)} disabled={busy === 'score-' + l.id} style={{ ...btnGhost, padding: '4px 8px', fontSize: 10 }}>
                        {busy === 'score-' + l.id ? '…' : '🧠 SCORE'}
                      </button>
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: '#888' }}>No leads yet — create one above ↑</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN — LEAD DETAIL */}
        {selected && (
          <div>
            <div style={panel}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 10, color: G, fontWeight: 700 }}>LEAD DETAIL</div>
                  <h2 style={{ fontSize: 22, color: B, margin: '4px 0' }}>{selected.company}</h2>
                  <div style={{ fontSize: 12, color: '#666' }}>{selected.contact} · {selected.email || 'no email'}</div>
                </div>
                <button onClick={() => { setSelected(null); setTimeline(null) }} style={{ ...btnGhost, padding: '4px 10px' }}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 12 }}>
                <div><div style={{ fontSize: 10, color: G, fontWeight: 700 }}>VALUE</div><div style={{ fontSize: 18, color: B, fontWeight: 700 }}>{formatMoney(selected.value)}</div></div>
                <div><div style={{ fontSize: 10, color: G, fontWeight: 700 }}>STAGE</div><div style={{ fontSize: 14 }}>{selected.stage}</div></div>
                <div><div style={{ fontSize: 10, color: G, fontWeight: 700 }}>AI TIER</div><div><TierPill tier={selected.aiTier} /> <span style={{ fontWeight: 700 }}>{selected.aiScore ?? '—'}</span></div></div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                <button onClick={() => scoreLead(selected.id)} disabled={busy.startsWith('score')} style={btn}>{busy.startsWith('score') ? '…' : '🧠 RE-SCORE'}</button>
                <button onClick={() => draftMail('follow_up')} disabled={busy === 'draft'} style={btnGhost}>✉ FOLLOW-UP</button>
                <button onClick={() => draftMail('demo_request')} disabled={busy === 'draft'} style={btnGhost}>✉ DEMO REQ</button>
                <button onClick={() => draftMail('objection_handle')} disabled={busy === 'draft'} style={btnGhost}>✉ OBJECTION</button>
                <button onClick={convertLead} disabled={busy === 'convert' || selected.stage === 'Converted'} style={{ ...btn, background: '#0F766E' }}>{selected.stage === 'Converted' ? 'CONVERTED ✓' : '→ CONVERT TO DEAL'}</button>
              </div>
            </div>

            {insight && (
              <div style={panel}>
                <div style={{ fontSize: 10, color: G, fontWeight: 700 }}>🧠 AI INSIGHT {insight.aiGenerated ? '(Groq Llama 3.3 70B)' : '(heuristic fallback)'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <TierPill tier={insight.tier} />
                  <span style={{ fontSize: 26, fontWeight: 800, color: B }}>{insight.score}/100</span>
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: '#222' }}><b>Why:</b> {insight.reasoning}</div>
                <div style={{ marginTop: 4, fontSize: 12, color: '#222' }}><b>Next:</b> {insight.nextAction}</div>
              </div>
            )}

            {draft && (
              <div style={panel}>
                <div style={{ fontSize: 10, color: G, fontWeight: 700 }}>✉ AI EMAIL DRAFT — {draft.purpose} {draft.aiGenerated ? '(Groq)' : '(template)'}</div>
                <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: B }}>{draft.subject}</div>
                <pre style={{ marginTop: 6, fontSize: 12, whiteSpace: 'pre-wrap', fontFamily: 'inherit', background: '#F5F1E8', padding: 10, color: '#222' }}>{draft.body}</pre>
              </div>
            )}

            {timeline?.aiSummary?.summary && (
              <div style={panel}>
                <div style={{ fontSize: 10, color: G, fontWeight: 700 }}>📊 AI SUMMARY {timeline.aiSummary.aiGenerated ? '(Groq)' : ''}</div>
                <div style={{ marginTop: 6, fontSize: 13, color: '#222', fontStyle: 'italic' }}>{timeline.aiSummary.summary}</div>
              </div>
            )}

            <div style={panel}>
              <div style={{ fontSize: 10, color: G, fontWeight: 700, marginBottom: 8 }}>LOG ACTIVITY</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <select style={inp} value={activityForm.type} onChange={e => setActivityForm({ ...activityForm, type: e.target.value })}>
                  {['note', 'call', 'email', 'meeting', 'task', 'demo'].map(t => <option key={t}>{t}</option>)}
                </select>
                <select style={inp} value={activityForm.outcome} onChange={e => setActivityForm({ ...activityForm, outcome: e.target.value })}>
                  {['positive', 'neutral', 'negative', 'no_show'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <input style={{ ...inp, width: '100%', marginTop: 8 }} placeholder="Subject *" value={activityForm.subject} onChange={e => setActivityForm({ ...activityForm, subject: e.target.value })} />
              <textarea style={{ ...inp, width: '100%', marginTop: 8, minHeight: 50 }} placeholder="Notes" value={activityForm.body} onChange={e => setActivityForm({ ...activityForm, body: e.target.value })} />
              <button onClick={logActivity} disabled={busy === 'activity'} style={{ ...btn, marginTop: 8 }}>+ LOG ACTIVITY</button>
            </div>

            <div style={panel}>
              <div style={{ fontSize: 10, color: G, fontWeight: 700, marginBottom: 8 }}>TIMELINE ({timeline?.activities?.length || 0})</div>
              {!timeline?.activities?.length ? (
                <div style={{ fontSize: 12, color: '#888', padding: 12 }}>No activities logged yet</div>
              ) : (
                timeline.activities.map((a: any) => (
                  <div key={a.id} style={{ padding: 8, borderBottom: '1px solid #6B1F2B11' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: B, textTransform: 'uppercase' }}>{a.type}</span>
                      <span style={{ fontSize: 10, color: '#888' }}>{formatDate(a.occurredAt)}</span>
                    </div>
                    <div style={{ fontSize: 13, marginTop: 2, color: '#111' }}>{a.subject}</div>
                    {a.body && <div style={{ fontSize: 11, marginTop: 2, color: '#444' }}>{a.body}</div>}
                    {a.outcome && <div style={{ fontSize: 10, marginTop: 2, color: a.outcome === 'positive' ? '#0F766E' : a.outcome === 'negative' ? '#991B1B' : '#666' }}>outcome: {a.outcome}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
