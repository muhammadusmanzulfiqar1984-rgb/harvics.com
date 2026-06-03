/**
 * HARVICS PRODUCT CATALOG
 * Ported from Supreme's product-data.js
 * Complete product catalog across all 10 industry verticals
 */

import { getLeafImage } from './leafImageMap'

export interface Product {
  name: string
  keywords: string
  price: string
  desc?: string
  icon?: string
}

export interface VerticalCatalog {
  [subcategory: string]: Product[] | Product
}

export const productCatalog = {
  // 1. TEXTILES & APPAREL
  textiles: {
    men: [
      { name: 'Formal Suit (3-piece)', keywords: 'suit,men', price: '$120 - $250' },
      { name: 'Casual Denim Shirt', keywords: 'denim,shirt,men', price: '$25 - $45' },
      { name: 'Polo T-Shirt', keywords: 'polo,shirt,men', price: '$15 - $30' },
      { name: 'Leather Jacket', keywords: 'leather,jacket,men', price: '$80 - $150' },
      { name: 'Chinos (Skinny/Slim/Tapered)', keywords: 'chinos,men', price: '$25 - $55' },
      { name: 'Jeans (Skinny to Loose)', keywords: 'jeans,men', price: '$30 - $70' },
      { name: 'Merino Knitwear', keywords: 'merino,knitwear,men', price: '$35 - $90' },
      { name: 'Blazer (Linen/Moleskin/Jersey)', keywords: 'blazer,men', price: '$80 - $180' },
      { name: 'Wool Overcoat', keywords: 'overcoat,wool,men', price: '$120 - $260' },
      { name: 'Parkas with Stormwear', keywords: 'parka,stormwear,men', price: '$90 - $200' },
      { name: 'Easy-Iron Shirts (3-pack)', keywords: 'shirts,pack,men', price: '$40 - $80' },
      { name: 'Technical Sportswear', keywords: 'sportswear,technical,men', price: '$25 - $60' },
      { name: 'Trainers & Boots', keywords: 'trainers,boots,men', price: '$45 - $120' },
      { name: 'Loungewear & Pyjamas', keywords: 'loungewear,pyjamas,men', price: '$20 - $60' },
      { name: 'Fleece Dressing Gown', keywords: 'dressing-gown,men', price: '$35 - $75' },
    ],
    women: [
      { name: 'Evening Gown', keywords: 'gown,dress,women', price: '$150 - $300' },
      { name: 'Summer Floral Dress', keywords: 'floral,dress,women', price: '$35 - $60' },
      { name: 'Silk Blouse', keywords: 'silk,blouse,women', price: '$40 - $70' },
      { name: 'Designer Handbag', keywords: 'handbag,fashion', price: '$50 - $120' },
      { name: 'Balcony/Plunge Bras', keywords: 'bra,lingerie,women', price: '$25 - $60' },
      { name: 'Seamless & Cotton Knickers', keywords: 'knickers,lingerie,women', price: '$10 - $30' },
      { name: 'Shapewear (Slips/Bodysuits)', keywords: 'shapewear,lingerie,women', price: '$20 - $50' },
      { name: 'Sports Bras (High Support)', keywords: 'sports-bra,lingerie,women', price: '$25 - $55' },
      { name: 'Tights & Socks', keywords: 'tights,socks,women', price: '$8 - $25' },
      { name: 'Nightwear & Loungewear', keywords: 'nightwear,loungewear,women', price: '$20 - $60' },
    ],
    kids: [
      { name: 'Boys Cotton T-Shirt', keywords: 'boy,tshirt', price: '$10 - $20' },
      { name: 'Girls Party Dress', keywords: 'girl,dress', price: '$25 - $45' },
      { name: 'Denim Jeans', keywords: 'jeans,kids', price: '$18 - $30' },
      { name: 'School Uniform Set', keywords: 'uniform,school', price: '$30 - $50' },
      { name: 'Winter Hoodie', keywords: 'hoodie,kids', price: '$22 - $40' },
      { name: 'Soft Cotton Pajamas', keywords: 'pajamas,kids', price: '$15 - $25' },
      { name: 'School Shoes', keywords: 'shoes,school', price: '$25 - $40' },
      { name: 'Sneakers', keywords: 'sneakers,kids', price: '$20 - $35' },
    ],
    home: [
      { name: 'Luxury Bed Sheet Set', keywords: 'bedsheet,bedroom', price: '$30 - $60' },
      { name: 'Cotton Bath Towels', keywords: 'towel,bathroom', price: '$12 - $25' },
      { name: 'Decorative Cushions', keywords: 'cushion,decor', price: '$15 - $30' },
      { name: 'Kitchen Apron', keywords: 'apron,kitchen', price: '$10 - $18' },
    ],
  },

  // 2. FMCG
  fmcg: {
    staples: [
      { name: 'Premium Basmati Rice', keywords: 'rice,basmati,grain', price: '$1.50/kg' },
      { name: 'Wheat Flour (Atta)', keywords: 'flour,wheat', price: '$0.80/kg' },
      { name: 'Red Lentils (Masoor)', keywords: 'lentils,red', price: '$1.20/kg' },
      { name: 'Organic Oats', keywords: 'oats,grain', price: '$2.50/kg' },
    ],
    oils: [
      { name: 'Sunflower Oil', keywords: 'oil,sunflower,bottle', price: '$2.00/L' },
      { name: 'Extra Virgin Olive Oil', keywords: 'olive,oil', price: '$8.00/L' },
      { name: 'Pure Ghee', keywords: 'ghee,butter', price: '$10.00/kg' },
      { name: 'Whole Spices Mix', keywords: 'spices,bowl', price: '$15.00/kg' },
    ],
    packaged: [
      { name: 'Instant Noodles', keywords: 'noodles,bowl', price: '$0.50/pack' },
      { name: 'Chocolate Chip Cookies', keywords: 'cookies,chocolate', price: '$1.20/pack' },
      { name: 'Potato Chips', keywords: 'chips,snack', price: '$0.80/pack' },
      { name: 'Canned Sweet Corn', keywords: 'corn,canned', price: '$1.00/can' },
    ],
    dairy: [
      { name: 'UHT Milk', keywords: 'milk,carton', price: '$1.10/L' },
      { name: 'Cheddar Cheese', keywords: 'cheese,block', price: '$5.00/block' },
      { name: 'Fruit Juice Nectar', keywords: 'juice,glass', price: '$1.50/L' },
      { name: 'Instant Coffee', keywords: 'coffee,jar', price: '$6.00/jar' },
    ],
    personalCare: [
      { name: 'Herbal Toothpaste', keywords: 'toothpaste,tube', price: '$2.00' },
      { name: 'Moisturizing Soap', keywords: 'soap,bar', price: '$1.00' },
      { name: 'Shampoo', keywords: 'shampoo,bottle', price: '$3.50' },
    ],
    homeCare: [
      { name: 'Laundry Detergent', keywords: 'detergent,laundry', price: '$4.00' },
      { name: 'Dishwashing Liquid', keywords: 'dishwashing,liquid', price: '$1.50' },
    ],
  },

  // 3. COMMODITIES
  commodities: {
    energy: [
      { name: 'Crude Oil (Brent / WTI)', keywords: 'oil,rig,ocean', price: 'Market Price' },
      { name: 'Natural Gas (LNG)', keywords: 'gas,tanker,ship', price: 'Market Price' },
      { name: 'Thermal Coal', keywords: 'coal,mine', price: 'Market Price' },
      { name: 'Refined Diesel', keywords: 'fuel,truck', price: 'Market Price' },
    ],
    metals: [
      { name: 'Gold Bullion', keywords: 'gold,bars', price: 'Market Price' },
      { name: 'Silver Ingots', keywords: 'silver,metal', price: 'Market Price' },
      { name: 'Copper Cathodes', keywords: 'copper,industrial', price: 'Market Price' },
      { name: 'Aluminum Ingots', keywords: 'aluminum,metal', price: 'Market Price' },
      { name: 'Iron Ore', keywords: 'iron,ore,mining', price: 'Market Price' },
      { name: 'Steel Rebar', keywords: 'steel,construction', price: 'Market Price' },
    ],
    agri: [
      { name: 'Wheat Grain', keywords: 'wheat,field', price: 'Market Price' },
      { name: 'White Rice', keywords: 'rice,bowl', price: 'Market Price' },
      { name: 'Yellow Corn', keywords: 'corn,field', price: 'Market Price' },
      { name: 'Soybeans', keywords: 'soybean,field', price: 'Market Price' },
      { name: 'Raw Sugar', keywords: 'sugar,cane', price: 'Market Price' },
    ],
    edibleOils: [
      { name: 'Palm Oil', keywords: 'palm,oil', price: 'Market Price' },
      { name: 'Soybean Oil', keywords: 'soybean,oil', price: 'Market Price' },
      { name: 'Sunflower Oil', keywords: 'sunflower,oil', price: 'Market Price' },
      { name: 'Coffee Beans', keywords: 'coffee,beans', price: 'Market Price' },
      { name: 'Cocoa Beans', keywords: 'cocoa,beans', price: 'Market Price' },
    ],
    industrialChem: [
      { name: 'Urea Fertilizer', keywords: 'fertilizer,farm', price: 'Market Price' },
      { name: 'DAP / Potash', keywords: 'fertilizer,chemical', price: 'Market Price' },
      { name: 'Phosphate Rock', keywords: 'rock,mining', price: 'Market Price' },
      { name: 'Industrial Salt', keywords: 'salt,pile', price: 'Market Price' },
      { name: 'Sulphur', keywords: 'sulphur,yellow', price: 'Market Price' },
    ],
    protein: [
      { name: 'Frozen Beef', keywords: 'beef,steak', price: 'Market Price' },
      { name: 'Frozen Poultry', keywords: 'chicken,meat', price: 'Market Price' },
      { name: 'Fish & Seafood', keywords: 'fish,seafood', price: 'Market Price' },
      { name: 'Soybean Meal', keywords: 'soybean,meal', price: 'Market Price' },
    ],
    strategic: [
      { name: 'Lithium Carbonate', keywords: 'lithium,battery', price: 'Market Price' },
      { name: 'Nickel Ore', keywords: 'nickel,ore', price: 'Market Price' },
    ],
  },

  // 4. INDUSTRIAL
  industrial: [
    { name: 'CNC Machining Center', keywords: 'cnc,machine,factory', price: 'Request Quote' },
    { name: 'Industrial Safety Gear', keywords: 'helmet,safety,vest', price: '$15 - $50' },
    { name: 'Copper Wire Coils', keywords: 'copper,wire,industrial', price: 'Market Price' },
    { name: 'Iron Ore Pellets', keywords: 'iron,ore,mining', price: 'Market Price' },
  ],

  // 5. MINERALS
  minerals: {
    metals: [
      { name: 'Iron Ore', keywords: 'iron,ore,mining', price: 'Market Price' },
      { name: 'Copper Ore', keywords: 'copper,ore,mining', price: 'Market Price' },
      { name: 'Aluminum Ingot', keywords: 'aluminum,metal', price: 'Market Price' },
      { name: 'Zinc Concentrate', keywords: 'zinc,metal', price: 'Market Price' },
    ],
    energy: [
      { name: 'Thermal Coal', keywords: 'coal,mine', price: 'Market Price' },
      { name: 'Uranium Ore', keywords: 'uranium,ore', price: 'Market Price' },
      { name: 'Lithium Carbonate', keywords: 'lithium,battery', price: 'Market Price' },
    ],
    precious: [
      { name: 'Gold Bullion', keywords: 'gold,bars', price: 'Market Price' },
      { name: 'Silver Ingots', keywords: 'silver,metal', price: 'Market Price' },
      { name: 'Platinum Bar', keywords: 'platinum,metal', price: 'Market Price' },
    ],
    industrial: [
      { name: 'Construction Sand', keywords: 'sand,industrial', price: 'Market Price' },
      { name: 'Aggregate Gravel', keywords: 'gravel,industrial', price: 'Market Price' },
      { name: 'Limestone Blocks', keywords: 'limestone,industrial', price: 'Market Price' },
    ],
  },

  // 6. OIL & GAS
  'oil-gas': {
    upstream: [
      { name: 'Exploration Surveys', keywords: 'rig,ocean,exploration', price: 'Project Basis' },
      { name: 'Drilling Services', keywords: 'rig,drilling,ocean', price: 'Project Basis' },
      { name: 'OSV Chartering', keywords: 'osv,ship,tanker', price: 'Daily Rate' },
    ],
    midstream: [
      { name: 'Pipeline EPC', keywords: 'pipeline,industrial', price: 'Project Basis' },
      { name: 'Storage Tank Farms', keywords: 'storage,tank,industrial', price: 'Project Basis' },
      { name: 'Marine Terminals Ops', keywords: 'terminal,ship,port', price: 'Project Basis' },
    ],
    downstream: [
      { name: 'Refinery Operations', keywords: 'refinery,industrial', price: 'Project Basis' },
      { name: 'Trading & Offtake', keywords: 'trading,fuel,truck', price: 'Market Terms' },
      { name: 'Distribution Network', keywords: 'distribution,truck', price: 'Project Basis' },
    ],
    services: [
      { name: 'EPC Projects', keywords: 'epc,construction', price: 'Project Basis' },
      { name: 'HSE Compliance Audits', keywords: 'hse,safety,inspection', price: 'Per Audit' },
      { name: 'Inspection & Certification', keywords: 'inspection,industrial', price: 'Per Inspection' },
    ],
  },

  // 7. REAL ESTATE
  'real-estate': {
    commercial: [
      { name: 'Grade-A Office Leasing', keywords: 'office,building', price: 'Per Sq Ft' },
      { name: 'Retail Mall Spaces', keywords: 'retail,building', price: 'Per Sq Ft' },
      { name: 'Mixed-Use Development', keywords: 'mixed-use,building', price: 'Project Basis' },
    ],
    residential: [
      { name: 'Premium Apartments', keywords: 'apartments,building', price: 'Per Unit' },
      { name: 'Luxury Villas', keywords: 'villas,building', price: 'Per Unit' },
      { name: 'Community Housing', keywords: 'community,building', price: 'Per Unit' },
    ],
    industrial: [
      { name: 'Warehouses', keywords: 'warehouses,industrial', price: 'Per Sq Ft' },
      { name: 'Industrial Parks', keywords: 'parks,industrial', price: 'Project Basis' },
      { name: 'SEZ Facilities', keywords: 'sez,industrial', price: 'Project Basis' },
    ],
    services: [
      { name: 'Facilities Management (FM)', keywords: 'fm,industrial', price: 'Monthly' },
      { name: 'Leasing Advisory', keywords: 'leasing,office', price: 'Retainer' },
    ],
  },

  // 8. FINANCE & HPAY
  finance: {
    tradeFinance: [
      { name: 'Letter of Credit (LC)', keywords: 'lc,finance,bank', price: 'Bank Terms' },
      { name: 'Standby LC (SBLC)', keywords: 'sblc,finance,bank', price: 'Bank Terms' },
      { name: 'Forfaiting', keywords: 'forfaiting,finance,bank', price: 'Bank Terms' },
    ],
    hpay: [
      { name: 'Digital Wallets', keywords: 'wallets,finance', price: 'Per Account' },
      { name: 'Payments Processing', keywords: 'payments,finance', price: 'Per Transaction' },
      { name: 'Payment Gateway', keywords: 'gateway,finance', price: 'Monthly' },
    ],
    invoicing: [
      { name: 'Bills & Invoices', keywords: 'bills,invoice,finance', price: 'Per Document' },
      { name: 'Reconciliation', keywords: 'reconciliation,finance', price: 'Monthly' },
      { name: 'Reports & Analytics', keywords: 'reports,analytics,finance', price: 'Monthly' },
    ],
    risk: [
      { name: 'KYC Compliance', keywords: 'kyc,compliance,finance', price: 'Per Check' },
      { name: 'AML Screening', keywords: 'aml,compliance,finance', price: 'Per Check' },
      { name: 'Risk Scoring', keywords: 'scoring,finance,analytics', price: 'Per Profile' },
    ],
  },

  // 9. AI & TECHNOLOGY
  ai: {
    solutions: [
      { name: 'Forecasting Models', keywords: 'forecasting,ai', price: 'Project Basis' },
      { name: 'Computer Vision', keywords: 'vision,ai', price: 'Project Basis' },
      { name: 'Conversational Chat', keywords: 'chat,ai', price: 'Monthly' },
    ],
    data: [
      { name: 'Data Pipelines', keywords: 'pipelines,data,ai', price: 'Project Basis' },
      { name: 'Data Warehouses', keywords: 'warehouse,data,ai', price: 'Project Basis' },
      { name: 'Data APIs', keywords: 'apis,data,ai', price: 'Monthly' },
    ],
    integration: [
      { name: 'ERP Integration', keywords: 'erp,integration,ai', price: 'Project Basis' },
      { name: 'E-commerce Integration', keywords: 'e-commerce,integration', price: 'Project Basis' },
      { name: 'Mobile Apps', keywords: 'mobile,integration,ai', price: 'Project Basis' },
    ],
    support: [
      { name: 'SLAs', keywords: 'slas,support,ai', price: 'Monthly' },
      { name: 'Training & Enablement', keywords: 'training,support,ai', price: 'Per Session' },
      { name: 'Documentation', keywords: 'docs,support,ai', price: 'Included' },
    ],
  },

  // 10. SOURCING
  sourcing: [
    { name: 'OEM / ODM Manufacturing', keywords: 'manufacturing,factory', price: 'Request Quote', desc: 'End-to-end product development and mass production.', icon: '🏭' },
    { name: 'Private Label Development', keywords: 'brand,label,design', price: 'Request Quote', desc: 'Custom branding for retailers and e-commerce.', icon: '🏷️' },
    { name: 'Quality Control & Inspection', keywords: 'quality,inspection', price: 'Request Quote', desc: 'Rigorous testing and factory audits.', icon: '✅' },
    { name: 'Global Logistics & Freight', keywords: 'logistics,ship,cargo', price: 'Request Quote', desc: 'Seamless shipping by air, sea, and land.', icon: '🚢' },
    { name: 'Supply Chain Strategy', keywords: 'strategy,consulting', price: 'Request Quote', desc: 'Optimizing your supply chain for efficiency.', icon: '📈' },
    { name: 'Sustainable Sourcing', keywords: 'sustainable,eco,green', price: 'Request Quote', desc: 'Ethical and eco-friendly sourcing solutions.', icon: '🌱' },
    { name: 'Technology & Innovation', keywords: 'sourcing,technology,blockchain', price: 'Request Quote', desc: 'AI-powered supplier matching and traceability.', icon: '🤖' },
    { name: 'Government & Industrial Projects', keywords: 'government,infrastructure', price: 'Request Quote', desc: 'Turnkey procurement for public sector.', icon: '🏛️' },
  ],
} as const

/** Get all products for a vertical, flattened */
export function getVerticalProducts(verticalKey: string): Product[] {
  const data = (productCatalog as any)[verticalKey]
  if (!data) return []
  if (Array.isArray(data)) return data
  return Object.values(data).flat() as Product[]
}

/** Get subcategory products */
export function getSubcategoryProducts(verticalKey: string, subcategoryKey: string): Product[] {
  const data = (productCatalog as any)[verticalKey]
  if (!data || Array.isArray(data)) return Array.isArray(data) ? data : []
  return data[subcategoryKey] || []
}

/** Get subcategory names for a vertical */
export function getVerticalSubcategories(verticalKey: string): string[] {
  const data = (productCatalog as any)[verticalKey]
  if (!data || Array.isArray(data)) return []
  return Object.keys(data)
}

// ─── UNSPLASH IMAGE MAP — Every keyword gets a UNIQUE image ───
const UNSPLASH_MAP: Record<string, string> = {
  // ═══ TEXTILES & APPAREL — Men's ═══
  suit: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=800&fit=crop&auto=format&q=60',
  shirt: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop&auto=format&q=60',
  denim: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop&auto=format&q=60',
  polo: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&h=800&fit=crop&auto=format&q=60',
  leather: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop&auto=format&q=60',
  jacket: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop&auto=format&q=60',
  chinos: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=800&fit=crop&auto=format&q=60',
  knitwear: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop&auto=format&q=60',
  merino: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=800&fit=crop&auto=format&q=60',
  blazer: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=800&fit=crop&auto=format&q=60',
  overcoat: 'https://images.unsplash.com/photo-1544923408-75c5cef46f14?w=800&h=800&fit=crop&auto=format&q=60',
  parka: 'https://images.unsplash.com/photo-1547624643-3bf767b6b8ac?w=800&h=800&fit=crop&auto=format&q=60',
  stormwear: 'https://images.unsplash.com/photo-1545594861-3bef43ff2fc8?w=800&h=800&fit=crop&auto=format&q=60',
  sportswear: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop&auto=format&q=60',
  technical: 'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=800&h=800&fit=crop&auto=format&q=60',
  trainers: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop&auto=format&q=60',
  boots: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&h=800&fit=crop&auto=format&q=60',
  loungewear: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=800&fit=crop&auto=format&q=60',
  pyjamas: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&h=800&fit=crop&auto=format&q=60',
  'dressing-gown': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=800&fit=crop&auto=format&q=60',
  jeans: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=800&fit=crop&auto=format&q=60',
  pack: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&h=800&fit=crop&auto=format&q=60',
  shirts: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop&auto=format&q=60',
  men: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&auto=format&q=60',
  wool: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&h=800&fit=crop&auto=format&q=60',
  // ═══ TEXTILES — Women's ═══
  women: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=800&fit=crop&auto=format&q=60',
  gown: 'https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?w=800&h=800&fit=crop&auto=format&q=60',
  dress: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=800&fit=crop&auto=format&q=60',
  floral: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&h=800&fit=crop&auto=format&q=60',
  silk: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&h=800&fit=crop&auto=format&q=60',
  blouse: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800&h=800&fit=crop&auto=format&q=60',
  handbag: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop&auto=format&q=60',
  fashion: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=800&fit=crop&auto=format&q=60',
  bra: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=800&fit=crop&auto=format&q=60',
  lingerie: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=800&h=800&fit=crop&auto=format&q=60',
  knickers: 'https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=800&h=800&fit=crop&auto=format&q=60',
  shapewear: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=800&h=800&fit=crop&auto=format&q=60',
  'sports-bra': 'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=800&h=800&fit=crop&auto=format&q=60',
  tights: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&h=800&fit=crop&auto=format&q=60',
  socks: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&h=800&fit=crop&auto=format&q=60',
  nightwear: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=800&fit=crop&auto=format&q=60',
  // ═══ TEXTILES — Kids ═══
  boy: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&h=800&fit=crop&auto=format&q=60',
  tshirt: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&auto=format&q=60',
  girl: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&h=800&fit=crop&auto=format&q=60',
  kids: 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800&h=800&fit=crop&auto=format&q=60',
  uniform: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=800&fit=crop&auto=format&q=60',
  school: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&h=800&fit=crop&auto=format&q=60',
  hoodie: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop&auto=format&q=60',
  pajamas: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&h=800&fit=crop&auto=format&q=60',
  sneakers: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&h=800&fit=crop&auto=format&q=60',
  shoes: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&h=800&fit=crop&auto=format&q=60',
  // ═══ TEXTILES — Home ═══
  bedsheet: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=800&fit=crop&auto=format&q=60',
  bedroom: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=800&fit=crop&auto=format&q=60',
  towel: 'https://images.unsplash.com/photo-1600369672770-985fd30004eb?w=800&h=800&fit=crop&auto=format&q=60',
  bathroom: 'https://images.unsplash.com/photo-1583845112203-29329902332e?w=800&h=800&fit=crop&auto=format&q=60',
  cushion: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop&auto=format&q=60',
  decor: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop&auto=format&q=60',
  apron: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop&auto=format&q=60',
  kitchen: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop&auto=format&q=60',
  // ═══ FMCG — Staples ═══
  rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=800&fit=crop&auto=format&q=60',
  basmati: 'https://images.unsplash.com/photo-1536304993881-2d5a9e344297?w=800&h=800&fit=crop&auto=format&q=60',
  flour: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=800&fit=crop&auto=format&q=60',
  lentils: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=800&h=800&fit=crop&auto=format&q=60',
  red: 'https://images.unsplash.com/photo-1614359676738-1ed6ee1dd66e?w=800&h=800&fit=crop&auto=format&q=60',
  oats: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800&h=800&fit=crop&auto=format&q=60',
  // ═══ FMCG — Oils ═══
  oil: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&h=800&fit=crop&auto=format&q=60',
  sunflower: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&h=800&fit=crop&auto=format&q=60',
  olive: 'https://images.unsplash.com/photo-1474979266404-7eaacdc948b6?w=800&h=800&fit=crop&auto=format&q=60',
  ghee: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800&h=800&fit=crop&auto=format&q=60',
  butter: 'https://images.unsplash.com/photo-1588165171080-c89acfa5ee83?w=800&h=800&fit=crop&auto=format&q=60',
  spices: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&h=800&fit=crop&auto=format&q=60',
  bowl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=800&fit=crop&auto=format&q=60',
  // ═══ FMCG — Packaged ═══
  noodles: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=800&fit=crop&auto=format&q=60',
  cookies: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=800&fit=crop&auto=format&q=60',
  chocolate: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800&h=800&fit=crop&auto=format&q=60',
  chips: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&h=800&fit=crop&auto=format&q=60',
  snack: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&h=800&fit=crop&auto=format&q=60',
  corn: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&h=800&fit=crop&auto=format&q=60',
  canned: 'https://images.unsplash.com/photo-1534483509719-8042f755b6be?w=800&h=800&fit=crop&auto=format&q=60',
  // ═══ FMCG — Dairy & Beverages ═══
  milk: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&h=800&fit=crop&auto=format&q=60',
  carton: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&h=800&fit=crop&auto=format&q=60',
  cheese: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&h=800&fit=crop&auto=format&q=60',
  block: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&h=800&fit=crop&auto=format&q=60',
  juice: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=800&h=800&fit=crop&auto=format&q=60',
  glass: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=800&h=800&fit=crop&auto=format&q=60',
  coffee: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=800&fit=crop&auto=format&q=60',
  jar: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=800&fit=crop&auto=format&q=60',
  // ═══ FMCG — Personal Care ═══
  toothpaste: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=800&fit=crop&auto=format&q=60',
  soap: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=800&h=800&fit=crop&auto=format&q=60',
  shampoo: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800&h=800&fit=crop&auto=format&q=60',
  tube: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=800&fit=crop&auto=format&q=60',
  bar: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=800&h=800&fit=crop&auto=format&q=60',
  bottle: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800&h=800&fit=crop&auto=format&q=60',
  // ═══ FMCG — Home Care ═══
  detergent: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800&h=800&fit=crop&auto=format&q=60',
  laundry: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&h=800&fit=crop&auto=format&q=60',
  dishwashing: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=800&fit=crop&auto=format&q=60',
  liquid: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=800&fit=crop&auto=format&q=60',
  // ═══ COMMODITIES — Energy ═══
  rig: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&h=800&fit=crop&auto=format&q=60',
  ocean: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&h=800&fit=crop&auto=format&q=60',
  gas: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=800&h=800&fit=crop&auto=format&q=60',
  coal: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=800&fit=crop&auto=format&q=60',
  mine: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop&auto=format&q=60',
  fuel: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=800&fit=crop&auto=format&q=60',
  truck: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&h=800&fit=crop&auto=format&q=60',
  // ═══ COMMODITIES — Metals ═══
  gold: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&h=800&fit=crop&auto=format&q=60',
  bars: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&h=800&fit=crop&auto=format&q=60',
  silver: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800&h=800&fit=crop&auto=format&q=60',
  metal: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=800&fit=crop&auto=format&q=60',
  copper: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82d?w=800&h=800&fit=crop&auto=format&q=60',
  aluminum: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=800&fit=crop&auto=format&q=60',
  iron: 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=800&h=800&fit=crop&auto=format&q=60',
  steel: 'https://images.unsplash.com/photo-1567789884554-0b844b597180?w=800&h=800&fit=crop&auto=format&q=60',
  construction: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop&auto=format&q=60',
  // ═══ COMMODITIES — Agri ═══
  wheat: 'https://images.unsplash.com/photo-1437252611977-07f74518abd7?w=800&h=800&fit=crop&auto=format&q=60',
  field: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=800&fit=crop&auto=format&q=60',
  grain: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=800&fit=crop&auto=format&q=60',
  soybean: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&h=800&fit=crop&auto=format&q=60',
  sugar: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=800&fit=crop&auto=format&q=60',
  cane: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=800&fit=crop&auto=format&q=60',
  palm: 'https://images.unsplash.com/photo-1591105575627-01011ab9eaa1?w=800&h=800&fit=crop&auto=format&q=60',
  cocoa: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&h=800&fit=crop&auto=format&q=60',
  beans: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=800&h=800&fit=crop&auto=format&q=60',
  fertilizer: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=800&fit=crop&auto=format&q=60',
  farm: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=800&fit=crop&auto=format&q=60',
  chemical: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=800&fit=crop&auto=format&q=60',
  salt: 'https://images.unsplash.com/photo-1518110925495-5fe2c8dcf2f5?w=800&h=800&fit=crop&auto=format&q=60',
  pile: 'https://images.unsplash.com/photo-1518110925495-5fe2c8dcf2f5?w=800&h=800&fit=crop&auto=format&q=60',
  sulphur: 'https://images.unsplash.com/photo-1518110925495-5fe2c8dcf2f5?w=800&h=800&fit=crop&auto=format&q=60',
  yellow: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=800&fit=crop&auto=format&q=60',
  rock: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=800&fit=crop&auto=format&q=60',
  // ═══ COMMODITIES — Protein ═══
  beef: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&h=800&fit=crop&auto=format&q=60',
  steak: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=800&h=800&fit=crop&auto=format&q=60',
  chicken: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=800&fit=crop&auto=format&q=60',
  meat: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&h=800&fit=crop&auto=format&q=60',
  poultry: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=800&h=800&fit=crop&auto=format&q=60',
  fish: 'https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=800&h=800&fit=crop&auto=format&q=60',
  seafood: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&h=800&fit=crop&auto=format&q=60',
  meal: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=800&h=800&fit=crop&auto=format&q=60',
  // ═══ COMMODITIES — Strategic ═══
  lithium: 'https://images.unsplash.com/photo-1619641805634-98e5c7d37f7f?w=800&h=800&fit=crop&auto=format&q=60',
  battery: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=800&fit=crop&auto=format&q=60',
  nickel: 'https://images.unsplash.com/photo-1535378917042-10a22c95931b?w=800&h=800&fit=crop&auto=format&q=60',
  // ═══ INDUSTRIAL ═══
  cnc: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=800&fit=crop&auto=format&q=60',
  machine: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=800&fit=crop&auto=format&q=60',
  factory: 'https://images.unsplash.com/photo-1581091877018-dac6a371d50f?w=800&h=800&fit=crop&auto=format&q=60',
  industrial: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=800&fit=crop&auto=format&q=60',
  helmet: 'https://images.unsplash.com/photo-1598300056393-4aac492f4344?w=800&h=800&fit=crop&auto=format&q=60',
  safety: 'https://images.unsplash.com/photo-1574757988474-1be3a1172763?w=800&h=800&fit=crop&auto=format&q=60',
  vest: 'https://images.unsplash.com/photo-1590845947376-2638caa89309?w=800&h=800&fit=crop&auto=format&q=60',
  wire: 'https://images.unsplash.com/photo-1620283085439-39620a119870?w=800&h=800&fit=crop&auto=format&q=60',
  // ═══ MINERALS ═══
  ore: 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=800&h=800&fit=crop&auto=format&q=60',
  mining: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop&auto=format&q=60',
  zinc: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&h=800&fit=crop&auto=format&q=60',
  platinum: 'https://images.unsplash.com/photo-1592882631049-81f67e6d4fca?w=800&h=800&fit=crop&auto=format&q=60',
  uranium: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop&auto=format&q=60',
  sand: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=800&fit=crop&auto=format&q=60',
  gravel: 'https://images.unsplash.com/photo-1580060405573-9c0f91dc65d1?w=800&h=800&fit=crop&auto=format&q=60',
  limestone: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=800&fit=crop&auto=format&q=60',
  // ═══ OIL & GAS ═══
  exploration: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&h=800&fit=crop&auto=format&q=60',
  drilling: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=800&fit=crop&auto=format&q=60',
  osv: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=800&fit=crop&auto=format&q=60',
  tanker: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=800&fit=crop&auto=format&q=60',
  ship: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&h=800&fit=crop&auto=format&q=60',
  pipeline: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=800&h=800&fit=crop&auto=format&q=60',
  storage: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=800&fit=crop&auto=format&q=60',
  terminal: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=800&fit=crop&auto=format&q=60',
  refinery: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&h=800&fit=crop&auto=format&q=60',
  trading: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=800&fit=crop&auto=format&q=60',
  distribution: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=800&fit=crop&auto=format&q=60',
  epc: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop&auto=format&q=60',
  hse: 'https://images.unsplash.com/photo-1574757988474-1be3a1172763?w=800&h=800&fit=crop&auto=format&q=60',
  inspection: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=800&fit=crop&auto=format&q=60',
  // ═══ REAL ESTATE ═══
  office: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=800&fit=crop&auto=format&q=60',
  building: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=800&fit=crop&auto=format&q=60',
  retail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=800&fit=crop&auto=format&q=60',
  'mixed-use': 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=800&fit=crop&auto=format&q=60',
  apartments: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=800&fit=crop&auto=format&q=60',
  villas: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=800&fit=crop&auto=format&q=60',
  community: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=800&fit=crop&auto=format&q=60',
  warehouses: 'https://images.unsplash.com/photo-1590247813913-a5d4e9e7a50a?w=800&h=800&fit=crop&auto=format&q=60',
  parks: 'https://images.unsplash.com/photo-1569163139394-de4e5f43e5ca?w=800&h=800&fit=crop&auto=format&q=60',
  sez: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=800&fit=crop&auto=format&q=60',
  fm: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=800&fit=crop&auto=format&q=60',
  leasing: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=800&fit=crop&auto=format&q=60',
  advisory: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=800&fit=crop&auto=format&q=60',
  // ═══ FINANCE ═══
  lc: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=800&fit=crop&auto=format&q=60',
  sblc: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=800&fit=crop&auto=format&q=60',
  forfaiting: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=800&fit=crop&auto=format&q=60',
  finance: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=800&fit=crop&auto=format&q=60',
  bank: 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=800&h=800&fit=crop&auto=format&q=60',
  wallets: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=800&fit=crop&auto=format&q=60',
  payments: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=800&fit=crop&auto=format&q=60',
  gateway: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=800&fit=crop&auto=format&q=60',
  bills: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=800&fit=crop&auto=format&q=60',
  invoice: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=800&fit=crop&auto=format&q=60',
  reconciliation: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=800&fit=crop&auto=format&q=60',
  reports: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=800&fit=crop&auto=format&q=60',
  analytics: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=800&fit=crop&auto=format&q=60',
  kyc: 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=800&h=800&fit=crop&auto=format&q=60',
  aml: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&h=800&fit=crop&auto=format&q=60',
  compliance: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&h=800&fit=crop&auto=format&q=60',
  scoring: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&h=800&fit=crop&auto=format&q=60',
  // ═══ AI & TECHNOLOGY ═══
  forecasting: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=800&fit=crop&auto=format&q=60',
  ai: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=800&fit=crop&auto=format&q=60',
  vision: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&h=800&fit=crop&auto=format&q=60',
  chat: 'https://images.unsplash.com/photo-1531746790095-e5e7e3306424?w=800&h=800&fit=crop&auto=format&q=60',
  pipelines: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=800&fit=crop&auto=format&q=60',
  data: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=800&fit=crop&auto=format&q=60',
  apis: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=800&fit=crop&auto=format&q=60',
  erp: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=800&fit=crop&auto=format&q=60',
  'e-commerce': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=800&fit=crop&auto=format&q=60',
  mobile: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=800&fit=crop&auto=format&q=60',
  integration: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=800&fit=crop&auto=format&q=60',
  slas: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=800&fit=crop&auto=format&q=60',
  training: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=800&fit=crop&auto=format&q=60',
  support: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=800&fit=crop&auto=format&q=60',
  docs: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&h=800&fit=crop&auto=format&q=60',
  technology: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=800&fit=crop&auto=format&q=60',
  blockchain: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=800&fit=crop&auto=format&q=60',
  // ═══ SOURCING ═══
  manufacturing: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=800&fit=crop&auto=format&q=60',
  brand: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=800&fit=crop&auto=format&q=60',
  label: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=800&fit=crop&auto=format&q=60',
  design: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=800&fit=crop&auto=format&q=60',
  quality: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=800&fit=crop&auto=format&q=60',
  logistics: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=800&fit=crop&auto=format&q=60',
  cargo: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=800&fit=crop&auto=format&q=60',
  strategy: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=800&fit=crop&auto=format&q=60',
  consulting: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=800&fit=crop&auto=format&q=60',
  sustainable: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=800&fit=crop&auto=format&q=60',
  eco: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=800&fit=crop&auto=format&q=60',
  green: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=800&fit=crop&auto=format&q=60',
  government: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=800&fit=crop&auto=format&q=60',
  infrastructure: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop&auto=format&q=60',
}

/** Get a product image URL from keywords — checks LEAF_IMAGE_MAP first
 *  (so newly generated `/assets/verticals/.../leaf.jpg` images are served),
 *  then falls back to the legacy Unsplash mapping. */
export function getProductImage(keywords: string): string {
  const defaultUrl = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=75'
  if (!keywords) return defaultUrl

  // 1. Prefer locally generated leaf.jpg images.
  const leaf = getLeafImage(keywords)
  if (leaf) return leaf

  const makeUrl = (token: string): string | null => {
    if (!token) return null
    // Already a full URL
    if (token.startsWith('http')) return token
    if (token.includes('/') || token.includes('.')) return token
    // Photo ID format: 1234567890123-abcdef
    const isPhotoId = /^\d{10,}-[a-z0-9]+$/i.test(token)
    if (isPhotoId) return `https://images.unsplash.com/photo-${token}?auto=format&fit=crop&w=800&q=75`
    return null
  }

  const keys = keywords.toLowerCase().split(',').map(k => k.trim())
  for (const key of keys) {
    if (UNSPLASH_MAP[key]) {
      const val = makeUrl(UNSPLASH_MAP[key])
      if (val) return val
    }
  }
  // Fuzzy fallback
  for (const key of keys) {
    for (const mapKey in UNSPLASH_MAP) {
      if (mapKey.includes(key) || key.includes(mapKey)) {
        const val = makeUrl(UNSPLASH_MAP[mapKey])
        if (val) return val
      }
    }
  }
  return defaultUrl
}
