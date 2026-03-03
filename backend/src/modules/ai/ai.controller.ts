import { Router } from 'express'
import { fetchAiStrategy } from './ai.client'
import { getCountryProfile } from '../localisation/localisation.service'
import { buildWhiteSpaceReport } from '../satellite/satellite.service'
import { getTradeFlows } from '../trade/trade.service'
import { getProcurementMap } from '../procurement/procurement.service'

const aiRouter = Router()

aiRouter.get('/strategy/:country', async (req, res) => {
  const { country } = req.params
  try {
    const profile = getCountryProfile(country)
    const macroData = profile
      ? {
          population: profile.population,
          gdpPerCapita: profile.gdpPerCapitaUSD,
          fxRate: profile.fxRateToUSD,
          marketType: profile.marketType,
          logisticsComplexity: profile.logisticsComplexityScore
        }
      : {}

    const coverage = buildWhiteSpaceReport(country)
    const whiteSpaceCount = coverage.summary.whiteSpaces
    const tradeFlows = getTradeFlows(country)
    const procurementMap = getProcurementMap(country)

    const aiResponse = await fetchAiStrategy({
      countryCode: country.toUpperCase(),
      macroData,
      gpsCoverageScore: coverage.summary.coverageRate,
      tradeFlows,
      procurementMap
    }) as any

    const payload = (aiResponse && typeof aiResponse === 'object' && 'data' in aiResponse) 
      ? aiResponse.data 
      : aiResponse
    const coverageGaps = Array.isArray(payload.coverageGaps)
      ? payload.coverageGaps
      : [
          {
            area: payload.coverageGaps || 'Priority region',
            whiteSpaceTiles: whiteSpaceCount
          }
        ]
    const recommendedSkus = payload.recommendedSkus || payload.recommendedSKUs || []
    return res.json({
      countryCode: payload.country || country.toUpperCase(),
      marketScore: payload.marketScore ?? 75,
      priceBand: payload.priceBand ?? 'value',
      recommendedSkus,
      focusRegions: payload.focusRegions || [],
      coverageGaps,
      competitorPressure: payload.competitorPressure || 'medium',
      notes: payload.aiNarrative || 'AI strategy ready.'
    })
  } catch (error) {
    console.error('[AI_STRATEGY_ERROR]', error)
    return res.status(502).json({
      error: 'Failed to retrieve AI strategy'
    })
  }
})

export default aiRouter
