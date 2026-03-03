import { request } from 'undici'

export interface StrategyPayload {
  countryCode: string
  macroData: Record<string, unknown>
  gpsCoverageScore: number
  tradeFlows: Record<string, unknown>
  procurementMap: Record<string, unknown>
}

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000'

export const fetchAiStrategy = async (payload: StrategyPayload) => {
  const response = await request(`${AI_ENGINE_URL}/strategy`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (response.statusCode >= 400) {
    const errorBody = await response.body.text()
    throw new Error(`AI_ENGINE_ERROR ${response.statusCode}: ${errorBody}`)
  }

  return response.body.json()
}
