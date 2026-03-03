// Server-only module - uses Node.js fs
// This file should only be imported in Server Components
import fs from 'fs'
import path from 'path'

// Runtime check for server-side only
if (typeof window !== 'undefined') {
  throw new Error('folderScanner can only be used in Server Components')
}

export interface Subcategory {
  name: string
  slug: string
  images: string[]
  imageCount: number
}

export interface CategoryData {
  name: string
  key: string
  slug: string
  subcategories: Subcategory[]
  image: string
  description: string
  color: string
  icon: string
}

// Map folder names to category keys
const categoryMapping: { [key: string]: { key: string; name: string; icon: string; color: string; description: string } } = {
  'Bakery': { key: 'bakery', name: 'Bakery', icon: '🥖', color: 'from-amber-500 to-orange-500', description: 'Fresh baked goods' },
  'Beverages': { key: 'beverages', name: 'Beverages', icon: '🥤', color: 'from-blue-500 to-cyan-500', description: 'Refreshing drinks and beverages' },
  'Confectionary': { key: 'confectionery', name: 'Confectionary', icon: '🍬', color: 'from-pink-500 to-harvics-red', description: 'Sweet treats and confectionery' },
  'Culinary': { key: 'culinary', name: 'Culinary', icon: '🍽️', color: 'from-orange-500 to-white', description: 'Culinary products and ingredients' },
  'Frozen Foods': { key: 'frozenFoods', name: 'Frozen Foods', icon: '🧊', color: 'from-blue-500 to-purple-500', description: 'Frozen food products' },
  'Pastas': { key: 'pasta', name: 'Pasta', icon: '🍝', color: 'from-harvics-red to-pink-500', description: 'Quality pasta products' },
  'Snacks': { key: 'snacks', name: 'Snacks', icon: '🍿', color: 'from-white to-orange-500', description: 'Delicious snacks and treats' }
}

// Helper function to create URL-friendly slug
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Helper function to get image files from a directory
function getImageFiles(dirPath: string): string[] {
  try {
    if (!fs.existsSync(dirPath)) {
      return []
    }
    
    const files = fs.readdirSync(dirPath)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    
    return files
      .filter(file => {
        const ext = path.extname(file).toLowerCase()
        // Only include image files, exclude videos and other files
        return imageExtensions.includes(ext) && !file.toLowerCase().endsWith('.mp4')
      })
      .map(file => {
        // Get relative path from public folder
        const relativePath = path.relative(path.join(process.cwd(), 'public'), dirPath)
        // Convert to URL path (forward slashes) - Next.js handles spaces automatically
        let urlPath = relativePath.replace(/\\/g, '/')
        // Normalize to use /Images/ (capital I) to match git/Vercel case-sensitive file system
        urlPath = urlPath.replace(/^images\//i, 'Images/')
        return `/${urlPath}/${file}`
      })
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error)
    return []
  }
}

// Cache for categories to avoid repeated file system scans
let categoriesCache: CategoryData[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 60000 // 1 minute cache

// Get all categories from the folder structure
export function getCategoriesFromFolder(): CategoryData[] {
  // Return cached result if available and fresh
  const now = Date.now()
  if (categoriesCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return categoriesCache
  }

  // Try both case variations for cross-platform compatibility
  const imagesPath1 = path.join(process.cwd(), 'public', 'Images', 'Harvics.com')
  const imagesPath2 = path.join(process.cwd(), 'public', 'images', 'Harvics.com')
  
  let basePath = imagesPath1
  if (!fs.existsSync(basePath)) {
    basePath = imagesPath2
    if (!fs.existsSync(basePath)) {
      console.warn('Harvics.com folder not found at:', imagesPath1, 'or', imagesPath2)
      // Cache empty result to avoid repeated checks
      categoriesCache = []
      cacheTimestamp = now
      return []
    }
  }

  const categories: CategoryData[] = []
  
  try {
    const categoryFolders = fs.readdirSync(basePath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    for (const categoryFolder of categoryFolders) {
      const categoryInfo = categoryMapping[categoryFolder]
      
      if (!categoryInfo) {
        console.warn(`Unknown category folder: ${categoryFolder}`)
        continue
      }

      const categoryPath = path.join(basePath, categoryFolder)
      const subcategories: Subcategory[] = []

      // Check if this category has subdirectories (subcategories)
      const items = fs.readdirSync(categoryPath, { withFileTypes: true })
      const hasSubdirectories = items.some(item => item.isDirectory())

      if (hasSubdirectories) {
        // Category has subcategories
        const subcategoryDirs = items
          .filter(item => item.isDirectory())
          .map(item => item.name)

        for (const subcategoryDir of subcategoryDirs) {
          const subcategoryPath = path.join(categoryPath, subcategoryDir)
          const images = getImageFiles(subcategoryPath)
          
          if (images.length > 0) {
            subcategories.push({
              name: subcategoryDir,
              slug: createSlug(subcategoryDir),
              images,
              imageCount: images.length
            })
          }
        }
      } else {
        // Category has direct images (like Pastas)
        const images = getImageFiles(categoryPath)
        if (images.length > 0) {
          subcategories.push({
            name: 'All',
            slug: 'all',
            images,
            imageCount: images.length
          })
        }
      }

      // Get a representative image for the category
      // Try to find the first available image from any subcategory
      let categoryImage = '/Images/logo.png'
      for (const subcategory of subcategories) {
        if (subcategory.images && subcategory.images.length > 0) {
          categoryImage = subcategory.images[0]
          break
        }
      }
      
      // If still no image found, try to get images directly from category folder
      if (categoryImage === '/Images/logo.png') {
        const directImages = getImageFiles(categoryPath)
        if (directImages.length > 0) {
          categoryImage = directImages[0]
        }
      }

      categories.push({
        name: categoryInfo.name,
        key: categoryInfo.key,
        slug: createSlug(categoryFolder),
        subcategories,
        image: categoryImage,
        description: categoryInfo.description,
        color: categoryInfo.color,
        icon: categoryInfo.icon
      })
    }
  } catch (error) {
    console.error('Error scanning folder structure:', error)
    // Cache empty result on error to prevent repeated failures
    categoriesCache = []
    cacheTimestamp = Date.now()
    return []
  }

  const sortedCategories = categories.sort((a, b) => a.name.localeCompare(b.name))
  // Cache the result
  categoriesCache = sortedCategories
  cacheTimestamp = Date.now()
  return sortedCategories
}

// Get subcategories for a specific category
export function getSubcategoriesForCategory(categoryKey: string): Subcategory[] {
  const categories = getCategoriesFromFolder()
  const category = categories.find(cat => cat.key === categoryKey)
  return category ? category.subcategories : []
}

// Get images for a specific category and subcategory
export function getImagesForSubcategory(categoryKey: string, subcategorySlug: string): string[] {
  const categories = getCategoriesFromFolder()
  const category = categories.find(cat => cat.key === categoryKey)
  
  if (!category) {
    return []
  }

  const subcategory = category.subcategories.find(sub => sub.slug === subcategorySlug)
  return subcategory ? subcategory.images : []
}

// Get category info
export function getCategoryInfo(categoryKey: string): CategoryData | null {
  const categories = getCategoriesFromFolder()
  return categories.find(cat => cat.key === categoryKey) || null
}

// Get all categories (for products page)
export function getAllCategories(): CategoryData[] {
  return getCategoriesFromFolder()
}

