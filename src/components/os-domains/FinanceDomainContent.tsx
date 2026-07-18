'use client'

import React, { useState, useEffect } from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import GLOverviewContent from '@/components/domains/finance/GLOverviewContent'
import ARContent from '@/components/domains/finance/ARContent'
import APContent from '@/components/domains/finance/APContent'
import CashBankContent from '@/components/domains/finance/CashBankContent'
import { FinanceAnalyticsCharts } from '@/components/os-domains/DomainAnalyticsCharts'

interface FinanceDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function FinanceDomainContent({ persona, locale }: FinanceDomainContentProps) {

  // ── REALISTIC FALLBACK DATA (shown immediately; replaced by live API on backend restart) ──
  const SEED_ASSETS = [
    { id: 'fa1', assetCode: 'FA-2026-001', name: 'Dubai Logistics City — Warehouse Fit-Out', category: 'Leasehold Improvement', industryVertical: 'All', purchaseCost: 480000, salvageValue: 0, usefulLifeYears: 10, depreciationMethod: 'Straight-Line', accumulatedDepreciation: 112000, bookValue: 368000, currency: 'USD', location: 'DXB-W1', status: 'Active' },
    { id: 'fa2', assetCode: 'FA-2026-002', name: 'Isuzu NPR Fleet — 3 Trucks (KHI)', category: 'Vehicles', industryVertical: 'Logistics', purchaseCost: 216000, salvageValue: 24000, usefulLifeYears: 5, depreciationMethod: 'Straight-Line', accumulatedDepreciation: 76800, bookValue: 139200, currency: 'USD', location: 'KHI-W1', status: 'Active' },
    { id: 'fa3', assetCode: 'FA-2026-003', name: 'Industrial Textile Loom — 2 Units', category: 'Machinery', industryVertical: 'Textiles', purchaseCost: 240000, salvageValue: 20000, usefulLifeYears: 8, depreciationMethod: 'Declining-Balance', accumulatedDepreciation: 110000, bookValue: 130000, currency: 'USD', location: 'KHI-W1', status: 'Active' },
    { id: 'fa4', assetCode: 'FA-2026-004', name: 'HARVICS OS — ERP & Server Infrastructure', category: 'IT Equipment', industryVertical: 'All', purchaseCost: 85000, salvageValue: 5000, usefulLifeYears: 4, depreciationMethod: 'Straight-Line', accumulatedDepreciation: 20000, bookValue: 65000, currency: 'USD', location: 'Cloud / Azure', status: 'Active' },
    { id: 'fa5', assetCode: 'FA-2026-005', name: 'Cold Chain Storage Unit — Lahore', category: 'Plant & Equipment', industryVertical: 'FMCG', purchaseCost: 145000, salvageValue: 10000, usefulLifeYears: 12, depreciationMethod: 'Straight-Line', accumulatedDepreciation: 22917, bookValue: 122083, currency: 'USD', location: 'LHR-W2', status: 'Active' },
    { id: 'fa6', assetCode: 'FA-2026-006', name: 'Dubai Trade Office — Leasehold Fit-Out', category: 'Leasehold Improvement', industryVertical: 'All', purchaseCost: 92000, salvageValue: 0, usefulLifeYears: 5, depreciationMethod: 'Straight-Line', accumulatedDepreciation: 36800, bookValue: 55200, currency: 'USD', location: 'Dubai DIFC', status: 'Active' },
    { id: 'fa7', assetCode: 'FA-2026-007', name: 'Forklift Fleet — 4 Units (DXB)', category: 'Material Handling', industryVertical: 'All', purchaseCost: 128000, salvageValue: 12000, usefulLifeYears: 7, depreciationMethod: 'Straight-Line', accumulatedDepreciation: 32914, bookValue: 95086, currency: 'USD', location: 'DXB-W1', status: 'Active' },
    { id: 'fa8', assetCode: 'FA-2026-008', name: 'Commodity Testing Laboratory Equipment', category: 'Laboratory', industryVertical: 'Commodities', purchaseCost: 58000, salvageValue: 3000, usefulLifeYears: 6, depreciationMethod: 'Straight-Line', accumulatedDepreciation: 12292, bookValue: 45708, currency: 'USD', location: 'DXB-W3', status: 'Active' },
  ]

  const SEED_COST_CENTERS = [
    { id: 'cc1', code: 'CC-001', name: 'FMCG — Trade Operations', type: 'Revenue', industryVertical: 'FMCG', budget: 1200000, actualSpend: 847200, currency: 'USD', manager: 'Ahmed Hassan', status: 'Active', period: '2026' },
    { id: 'cc2', code: 'CC-002', name: 'Textiles — Manufacturing & Export', type: 'Manufacturing', industryVertical: 'Textiles', budget: 840000, actualSpend: 619400, currency: 'USD', manager: 'Sara Malik', status: 'Active', period: '2026' },
    { id: 'cc3', code: 'CC-003', name: 'Commodities — Arabica & Green Tea', type: 'Revenue', industryVertical: 'Commodities', budget: 2400000, actualSpend: 1628000, currency: 'USD', manager: 'James Obi', status: 'Active', period: '2026' },
    { id: 'cc4', code: 'CC-004', name: 'Logistics & Distribution — MENA', type: 'Operations', industryVertical: 'All', budget: 620000, actualSpend: 581400, currency: 'USD', manager: 'Omar Farooq', status: 'Active', period: '2026' },
    { id: 'cc5', code: 'CC-005', name: 'Corporate HQ — Administration', type: 'Overhead', industryVertical: 'All', budget: 380000, actualSpend: 214800, currency: 'USD', manager: 'Fatima Khan', status: 'Active', period: '2026' },
    { id: 'cc6', code: 'CC-006', name: 'Technology & AI — HARVICS OS', type: 'Overhead', industryVertical: 'All', budget: 460000, actualSpend: 312900, currency: 'USD', manager: 'Shah Tabraiz', status: 'Active', period: '2026' },
    { id: 'cc7', code: 'CC-007', name: 'Business Development — Europe & UK', type: 'Sales', industryVertical: 'All', budget: 280000, actualSpend: 198400, currency: 'USD', manager: 'David Chen', status: 'Active', period: '2026' },
    { id: 'cc8', code: 'CC-008', name: 'Procurement — Global Sourcing', type: 'Operations', industryVertical: 'All', budget: 320000, actualSpend: 218700, currency: 'USD', manager: 'Zainab Yusuf', status: 'Active', period: '2026' },
  ]

  const SEED_BUDGETS = [
    { id: 'b1', budgetCode: 'BUD-2026-Q1', name: 'Q1 2026 — Operating Budget', period: 'Q1-2026', totalBudget: 5900000, totalActual: 4422800, variance: 1477200, variancePct: 25.0, status: 'Closed', currency: 'USD', approvedBy: 'Board of Directors' },
    { id: 'b2', budgetCode: 'BUD-2026-Q2', name: 'Q2 2026 — Operating Budget', period: 'Q2-2026', totalBudget: 6800000, totalActual: 1628000, variance: 5172000, variancePct: 76.1, status: 'Active', currency: 'USD', approvedBy: 'CEO & CFO' },
    { id: 'b3', budgetCode: 'BUD-2026-CAPEX', name: 'FY2026 — Capital Expenditure', period: 'FY-2026', totalBudget: 1800000, totalActual: 1044000, variance: 756000, variancePct: 42.0, status: 'Active', currency: 'USD', approvedBy: 'Board of Directors' },
    { id: 'b4', budgetCode: 'BUD-2026-MKTING', name: 'FY2026 — Brand & Trade Marketing', period: 'FY-2026', totalBudget: 420000, totalActual: 187400, variance: 232600, variancePct: 55.4, status: 'Active', currency: 'USD', approvedBy: 'CMO' },
  ]

  const SEED_PERIODS = [
    { id: 'fp1', periodCode: 'FP-2026-01', name: 'January 2026', year: 2026, month: 1, status: 'Closed', closedBy: 'Fatima Khan', closedAt: '2026-02-05', journalCount: 284, invoiceCount: 142, totalDebits: 4820000, totalCredits: 4820000, balanced: true },
    { id: 'fp2', periodCode: 'FP-2026-02', name: 'February 2026', year: 2026, month: 2, status: 'Closed', closedBy: 'Fatima Khan', closedAt: '2026-03-04', journalCount: 311, invoiceCount: 168, totalDebits: 5241000, totalCredits: 5241000, balanced: true },
    { id: 'fp3', periodCode: 'FP-2026-03', name: 'March 2026', year: 2026, month: 3, status: 'Open', closedBy: null, closedAt: null, journalCount: 187, invoiceCount: 94, totalDebits: 3184500, totalCredits: 3181200, balanced: false },
  ]

  const SEED_GL_ACCOUNTS = [
    { id: 'gl1', accountCode: '1000', name: 'Cash & Bank — Consolidated', type: 'Asset', normalBalance: 'Debit', industryVertical: 'All', balance: 4280000, currency: 'USD', status: 'Active' },
    { id: 'gl2', accountCode: '1100', name: 'Accounts Receivable', type: 'Asset', normalBalance: 'Debit', industryVertical: 'All', balance: 2847000, currency: 'USD', status: 'Active' },
    { id: 'gl3', accountCode: '1200', name: 'Inventory — All Verticals', type: 'Asset', normalBalance: 'Debit', industryVertical: 'All', balance: 3120000, currency: 'USD', status: 'Active' },
    { id: 'gl4', accountCode: '1500', name: 'Fixed Assets — Net Book Value', type: 'Asset', normalBalance: 'Debit', industryVertical: 'All', balance: 1020277, currency: 'USD', status: 'Active' },
    { id: 'gl5', accountCode: '2000', name: 'Accounts Payable', type: 'Liability', normalBalance: 'Credit', industryVertical: 'All', balance: 1624000, currency: 'USD', status: 'Active' },
    { id: 'gl6', accountCode: '2100', name: 'Accrued Liabilities', type: 'Liability', normalBalance: 'Credit', industryVertical: 'All', balance: 384000, currency: 'USD', status: 'Active' },
    { id: 'gl7', accountCode: '2500', name: 'Bank Loans & Facilities', type: 'Liability', normalBalance: 'Credit', industryVertical: 'All', balance: 2800000, currency: 'USD', status: 'Active' },
    { id: 'gl8', accountCode: '3000', name: 'Share Capital', type: 'Equity', normalBalance: 'Credit', industryVertical: 'All', balance: 8000000, currency: 'USD', status: 'Active' },
    { id: 'gl9', accountCode: '3100', name: 'Retained Earnings', type: 'Equity', normalBalance: 'Credit', industryVertical: 'All', balance: 1842000, currency: 'USD', status: 'Active' },
    { id: 'gl10', accountCode: '4000', name: 'Revenue — FMCG Trading', type: 'Revenue', normalBalance: 'Credit', industryVertical: 'FMCG', balance: 8240000, currency: 'USD', status: 'Active' },
    { id: 'gl11', accountCode: '4100', name: 'Revenue — Textiles & Apparel', type: 'Revenue', normalBalance: 'Credit', industryVertical: 'Textiles', balance: 5180000, currency: 'USD', status: 'Active' },
    { id: 'gl12', accountCode: '4200', name: 'Revenue — Commodities', type: 'Revenue', normalBalance: 'Credit', industryVertical: 'Commodities', balance: 11420000, currency: 'USD', status: 'Active' },
    { id: 'gl13', accountCode: '5000', name: 'Cost of Goods Sold', type: 'Expense', normalBalance: 'Debit', industryVertical: 'All', balance: 15241000, currency: 'USD', status: 'Active' },
    { id: 'gl14', accountCode: '6000', name: 'Operating Expenses', type: 'Expense', normalBalance: 'Debit', industryVertical: 'All', balance: 4622800, currency: 'USD', status: 'Active' },
    { id: 'gl15', accountCode: '6100', name: 'Depreciation Expense', type: 'Expense', normalBalance: 'Debit', industryVertical: 'All', balance: 413723, currency: 'USD', status: 'Active' },
  ]

  // Live state — starts with seed data, API overwrites on success
  const [assets, setAssets] = useState<any[]>(SEED_ASSETS)
  const [costCenters, setCostCenters] = useState<any[]>(SEED_COST_CENTERS)
  const [budgets, setBudgets] = useState<any[]>(SEED_BUDGETS)
  const [periods, setPeriods] = useState<any[]>(SEED_PERIODS)
  const [glAccounts, setGlAccounts] = useState<any[]>(SEED_GL_ACCOUNTS)
  const [dashboard, setDashboard] = useState<any>(null)
  const [depResult, setDepResult] = useState<any>(null)
  const [depLoading, setDepLoading] = useState(false)

  // ── BLOOMBERG-GRADE LIVE ENGINE ──────────────────────────────────────
  const [animated, setAnimated]             = useState(false)
  const [countedUp, setCountedUp]           = useState(false)
  const [displayCC, setDisplayCC]           = useState<any[]>([])
  const [displayBudgets, setDisplayBudgets] = useState<any[]>([])
  const [clockMs, setClockMs]               = useState(new Date())   // 100ms clock — shows ms
  const [journalTick, setJournalTick]       = useState(187)
  const [flashMap, setFlashMap]             = useState<Record<string,'up'|'down'>>({})
  const [tickerItems, setTickerItems]       = useState([
    {id:1, code:'FMCG-DXB',  label:'Arabica DXB Invoice',      amt:'+142,800', type:'in'  as const},
    {id:2, code:'LOG-KHI',   label:'Fleet Maintenance KHI',     amt:'-8,200',   type:'out' as const},
    {id:3, code:'TEX-UK',    label:'Textile Export Payment',     amt:'+384,000', type:'in'  as const},
    {id:4, code:'FMCG-ROT',  label:'Rotterdam Shipment',         amt:'+218,400', type:'in'  as const},
    {id:5, code:'OFC-DXB',   label:'Dubai Office Utilities',     amt:'-23,000',  type:'out' as const},
    {id:6, code:'TEA-LHR',   label:'Green Tea Freight LHR',      amt:'+96,400',  type:'in'  as const},
    {id:7, code:'WRK-UK',    label:'Workwear Export UK',         amt:'+164,000', type:'in'  as const},
    {id:8, code:'MACH-KHI',  label:'Machinery Service Contract', amt:'-41,200',  type:'out' as const},
    {id:9, code:'COMM-LDN',  label:'Arabica Futures Margin',     amt:'+312,000', type:'in'  as const},
    {id:10,code:'BD-LON',    label:'IFE London Travel Expense',  amt:'-6,800',   type:'out' as const},
  ])
  const [sparkHistory, setSparkHistory] = useState<Record<string,number[]>>({
    'CC-001':[52,56,60,63,66,68,70,71], 'CC-002':[58,61,64,67,69,71,73,74],
    'CC-003':[48,53,56,60,63,65,67,68], 'CC-004':[76,80,84,87,89,91,93,94],
    'CC-005':[38,43,47,50,53,55,56,57], 'CC-006':[50,55,58,61,64,66,67,68],
    'CC-007':[56,60,63,66,68,69,70,71], 'CC-008':[57,60,62,64,66,67,67,68],
  })
  const feedRef  = React.useRef(0)
  const streamRef = React.useRef(0)

  // Inject keyframes once
  React.useEffect(() => {
    const id = 'hv-finance-styles'
    if (document.getElementById(id)) return
    const s = document.createElement('style')
    s.id = id
    s.textContent = `
      @keyframes hv-up   { 0%{background:#dcfce7;color:#15803d} 80%{background:#dcfce7} 100%{background:transparent} }
      @keyframes hv-down { 0%{background:#fee2e2;color:#dc2626} 80%{background:#fee2e2} 100%{background:transparent} }
      @keyframes hv-tick { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
      .hv-flash-up   { animation: hv-up   0.65s ease forwards; }
      .hv-flash-down { animation: hv-down 0.65s ease forwards; }
      .hv-ticker     { display:flex; animation: hv-tick 28s linear infinite; }
      .hv-ticker:hover { animation-play-state:paused; }
    `
    document.head.appendChild(s)
  }, [])

  // Millisecond clock — 100ms interval gives real-time feel
  useEffect(() => {
    const c = setInterval(() => setClockMs(new Date()), 100)
    return () => clearInterval(c)
  }, [])

  // Journal count — new entry every 12s (realistic for open month)
  useEffect(() => {
    const j = setInterval(() => setJournalTick(p => p + 1), 12000)
    return () => clearInterval(j)
  }, [])

  // Count-up on mount
  useEffect(() => {
    if (countedUp) return
    let step = 0
    const timer = setInterval(() => {
      step++
      const e = 1 - Math.pow(1 - step / 60, 3)
      setDisplayCC(costCenters.map(cc => ({ ...cc, actualSpend: Math.round(cc.actualSpend * e) })))
      setDisplayBudgets(budgets.map(b => ({ ...b, totalActual: Math.round(b.totalActual * e) })))
      if (step >= 60) { clearInterval(timer); setDisplayCC(costCenters); setDisplayBudgets(budgets); setCountedUp(true) }
    }, 1400 / 60)
    setTimeout(() => setAnimated(true), 120)
    return () => clearInterval(timer)
  }, [costCenters, budgets, countedUp])

  // LIVE STREAM — fires every 1.5s, updates 2-3 CCs simultaneously, flashes cells
  const STREAM_EVENTS = [
    {code:'FMCG-DXB', label:'Arabica DXB Invoice',       sign:1,  range:[8000,28000]  },
    {code:'LOG-KHI',  label:'Fleet Fuel KHI',             sign:-1, range:[1200,6000]   },
    {code:'TEX-UK',   label:'Textile Export UK',          sign:1,  range:[12000,48000] },
    {code:'FMCG-ROT', label:'Rotterdam Clearance',        sign:1,  range:[6000,22000]  },
    {code:'OFC-DXB',  label:'Dubai Overhead',             sign:-1, range:[800,4000]    },
    {code:'TEA-LHR',  label:'Green Tea LHR',              sign:1,  range:[4000,18000]  },
    {code:'WRK-UK',   label:'Workwear Remittance',        sign:1,  range:[9000,36000]  },
    {code:'MACH-KHI', label:'Machinery Contract',         sign:-1, range:[2000,12000]  },
    {code:'COMM-LDN', label:'Arabica Futures',            sign:1,  range:[18000,64000] },
    {code:'BD-LON',   label:'London IFE Expense',         sign:-1, range:[600,3200]    },
    {code:'COLD-LHR', label:'Cold Chain Storage',         sign:-1, range:[1400,5800]   },
    {code:'DIST-LHR', label:'FMCG Distributor LHR',      sign:1,  range:[22000,86000] },
  ]

  useEffect(() => {
    if (!countedUp) return
    const timer = setInterval(() => {
      streamRef.current++
      const count = streamRef.current

      // pick 2-3 random CC indices to update simultaneously
      const numHits = count % 5 === 0 ? 3 : 2
      const indices: number[] = []
      while (indices.length < numHits) {
        const i = Math.floor(Math.random() * costCenters.length)
        if (!indices.includes(i)) indices.push(i)
      }

      const newFlash: Record<string,'up'|'down'> = {}
      let tickerAmt = 0
      let tickerCode = ''
      let tickerLabel = ''
      let tickerType: 'in'|'out' = 'in'

      setCostCenters(prev => {
        const upd = prev.map((cc, i) => {
          if (!indices.includes(i)) return cc
          const evIdx = (count + i) % STREAM_EVENTS.length
          const ev = STREAM_EVENTS[evIdx]
          const [lo, hi] = ev.range
          const delta = Math.round(lo + Math.random() * (hi - lo))
          const change = ev.sign * delta * 0.35
          const newSpend = Math.max(0, cc.actualSpend + change)
          newFlash[cc.code] = change > 0 ? 'up' : 'down'
          if (i === indices[0]) { tickerAmt = delta; tickerCode = ev.code; tickerLabel = ev.label; tickerType = ev.sign > 0 ? 'in' : 'out' }
          return { ...cc, actualSpend: newSpend }
        })
        setDisplayCC(upd)
        // extend sparklines for updated CCs
        indices.forEach(i => {
          const cc = upd[i]
          if (!cc) return
          const util = cc.budget > 0 ? Math.round((cc.actualSpend / cc.budget) * 100) : 0
          setSparkHistory(sh => ({ ...sh, [cc.code]: [...(sh[cc.code]||[]).slice(-7), util] }))
        })
        return upd
      })

      setBudgets(prev => {
        const upd = prev.map((b, i) => {
          if (i > 2) return b
          const bump = Math.round(tickerAmt * (0.3 + Math.random() * 0.4))
          newFlash[`bud-${b.id||b.budgetCode}`] = 'up'
          return { ...b, totalActual: Math.max(0, b.totalActual + bump) }
        })
        return upd
      })

      // flash — set then clear after 650ms
      setFlashMap(prev => ({ ...prev, ...newFlash }))
      setTimeout(() => setFlashMap(prev => {
        const next = { ...prev }
        Object.keys(newFlash).forEach(k => delete next[k])
        return next
      }), 650)

      // add to scrolling ticker
      setTickerItems(prev => {
        const newItem = {
          id: Date.now(),
          code: tickerCode,
          label: tickerLabel,
          amt: `${tickerType==='in'?'+':'-'}${tickerAmt.toLocaleString()}`,
          type: tickerType,
        }
        return [newItem, ...prev.slice(0, 19)]
      })

    }, 1500)
    return () => clearInterval(timer)
  }, [costCenters, countedUp])

  useEffect(() => { if (countedUp) setDisplayBudgets(budgets) }, [budgets, countedUp])

  const fmtK = (n: number) => n >= 1000000 ? `$${(n/1000000).toFixed(2)}M` : `$${Math.round(n/1000)}K`

  const clockStr = (() => {
    const h = clockMs.getHours().toString().padStart(2,'0')
    const m = clockMs.getMinutes().toString().padStart(2,'0')
    const s = clockMs.getSeconds().toString().padStart(2,'0')
    const ms = Math.floor(clockMs.getMilliseconds()/10).toString().padStart(2,'0')
    return `${h}:${m}:${s}.${ms}`
  })()

  // Sparkline SVG
  const Spark = ({ data, color='var(--harvics-burgundy)' }: { data:number[], color?:string }) => {
    if (data.length < 2) return null
    const w=80,h=28,pad=2,mn=Math.min(...data),mx=Math.max(...data),rng=mx-mn||1
    const pts = data.map((v,i)=>`${pad+(i/(data.length-1))*(w-pad*2)},${h-pad-((v-mn)/rng)*(h-pad*2)}`).join(' ')
    const lx = w-pad, ly = h-pad-((data[data.length-1]-mn)/rng)*(h-pad*2)
    const trend = data[data.length-1] >= data[0]
    const col = trend ? '#16a34a' : '#dc2626'
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <polyline points={pts} fill="none" stroke={col} strokeWidth="1.8" strokeLinejoin="round"/>
        <circle cx={lx} cy={ly} r="3" fill={col}/>
      </svg>
    )
  }

  // Scrolling ticker tape — Bloomberg-style bottom bar
  const Ticker = () => {
    const items = [...tickerItems, ...tickerItems] // duplicate for seamless loop
    return (
      <div className="border-t-2 border-harvics-burgundy bg-[#1a0810] overflow-hidden" style={{height:36}}>
        <div className="hv-ticker items-center h-full" style={{width:'max-content'}}>
          {items.map((item, i) => (
            <div key={`${item.id}-${i}`} className="flex items-center gap-3 px-5 border-r border-white/10 h-full flex-shrink-0">
              <span className="text-[10px] font-black text-white/40 tracking-widest">{item.code}</span>
              <span className="text-[11px] text-white/70 whitespace-nowrap">{item.label}</span>
              <span className={`text-[11px] font-black whitespace-nowrap ${item.type==='in'?'text-emerald-400':'text-red-400'}`}>
                {item.type==='in'?'▲':'▼'} ${item.amt.replace(/[+-]/,'')}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Live header clock strip
  const LiveClock = () => (
    <div className="flex items-center gap-3 px-1">
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span className="text-[10px] font-black text-emerald-300 tracking-widest">LIVE</span>
      <span className="font-mono text-[11px] text-white/60 tabular-nums">{clockStr}</span>
    </div>
  )

  // Activity strip (used below ticker in each module)
  const ActivityStrip = () => <Ticker />

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || 'demo-token-company_admin' : 'demo-token-company_admin'
    const headers = { 'Authorization': `Bearer ${token}` }
    Promise.all([
      fetch('/api/finance/assets', { headers }).then(r => r.json()).catch(() => null),
      fetch('/api/finance/cost-centers', { headers }).then(r => r.json()).catch(() => null),
      fetch('/api/finance/budgets', { headers }).then(r => r.json()).catch(() => null),
      fetch('/api/finance/fiscal-periods', { headers }).then(r => r.json()).catch(() => null),
      fetch('/api/finance/gl-accounts', { headers }).then(r => r.json()).catch(() => null),
      fetch('/api/finance/dashboard', { headers }).then(r => r.json()).catch(() => null),
    ]).then(([a, cc, b, fp, gl, dash]) => {
      if (a?.success && a.data?.length) setAssets(a.data)
      if (cc?.success && cc.data?.length) { setCostCenters(cc.data); setCountedUp(false) }
      if (b?.success && b.data?.length) { setBudgets(b.data); setCountedUp(false) }
      if (fp?.success && fp.data?.length) setPeriods(fp.data)
      if (gl?.success && gl.data?.length) setGlAccounts(gl.data)
      if (dash?.success) setDashboard(dash.data)
    })
  }, [])

  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || 'demo-token-company_admin' : 'demo-token-company_admin'
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  }

  const runDepreciation = async () => {
    setDepLoading(true)
    try {
      const res = await fetch('/api/finance/assets/depreciate', { method: 'POST', headers: getHeaders() })
      const data = await res.json()
      setDepResult(data)
      fetch('/api/finance/assets', { headers: getHeaders() }).then(r => r.json()).then(d => { if (d.success) setAssets(d.data) })
    } finally { setDepLoading(false) }
  }

  const closePeriod = async (id: string) => {
    const res = await fetch(`/api/finance/fiscal-periods/${id}/close`, { method: 'POST', headers: getHeaders() })
    const data = await res.json()
    if (data.success) fetch('/api/finance/fiscal-periods', { headers: getHeaders() }).then(r => r.json()).then(d => { if (d.success) setPeriods(d.data) })
    else alert(data.error)
  }

  const SBadge = ({ v, map }: { v: string; map: Record<string, string> }) => (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${map[v] || 'bg-gray-100 text-gray-600'}`}>{v}</span>
  )
  const statusMap: Record<string, string> = { Active: 'bg-green-100 text-green-800', Closed: 'bg-gray-100 text-gray-600', Open: 'bg-blue-100 text-blue-800', Draft: 'bg-yellow-100 text-yellow-800', 'Fully Depreciated': 'bg-gray-100 text-gray-500' }

  // Tier 2 Modules for Finance Domain
  const tier2Modules: Tier2Module[] = [
    {
      id: 'general-ledger',
      label: 'General Ledger',
      icon: '',
      description: 'Chart of accounts, invoices, journal entries — all live from backend',
      component: (
        <div className="p-6">
          <GLOverviewContent persona={persona} locale={locale} />
        </div>
      ),
      tier3Screens: [
        {
          id: 'gl-overview',
          label: 'GL Overview',
          icon: '',
          component: <GLOverviewContent persona={persona} locale={locale} />
        }
      ]
    },
    {
      id: 'accounts-receivable',
      label: 'Accounts Receivable',
      icon: '',
      description: 'Track customer invoices, record payments, monitor collections',
      component: <ARContent />,
      tier3Screens: [
        {
          id: 'ar-overview',
          label: 'AR Overview',
          icon: '',
          component: <ARContent />
        }
      ]
    },
    {
      id: 'accounts-payable',
      label: 'Accounts Payable',
      icon: '',
      description: 'Manage supplier invoices, purchase orders, and vendor balances',
      component: <APContent />,
      tier3Screens: [
        {
          id: 'ap-overview',
          label: 'AP Overview',
          icon: '',
          component: <APContent />
        }
      ]
    },
    {
      id: 'cash-bank',
      label: 'Cash & Bank',
      icon: '',
      description: 'Bank balances, currency conversion, FX exposure, treasury management',
      component: <CashBankContent />,
      tier3Screens: [
        {
          id: 'cash-overview',
          label: 'Cash Overview',
          icon: '',
          component: <CashBankContent />
        }
      ]
    },
    {
      id: 'payments',
      label: 'Payment Engine',
      icon: '',
      description: 'Payment processing, verification, and reconciliation',
      tier3Screens: [
        {
          id: 'verification-queue',
          label: 'Verification Queue',
          icon: '',
          component: (
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 text-harvics-burgundy">Payment Verification Queue</h3>
                <p className="text-[#8E8E93]">Review and verify payments requiring manual verification</p>
              </div>
              <a
                href={`/${locale}/os/finance/payments/verification-queue`}
                className="inline-block px-6 py-3 font-semibold text-white transition-colors"
                style={{ background: 'var(--harvics-burgundy)', borderRadius: 0 }}
              >
                Open Verification Queue →
              </a>
            </div>
          )
        },
        {
          id: 'reconciliation',
          label: 'Reconciliation',
          icon: '',
          component: (
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 text-harvics-burgundy">Payment Reconciliation</h3>
                <p className="text-[#8E8E93]">Advanced payment reconciliation and bank deposit matching</p>
              </div>
              <a
                href={`/${locale}/os/finance/payments/reconciliation`}
                className="inline-block px-6 py-3 font-semibold text-white transition-colors"
                style={{ background: 'var(--harvics-burgundy)', borderRadius: 0 }}
              >
                Open Reconciliation Dashboard →
              </a>
            </div>
          )
        }
      ]
    },
    {
      id: 'pricing',
      label: 'AI Pricing Engine',
      icon: '',
      description: 'Dynamic pricing, promotions, and discount management'
    },
    {
      id: 'costing',
      label: 'Costing Engine',
      icon: '',
      description: 'SKU costing, container costing, and margin analysis'
    },
    {
      id: 'multi-currency-trade',
      label: 'Multi-Currency Trade',
      icon: '',
      description: 'Cross-border trade financing, FX hedging, and multi-currency settlements',
      tier3Screens: [
        {
          id: 'fx-exposure',
          label: 'FX Exposure',
          icon: '',
          component: (
            <div className="p-6 space-y-6">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">FX Exposure Dashboard</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[{ currency: 'EUR/USD', exposure: '$2.4M', risk: 'Low' }, { currency: 'GBP/USD', exposure: '$1.8M', risk: 'Medium' }, { currency: 'PKR/USD', exposure: '$850K', risk: 'High' }, { currency: 'AED/USD', exposure: '$3.2M', risk: 'Low' }].map(e => (
                  <div key={e.currency} className="border border-[#E5E5EA]/30 p-4" style={{ borderRadius: 0 }}>
                    <div className="text-sm font-mono text-[#8E8E93]">{e.currency}</div>
                    <div className="text-xl font-semibold text-[#1A1A1A]">{e.exposure}</div>
                    <span className={`px-2 py-1 text-xs font-bold ${e.risk === 'Low' ? 'bg-[#F5F5F7] text-[#1A1A1A]' : e.risk === 'Medium' ? 'bg-[#F5F5F7] text-[#1A1A1A]' : 'bg-[#F5F5F7] text-[#1A1A1A]'}`} style={{ borderRadius: 0 }}>{e.risk} Risk</span>
                  </div>
                ))}
              </div>
            </div>
          )
        },
        {
          id: 'trade-settlements',
          label: 'Trade Settlements',
          icon: '',
          component: (
            <div className="p-6">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Cross-Border Trade Settlements</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]"><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Settlement ID</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">From</th><th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">To</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Amount</th><th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">FX Rate</th><th className="px-5 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th></tr></thead>
                  <tbody>
                    {[{ id: 'SET-001', from: 'USD', to: 'EUR', amount: 125000, rate: 0.92, status: 'Completed' }, { id: 'SET-002', from: 'USD', to: 'PKR', amount: 85000, rate: 277.80, status: 'Pending' }, { id: 'SET-003', from: 'GBP', to: 'AED', amount: 200000, rate: 4.70, status: 'Processing' }].map((s, i) => (
                      <tr key={s.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{s.id}</td>
                        <td className="px-4 py-3">{s.from}</td>
                        <td className="px-4 py-3">{s.to}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#1A1A1A]">${s.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">{s.rate}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-1 text-xs font-bold ${s.status === 'Completed' ? 'bg-[#F5F5F7] text-[#1A1A1A]' : s.status === 'Pending' ? 'bg-[#F5F5F7] text-[#1A1A1A]' : 'bg-[#F5F5F7] text-[#1A1A1A]'}`} style={{ borderRadius: 0 }}>{s.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }
      ]
    },
    // ── FIXED ASSETS ──────────────────────────────────────────────────
    {
      id: 'fixed-assets',
      label: 'Fixed Assets',
      icon: '',
      description: 'Asset register, depreciation schedules, book values — all industries',
      tier3Screens: [
        {
          id: 'asset-register',
          label: 'Asset Register',
          icon: '',
          component: (() => {
            const totalCost = assets.reduce((s, a) => s + (a.purchaseCost || 0), 0)
            const totalBook = assets.reduce((s, a) => s + (a.bookValue || 0), 0)
            const totalDep  = assets.reduce((s, a) => s + (a.accumulatedDepreciation || 0), 0)
            const health = totalCost > 0 ? Math.round((totalBook / totalCost) * 100) : 0
            const r = 52, circ = 2 * Math.PI * r
            const svgOffset = animated ? circ * (1 - health / 100) : circ
            return (
              <div className="bg-white">
                {/* ── HEADER BANNER — Harvics burgundy ── */}
                <div className="px-8 py-7" style={{ background: 'var(--harvics-burgundy)' }}>
                  <div className="flex items-start justify-between gap-8">
                    <div className="flex-1">
                      <div className="text-[10px] font-black text-white/50 tracking-[0.2em] mb-2 uppercase">Asset Portfolio · FY 2026</div>
                      <div className="text-5xl font-black text-white leading-none mb-1 tabular-nums">${(totalBook/1000000).toFixed(2)}M</div>
                      <div className="text-sm text-white/60 mb-5">Net Book Value — All Verticals</div>
                      <div className="flex items-center gap-6">
                        {[
                          { l: 'GROSS COST',    v: `$${(totalCost/1000000).toFixed(2)}M`, c: 'text-white/80' },
                          { l: 'WRITTEN DOWN',  v: `$${(totalDep/1000).toFixed(0)}K`,      c: 'text-harvics-gold' },
                          { l: 'TOTAL ITEMS',   v: `${assets.length} assets`,              c: 'text-white' },
                        ].map(s => (
                          <div key={s.l} className="border-l-2 border-white/20 pl-4">
                            <div className="text-[9px] font-black tracking-widest text-white/40 mb-0.5">{s.l}</div>
                            <div className={`text-xl font-black ${s.c}`}>{s.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* SVG Donut */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <svg width="130" height="130" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10"/>
                        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--harvics-gold)" strokeWidth="10"
                          strokeDasharray={String(circ)} strokeDashoffset={String(svgOffset)}
                          strokeLinecap="butt" transform="rotate(-90 60 60)"
                          style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1)' }}/>
                        <text x="60" y="56" textAnchor="middle" fill="white" fontSize="22" fontWeight="900">{health}%</text>
                        <text x="60" y="71" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="8" fontWeight="700" letterSpacing="2">RETAINED</text>
                      </svg>
                      <div className="text-[9px] text-white/40 tracking-widest font-bold">PORTFOLIO HEALTH</div>
                    </div>
                  </div>
                  <div className="mt-5 pt-4 border-t border-white/20 flex items-center gap-4">
                    <button onClick={runDepreciation} disabled={depLoading}
                      className="px-6 py-2.5 text-sm font-black tracking-wide transition-colors disabled:opacity-40"
                      style={{ background: 'var(--harvics-gold)', color: '#1A1A1A' }}>
                      {depLoading ? '⏳ RUNNING…' : '▶  RUN MONTHLY DEPRECIATION'}
                    </button>
                    {depResult && <span className="text-sm text-harvics-gold font-bold">✓ {depResult.data?.length} assets updated</span>}
                  </div>
                </div>
                {/* ── ASSET TABLE — white background ── */}
                <div className="bg-[#FAFAF8]">
                  <div className="grid px-6 py-3 border-b border-[#E5E5EA]" style={{ gridTemplateColumns: '1fr 80px 80px 90px 160px 110px' }}>
                    {['ASSET', 'COST', "DEP'D", 'BOOK VALUE', 'LIFE REMAINING', 'METHOD'].map(h => (
                      <div key={h} className="text-[9px] font-black tracking-[0.15em] text-[#8E8E93]">{h}</div>
                    ))}
                  </div>
                  {assets.map(a => {
                    const depPctA = a.purchaseCost > 0 ? (a.accumulatedDepreciation / a.purchaseCost) * 100 : 0
                    const rem = Math.max(0, 100 - depPctA)
                    const barCol = rem > 60 ? 'var(--harvics-burgundy)' : rem > 30 ? 'var(--harvics-gold)' : '#ef4444'
                    return (
                      <div key={a.id || a.assetCode}
                        className="grid px-6 py-4 border-b border-[#E5E5EA] items-center gap-2 hover:bg-white transition-colors"
                        style={{ gridTemplateColumns: '1fr 80px 80px 90px 160px 110px' }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-[3px] h-10 flex-shrink-0" style={{ background: 'var(--harvics-burgundy)' }}></div>
                          <div className="min-w-0">
                            <div className="text-[#1A1A1A] font-semibold text-sm truncate">{a.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-mono text-[#8E8E93]">{a.assetCode}</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-harvics-burgundy/10 text-harvics-burgundy">{a.category}</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#F5F5F7] text-[#8E8E93]">{a.industryVertical}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-[#8E8E93] tabular-nums">${(a.purchaseCost/1000).toFixed(0)}K</div>
                        <div className="text-sm text-amber-600 font-semibold tabular-nums">${(a.accumulatedDepreciation/1000).toFixed(0)}K</div>
                        <div className="text-sm font-black text-harvics-burgundy tabular-nums">${(a.bookValue/1000).toFixed(0)}K</div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 h-2 bg-[#F5F5F7] overflow-hidden">
                              <div className="h-full transition-all duration-1000 ease-out" style={{ width: animated ? `${rem}%` : '0%', background: barCol }}></div>
                            </div>
                            <span className="text-[11px] font-bold tabular-nums w-8 text-right text-[#1A1A1A]">{Math.round(rem)}%</span>
                          </div>
                          <div className="text-[9px] text-[#8E8E93]">{a.usefulLifeYears}yr · {a.location}</div>
                        </div>
                        <div className="text-[10px] text-[#8E8E93]">{a.depreciationMethod}</div>
                      </div>
                    )
                  })}
                </div>
                <ActivityStrip />
              </div>
            )
          })()
        }
      ]
    },
    // ── COST CENTERS ──────────────────────────────────────────────────
    {
      id: 'cost-centers',
      label: 'Cost Centers',
      icon: '',
      description: 'Budget vs actual per department, industry vertical, and period',
      tier3Screens: [
        {
          id: 'cc-overview',
          label: 'Cost Center Overview',
          icon: '',
          component: (() => {
            const src = (displayCC.length ? displayCC : costCenters)
            const totalBudget = src.reduce((s, c) => s + (c.budget || 0), 0)
            const totalActual = src.reduce((s, c) => s + (c.actualSpend || 0), 0)
            const totalVariance = totalBudget - totalActual
            const overBudget = src.filter(c => c.actualSpend > c.budget).length
            const atRisk = src.filter(c => { const u = c.actualSpend/c.budget; return u >= 0.85 && u < 1 }).length
            return (
              <div className="bg-white">
                {/* ── KPI HEADER ── */}
                <div className="px-6 pt-6 pb-4" style={{ background: 'var(--harvics-burgundy)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[10px] font-black text-white/50 tracking-[0.2em] uppercase mb-1">Cost Center Performance · YTD 2026</div>
                      <div className="text-4xl font-black text-white tabular-nums">{fmtK(totalActual)}</div>
                      <div className="text-sm text-white/60">spent of {fmtK(totalBudget)} approved</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5">
                        <LiveClock />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right border-r border-white/20 pr-4">
                          <div className="text-[10px] text-white/40 uppercase tracking-widest">Remaining</div>
                          <div className="text-xl font-black text-emerald-300 tabular-nums">{fmtK(Math.max(0,totalVariance))}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-white/40 uppercase tracking-widest">At Risk</div>
                          <div className={`text-xl font-black tabular-nums ${overBudget > 0 ? 'text-red-300' : 'text-amber-300'}`}>{atRisk+overBudget} depts</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Overall utilisation bar */}
                  <div>
                    <div className="flex justify-between text-[10px] text-white/40 mb-1.5">
                      <span>Portfolio utilisation</span>
                      <span className="font-black text-white/70">{Math.round(totalActual/totalBudget*100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10">
                      <div className="h-2 bg-harvics-gold transition-all duration-1000 ease-out" style={{ width: animated ? `${Math.min(totalActual/totalBudget*100,100)}%` : '0%' }}></div>
                    </div>
                  </div>
                </div>
                {/* ── COST CENTER ROWS ── */}
                <div className="divide-y divide-[#E5E5EA]">
                  {src.map(cc => {
                    const util = cc.budget > 0 ? (cc.actualSpend / cc.budget) * 100 : 0
                    const variance = cc.budget - cc.actualSpend
                    const isOver = util > 100
                    const isRisk = util >= 85 && util <= 100
                    const isFlashing = !!flashMap[cc.code]
                    const barColor = isOver ? '#ef4444' : isRisk ? '#f59e0b' : 'var(--harvics-burgundy)'
                    const spark = sparkHistory[cc.code] || []
                    const typeColor: Record<string, string> = { Revenue: 'bg-emerald-100 text-emerald-700', Manufacturing: 'bg-blue-100 text-blue-700', Operations: 'bg-purple-100 text-purple-700', Overhead: 'bg-gray-100 text-gray-600', Sales: 'bg-orange-100 text-orange-700' }
                    return (
                      <div key={cc.id || cc.code}
                        className={`px-6 py-4 transition-colors duration-150 ${
                          isFlashing && flashMap[cc.code]==='up' ? 'bg-emerald-50/60 border-l-4 border-l-emerald-500' :
                          isFlashing && flashMap[cc.code]==='down' ? 'bg-red-50/50 border-l-4 border-l-red-400' :
                          isOver ? 'bg-red-50/40 border-l-4 border-l-red-400' :
                          isRisk ? 'bg-amber-50/30 border-l-4 border-l-amber-400' :
                          'bg-white border-l-4 border-l-transparent'
                        }`}>
                        <div className="flex items-center justify-between gap-4">
                          {/* LEFT: name + meta */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="font-mono text-xs font-black text-harvics-burgundy bg-harvics-burgundy/10 px-2 py-1 flex-shrink-0">{cc.code}</span>
                            <div className="min-w-0">
                              <div className="font-semibold text-[#1A1A1A] text-sm flex items-center gap-2">
                                <span className="truncate">{cc.name}</span>
                                {isFlashing && <span className={`text-[10px] font-black flex-shrink-0 ${flashMap[cc.code]==='up'?'text-emerald-600':'text-red-600'}`}>{flashMap[cc.code]==='up'?'▲':'▼'}</span>}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${typeColor[cc.type] || 'bg-gray-100 text-gray-600'}`}>{cc.type}</span>
                                <span className="text-[10px] text-[#8E8E93] truncate">{cc.manager}</span>
                              </div>
                            </div>
                          </div>
                          {/* MIDDLE: 3 figures */}
                          <div className="flex items-center gap-6 flex-shrink-0">
                            <div className="text-right">
                              <div className="text-[9px] text-[#8E8E93] uppercase tracking-wider">Budget</div>
                              <div className="text-sm font-bold text-[#1A1A1A] tabular-nums">{fmtK(cc.budget)}</div>
                            </div>
                            <div className={`text-right px-1.5 py-0.5 rounded ${flashMap[cc.code]==='up'?'hv-flash-up':flashMap[cc.code]==='down'?'hv-flash-down':''}`}>
                              <div className="text-[9px] text-[#8E8E93] uppercase tracking-wider">Actual</div>
                              <div className={`text-sm font-black tabular-nums ${isOver?'text-red-600':'text-harvics-burgundy'}`}>{fmtK(cc.actualSpend)}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[9px] text-[#8E8E93] uppercase tracking-wider">Variance</div>
                              <div className={`text-sm font-bold tabular-nums transition-all duration-300 ${variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{variance>=0?'+':''}{fmtK(Math.abs(variance))}</div>
                            </div>
                          </div>
                          {/* RIGHT: sparkline + flash % */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <Spark data={spark} />
                            <div className={`text-right w-14 px-1.5 py-0.5 rounded ${flashMap[cc.code]==='up'?'hv-flash-up':flashMap[cc.code]==='down'?'hv-flash-down':''}`}>
                              <div className={`text-xl font-black tabular-nums ${isOver?'text-red-600':isRisk?'text-amber-600':'text-harvics-burgundy'}`}>{Math.round(util)}%</div>
                              {isOver&&<div className="text-[9px] font-black text-red-600">▲ OVER</div>}
                              {isRisk&&!isOver&&<div className="text-[9px] font-black text-amber-600">⚠ RISK</div>}
                            </div>
                          </div>
                        </div>
                        {/* Bar — fast transition so movement is visible */}
                        <div className="mt-2">
                          <div className="w-full bg-[#F5F5F7] h-2.5 overflow-hidden">
                            <div className="h-2.5 transition-all duration-300 ease-out" style={{ width: `${Math.min(util,100)}%`, background: barColor }}></div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <ActivityStrip />
              </div>
            )
          })()
        }
      ]
    },
    // ── BUDGET ────────────────────────────────────────────────────────
    {
      id: 'budgeting',
      label: 'Budgeting',
      icon: '',
      description: 'Operating and capital budgets with variance analysis',
      tier3Screens: [
        {
          id: 'budget-overview',
          label: 'Budget Overview',
          icon: '',
          component: (() => {
            const src = displayBudgets.length ? displayBudgets : budgets
            const totalApproved = budgets.reduce((s, b) => s + (b.totalBudget || 0), 0)
            const totalSpent = src.reduce((s, b) => s + (b.totalActual || 0), 0)
            const activeBudgets = budgets.filter(b => b.status === 'Active')
            return (
              <div className="bg-white">
                {/* HEADER */}
                <div className="px-8 py-7" style={{ background: 'var(--harvics-burgundy)' }}>
                  <div className="text-[10px] font-black text-white/50 tracking-[0.2em] uppercase mb-1">Budget Control Centre · FY 2026</div>
                  <div className="flex items-end justify-between gap-4 flex-wrap">
                    <div>
                      <div className="text-5xl font-black text-white tabular-nums transition-all duration-500">{fmtK(totalSpent)}</div>
                      <div className="text-sm text-white/60 mt-1">spent YTD of {fmtK(totalApproved)} approved</div>
                    </div>
                    <div className="flex items-center gap-5 pb-1 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-[9px] text-white/40 tracking-widest uppercase">Remaining</div>
                        <div className="text-xl font-black text-emerald-300 tabular-nums">{fmtK(Math.max(0,totalApproved-totalSpent))}</div>
                      </div>
                      <div className="w-px h-8 bg-white/20"></div>
                      <div className="text-right">
                        <div className="text-[9px] text-white/40 tracking-widest uppercase">Active</div>
                        <div className="text-xl font-black text-harvics-gold">{activeBudgets.length} budgets</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5">
                    <div className="flex justify-between text-[10px] text-white/40 mb-1.5">
                      <span>Overall utilisation</span>
                      <span className="font-black text-white/70">{Math.round(totalSpent/totalApproved*100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10">
                      <div className="h-2 bg-harvics-gold transition-all duration-1000 ease-out" style={{ width: animated ? `${Math.min(totalSpent/totalApproved*100,100)}%` : '0%' }}></div>
                    </div>
                  </div>
                </div>
                {/* BUDGET CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-x divide-y divide-[#E5E5EA]">
                  {src.map(b => {
                    const util = b.totalBudget > 0 ? (b.totalActual / b.totalBudget) * 100 : 0
                    const remaining = b.totalBudget - b.totalActual
                    const segments = 16
                    const filled = animated ? Math.round((util/100)*segments) : 0
                    const barC = util > 90 ? '#ef4444' : util > 70 ? '#f59e0b' : 'var(--harvics-burgundy)'
                    const statusColors: Record<string,string> = { Closed: 'bg-gray-100 text-gray-600', Active: 'bg-emerald-100 text-emerald-700', Draft: 'bg-amber-100 text-amber-700' }
                    return (
                      <div key={b.id || b.budgetCode} className="p-6 bg-white">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-bold text-[#1A1A1A] text-sm leading-tight">{b.name}</div>
                            <div className="text-[10px] text-[#8E8E93] mt-0.5">{b.budgetCode} · {b.approvedBy}</div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${statusColors[b.status]||'bg-gray-100 text-gray-600'}`}>{b.status}</span>
                        </div>
                        {/* Segmented bar — segments light up in real time */}
                        <div className="flex gap-0.5 mb-4">
                          {Array.from({length:segments}).map((_,i) => (
                            <div key={i} className="h-5 flex-1 transition-all duration-200" style={{ background: i < filled ? barC : '#F5F5F7' }}></div>
                          ))}
                        </div>
                        <div className="flex items-end justify-between">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5" style={{ background: barC }}></div>
                              <span className="text-xs text-[#8E8E93]">Spent</span>
                              <span className={`text-xs font-black tabular-nums px-1 rounded ${flashMap[`bud-${b.id||b.budgetCode}`]==='up'?'hv-flash-up':''}`}>{fmtK(b.totalActual)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 bg-[#F5F5F7] border border-[#E5E5EA]"></div>
                              <span className="text-xs text-[#8E8E93]">Left</span>
                              <span className={`text-xs font-black tabular-nums ${remaining>=0?'text-emerald-600':'text-red-600'}`}>{fmtK(Math.abs(remaining))}</span>
                            </div>
                          </div>
                          <div className={`text-right px-2 py-1 rounded ${flashMap[`bud-${b.id||b.budgetCode}`]==='up'?'hv-flash-up':''}`}>
                            <div className="text-5xl font-black tabular-nums leading-none" style={{ color: barC }}>{Math.round(util)}%</div>
                            <div className="text-[10px] text-[#8E8E93]">of {fmtK(b.totalBudget)}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <ActivityStrip />
              </div>
            )
          })()
        }
      ]
    },
    // ── PERIOD CLOSE ──────────────────────────────────────────────────
    {
      id: 'period-close',
      label: 'Period Close',
      icon: '',
      description: 'Fiscal period management, open/close controls, trial balance check',
      tier3Screens: [
        {
          id: 'fiscal-periods',
          label: 'Fiscal Periods',
          icon: '',
          component: (() => {
            const closedP = periods.filter(p => p.status === 'Closed')
            const openP = periods.filter(p => p.status === 'Open')
            return (
              <div className="bg-white">
                {/* HEADER */}
                <div className="px-8 py-7" style={{ background: 'var(--harvics-burgundy)' }}>
                  <div className="text-[10px] font-black text-white/50 tracking-[0.2em] uppercase mb-2">Period Close Control · FY 2026</div>
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      {periods.map(p => (
                        <div key={p.id||p.periodCode} className="flex flex-col items-center gap-2">
                          <div className={`w-10 h-10 flex items-center justify-center text-lg font-black ${
                            p.status==='Closed' ? 'bg-emerald-400 text-white' : p.balanced ? 'bg-amber-400 text-white' : 'bg-red-400 text-white'
                          }`}>{p.status==='Closed'?'✓':p.balanced?'~':'!'}</div>
                          <div className="text-[10px] text-white/70 font-bold">{p.name.split(' ')[0]}</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span></span>
                        <span className="text-xs font-black text-white/70 font-mono">{clockStr}</span>
                      </div>
                      <div className="text-[10px] text-white/40">{closedP.length} closed · {openP.length} open</div>
                    </div>
                  </div>
                </div>
                {/* PERIOD CARDS */}
                <div className="divide-y divide-[#E5E5EA]">
                  {periods.map(p => {
                    const diff = Math.abs(p.totalDebits - p.totalCredits)
                    const isClosed = p.status === 'Closed'
                    const liveJournals = !isClosed ? journalTick : p.journalCount
                    return (
                      <div key={p.id || p.periodCode} className={`p-6 ${
                        isClosed ? 'bg-white' : p.balanced ? 'bg-blue-50/40' : 'bg-amber-50/40'
                      }`}>
                        <div className="flex items-start justify-between mb-5">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 flex items-center justify-center text-2xl font-black flex-shrink-0 ${
                              isClosed ? 'bg-emerald-100 text-emerald-700' : p.balanced ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                            }`}>{isClosed?'✓':p.balanced?'◎':'!'}</div>
                            <div>
                              <div className="font-black text-[#1A1A1A] text-xl">{p.name}</div>
                              <div className="text-xs text-[#8E8E93]">{p.periodCode}</div>
                              {isClosed && <div className="text-xs text-emerald-600 font-semibold mt-0.5">Closed by {p.closedBy} · {p.closedAt?.slice(0,10)}</div>}
                            </div>
                          </div>
                          <span className={`text-sm font-black px-4 py-2 ${
                            isClosed ? 'bg-emerald-100 text-emerald-700' : p.balanced ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                          }`}>{p.status}</span>
                        </div>
                        {/* Metric grid */}
                        <div className="grid grid-cols-5 gap-3 mb-5">
                          {[
                            { label: 'Journal Entries', value: liveJournals?.toLocaleString(), live: !isClosed },
                            { label: 'Invoices',        value: p.invoiceCount?.toLocaleString(), live: false },
                            { label: 'Total Debits',    value: `$${(p.totalDebits/1000000).toFixed(2)}M`, live: false },
                            { label: 'Total Credits',   value: `$${(p.totalCredits/1000000).toFixed(2)}M`, live: false },
                            { label: 'Difference',      value: diff===0?'$0.00 ✓':`$${diff.toLocaleString()} ✗`, live: false },
                          ].map(s => (
                            <div key={s.label} className="bg-[#FAFAF8] border border-[#E5E5EA] p-3">
                              <div className="flex items-center gap-1 mb-1">
                                <div className="text-[9px] text-[#8E8E93] uppercase tracking-wider">{s.label}</div>
                                {s.live && <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400"></span></span>}
                              </div>
                              <div className={`font-black text-base tabular-nums ${
                                s.label==='Difference'&&diff!==0?'text-red-600':s.label==='Difference'?'text-emerald-600':'text-[#1A1A1A]'
                              }`}>{s.value}</div>
                            </div>
                          ))}
                        </div>
                        {!isClosed && (
                          <div className="flex items-center justify-between">
                            <div className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold ${
                              !p.balanced ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              <span>{!p.balanced?'⚠':'✓'}</span>
                              <span>{!p.balanced ? `Debits and credits differ by $${diff.toLocaleString()} — post correcting journal first` : 'Trial balance balanced — ready to close'}</span>
                            </div>
                            <button onClick={()=>closePeriod(p.id)} disabled={!p.balanced}
                              className="ml-4 px-6 py-3 text-sm font-black text-white bg-harvics-burgundy hover:bg-[#8B2F3B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap">
                              Close {p.name} →
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <ActivityStrip />
              </div>
            )
          })()
        },
        {
          id: 'chart-of-accounts',
          label: 'Chart of Accounts',
          icon: '',
          component: (() => {
            const byType = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']
            const typeColor: Record<string,string> = { Asset: 'bg-blue-100 text-blue-700', Liability: 'bg-red-100 text-red-700', Equity: 'bg-purple-100 text-purple-700', Revenue: 'bg-emerald-100 text-emerald-700', Expense: 'bg-amber-100 text-amber-700' }
            const typeBg: Record<string,string> = { Asset: 'bg-blue-50', Liability: 'bg-red-50', Equity: 'bg-purple-50', Revenue: 'bg-emerald-50', Expense: 'bg-amber-50' }
            return (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-[#1A1A1A]">Chart of Accounts</h3>
                  <p className="text-sm text-[#8E8E93] mt-0.5">{glAccounts.length} accounts · USD reporting currency</p>
                </div>
                {/* Type summary */}
                <div className="grid grid-cols-5 gap-3">
                  {byType.map(t => {
                    const accs = glAccounts.filter(g => g.type === t)
                    const total = accs.reduce((s, g) => s + (g.balance || 0), 0)
                    return (
                      <div key={t} className={`${typeBg[t]} border border-white p-4 text-center`}>
                        <div className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-2 ${typeColor[t]}`}>{t}</div>
                        <div className="text-lg font-black text-[#1A1A1A]">${(total/1000000).toFixed(1)}M</div>
                        <div className="text-xs text-[#8E8E93]">{accs.length} accounts</div>
                      </div>
                    )
                  })}
                </div>
                {/* Accounts by group */}
                {byType.map(t => {
                  const accs = glAccounts.filter(g => g.type === t)
                  if (!accs.length) return null
                  return (
                    <div key={t}>
                      <div className={`flex items-center gap-2 mb-2`}>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${typeColor[t]}`}>{t}</span>
                        <div className="flex-1 h-px bg-[#E5E5EA]"></div>
                      </div>
                      <div className="space-y-1">
                        {accs.map(gl => (
                          <div key={gl.id || gl.accountCode} className="flex items-center justify-between bg-white border border-[#E5E5EA] px-4 py-3 hover:bg-[#FAFAF8] transition-colors">
                            <div className="flex items-center gap-4">
                              <span className="font-mono text-sm font-bold text-harvics-burgundy w-12">{gl.accountCode}</span>
                              <span className="font-medium text-[#1A1A1A]">{gl.name}</span>
                              <span className="text-xs text-[#8E8E93]">{gl.normalBalance}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-[#1A1A1A]">${(gl.balance||0).toLocaleString()}</span>
                              <div className="w-24 bg-[#F5F5F7] h-1.5 rounded-full overflow-hidden">
                                <div className={`h-1.5 rounded-full ${typeColor[t].split(' ')[0].replace('bg-', 'bg-').replace('-100', '-500')}`}
                                  style={{ width: `${Math.min((gl.balance / Math.max(...glAccounts.filter(g=>g.type===t).map(g=>g.balance||0))) * 100, 100)}%` }}></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()
        }
      ]
    }
  ]

  tier2Modules.unshift({
    id: 'finance-analytics',
    label: 'Analytics Dashboard',
    icon: '',
    description: 'Finance analytics — cash flow, budget variance, AR/AP trends, department spending',
    component: <FinanceAnalyticsCharts />,
    tier3Screens: [{ id: 'finance-charts', label: 'Finance Charts', icon: '', component: <FinanceAnalyticsCharts /> }]
  })

  return (
    <OSDomainTierStructure
      domainId="finance"
      domainName="Finance OS"
      tier2Modules={tier2Modules}
      defaultModule="finance-analytics"
    />
  )
}

