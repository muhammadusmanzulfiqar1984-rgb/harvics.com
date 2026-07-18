'use client'

import { useEffect, useState } from 'react'
import ModuleWorkspace from './ModuleWorkspace'
import { MODULES_BY_BAND, TOTAL_MODULES } from '@/lib/modules/registry'

// Canonical 71-module architecture is sourced from src/lib/modules/registry.ts.
// Mapped into the legacy shape this component consumes — DO NOT inline modules here.
const MODULE_ARCHITECTURE: Record<
  string,
  Array<{ id: number; name: string; route: string; intelligence: string; reporting: string }>
> = Object.fromEntries(
  Object.entries(MODULES_BY_BAND).map(([band, mods]) => [
    band,
    mods.map((m) => ({
      id: m.id,
      name: m.name,
      route: m.route,
      intelligence: m.intelligence,
      reporting: m.reporting,
    })),
  ]),
)

interface ModuleData {
  status: string
  metrics?: any
  contractReady?: boolean
  contractStandardized?: boolean
  contract?: {
    module?: string
    version?: string
    endpoints?: Record<string, string>
    requiredCreateFields?: string[]
    sampleCreatePayload?: Record<string, unknown>
    governance?: string[]
  } | null
  protected?: boolean
  nextAction?: string
  error?: string
}

interface ValidationResult {
  valid: boolean
  missingFields: string[]
  typeErrors: Array<{ field: string; expectedType: string; actualType: string }>
}

interface ModuleDefinition {
  id: number
  name: string
  route: string
  intelligence: string
  reporting: string
  band: string
}

interface OrderRecord {
  id: string
  customer: string
  city: string | null
  amount: number
  currency: string
  status: string
  items: Array<{ sku: string; qty: number }>
}

interface OrderFormState {
  customer: string
  city: string
  amount: string
  currency: string
  itemsInput: string
}

function getSegmentFromRoute(route: string): string {
  const normalized = route.replace(/^\/api\//, '');
  return normalized.split('/')[0] || '';
}

function getStatusTone(data?: ModuleData, validation?: ValidationResult) {
  if (validation?.valid) {
    return {
      pill: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      label: 'Verified',
    }
  }
  if (data?.status === 'error') {
    return {
      pill: 'bg-rose-50 text-rose-700 border border-rose-200',
      label: 'Probe Error',
    }
  }
  if (data?.contractReady) {
    return {
      pill: 'bg-amber-50 text-amber-700 border border-amber-200',
      label: data.protected ? 'Protected' : 'Public',
    }
  }
  return {
    pill: 'bg-slate-100 text-slate-600 border border-slate-200',
    label: 'Planned',
  }
}

function getIntelligenceTone(level: string) {
  switch (level) {
    case 'L5':
      return 'bg-rose-100 text-rose-700'
    case 'L4':
      return 'bg-amber-100 text-amber-700'
    case 'L3':
      return 'bg-sky-100 text-sky-700'
    case 'L2':
      return 'bg-emerald-100 text-emerald-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

export default function ModuleArchitectureExplorer() {
  const [selectedBand, setSelectedBand] = useState('All Bands')
  const [moduleData, setModuleData] = useState<Record<number, ModuleData>>({})
  const [validationData, setValidationData] = useState<Record<number, ValidationResult>>({})
  const [loading, setLoading] = useState(false)
  const [contractsLive, setContractsLive] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIntelligence, setSelectedIntelligence] = useState('All Levels')
  const [selectedReporting, setSelectedReporting] = useState('All Reports')
  const [selectedContractView, setSelectedContractView] = useState('All States')
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null)
  const [openSegment, setOpenSegment] = useState<{ segment: string; route: string } | null>(null)

  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersMessage, setOrdersMessage] = useState('')
  const [orderForm, setOrderForm] = useState<OrderFormState>({
    customer: '',
    city: 'Dubai',
    amount: '',
    currency: 'USD',
    itemsInput: 'FMCG-001:10',
  })

  useEffect(() => {
    let active = true
    const loadContractCount = async () => {
      try {
        const response = await fetch('/api/modules/contracts')
        const payload = await response.json()
        if (!active) return
        if (response.ok && payload?.success) {
          setContractsLive(Number(payload.total || 0))
        }
      } catch {
        if (active) setContractsLive(0)
      }
    }
    loadContractCount()
    return () => {
      active = false
    }
  }, [])

  const loadOrders = async () => {
    setOrdersLoading(true)
    try {
      const response = await fetch('/api/modules/demo/orders?limit=12')
      const payload = await response.json()
      if (response.ok && payload?.success) {
        setOrders(payload.data || [])
      } else {
        setOrdersMessage(payload?.error || 'Failed to load orders')
      }
    } catch {
      setOrdersMessage('Orders API unavailable')
    } finally {
      setOrdersLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const bands = Object.keys(MODULE_ARCHITECTURE)
  const allModules: ModuleDefinition[] = bands.flatMap(band =>
    MODULE_ARCHITECTURE[band as keyof typeof MODULE_ARCHITECTURE].map(module => ({
      ...module,
      band,
    }))
  )

  const visibleModules = allModules.filter(module => {
    const data = moduleData[module.id]
    const matchesBand = selectedBand === 'All Bands' || module.band === selectedBand
    const matchesSearch =
      searchQuery.length === 0 ||
      module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.band.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.route.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesIntelligence = selectedIntelligence === 'All Levels' || module.intelligence === selectedIntelligence
    const matchesReporting = selectedReporting === 'All Reports' || module.reporting === selectedReporting
    const matchesContractView =
      selectedContractView === 'All States' ||
      (selectedContractView === 'Ready' && Boolean(data?.contractReady)) ||
      (selectedContractView === 'Planned' && !data?.contractReady) ||
      (selectedContractView === 'Verified' && Boolean(validationData[module.id]?.valid))

    return matchesBand && matchesSearch && matchesIntelligence && matchesReporting && matchesContractView
  })

  const selectedModule = allModules.find(module => module.id === selectedModuleId) || visibleModules[0] || null
  const selectedModuleData = selectedModule ? moduleData[selectedModule.id] : undefined
  const selectedValidation = selectedModule ? validationData[selectedModule.id] : undefined
  const probedReadyCount = Object.values(moduleData).filter(data => data.contractReady).length
  const validatedCount = Object.values(validationData).filter(result => result.valid).length
  const highRiskCount = allModules.filter(module => module.intelligence === 'L5' || module.reporting === 'Executive').length
  const activeBandCount = new Set(visibleModules.map(module => module.band)).size

  const handleModuleClick = async (module: ModuleDefinition) => {
    setSelectedModuleId(module.id)
    setLoading(true)
    try {
      const response = await fetch('/api/modules/probe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: module.route }),
      })
      const payload = await response.json()
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || 'Probe failed')
      }
      setModuleData(prev => ({
        ...prev,
        [module.id]: {
          status: payload.data?.status || 'loaded',
          metrics: payload.data,
          contractReady: Boolean(payload.data?.contractReady),
          contractStandardized: Boolean(payload.data?.contractStandardized),
          contract: payload.data?.contract || null,
          protected: Boolean(payload.data?.protected),
          nextAction: payload.data?.nextAction,
        },
      }))
    } catch (error) {
      setModuleData(prev => ({
        ...prev,
        [module.id]: { status: 'error', error: String(error) },
      }))
    } finally {
      setLoading(false)
    }
  }

  const handleValidateSample = async (module: ModuleDefinition) => {
    const data = moduleData[module.id]
    const segment = getSegmentFromRoute(module.route)
    const samplePayload = data?.contract?.sampleCreatePayload
    if (!samplePayload) return

    try {
      const response = await fetch('/api/modules/contracts/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          segment,
          payload: samplePayload,
        }),
      })
      const payload = await response.json()
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || 'Validation failed')
      }

      setValidationData(prev => ({
        ...prev,
        [module.id]: {
          valid: Boolean(payload.data?.valid),
          missingFields: payload.data?.missingFields || [],
          typeErrors: payload.data?.typeErrors || [],
        },
      }))
    } catch {
      setValidationData(prev => ({
        ...prev,
        [module.id]: {
          valid: false,
          missingFields: ['validation_endpoint_error'],
          typeErrors: [],
        },
      }))
    }
  }

  const handleProbeVisible = async () => {
    setLoading(true)
    try {
      await Promise.all(visibleModules.map(module => handleModuleClick(module)))
    } finally {
      setLoading(false)
    }
  }

  const handleValidateVisible = async () => {
    setLoading(true)
    try {
      const modulesToValidate = visibleModules.filter(module => moduleData[module.id]?.contract?.sampleCreatePayload)
      await Promise.all(modulesToValidate.map(module => handleValidateSample(module)))
    } finally {
      setLoading(false)
    }
  }

  const parseItems = (input: string) => {
    return input
      .split(',')
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => {
        const [skuRaw, qtyRaw] = part.split(':')
        return {
          sku: (skuRaw || '').trim(),
          qty: Number((qtyRaw || '1').trim()) || 1,
        }
      })
      .filter(item => item.sku.length > 0)
  }

  const createOrder = async () => {
    const items = parseItems(orderForm.itemsInput)
    if (!orderForm.customer.trim() || items.length === 0) {
      setOrdersMessage('customer and at least one item are required')
      return
    }

    setOrdersLoading(true)
    setOrdersMessage('')
    try {
      const response = await fetch('/api/modules/demo/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: orderForm.customer.trim(),
          city: orderForm.city.trim() || 'Dubai',
          amount: Number(orderForm.amount || 0),
          currency: orderForm.currency || 'USD',
          items,
        }),
      })
      const payload = await response.json()
      if (!response.ok || !payload?.success) {
        setOrdersMessage(payload?.error || 'Create failed')
      } else {
        setOrdersMessage('Order created')
        setOrderForm(prev => ({ ...prev, customer: '', amount: '', itemsInput: 'FMCG-001:10' }))
        await loadOrders()
      }
    } catch {
      setOrdersMessage('Create failed')
    } finally {
      setOrdersLoading(false)
    }
  }

  const updateOrderStatus = async (id: string, status: string) => {
    setOrdersLoading(true)
    setOrdersMessage('')
    try {
      const response = await fetch(`/api/modules/demo/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const payload = await response.json()
      if (!response.ok || !payload?.success) {
        setOrdersMessage(payload?.error || 'Status update failed')
      } else {
        setOrdersMessage('Status updated')
        await loadOrders()
      }
    } catch {
      setOrdersMessage('Status update failed')
    } finally {
      setOrdersLoading(false)
    }
  }

  const deleteOrder = async (id: string) => {
    setOrdersLoading(true)
    setOrdersMessage('')
    try {
      const response = await fetch(`/api/modules/demo/orders/${id}`, { method: 'DELETE' })
      const payload = await response.json()
      if (!response.ok || !payload?.success) {
        setOrdersMessage(payload?.error || 'Delete failed')
      } else {
        setOrdersMessage('Order deleted')
        await loadOrders()
      }
    } catch {
      setOrdersMessage('Delete failed')
    } finally {
      setOrdersLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(195, 163, 94,0.12),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(107,31,43,0.08),transparent_30%),#f6f3ee] text-[#1a1a1a]">
      <div className="sticky top-0 z-30 border-b border-[#351017]/15 bg-gradient-to-r from-[#d7be80] to-harvics-gold px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[#351017]">
        Trial Preview: HARVICS /x Command Center UI
      </div>

      <div className="mx-auto w-[min(1400px,94vw)] py-6">
        {openSegment ? (
          <div className="mb-5">
            <ModuleWorkspace
              segment={openSegment.segment}
              basePath={openSegment.route}
              onClose={() => setOpenSegment(null)}
            />
          </div>
        ) : null}

        <section className="mb-5 rounded-[20px] border border-harvics-gold/30 bg-[linear-gradient(140deg,#1f0f14_0%,#3d161f_45%,#5e1f2d_100%)] p-6 text-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-[clamp(28px,4vw,44px)] font-bold leading-none tracking-[-0.02em]">X Command Center</h2>
              <p className="mt-2 max-w-4xl text-sm text-white/80">
                Real-time signals, approvals, and action orchestration across all {TOTAL_MODULES} modules with AI-ranked next steps,
                governance-aware execution, and live contract readiness.
              </p>
            </div>
            <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#f2dfb5]">
              {loading ? 'Refreshing command center' : 'Operational view active'}
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-harvics-gold/30 bg-white/10 p-4">
              <div className="mb-1 text-[11px] uppercase tracking-[0.14em] text-white/70">Visible Modules</div>
              <div className="font-mono text-3xl font-bold text-[#f2dfb5]">{visibleModules.length}</div>
            </div>
            <div className="rounded-2xl border border-harvics-gold/30 bg-white/10 p-4">
              <div className="mb-1 text-[11px] uppercase tracking-[0.14em] text-white/70">Contracts Live</div>
              <div className="font-mono text-3xl font-bold text-[#f2dfb5]">{contractsLive}</div>
            </div>
            <div className="rounded-2xl border border-harvics-gold/30 bg-white/10 p-4">
              <div className="mb-1 text-[11px] uppercase tracking-[0.14em] text-white/70">Verified Payloads</div>
              <div className="font-mono text-3xl font-bold text-[#f2dfb5]">{validatedCount}</div>
            </div>
            <div className="rounded-2xl border border-harvics-gold/30 bg-white/10 p-4">
              <div className="mb-1 text-[11px] uppercase tracking-[0.14em] text-white/70">Executive / L5 Risk</div>
              <div className="font-mono text-3xl font-bold text-[#f2dfb5]">{highRiskCount}</div>
            </div>
          </div>
        </section>

        <section className="grid items-start gap-4 xl:grid-cols-[270px_minmax(0,1fr)_330px]">
          <aside className="rounded-2xl border border-[#e8e2d5] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between gap-3 border-b border-[#e8e2d5] px-4 py-3">
              <h3 className="text-sm font-bold tracking-[0.02em]">Filters</h3>
              <span className="text-xs text-[#5e5e5e]">Region + Scope</span>
            </div>

            <div className="grid gap-3 p-4">
              <div className="grid gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4f4f4f]">Search</label>
                <input
                  type="text"
                  placeholder="Module, band, route"
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                  className="rounded-xl border border-[#d6d0c3] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-harvics-gold"
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4f4f4f]">Architecture Band</label>
                <select
                  value={selectedBand}
                  onChange={event => setSelectedBand(event.target.value)}
                  className="rounded-xl border border-[#d6d0c3] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-harvics-gold"
                >
                  <option>All Bands</option>
                  {bands.map(band => (
                    <option key={band}>{band}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4f4f4f]">Intelligence</label>
                <select
                  value={selectedIntelligence}
                  onChange={event => setSelectedIntelligence(event.target.value)}
                  className="rounded-xl border border-[#d6d0c3] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-harvics-gold"
                >
                  <option>All Levels</option>
                  <option>L1</option>
                  <option>L2</option>
                  <option>L3</option>
                  <option>L4</option>
                  <option>L5</option>
                </select>
              </div>

              <div className="grid gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4f4f4f]">Reporting</label>
                <select
                  value={selectedReporting}
                  onChange={event => setSelectedReporting(event.target.value)}
                  className="rounded-xl border border-[#d6d0c3] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-harvics-gold"
                >
                  <option>All Reports</option>
                  {Array.from(new Set(allModules.map(module => module.reporting))).map(reporting => (
                    <option key={reporting}>{reporting}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4f4f4f]">Contract State</label>
                <select
                  value={selectedContractView}
                  onChange={event => setSelectedContractView(event.target.value)}
                  className="rounded-xl border border-[#d6d0c3] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-harvics-gold"
                >
                  <option>All States</option>
                  <option>Ready</option>
                  <option>Planned</option>
                  <option>Verified</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="rounded-full border border-harvics-gold/40 bg-harvics-gold/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#75551a]">
                  {activeBandCount} active bands
                </span>
                <span className="rounded-full border border-harvics-burgundy/30 bg-harvics-burgundy/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-harvics-burgundy">
                  {highRiskCount} executive risks
                </span>
                <span className="rounded-full border border-[#0f8b5f]/30 bg-[#0f8b5f]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#0f8b5f]">
                  {validatedCount} verified
                </span>
              </div>
            </div>
          </aside>

          <section className="rounded-2xl border border-[#e8e2d5] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e2d5] px-4 py-3">
              <div>
                <h3 className="text-sm font-bold tracking-[0.02em]">Live Activity Feed</h3>
                <p className="text-xs text-[#5e5e5e]">{visibleModules.length} modules in current command view</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleProbeVisible}
                  className="rounded-xl border border-[#d6d0c3] bg-white px-3 py-2 text-xs font-bold text-[#3a3a3a]"
                >
                  Probe Visible
                </button>
                <button
                  type="button"
                  onClick={handleValidateVisible}
                  className="rounded-xl border border-harvics-burgundy bg-harvics-burgundy px-3 py-2 text-xs font-bold text-white"
                >
                  Validate Visible
                </button>
              </div>
            </div>

            <div className="grid gap-3 p-3">
              {visibleModules.map(module => {
                const data = moduleData[module.id]
                const validation = validationData[module.id]
                const tone = getStatusTone(data, validation)
                return (
                  <article
                    key={module.id}
                    className={`grid gap-3 rounded-2xl border p-4 transition ${selectedModuleId === module.id ? 'border-harvics-burgundy bg-[#fffaf7]' : 'border-[#e8e2d5] bg-white'}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-[#8d826d]">
                          #{module.id} · {module.band}
                        </div>
                        <h4 className="text-base font-bold text-[#1a1a1a]">{module.name}</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${tone.pill}`}>
                          {tone.label}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${getIntelligenceTone(module.intelligence)}`}>
                          {module.intelligence}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-[#666]">
                      <span>Report: {module.reporting}</span>
                      <span>Route: {module.route}</span>
                      <span>Segment: {getSegmentFromRoute(module.route)}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleModuleClick(module)}
                        className="rounded-xl border border-harvics-burgundy bg-harvics-burgundy px-3 py-2 text-xs font-bold text-white"
                      >
                        Probe
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedModuleId(module.id)}
                        className="rounded-xl border border-[#d6d0c3] bg-white px-3 py-2 text-xs font-bold text-[#3a3a3a]"
                      >
                        Inspect
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpenSegment({ segment: getSegmentFromRoute(module.route), route: module.route })}
                        className="rounded-xl border border-harvics-gold bg-white px-3 py-2 text-xs font-bold text-[#75551a]"
                      >
                        Open Workspace
                      </button>
                      <a
                        href={`/en/os/module/${module.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-harvics-gold bg-harvics-gold px-3 py-2 text-xs font-bold text-harvics-burgundy"
                      >
                        Open Module →
                      </a>
                      {data?.contract?.sampleCreatePayload ? (
                        <button
                          type="button"
                          onClick={() => handleValidateSample(module)}
                          className="rounded-xl border border-[#d6d0c3] bg-white px-3 py-2 text-xs font-bold text-[#3a3a3a]"
                        >
                          Validate Sample
                        </button>
                      ) : null}
                    </div>

                    <div className="grid gap-1 text-xs text-[#5e5e5e]">
                      <div>
                        <span className="font-bold text-[#3a3a3a]">Required fields:</span>{' '}
                        {data?.contract?.requiredCreateFields?.join(', ') || 'Contract not probed yet'}
                      </div>
                      <div>
                        <span className="font-bold text-[#3a3a3a]">Governance:</span>{' '}
                        {data?.contract?.governance?.join(', ') || 'Awaiting probe'}
                      </div>
                      <div>
                        <span className="font-bold text-[#3a3a3a]">Next action:</span> {data?.nextAction || 'Probe this module'}
                      </div>
                      {validation ? (
                        <div className={validation.valid ? 'text-[#0f8b5f]' : 'text-[#b42318]'}>
                          {validation.valid
                            ? 'Sample payload valid and ready for UI generation.'
                            : `Sample payload invalid. Missing: ${validation.missingFields.join(', ') || 'none'} | Type errors: ${validation.typeErrors.length}`}
                        </div>
                      ) : null}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <aside className="rounded-2xl border border-[#e8e2d5] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between gap-3 border-b border-[#e8e2d5] px-4 py-3">
              <div>
                <h3 className="text-sm font-bold tracking-[0.02em]">Intelligence Panel</h3>
                <p className="text-xs text-[#5e5e5e]">AI summary + selected module detail</p>
              </div>
            </div>

            <div className="grid gap-3 p-4">
              <div className="rounded-2xl border border-[#e8e2d5] bg-white p-3">
                <h4 className="mb-2 text-sm font-bold">Selected module</h4>
                {selectedModule ? (
                  <>
                    <p className="text-sm font-semibold text-[#1a1a1a]">{selectedModule.name}</p>
                    <p className="mt-1 text-xs text-[#5e5e5e]">{selectedModule.band} · {selectedModule.route}</p>
                    <p className="mt-2 text-xs text-[#5e5e5e]">
                      {selectedModuleData?.contractReady
                        ? 'Contract resolved and ready for UI implementation.'
                        : 'This module still needs a completed probe or final backend surface.'}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-[#5e5e5e]">No module selected.</p>
                )}
              </div>

              <div className="rounded-2xl border border-[#e8e2d5] bg-white p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold">Orders CRUD Lab</h4>
                  <button
                    type="button"
                    onClick={loadOrders}
                    className="rounded-lg border border-[#d6d0c3] bg-white px-2 py-1 text-[11px] font-bold text-[#3a3a3a]"
                  >
                    Refresh
                  </button>
                </div>

                <div className="grid gap-2">
                  <input
                    value={orderForm.customer}
                    onChange={event => setOrderForm(prev => ({ ...prev, customer: event.target.value }))}
                    placeholder="Customer"
                    className="rounded-lg border border-[#d6d0c3] px-2 py-1.5 text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={orderForm.city}
                      onChange={event => setOrderForm(prev => ({ ...prev, city: event.target.value }))}
                      placeholder="City"
                      className="rounded-lg border border-[#d6d0c3] px-2 py-1.5 text-xs"
                    />
                    <input
                      value={orderForm.amount}
                      onChange={event => setOrderForm(prev => ({ ...prev, amount: event.target.value }))}
                      placeholder="Amount"
                      className="rounded-lg border border-[#d6d0c3] px-2 py-1.5 text-xs"
                    />
                  </div>
                  <input
                    value={orderForm.itemsInput}
                    onChange={event => setOrderForm(prev => ({ ...prev, itemsInput: event.target.value }))}
                    placeholder="Items (SKU:QTY,SKU:QTY)"
                    className="rounded-lg border border-[#d6d0c3] px-2 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={createOrder}
                    className="rounded-lg border border-harvics-burgundy bg-harvics-burgundy px-2 py-1.5 text-xs font-bold text-white"
                  >
                    Create Order
                  </button>
                </div>

                {ordersMessage ? <p className="mt-2 text-[11px] text-[#5d5d5d]">{ordersMessage}</p> : null}

                <div className="mt-3 grid max-h-56 gap-2 overflow-auto">
                  {ordersLoading && orders.length === 0 ? (
                    <p className="text-xs text-[#5d5d5d]">Loading orders...</p>
                  ) : (
                    orders.map(order => (
                      <div key={order.id} className="rounded-lg border border-[#e8e2d5] p-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-[#1a1a1a]">{order.customer}</p>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">{order.status}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-[#5d5d5d]">
                          {order.city || 'N/A'} · {order.currency} {Number(order.amount || 0).toLocaleString()}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.id, 'Completed')}
                            className="rounded border border-[#d6d0c3] bg-white px-2 py-1 text-[10px] font-bold text-[#3a3a3a]"
                          >
                            Complete
                          </button>
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                            className="rounded border border-[#d6d0c3] bg-white px-2 py-1 text-[10px] font-bold text-[#3a3a3a]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteOrder(order.id)}
                            className="rounded border border-[#d6d0c3] bg-white px-2 py-1 text-[10px] font-bold text-[#b42318]"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-[#e8e2d5] bg-white p-3">
                <h4 className="mb-2 text-sm font-bold">Top anomaly</h4>
                <p className="text-xs leading-6 text-[#5d5d5d]">
                  {highRiskCount} modules sit at executive or L5 intelligence. Focus implementation on the highest-governance bands first:
                  Finance, GRC, Data & AI.
                </p>
              </div>

              <div className="rounded-2xl border border-[#e8e2d5] bg-white p-3">
                <h4 className="mb-2 text-sm font-bold">Recommended next actions</h4>
                <p className="text-xs leading-6 text-[#5d5d5d]">
                  1) Probe all visible modules to warm status cache. 2) Validate sample payloads for contract-ready items. 3) Promote verified
                  modules into real CRUD screens band-by-band.
                </p>
              </div>

              <div className="rounded-2xl border border-[#e8e2d5] bg-white p-3">
                <h4 className="mb-2 text-sm font-bold">Governance pulse</h4>
                <p className="text-xs leading-6 text-[#5d5d5d]">
                  Neural Governance is attached to all write-capable routes. Current contract coverage: {contractsLive} segments. Current probe-ready
                  modules in this session: {probedReadyCount}. Current verified payloads: {validatedCount}.
                </p>
              </div>

              <div className="rounded-2xl border border-[#e8e2d5] bg-white p-3">
                <h4 className="mb-2 text-sm font-bold">Keyboard guide</h4>
                <p className="text-xs leading-6 text-[#5d5d5d]">
                  <span className="rounded-md border border-[#dfd5bf] bg-[#f3eee2] px-1.5 py-0.5 font-mono text-[11px] text-[#745926]">Probe</span>{' '}
                  to refresh backend status.{' '}
                  <span className="rounded-md border border-[#dfd5bf] bg-[#f3eee2] px-1.5 py-0.5 font-mono text-[11px] text-[#745926]">Validate</span>{' '}
                  to confirm payload readiness.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <div className="sticky bottom-4 mt-4 rounded-2xl border border-[#e8e2d5] bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={handleProbeVisible}
              className="rounded-xl border border-harvics-burgundy bg-harvics-burgundy px-4 py-2 text-xs font-bold text-white"
            >
              Probe Visible
            </button>
            <button
              type="button"
              onClick={handleValidateVisible}
              className="rounded-xl border border-[#d6d0c3] bg-white px-4 py-2 text-xs font-bold text-[#3a3a3a]"
            >
              Validate Visible
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedBand('All Bands')
                setSelectedIntelligence('All Levels')
                setSelectedReporting('All Reports')
                setSelectedContractView('All States')
                setSearchQuery('')
              }}
              className="rounded-xl border border-[#d6d0c3] bg-white px-4 py-2 text-xs font-bold text-[#3a3a3a]"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
