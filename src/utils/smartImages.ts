/**
 * Smart AI Image Generator Utility
 * Generates optimized image URLs from multiple sources:
 * - Unsplash (high-quality stock photos)
 * - Pexels (free stock photos)
 * - Placeholder services for development
 * 
 * Can be extended to use DALL-E API or other AI image services
 */

export interface ImageOptions {
  width?: number
  height?: number
  quality?: number
  blur?: number
  fit?: 'cover' | 'contain' | 'fill'
}

/**
 * Generate Unsplash image URL based on keywords
 */
export function getUnsplashImage(
  keywords: string,
  options: ImageOptions = {}
): string {
  const {
    width = 1920,
    height = 1080,
    quality = 95,
  } = options

  // Unsplash Source API
  const encodedKeywords = encodeURIComponent(keywords)
  return `https://source.unsplash.com/${width}x${height}/?${encodedKeywords}&q=${quality}`
}

/**
 * Generate high-quality Unsplash Direct API URL
 */
export function getUnsplashDirect(
  searchTerm: string,
  options: ImageOptions = {}
): string {
  const {
    width = 2400,
    height = 1600,
    quality = 95,
    fit = 'crop',
  } = options

  const term = encodeURIComponent(searchTerm)
  return `https://images.unsplash.com/photo-${getPhotoId(searchTerm)}?w=${width}&h=${height}&fit=${fit}&q=${quality}&auto=format`
}

/**
 * Map industry/content to specific high-quality Unsplash photo IDs
 */
function getPhotoId(searchTerm: string): string {
  const photoMap: Record<string, string> = {
    'textiles': '1558769132-cb1aea6d7d6e',
    'fmcg': '1534723328310-e82dad3ee43f',
    'commodities': '1625246333195-78d9c38ad449',
    'industrial': '1581094794329-c8112a89af12',
    'minerals': '1581092918056-0c4c3acd3789',
    'oil-gas': '1513828583688-c52646db42da',
    'real-estate': '1486406146926-c627a92ad1ab',
    'sourcing': '1586528116311-ad8dd3c8310d',
    'finance': '1579621970563-ebec7560ff3e',
    'ai-technology': '1677442136019-21780ecad995',
    'business-meeting': '1560179707-f14e90ef3623',
    'global-trade': '1526304640581-d334cdbbf45e',
    'warehouse': '1553413077-190dd305871c',
    'manufacturing': '1565191999001-551c187427bb',
    'supply-chain': '1578575437130-527eed3abbec',
    'corporate-office': '1497366216902-63e6bfb06cc2',
    'team-collaboration': '1522071820677-9b8e4e4bc35a',
    'data-analytics': '1551288049-1bf39830369e',
  }

  // Try exact match first
  const normalized = searchTerm.toLowerCase().replace(/\s+/g, '-')
  if (photoMap[normalized]) {
    return photoMap[normalized]
  }

  // Fallback to generic business image
  return '1486406146926-c627a92ad1ab'
}

/**
 * Generate Pexels image URL
 */
export function getPexelsImage(
  query: string,
  options: ImageOptions = {}
): string {
  const {
    width = 1920,
    height = 1080,
  } = options

  const q = encodeURIComponent(query)
  return `https://images.pexels.com/photos/${width}x${height}/?${q}`
}

/**
 * Industry-specific image URLs (curated high-quality images)
 */
export const industryImages: Record<string, string> = {
  textiles: 'https://images.unsplash.com/photo-1558769132-cb1aea6d7d6e?q=95&w=2400&fit=crop&auto=format',
  fmcg: 'https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?q=95&w=2400&fit=crop&auto=format',
  commodities: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=95&w=2400&fit=crop&auto=format',
  industrial: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=95&w=2400&fit=crop&auto=format',
  minerals: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=95&w=2400&fit=crop&auto=format',
  'oil-gas': 'https://images.unsplash.com/photo-1513828583688-c52646db42da?q=95&w=2400&fit=crop&auto=format',
  'real-estate': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=95&w=2400&fit=crop&auto=format',
  sourcing: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=95&w=2400&fit=crop&auto=format',
  finance: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=95&w=2400&fit=crop&auto=format',
  ai: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=95&w=2400&fit=crop&auto=format',
}

/**
 * Get appropriate image based on content type and context
 */
export function getSmartImage(
  contentType: 'hero' | 'card' | 'banner' | 'thumbnail',
  context: string,
  options: ImageOptions = {}
): string {
  // Check if we have a predefined industry image
  if (industryImages[context]) {
    return industryImages[context]
  }

  // Otherwise generate from Unsplash based on content type
  const defaultSizes = {
    hero: { width: 2400, height: 1400 },
    card: { width: 800, height: 600 },
    banner: { width: 1920, height: 400 },
    thumbnail: { width: 400, height: 300 },
  }

  const size = defaultSizes[contentType]
  return getUnsplashImage(context, { ...size, ...options })
}

/**
 * Generate optimized srcSet for responsive images
 */
export function generateSrcSet(imageUrl: string, widths: number[] = [640, 1024, 1920, 2400]): string {
  return widths
    .map(width => {
      const url = imageUrl.includes('?') 
        ? `${imageUrl}&w=${width}` 
        : `${imageUrl}?w=${width}`
      return `${url} ${width}w`
    })
    .join(', ')
}

/**
 * Future: DALL-E integration placeholder
 * This can be implemented when you want to generate completely custom images
 */
export async function generateAIImage(
  prompt: string,
  style: 'photorealistic' | 'artistic' | 'corporate' = 'corporate'
): Promise<string> {
  // TODO: Integrate with DALL-E API or other AI image generation service
  // For now, return a high-quality Unsplash image
  console.log(`AI Image Generation requested: ${prompt} (${style})`)
  return getUnsplashImage(prompt)
}
