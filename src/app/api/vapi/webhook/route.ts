import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message } = body

    // Only process end-of-call reports
    if (message?.type !== 'end-of-call-report') {
      return NextResponse.json({ received: true })
    }

    const { call } = message
    const recordingUrl = call?.recordingUrl || null
    const callId = call?.id || 'unknown'
    const durationSeconds = call?.duration || 0
    const transcript = call?.transcript || ''

    // Run Deepgram Audio Intelligence on the recording
    let intelligence: any = null
    if (recordingUrl && process.env.DEEPGRAM_API_KEY) {
      const dgResponse = await fetch(
        'https://api.deepgram.com/v1/listen?' +
          new URLSearchParams({
            summarize: 'v2',
            sentiment: 'true',
            topics: 'true',
            intents: 'true',
            detect_entities: 'true',
            punctuate: 'true',
          }),
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: recordingUrl }),
        }
      )
      if (dgResponse.ok) {
        intelligence = await dgResponse.json()
      }
    }

    // Extract intelligence
    const summary =
      intelligence?.results?.summary?.short || message?.summary || 'No summary'
    const sentiment =
      intelligence?.results?.sentiments?.average?.sentiment || 'neutral'
    const sentimentScore =
      intelligence?.results?.sentiments?.average?.sentiment_score || 0
    const topics = [
      ...new Set(
        intelligence?.results?.topics?.segments?.flatMap((s: any) =>
          s.topics?.map((t: any) => t.topic)
        ) || []
      ),
    ]
    const intents = [
      ...new Set(
        intelligence?.results?.intents?.segments?.flatMap((s: any) =>
          s.intents?.map((i: any) => i.intent)
        ) || []
      ),
    ]
    const entities = [
      ...new Set(
        intelligence?.results?.entities?.results?.map(
          (e: any) => `${e.value} (${e.type})`
        ) || []
      ),
    ]

    const mins = Math.floor(durationSeconds / 60)
    const secs = durationSeconds % 60

    const report = {
      callId,
      timestamp: new Date().toISOString(),
      duration: `${mins}m ${secs}s`,
      summary,
      sentiment: `${sentiment} (score: ${sentimentScore.toFixed(2)})`,
      topics,
      intents,
      entities,
      recordingUrl,
      transcript,
    }

    // Log to console (visible in Vercel logs)
    console.log('========== HARVEY CALL REPORT ==========')
    console.log(JSON.stringify(report, null, 2))
    console.log('========================================')

    // Optional: send email notification
    // Uncomment and configure if you add an email service (Resend, SendGrid, etc.)
    /*
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'harvey@harvics.com',
        to: 'usman@harvics.com',
        subject: `HARVEY Call Report — ${new Date().toLocaleDateString()}`,
        text: [
          `Duration: ${mins}m ${secs}s`,
          `Summary: ${summary}`,
          `Sentiment: ${sentiment} (${sentimentScore.toFixed(2)})`,
          `Topics: ${topics.join(', ') || 'none'}`,
          `Intents: ${intents.join(', ') || 'none'}`,
          `Entities: ${entities.join(', ') || 'none'}`,
          `Recording: ${recordingUrl || 'not available'}`,
          '',
          'Transcript:',
          transcript,
        ].join('\n'),
      }),
    })
    */

    return NextResponse.json({ success: true, callId })
  } catch (error) {
    console.error('VAPI webhook error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
