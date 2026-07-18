'use client'

import React, { useState, useEffect } from 'react'

interface ForecastData {
  period: string
  predicted: number
  lowerBound: number
  upperBound: number
  confidence: number
}

interface Recommendation {
  type: string
  message: string
  impact?: string
}

interface AutomationScore {
  overall: number
  byDomain: Record<string, {
    score: number
    automated: string[]
    manual: string[]
  }>
}

interface IntelligenceDashboardProps {
  domain?: string
  showForecast?: boolean
  showRecommendations?: boolean
  showAutomationScore?: boolean
}

export default function IntelligenceDashboard({
  domain = 'orders',
  showForecast = true,
  showRecommendations = true,
  showAutomationScore = true
}: IntelligenceDashboardProps) {
  const [forecast, setForecast] = useState<ForecastData[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [automationScore, setAutomationScore] = useState<AutomationScore | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIntelligenceData()
  }, [domain])

  const loadIntelligenceData = async () => {
    setLoading(true)
    try {
      const promises = []

      if (showForecast) {
        promises.push(
          fetch(`/api/intelligence/forecast/${domain}/revenue?periods=6`)
            .then(res => res.json())
            .then(data => setForecast(data.forecast || []))
        )
      }

      if (showRecommendations) {
        promises.push(
          fetch(`/api/intelligence/recommendations/${domain}`)
            .then(res => res.json())
            .then(data => setRecommendations(data.recommendations || []))
        )
      }

      if (showAutomationScore) {
        promises.push(
          fetch('/api/intelligence/automation-score')
            .then(res => res.json())
            .then(data => setAutomationScore(data))
        )
      }

      await Promise.all(promises)
    } catch (error) {
      console.error('Error loading intelligence data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-harvics-gold"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Automation Score */}
      {showAutomationScore && automationScore && (
        <div className="bg-gradient-to-br from-harvics-burgundy to-[#8B2F3B] rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold">Automation Score</h3>
              <p className="text-white/70 text-sm">Overall process automation level</p>
            </div>
            <div className="text-5xl font-bold">{automationScore.overall}%</div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {Object.entries(automationScore.byDomain).slice(0, 4).map(([domainName, data]) => (
              <div key={domainName} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-xs text-white/70 uppercase mb-1">{domainName}</div>
                <div className="text-2xl font-bold">{data.score}%</div>
                <div className="text-xs text-white/60 mt-1">
                  {data.automated.length} automated
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {showRecommendations && recommendations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-harvics-burgundy mb-4 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            AI Recommendations
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div 
                key={idx} 
                className="bg-gradient-to-r from-harvics-gold/10 to-transparent border-l-4 border-harvics-gold p-4 rounded-r-lg"
              >
                <p className="text-sm text-gray-800">{rec.message}</p>
                {rec.impact && (
                  <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                    rec.impact === 'high' ? 'bg-emerald-100 text-emerald-700' :
                    rec.impact === 'medium' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {rec.impact} impact
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forecast Chart */}
      {showForecast && forecast.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-harvics-burgundy mb-4 flex items-center gap-2">
            <span className="text-2xl">📈</span>
            Revenue Forecast
          </h3>
          <div className="space-y-3">
            {forecast.map((period, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600">{period.period}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">
                      ${(period.predicted / 1000).toFixed(0)}K
                    </span>
                    <span className="text-xs text-gray-500">
                      ({(period.confidence * 100).toFixed(0)}% confidence)
                    </span>
                  </div>
                  <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="absolute h-full bg-gray-200 rounded-full"
                      style={{ 
                        left: `${(period.lowerBound / period.upperBound) * 100}%`,
                        right: 0
                      }}
                    />
                    <div 
                      className="absolute h-full bg-gradient-to-r from-harvics-gold to-[#a68947] rounded-full"
                      style={{ width: `${(period.predicted / period.upperBound) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>${(period.lowerBound / 1000).toFixed(0)}K</span>
                    <span>${(period.upperBound / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Model: ARIMA + Seasonal Decomposition • Generated from historical data patterns
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
