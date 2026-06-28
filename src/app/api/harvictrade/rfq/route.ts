import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      product, category, quantity, targetPrice, requiredBy, specs,
      deliveryLocation, incoterms, paymentTerms, preferredOrigin,
      fullName, company, email, phone, country, website,
    } = body

    if (!product || !fullName || !email) {
      return NextResponse.json({ error: 'Product, name and email are required.' }, { status: 400 })
    }

    // Format for logging / future email integration
    const rfqSummary = {
      id: `RFQ-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      product: { product, category, quantity, targetPrice, requiredBy, specs },
      trade: { deliveryLocation, incoterms, paymentTerms, preferredOrigin },
      contact: { fullName, company, email, phone, country, website },
    }

    console.log('[HarvicTrade RFQ]', JSON.stringify(rfqSummary, null, 2))

    // TODO: wire to Resend / email when RESEND_API_KEY is added to .env
    // import { Resend } from 'resend'
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({ from: 'trade@harvics.com', to: 'sourcing@harvics.com', subject: `New RFQ: ${product}`, text: JSON.stringify(rfqSummary, null, 2) })

    return NextResponse.json({ success: true, rfqId: rfqSummary.id })
  } catch (err) {
    console.error('[HarvicTrade RFQ Error]', err)
    return NextResponse.json({ error: 'Failed to submit RFQ. Please try again.' }, { status: 500 })
  }
}
