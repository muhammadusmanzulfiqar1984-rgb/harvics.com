/**
 * Intelligent Content Population Utility
 * Auto-populates sub-tab pages with relevant content based on:
 * - Product database
 * - User role
 * - Location/Country
 * - Category structure
 */

import { getCategoryInfo } from '@/data/folderBasedProducts'
import { getSubcategoriesForCategory } from '@/utils/folderScanner'

export interface ContentBlock {
  type: 'hero' | 'features' | 'products' | 'cta' | 'info'
  title?: string
  description?: string
  items?: unknown[]
  config?: Record<string, unknown>
}

export interface PageContent {
  hero: {
    title: string
    subtitle: string
    cta?: {
      text: string
      href: string
    }
  }
  sections: ContentBlock[]
  relatedLinks?: Array<{
    text: string
    href: string
  }>
}

/**
 * Get intelligent content for Money sub-tabs
 */
export function getMoneyPageContent(pageKey: string, locale: string = 'en'): PageContent {
  const contentMap: Record<string, PageContent> = {
    'rewards-card': {
      hero: {
        title: 'M&S Rewards Credit Card',
        subtitle: 'Earn rewards on every purchase with our exclusive credit card',
        cta: {
          text: 'Apply Now',
          href: `/${locale}/money/rewards-card/apply`
        }
      },
      sections: [
        {
          type: 'features',
          title: 'Key Benefits',
          items: [
            {
              icon: '💳',
              title: 'Cashback Rewards',
              description: 'Earn up to 5% cashback on all purchases'
            },
            {
              icon: '🎁',
              title: 'Exclusive Offers',
              description: 'Access to special promotions and discounts'
            },
            {
              icon: '✈️',
              title: 'Travel Benefits',
              description: 'Complimentary travel insurance and airport lounge access'
            }
          ]
        },
        {
          type: 'info',
          title: 'How It Works',
          description: 'Simple steps to start earning rewards'
        }
      ]
    },
    'club-rewards': {
      hero: {
        title: 'Club Rewards',
        subtitle: 'Join our exclusive rewards club and unlock amazing benefits',
        cta: {
          text: 'Sign Up Now',
          href: `/${locale}/money/club-rewards/signup`
        }
      },
      sections: [
        {
          type: 'features',
          title: 'Membership Benefits',
          items: [
            {
              icon: '⭐',
              title: 'Points on Every Purchase',
              description: 'Earn points with every transaction'
            },
            {
              icon: '🎂',
              title: 'Birthday Rewards',
              description: 'Special offers on your special day'
            },
            {
              icon: '🚚',
              title: 'Free Shipping',
              description: 'Free shipping on orders over $50'
            }
          ]
        }
      ]
    },
    'savings-investing': {
      hero: {
        title: 'Savings & Investing',
        subtitle: 'Grow your wealth with our range of savings and investment products',
        cta: {
          text: 'Contact Financial Advisor',
          href: `/${locale}/contact`
        }
      },
      sections: [
        {
          type: 'features',
          title: 'Investment Options',
          items: [
            {
              icon: '💰',
              title: 'Savings Accounts',
              description: 'Competitive interest rates on savings accounts'
            },
            {
              icon: '📈',
              title: 'Investment Plans',
              description: 'Diversified investment portfolios for long-term growth'
            },
            {
              icon: '🎯',
              title: 'Retirement Planning',
              description: 'Secure your future with retirement savings plans'
            }
          ]
        }
      ]
    },
    'personal-loans': {
      hero: {
        title: 'Personal Loans',
        subtitle: 'Flexible personal loans to help you achieve your goals',
        cta: {
          text: 'Apply Now',
          href: `/${locale}/money/personal-loans/apply`
        }
      },
      sections: [
        {
          type: 'features',
          title: 'Loan Features',
          items: [
            {
              icon: '💳',
              title: 'Competitive Rates',
              description: 'Interest rates from 3.9% APR'
            },
            {
              icon: '📊',
              title: 'Flexible Terms',
              description: 'Repayment terms from 1-7 years'
            },
            {
              icon: '⚡',
              title: 'Quick Approval',
              description: 'Fast application and approval process'
            }
          ]
        }
      ]
    },
    'financial-support': {
      hero: {
        title: 'Financial Support',
        subtitle: "We're here to help you with your financial needs",
        cta: {
          text: 'Contact Support',
          href: `/${locale}/contact`
        }
      },
      sections: [
        {
          type: 'features',
          title: 'Support Services',
          items: [
            {
              icon: '💬',
              title: 'Financial Counseling',
              description: 'Expert advice on managing your finances'
            },
            {
              icon: '📚',
              title: 'Educational Resources',
              description: 'Learn about financial planning and management'
            },
            {
              icon: '🛠️',
              title: 'Online Tools',
              description: 'Budget calculators and planning tools'
            }
          ]
        }
      ]
    }
    // Add more mappings as needed
  }

  return contentMap[pageKey] || getDefaultPageContent(pageKey)
}

/**
 * Get intelligent content for Sales sub-tabs
 */
export function getSalesPageContent(pageKey: string, locale: string = 'en'): PageContent {
  // This would fetch actual sales data from API/database
  const salesData = {
    'current-sales': {
      totalItems: 156,
      categories: ['Confectionery', 'Beverages', 'Snacks'],
      featuredDiscount: '40% OFF'
    },
    'clearance': {
      totalItems: 89,
      discountRange: '50-70%',
      urgency: 'Limited Stock'
    },
    'seasonal': {
      currentSeason: 'Winter',
      collections: ['Winter Warmers', 'Holiday Specials', 'New Year Deals']
    }
  }

  const data = salesData[pageKey as keyof typeof salesData]

  return {
    hero: {
      title: getSalesTitle(pageKey),
      subtitle: getSalesSubtitle(pageKey, data),
      cta: {
        text: 'Shop Now',
        href: `/${locale}/products`
      }
    },
    sections: [
      {
        type: 'products',
        title: 'Featured Items',
        items: [], // Would be populated from API
        config: {
          showCount: true,
          showDiscount: true,
          limit: 12
        }
      }
    ]
  }
}

/**
 * Get intelligent content for Offers sub-tabs
 */
export function getOffersPageContent(pageKey: string, locale: string = 'en'): PageContent {
  return {
    hero: {
      title: getOffersTitle(pageKey),
      subtitle: getOffersSubtitle(pageKey),
      cta: {
        text: 'View All Offers',
        href: `/${locale}/offers`
      }
    },
    sections: [
      {
        type: 'features',
        title: 'Active Promotions',
        items: getActivePromotions(pageKey)
      }
    ]
  }
}

/**
 * Get intelligent content for Products based on category
 */
export function getProductCategoryContent(categoryKey: string, locale: string = 'en'): PageContent {
  const category = getCategoryInfo(categoryKey)
  const subcategories = getSubcategoriesForCategory(categoryKey)

  return {
    hero: {
      title: category?.name || 'Products',
      subtitle: category?.description || 'Explore our premium product range',
      cta: {
        text: 'View All Products',
        href: `/${locale}/products/${categoryKey}`
      }
    },
    sections: [
      {
        type: 'products',
        title: 'Product Categories',
        items: subcategories.map(sub => ({
          name: sub.name,
          slug: sub.slug,
          imageCount: sub.imageCount,
          href: `/${locale}/products/${categoryKey}/${sub.slug}`
        })),
        config: {
          layout: 'grid',
          columns: 3
        }
      }
    ]
  }
}

/**
 * Get content based on user role (B2C vs B2B)
 */
export function getRoleBasedContent(
  pageKey: string,
  role: 'consumer' | 'distributor' | 'supplier' | 'company',
  locale: string = 'en'
): PageContent {
  const baseContent = getDefaultPageContent(pageKey)

  // Modify content based on role
  if (role === 'distributor' || role === 'supplier') {
    // B2B users see different CTAs and content
    baseContent.hero.cta = {
      text: 'Access Portal',
      href: `/${locale}/portals/${role}`
    }
    baseContent.sections.push({
      type: 'info',
      title: 'Business Benefits',
      description: 'Special pricing and terms for business customers'
    })
  }

  return baseContent
}

// Helper functions
function getDefaultPageContent(pageKey: string): PageContent {
  return {
    hero: {
      title: formatTitle(pageKey),
      subtitle: 'Discover our premium offerings'
    },
    sections: []
  }
}

function formatTitle(key: string): string {
  return key
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getSalesTitle(key: string): string {
  const titles: Record<string, string> = {
    'current-sales': 'Current Sales',
    'clearance': 'Clearance Sale',
    'seasonal': 'Seasonal Sales'
  }
  return titles[key] || 'Sales'
}

function getSalesSubtitle(key: string, data: unknown): string {
  const dataRecord = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : null
  const totalItems = typeof dataRecord?.totalItems === 'number' ? dataRecord.totalItems : 0
  const discountRange = typeof dataRecord?.discountRange === 'string' ? dataRecord.discountRange : '70%'
  const currentSeason = typeof dataRecord?.currentSeason === 'string' ? dataRecord.currentSeason : 'seasonal'
  if (key === 'current-sales') {
    return `Don't miss out on ${totalItems} amazing deals and discounts`
  }
  if (key === 'clearance') {
    return `Final reductions - Up to ${discountRange} off selected items`
  }
  if (key === 'seasonal') {
    return `Shop ${currentSeason} collections with exclusive discounts`
  }
  return 'Discover our latest offers'
}

function getOffersTitle(key: string): string {
  const titles: Record<string, string> = {
    'special-offers': 'Special Offers',
    'promotions': 'Promotions',
    'bulk-orders': 'Bulk Order Discounts'
  }
  return titles[key] || 'Offers'
}

function getOffersSubtitle(key: string): string {
  const subtitles: Record<string, string> = {
    'special-offers': 'Exclusive deals and limited-time promotions',
    'promotions': 'Discover our latest promotions and special deals',
    'bulk-orders': 'Save more when you buy in bulk - Perfect for businesses and retailers'
  }
  return subtitles[key] || 'Discover our amazing offers'
}

function getActivePromotions(key: string): Array<{ icon: string; title: string; description: string }> {
  void key
  // This would fetch from API/database
  return [
    {
      icon: '🎁',
      title: 'Buy 2 Get 1 Free',
      description: 'On selected items'
    },
    {
      icon: '🚚',
      title: 'Free Shipping',
      description: 'On orders over $50'
    }
  ]
}

/**
 * Get footer content structure
 */
export function getFooterContent(locale: string = 'en'): {
  usefulLinks: Array<{ text: string; href: string; description?: string }>
  company: Array<{ text: string; href: string; description?: string }>
  media: Array<{ text: string; href: string; description?: string }>
  investors: Array<{ text: string; href: string; description?: string }>
} {
  return {
    usefulLinks: [
      { text: 'Ask Harvics (FAQs)', href: `/${locale}/faq`, description: 'Find answers to common questions' },
      { text: 'Contact Us', href: `/${locale}/contact`, description: 'Get in touch with our team' },
      { text: 'Search for Jobs', href: `/${locale}/careers`, description: 'Explore career opportunities' },
      { text: 'Sign Up for News', href: `/${locale}/newsletter`, description: 'Stay updated with our latest news' },
      { text: 'Speak Up', href: `/${locale}/compliance`, description: 'Report compliance or ethics concerns' }
    ],
    company: [
      { text: 'About Us', href: `/${locale}/about`, description: 'Learn about our company' },
      { text: 'Global Addresses', href: `/${locale}/locations`, description: 'Find our offices worldwide' },
      { text: 'Strategy', href: `/${locale}/strategy`, description: 'Our business strategy and vision' },
      { text: 'Our Leadership', href: `/${locale}/leadership`, description: 'Meet our leadership team' },
      { text: 'Brands A-Z', href: `/${locale}/products`, description: 'Explore all our brands' },
      { text: 'Our History', href: `/${locale}/history`, description: 'Our journey since 2019' },
      { text: 'Sustainability', href: `/${locale}/csr`, description: 'Our commitment to sustainability' }
    ],
    media: [
      { text: 'News', href: `/${locale}/media/news`, description: 'Latest news and press releases' },
      { text: 'Media Contacts', href: `/${locale}/media/contacts`, description: 'Contact our media team' },
      { text: 'Images', href: `/${locale}/media/images`, description: 'Download high-resolution images' }
    ],
    investors: [
      { text: 'Corporate Governance', href: `/${locale}/investors/governance`, description: 'Governance structure and policies' },
      { text: 'Shares, ADRs & Bonds', href: `/${locale}/investors/shares`, description: 'Stock information and trading' },
      { text: 'Publications', href: `/${locale}/investors/publications`, description: 'Financial reports and documents' }
    ]
  }
}

/**
 * Get footer page content
 */
export function getFooterPageContent(pageKey: string, locale: string = 'en'): PageContent {
  const contentMap: Record<string, PageContent> = {
    'faq': {
      hero: {
        title: 'Frequently Asked Questions',
        subtitle: 'Find answers to common questions about Harvics',
        cta: {
          text: 'Contact Support',
          href: `/${locale}/contact`
        }
      },
      sections: [
        {
          type: 'info',
          title: 'Common Questions',
          items: [
            { question: 'What products does Harvics offer?', answer: 'We offer a wide range of premium food products including confectionery, beverages, snacks, and more.' },
            { question: 'Where can I buy Harvics products?', answer: 'Our products are available in retail stores across 40+ countries. Use our store locator to find a retailer near you.' }
          ]
        }
      ]
    },
    'careers': {
      hero: {
        title: 'Careers at Harvics',
        subtitle: 'Join our team and help shape the future of premium consumer goods',
        cta: {
          text: 'View Open Positions',
          href: `/${locale}/careers/positions`
        }
      },
      sections: [
        {
          type: 'features',
          title: 'Why Work With Us',
          items: [
            { icon: '🌍', title: 'Global Opportunities', description: 'Work across 40+ countries' },
            { icon: '💼', title: 'Career Growth', description: 'Professional development programs' },
            { icon: '⚖️', title: 'Work-Life Balance', description: 'Flexible working arrangements' }
          ]
        }
      ]
    },
    'newsletter': {
      hero: {
        title: 'Stay Connected',
        subtitle: 'Subscribe to receive the latest news, offers, and updates from Harvics',
        cta: {
          text: 'Subscribe Now',
          href: `/${locale}/newsletter/subscribe`
        }
      },
      sections: []
    }
  }

  return contentMap[pageKey] || getDefaultPageContent(pageKey)
}

/**
 * Get related links for cross-linking
 */
export function getRelatedLinks(pageKey: string, section: string): Array<{ text: string; href: string }> {
  const linkMap: Record<string, Array<{ text: string; href: string }>> = {
    'money/rewards-card': [
      { text: 'Club Rewards', href: '/money/club-rewards' },
      { text: 'Our Credit Cards', href: '/money/credit-cards' }
    ],
    'sales/current-sales': [
      { text: 'Clearance', href: '/sales/clearance' },
      { text: 'Seasonal Sales', href: '/sales/seasonal' }
    ]
  }

  return linkMap[`${section}/${pageKey}`] || []
}
