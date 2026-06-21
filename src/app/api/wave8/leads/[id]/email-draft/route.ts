import { NextRequest } from 'next/server'
import { proxyWave8 } from '../../../_proxy'

export const runtime = 'nodejs'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return proxyWave8(req, `/leads/${id}/email-draft`)
}
