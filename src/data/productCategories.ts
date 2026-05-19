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
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&h=600&fit=crop&q=70',
    description: t('products.beveragesDesc'),
    color: 'from-cyan-500 to-blue-500'
  },
  { 
    name: t('products.confectionery'), 
    icon: '🍬', 
    href: `/${locale}/products/confectionery`,
    image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=800&h=600&fit=crop&q=70',
    description: t('products.confectioneryDesc'),
    color: 'from-pink-500 to-red-500'
  },
  { 
    name: t('products.snacks'), 
    icon: '🍿', 
    href: `/${locale}/products/snacks`,
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&h=600&fit=crop&q=70',
    description: t('products.snacksDesc'),
    color: 'from-white to-orange-500'
  },
  { 
    name: t('products.pasta'), 
    icon: '🍝', 
    href: `/${locale}/products/pasta`,
    image: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=800&h=600&fit=crop&q=70',
    description: t('products.pastaDesc'),
    color: 'from-red-500 to-pink-500'
  },
  { 
    name: t('products.bakery'), 
    icon: '🥖', 
    href: `/${locale}/products/bakery`,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop&q=70',
    description: t('products.bakeryDesc'),
    color: 'from-amber-500 to-orange-500'
  },
  { 
    name: t('products.culinary'), 
    icon: '🍽️', 
    href: `/${locale}/products/culinary`,
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop&q=70',
    description: t('products.culinaryDesc'),
    color: 'from-orange-500 to-white'
  },
  { 
    name: t('products.frozenFoods'), 
    icon: '🧊', 
    href: `/${locale}/products/frozenFoods`,
    image: 'https://images.unsplash.com/photo-1530025809667-1f4bcff8e60f?w=800&h=600&fit=crop&q=70',
    description: t('products.frozenFoodsDesc'),
    color: 'from-blue-500 to-cyan-500'
  }
]
