'use client'

import React, { useState } from 'react'

interface AIInsight {
  id: string
  type: 'prediction' | 'risk' | 'opportunity' | 'action'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  confidence?: number
}

interface AIInsightsPanelProps {
  isOpen: boolean
  onClose: () => void
  insights: AIInsight[]
  title?: string
}

export default function AIInsightsPanel({
  isOpen,
  onClose,
  insights,
  title = 'AI Insights'
}: AIInsightsPanelProps) {
  if (!isOpen) return null

  const getIcon = (type: string) => {
    switch (type) {
      case 'prediction': return '🔮'
      case 'risk': return '⚠️'
      case 'opportunity': return '💡'
      case 'action': return '✅'
      default: return '📊'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-white'
      case 'low': return 'border-l-blue-500'
      default: return 'border-l-gray-500'
    }
  }

  const groupedInsights = {
    predictions: insights.filter(i => i.type === 'prediction'),
    risks: insights.filter(i => i.type === 'risk'),
    opportunities: insights.filter(i => i.type === 'opportunity'),
    actions: insights.filter(i => i.type === 'action')
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-y-auto">
        <div className="p-6 border-b border-black300 sticky top-0 bg-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-black">{title}</h2>
            <button
              onClick={onClose}
              className="text-black hover:text-black text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-black">AI-powered insights and recommendations</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Predictions */}
          {groupedInsights.predictions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>🔮</span> Predictions
              </h3>
              <div className="space-y-3">
                {groupedInsights.predictions.map((insight) => (
                  <div
                    key={insight.id}
                    className={`bg-white border-l-4 ${getPriorityColor(insight.priority)} p-4 rounded-r-lg`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-black text-sm">{insight.title}</h4>
                      {insight.confidence && (
                        <span className="text-xs text-black">{insight.confidence}% confidence</span>
                      )}
                    </div>
                    <p className="text-sm text-black">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risks */}
          {groupedInsights.risks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>⚠️</span> Risks
              </h3>
              <div className="space-y-3">
                {groupedInsights.risks.map((insight) => (
                  <div
                    key={insight.id}
                    className={`bg-white border-l-4 ${getPriorityColor(insight.priority)} p-4 rounded-r-lg`}
                  >
                    <h4 className="font-semibold text-black text-sm mb-2">{insight.title}</h4>
                    <p className="text-sm text-black">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Opportunities */}
          {groupedInsights.opportunities.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>💡</span> Opportunities
              </h3>
              <div className="space-y-3">
                {groupedInsights.opportunities.map((insight) => (
                  <div
                    key={insight.id}
                    className={`bg-white border-l-4 ${getPriorityColor(insight.priority)} p-4 rounded-r-lg`}
                  >
                    <h4 className="font-semibold text-black text-sm mb-2">{insight.title}</h4>
                    <p className="text-sm text-black">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Actions */}
          {groupedInsights.actions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>✅</span> Recommended Actions
              </h3>
              <div className="space-y-3">
                {groupedInsights.actions.map((insight) => (
                  <div
                    key={insight.id}
                    className={`bg-white border-l-4 ${getPriorityColor(insight.priority)} p-4 rounded-r-lg`}
                  >
                    <h4 className="font-semibold text-black text-sm mb-2">{insight.title}</h4>
                    <p className="text-sm text-black">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insights.length === 0 && (
            <div className="text-center py-12">
              <p className="text-black">No insights available at this time.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

