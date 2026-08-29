'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import KPICard from '@/components/shared/KPICard'

interface LegalIPRDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function legalGet(path: string) {
  const res = await fetch(`/api/v2/legal${path}`, { headers: { ...authHeaders(), 'Content-Type': 'application/json' }, cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

function useLegalData() {
  const [summary, setSummary] = useState<any>(null)
  const [cases, setCases] = useState<any[]>([])
  const [trademarks, setTrademarks] = useState<any[]>([])
  const [patents, setPatents] = useState<any[]>([])
  const [counterfeit, setCounterfeit] = useState<any[]>([])
  const [compliance, setCompliance] = useState<any[]>([])
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [sumJ, casesJ, tmJ, patJ, cfJ, compJ, cntJ] = await Promise.all([
        legalGet('/summary'),
        legalGet('/cases'),
        legalGet('/ipr/trademarks'),
        legalGet('/ipr/patents'),
        legalGet('/ipr/counterfeit'),
        legalGet('/ipr/compliance'),
        legalGet('/ipr/contracts'),
      ])
      setSummary(sumJ?.data || null)
      setCases(casesJ?.data || [])
      setTrademarks(tmJ?.data || [])
      setPatents(patJ?.data || [])
      setCounterfeit(cfJ?.data || [])
      setCompliance(compJ?.data || [])
      setContracts(cntJ?.data || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  return { summary, cases, trademarks, patents, counterfeit, compliance, contracts, loading, refresh }
}

function Empty({ msg }: { msg: string }) {
  return <p className="text-sm text-[#8E8E93] py-8 text-center">{msg}</p>
}

function LegalIPRCreatePanel({
  docType,
  fields,
  onCreated,
}: {
  docType: 'trademarks' | 'patents' | 'counterfeit' | 'compliance' | 'contracts'
  fields: { key: string; label: string; placeholder?: string }[]
  onCreated: () => void
}) {
  const [form, setForm] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const create = async () => {
    setBusy(true)
    setErr('')
    setMsg('')
    try {
      if (!form.title?.trim()) throw new Error('Title required')
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (token) (headers as Record<string, string>).Authorization = `Bearer ${token}`
      const metadata: Record<string, unknown> = {}
      if (form.score) metadata.score = Number(form.score)
      if (form.severity) metadata.severity = form.severity
      const res = await fetch(`/api/v2/legal/ipr/${docType}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: form.title,
          category: form.category || null,
          status: form.status || 'Active',
          effectiveDate: form.effectiveDate || null,
          expiryDate: form.expiryDate || null,
          metadata: Object.keys(metadata).length ? metadata : undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
      setForm({})
      setMsg(`Created: ${json.data?.title || form.title}`)
      onCreated()
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mb-6 p-4 border border-[#E5E5EA] bg-[#F5F0E8]/50 rounded-xl space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-harvics-burgundy">Add record · POST /api/v2/legal/ipr/{docType}</p>
      {err && <p className="text-sm text-red-700">{err}</p>}
      {msg && <p className="text-sm text-green-800">{msg}</p>}
      <div className="grid gap-2 md:grid-cols-4">
        {fields.map((f) => (
          <label key={f.key} className="text-xs">
            <span className="font-semibold text-[#8E8E93]">{f.label}</span>
            <input
              className="mt-1 w-full border px-2 py-1.5 text-sm bg-white"
              placeholder={f.placeholder}
              value={form[f.key] || ''}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            />
          </label>
        ))}
        <button
          type="button"
          disabled={busy}
          onClick={() => void create()}
          className="self-end px-4 py-2 bg-harvics-burgundy text-white text-xs font-semibold disabled:opacity-50"
        >
          {busy ? 'Saving…' : 'Create'}
        </button>
      </div>
    </div>
  )
}

function IPROverviewScreen({ locale, data }: { locale: string; data: ReturnType<typeof useLegalData> }) {
  const s = data.summary || {}
  if (data.loading) return <Empty msg="Loading legal summary…" />
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="IPR Risk" value={s.iprRisk || '—'} icon="⚖️" />
        <KPICard label="Counterfeit Risk" value={s.counterfeitRisk || '—'} icon="🛡️" />
        <KPICard label="Compliance Score" value={s.complianceScore != null ? `${s.complianceScore}%` : '—'} icon="✓" />
        <KPICard label="Active Litigations" value={s.activeLitigations ?? 0} icon="📋" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Active Trademarks" value={s.activeTrademarks ?? 0} icon="™️" />
        <KPICard label="Active Patents" value={s.activePatents ?? 0} icon="📜" />
        <KPICard label="Pending Renewals" value={s.pendingRenewals ?? 0} icon="🔄" />
        <KPICard label="Active Contracts" value={s.activeContracts ?? 0} icon="📄" />
      </div>
      <div className="flex gap-3">
        <Link href={`/${locale}/os/legal/cases`} className="px-4 py-2 bg-harvics-burgundy text-white text-xs font-medium rounded-xl">
          Manage Cases →
        </Link>
        <a href="/api/v2/legal/reports/dashboard" target="_blank" rel="noreferrer" className="px-4 py-2 border border-[#E5E5EA] text-xs font-medium rounded-xl">
          Legal Report (JSON)
        </a>
      </div>
    </div>
  )
}

function DocTable({ rows, cols }: { rows: any[]; cols: { key: string; label: string; render?: (r: any) => React.ReactNode }[] }) {
  if (!rows.length) return <Empty msg="No records yet — add via Legal OS or API." />
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E5E5EA] bg-[#F5F5F7]">
            {cols.map((c) => <th key={c.key} className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase">{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-[#F5F5F7]">
              {cols.map((c) => (
                <td key={c.key} className="px-5 py-3.5 text-[#8E8E93]">{c.render ? c.render(r) : r[c.key] || '—'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function IPRPortfolioScreen({ data }: { data: ReturnType<typeof useLegalData> }) {
  if (data.loading) return <Empty msg="Loading IPR portfolio…" />
  return (
    <div className="space-y-8">
      <LegalIPRCreatePanel
        docType="trademarks"
        fields={[
          { key: 'title', label: 'Trademark name *' },
          { key: 'category', label: 'Class' },
          { key: 'effectiveDate', label: 'Registered (YYYY-MM-DD)' },
          { key: 'expiryDate', label: 'Expiry (YYYY-MM-DD)' },
        ]}
        onCreated={data.refresh}
      />
      <div>
        <h4 className="text-sm font-semibold text-[#1A1A1A] mb-3">Trademarks</h4>
        <DocTable rows={data.trademarks} cols={[
          { key: 'title', label: 'Name' },
          { key: 'category', label: 'Class' },
          { key: 'status', label: 'Status' },
          { key: 'effectiveDate', label: 'Registered' },
          { key: 'expiryDate', label: 'Expiry' },
        ]} />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-[#1A1A1A] mb-3">Patents</h4>
        <LegalIPRCreatePanel
          docType="patents"
          fields={[
            { key: 'title', label: 'Patent title *' },
            { key: 'category', label: 'Patent number' },
            { key: 'effectiveDate', label: 'Filed' },
            { key: 'expiryDate', label: 'Expiry' },
          ]}
          onCreated={data.refresh}
        />
        <DocTable rows={data.patents} cols={[
          { key: 'title', label: 'Title' },
          { key: 'status', label: 'Status' },
          { key: 'effectiveDate', label: 'Filed' },
          { key: 'expiryDate', label: 'Expiry' },
          { key: 'category', label: 'Number' },
        ]} />
      </div>
    </div>
  )
}

function CounterfeitScreen({ data }: { data: ReturnType<typeof useLegalData> }) {
  const s = data.summary || {}
  if (data.loading) return <Empty msg="Loading counterfeit cases…" />
  return (
    <div className="space-y-4">
      <LegalIPRCreatePanel
        docType="counterfeit"
        fields={[
          { key: 'title', label: 'Product / issue *' },
          { key: 'category', label: 'Location' },
          { key: 'effectiveDate', label: 'Reported date' },
          { key: 'severity', label: 'Severity (low/medium/high)' },
        ]}
        onCreated={data.refresh}
      />
      <div className="grid grid-cols-3 gap-4">
        <KPICard label="Open" value={s.counterfeitOpen ?? 0} icon="⚠️" />
        <KPICard label="Resolved" value={s.counterfeitResolved ?? 0} icon="✓" />
        <KPICard label="Total Reports" value={(s.counterfeitOpen ?? 0) + (s.counterfeitResolved ?? 0)} icon="📊" />
      </div>
      <DocTable rows={data.counterfeit} cols={[
        { key: 'title', label: 'Product / Issue' },
        { key: 'category', label: 'Location' },
        { key: 'effectiveDate', label: 'Reported' },
        { key: 'status', label: 'Status' },
        { key: 'metadata', label: 'Severity', render: (r) => (r.metadata as any)?.severity || '—' },
      ]} />
    </div>
  )
}

function ComplianceScreen({ data }: { data: ReturnType<typeof useLegalData> }) {
  if (data.loading) return <Empty msg="Loading compliance records…" />
  return (
    <>
      <LegalIPRCreatePanel
        docType="compliance"
        fields={[
          { key: 'title', label: 'Regulation *' },
          { key: 'category', label: 'Country' },
          { key: 'effectiveDate', label: 'Last check' },
          { key: 'score', label: 'Score (0-100)' },
        ]}
        onCreated={data.refresh}
      />
    <DocTable rows={data.compliance} cols={[
      { key: 'title', label: 'Regulation' },
      { key: 'category', label: 'Country' },
      { key: 'status', label: 'Status' },
      { key: 'effectiveDate', label: 'Last Check' },
      { key: 'metadata', label: 'Score', render: (r) => { const s = (r.metadata as any)?.score; return s != null ? `${s}%` : '—' } },
    ]} />
    </>
  )
}

function ContractsScreen({ data }: { data: ReturnType<typeof useLegalData> }) {
  const s = data.summary || {}
  if (data.loading) return <Empty msg="Loading contracts…" />
  return (
    <div className="space-y-4">
      <LegalIPRCreatePanel
        docType="contracts"
        fields={[
          { key: 'title', label: 'Contract name *' },
          { key: 'category', label: 'Type' },
          { key: 'effectiveDate', label: 'Start' },
          { key: 'expiryDate', label: 'End' },
        ]}
        onCreated={data.refresh}
      />
      <div className="grid grid-cols-2 gap-4">
        <KPICard label="Active" value={s.activeContracts ?? 0} icon="📄" />
        <KPICard label="Expiring (60d)" value={s.expiringContracts ?? 0} icon="⏰" />
      </div>
      <DocTable rows={data.contracts} cols={[
        { key: 'title', label: 'Contract' },
        { key: 'category', label: 'Type' },
        { key: 'effectiveDate', label: 'Start' },
        { key: 'expiryDate', label: 'End' },
        { key: 'status', label: 'Status' },
      ]} />
    </div>
  )
}

function LitigationScreen({ locale, data }: { locale: string; data: ReturnType<typeof useLegalData> }) {
  if (data.loading) return <Empty msg="Loading litigation cases…" />
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-2 gap-4 flex-1 mr-4">
          <KPICard label="Active" value={data.summary?.activeLitigations ?? data.cases.filter((c) => c.status !== 'closed').length} icon="⚖️" />
          <KPICard label="Resolved" value={data.summary?.resolvedLitigations ?? data.cases.filter((c) => c.status === 'closed').length} icon="✓" />
        </div>
        <Link href={`/${locale}/os/legal/cases`} className="px-4 py-2 bg-harvics-burgundy text-white text-xs font-medium rounded-xl whitespace-nowrap">
          Full Case CRUD →
        </Link>
      </div>
      <DocTable rows={data.cases} cols={[
        { key: 'caseTitle', label: 'Title' },
        { key: 'caseType', label: 'Type' },
        { key: 'country', label: 'Country' },
        { key: 'status', label: 'Status' },
        { key: 'hearingDate', label: 'Next Hearing', render: (r) => r.hearingDate ? new Date(r.hearingDate).toLocaleDateString() : '—' },
      ]} />
    </div>
  )
}

export default function LegalIPRDomainContent({ persona, locale }: LegalIPRDomainContentProps) {
  const legalData = useLegalData()

  const tier2Modules: Tier2Module[] = [
    {
      id: 'ipr-overview',
      label: 'Legal Dashboard',
      icon: '',
      description: 'Live legal, IPR, compliance, and litigation KPIs',
      component: <IPROverviewScreen locale={locale} data={legalData} />,
      tier3Screens: [{ id: 'overview', label: 'Dashboard Overview', icon: '', component: <IPROverviewScreen locale={locale} data={legalData} /> }],
    },
    {
      id: 'ipr-portfolio',
      label: 'IPR Portfolio',
      icon: '',
      description: 'Trademarks and patents from Document store',
      component: <IPRPortfolioScreen data={legalData} />,
      tier3Screens: [{ id: 'trademarks', label: 'Trademarks', icon: '™️', component: <IPRPortfolioScreen data={legalData} /> }],
    },
    {
      id: 'counterfeit',
      label: 'Counterfeit Detection',
      icon: '',
      description: 'Counterfeit reports and investigations',
      component: <CounterfeitScreen data={legalData} />,
      tier3Screens: [{ id: 'cases', label: 'Active Cases', icon: '', component: <CounterfeitScreen data={legalData} /> }],
    },
    {
      id: 'compliance',
      label: 'Compliance',
      icon: '',
      description: 'Country compliance and regulatory checks',
      component: <ComplianceScreen data={legalData} />,
      tier3Screens: [{ id: 'status', label: 'Compliance Status', icon: '', component: <ComplianceScreen data={legalData} /> }],
    },
    {
      id: 'contracts',
      label: 'Contracts',
      icon: '',
      description: 'Distribution, supplier, and license agreements',
      component: <ContractsScreen data={legalData} />,
      tier3Screens: [{ id: 'active', label: 'Active Contracts', icon: '', component: <ContractsScreen data={legalData} /> }],
    },
    {
      id: 'litigation',
      label: 'Litigation',
      icon: '',
      description: 'LegalCase records — full CRUD at /os/legal/cases',
      component: <LitigationScreen locale={locale} data={legalData} />,
      tier3Screens: [{ id: 'cases', label: 'Active Cases', icon: '', component: <LitigationScreen locale={locale} data={legalData} /> }],
    },
  ]

  return (
    <OSDomainTierStructure
      domainId="legal-ipr"
      domainName="Legal & IPR OS"
      tier2Modules={tier2Modules}
      defaultModule="ipr-overview"
    />
  )
}
