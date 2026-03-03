import { NavigationMenu, ServiceInfo, FooterColumn, PaymentMethod } from './navigation.types'

// M&S Foods Style Navigation Data
export const navigationMenus: Record<string, NavigationMenu> = {
  'en': {
    id: 'main-nav-en',
    name: 'Main Navigation',
    locale: 'en',
    sections: [
      {
        id: 'gender-section',
        title: 'Shop by Gender',
        type: 'text',
        items: [
          { id: 'women', label: 'Women', href: '/products/women', category: 'gender', order: 1 },
          { id: 'lingerie', label: 'Lingerie', href: '/products/lingerie', category: 'gender', order: 2 },
          { id: 'men', label: 'Men', href: '/products/men', category: 'gender', order: 3 },
          { id: 'kids', label: 'Kids', href: '/products/kids', category: 'gender', order: 4 }
        ]
      },
      {
        id: 'product-section',
        title: 'Shop by Product',
        type: 'text',
        items: [
          { id: 'home', label: 'Home', href: '/products/home', category: 'product', order: 1 },
          { id: 'beauty', label: 'Beauty', href: '/products/beauty', category: 'product', order: 2 },
          { id: 'flowers', label: 'Flowers', href: '/products/flowers', category: 'product', order: 3 },
          { id: 'gifts', label: 'Gifts', href: '/products/gifts', category: 'product', order: 4 },
          { id: 'sports', label: 'Sports', href: '/products/sports', category: 'product', order: 5 },
          { id: 'food', label: 'Food', href: '/products/food', category: 'product', order: 6 }
        ]
      },
      {
        id: 'special-section',
        title: 'Special Offers',
        type: 'text',
        items: [
          { id: 'offers', label: 'Offers', href: '/offers', category: 'special', order: 1, featured: true },
          { id: 'sale', label: 'Sale', href: '/sale', category: 'special', order: 2, featured: true }
        ]
      }
    ]
  }
}

// M&S Foods Style Mega Menu for Food Category
export const foodMegaMenu: NavigationMenu = {
  id: 'food-mega-menu',
  name: 'Food Mega Menu',
  sections: [
    {
      id: 'visual-nav',
      title: 'Quick Access',
      type: 'visual',
      items: [
        {
          id: 'food-inspiration',
          label: 'Food Inspiration',
          href: '/food/inspiration',
          image: '/Images/food-inspiration.jpg',
          category: 'product',
          order: 1
        },
        {
          id: 'food-in-store',
          label: 'Food in Store',
          href: '/food/in-store',
          image: '/Images/food-in-store.jpg',
          category: 'product',
          order: 2
        },
        {
          id: 'food-drink-gifts',
          label: 'Food & Drink Gifts',
          href: '/food/gifts',
          image: '/Images/food-gifts.jpg',
          category: 'product',
          order: 3
        },
        {
          id: 'christmas-food',
          label: 'Christmas Food To Order',
          href: '/food/christmas',
          image: '/Images/christmas-food.jpg',
          category: 'product',
          order: 4
        },
        {
          id: 'recipes',
          label: 'M&S Recipes',
          href: '/food/recipes',
          image: '/Images/recipes.jpg',
          category: 'product',
          order: 5
        },
        {
          id: 'tom-kerridge',
          label: 'M&S X Tom Kerridge',
          href: '/food/tom-kerridge',
          image: '/Images/tom-kerridge.jpg',
          category: 'product',
          order: 6
        },
        {
          id: 'cafe',
          label: 'M&S Café',
          href: '/food/cafe',
          image: '/Images/cafe.jpg',
          category: 'product',
          order: 7
        }
      ]
    },
    {
      id: 'text-nav-col1',
      title: 'Christmas Food',
      type: 'text',
      columns: 1,
      items: [
        { id: 'christmas-order', label: 'Christmas Food to Order', href: '/food/christmas/order', category: 'product', order: 1 },
        { id: 'top-picks', label: 'Our Top Picks', href: '/food/christmas/top-picks', category: 'product', order: 2 },
        { id: 'turkey-guide', label: "Tom Kerridge's turkey guide", href: '/food/christmas/turkey-guide', category: 'product', order: 3 }
      ]
    },
    {
      id: 'text-nav-col2',
      title: 'Food Online',
      type: 'text',
      columns: 1,
      items: [
        { id: 'cakes', label: 'Cakes', href: '/food/online/cakes', category: 'product', order: 1 },
        { id: 'party-food', label: 'Party Food', href: '/food/online/party', category: 'product', order: 2 },
        { id: 'sandwich-platters', label: 'Sandwich Platters', href: '/food/online/sandwiches', category: 'product', order: 3 }
      ]
    },
    {
      id: 'text-nav-col3',
      title: 'Food & Drink Gifts',
      type: 'text',
      columns: 1,
      items: [
        { id: 'alcohol-gifts', label: 'Alcohol Gifts', href: '/food/gifts/alcohol', category: 'product', order: 1 },
        { id: 'brownies', label: 'Brownies', href: '/food/gifts/brownies', category: 'product', order: 2 },
        { id: 'christmas-hampers', label: 'Christmas Hampers', href: '/food/gifts/hampers/christmas', category: 'product', order: 3 },
        { id: 'food-gifts', label: 'Food Gifts', href: '/food/gifts', category: 'product', order: 4 },
        { id: 'hampers', label: 'Hampers', href: '/food/gifts/hampers', category: 'product', order: 5 },
        { id: 'letterbox-gifts', label: 'Letterbox Gifts', href: '/food/gifts/letterbox', category: 'product', order: 6 }
      ]
    },
    {
      id: 'text-nav-col4',
      title: 'Cooking & Dining',
      type: 'text',
      columns: 1,
      items: [
        { id: 'tom-kerridge-link', label: 'M&S x Tom Kerridge', href: '/food/tom-kerridge', category: 'product', order: 1 },
        { id: 'kitchenware', label: 'Kitchenware', href: '/food/kitchenware', category: 'product', order: 2 },
        { id: 'pots-pans', label: 'Pots & Pans', href: '/food/kitchenware/pots-pans', category: 'product', order: 3 }
      ]
    },
    {
      id: 'text-nav-col5',
      title: 'Food In Store',
      type: 'text',
      columns: 1,
      items: [
        { id: 'christmas-groceries', label: 'Christmas Groceries', href: '/food/store/christmas', category: 'product', order: 1 },
        { id: 'drinks', label: 'Drinks', href: '/food/store/drinks', category: 'product', order: 2 },
        { id: 'food-cupboard', label: 'Food Cupboard', href: '/food/store/cupboard', category: 'product', order: 3 },
        { id: 'frozen-food', label: 'Frozen Food', href: '/food/store/frozen', category: 'product', order: 4 },
        { id: 'fruit-veg', label: 'Fruit & Vegetables', href: '/food/store/fruit-veg', category: 'product', order: 5 },
        { id: 'dine-in', label: 'Home of Dine In', href: '/food/store/dine-in', category: 'product', order: 6 },
        { id: 'meat', label: 'Meat', href: '/food/store/meat', category: 'product', order: 7 },
        { id: 'new-in', label: 'New In Foodhall', href: '/food/store/new', category: 'product', order: 8 },
        { id: 'poultry', label: 'Poultry', href: '/food/store/poultry', category: 'product', order: 9 },
        { id: 'ready-cook', label: 'Ready to Cook', href: '/food/store/ready-cook', category: 'product', order: 10 }
      ]
    },
    {
      id: 'text-nav-col6',
      title: 'Food Inspiration',
      type: 'text',
      columns: 1,
      items: [
        { id: 'best-season', label: 'Best in Season', href: '/food/inspiration/season', category: 'product', order: 1 },
        { id: 'budget', label: 'Budget', href: '/food/inspiration/budget', category: 'product', order: 2 },
        { id: 'christmas-ideas', label: 'Christmas Ideas', href: '/food/inspiration/christmas', category: 'product', order: 3 },
        { id: 'christmas-ad', label: 'Christmas Food Ad', href: '/food/inspiration/ad', category: 'product', order: 4 },
        { id: 'cooking-tips', label: 'Cooking Tips', href: '/food/inspiration/tips', category: 'product', order: 5 },
        { id: 'foodhall-picks', label: 'Foodhall Picks', href: '/food/inspiration/picks', category: 'product', order: 6 },
        { id: 'health', label: 'Health', href: '/food/inspiration/health', category: 'product', order: 7 },
        { id: 'cafe-link', label: 'M&S Café', href: '/food/cafe', category: 'product', order: 8 }
      ]
    },
    {
      id: 'text-nav-col7',
      title: 'M&S Recipes',
      type: 'text',
      columns: 1,
      items: [
        { id: 'budget-recipes', label: 'Budget Recipes', href: '/food/recipes/budget', category: 'product', order: 1 },
        { id: 'christmas-recipes', label: 'Christmas Recipes', href: '/food/recipes/christmas', category: 'product', order: 2 },
        { id: 'dinner-recipes', label: 'Dinner Recipes', href: '/food/recipes/dinner', category: 'product', order: 3 },
        { id: 'healthy-recipes', label: 'Healthy Recipes', href: '/food/recipes/healthy', category: 'product', order: 4 },
        { id: 'midweek-recipes', label: 'Midweek Meal Recipes', href: '/food/recipes/midweek', category: 'product', order: 5 },
        { id: 'winter-recipes', label: 'Winter Recipes', href: '/food/recipes/winter', category: 'product', order: 6 }
      ]
    }
  ]
}

// Service Information (Free Delivery, Free Store Collection, Free Returns)
export const serviceInfo: ServiceInfo[] = [
  {
    id: 'free-delivery',
    title: 'Free delivery',
    description: 'Free delivery when you spend over £60*',
    icon: 'shopping-bag',
    link: '/delivery',
    order: 1
  },
  {
    id: 'free-collection',
    title: 'Free store collection',
    description: 'Free store collection',
    icon: 'delivery-van',
    link: '/collection',
    order: 2
  },
  {
    id: 'free-returns',
    title: 'Free returns',
    description: 'Free returns',
    icon: 'return-arrow',
    link: '/returns',
    order: 3
  }
]

// Footer Columns - M&S Foods Pattern
export const footerColumns: FooterColumn[] = [
  {
    id: 'here-to-help',
    title: 'Here to Help',
    order: 1,
    links: [
      { id: 'help-contact', label: 'Help & contact us', href: '/help', order: 1 },
      { id: 'our-stores', label: 'Our stores', href: '/stores', order: 2 },
      { id: 'accessibility', label: 'Accessibility in our stores', href: '/accessibility', order: 3 },
      { id: 'product-recalls', label: 'Product recalls', href: '/recalls', order: 4 },
      { id: 'sitemap', label: 'Site map', href: '/sitemap', order: 5 }
    ]
  },
  {
    id: 'delivery-returns',
    title: 'Delivery & Returns',
    order: 2,
    links: [
      { id: 'where-order', label: "Where's my order?", href: '/track-order', order: 1 },
      { id: 'delivery-collection', label: 'Delivery & collection', href: '/delivery', order: 2 },
      { id: 'guest-tracking', label: 'Guest order tracking', href: '/track-guest', order: 3 },
      { id: 'guest-return', label: 'Guest order return', href: '/return-guest', order: 4 },
      { id: 'returns-refunds', label: 'Returns & refunds', href: '/returns', order: 5 }
    ]
  },
  {
    id: 'shopping-with-us',
    title: 'Shopping with Us',
    order: 3,
    links: [
      { id: 'sparks', label: 'Sparks', href: '/sparks', order: 1 },
      { id: 'sparks-faq', label: 'Sparks FAQs', href: '/sparks/faq', order: 2 },
      { id: 'gift-card', label: 'Gift card balance', href: '/gift-card', order: 3 },
      { id: 'size-guides', label: 'Size guides', href: '/size-guides', order: 4 },
      { id: 'sustainability', label: 'Sustainability', href: '/sustainability', order: 5 }
    ]
  },
  {
    id: 'more-from-harvics',
    title: 'More from Harvics',
    order: 4,
    links: [
      { id: 'corporate-site', label: 'Corporate site', href: '/corporate', order: 1 },
      { id: 'corporate-gifts', label: 'Harvics Corporate Gifts', href: '/corporate/gifts', order: 2 },
      { id: 'careers', label: 'Careers', href: '/careers', order: 3 },
      { id: 'investor-relations', label: 'Investor Relations', href: '/investor-relations', order: 4 },
      { id: 'portals', label: 'Portals', href: '/portals', order: 5 }
    ]
  }
]

// Payment Methods
export const paymentMethods: PaymentMethod[] = [
  { id: 'visa', name: 'VISA', logo: '/Images/payments/visa.svg', type: 'card', enabled: true },
  { id: 'mastercard', name: 'Mastercard', logo: '/Images/payments/mastercard.svg', type: 'card', enabled: true },
  { id: 'amex', name: 'American Express', logo: '/Images/payments/amex.svg', type: 'card', enabled: true },
  { id: 'apple-pay', name: 'Apple Pay', logo: '/Images/payments/apple-pay.svg', type: 'digital', enabled: true },
  { id: 'paypal', name: 'PayPal', logo: '/Images/payments/paypal.svg', type: 'digital', enabled: true }
]



