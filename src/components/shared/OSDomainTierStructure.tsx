'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useLocale } from 'next-intl'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import TierBreadcrumb from '@/components/shared/TierBreadcrumb'

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

      {/* Header — quiet actions */}
      <div className="flex items-center justify-between px-1 py-2 mb-2">
        <button
          title="Ask Harvoice"
          onClick={() => setHarvoiceOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E8E0D4] bg-white text-[#3D1212] hover:border-harvics-burgundy/40 transition-colors"
        >
          <span className="text-sm">🎙</span>
          <span className="text-[11px] font-semibold tracking-wide uppercase hidden sm:inline">Harvoice</span>
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold tracking-wide uppercase bg-harvics-burgundy text-white hover:bg-[#2a0808] transition-colors"
        >
          <span>+</span>
          <span>New {currentModule?.label?.replace(/s$/, '') || domainName.replace(/s$/, '')}</span>
        </button>
      </div>

      {/* Module tabs — cream bar, burgundy active underline */}
      <div className="mb-1 border-b border-[#E8E0D4] bg-[#FFFEF9]">
        <div className="flex items-center gap-0 overflow-x-auto">
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
                className={`relative px-4 py-3 text-sm whitespace-nowrap cursor-pointer transition-colors -mb-px border-b-2 ${
                  isActive
                    ? 'border-harvics-burgundy text-harvics-burgundy font-semibold'
                    : 'border-transparent text-[#6B5E52] hover:text-[#3D1212]'
                }`}
              >
                {module.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Screen sub-tabs */}
      {currentModule?.tier3Screens && currentModule.tier3Screens.length > 0 && (
        <div className="mb-4 flex items-center gap-2 pt-3 flex-wrap">
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
                className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-harvics-burgundy text-white'
                    : 'bg-white border border-[#E8E0D4] text-[#4A3728] hover:border-harvics-burgundy/40'
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
        <div className="mb-4 flex items-center gap-2 flex-wrap">
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
                className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-harvics-burgundy text-white'
                    : 'bg-white border border-[#E8E0D4] text-[#4A3728] hover:border-harvics-burgundy/40'
                }`}
              >
                {action.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Content only — no fake AI alert sidebar */}
      <div className="rounded-xl overflow-hidden border border-[#E8E0D4] bg-white min-h-[400px]">
        {activeScreen && currentScreen && (
          <div>
            {currentScreen.component}
            {activeAction && currentScreen.tier4Actions?.find(a => a.id === activeAction) && (
              <div className="mx-6 mb-6 p-3 bg-[#F7F3EC] rounded-lg flex items-center gap-2">
                <span className="text-emerald-600 text-sm">✓</span>
                <p className="text-sm text-[#1A1A1A]">
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
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-1">{currentModule.label}</h3>
                <p className="text-sm text-[#8E8E93]">{currentModule.description}</p>
              </div>
            )}
            {currentModule?.component ? currentModule.component : children}
          </>
        )}
      </div>

      {/* ── HARVOICE CHAT MODAL ── */}
      {harvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setHarvoiceOpen(false)} />
          <div className="relative w-96 max-w-full flex flex-col rounded-2xl overflow-hidden shadow-2xl" style={{ height: 520, background: '#1a0810', border: '1.5px solid #C3A35E', zIndex: 51 }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #3D1212 0%, #8B2535 100%)', borderBottom: '1px solid rgba(195, 163, 94,0.4)' }}>
              <span className="text-xl">🎙</span>
              <div className="flex-1">
                <div className="text-[10px] font-black text-harvics-gold tracking-[0.2em] uppercase">Harvoice AI</div>
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
                    m.role === 'user' ? 'bg-harvics-burgundy text-white rounded-br-sm' : 'text-white/90 rounded-bl-sm'
                  }`} style={m.role === 'ai' ? { background: 'rgba(195, 163, 94,0.10)', border: '1px solid rgba(195, 163, 94,0.22)' } : {}}>
                    {m.role === 'ai' && <span className="text-harvics-gold font-black text-[9px] block mb-1 tracking-wider">HARVOICE</span>}
                    {m.text}
                  </div>
                </div>
              ))}
              {harvoiceTyping && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-xl rounded-bl-sm" style={{ background: 'rgba(195, 163, 94,0.10)', border: '1px solid rgba(195, 163, 94,0.22)' }}>
                    <span className="flex gap-1">{[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-harvics-gold animate-bounce" style={{ animationDelay: `${i*0.15}s` }}></span>)}</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            {/* Input */}
            <div className="flex-shrink-0 px-3 py-3" style={{ borderTop: '1px solid rgba(195, 163, 94,0.2)' }}>
              <div className="flex gap-2">
                <input
                  value={harvoiceInput}
                  onChange={e => setHarvoiceInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendHarvoiceMessage()}
                  placeholder={`Ask about ${domainName}…`}
                  className="flex-1 bg-white/10 text-white text-sm px-4 py-2.5 rounded-xl outline-none placeholder-white/30 border border-white/10 focus:border-harvics-gold/60"
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

