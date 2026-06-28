'use client'
/**
 * HARVICS OS — Wave 8 Smart CRM
 * Design-system compliant: burgundy/cream/gold tokens, Tailwind only, SVG icons, no alert().
 */
import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { useCountry } from '@/contexts/CountryContext'
import { getCurrency } from '@/config/localeConfig'
import {
  Brain,
  Mail,
  Calendar,
  Shield,
  Target,
  CheckCircle,
  XCircle,
  ChevronRight,
  Activity,
  DollarSign,
  TrendingUp,
  Users,
  Zap,
  X,
  Copy,
  Plus,
  ArrowRight,
} from 'lucide-react'

/* ─── Types ─── */
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

/* ─── API helper ─── */
async function api(path: string, init?: RequestInit, marketHeaders?: Record<string, string>) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  const authHeader: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : { Authorization: 'Bearer demo-token-company_admin' }
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

/* ─── Constants ─── */
const STAGES = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Converted']
const STAGE_ACCENT: Record<string, string> = {
  Lead: 'bg-slate-500',
  Qualified: 'bg-sky-500',
  Proposal: 'bg-violet-500',
  Negotiation: 'bg-amber-500',
  Converted: 'bg-emerald-500',
}
const STAGE_TEXT: Record<string, string> = {
  Lead: 'text-slate-400',
  Qualified: 'text-sky-400',
  Proposal: 'text-violet-400',
  Negotiation: 'text-amber-400',
  Converted: 'text-emerald-400',
}
const TIER_STYLES: Record<string, string> = {
  Hot: 'bg-red-100 text-red-800',
  Warm: 'bg-amber-100 text-amber-800',
  Cool: 'bg-sky-100 text-sky-800',
  Cold: 'bg-slate-100 text-slate-600',
}

function scoreColor(s: number) {
  if (s >= 75) return 'text-emerald-400'
  if (s >= 55) return 'text-amber-400'
  if (s >= 35) return 'text-sky-400'
  return 'text-slate-400'
}

function outcomeAccent(o: string) {
  if (o === 'positive') return 'bg-emerald-500'
  if (o === 'negative') return 'bg-red-500'
  if (o === 'no_show') return 'bg-amber-500'
  return 'bg-slate-500'
}

/* ─── Main component ─── */
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
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [usdEquiv, setUsdEquiv] = useState<number | null>(null)

  const [form, setForm] = useState({
    company: '', contact: '', email: '', value: 0,
    source: 'Inbound', stage: 'Lead', notes: '',
  })
  const [activityForm, setActivityForm] = useState({
    type: 'note', subject: '', body: '', outcome: 'neutral',
  })

  const marketCurrency = (countryData?.currency?.code || getCurrency(locale) || 'USD').toUpperCase()
  const marketCountry  = (selectedCountry || 'US').toUpperCase()
  const mh = {
    'x-locale': locale,
    'x-country': marketCountry,
    'x-currency': marketCurrency,
    'x-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  }

  const fmt = (v: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: marketCurrency, maximumFractionDigits: 0 }).format(v || 0)

  const fmtDate = (v: string | Date) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(v))

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  const load = async () => {
    try {
      const [l, p, h] = await Promise.all([
        api('/api/wave8/leads', undefined, mh),
        api('/api/wave8/pipeline', undefined, mh),
        api('/api/wave8/ai/health', undefined, mh),
      ])
      setLeads(l.data || [])
      setPipeline(p.data)
      setAiHealth(h)
    } catch (e: any) {
      setError(e.message)
    }
  }

  useEffect(() => { void load() }, [locale, selectedCountry, countryData?.currency?.code])

  useEffect(() => {
    if (!pipeline?.totals?.totalPipelineValue || marketCurrency === 'USD') { setUsdEquiv(null); return }
    fetch(`/api/services/fx/convert?from=${marketCurrency}&to=USD&amount=${pipeline.totals.totalPipelineValue}`)
      .then(r => r.json())
      .then(j => { if (j?.success) setUsdEquiv(j.amount) })
      .catch(() => setUsdEquiv(null))
  }, [pipeline?.totals?.totalPipelineValue, marketCurrency])

  const openLead = async (lead: Lead) => {
    setSelected(lead); setInsight(null); setDraft(null)
    try {
      const t = await api(`/api/wave8/leads/${lead.id}/timeline`, undefined, mh)
      setTimeline(t)
    } catch {
      setTimeline(null)
    }
  }

  const createLead = async () => {
    if (!form.company) return setError('Company name is required.')
    setBusy('create')
    try {
      await api('/api/wave8/leads', { method: 'POST', body: JSON.stringify({ ...form, value: +form.value || 0, email: form.email || null }) }, mh)
      setForm({ company: '', contact: '', email: '', value: 0, source: 'Inbound', stage: 'Lead', notes: '' })
      showToast('Lead created.')
      await load()
    } catch (e: any) { setError(e.message) } finally { setBusy('') }
  }

  const scoreLead = async (id: string) => {
    setBusy('score-' + id)
    try {
      const r = await api(`/api/wave8/leads/${id}/score`, { method: 'POST' }, mh)
      setInsight(r.insight)
      await load()
      if (selected?.id === id) await openLead({ ...selected, aiScore: r.data.aiScore, aiTier: r.data.aiTier })
    } catch (e: any) { setError(e.message) } finally { setBusy('') }
  }

  const bulkScore = async () => {
    setBusy('bulk')
    try {
      const r = await api('/api/wave8/leads/bulk-score', { method: 'POST' }, mh)
      showToast(`Scored ${r.scored} leads ${r.aiEnabled ? '(Groq AI)' : '(heuristic — add GROQ_API_KEY)'}`)
      await load()
    } catch (e: any) { setError(e.message) } finally { setBusy('') }
  }

  const draftMail = async (purpose: string) => {
    if (!selected) return
    setBusy('draft')
    try {
      const r = await api(`/api/wave8/leads/${selected.id}/email-draft`, { method: 'POST', body: JSON.stringify({ purpose }) }, mh)
      setDraft(r.data)
    } catch (e: any) { setError(e.message) } finally { setBusy('') }
  }

  const logActivity = async () => {
    if (!selected || !activityForm.subject) return
    setBusy('activity')
    try {
      await api('/api/wave8/activities', { method: 'POST', body: JSON.stringify({ ...activityForm, leadId: selected.id }) }, mh)
      setActivityForm({ type: 'note', subject: '', body: '', outcome: 'neutral' })
      showToast('Activity logged.')
      await openLead(selected)
    } catch (e: any) { setError(e.message) } finally { setBusy('') }
  }

  const convertLead = async () => {
    if (!selected) return
    setBusy('convert')
    try {
      const r = await api(`/api/wave8/leads/${selected.id}/convert`, { method: 'POST' }, mh)
      showToast(r.message || 'Lead converted to deal.')
      await load()
      setSelected(null); setTimeline(null)
    } catch (e: any) { setError(e.message) } finally { setBusy('') }
  }

  const leadsByStage = STAGES.reduce((acc, s) => {
    acc[s] = leads.filter(l => l.stage === s)
    return acc
  }, {} as Record<string, Lead[]>)

  const avgScore = leads.filter(l => l.aiScore != null).reduce((s, l) => s + (l.aiScore || 0), 0) /
    Math.max(1, leads.filter(l => l.aiScore != null).length)

  const tierCounts = leads.reduce((acc: Record<string, number>, l) => {
    if (l.aiTier) acc[l.aiTier] = (acc[l.aiTier] || 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-harvics-burgundy text-[#F5F0E8] font-sans pb-16">

      {/* ─── Toast ─── */}
      {toast && (
        <div className="fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl bg-[#3D1212] border border-[#C3A35E]/40 text-[#F5F0E8] text-sm shadow-2xl animate-slide-in">
          <CheckCircle size={14} className="text-[#C3A35E] shrink-0" />
          {toast}
        </div>
      )}

      {/* ─── Error banner ─── */}
      {error && (
        <div className="mx-4 mt-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-red-900/40 border border-red-500/40 text-sm">
          <span className="text-red-200">{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-200 transition-colors shrink-0"><X size={14} /></button>
        </div>
      )}

      {/* ─── Hero band ─── */}
      <div className="relative bg-gradient-to-br from-[#3D1212] via-[#2a0808] to-[#3D1212] px-8 pt-8 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(201,168,76,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(201,168,76,0.5)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-[-120px] right-[-80px] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.15)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative max-w-[1400px] mx-auto flex items-start justify-between flex-wrap gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#C3A35E]/10 border border-[#C3A35E]/35 rounded-full text-[10px] text-[#C3A35E] font-bold tracking-[0.18em] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C3A35E] shadow-[0_0_8px_#C3A35E]" />
              WAVE 8 — SMART CRM
            </div>
            <h1 className="text-[40px] font-black tracking-tight text-[#F5F0E8] leading-tight mb-2">Pipeline Intelligence</h1>
            <p className="text-sm text-[#8A7D6B] max-w-xl">
              AI-scored leads · live email drafting · activity intelligence — {locale.toUpperCase()} market · {marketCountry} · {marketCurrency}
            </p>
            <div className="flex gap-2 mt-4 flex-wrap">
              {[['Market', marketCountry], ['Locale', locale.toUpperCase()], ['Currency', marketCurrency], ['Leads', String(leads.length)]].map(([l, v]) => (
                <span key={l} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[11px]">
                  <span className="text-[#8A7D6B]">{l}</span>
                  <span className="text-[#F5F0E8] font-semibold">{v}</span>
                </span>
              ))}
            </div>
          </div>

          {/* AI health card */}
          <div className={`rounded-2xl p-5 min-w-[220px] backdrop-blur-xl ${aiHealth?.aiEnabled ? 'bg-white/5 border border-[#C3A35E]/35 shadow-[0_0_40px_rgba(201,168,76,0.1)]' : 'bg-white/5 border border-white/10'}`}>
            {aiHealth?.aiEnabled ? (
              <>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />
                  <span className="text-[11px] text-[#C3A35E] font-bold tracking-[0.15em]">AI ONLINE</span>
                </div>
                <div className="text-sm text-[#F5F0E8] font-mono font-semibold">{aiHealth.model}</div>
                <div className="text-[10px] text-[#8A7D6B] mt-0.5">provider · {aiHealth.provider}</div>
              </>
            ) : (
              <>
                <div className="text-[11px] text-red-300 font-bold tracking-[0.1em] mb-1.5">AI OFFLINE</div>
                <div className="text-[10px] text-[#8A7D6B]">Set GROQ_API_KEY in .env.local</div>
              </>
            )}
            <button
              onClick={bulkScore}
              disabled={busy === 'bulk' || !leads.length}
              className="mt-3 w-full py-2.5 rounded-xl bg-[#C3A35E] hover:bg-[#b8923e] disabled:opacity-40 disabled:cursor-not-allowed text-[#3D1212] text-[11px] font-black tracking-[0.08em] transition-colors shadow-[0_4px_14px_rgba(201,168,76,0.35)] flex items-center justify-center gap-2"
            >
              <Brain size={13} />
              {busy === 'bulk' ? 'SCORING…' : 'SCORE ALL LEADS'}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Metrics strip ─── */}
      {pipeline && (
        <div className="max-w-[1400px] mx-auto px-8 -mt-12 relative z-10">
          <div className="grid grid-cols-4 gap-4">
            <MetricCard label="TOTAL PIPELINE" value={fmt(pipeline.totals?.totalPipelineValue || 0)} sub={usdEquiv != null ? `≈ ${new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(usdEquiv)} USD` : `${leads.length} leads`} icon={<DollarSign size={20} />} />
            <MetricCard label="AVG AI SCORE" value={isNaN(avgScore) ? '—' : `${Math.round(avgScore)}/100`} sub={isNaN(avgScore) ? 'no scored leads' : `${leads.filter(l => l.aiScore != null).length} scored`} gauge={isNaN(avgScore) ? 0 : avgScore} icon={<Brain size={20} />} />
            <MetricCard label="LEAD TIERS" value={String(Object.values(tierCounts).reduce((a, b) => a + b, 0) || 0)} sub={Object.entries(tierCounts).map(([t, c]) => `${t}:${c}`).join(' · ') || 'unscored'} icon={<TrendingUp size={20} />} />
            <MetricCard label="PIPELINE HEALTH" value={`${Math.min(99, Math.round((leads.filter(l => (l.aiScore || 0) >= 55).length / Math.max(1, leads.length)) * 100))}%`} sub={`${leads.filter(l => (l.aiScore || 0) >= 75).length} hot · ${leads.filter(l => (l.aiScore || 0) >= 55 && (l.aiScore || 0) < 75).length} warm`} icon={<Activity size={20} />} />
          </div>
        </div>
      )}

      {/* ─── Pipeline Kanban ─── */}
      <section className="max-w-[1400px] mx-auto px-8 mt-10">
        <SectionHeader title="PIPELINE BOARD" sub={`${leads.length} leads across ${STAGES.length} stages`} />
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${STAGES.length}, 1fr)` }}>
          {STAGES.map(stage => {
            const sl = leadsByStage[stage] || []
            const sv = sl.reduce((s, l) => s + (l.value || 0), 0)
            return (
              <div key={stage} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-3 min-h-[200px]">
                <div className={`flex items-center justify-between mb-3 pb-2 border-b-2 ${STAGE_ACCENT[stage].replace('bg-', 'border-')}`}>
                  <div>
                    <div className="text-[11px] font-black text-[#F5F0E8] tracking-[0.08em]">{stage.toUpperCase()}</div>
                    <div className="text-[10px] text-[#8A7D6B] mt-0.5">{sl.length} · {fmt(sv)}</div>
                  </div>
                  <div className={`w-6 h-6 rounded-full ${STAGE_ACCENT[stage]} text-white flex items-center justify-center text-[11px] font-black`}>{sl.length}</div>
                </div>
                <div className="flex flex-col gap-2">
                  {sl.length === 0 && <p className="text-[11px] text-[#8A7D6B]/50 text-center py-5 italic">empty</p>}
                  {sl.map(l => (
                    <LeadCard key={l.id} lead={l} active={selected?.id === l.id} onClick={() => openLead(l)} fmt={fmt} stageText={STAGE_TEXT[stage]} stageAccent={STAGE_ACCENT[stage]} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── Add lead form ─── */}
      <section className="max-w-[1400px] mx-auto px-8 mt-10">
        <SectionHeader title="ADD NEW LEAD" sub="AI will auto-score after creation" />
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Company *" value={form.company} onChange={v => setForm({ ...form, company: v })} placeholder="Acme Corp" />
            <Field label="Contact" value={form.contact} onChange={v => setForm({ ...form, contact: v })} placeholder="John Smith" />
            <Field label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="john@acme.com" />
            <Field label={`Deal value (${marketCurrency})`} type="number" value={String(form.value || '')} onChange={v => setForm({ ...form, value: +v || 0 })} placeholder="50000" />
            <Select label="Source" value={form.source} onChange={v => setForm({ ...form, source: v })} options={['Inbound', 'Referral', 'Outbound', 'Event', 'Partner', 'Demo']} />
            <Select label="Stage" value={form.stage} onChange={v => setForm({ ...form, stage: v })} options={STAGES.filter(s => s !== 'Converted')} />
          </div>
          <div className="mt-3">
            <label className="block text-[10px] text-[#C3A35E] font-bold tracking-[0.1em] mb-1.5">NOTES — helps AI score better</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Mentioned enterprise tier · CFO concerned about budget · timeline Q3 2026"
              className="w-full min-h-[56px] px-3 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-[#F5F0E8] text-[13px] resize-vertical placeholder-[#8A7D6B]/50 focus:outline-none focus:border-[#C3A35E]/50 transition-colors"
            />
          </div>
          <button
            onClick={createLead}
            disabled={busy === 'create' || !form.company}
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-[#3D1212] hover:bg-[#2a0808] disabled:opacity-40 disabled:cursor-not-allowed border border-[#C3A35E]/40 hover:border-[#C3A35E]/70 rounded-xl text-[#F5F0E8] text-[11px] font-black tracking-[0.1em] transition-all shadow-[0_4px_20px_rgba(26,5,5,0.4)]"
          >
            <Plus size={13} />
            {busy === 'create' ? 'CREATING…' : 'ADD LEAD'}
          </button>
        </div>
      </section>

      {/* ─── Lead detail drawer ─── */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end"
          onClick={() => { setSelected(null); setTimeline(null) }}
        >
          <div
            className="w-full max-w-[720px] bg-[#3D1212] border-l border-[#C3A35E]/20 p-7 overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 ${STAGE_ACCENT[selected.stage]} text-white rounded-md text-[10px] font-black tracking-[0.1em]`}>
                    {selected.stage.toUpperCase()}
                  </span>
                  {selected.aiTier && <TierBadge tier={selected.aiTier} />}
                </div>
                <h2 className="text-[26px] font-black text-[#F5F0E8] tracking-tight">{selected.company}</h2>
                <p className="text-sm text-[#8A7D6B] mt-1">
                  {selected.contact || '—'}{selected.email && ` · ${selected.email}`}
                </p>
              </div>
              <button
                onClick={() => { setSelected(null); setTimeline(null) }}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/20 text-[#8A7D6B] hover:text-[#F5F0E8] transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Value + Score */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
                <div className="text-[10px] text-[#C3A35E] font-bold tracking-[0.1em] mb-1.5">DEAL VALUE</div>
                <div className="text-[26px] text-[#F5F0E8] font-black">{fmt(selected.value)}</div>
                <div className="text-[11px] text-[#8A7D6B] mt-0.5">{selected.source}</div>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
                <div className="text-[10px] text-[#C3A35E] font-bold tracking-[0.1em] mb-1.5">AI SCORE</div>
                {selected.aiScore != null ? (
                  <>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-[26px] font-black ${scoreColor(selected.aiScore)}`}>{selected.aiScore}</span>
                      <span className="text-sm text-[#8A7D6B]">/100</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                      <div className="h-full bg-[#C3A35E] rounded-full transition-all duration-700" style={{ width: `${selected.aiScore}%` }} />
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-[#8A7D6B] mt-2">not scored yet</div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              <ActionBtn icon={<Brain size={14} />} label={busy.startsWith('score') ? 'SCORING…' : 'AI RE-SCORE'} onClick={() => scoreLead(selected.id)} disabled={busy.startsWith('score')} variant="primary" />
              <ActionBtn icon={<ArrowRight size={14} />} label={selected.stage === 'Converted' ? 'CONVERTED' : 'CONVERT TO DEAL'} onClick={convertLead} disabled={busy === 'convert' || selected.stage === 'Converted'} variant="success" />
              <ActionBtn icon={<Mail size={14} />} label="DRAFT FOLLOW-UP" onClick={() => draftMail('follow_up')} disabled={busy === 'draft'} />
              <ActionBtn icon={<Calendar size={14} />} label="DRAFT DEMO REQ" onClick={() => draftMail('demo_request')} disabled={busy === 'draft'} />
              <ActionBtn icon={<Shield size={14} />} label="HANDLE OBJECTION" onClick={() => draftMail('objection_handle')} disabled={busy === 'draft'} />
              <ActionBtn icon={<Target size={14} />} label="INTRO PITCH" onClick={() => draftMail('intro_pitch')} disabled={busy === 'draft'} />
            </div>

            {/* AI insight */}
            {insight && (
              <div className="bg-[#C3A35E]/[0.06] border border-[#C3A35E]/30 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Brain size={15} className="text-[#C3A35E]" />
                  <span className="text-[10px] text-[#C3A35E] font-black tracking-[0.15em]">AI INSIGHT</span>
                  <span className="text-[9px] text-[#8A7D6B] ml-auto">{insight.aiGenerated ? 'Groq Llama 3.3 70B' : 'heuristic fallback'}</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-[34px] font-black ${scoreColor(insight.score)}`}>{insight.score}</span>
                  <div>
                    <TierBadge tier={insight.tier} />
                    <div className="text-[10px] text-[#8A7D6B] mt-1">confidence score</div>
                  </div>
                </div>
                <div className="text-[11px] text-[#8A7D6B] font-bold tracking-[0.1em] mb-1.5">REASONING</div>
                <p className="text-[13px] text-[#F5F0E8]/80 leading-relaxed mb-3">{insight.reasoning}</p>
                <div className="pl-3 border-l-2 border-emerald-500 bg-emerald-500/[0.06] py-2.5 pr-3 rounded-r-xl">
                  <div className="text-[10px] text-emerald-400 font-bold tracking-[0.1em] mb-1">NEXT BEST ACTION</div>
                  <p className="text-[13px] text-[#F5F0E8]/80">{insight.nextAction}</p>
                </div>
              </div>
            )}

            {/* Email draft */}
            {draft && (
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Mail size={15} className="text-[#C3A35E]" />
                  <span className="text-[10px] text-[#C3A35E] font-black tracking-[0.15em]">EMAIL DRAFT · {draft.purpose?.toUpperCase()}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`)
                      showToast('Email copied to clipboard.')
                    }}
                    className="ml-auto flex items-center gap-1.5 px-2.5 py-1 border border-[#C3A35E]/40 rounded-lg text-[#C3A35E] text-[10px] font-bold hover:bg-[#C3A35E]/10 transition-colors"
                  >
                    <Copy size={11} />COPY
                  </button>
                </div>
                <div className="px-3 py-2.5 bg-black/30 rounded-xl text-sm font-bold text-[#F5F0E8] mb-2">
                  <span className="text-[10px] text-[#8A7D6B] mr-2">SUBJECT</span>
                  {draft.subject}
                </div>
                <pre className="whitespace-pre-wrap text-[13px] text-[#8A7D6B] font-sans leading-relaxed px-3 py-3 bg-black/20 rounded-xl">{draft.body}</pre>
              </div>
            )}

            {/* AI activity summary */}
            {timeline?.aiSummary?.summary && (
              <div className="bg-violet-500/[0.06] border border-violet-500/30 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={14} className="text-violet-400" />
                  <span className="text-[10px] text-violet-400 font-black tracking-[0.15em]">AI ACTIVITY SUMMARY</span>
                </div>
                <p className="text-[13px] text-[#F5F0E8]/80 italic leading-relaxed">{timeline.aiSummary.summary}</p>
              </div>
            )}

            {/* Log activity */}
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 mb-4">
              <div className="text-[10px] text-[#C3A35E] font-black tracking-[0.15em] mb-3">LOG ACTIVITY</div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Select value={activityForm.type} onChange={v => setActivityForm({ ...activityForm, type: v })} options={['note', 'call', 'email', 'meeting', 'task', 'demo']} />
                <Select value={activityForm.outcome} onChange={v => setActivityForm({ ...activityForm, outcome: v })} options={['positive', 'neutral', 'negative', 'no_show']} />
              </div>
              <Field value={activityForm.subject} onChange={v => setActivityForm({ ...activityForm, subject: v })} placeholder="Subject *" />
              <textarea
                value={activityForm.body}
                onChange={e => setActivityForm({ ...activityForm, body: e.target.value })}
                placeholder="Notes"
                className="w-full min-h-[56px] mt-2 px-3 py-2.5 bg-black/30 border border-white/10 rounded-xl text-[#F5F0E8] text-[13px] resize-vertical placeholder-[#8A7D6B]/50 focus:outline-none focus:border-[#C3A35E]/50 transition-colors"
              />
              <button
                onClick={logActivity}
                disabled={busy === 'activity' || !activityForm.subject}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#C3A35E] hover:bg-[#b8923e] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-[#3D1212] text-[11px] font-black tracking-[0.1em] transition-colors"
              >
                <Plus size={12} />
                {busy === 'activity' ? 'LOGGING…' : 'LOG'}
              </button>
            </div>

            {/* Timeline */}
            <div>
              <div className="text-[10px] text-[#C3A35E] font-black tracking-[0.15em] mb-3">
                ACTIVITY TIMELINE · {timeline?.activities?.length || 0}
              </div>
              {!timeline?.activities?.length ? (
                <div className="py-8 text-center text-[13px] text-[#8A7D6B] bg-white/[0.02] rounded-2xl border border-white/[0.05]">
                  No activities yet — log one above
                </div>
              ) : (
                <div className="relative pl-6">
                  <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#C3A35E]/50 to-transparent" />
                  {timeline.activities.map((a: any) => (
                    <div key={a.id} className="relative pb-3 mb-1">
                      <div className={`absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2 border-[#3D1212] ${outcomeAccent(a.outcome)}`} />
                      <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black text-[#C3A35E] tracking-[0.1em]">{a.type?.toUpperCase()}</span>
                          <span className="text-[10px] text-[#8A7D6B]">{fmtDate(a.occurredAt)}</span>
                        </div>
                        <div className="text-[13px] text-[#F5F0E8] font-semibold">{a.subject}</div>
                        {a.body && <div className="text-[12px] text-[#8A7D6B] mt-1">{a.body}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Sub-components ─── */

function MetricCard({ label, value, sub, icon, gauge }: { label: string; value: string; sub: string; icon: React.ReactNode; gauge?: number }) {
  return (
    <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 overflow-hidden">
      <div className="absolute top-3 right-3 text-[#C3A35E]/20">{icon}</div>
      <div className="text-[10px] text-[#C3A35E] font-black tracking-[0.15em]">{label}</div>
      <div className="text-[26px] text-[#F5F0E8] font-black mt-1.5 leading-none">{value}</div>
      {gauge != null && (
        <div className="mt-2 h-1 bg-white/[0.07] rounded-full overflow-hidden">
          <div className="h-full bg-[#C3A35E] rounded-full transition-all duration-700" style={{ width: `${gauge}%` }} />
        </div>
      )}
      <div className="text-[11px] text-[#8A7D6B] mt-2">{sub}</div>
    </div>
  )
}

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-4">
      <h3 className="text-[14px] text-[#F5F0E8] font-black tracking-[0.1em]">{title}</h3>
      <span className="text-[11px] text-[#8A7D6B]">{sub}</span>
    </div>
  )
}

function LeadCard({ lead, active, onClick, fmt, stageText, stageAccent }: {
  lead: Lead; active: boolean; onClick: () => void
  fmt: (v: number) => string; stageText: string; stageAccent: string
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl p-2.5 border transition-all duration-150 cursor-pointer ${
        active
          ? `${stageAccent.replace('bg-', 'bg-')}/20 ${stageAccent.replace('bg-', 'border-')}/60`
          : 'bg-white/[0.04] border-white/[0.07] hover:bg-white/[0.08] hover:-translate-y-px'
      }`}
    >
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-[12px] text-[#F5F0E8] font-bold truncate flex-1">{lead.company}</span>
        {lead.aiScore != null && (
          <span className={`w-6 h-6 rounded-full ${stageAccent} text-white flex items-center justify-center text-[10px] font-black shrink-0`}>
            {lead.aiScore}
          </span>
        )}
      </div>
      {lead.contact && <div className="text-[10px] text-[#8A7D6B] mt-0.5 truncate">{lead.contact}</div>}
      <div className={`text-[11px] font-bold mt-1.5 ${stageText}`}>{fmt(lead.value)}</div>
      {lead.aiTier && <TierBadge tier={lead.aiTier} small />}
    </button>
  )
}

function TierBadge({ tier, small }: { tier: string; small?: boolean }) {
  return (
    <span className={`inline-block rounded-full font-black tracking-[0.08em] ${small ? 'px-1.5 py-0.5 text-[9px] mt-1.5' : 'px-2.5 py-0.5 text-[10px]'} ${TIER_STYLES[tier] || TIER_STYLES.Cool}`}>
      {tier.toUpperCase()}
    </span>
  )
}

function Field({ label, value, onChange, placeholder, type }: { label?: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      {label && <label className="block text-[10px] text-[#C3A35E] font-bold tracking-[0.1em] mb-1.5">{label.toUpperCase()}</label>}
      <input
        type={type || 'text'}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-[#F5F0E8] text-[13px] placeholder-[#8A7D6B]/50 focus:outline-none focus:border-[#C3A35E]/50 transition-colors"
      />
    </div>
  )
}

function Select({ label, value, onChange, options }: { label?: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      {label && <label className="block text-[10px] text-[#C3A35E] font-bold tracking-[0.1em] mb-1.5">{label.toUpperCase()}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-[#F5F0E8] text-[13px] focus:outline-none focus:border-[#C3A35E]/50 transition-colors"
      >
        {options.map(o => <option key={o} value={o} className="bg-[#3D1212] text-[#F5F0E8]">{o}</option>)}
      </select>
    </div>
  )
}

function ActionBtn({ icon, label, onClick, disabled, variant }: {
  icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; variant?: 'primary' | 'success'
}) {
  const base = 'flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-[11px] font-black tracking-[0.08em] transition-all disabled:opacity-40 disabled:cursor-not-allowed'
  const styles = variant === 'primary'
    ? 'bg-gradient-to-br from-[#3D1212] to-[#2a0808] border border-[#C3A35E]/40 hover:border-[#C3A35E]/70 text-[#F5F0E8] shadow-[0_4px_12px_rgba(0,0,0,0.3)]'
    : variant === 'success'
    ? 'bg-gradient-to-br from-emerald-700 to-emerald-600 text-white shadow-[0_4px_12px_rgba(0,0,0,0.3)]'
    : 'bg-white/[0.05] border border-white/10 hover:bg-white/[0.09] text-[#F5F0E8]'
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      {icon}<span>{label}</span>
    </button>
  )
}

