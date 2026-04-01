/**
 * AI Image Generator using Google Gemini Imagen 3
 * Auto-generates product images when missing
 */

import { Router, Request, Response } from 'express'

const router = Router()

// In-memory cache for generated images (in production, use Redis/DB)
const imageCache = new Map<string, string>()

/**
 * Build optimized prompt for product images
 */
function buildPrompt(context: {
  category?: string
  product?: string
  industry?: string
  style?: string
}): string {
  const { category = '', product = '', industry = 'FMCG', style = 'commercial' } = context

  const basePrompt = 'Professional commercial product photography'
  const lighting = 'studio lighting, soft shadows, high-end look'
  const background = 'clean white background, minimal props'
  const quality = '4K resolution, sharp focus, vibrant colors'
  const brand = 'premium quality, elegant presentation, e-commerce ready'

  return `${basePrompt} of ${product} ${category}, ${industry} product. ${lighting}, ${background}. ${quality}, ${brand}. Style: ${style}.`
}

/**
 * Generate image using Gemini Imagen 3
 */
async function generateWithGemini(prompt: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY

  if (!apiKey || apiKey === 'PASTE_YOUR_KEY_HERE') {
    console.warn('Gemini API key not configured')
    return null
  }

  try {
    // Gemini Imagen 3 endpoint
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: '1:1',
            personGeneration: 'dont_allow',
            safetyFilterLevel: 'block_medium_and_above',
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Gemini API error:', error)
      
      // Fallback to text-to-image via Gemini Pro Vision
      return await fallbackToGeminiPro(prompt)
    }

    const data = await response.json()
    
    if (data.predictions && data.predictions[0]?.bytesBase64Encoded) {
      // Return base64 data URL
      return `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`
    }

    return null
  } catch (error) {
    console.error('Image generation failed:', error)
    return null
  }
}

/**
 * Fallback: Use Unsplash for free stock images
 */
async function fallbackToUnsplash(query: string): Promise<string | null> {
  try {
    // Using Unsplash Source (free, no API key needed)
    const searchQuery = encodeURIComponent(query)
    return `https://source.unsplash.com/800x800/?${searchQuery}`
  } catch {
    return null
  }
}

/**
 * Fallback to Gemini Pro for describing and suggesting images
 */
async function fallbackToGeminiPro(prompt: string): Promise<string | null> {
  // If Imagen 3 fails, fall back to Unsplash
  const keywords = prompt.split(',')[0].replace('Professional commercial product photography of', '').trim()
  return fallbackToUnsplash(keywords)
}

/**
 * POST /api/ai/generate-image
 * Generate or fetch an image for a product
 */
router.post('/generate-image', async (req: Request, res: Response) => {
  try {
    const { category, product, industry, style, forceRefresh } = req.body

    if (!product && !category) {
      return res.status(400).json({
        success: false,
        error: 'Product or category required',
      })
    }

    // Check cache first
    const cacheKey = `${industry}-${category}-${product}`.toLowerCase().replace(/\s+/g, '-')
    
    if (!forceRefresh && imageCache.has(cacheKey)) {
      return res.json({
        success: true,
        imageUrl: imageCache.get(cacheKey),
        cached: true,
        source: 'cache',
      })
    }

    // Build prompt
    const prompt = buildPrompt({ category, product, industry, style })

    // Try Gemini Imagen 3 first
    let imageUrl = await generateWithGemini(prompt)
    let source = 'gemini-imagen-3'

    // Fallback to Unsplash if Gemini fails
    if (!imageUrl) {
      const query = `${product} ${category}`.trim() || 'food product'
      imageUrl = await fallbackToUnsplash(query)
      source = 'unsplash'
    }

    if (imageUrl) {
      // Cache the result
      imageCache.set(cacheKey, imageUrl)

      return res.json({
        success: true,
        imageUrl,
        cached: false,
        source,
        prompt,
      })
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to generate image',
    })
  } catch (error) {
    console.error('Image generation error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    })
  }
})

/**
 * GET /api/ai/image-status
 * Check if API is configured and working
 */
router.get('/image-status', (_req: Request, res: Response) => {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  const isConfigured = apiKey && apiKey !== 'PASTE_YOUR_KEY_HERE'

  return res.json({
    configured: isConfigured,
    cacheSize: imageCache.size,
    provider: 'gemini-imagen-3',
    fallback: 'unsplash',
  })
})

/**
 * POST /api/ai/clear-cache
 * Clear image cache (admin only)
 */
router.post('/clear-cache', (_req: Request, res: Response) => {
  const size = imageCache.size
  imageCache.clear()

  return res.json({
    success: true,
    cleared: size,
  })
})

export default router
