import { NextRequest } from 'next/server'
import { proxyWave8 } from '../../_proxy'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  return proxyWave8(req, '/leads/bulk-score')
}
