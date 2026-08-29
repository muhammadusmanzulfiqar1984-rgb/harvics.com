import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { fetchAiStrategy } from './ai.client'
import { getCountryProfile } from '../localisation/localisation.service'
import { buildWhiteSpaceReport } from '../satellite/satellite.service'
import { getTradeFlows } from '../trade/trade.service'
import { procurementService } from '../procurement/procurement.service'
import { prisma } from '../../core/prisma'
import { emitAudit } from '../../services/audit.service'
import { eventBus } from '../../core/eventBus'

const aiRouter = Router()

const AiModelCreateSchema = z.object({
  name: z.string().min(1).max(200),
  provider: z.string().min(1).max(80),
  status: z.enum(['Active', 'Disabled', 'Deprecated']).default('Active'),
})

const AiModelUpdateSchema = AiModelCreateSchema.partial()

/** GET /api/ai/models — list registered AI models (#56) */
aiRouter.get('/models', async (_req: Request, res: Response) => {
  try {
    const data = await prisma.aiModel.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })
    return res.json({ success: true, data, total: data.length })
  } catch (error) {
    console.error('[AI_MODELS_LIST]', error)
    return res.status(500).json({ success: false, error: 'Failed to list AI models' })
  }
})

/** GET /api/ai/models/:id */
aiRouter.get('/models/:id', async (req: Request, res: Response) => {
  try {
    const data = await prisma.aiModel.findUnique({ where: { id: req.params.id } })
    if (!data) return res.status(404).json({ success: false, error: 'Not found' })
    return res.json({ success: true, data })
  } catch (error) {
    console.error('[AI_MODELS_GET]', error)
    return res.status(500).json({ success: false, error: 'Failed to get AI model' })
  }
})

/** POST /api/ai/models — register a model (#56) */
aiRouter.post('/models', async (req: Request, res: Response) => {
  try {
    const parsed = AiModelCreateSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, issues: parsed.error.issues })
    }
    const data = await prisma.aiModel.create({ data: parsed.data })
    void emitAudit(req, 'aiModel.created', 'AiModel', data.id, { module: 'ai-engine' })
    eventBus.emitDomain('ai.model.created', data, 'ai-engine')
    return res.status(201).json({ success: true, data })
  } catch (error) {
    console.error('[AI_MODELS_CREATE]', error)
    return res.status(500).json({ success: false, error: 'Failed to create AI model' })
  }
})

/** PATCH /api/ai/models/:id */
aiRouter.patch('/models/:id', async (req: Request, res: Response) => {
  try {
    const parsed = AiModelUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, issues: parsed.error.issues })
    }
    const data = await prisma.aiModel.update({ where: { id: req.params.id }, data: parsed.data })
    void emitAudit(req, 'aiModel.updated', 'AiModel', data.id, { module: 'ai-engine' })
    return res.json({ success: true, data })
  } catch (error: any) {
    if (error?.code === 'P2025') return res.status(404).json({ success: false, error: 'Not found' })
    console.error('[AI_MODELS_PATCH]', error)
    return res.status(500).json({ success: false, error: 'Failed to update AI model' })
  }
})

/** DELETE /api/ai/models/:id */
aiRouter.delete('/models/:id', async (req: Request, res: Response) => {
  try {
    await prisma.aiModel.delete({ where: { id: req.params.id } })
    void emitAudit(req, 'aiModel.deleted', 'AiModel', req.params.id, { module: 'ai-engine' })
    return res.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') return res.status(404).json({ success: false, error: 'Not found' })
    console.error('[AI_MODELS_DELETE]', error)
    return res.status(500).json({ success: false, error: 'Failed to delete AI model' })
  }
})

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
    const procurementMap = procurementService.getProcurementMap(country)

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
