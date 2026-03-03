'use client'

import React, { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import TierBreadcrumb from '@/components/shared/TierBreadcrumb'
import { getTierColors, type TierLevel } from '@/config/tier-colors'

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

  // Get tier colors
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

      {/* Tier 2 Module Tabs - GREEN */}
      <div className="mb-6" style={{ borderBottom: `2px solid ${tier2Colors.border}` }}>
        <div className="flex items-center gap-2 overflow-x-auto">
          <div 
            className="text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded"
            style={{ 
              backgroundColor: '#6B1F2B',
              color: '#C3A35E'
            }}
          >
            Tier 2: Modules
          </div>
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
                className="px-6 py-3 text-sm font-medium transition-all whitespace-nowrap cursor-pointer border-b-2"
                style={{
                  borderBottomColor: isActive ? '#C3A35E' : 'transparent',
                  backgroundColor: isActive ? '#6B1F2B' : 'transparent',
                  color: isActive ? '#C3A35E' : '#000000'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#6B1F2B'
                    e.currentTarget.style.backgroundColor = '#C3A35E20'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#000000'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <span className="mr-2">{module.icon}</span>
                {module.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tier 3 Screen Navigation - GOLD/YELLOW */}
      {currentModule?.tier3Screens && currentModule.tier3Screens.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <div 
              className="text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded"
              style={{ 
                backgroundColor: '#C3A35E',
                color: '#6B1F2B' 
              }}
            >
              Tier 3: KPI Screens
            </div>
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
                  className="px-4 py-2 text-xs font-medium transition-all whitespace-nowrap rounded-md cursor-pointer border"
                  style={{
                    backgroundColor: isActive ? '#6B1F2B' : '#ffffff',
                    color: isActive ? '#C3A35E' : '#000000',
                    borderColor: isActive ? '#6B1F2B' : '#e5e7eb'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#C3A35E20'
                      e.currentTarget.style.borderColor = '#6B1F2B'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#ffffff'
                      e.currentTarget.style.borderColor = '#e5e7eb'
                    }
                  }}
                >
                  <span className="mr-1">{screen.icon}</span>
                  {screen.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Tier 4 Actions Navigation - ORANGE */}
      {activeScreen && currentScreen?.tier4Actions && currentScreen.tier4Actions.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <div 
              className="text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded"
              style={{ 
                backgroundColor: '#C3A35E',
                color: '#6B1F2B' 
              }}
            >
              Tier 4: Actions
            </div>
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
                  className="px-4 py-2 text-xs font-medium transition-all whitespace-nowrap rounded-md cursor-pointer border"
                  style={{
                    backgroundColor: isActive ? '#6B1F2B' : '#ffffff',
                    color: isActive ? '#C3A35E' : '#000000',
                    borderColor: isActive ? '#6B1F2B' : '#e5e7eb'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#C3A35E20'
                      e.currentTarget.style.borderColor = '#6B1F2B'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#ffffff'
                      e.currentTarget.style.borderColor = '#e5e7eb'
                    }
                  }}
                >
                  <span className="mr-1">{action.icon}</span>
                  {action.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="border border-[#C3A35E]/30 rounded-lg p-6 bg-gray-50 min-h-[400px] shadow-sm">
        {/* Render Tier 3 screen if selected */}
        {activeScreen && currentScreen && (
          <div>
            {currentScreen.component}
            
            {/* Show Tier 4 action status if action is active */}
            {activeAction && currentScreen.tier4Actions?.find(a => a.id === activeAction) && (
              <div className="mt-4 p-4 bg-[#C3A35E]/10 border border-[#C3A35E] rounded-lg flex items-center gap-2">
                <span className="text-[#6B1F2B] font-bold">✓</span>
                <p className="text-sm font-medium text-[#6B1F2B]">
                  Action "{currentScreen.tier4Actions.find(a => a.id === activeAction)?.label}" executed
                </p>
              </div>
            )}
          </div>
        )}

        {/* Render default children if no Tier 3 screen selected */}
        {!activeScreen && (
          <>
            {currentModule?.description && (
              <div className="mb-6 p-4 bg-[#C3A35E]/10 border border-[#C3A35E]/20 rounded-lg">
                <h3 className="text-lg font-bold text-[#6B1F2B] mb-2 flex items-center gap-2">
                  <span>{currentModule.icon}</span> {currentModule.label}
                </h3>
                <p className="text-[#6B1F2B]/80">{currentModule.description}</p>
              </div>
            )}
            {currentModule?.component ? currentModule.component : children}
          </>
        )}
      </div>
    </div>
  )
}

