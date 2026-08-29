import { NextRequest } from 'next/server'
import { proxyWave8 } from '../../_proxy'

export const runtime = 'nodejs'

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  return proxyWave8(req, `/leads/${id}`)
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  return proxyWave8(req, `/leads/${id}`)
}
