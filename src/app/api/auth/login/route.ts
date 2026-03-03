import { NextRequest, NextResponse } from 'next/server'

// ALWAYS use localhost:4000 for local development
// Only use production URL if explicitly set AND we're in production mode
const BACKEND_URL = (process.env.NODE_ENV === 'production' && 
                     process.env.NEXT_PUBLIC_API_URL && 
                     process.env.NEXT_PUBLIC_API_URL.startsWith('https://'))
  ? process.env.NEXT_PUBLIC_API_URL
  : 'http://localhost:4000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    // Handle rate limiting first (429)
    if (response.status === 429) {
      const rateLimitText = await response.text().catch(() => '')
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please wait a few minutes and try again.' },
        { status: 429 }
      )
    }
    
    // IMPORTANT: response.text() can only be called once!
    // Read the response text first, then parse it
    let responseText = ''
    let data: any = null
    
    try {
      responseText = await response.text()
      
      if (!responseText || responseText.trim() === '') {
        return NextResponse.json(
          { success: false, error: 'Empty response from backend' },
          { status: 500 }
        )
      }
      
      data = JSON.parse(responseText)
    } catch (parseError) {
      // If JSON parsing fails, we already have the text stored
      console.error('Failed to parse backend response:', parseError)
      console.error('Backend response text:', responseText.substring(0, 200))
      console.error('Backend status:', response.status, response.statusText)
      
      return NextResponse.json(
        { success: false, error: `Invalid response from backend: ${response.status} ${response.statusText}` },
        { status: response.status || 500 }
      )
    }
    
    // Transform backend response to match frontend API client format
    // Backend returns: { token, refreshToken, user } or { error }
    // Frontend expects: { data: { token, user } } or { error }
    
    // Handle error responses
    if (data.error) {
      return NextResponse.json(
        { success: false, error: data.error },
        { status: response.status >= 400 ? response.status : 401 }
      )
    }
    
    // Handle success responses
    if (data.token && data.user) {
      // Return in format expected by apiClient.login()
      // The apiClient.request() method wraps responses, so we return { data: { token, user } }
      return NextResponse.json(
        { 
          data: {
            token: data.token,
            refreshToken: data.refreshToken,
            user: data.user
          }
        },
        { status: 200 }
      )
    }
    
    // Unexpected response format
    console.error('Unexpected backend response format:', JSON.stringify(data).substring(0, 200))
    return NextResponse.json(
      { success: false, error: 'Unexpected response format from backend' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Login proxy error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Check if this is a network/connection error
    if (errorMessage.includes('fetch') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('network')) {
      // Check if backend is reachable
      try {
        const healthCheck = await fetch(`${BACKEND_URL}/api/health`, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        })
        if (!healthCheck.ok) {
          return NextResponse.json(
            { success: false, error: `Backend health check failed. Status: ${healthCheck.status}` },
            { status: 500 }
          )
        }
      } catch (healthError) {
        return NextResponse.json(
          { success: false, error: `Cannot connect to backend at ${BACKEND_URL}. Please ensure the backend server is running on port 4000.` },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { success: false, error: `Failed to connect to backend: ${errorMessage}` },
      { status: 500 }
    )
  }
}
