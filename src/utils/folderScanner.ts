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
  description: string
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
  'Bakery': { key: 'bakery', name: 'Bakery', icon: 'icon-bakery', color: 'from-amber-500 to-orange-500', description: 'Premium biscuits, wafers, cakes and baked snacks sourced from certified European manufacturers.' },
  'Beverages': { key: 'beverages', name: 'Beverages', icon: 'icon-beverage', color: 'from-blue-500 to-cyan-500', description: 'Carbonated, functional, health and hot drinks distributed across 42+ international markets.' },
  'Confectionary': { key: 'confectionery', name: 'Confectionery', icon: 'icon-candy', color: 'from-pink-500 to-rose-600', description: 'Bubble gum, jellies, sugar candy and toffees — Halal certified, globally compliant.' },
  'Culinary': { key: 'culinary', name: 'Culinary', icon: 'icon-culinary', color: 'from-orange-500 to-amber-600', description: 'Cooking oils, spices, sauces, pickles and ready-to-cook products for retail and foodservice.' },
  'Frozen Foods': { key: 'frozenFoods', name: 'Frozen Foods', icon: 'icon-frozen', color: 'from-blue-500 to-purple-500', description: 'IQF chicken, fish fillets, frozen meat and vegetables — cold chain maintained from source to shelf.' },
  'Pastas': { key: 'pasta', name: 'Pasta', icon: 'icon-pasta', color: 'from-red-600 to-orange-500', description: 'Durum wheat pasta in all formats — fusilli, bucatini, farfalle — from premium Italian producers.' },
  'Snacks': { key: 'snacks', name: 'Snacks', icon: 'icon-snack', color: 'from-yellow-500 to-orange-500', description: 'Chips, crisps, baked snacks and fusion varieties across 15+ flavour profiles for global retail.' },
  'BearPops Characters': { key: 'bearpops', name: 'BearPops', icon: 'icon-bear', color: 'from-pink-400 to-purple-500', description: 'BearPops — the Harvics character brand. Fun, vibrant confectionery designed for kids and gifting markets.' },
  'Product Photos': { key: 'productPhotos', name: 'Product Range', icon: 'icon-package', color: 'from-harvics-maroon to-harvics-gold', description: 'Full Harvics product portfolio — FMCG across all categories, globally sourced and quality assured.' },
}

// Descriptions for every subcategory — keyed by slug
const subcategoryDescriptions: Record<string, string> = {
  // Bakery
  'bakery-snacks-and-dry-cakes': 'Dry cakes, rusks and cupcakes baked to consistent moisture levels. Long shelf life with nitrogen-flush packaging. Ideal for retail and foodservice.',
  'biscuits-and-cookies': 'Cream-filled biscuits, digestives, butter cookies and chocolate-coated varieties. Sourced from FSSC 22000 certified bakeries with multi-language labeling for export.',
  'cakes-and-pastreis': 'Individually wrapped cakes and pastries with controlled water activity for extended shelf life. Suitable for ambient retail and convenience channels.',
  'wafer-and-wafer-bars': 'Crispy layered wafers and coated wafer bars in chocolate, vanilla, hazelnut and strawberry. Packed for retail and impulse formats. MOQ from 500 cartons.',
  // Beverages
  'carbonated': 'Sparkling waters, sodas and carbonated soft drinks in 250ml to 1.5L formats. Full private-label capability with custom flavours and nutrition panels.',
  'functional': 'Energy drinks, sports recovery and fortified functional beverages. Taurine, B-vitamin and electrolyte formulations for active consumer segments.',
  'health-special': 'Health-focused beverages including vitamin waters, immunity blends and low-sugar variants. Clean-label, no artificial colours. Halal and EU-certified.',
  'hot-and-ready-drink': 'Ready-to-drink teas, coffees and hot chocolate in aseptic carton and PET formats. Shelf-stable at ambient temperature with 12–18 month shelf life.',
  'non-carbonated': 'Still juices, nectars, flavoured water and non-carbonated soft drinks. Cold-press and UHT options. Multi-pack and single-serve formats.',
  // Confectionery
  'bubble-gum': 'Fruit and mint bubble gum in pillow, stick and ball formats. Halal certified. Bright consumer packaging designed for checkout impulse and gifting.',
  'jelly': 'Fruit jellies, gummy bears and BearPops jelly characters. Halal gelatine-free and gelatine options. Popular in GCC, South Asia and European impulse retail.',
  'sugar-candy': 'Boiled sweets, fruit drops and lollipops in bulk jar and flow-wrap formats. Consistent sugar profiles with Halal and Kosher certification available.',
  'toffees': 'Eclairs, milk toffees and caramel chews. Individually wrapped for hygiene compliance. Popular single-serve and counter-display formats for emerging markets.',
  // Culinary
  'cooking-oil-fats-and-dressing': 'Sunflower, vegetable and blended cooking oils in 500ml–5L. Mayonnaise, salad dressings and vinaigrettes in retail and foodservice sizes.',
  'pickle-s-chutnyes-and-preserves': 'Mixed pickles, mango chutney, jam and fruit preserves. Traditional South Asian and Middle Eastern recipes with modern retail packaging.',
  'ready-to-cook': 'Marinated meat kits, curry pastes, spice kits and ready-to-cook meal solutions. Designed for minimal preparation — retailer-ready with full allergen labeling.',
  'seasoning-spices-and-marinade': 'Whole and ground spices — black pepper, chili, turmeric, cumin, coriander. Custom spice blends and marinades. Steam-sterilized, ETO-free processing.',
  'sauces-and-condiments': 'Ketchup, BBQ sauce, hot sauce, soy sauce, oyster sauce, pizza sauce, peri peri, honey mustard, Worcestershire and more. Retail and foodservice sizes.',
  // Frozen Foods
  'chicken-nuggets': 'Breaded and plain chicken nuggets from Halal-certified processing plants. IQF (Individually Quick Frozen) for consistent portion control. For QSR and retail.',
  'fish-fillet': 'White fish fillets — battered, breaded and plain. MSC-certified sourcing options. Cold chain maintained at -18°C from processing to delivery.',
  'frozen-meat': 'Halal-certified frozen chicken portions, beef cuts and lamb. Vacuum-packed and blast-frozen. Full HACCP traceability from farm to fork.',
  'frozen-vegitables': 'IQF mixed vegetables, peas, sweetcorn, spinach and stir-fry blends. No additives, no preservatives. Sourced from controlled agricultural supply chains.',
  // Pasta
  'all': 'Durum wheat semolina pasta — fusilli, bucatini, farfalle, fettuccine, linguine and more. Bronze-die extruded for authentic texture. From premium Italian and Spanish producers.',
  // Snacks
  'baked-and-roasted': 'Oven-baked and air-roasted snacks — chickpeas, corn puffs and grain-based crisps. Lower fat than fried alternatives. Clean label for health-conscious retail.',
  'chips-and-crisps': 'Potato chips, vegetable crisps and rice crackers in 30g–200g retail formats. 15+ flavour profiles. Nitrogen-flush packaging for maximum crunch retention.',
  'fusion-snacks': 'East-meets-West snack fusions — masala puffs, wasabi beans, chili corn. Designed for multicultural urban retail and export markets across Europe and GCC.',
  'ready-to-eat-bite': 'Bite-size snack portions for convenience and on-the-go consumption. Single-serve and multipacks. High repeatability for vending, travel retail and convenience.',
  'savory': 'Savoury baked goods, breadsticks, crackers and pretzel formats. Cheese, herb and smoked flavours. Ideal for gifting, hospitality and premium retail.',
  // BearPops
  'bearpops-characters': 'BearPops character confectionery — the Harvics kids brand. Gummy bears, jellies and lollipops with collectible character designs. Halal certified, EU compliant.',
  // Product Photos
  'product-photos': 'Full Harvics FMCG portfolio — all categories photographed for catalogue, digital and retail display use.',
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
  const imagesPath1 = path.join(process.cwd(), 'public', 'FMCG IMAGES')
  const imagesPath2 = path.join(process.cwd(), 'public', 'fmcg images')
  
  let basePath = imagesPath1
  if (!fs.existsSync(basePath)) {
    basePath = imagesPath2
    if (!fs.existsSync(basePath)) {
      console.warn('FMCG IMAGES folder not found at:', imagesPath1, 'or', imagesPath2)
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
            const subSlug = createSlug(subcategoryDir)
            subcategories.push({
              name: subcategoryDir,
              slug: subSlug,
              images,
              imageCount: images.length,
              description: subcategoryDescriptions[subSlug] || `Premium ${subcategoryDir.toLowerCase()} — quality assured, globally sourced by Harvics Global Ventures.`,
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
            imageCount: images.length,
            description: subcategoryDescriptions['all'] || categoryMapping[categoryFolder]?.description || 'Premium products globally sourced by Harvics Global Ventures.',
          })
        }
      }

      // Get a representative image for the category
      // Try to find the first available image from any subcategory
      let categoryImage = '/assets/brand/photo/logo.png'
      for (const subcategory of subcategories) {
        if (subcategory.images && subcategory.images.length > 0) {
          categoryImage = subcategory.images[0]
          break
        }
      }
      
      // If still no image found, try to get images directly from category folder
      if (categoryImage === '/assets/brand/photo/logo.png') {
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

