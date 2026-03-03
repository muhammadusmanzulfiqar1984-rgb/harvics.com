export interface ProductCategory {
  name: string
  icon: string
  href: string
  image: string
  description: string
  color: string
}

// Type for translation function
type TranslationFunction = (key: string) => string

export const getProductCategories = (t: TranslationFunction, locale: string): ProductCategory[] => [
  { 
    name: t('products.beverages'), 
    icon: '🥤', 
    href: `/${locale}/products/beverages`,
    image: '/Images/Beverages/Flavored%20milk/WhatsApp%20Image%202025-09-17%20at%2012.44.40%20AM.jpeg',
    description: t('products.beveragesDesc'),
    color: 'from-cyan-500 to-blue-500'
  },
  { 
    name: t('products.confectionery'), 
    icon: '🍬', 
    href: `/${locale}/products/confectionery`,
    image: '/Images/Confectionary/4369d6f1-c1c3-41be-be7b-76372de99401.JPG',
    description: t('products.confectioneryDesc'),
    color: 'from-pink-500 to-red-500'
  },
  { 
    name: t('products.snacks'), 
    icon: '🍿', 
    href: `/${locale}/products/snacks`,
    image: '/Images/4a1969df-20da-4289-b344-9b14313efe98.JPG',
    description: t('products.snacksDesc'),
    color: 'from-white to-orange-500'
  },
  { 
    name: t('products.pasta'), 
    icon: '🍝', 
    href: `/${locale}/products/pasta`,
    image: '/Images/f28925d1-0064-4d80-8223-08b420869965.JPG',
    description: t('products.pastaDesc'),
    color: 'from-red-500 to-pink-500'
  },
  { 
    name: t('products.bakery'), 
    icon: '🥖', 
    href: `/${locale}/products/bakery`,
    image: '/Images/Bakery/2844c337-e8e4-40f5-be1e-0545a4f1055f.JPG',
    description: t('products.bakeryDesc'),
    color: 'from-amber-500 to-orange-500'
  },
  { 
    name: t('products.culinary'), 
    icon: '🍽️', 
    href: `/${locale}/products/culinary`,
    image: '/Images/a86ea5cf-ff7f-46b2-8e58-e6f4eb7a882e.JPG',
    description: t('products.culinaryDesc'),
    color: 'from-orange-500 to-white'
  },
  { 
    name: t('products.frozenFoods'), 
    icon: '🧊', 
    href: `/${locale}/products/frozenFoods`,
    image: '/Images/1ef0fde6-f142-4628-ae70-83bd55148225.JPG',
    description: t('products.frozenFoodsDesc'),
    color: 'from-blue-500 to-cyan-500'
  }
]
