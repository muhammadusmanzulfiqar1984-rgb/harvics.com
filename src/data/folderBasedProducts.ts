// Dynamic product data based on actual folder structure in public/Images/Harvics.com
// Server-only module - folderScanner uses Node.js fs
import 'server-only'
import { 
  getAllCategories, 
  getCategoryInfo as getCategoryDataFromFolder, 
  getSubcategoriesForCategory as getSubcategoriesFromFolder,
  getImagesForSubcategory,
  type CategoryData,
  type Subcategory
} from '@/utils/folderScanner'

export interface Product {
  name: string
  image: string
  subcategory?: string
  productLine?: string
  description?: string
  weight?: string
}

export interface ProductCategory {
  name: string
  key: string
  icon: string
  image: string
  description: string
  color: string
  url: string
  subcategories: string[]
  products: Product[]
}

// Based on actual folder structure in public/Images/Harvics.com
export const getFolderBasedCategories = (): ProductCategory[] => {
  try {
    const folderCategories = getAllCategories()
    
    return folderCategories.map(category => ({
      name: category.name,
      key: category.key,
      icon: category.icon,
      image: category.image || '/Images/logo.png',
      description: category.description,
      color: category.color,
      url: `/products/${category.key}`,
      subcategories: category.subcategories.map(sub => sub.slug),
      products: [] // Products are now loaded per subcategory
    }))
  } catch (error) {
    console.error('Error getting folder-based categories:', error)
    return []
  }
}

// Get products for a specific category (legacy - now returns empty, use subcategory instead)
export const getProductsForCategory = (categoryKey: string): Product[] => {
  // Products are now loaded per subcategory
  return []
}

// Get subcategories for a specific category
export const getSubcategoriesForCategory = (categoryKey: string): string[] => {
  const subcategories = getSubcategoriesFromFolder(categoryKey)
  return subcategories.map(sub => sub.slug)
}

// Get category info
export const getCategoryInfo = (categoryKey: string): ProductCategory | null => {
  const categoryData = getCategoryDataFromFolder(categoryKey)
  if (!categoryData) return null
  
  return {
    name: categoryData.name,
    key: categoryData.key,
    icon: categoryData.icon,
    image: categoryData.image,
    description: categoryData.description,
    color: categoryData.color,
    url: `/products/${categoryData.key}`,
    subcategories: categoryData.subcategories.map(sub => sub.slug),
    products: []
  }
}
