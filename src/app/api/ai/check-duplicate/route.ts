import { NextRequest, NextResponse } from 'next/server'


export async function POST(req: NextRequest) {
  try {
    const { newExpense, existingExpenses } = await req.json()

    // Rule-based duplicate check — no AI needed
    const isDuplicate = (existingExpenses ?? []).some((e: { amount?: number; vendor?: string; date?: string }) => {
      const sameAmount = Math.abs((e.amount ?? 0) - (newExpense.amount ?? 0)) < 0.01
      const sameVendor = (e.vendor ?? '').toLowerCase() === (newExpense.vendor ?? '').toLowerCase()
      const sameDate = e.date === newExpense.date
      return sameAmount && (sameVendor || sameDate)
    })

    return NextResponse.json({ isDuplicate, confidence: isDuplicate ? 0.95 : 0.05 })
  } catch {
    return NextResponse.json({ isDuplicate: false, confidence: 0 })
  }
}
