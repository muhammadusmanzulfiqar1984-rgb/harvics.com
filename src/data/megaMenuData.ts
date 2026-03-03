/**
 * HARVICS MEGA MENU DATA
 * Ported from Supreme's megaData.json
 * Powers the header mega dropdown navigation across all 10 industry verticals
 */

export interface MegaMenuBlock {
  title: string
  items: string[]
}

export interface NavVertical {
  key: string
  label: string
  href: string
  blocks: MegaMenuBlock[]
}

export const megaMenuData: Record<string, MegaMenuBlock[]> = {
  textiles: [
    { title: 'Apparel', items: ["Men's Wear", "Ladies' Wear", "Kids' Wear", 'Sportswear'] },
    { title: 'Home Textiles', items: ['Bed Linen', 'Bath Linen', 'Curtains', 'Kitchen'] },
    { title: 'Fabrics', items: ['Cotton', 'Polyester', 'Blends', 'Denim'] },
    { title: 'Accessories', items: ['Scarves', 'Bags', 'Belts', 'Shoes'] },
  ],
  fmcg: [
    { title: 'Food', items: ['Grains', 'Spices', 'Snacks', 'Beverages'] },
    { title: 'Personal Care', items: ['Skincare', 'Haircare', 'Hygiene', 'Cosmetics'] },
    { title: 'Home Care', items: ['Detergents', 'Cleaners', 'Paper', 'Tools'] },
    { title: 'Distribution', items: ['Retail', 'Wholesale', 'Logistics', 'Storage'] },
  ],
  commodities: [
    { title: 'Agri', items: ['Wheat', 'Rice', 'Corn', 'Soybeans'] },
    { title: 'Energy', items: ['Crude Oil', 'Natural Gas', 'LNG'] },
    { title: 'Softs', items: ['Coffee', 'Cocoa', 'Sugar', 'Cotton'] },
    { title: 'Metals', items: ['Steel', 'Copper', 'Aluminum'] },
  ],
  industrial: [
    { title: 'Chemicals', items: ['Polymers', 'Acids', 'Solvents'] },
    { title: 'Machinery', items: ['Textile', 'Food Processing', 'Packaging'] },
    { title: 'Safety', items: ['PPE', 'Lockout', 'Fire'] },
    { title: 'MRO', items: ['Bearings', 'Belts', 'Tools'] },
  ],
  minerals: [
    { title: 'Metals', items: ['Iron Ore', 'Copper', 'Aluminum', 'Zinc'] },
    { title: 'Energy', items: ['Coal', 'Uranium', 'Lithium'] },
    { title: 'Precious', items: ['Gold', 'Silver', 'Platinum'] },
    { title: 'Industrial', items: ['Sand', 'Gravel', 'Limestone'] },
  ],
  'oil-gas': [
    { title: 'Upstream', items: ['Exploration', 'Drilling', 'OSV'] },
    { title: 'Midstream', items: ['Pipelines', 'Storage', 'Terminals'] },
    { title: 'Downstream', items: ['Refining', 'Trading', 'Distribution'] },
    { title: 'Services', items: ['EPC', 'HSE', 'Inspection'] },
  ],
  'real-estate': [
    { title: 'Commercial', items: ['Offices', 'Retail', 'Mixed Use'] },
    { title: 'Residential', items: ['Apartments', 'Villas', 'Community'] },
    { title: 'Industrial', items: ['Warehouses', 'Parks', 'SEZ'] },
    { title: 'Services', items: ['FM', 'Leasing', 'Advisory'] },
  ],
  sourcing: [
    { title: 'Global Sourcing', items: ['Supplier Discovery', 'Vetting', 'Negotiation'] },
    { title: 'Quality Control', items: ['Inspections', 'Audits', 'Testing'] },
    { title: 'Logistics', items: ['Freight', 'Customs', 'Warehousing'] },
    { title: 'Consulting', items: ['Strategy', 'Optimization', 'Risk Management'] },
  ],
  finance: [
    { title: 'Trade Finance', items: ['LC', 'SBLC', 'Forfaiting'] },
    { title: 'HPay', items: ['Wallets', 'Payments', 'Gateway'] },
    { title: 'Invoicing', items: ['Bills', 'Reconciliation', 'Reports'] },
    { title: 'Risk', items: ['KYC', 'AML', 'Scoring'] },
  ],
  ai: [
    { title: 'AI Solutions', items: ['Forecasting', 'Vision', 'Chat'] },
    { title: 'Data', items: ['Pipelines', 'Warehouses', 'APIs'] },
    { title: 'Integration', items: ['ERP', 'E-commerce', 'Mobile'] },
    { title: 'Support', items: ['SLAs', 'Training', 'Docs'] },
  ],
}

export const navVerticals: NavVertical[] = [
  { key: 'textiles', label: 'Textiles & Apparels', href: '/textiles', blocks: megaMenuData.textiles },
  { key: 'fmcg', label: 'FMCG', href: '/fmcg', blocks: megaMenuData.fmcg },
  { key: 'commodities', label: 'Commodities', href: '/commodities', blocks: megaMenuData.commodities },
  { key: 'industrial', label: 'Industrial Solutions', href: '/industrial', blocks: megaMenuData.industrial },
  { key: 'minerals', label: 'Minerals', href: '/minerals', blocks: megaMenuData.minerals },
  { key: 'oil-gas', label: 'Oil & Gas', href: '/oil-gas', blocks: megaMenuData['oil-gas'] },
  { key: 'real-estate', label: 'Real Estate', href: '/real-estate', blocks: megaMenuData['real-estate'] },
  { key: 'sourcing', label: 'Sourcing Solutions', href: '/sourcing', blocks: megaMenuData.sourcing },
  { key: 'finance', label: 'Finance & HPay', href: '/finance', blocks: megaMenuData.finance },
  { key: 'ai', label: 'AI & Technology', href: '/ai', blocks: megaMenuData.ai },
]

/** Helper: slugify for URL generation */
export const slugify = (text: string): string =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
