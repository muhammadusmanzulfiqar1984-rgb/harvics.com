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
const G = '#C3A35E'

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

  const STAGES = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Converted']
  const STAGE_COLORS: Record<string, string> = {
    Lead: '#64748B', Qualified: '#0EA5E9', Proposal: '#8B5CF6', Negotiation: '#F59E0B', Converted: '#10B981',
  }

  const leadsByStage = STAGES.reduce((acc, s) => {
    acc[s] = leads.filter(l => l.stage === s)
    return acc
  }, {} as Record<string, Lead[]>)

  const tierCounts = leads.reduce((acc: Record<string, number>, l) => {
    if (l.aiTier) acc[l.aiTier] = (acc[l.aiTier] || 0) + 1
    return acc
  }, {})
  const avgScore = leads.filter(l => l.aiScore != null).reduce((s, l) => s + (l.aiScore || 0), 0) / Math.max(1, leads.filter(l => l.aiScore != null).length)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0F0F1A 0%, #1A1421 100%)',
      fontFamily: '-apple-system, "Inter", "Segoe UI", sans-serif',
      color: '#E8E6E1',
      paddingBottom: 60,
    }}>
      {/* ─── HERO BAND ─── */}
      <div style={{
        background: `linear-gradient(135deg, ${B} 0%, #4A1420 50%, #2A0E18 100%)`,
        padding: '32px 32px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        {/* Glow orb */}
        <div style={{
          position: 'absolute', top: -120, right: -80, width: 400, height: 400,
          background: `radial-gradient(circle, ${G}33 0%, transparent 70%)`, pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: `${G}22`, border: `1px solid ${G}55`, borderRadius: 999, fontSize: 10, color: G, fontWeight: 700, letterSpacing: '0.18em' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: G, boxShadow: `0 0 10px ${G}` }} />
              WAVE 8 · SMART CRM
            </div>
            <h1 style={{ fontSize: 44, margin: '14px 0 6px', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.05 }}>
              Pipeline Intelligence
            </h1>
            <div style={{ fontSize: 14, color: '#D4C9B5', maxWidth: 600 }}>
              AI-scored leads · live email drafting · activity intelligence — running on Groq Llama 3.3 70B in {locale.toUpperCase()}, optimized for {marketCountry} market.
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
              <Chip label="Market" value={marketCountry} />
              <Chip label="Locale" value={locale.toUpperCase()} />
              <Chip label="Currency" value={marketCurrency} />
              <Chip label="Leads" value={String(leads.length)} />
            </div>
          </div>

          {/* AI Status pulse panel */}
          <div style={{
            background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)',
            border: aiHealth?.aiEnabled ? `1px solid ${G}55` : '1px solid #ffffff20',
            borderRadius: 16, padding: '16px 20px', minWidth: 240,
            boxShadow: aiHealth?.aiEnabled ? `0 0 40px ${G}22` : 'none',
          }}>
            {aiHealth?.aiEnabled ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 12px #10B981', animation: 'pulse 2s infinite' }} />
                  <span style={{ fontSize: 11, color: G, fontWeight: 700, letterSpacing: '0.15em' }}>AI ONLINE</span>
                </div>
                <div style={{ fontSize: 13, color: '#fff', fontFamily: 'JetBrains Mono, Menlo, monospace', marginTop: 6, fontWeight: 600 }}>{aiHealth.model}</div>
                <div style={{ fontSize: 10, color: '#9C8C7A', marginTop: 2 }}>provider · {aiHealth.provider}</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 11, color: '#FCA5A5', fontWeight: 700, letterSpacing: '0.1em' }}>⚪ AI OFFLINE</div>
                <div style={{ fontSize: 10, color: '#9C8C7A', marginTop: 4 }}>Set GROQ_API_KEY in .env.local</div>
              </>
            )}
            <button
              onClick={bulkScore}
              disabled={busy === 'bulk' || !leads.length}
              style={{
                marginTop: 12, width: '100%', padding: '10px 14px',
                background: `linear-gradient(135deg, ${G} 0%, #E0B85F 100%)`,
                color: '#3A1A22', border: 'none', borderRadius: 10,
                fontSize: 12, fontWeight: 800, letterSpacing: '0.08em',
                cursor: busy === 'bulk' || !leads.length ? 'not-allowed' : 'pointer',
                opacity: busy === 'bulk' || !leads.length ? 0.5 : 1,
                boxShadow: '0 4px 14px rgba(201,168,76,0.4)',
              }}
            >
              {busy === 'bulk' ? '🧠 SCORING…' : '🧠 SCORE ALL LEADS'}
            </button>
          </div>
        </div>
      </div>

      {/* ─── METRICS STRIP (overlapping hero) ─── */}
      {pipeline && (
        <div style={{ maxWidth: 1400, margin: '-50px auto 0', padding: '0 32px', position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <MetricCard
              label="TOTAL PIPELINE"
              value={formatMoney(pipeline.totals.totalPipelineValue || 0)}
              accent={G}
              sub={usdEquiv !== null
                ? `≈ ${new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(usdEquiv)} USD`
                : `${leads.length} leads · ${pipeline.totals.totalDealValue ? 'deals included' : ''}`}
              icon="💰"
            />
            <MetricCard
              label="AVG AI SCORE"
              value={isNaN(avgScore) ? '—' : `${Math.round(avgScore)}/100`}
              accent={avgScore >= 75 ? '#10B981' : avgScore >= 55 ? '#F59E0B' : '#64748B'}
              sub={isNaN(avgScore) ? 'no scored leads' : `from ${leads.filter(l=>l.aiScore!=null).length} scored leads`}
              icon="🧠"
              gauge={isNaN(avgScore) ? 0 : avgScore}
            />
            <MetricCard
              label="LEAD TIERS"
              value={String(Object.values(tierCounts).reduce((a, b) => a + b, 0) || 0)}
              accent="#8B5CF6"
              sub={Object.entries(tierCounts).map(([t, c]) => `${t}:${c}`).join(' · ') || 'unscored'}
              icon="🏷️"
            />
            <MetricCard
              label="PIPELINE HEALTH"
              value={`${Math.min(99, Math.round((leads.filter(l=>(l.aiScore||0)>=55).length / Math.max(1, leads.length)) * 100))}%`}
              accent="#0EA5E9"
              sub={`${leads.filter(l=>(l.aiScore||0)>=75).length} hot · ${leads.filter(l=>(l.aiScore||0)>=55 && (l.aiScore||0)<75).length} warm`}
              icon="❤️‍🔥"
            />
          </div>
        </div>
      )}

      {/* ─── KANBAN PIPELINE ─── */}
      <div style={{ maxWidth: 1400, margin: '32px auto 0', padding: '0 32px' }}>
        <SectionHeader title="PIPELINE BOARD" sub={`${leads.length} leads across ${STAGES.length} stages`} />
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STAGES.length}, 1fr)`, gap: 12 }}>
          {STAGES.map(stage => {
            const stageLeads = leadsByStage[stage] || []
            const stageValue = stageLeads.reduce((s, l) => s + (l.value || 0), 0)
            const color = STAGE_COLORS[stage]
            return (
              <div key={stage} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14, padding: 12, minHeight: 200,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 8, borderBottom: `2px solid ${color}` }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: '0.08em' }}>{stage.toUpperCase()}</div>
                    <div style={{ fontSize: 10, color: '#9C8C7A', marginTop: 2 }}>{stageLeads.length} · {formatMoney(stageValue)}</div>
                  </div>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
                    {stageLeads.length}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {stageLeads.length === 0 && <div style={{ fontSize: 11, color: '#564B40', padding: '20px 0', textAlign: 'center', fontStyle: 'italic' }}>empty</div>}
                  {stageLeads.map(l => <LeadCard key={l.id} lead={l} active={selected?.id === l.id} onClick={() => openLead(l)} formatMoney={formatMoney} stageColor={color} />)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── NEW LEAD FORM ─── */}
      <div style={{ maxWidth: 1400, margin: '32px auto 0', padding: '0 32px' }}>
        <SectionHeader title="ADD NEW LEAD" sub="AI will auto-score after creation" />
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14, padding: 20,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            <Field label="Company *" value={form.company} onChange={v => setForm({ ...form, company: v })} placeholder="Acme Corp" />
            <Field label="Contact" value={form.contact} onChange={v => setForm({ ...form, contact: v })} placeholder="John Smith" />
            <Field label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="john@acme.com" />
            <Field label={`Deal value (${marketCurrency})`} type="number" value={String(form.value || '')} onChange={v => setForm({ ...form, value: +v || 0 })} placeholder="50000" />
            <SelectField label="Source" value={form.source} onChange={v => setForm({ ...form, source: v })} options={['Inbound', 'Referral', 'Outbound', 'Event', 'Partner', 'Demo']} />
            <SelectField label="Stage" value={form.stage} onChange={v => setForm({ ...form, stage: v })} options={STAGES.filter(s => s !== 'Converted')} />
          </div>
          <div style={{ marginTop: 10 }}>
            <label style={{ display: 'block', fontSize: 10, color: G, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>NOTES — helps AI score better</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Mentioned enterprise tier · CFO concerned about budget · timeline Q3 2026"
              style={{
                width: '100%', minHeight: 60, padding: '10px 12px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, color: '#fff', fontSize: 13, fontFamily: 'inherit', resize: 'vertical',
              }}
            />
          </div>
          <button onClick={createLead} disabled={busy === 'create' || !form.company}
            style={{
              marginTop: 12, padding: '12px 24px',
              background: form.company ? `linear-gradient(135deg, ${B} 0%, #8B2A38 100%)` : '#3A2A2E',
              color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 12, fontWeight: 800, letterSpacing: '0.1em',
              cursor: form.company && busy !== 'create' ? 'pointer' : 'not-allowed',
              opacity: form.company ? 1 : 0.5,
              boxShadow: form.company ? '0 6px 20px rgba(107,31,43,0.4)' : 'none',
            }}>
            {busy === 'create' ? '✨ CREATING…' : '+ ADD LEAD'}
          </button>
        </div>
      </div>

      {/* ─── LEAD DETAIL DRAWER ─── */}
      {selected && (
        <div onClick={() => { setSelected(null); setTimeline(null) }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            zIndex: 50, display: 'flex', justifyContent: 'flex-end', animation: 'fadeIn 0.2s',
          }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: 720, background: '#1A1421',
            borderLeft: `1px solid ${G}33`, padding: 28, overflowY: 'auto',
            animation: 'slideIn 0.3s ease-out',
          }}>
            {/* Detail header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ padding: '3px 10px', background: STAGE_COLORS[selected.stage] + '33', color: STAGE_COLORS[selected.stage], borderRadius: 6, fontSize: 10, fontWeight: 800, letterSpacing: '0.1em' }}>{selected.stage.toUpperCase()}</span>
                  {selected.aiTier && <TierPillFancy tier={selected.aiTier} />}
                </div>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>{selected.company}</h2>
                <div style={{ fontSize: 13, color: '#9C8C7A', marginTop: 4 }}>
                  {selected.contact || '—'} {selected.email && `· ${selected.email}`}
                </div>
              </div>
              <button onClick={() => { setSelected(null); setTimeline(null) }} style={{ background: 'transparent', border: '1px solid #ffffff22', color: '#fff', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>

            {/* Score gauge + value */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 10, color: G, fontWeight: 700, letterSpacing: '0.1em' }}>DEAL VALUE</div>
                <div style={{ fontSize: 28, color: '#fff', fontWeight: 800, marginTop: 4 }}>{formatMoney(selected.value)}</div>
                <div style={{ fontSize: 11, color: '#9C8C7A', marginTop: 2 }}>{selected.source}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 10, color: G, fontWeight: 700, letterSpacing: '0.1em' }}>AI SCORE</div>
                {selected.aiScore != null ? (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 28, color: scoreColor(selected.aiScore), fontWeight: 800 }}>{selected.aiScore}</span>
                    <span style={{ fontSize: 14, color: '#564B40' }}>/100</span>
                  </div>
                ) : (
                  <div style={{ fontSize: 14, color: '#564B40', marginTop: 8 }}>not scored yet</div>
                )}
                {selected.aiScore != null && <ScoreBar value={selected.aiScore} />}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 20 }}>
              <ActionBtn icon="🧠" label={busy.startsWith('score') ? 'SCORING…' : 'AI RE-SCORE'} onClick={() => scoreLead(selected.id)} disabled={busy.startsWith('score')} primary />
              <ActionBtn icon="→" label={selected.stage === 'Converted' ? 'CONVERTED ✓' : 'CONVERT TO DEAL'} onClick={convertLead} disabled={busy === 'convert' || selected.stage === 'Converted'} success />
              <ActionBtn icon="✉" label="DRAFT FOLLOW-UP" onClick={() => draftMail('follow_up')} disabled={busy === 'draft'} />
              <ActionBtn icon="📅" label="DRAFT DEMO REQ" onClick={() => draftMail('demo_request')} disabled={busy === 'draft'} />
              <ActionBtn icon="🛡️" label="HANDLE OBJECTION" onClick={() => draftMail('objection_handle')} disabled={busy === 'draft'} />
              <ActionBtn icon="🎯" label="INTRO PITCH" onClick={() => draftMail('intro_pitch')} disabled={busy === 'draft'} />
            </div>

            {/* AI Insight card */}
            {insight && (
              <div style={{
                background: `linear-gradient(135deg, ${G}15 0%, ${G}05 100%)`,
                border: `1px solid ${G}55`, borderRadius: 14, padding: 18, marginBottom: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>🧠</span>
                  <span style={{ fontSize: 10, color: G, fontWeight: 800, letterSpacing: '0.15em' }}>AI INSIGHT</span>
                  <span style={{ fontSize: 9, color: '#564B40', marginLeft: 'auto' }}>{insight.aiGenerated ? 'Groq Llama 3.3 70B' : 'fallback'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: scoreColor(insight.score) }}>{insight.score}</div>
                  <div>
                    <TierPillFancy tier={insight.tier} />
                    <div style={{ fontSize: 10, color: '#9C8C7A', marginTop: 4 }}>confidence score</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, fontSize: 13, color: '#E8E6E1', lineHeight: 1.5 }}>
                  <div style={{ fontSize: 10, color: G, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>REASONING</div>
                  {insight.reasoning}
                </div>
                <div style={{ marginTop: 12, padding: 12, background: 'rgba(16,185,129,0.1)', borderLeft: '3px solid #10B981', borderRadius: 6, fontSize: 13, color: '#E8E6E1' }}>
                  <div style={{ fontSize: 10, color: '#10B981', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>NEXT BEST ACTION</div>
                  {insight.nextAction}
                </div>
              </div>
            )}

            {/* Email draft */}
            {draft && (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 18, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 16 }}>✉</span>
                  <span style={{ fontSize: 10, color: G, fontWeight: 800, letterSpacing: '0.15em' }}>EMAIL DRAFT · {draft.purpose?.toUpperCase()}</span>
                  <button onClick={() => { navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`); alert('Copied to clipboard') }} style={{ marginLeft: 'auto', background: 'transparent', border: `1px solid ${G}55`, color: G, padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>📋 COPY</button>
                </div>
                <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 8, fontSize: 14, color: '#fff', fontWeight: 700, marginBottom: 8 }}>
                  <span style={{ fontSize: 10, color: '#564B40', marginRight: 8 }}>SUBJECT</span>
                  {draft.subject}
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, color: '#D4C9B5', fontFamily: 'inherit', lineHeight: 1.6, margin: 0, padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>{draft.body}</pre>
              </div>
            )}

            {/* AI activity summary */}
            {timeline?.aiSummary?.summary && (
              <div style={{
                background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.4)',
                borderRadius: 14, padding: 16, marginBottom: 16,
              }}>
                <div style={{ fontSize: 10, color: '#A78BFA', fontWeight: 800, letterSpacing: '0.15em', marginBottom: 6 }}>📊 AI ACTIVITY SUMMARY</div>
                <div style={{ fontSize: 13, color: '#E8E6E1', fontStyle: 'italic', lineHeight: 1.5 }}>{timeline.aiSummary.summary}</div>
              </div>
            )}

            {/* Log activity */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 18, marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: G, fontWeight: 800, letterSpacing: '0.15em', marginBottom: 10 }}>+ LOG ACTIVITY</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <SelectField value={activityForm.type} onChange={v => setActivityForm({ ...activityForm, type: v })} options={['note', 'call', 'email', 'meeting', 'task', 'demo']} dark />
                <SelectField value={activityForm.outcome} onChange={v => setActivityForm({ ...activityForm, outcome: v })} options={['positive', 'neutral', 'negative', 'no_show']} dark />
              </div>
              <Field value={activityForm.subject} onChange={v => setActivityForm({ ...activityForm, subject: v })} placeholder="Subject *" dark />
              <textarea value={activityForm.body} onChange={e => setActivityForm({ ...activityForm, body: e.target.value })} placeholder="Notes"
                style={{ width: '100%', minHeight: 60, marginTop: 8, padding: '10px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }} />
              <button onClick={logActivity} disabled={busy === 'activity' || !activityForm.subject}
                style={{ marginTop: 10, padding: '8px 16px', background: G, color: '#3A1A22', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', cursor: activityForm.subject ? 'pointer' : 'not-allowed', opacity: activityForm.subject ? 1 : 0.5 }}>
                {busy === 'activity' ? 'LOGGING…' : '+ LOG'}
              </button>
            </div>

            {/* Timeline */}
            <div>
              <div style={{ fontSize: 10, color: G, fontWeight: 800, letterSpacing: '0.15em', marginBottom: 12 }}>
                ACTIVITY TIMELINE · {timeline?.activities?.length || 0}
              </div>
              {!timeline?.activities?.length ? (
                <div style={{ padding: 30, textAlign: 'center', color: '#564B40', fontSize: 13, background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
                  No activities logged yet — log one above ↑
                </div>
              ) : (
                <div style={{ position: 'relative', paddingLeft: 24 }}>
                  <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: 'linear-gradient(180deg, ' + G + '88 0%, transparent 100%)' }} />
                  {timeline.activities.map((a: any, idx: number) => (
                    <div key={a.id} style={{ position: 'relative', paddingBottom: 14, marginBottom: 4 }}>
                      <div style={{ position: 'absolute', left: -23, top: 4, width: 12, height: 12, borderRadius: '50%', background: outcomeColor(a.outcome), border: `2px solid #1A1421`, boxShadow: `0 0 8px ${outcomeColor(a.outcome)}66` }} />
                      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: G, letterSpacing: '0.1em' }}>{a.type?.toUpperCase()}</span>
                          <span style={{ fontSize: 10, color: '#9C8C7A' }}>{formatDate(a.occurredAt)}</span>
                        </div>
                        <div style={{ fontSize: 13, color: '#fff', marginTop: 4, fontWeight: 600 }}>{a.subject}</div>
                        {a.body && <div style={{ fontSize: 12, color: '#9C8C7A', marginTop: 4 }}>{a.body}</div>}
                        {a.outcome && <div style={{ fontSize: 10, color: outcomeColor(a.outcome), marginTop: 4, fontWeight: 700, letterSpacing: '0.05em' }}>● {a.outcome.toUpperCase()}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

/* ─── UI PRIMITIVES ─── */

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 10px', background: 'rgba(255,255,255,0.08)',
      borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
    }}>
      <span style={{ fontSize: 9, color: '#9C8C7A', fontWeight: 600, letterSpacing: '0.1em' }}>{label}</span>
      <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>{value}</span>
    </div>
  )
}

function MetricCard({ label, value, sub, accent, icon, gauge }: { label: string; value: string; sub: string; accent: string; icon: string; gauge?: number }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: 18,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.06 }}>{icon}</div>
      <div style={{ fontSize: 10, color: accent, fontWeight: 800, letterSpacing: '0.15em' }}>{label}</div>
      <div style={{ fontSize: 26, color: '#fff', fontWeight: 800, marginTop: 6, lineHeight: 1.1 }}>{value}</div>
      {gauge != null && (
        <div style={{ marginTop: 8, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${gauge}%`, height: '100%', background: accent, borderRadius: 2, transition: 'width 0.6s' }} />
        </div>
      )}
      <div style={{ fontSize: 11, color: '#9C8C7A', marginTop: 8 }}>{sub}</div>
    </div>
  )
}

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 14, display: 'flex', alignItems: 'baseline', gap: 12 }}>
      <h3 style={{ margin: 0, fontSize: 14, color: '#fff', fontWeight: 800, letterSpacing: '0.1em' }}>{title}</h3>
      <span style={{ fontSize: 11, color: '#9C8C7A' }}>{sub}</span>
    </div>
  )
}

function LeadCard({ lead, active, onClick, formatMoney, stageColor }: { lead: Lead; active: boolean; onClick: () => void; formatMoney: (v: number) => string; stageColor: string }) {
  const score = lead.aiScore
  return (
    <div onClick={onClick} style={{
      background: active ? `${stageColor}22` : 'rgba(255,255,255,0.05)',
      border: active ? `1px solid ${stageColor}` : '1px solid rgba(255,255,255,0.08)',
      borderRadius: 10, padding: 10, cursor: 'pointer',
      transition: 'all 0.15s',
    }}
      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)' } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <div style={{ fontSize: 12, color: '#fff', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{lead.company}</div>
        {score != null && (
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: scoreColor(score), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>
            {score}
          </div>
        )}
      </div>
      {lead.contact && <div style={{ fontSize: 10, color: '#9C8C7A', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.contact}</div>}
      <div style={{ fontSize: 11, color: stageColor, fontWeight: 700, marginTop: 6 }}>{formatMoney(lead.value)}</div>
      {lead.aiTier && (
        <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
          <TierPillFancy tier={lead.aiTier} small />
        </div>
      )}
    </div>
  )
}

function TierPillFancy({ tier, small }: { tier: string; small?: boolean }) {
  const c = TIER_COLORS[tier] || TIER_COLORS.Cool
  return (
    <span style={{
      background: c.bg, color: c.fg, padding: small ? '2px 6px' : '3px 10px',
      borderRadius: 999, fontSize: small ? 9 : 10, fontWeight: 800, letterSpacing: '0.08em',
    }}>{tier.toUpperCase()}</span>
  )
}

function Field({ label, value, onChange, placeholder, type, dark }: { label?: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; dark?: boolean }) {
  return (
    <div>
      {label && <label style={{ display: 'block', fontSize: 10, color: '#C3A35E', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>{label.toUpperCase()}</label>}
      <input type={type || 'text'} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '10px 12px',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, color: '#fff', fontSize: 13, fontFamily: 'inherit',
        }} />
    </div>
  )
}

function SelectField({ label, value, onChange, options, dark }: { label?: string; value: string; onChange: (v: string) => void; options: string[]; dark?: boolean }) {
  return (
    <div>
      {label && <label style={{ display: 'block', fontSize: 10, color: '#C3A35E', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>{label.toUpperCase()}</label>}
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '10px 12px',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, color: '#fff', fontSize: 13, fontFamily: 'inherit',
        }}>
        {options.map(o => <option key={o} value={o} style={{ background: '#1A1421', color: '#fff' }}>{o}</option>)}
      </select>
    </div>
  )
}

function ActionBtn({ icon, label, onClick, disabled, primary, success }: { icon: string; label: string; onClick: () => void; disabled?: boolean; primary?: boolean; success?: boolean }) {
  const bg = primary ? 'linear-gradient(135deg, #6B1F2B 0%, #8B2A38 100%)' : success ? 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)' : 'rgba(255,255,255,0.06)'
  const border = primary || success ? 'none' : '1px solid rgba(255,255,255,0.1)'
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '12px 14px', background: bg, color: '#fff', border, borderRadius: 10,
      fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
      transition: 'all 0.15s',
      boxShadow: (primary || success) && !disabled ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
    }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

function ScoreBar({ value }: { value: number }) {
  return (
    <div style={{ marginTop: 10, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, height: '100%', background: `linear-gradient(90deg, ${scoreColor(value)} 0%, ${scoreColor(value)}AA 100%)`, borderRadius: 3, transition: 'width 0.6s', boxShadow: `0 0 8px ${scoreColor(value)}88` }} />
    </div>
  )
}

function scoreColor(s: number): string {
  if (s >= 75) return '#10B981'
  if (s >= 55) return '#F59E0B'
  if (s >= 35) return '#0EA5E9'
  return '#64748B'
}

function outcomeColor(o: string): string {
  if (o === 'positive') return '#10B981'
  if (o === 'negative') return '#EF4444'
  if (o === 'no_show') return '#F59E0B'
  return '#64748B'
}
