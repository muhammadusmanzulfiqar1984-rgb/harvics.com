import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { expenses, totalAmount, currency } = await req.json()

    // @ts-expect-error - CF env binding available at runtime
    const ai = (globalThis as unknown as { AI?: unknown }).AI ?? (req as unknown as { env?: { AI?: unknown } }).env?.AI

    if (ai && typeof (ai as { run?: unknown }).run === 'function') {
      const cfAI = ai as { run: (model: string, opts: unknown) => Promise<{ response?: string }> }
      const result = await cfAI.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
          { role: 'system', content: 'You are a VAT expense analyst. Provide a brief 2-3 sentence summary of the expense report highlighting top categories and VAT implications.' },
          { role: 'user', content: `Total: ${currency}${totalAmount}. Expenses: ${JSON.stringify(expenses?.slice(0, 10))}` },
        ],
        max_tokens: 200,
      })
      return NextResponse.json({ summary: result?.response ?? generateRuleSummary(expenses, totalAmount, currency) })
    }

    return NextResponse.json({ summary: generateRuleSummary(expenses, totalAmount, currency) })
  } catch {
    return NextResponse.json({ summary: 'Expense summary unavailable.' })
  }
}

function generateRuleSummary(expenses: { category?: string; amount?: number }[] = [], total: number = 0, currency: string = 'EUR'): string {
  if (!expenses.length) return 'No expenses recorded yet.'
  const cats = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category ?? 'Other'] = (acc[e.category ?? 'Other'] ?? 0) + (e.amount ?? 0)
    return acc
  }, {})
  const top = Object.entries(cats).sort((a, b) => b[1] - a[1])[0]
  return `Total expenses: ${currency}${total.toFixed(2)} across ${expenses.length} entries. Largest category: ${top?.[0] ?? 'Other'} (${currency}${(top?.[1] ?? 0).toFixed(2)}). Review VAT-eligible items for maximum recovery.`
}
