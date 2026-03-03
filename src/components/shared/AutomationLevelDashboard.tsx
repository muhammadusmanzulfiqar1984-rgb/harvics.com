'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'

interface AutomationMetric {
  category: string
  current: number
  target: number
  gap: number
  status: 'excellent' | 'good' | 'needs-improvement'
}

export const AutomationLevelDashboard: React.FC = () => {
  const t = useTranslations('automation')
  const locale = useLocale()
  const [overallAutomation, setOverallAutomation] = useState(72)
  const [metrics, setMetrics] = useState<AutomationMetric[]>([
    { category: 'Order Processing', current: 85, target: 95, gap: 10, status: 'excellent' },
    { category: 'Inventory Management', current: 80, target: 95, gap: 15, status: 'good' },
    { category: 'Demand Forecasting', current: 90, target: 98, gap: 8, status: 'excellent' },
    { category: 'System Monitoring', current: 95, target: 99, gap: 4, status: 'excellent' },
    { category: 'Payment Processing', current: 85, target: 95, gap: 10, status: 'excellent' },
    { category: 'Pricing Optimization', current: 75, target: 90, gap: 15, status: 'good' },
    { category: 'Route Optimization', current: 70, target: 95, gap: 25, status: 'needs-improvement' },
    { category: 'Customer Support', current: 60, target: 80, gap: 20, status: 'needs-improvement' }
  ])

  const worldClassTarget = 95
  const gapToWorldClass = worldClassTarget - overallAutomation

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'needs-improvement': return 'text-amber-600 bg-amber-50 border-amber-200'
      default: return 'text-black bg-white border-black200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return '✅'
      case 'good': return '⚠️'
      case 'needs-improvement': return '🔧'
      default: return '📊'
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall Automation Score */}
      <div className="bg-gradient-to-br from-[#6B1F2B] to-[#6B1F2B] rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Overall Automation Level</h2>
            <p className="text-[#C3A35E]/80 text-sm">How human-less we've become</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{overallAutomation}%</div>
            <div className="text-sm text-[#C3A35E]/80 mt-1">Automated</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Current: {overallAutomation}%</span>
            <span>World-Class: {worldClassTarget}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#ffffff] to-[#ffffff] h-full rounded-full transition-all duration-1000"
              style={{ width: `${overallAutomation}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-xs mt-2 text-[#C3A35E]/80">
            <span>0%</span>
            <span className="font-semibold">Gap: {gapToWorldClass}% to world-class</span>
            <span>100%</span>
          </div>
        </div>

        {/* Comparison */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#C3A35E]/20">
          <div className="text-center">
            <div className="text-xs text-[#C3A35E]/80 mb-1">Average Company</div>
            <div className="text-lg font-semibold">45%</div>
            <div className="text-xs text-emerald-300 mt-1">+{overallAutomation - 45}% better</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-[#C3A35E]/80 mb-1">Good Company</div>
            <div className="text-lg font-semibold">65%</div>
            <div className="text-xs text-emerald-300 mt-1">+{overallAutomation - 65}% better</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-[#C3A35E]/80 mb-1">World-Class</div>
            <div className="text-lg font-semibold">{worldClassTarget}%</div>
            <div className="text-xs text-amber-300 mt-1">-{gapToWorldClass}% to reach</div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div>
        <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-4">
          Automation by Category
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg border-2 p-5 ${getStatusColor(metric.status)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getStatusIcon(metric.status)}</span>
                  <h4 className="font-semibold text-black">{metric.category}</h4>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{metric.current}%</div>
                  <div className="text-xs opacity-70">Target: {metric.target}%</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-current h-full rounded-full transition-all duration-500"
                    style={{ width: `${metric.current}%` }}
                  ></div>
                </div>
              </div>

              {/* Gap */}
              <div className="flex items-center justify-between text-xs">
                <span className="opacity-70">Gap: {metric.gap}%</span>
                <span className="font-medium">
                  {metric.gap <= 5 ? '✅ Excellent' : 
                   metric.gap <= 15 ? '⚠️ Good' : 
                   '🔧 Needs Work'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Human Involvement */}
      <div className="bg-white rounded-lg border border-black200 p-6">
        <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-4">
          Human Involvement Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-black mb-2">
              {100 - overallAutomation}%
            </div>
            <div className="text-sm text-black/70 mb-2">Human Involvement</div>
            <div className="text-xs text-black/50">
              {Math.round((100 - overallAutomation) * 40 / 100)} hours/week
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-2">
              {overallAutomation}%
            </div>
            <div className="text-sm text-black/70 mb-2">Fully Automated</div>
            <div className="text-xs text-black/50">
              {Math.round(overallAutomation * 40 / 100)} hours/week saved
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#ffffff] mb-2">
              {Math.round((overallAutomation / 40) * 100) / 10}
            </div>
            <div className="text-sm text-black/70 mb-2">FTE Equivalent</div>
            <div className="text-xs text-black/50">
              Full-time employees worth automated
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap to World-Class */}
      <div className="bg-gradient-to-r from-[#ffffff]/10 to-[#ffffff]/5 rounded-lg border border-[#ffffff]/20 p-6">
        <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-4">
          Roadmap to World-Class (95%)
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-black/70">Current Level</span>
            <span className="font-semibold text-black">{overallAutomation}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-black/70">World-Class Target</span>
            <span className="font-semibold text-black">{worldClassTarget}%</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#ffffff]/20">
            <span className="text-sm font-semibold text-black">Gap to Close</span>
            <span className="font-bold text-[#ffffff]">{gapToWorldClass}%</span>
          </div>
          <div className="mt-4 pt-4 border-t border-[#ffffff]/20">
            <div className="text-xs text-black/60 mb-2">Estimated Timeline:</div>
            <div className="text-sm font-semibold text-black">2-3 Months</div>
            <div className="text-xs text-black/60 mt-1">
              Focus: Route Optimization (+5%), Support AI (+10%), Dynamic Pricing (+5%), Exceptions (+3%)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AutomationLevelDashboard

