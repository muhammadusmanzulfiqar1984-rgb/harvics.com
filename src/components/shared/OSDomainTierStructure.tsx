'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useLocale } from 'next-intl'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import TierBreadcrumb from '@/components/shared/TierBreadcrumb'
import { getTierColors, type TierLevel } from '@/config/tier-colors'

// ── AI ALERTS PANEL DATA ─────────────────────────────────────────────
const AI_ALERTS: Record<string, { icon: string; title: string; body: string; urgency: 'high'|'medium'|'low' }[]> = {
  finance: [
    { icon: '⚠', title: 'Budget Overrun Risk', body: 'CC-004 at 94% — projects breach in 4 days at current burn rate.', urgency: 'high' },
    { icon: '↑', title: 'AR Collection Lag', body: 'DSO climbing to 34 days. 3 invoices overdue >30d totalling $218K.', urgency: 'high' },
    { icon: '◈', title: 'FX Exposure', body: 'GBP/USD moved +1.2% today. Arabica export invoice unhedged ($384K).', urgency: 'medium' },
    { icon: '✓', title: 'Period Close Ready', body: 'March trial balance balanced. Recommend closing before Q2 opens.', urgency: 'low' },
    { icon: '↓', title: 'Margin Compression', body: 'Q2 operating margin projected 19.1% vs 21.8% target. Review pricing.', urgency: 'medium' },
  ],
  crm: [
    { icon: '⚠', title: 'Deal at Risk', body: 'Tesco UK deal ($2.1M) silent for 18 days. Recommend immediate follow-up.', urgency: 'high' },
    { icon: '↑', title: 'Pipeline Velocity', body: 'FMCG pipeline moved 23% faster this week. 4 deals near close.', urgency: 'low' },
    { icon: '◈', title: 'Contact Decay', body: '47 contacts not touched in >60 days. Schedule re-engagement.', urgency: 'medium' },
    { icon: '✓', title: 'IFE Follow-ups', body: '12 IFE leads queued. Best window: next 48hrs while event is fresh.', urgency: 'high' },
    { icon: '↓', title: 'Conversion Rate', body: 'Textile vertical conversion 8.2% vs 14% benchmark. Review pitch.', urgency: 'medium' },
  ],
  'orders-sales': [
    { icon: '⚠', title: 'Delayed Shipment', body: 'ORD-4821 Rotterdam: customs hold day 3. Buyer notified?', urgency: 'high' },
    { icon: '↑', title: 'Order Surge', body: 'FMCG orders up 34% week-on-week. Capacity check recommended.', urgency: 'medium' },
    { icon: '◈', title: 'Payment Pending', body: '2 orders delivered, payment not confirmed >5 days. Chase now.', urgency: 'high' },
    { icon: '✓', title: 'On-Time Rate', body: 'OTD this week: 94.2%. Above 90% SLA target.', urgency: 'low' },
    { icon: '↓', title: 'Return Request', body: 'UK buyer requesting partial return on WW batch. Review before approving.', urgency: 'medium' },
  ],
  inventory: [
    { icon: '⚠', title: 'Stock-out Risk', body: 'Arabica Grade A: 12 days remaining at current velocity. Reorder now.', urgency: 'high' },
    { icon: '↑', title: 'Slow Movers', body: '3 SKUs >90 days no movement. Consider markdown or reallocation.', urgency: 'medium' },
    { icon: '◈', title: 'Reorder Point Hit', body: 'Workwear batch WW-2026-047 below ROP. Lead time 21 days.', urgency: 'high' },
    { icon: '✓', title: 'Warehouse Utilisation', body: 'DXB warehouse at 71% capacity. Optimal range maintained.', urgency: 'low' },
    { icon: '↓', title: 'Shrinkage Alert', body: 'Cold chain variance +2.1% vs baseline. Inspect LHR unit B.', urgency: 'medium' },
  ],
  logistics: [
    { icon: '⚠', title: 'Customs Hold', body: 'ORD-4821 Rotterdam: day 3 customs hold. Escalate to broker.', urgency: 'high' },
    { icon: '↑', title: 'Route Optimisation', body: 'KHI-DXB lane 14% over cost target. Alternate carrier available.', urgency: 'medium' },
    { icon: '◈', title: 'Fleet Maintenance', body: '2 Isuzu units due for service within 500km. Schedule now.', urgency: 'medium' },
    { icon: '✓', title: 'On-Time Delivery', body: 'OTD this week 94.2%. Above 90% SLA. Cold chain intact.', urgency: 'low' },
    { icon: '↓', title: 'Fuel Surcharge', body: 'MENA fuel index +3.1% this week. Review freight pricing.', urgency: 'medium' },
  ],
  hr: [
    { icon: '⚠', title: 'Visa Expiry', body: '3 employees: UAE visa expires within 30 days. Renew urgently.', urgency: 'high' },
    { icon: '↑', title: 'Headcount Gap', body: 'Sales team 2 FTE below plan. Open reqs stalled at final round.', urgency: 'medium' },
    { icon: '◈', title: 'Payroll Deadline', body: 'March payroll run due in 2 days. 4 timesheets still pending.', urgency: 'high' },
    { icon: '✓', title: 'Training Compliance', body: '96% of staff completed mandatory compliance modules. Good.', urgency: 'low' },
    { icon: '↓', title: 'Attrition Risk', body: '2 high-performers flagged by AI sentiment analysis. Review.', urgency: 'medium' },
  ],
  legal: [
    { icon: '⚠', title: 'Contract Expiry', body: 'Tesco distribution agreement expires in 18 days. Auto-renewal off.', urgency: 'high' },
    { icon: '↑', title: 'NDA Pipeline', body: '4 NDAs awaiting counterparty signature >7 days. Follow up.', urgency: 'medium' },
    { icon: '◈', title: 'Regulatory Filing', body: 'RERA Q1 filing due April 15. Document pack 60% complete.', urgency: 'high' },
    { icon: '✓', title: 'Compliance Score', body: 'All active contracts within jurisdiction compliance. Clean.', urgency: 'low' },
    { icon: '↓', title: 'Dispute Alert', body: 'KHI supplier disputing deduction clause. Legal review needed.', urgency: 'medium' },
  ],
  executive: [
    { icon: '⚠', title: 'Revenue vs Target', body: 'Q1 revenue $12.4M vs $14.2M target. Gap: 12.7%. Review FMCG.', urgency: 'high' },
    { icon: '↑', title: 'Margin Opportunity', body: 'Arabica premium grade: margin 38%. Scale this SKU immediately.', urgency: 'medium' },
    { icon: '◈', title: 'Cash Conversion', body: 'Cash cycle 47 days vs 35-day target. AR collection lagging.', urgency: 'high' },
    { icon: '✓', title: 'Market Expansion', body: 'UK textile pipeline +$2.1M added this quarter. On track.', urgency: 'low' },
    { icon: '↓', title: 'OpEx Overrun', body: 'G&A costs 8% above plan. Review non-essential spend.', urgency: 'medium' },
  ],
  geo: [
    { icon: '⚠', title: 'Territory Gap', body: 'North England: 0 active accounts. High FMCG density zone.', urgency: 'high' },
    { icon: '↑', title: 'UAE Coverage', body: 'Dubai coverage 84%. Abu Dhabi expansion opportunity identified.', urgency: 'medium' },
    { icon: '◈', title: 'Rep Assignment', body: '3 high-value territories unassigned since Feb. Assign now.', urgency: 'high' },
    { icon: '✓', title: 'Pakistan Coverage', body: 'KHI + LHR + ISB all covered. Route density optimal.', urgency: 'low' },
    { icon: '↓', title: 'Market Penetration', body: 'Rotterdam FMCG: 12% penetration vs 30% target for Q2.', urgency: 'medium' },
  ],
  'gps-tracking': [
    { icon: '⚠', title: 'Vehicle Offline', body: 'VEH-047 (Isuzu KHI) no signal 4h. Check driver/device.', urgency: 'high' },
    { icon: '↑', title: 'Route Deviation', body: 'DXB-AUH run: driver deviated +22km from optimal route today.', urgency: 'medium' },
    { icon: '◈', title: 'Geofence Breach', body: 'Cold storage unit B left approved zone 09:14. Review.', urgency: 'high' },
    { icon: '✓', title: 'Fleet Online', body: '12/14 vehicles active and transmitting. Normal operations.', urgency: 'low' },
    { icon: '↓', title: 'Speed Alert', body: '2 incidents >120km/h on M25 route this week. Driver brief.', urgency: 'medium' },
  ],
  'import-export': [
    { icon: '⚠', title: 'Customs Delay', body: 'Arabica shipment SHP-2026-081: Rotterdam hold day 3. Broker escalated.', urgency: 'high' },
    { icon: '↑', title: 'HS Code Update', body: 'UK post-Brexit HS codes updated April 1. Review 6 affected SKUs.', urgency: 'medium' },
    { icon: '◈', title: 'LC Expiry', body: 'Letter of Credit LC-2026-019 expires in 8 days. Extend or draw.', urgency: 'high' },
    { icon: '✓', title: 'Clearance Rate', body: '94% shipments cleared within SLA this month. Good.', urgency: 'low' },
    { icon: '↓', title: 'Tariff Change', body: 'EU textile tariff review May 2026. Potential +4% impact on WW.', urgency: 'medium' },
  ],
  'investor-relations': [
    { icon: '⚠', title: 'Board Pack Due', body: 'Q1 2026 board pack due April 10. Financials pack 40% complete.', urgency: 'high' },
    { icon: '↑', title: 'Investor Query', body: '2 institutional queries re: Arabica expansion unanswered >3 days.', urgency: 'medium' },
    { icon: '◈', title: 'Cap Table Update', body: 'New convertible note issued. Cap table needs updating.', urgency: 'high' },
    { icon: '✓', title: 'Disclosure Compliance', body: 'All Q4 disclosures filed. Regulatory calendar up to date.', urgency: 'low' },
    { icon: '↓', title: 'Valuation Metric', body: 'Revenue multiple compressed 14% vs sector peers. Narrative review.', urgency: 'medium' },
  ],
  'market-distribution': [
    { icon: '⚠', title: 'Channel Conflict', body: 'DXB distributor and direct sales overlap on 3 SKUs. Resolve.', urgency: 'high' },
    { icon: '↑', title: 'New Channel', body: 'Online B2B marketplace pilot — 18 orders in week 1. Scale?', urgency: 'medium' },
    { icon: '◈', title: 'Distributor Margin', body: 'LHR distributor requesting +2% margin. Counter-offer prepared?', urgency: 'medium' },
    { icon: '✓', title: 'Coverage Growth', body: 'Active distribution points up 23% YTD. On track for 500 target.', urgency: 'low' },
    { icon: '↓', title: 'Returns Rate', body: 'FMCG returns 4.2% — above 3% acceptable threshold. Investigate.', urgency: 'high' },
  ],
  competitor: [
    { icon: '⚠', title: 'Price Undercut', body: 'Competitor X dropped Arabica price 8% in DXB market yesterday.', urgency: 'high' },
    { icon: '↑', title: 'Market Share', body: 'Harvics FMCG share in KHI up 2.1% this quarter vs last.', urgency: 'low' },
    { icon: '◈', title: 'New Entrant', body: 'Turkish workwear brand entered UK market with aggressive pricing.', urgency: 'high' },
    { icon: '✓', title: 'Product Advantage', body: 'Arabica Grade A quality score 94 vs competitor avg 81.', urgency: 'low' },
    { icon: '↓', title: 'Win Rate', body: 'Head-to-head win rate vs Comp B: 54%. Down from 61% last quarter.', urgency: 'medium' },
  ],
  'competitor-intel': [
    { icon: '⚠', title: 'Price Movement', body: 'Competitor X Arabica -8% DXB. Recommend price match within 48h.', urgency: 'high' },
    { icon: '↑', title: 'Intel Signal', body: '3 new signals collected this week. 1 requires immediate action.', urgency: 'medium' },
    { icon: '◈', title: 'Web Monitor', body: 'Competitor Y updated product catalog — 4 new SKUs detected.', urgency: 'medium' },
    { icon: '✓', title: 'Coverage', body: '12 competitors actively monitored. All signals current.', urgency: 'low' },
    { icon: '↓', title: 'Share Loss Risk', body: 'Rotterdam: 2 clients showing competitor engagement signals.', urgency: 'high' },
  ],
  satellite: [
    { icon: '⚠', title: 'Imagery Alert', body: 'Mine site SIT-004: new excavation activity detected by AI scan.', urgency: 'high' },
    { icon: '↑', title: 'Crop Signal', body: 'Ethiopia Arabica region: vegetation index +12% vs last season.', urgency: 'medium' },
    { icon: '◈', title: 'Port Activity', body: 'Rotterdam port congestion up 18%. Plan for +3 day delays.', urgency: 'high' },
    { icon: '✓', title: 'Weather Clear', body: 'KHI-DXB corridor: clear 7-day forecast. Optimal shipping window.', urgency: 'low' },
    { icon: '↓', title: 'Climate Risk', body: 'East Africa: drought index elevated. Monitor Arabica supply risk.', urgency: 'medium' },
  ],
  identity: [
    { icon: '⚠', title: 'Failed Logins', body: '14 failed login attempts from unknown IP (185.x.x.x). Block?', urgency: 'high' },
    { icon: '↑', title: 'Active Sessions', body: '23 concurrent sessions. 2 from new devices pending MFA verify.', urgency: 'medium' },
    { icon: '◈', title: 'Permission Review', body: '6 users have roles not reviewed in >90 days. Audit required.', urgency: 'high' },
    { icon: '✓', title: 'MFA Adoption', body: '91% of active users have MFA enabled. 4 accounts pending.', urgency: 'low' },
    { icon: '↓', title: 'Token Expiry', body: '3 API tokens expire within 7 days. Rotate before expiry.', urgency: 'medium' },
  ],
  localization: [
    { icon: '⚠', title: 'Missing Strings', body: '47 untranslated strings in AR locale affecting OS screens.', urgency: 'high' },
    { icon: '↑', title: 'Coverage', body: 'EN/UR/AR coverage 94%. FR/ZH at 78%. Below 90% target.', urgency: 'medium' },
    { icon: '◈', title: 'RTL Layout', body: '3 OS screens have RTL alignment issues in AR mode.', urgency: 'medium' },
    { icon: '✓', title: 'EN Strings', body: 'English locale 100% complete. All keys resolved.', urgency: 'low' },
    { icon: '↓', title: 'Content Freeze', body: 'Translation freeze needed before next deploy. 2 PRs pending.', urgency: 'medium' },
  ],
  orders: [
    { icon: '⚠', title: 'Delayed Shipment', body: 'ORD-4821 Rotterdam: customs hold day 3. Buyer notified?', urgency: 'high' },
    { icon: '↑', title: 'Order Surge', body: 'FMCG orders up 34% week-on-week. Capacity check recommended.', urgency: 'medium' },
    { icon: '◈', title: 'Payment Pending', body: '2 orders delivered, payment not confirmed >5 days. Chase now.', urgency: 'high' },
    { icon: '✓', title: 'On-Time Rate', body: 'OTD this week: 94.2%. Above 90% SLA target. Good.', urgency: 'low' },
    { icon: '↓', title: 'Return Request', body: 'UK buyer requesting partial return on WW batch. Review before approving.', urgency: 'medium' },
  ],
  default: [
    { icon: '◈', title: 'System Status', body: 'All modules operational. Last sync: just now.', urgency: 'low' },
    { icon: '↑', title: 'Activity Spike', body: 'Unusual activity volume detected. Review audit log.', urgency: 'medium' },
    { icon: '✓', title: 'Governance', body: 'All recent transactions passed compliance checks.', urgency: 'low' },
    { icon: '⚠', title: 'Pending Actions', body: '3 items require your approval before end of day.', urgency: 'high' },
    { icon: '↓', title: 'Performance', body: 'Response time elevated. Check server load.', urgency: 'medium' },
  ],
}

export interface Tier2Module {
  id: string
  label: string
  icon: string
  description?: string
  tier3Screens?: Tier3Screen[]
  component?: React.ReactNode
}

export interface Tier3Screen {
  id: string
  label: string
  icon: string
  component: React.ReactNode
  tier4Actions?: Tier4Action[]
}

export interface Tier4Action {
  id: string
  label: string
  icon: string
  action: () => void
}

interface OSDomainTierStructureProps {
  domainId: string
  domainName: string
  tier2Modules: Tier2Module[]
  defaultModule?: string
  children?: React.ReactNode
}

export default function OSDomainTierStructure({
  domainId,
  domainName,
  tier2Modules,
  defaultModule,
  children
}: OSDomainTierStructureProps) {
  const locale = useLocale()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Read URL parameters for module and screen
  const moduleFromUrl = searchParams?.get('module')
  const screenFromUrl = searchParams?.get('screen')
  const actionFromUrl = searchParams?.get('action')

  // Initialize state from URL or defaults
  const [activeModule, setActiveModule] = useState<string>(() => {
    if (moduleFromUrl && tier2Modules.find(m => m.id === moduleFromUrl)) {
      return moduleFromUrl
    }
    return defaultModule || tier2Modules[0]?.id || ''
  })
  const [activeScreen, setActiveScreen] = useState<string>(screenFromUrl || '')
  const [activeAction, setActiveAction] = useState<string>(actionFromUrl || '')
  const [isInitialized, setIsInitialized] = useState(false)

  const updateURL = React.useCallback((module?: string, screen?: string, action?: string) => {
    const params = new URLSearchParams()
    
    const finalModule = module || activeModule
    const finalScreen = screen !== undefined ? screen : activeScreen
    const finalAction = action !== undefined ? action : activeAction
    
    if (finalModule) {
      params.set('module', finalModule)
    }
    if (finalScreen) {
      params.set('screen', finalScreen)
      if (finalAction) {
        params.set('action', finalAction)
      } else {
        params.delete('action')
      }
    } else {
      params.delete('screen')
      params.delete('action')
    }

    const queryString = params.toString()
    const newUrl = `${pathname}${queryString ? '?' + queryString : ''}`
    const currentUrl = `${pathname}${searchParams?.toString() ? '?' + searchParams.toString() : ''}`
    
    // Only update if URL actually changed
    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false })
    }
  }, [activeModule, activeScreen, activeAction, pathname, router, searchParams])

  // Sync state with URL parameters on mount and when URL changes externally
  useEffect(() => {
    if (!isInitialized) {
      // On initial load, handle automatic navigation to the first Tier 3 screen
      const initialModuleId = moduleFromUrl || defaultModule || tier2Modules[0]?.id
      let initialScreenId = screenFromUrl

      // If no screen is specified in the URL, default to the first one for the active module
      if (initialModuleId && !initialScreenId) {
        const foundModule = tier2Modules.find(m => m.id === initialModuleId)
        const firstScreenId = foundModule?.tier3Screens?.[0]?.id
        if (firstScreenId) {
          initialScreenId = firstScreenId
          // Update the URL to reflect this automatic navigation
          updateURL(initialModuleId, firstScreenId)
        }
      }

      // Sync state from URL (or the newly defaulted values)
      if (initialModuleId) {
        setActiveModule(initialModuleId)
      }
      if (initialScreenId) {
        setActiveScreen(initialScreenId)
      }
      if (actionFromUrl) {
        setActiveAction(actionFromUrl)
      }
      setIsInitialized(true)
    } else {
      // Handle external URL changes (e.g., browser back/forward, direct link)
      const moduleValid = moduleFromUrl && tier2Modules.find(m => m.id === moduleFromUrl)
      if (moduleValid && moduleFromUrl !== activeModule) {
        setActiveModule(moduleFromUrl)
        setActiveScreen(screenFromUrl || '')
        setActiveAction(actionFromUrl || '')
      } else if (screenFromUrl !== undefined && screenFromUrl !== activeScreen) {
        setActiveScreen(screenFromUrl || '')
        if (!screenFromUrl) {
          setActiveAction('')
        }
      } else if (actionFromUrl !== undefined && actionFromUrl !== activeAction) {
        setActiveAction(actionFromUrl || '')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleFromUrl, screenFromUrl, actionFromUrl, isInitialized, defaultModule, tier2Modules, updateURL])

  const currentModule = tier2Modules.find(m => m.id === activeModule)
  const currentScreen = currentModule?.tier3Screens?.find(s => s.id === activeScreen)

  // AI Alerts Panel state
  const alerts = AI_ALERTS[domainId] || AI_ALERTS.default
  const [aiPulse, setAiPulse] = useState(0)
  const [aiActive, setAiActive] = useState<number | null>(null)
  useEffect(() => {
    const t = setInterval(() => setAiPulse(p => p + 1), 4000)
    return () => clearInterval(t)
  }, [])
  const highlightIdx = aiPulse % alerts.length

  // Harvoice chat modal state
  const [harvoiceOpen, setHarvoiceOpen] = useState(false)
  const [harvoiceInput, setHarvoiceInput] = useState('')
  const [harvoiceMessages, setHarvoiceMessages] = useState<{role:'user'|'ai', text:string, ts:Date}[]>([
    { role:'ai', text:`Hello. I'm Harvoice, your ${domainName} intelligence assistant. Ask me anything about your data, alerts, or actions needed.`, ts: new Date() }
  ])
  const [harvoiceTyping, setHarvoiceTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const HARVOICE_RESPONSES: Record<string, string[]> = {
    finance: [
      'Based on current burn rates, CC-004 will breach budget in ~4 days. Recommend a spending freeze on non-critical items.',
      'Your DSO is 34 days vs 28-day target. I suggest prioritising the 3 overdue invoices totalling $218K.',
      'The Arabica export invoice ($384K) has unhedged GBP exposure. With GBP up 1.2% today, consider a forward contract.',
      'March period is balanced and ready to close. I can walk you through the close checklist if needed.',
    ],
    crm: [
      'The Tesco UK deal has been silent for 18 days. I recommend a direct call within 24 hours — deal is at high risk.',
      'Your FMCG pipeline velocity is 23% faster this week. 4 deals are near close stage — focus on those first.',
      'IFE London ended today. Your 12 leads should receive follow-ups within 48 hours while the event is fresh.',
      '47 contacts haven\'t been touched in 60+ days. I can generate a re-engagement sequence if you\'d like.',
    ],
    'orders-sales': [
      'ORD-4821 has been in Rotterdam customs for 3 days. I recommend escalating to your broker today.',
      '2 delivered orders have unconfirmed payments beyond 5 days. I can draft chase emails for both.',
      'Your OTD rate is 94.2% this week — above the 90% SLA. The team is performing well.',
      'FMCG orders surged 34% this week. I recommend a capacity check before accepting new commitments.',
    ],
    default: [
      'I\'m analysing your current module data. What specific insights do you need?',
      'I can help you review alerts, generate reports, or explain any metric on screen.',
      'Ask me about trends, anomalies, recommendations, or what action to take next.',
    ],
  }

  const sendHarvoiceMessage = () => {
    if (!harvoiceInput.trim()) return
    const userMsg = { role: 'user' as const, text: harvoiceInput.trim(), ts: new Date() }
    setHarvoiceMessages(prev => [...prev, userMsg])
    setHarvoiceInput('')
    setHarvoiceTyping(true)
    setTimeout(() => {
      const pool = HARVOICE_RESPONSES[domainId] || HARVOICE_RESPONSES.default
      const reply = pool[Math.floor(Math.random() * pool.length)]
      setHarvoiceMessages(prev => [...prev, { role: 'ai', text: reply, ts: new Date() }])
      setHarvoiceTyping(false)
    }, 900 + Math.random() * 600)
  }

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [harvoiceMessages, harvoiceTyping])

  const urgencyStyle: Record<string, string> = {
    high:   'border-l-red-500 bg-red-50/60',
    medium: 'border-l-amber-400 bg-amber-50/40',
    low:    'border-l-emerald-500 bg-emerald-50/40',
  }
  const urgencyDot: Record<string, string> = {
    high: 'bg-red-500', medium: 'bg-amber-400', low: 'bg-emerald-500',
  }

  const tier2Colors = getTierColors('2')
  const tier3Colors = getTierColors('3')
  const tier4Colors = getTierColors('4')

  const tier1Href = `/${locale}/os/${domainId}`;
  const tier2Href = activeModule ? `${tier1Href}?module=${activeModule}` : undefined;
  const tier3Href = activeScreen && tier2Href ? `${tier2Href}&screen=${activeScreen}` : undefined;

  return (
    <div className="w-full">
      {/* Tier Breadcrumb for Tier 2-4 */}
      <TierBreadcrumb
        tier0={{ label: 'Foundational Engines', href: `/${locale}/os/tier0` }}
        tier1={{ label: domainName, href: tier1Href }}
        tier2={activeModule ? { label: currentModule?.label || '', href: tier2Href } : undefined}
        tier3={activeScreen ? { label: currentScreen?.label || '', href: tier3Href } : undefined}
        tier4={activeAction ? { label: currentScreen?.tier4Actions?.find(a => a.id === activeAction)?.label || '', href: undefined } : undefined}
        currentTier={activeAction ? '4' : activeScreen ? '3' : activeModule ? '2' : '1'}
      />

      {/* ── BLUEPRINT: Header action bar — Harvoice mic + Gold pill primary action ── */}
      <div className="flex items-center justify-between px-1 py-2 mb-1">
        {/* Harvoice mic — always visible in every domain header */}
        <button
          title="Ask Harvoice AI"
          onClick={() => setHarvoiceOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #6B1F2B 0%, #8B2535 100%)', border: '1.5px solid #C3A35E', boxShadow: '0 2px 12px rgba(195,163,94,0.3)' }}
        >
          <span className="text-base">🎙</span>
          <span className="text-[11px] font-black text-[#C3A35E] tracking-wider uppercase hidden sm:inline">Harvoice</span>
        </button>

        {/* Gold pill primary action — context-aware per domain */}
        <button
          className="flex items-center gap-2 px-5 py-2 font-black text-[12px] tracking-wider uppercase transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-[0_4px_20px_rgba(195,163,94,0.5)]"
          style={{ background: 'linear-gradient(135deg, #C3A35E 0%, #E8C97A 50%, #C3A35E 100%)', borderRadius: 999, color: '#1a0810', boxShadow: '0 3px 16px rgba(195,163,94,0.4)', border: '1px solid rgba(255,255,255,0.3)' }}
        >
          <span className="text-sm font-black">+</span>
          <span>New {currentModule?.label?.replace(/s$/, '') || domainName.replace(/s$/, '')}</span>
        </button>
      </div>

      {/* Module Tabs — glassmorphic maroon with gold border */}
      <div className="mb-1 relative" style={{
        background: 'linear-gradient(135deg, #6B1F2B 0%, #8B2535 40%, #6B1F2B 100%)',
        borderBottom: '2px solid #C3A35E',
        boxShadow: '0 4px 24px rgba(107,31,43,0.25), inset 0 1px 0 rgba(255,255,255,0.15)'
      }}>
        {/* Glossy top sheen */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 50%, transparent 100%)'
        }} />
        <div className="flex items-center gap-0 overflow-x-auto relative z-10">
          {tier2Modules.map((module) => {
            const isActive = activeModule === module.id
            return (
              <button
                key={module.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  const newScreenId = module.tier3Screens?.[0]?.id ?? ''
                  setActiveModule(module.id)
                  setActiveScreen(newScreenId)
                  setActiveAction('')
                  updateURL(module.id, newScreenId, '')
                }}
                style={isActive ? {
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)',
                  borderBottom: '3px solid #C3A35E',
                  color: '#fff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 8px rgba(195,163,94,0.3)'
                } : {
                  borderBottom: '3px solid transparent',
                  color: 'rgba(255,255,255,0.7)',
                }}
                className={`relative px-5 py-3.5 text-sm font-semibold whitespace-nowrap cursor-pointer transition-all duration-200 -mb-0.5 backdrop-blur-sm ${
                  !isActive ? 'hover:bg-white/10 hover:text-white hover:border-b-[3px] hover:border-[#C3A35E]/60' : ''
                }`}
              >
                {module.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Screen sub-tabs — glossy glass pills with gold border */}
      {currentModule?.tier3Screens && currentModule.tier3Screens.length > 0 && (
        <div className="mb-5 flex items-center gap-2 pt-4 flex-wrap">
          {currentModule.tier3Screens.map((screen) => {
            const isActive = activeScreen === screen.id
            return (
              <button
                key={screen.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setActiveScreen(screen.id)
                  setActiveAction('')
                  updateURL(activeModule, screen.id, '')
                }}
                style={isActive ? {
                  background: 'linear-gradient(135deg, #6B1F2B 0%, #8B2535 100%)',
                  border: '1.5px solid #C3A35E',
                  color: '#fff',
                  boxShadow: '0 2px 12px rgba(107,31,43,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.4)'
                } : {
                  background: 'rgba(255,255,255,0.72)',
                  border: '1.5px solid rgba(195,163,94,0.4)',
                  color: '#4A3728',
                }}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full cursor-pointer transition-all duration-200 ${
                  !isActive ? 'hover:border-[#C3A35E] hover:text-[#6B1F2B] hover:shadow-[0_2px_8px_rgba(195,163,94,0.3)]' : ''
                }`}
              >
                {screen.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Actions row */}
      {activeScreen && currentScreen?.tier4Actions && currentScreen.tier4Actions.length > 0 && (
        <div className="mb-5 flex items-center gap-2">
          {currentScreen.tier4Actions.map((action) => {
            const isActive = activeAction === action.id
            return (
              <button
                key={action.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setActiveAction(action.id)
                  updateURL(activeModule, activeScreen, action.id)
                  action.action()
                }}
                style={isActive ? {
                  background: 'linear-gradient(135deg, #6B1F2B 0%, #8B2535 100%)',
                  border: '1px solid #C3A35E',
                  color: '#fff',
                  boxShadow: '0 2px 8px rgba(107,31,43,0.3)'
                } : {
                  background: 'rgba(255,255,255,0.72)',
                  border: '1px solid rgba(195,163,94,0.5)',
                  color: '#4A3728',
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-all duration-150 ${
                  !isActive ? 'hover:border-[#C3A35E] hover:text-[#6B1F2B]' : ''
                }`}
              >
                {action.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Main layout: content + 240px AI panel */}
      <div className="flex gap-4 items-start">

        {/* Content Area — glass card */}
        <div className="flex-1 min-w-0 rounded-2xl overflow-hidden" style={{
          background: 'rgba(255,255,255,0.75)',
          border: '1.5px solid rgba(195,163,94,0.5)',
          boxShadow: '0 8px 32px rgba(107,31,43,0.10), inset 0 1px 0 rgba(255,255,255,0.98), inset 0 -1px 0 rgba(195,163,94,0.12)',
          minHeight: '400px'
        }}>
          {activeScreen && currentScreen && (
            <div>
              {currentScreen.component}
              {activeAction && currentScreen.tier4Actions?.find(a => a.id === activeAction) && (
                <div className="mx-6 mb-6 p-3 bg-[#F0EAE1] rounded-xl flex items-center gap-2">
                  <span className="text-[#34C759] text-sm">✓</span>
                  <p className="text-sm text-[#1D1D1F]">
                    {currentScreen.tier4Actions.find(a => a.id === activeAction)?.label} — done
                  </p>
                </div>
              )}
            </div>
          )}

          {!activeScreen && (
            <>
              {currentModule?.description && (
                <div className="p-6 border-b border-[#EAE0D5]">
                  <h3 className="text-sm font-semibold text-[#1D1D1F] mb-1">{currentModule.label}</h3>
                  <p className="text-sm text-[#8E8E93]">{currentModule.description}</p>
                </div>
              )}
              {currentModule?.component ? currentModule.component : children}
            </>
          )}
        </div>

        {/* ── 240px AI ALERTS PANEL (Blueprint mandated) ── */}
        <div className="flex-shrink-0 w-60 rounded-2xl overflow-hidden sticky top-4" style={{
          background: 'rgba(59,130,246,0.06)',
          border: '1.5px solid rgba(59,130,246,0.18)',
          boxShadow: '0 4px 24px rgba(59,130,246,0.08)',
          minHeight: '400px',
        }}>
          {/* Panel header */}
          <div className="px-4 py-3 flex items-center gap-2.5" style={{
            background: 'linear-gradient(135deg, #6B1F2B 0%, #8B2535 100%)',
            borderBottom: '1px solid rgba(195,163,94,0.4)',
          }}>
            <span className="text-[#C3A35E] text-base">🎙</span>
            <div>
              <div className="text-[10px] font-black text-white/50 tracking-[0.2em] uppercase">Harvoice AI</div>
              <div className="text-[11px] font-bold text-white">Smart Alerts</div>
            </div>
            <span className="ml-auto relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          {/* Alert context label */}
          <div className="px-4 pt-3 pb-1">
            <div className="text-[9px] font-black text-blue-500/70 tracking-widest uppercase">{domainId.toUpperCase()} · {currentModule?.label || 'Overview'}</div>
          </div>

          {/* Alert cards */}
          <div className="px-3 pb-3 space-y-2">
            {alerts.map((alert, i) => (
              <div
                key={i}
                onClick={() => setAiActive(aiActive === i ? null : i)}
                className={`border-l-[3px] px-3 py-2.5 cursor-pointer transition-all duration-300 rounded-r-lg ${urgencyStyle[alert.urgency]} ${
                  highlightIdx === i ? 'ring-1 ring-blue-300/40' : ''
                } ${aiActive === i ? 'ring-1 ring-[#6B1F2B]/30' : ''}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{alert.icon}</span>
                  <span className="text-[10px] font-black text-[#1D1D1F] leading-tight">{alert.title}</span>
                  <span className={`ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0 ${urgencyDot[alert.urgency]}`}></span>
                </div>
                {(aiActive === i || highlightIdx === i) && (
                  <p className="text-[10px] text-[#4A4A4A] leading-relaxed mt-1">{alert.body}</p>
                )}
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="px-3 pb-4 mt-1">
            <button className="w-full py-2 text-[10px] font-black text-[#6B1F2B] border border-[#C3A35E]/50 rounded-lg hover:bg-[#6B1F2B] hover:text-white transition-all duration-200 tracking-wider uppercase">
              Ask Harvoice →
            </button>
          </div>
        </div>

      </div>

      {/* ── HARVOICE CHAT MODAL ── */}
      {harvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setHarvoiceOpen(false)} />
          <div className="relative w-96 max-w-full flex flex-col rounded-2xl overflow-hidden shadow-2xl" style={{ height: 520, background: '#1a0810', border: '1.5px solid #C3A35E', zIndex: 51 }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6B1F2B 0%, #8B2535 100%)', borderBottom: '1px solid rgba(195,163,94,0.4)' }}>
              <span className="text-xl">🎙</span>
              <div className="flex-1">
                <div className="text-[10px] font-black text-[#C3A35E] tracking-[0.2em] uppercase">Harvoice AI</div>
                <div className="text-sm font-bold text-white">{domainName} Assistant</div>
              </div>
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
              <button onClick={() => setHarvoiceOpen(false)} className="text-white/50 hover:text-white text-lg ml-2 leading-none">✕</button>
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarWidth: 'none' }}>
              {harvoiceMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[82%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    m.role === 'user' ? 'bg-[#6B1F2B] text-white rounded-br-sm' : 'text-white/90 rounded-bl-sm'
                  }`} style={m.role === 'ai' ? { background: 'rgba(195,163,94,0.10)', border: '1px solid rgba(195,163,94,0.22)' } : {}}>
                    {m.role === 'ai' && <span className="text-[#C3A35E] font-black text-[9px] block mb-1 tracking-wider">HARVOICE</span>}
                    {m.text}
                  </div>
                </div>
              ))}
              {harvoiceTyping && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-xl rounded-bl-sm" style={{ background: 'rgba(195,163,94,0.10)', border: '1px solid rgba(195,163,94,0.22)' }}>
                    <span className="flex gap-1">{[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#C3A35E] animate-bounce" style={{ animationDelay: `${i*0.15}s` }}></span>)}</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            {/* Input */}
            <div className="flex-shrink-0 px-3 py-3" style={{ borderTop: '1px solid rgba(195,163,94,0.2)' }}>
              <div className="flex gap-2">
                <input
                  value={harvoiceInput}
                  onChange={e => setHarvoiceInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendHarvoiceMessage()}
                  placeholder={`Ask about ${domainName}…`}
                  className="flex-1 bg-white/10 text-white text-sm px-4 py-2.5 rounded-xl outline-none placeholder-white/30 border border-white/10 focus:border-[#C3A35E]/60"
                />
                <button onClick={sendHarvoiceMessage} className="px-4 py-2.5 rounded-xl font-black text-sm transition-all hover:scale-105 active:scale-95" style={{ background: 'linear-gradient(135deg, #C3A35E, #E8C97A)', color: '#1a0810' }}>→</button>
              </div>
              <div className="text-[9px] text-white/25 text-center mt-2">AI responses are contextual suggestions, not financial advice.</div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

