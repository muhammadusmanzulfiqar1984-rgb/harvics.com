'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { getDistributorDashboardViewModel } from '@/apps/crm/crm.controller'
import { DashboardCard } from './DashboardCard'
import TerritoryHierarchyNavigator from '@/features/geo/TerritoryHierarchyNavigator'
import { AutomationLevelDashboard } from '@/components/shared/AutomationLevelDashboard'
import { Territory, TerritoryPath, TerritoryHierarchy } from '@/services/territoryService'
import { formatCurrency } from '@/lib/formatting'
import { getCurrency } from '@/config/localeConfig'

interface DistributorDashboardState {
  ordersToday: number
  pendingDeliveries: number
  retailers: number
  attendance: number
  lowStockSkus: number
  outstandingInvoices: number
  creditLimit: number
  complaints: number
  currency: string
}

interface AIAutomationStatus {
  autoApprovalEnabled: boolean
  stockReplenishmentEnabled: boolean
  invoiceRemindersEnabled: boolean
  aiRecommendations: {
    suggestedOrder: number
    riskLevel: 'low' | 'medium' | 'high'
    nextAction: string
  }
}

const initialState: DistributorDashboardState = {
  ordersToday: 0,
  pendingDeliveries: 0,
  retailers: 0,
  attendance: 0,
  lowStockSkus: 0,
  outstandingInvoices: 0,
  creditLimit: 0,
  complaints: 0,
  currency: '',
}

export const DistributorDashboard = () => {
  const t = useTranslations('distributorPortal.dashboard')
  const locale = useLocale()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DistributorDashboardState>(initialState)
  const [aiAutomation, setAiAutomation] = useState<AIAutomationStatus>({
    autoApprovalEnabled: true,
    stockReplenishmentEnabled: true,
    invoiceRemindersEnabled: true,
    aiRecommendations: {
      suggestedOrder: 0,
      riskLevel: 'low',
      nextAction: ''
    }
  })
  const [territoryHierarchy, setTerritoryHierarchy] = useState<TerritoryPath | null>(null)
  const [showTerritoryNavigator, setShowTerritoryNavigator] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        // VERTICAL INTEGRATION: UI → API → Business Logic → Database
        const viewModel = await getDistributorDashboardViewModel()
        setData(viewModel)

        // HORIZONTAL INTEGRATION: AI Service calls other services at same level
        // Simulate AI automation status (in real app, this would call AI service)
        const aiStatus = await fetchAIAutomationStatus(locale)
        setAiAutomation(aiStatus)
      } catch (error) {
        console.error('Failed to load distributor dashboard', error)
        setData(initialState)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [locale])

  // Update AI automation based on territory hierarchy
  const updateAIAutomationForTerritory = async (hierarchy: TerritoryPath) => {
    // AI considers territory context for decisions
    const territoryContext = {
      country: hierarchy.country?.code,
      city: hierarchy.city?.name,
      district: hierarchy.district?.name,
      location: hierarchy.location?.name
    }

    // Fetch AI recommendations based on territory
    try {
      const response = await fetch('/api/ai/territory-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ territoryContext, locale })
      })
      if (response.ok) {
        const recommendations = await response.json()
        setAiAutomation(prev => ({
          ...prev,
          aiRecommendations: {
            ...prev.aiRecommendations,
            ...recommendations
          }
        }))
      }
    } catch (error) {
      console.error('Error fetching territory-based AI recommendations:', error)
    }
  }

  // Simulate AI automation status fetch (LOCALIZED)
  const fetchAIAutomationStatus = async (locale: string): Promise<AIAutomationStatus> => {
    // In real implementation, this would call:
    // GET /api/ai/automation-status?locale=${currentLocale}
    
    // Localized AI recommendations based on locale
    const localizedActions: Record<string, string> = {
      'en': 'Review pending deliveries and trigger auto-replenishment',
      'ar': 'مراجعة التسليمات المعلقة وتفعيل إعادة التعبئة التلقائية',
      'fr': 'Examiner les livraisons en attente et déclencher le réapprovisionnement automatique'
    }

    return {
      autoApprovalEnabled: true,
      stockReplenishmentEnabled: true,
      invoiceRemindersEnabled: true,
      aiRecommendations: {
        suggestedOrder: data.lowStockSkus > 0 ? Math.ceil(data.lowStockSkus * 1.2) : 0,
        riskLevel: data.outstandingInvoices > data.creditLimit * 0.8 ? 'high' : 
                   data.outstandingInvoices > data.creditLimit * 0.5 ? 'medium' : 'low',
        nextAction: localizedActions[locale] || localizedActions['en']
      }
    }
  }

  if (loading) {
    return (
      <div className="bg-white text-center py-20 rounded-lg border border-black100">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-harvics-burgundy border-t-transparent mx-auto mb-4"></div>
        <p className="text-black/60 text-sm">Loading distributor cockpit…</p>
      </div>
    )
  }

  // GLOBALIZATION: Format currency based on locale configuration
  const formatLocaleCurrency = (value: number) => {
    const currency = data.currency || getCurrency(locale)
    return formatCurrency(value, locale, currency)
  }

  // AI AUTOMATION: Get risk color based on AI analysis
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200'
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    }
  }

  return (
    <div className="space-y-8">
      {/* Automation Level Dashboard */}
      <div>
        <h2 className="text-xs uppercase tracking-wider text-black/50 mb-4 font-medium">
          {t('automation.title')}
        </h2>
        <AutomationLevelDashboard />
      </div>

      {/* Territory Hierarchy Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs uppercase tracking-wider text-black/50 font-medium">
            {t('territory.title')}
          </h2>
          <button
            onClick={() => setShowTerritoryNavigator(!showTerritoryNavigator)}
            className="text-xs text-black/60 hover:text-black transition-colors"
          >
            {showTerritoryNavigator ? 'Hide' : 'Show'} Navigator
          </button>
        </div>
        {showTerritoryNavigator && (
          <div className="bg-white rounded-lg border border-black200 p-4 mb-6">
            <TerritoryHierarchyNavigator
              onTerritorySelect={(territory, hierarchy) => {
                setTerritoryHierarchy(hierarchy)
                // AI automation adapts to territory
                updateAIAutomationForTerritory(hierarchy)
              }}
            />
          </div>
        )}
        {territoryHierarchy && territoryHierarchy.fullPath && (
          <div className="bg-gradient-to-r from-harvics-burgundy/5 to-harvics-burgundy/10 rounded-lg p-4 mb-6 border border-harvics-gold/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🌍</span>
              <span className="text-sm font-semibold text-black">
                {t('territory.currentTerritory')}
              </span>
            </div>
            <div className="text-sm text-black/70">
              {territoryHierarchy.fullPath}
            </div>
          </div>
        )}
      </div>

      {/* AI Automation Status Banner - Shows Horizontal Integration */}
      <div className="bg-gradient-to-r from-harvics-burgundy to-harvics-burgundy rounded-lg p-4 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ffffff]/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-[#ffffff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider">AI Automation Active</h3>
              <p className="text-xs text-harvics-gold/80 mt-1">
                {t('aiAutomation.status')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${aiAutomation.autoApprovalEnabled ? 'bg-emerald-400' : 'bg-gray-400'}`}></div>
              <span>{t('aiAutomation.autoApproval')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${aiAutomation.stockReplenishmentEnabled ? 'bg-emerald-400' : 'bg-gray-400'}`}></div>
              <span>{t('aiAutomation.stockReplenishment')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${aiAutomation.invoiceRemindersEnabled ? 'bg-emerald-400' : 'bg-gray-400'}`}></div>
              <span>{t('aiAutomation.invoiceReminders')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Metrics - Top Row */}
      <div>
        <h2 className="text-xs uppercase tracking-wider text-black/50 mb-4 font-medium">
          {t('kpi.title')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard 
            title={t('kpi.ordersToday')} 
            value={data.ordersToday} 
            subtitle={t('kpi.ordersTodaySubtitle')} 
          />
          <DashboardCard 
            title={t('kpi.pendingDeliveries')} 
            value={data.pendingDeliveries} 
            subtitle={t('kpi.pendingDeliveriesSubtitle')} 
          />
          <DashboardCard 
            title={t('kpi.retailers')} 
            value={data.retailers} 
            subtitle={t('kpi.retailersSubtitle')} 
          />
          <DashboardCard 
            title={t('kpi.attendance')} 
            value={`${data.attendance}%`} 
            subtitle={t('kpi.attendanceSubtitle')} 
            accent="green" 
          />
        </div>
      </div>

      {/* Financial & Inventory Metrics */}
      <div>
        <h2 className="text-xs uppercase tracking-wider text-black/50 mb-4 font-medium">
          {t('financial.title')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardCard
            title={t('financial.lowStock')}
            value={data.lowStockSkus}
            subtitle={t('financial.lowStockSubtitle')}
            accent="red"
          />
          <DashboardCard
            title={t('financial.outstandingInvoices')}
            value={formatLocaleCurrency(data.outstandingInvoices)}
            subtitle={t('financial.outstandingInvoicesSubtitle')}
            accent="red"
          />
          <DashboardCard
            title={t('financial.creditLimit')}
            value={formatLocaleCurrency(data.creditLimit)}
            subtitle={t('financial.creditLimitSubtitle')}
            accent="gold"
          />
        </div>
      </div>

      {/* AI Recommendations Section - Shows Vertical Integration */}
      <div>
        <h2 className="text-xs uppercase tracking-wider text-black/50 mb-4 font-medium">
          {t('aiRecommendations.title')}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`bg-white rounded-lg border-2 p-5 ${getRiskColor(aiAutomation.aiRecommendations.riskLevel)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-medium">
                {t('aiRecommendations.riskLevel')}
              </span>
              <span className="text-lg font-bold capitalize">{aiAutomation.aiRecommendations.riskLevel}</span>
            </div>
            <p className="text-xs opacity-70">
              {t('aiRecommendations.riskDescription')}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-[#C3A35E]/30 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-black/60 font-medium">
                {t('aiRecommendations.suggestedOrder')}
              </span>
              <span className="text-2xl font-bold text-[#6B1F2B]">{aiAutomation.aiRecommendations.suggestedOrder}</span>
            </div>
            <p className="text-xs text-black/60">
              {t('aiRecommendations.suggestedOrderSubtitle')}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-black200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-harvics-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs uppercase tracking-wider text-black/60 font-medium">
                {t('aiRecommendations.nextAction')}
              </span>
            </div>
            <p className="text-sm text-black/80 mt-2 leading-relaxed">
              {aiAutomation.aiRecommendations.nextAction}
            </p>
          </div>
        </div>
      </div>

      {/* Actions & Playbook */}
      <div>
        <h2 className="text-xs uppercase tracking-wider text-black/50 mb-4 font-medium">
          {t('actions.title')}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DashboardCard
            title={t('actions.complaints')}
            value={data.complaints}
            subtitle={t('actions.complaintsSubtitle')}
            accent="red"
          />
          <div className="bg-white rounded-lg border border-[#C3A35E]/30 shadow-sm hover:shadow-md transition-all duration-300 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-[#C3A35E] rounded-full"></div>
              <h3 className="text-sm font-semibold text-black uppercase tracking-wider">
                {t('actions.playbook')}
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-black/70 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#C3A35E] mt-1">•</span>
                <span>{t('actions.playbookItem1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C3A35E] mt-1">•</span>
                <span>{t('actions.playbookItem2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C3A35E] mt-1">•</span>
                <span>{t('actions.playbookItem3')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

