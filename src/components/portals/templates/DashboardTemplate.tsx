'use client'

import React from 'react'

interface KPICard {
  title: string
  value: string | number
  icon?: string
  color?: 'default' | 'green' | 'red' | 'yellow' | 'blue' | 'purple'
  subtitle?: string
}

interface DashboardTemplateProps {
  title: string
  subtitle?: string
  kpiCards: KPICard[]
  actions?: React.ReactNode
  charts?: React.ReactNode
  recentActivity?: React.ReactNode
  loading?: boolean
  error?: string | null
  onRetry?: () => void
}

const DashboardTemplate: React.FC<DashboardTemplateProps> = ({
  title,
  subtitle,
  kpiCards,
  actions,
  charts,
  recentActivity,
  loading = false,
  error = null,
  onRetry
}) => {
  const getColorClasses = (color: KPICard['color'] = 'default') => {
    switch (color) {
      case 'green':
        return 'text-green-600'
      case 'red':
        return 'text-red-600'
      case 'yellow':
        return 'text-white'
      case 'blue':
        return 'text-blue-600'
      case 'purple':
        return 'text-purple-600'
      default:
        return 'text-black'
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B1F2B]"></div>
        <p className="mt-4 text-black">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        <p className="mb-2">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">{title}</h1>
          {subtitle && <p className="text-black">{subtitle}</p>}
        </div>
        {actions && <div className="flex gap-3">{actions}</div>}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black">{card.title}</h3>
              {card.icon && <span className="text-2xl">{card.icon}</span>}
            </div>
            <div className={`text-3xl font-bold ${getColorClasses(card.color)}`}>
              {card.value}
            </div>
            {card.subtitle && (
              <p className="text-sm text-black mt-2">{card.subtitle}</p>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {charts}
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Recent Activity</h2>
          {recentActivity}
        </div>
      )}
    </div>
  )
}

export default DashboardTemplate

