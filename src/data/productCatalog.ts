/**
 * HARVICS PRODUCT CATALOG
 * Ported from Supreme's product-data.js
 * Complete product catalog across all 10 industry verticals
 */

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
      { name: 'Data Warehouses', keywords: 'warehouses,data,ai', price: 'Project Basis' },
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
    { name: 'Technology & Innovation', keywords: 'technology,ai,blockchain', price: 'Request Quote', desc: 'AI-powered supplier matching and traceability.', icon: '🤖' },
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

// ─── UNSPLASH IMAGE MAP (ported from SUPREME's product-data.js) ───
const UNSPLASH_MAP: Record<string, string> = {
  // TEXTILES & APPAREL
  suit: 'm0ZBWRYYq7o', men: 'm0ZBWRYYq7o', shirt: 'WBN-J1_w7Rw', denim: 'B00k_1iHnZk',
  polo: 'WBN-J1_w7Rw', leather: 'MQuL6b1_v4E', jacket: 'MQuL6b1_v4E',
  gown: '9Pspyy5lEMw', dress: 'P-J4kbEIEk0', floral: 'P-J4kbEIEk0', silk: 'cjUOhrBquqc',
  blouse: 'WBN-J1_w7Rw', handbag: '9Pspyy5lEMw', fashion: '9Pspyy5lEMw',
  boy: '5UL65v055Fg', tshirt: 'S-2Uq7sYj30', girl: 'P-J4kbEIEk0', women: '9Pspyy5lEMw',
  jeans: 'B00k_1iHnZk', kids: '5UL65v055Fg', uniform: 'WBN-J1_w7Rw', school: 'WBN-J1_w7Rw',
  hoodie: '5UL65v055Fg', pajamas: '5UL65v055Fg', shoes: 'WBN-J1_w7Rw', sneakers: 'WBN-J1_w7Rw',
  bedsheet: 'G7sE2S4Lab4', bedroom: 'G7sE2S4Lab4', towel: '8wTPqxlnKM4', bathroom: '8wTPqxlnKM4',
  cushion: 'G7sE2S4Lab4', decor: 'G7sE2S4Lab4', apron: 'WBN-J1_w7Rw', kitchen: '8wTPqxlnKM4',
  chinos: '1454165804606-c3d57bc86b40', merino: '1454165804606-c3d57bc86b40',
  blazer: '1486406146926-c627a92ad1ab', overcoat: '1486406146926-c627a92ad1ab',
  parka: '1565514020176-db5928a57342', stormwear: '1565514020176-db5928a57342',
  sportswear: '1565514020176-db5928a57342', trainers: '1516321318423-f06f85e504b3',
  boots: '1516321318423-f06f85e504b3', loungewear: '1596524430623-6ce64b9c546a',
  pyjamas: '1596524430623-6ce64b9c546a', 'dressing-gown': '1596524430623-6ce64b9c546a',
  bra: '1516321318423-f06f85e504b3', lingerie: '1516321318423-f06f85e504b3',
  knickers: '1516321318423-f06f85e504b3', shapewear: '1516321318423-f06f85e504b3',
  'sports-bra': '1516321318423-f06f85e504b3', tights: '1516321318423-f06f85e504b3',
  nightwear: '1596524430623-6ce64b9c546a',
  // FMCG
  rice: 'VmBToKkQ8ac', basmati: 'VmBToKkQ8ac', grain: 'VmBToKkQ8ac',
  flour: 'KxJ8r8yqQ7o', wheat: 'KxJ8r8yqQ7o', lentils: 'uDnW85d_N7w', oats: 'KxJ8r8yqQ7o',
  oil: 'PLyJqE4_W3I', sunflower: 'PLyJqE4_W3I', olive: 'PLyJqE4_W3I',
  ghee: 'PLyJqE4_W3I', butter: 'PLyJqE4_W3I', spices: 'uDnW85d_N7w',
  noodles: 'VmBToKkQ8ac', cookies: 'S-2Uq7sYj30', chocolate: 'S-2Uq7sYj30',
  chips: 'S-2Uq7sYj30', snack: 'S-2Uq7sYj30', corn: 'KxJ8r8yqQ7o',
  milk: '8wTPqxlnKM4', cheese: '8wTPqxlnKM4', juice: 'PLyJqE4_W3I',
  coffee: 'n_3kdpSkrKw', toothpaste: 't8hTmte4Oyo', soap: 't8hTmte4Oyo',
  shampoo: 't8hTmte4Oyo', detergent: '8wTPqxlnKM4',
  // INDUSTRIAL & COMMODITIES
  cnc: 'Cj4_Q-l_s4I', machine: 'Cj4_Q-l_s4I', factory: 'H6d6jIaO9WE',
  helmet: 'tE6th1h6Bfk', safety: 'tE6th1h6Bfk', vest: 'tE6th1h6Bfk',
  copper: 'B00k_1iHnZk', wire: 'B00k_1iHnZk', industrial: 'H6d6jIaO9WE',
  iron: 'H6d6jIaO9WE', ore: 'H6d6jIaO9WE', mining: 'H6d6jIaO9WE',
  rig: 'Ej2FQy1W7z4', ocean: 'Ej2FQy1W7z4', tanker: '0A7YwYhZhWw',
  ship: '0A7YwYhZhWw', coal: 'H6d6jIaO9WE', fuel: 'Ej2FQy1W7z4', truck: '0A7YwYhZhWw',
  gold: 'ktXmcyqYx54', bars: 'ktXmcyqYx54', silver: 'ktXmcyqYx54', metal: 'ktXmcyqYx54',
  aluminum: 'H6d6jIaO9WE', steel: 'H6d6jIaO9WE', construction: 'H6d6jIaO9WE',
  pipeline: 'H6d6jIaO9WE', refinery: 'H6d6jIaO9WE',
  field: '_rXmtIMnOT8', soybean: '_rXmtIMnOT8', sugar: '_rXmtIMnOT8',
  palm: '_rXmtIMnOT8', fertilizer: '_rXmtIMnOT8', farm: '_rXmtIMnOT8',
  beans: 'n_3kdpSkrKw', cocoa: 'n_3kdpSkrKw',
  beef: 'uDnW85d_N7w', steak: 'uDnW85d_N7w', poultry: 'uDnW85d_N7w',
  chicken: 'uDnW85d_N7w', fish: 'uDnW85d_N7w', seafood: 'uDnW85d_N7w',
  lithium: 'ktXmcyqYx54', battery: 'ktXmcyqYx54', nickel: 'H6d6jIaO9WE',
  sand: 'H6d6jIaO9WE', gravel: 'H6d6jIaO9WE', limestone: 'H6d6jIaO9WE',
  platinum: 'ktXmcyqYx54', zinc: 'H6d6jIaO9WE', uranium: 'H6d6jIaO9WE',
  // REAL ESTATE
  office: '1486406146926-c627a92ad1ab', building: '1486406146926-c627a92ad1ab',
  retail: '1486406146926-c627a92ad1ab', apartments: '1486406146926-c627a92ad1ab',
  villas: '1486406146926-c627a92ad1ab', community: '1486406146926-c627a92ad1ab',
  warehouses: 'H6d6jIaO9WE', sez: 'H6d6jIaO9WE',
  // FINANCE
  lc: '1524661135-423995f22d0b', sblc: '1524661135-423995f22d0b',
  forfaiting: '1524661135-423995f22d0b', wallets: '1516321318423-f06f85e504b3',
  payments: '1516321318423-f06f85e504b3', gateway: '1516321318423-f06f85e504b3',
  bills: '1596524430623-6ce64b9c546a', reconciliation: '1524661135-423995f22d0b',
  kyc: '1516321318423-f06f85e504b3', aml: '1516321318423-f06f85e504b3',
  scoring: '1524661135-423995f22d0b',
  // AI
  forecasting: '1524661135-423995f22d0b', vision: '1524661135-423995f22d0b',
  chat: '1524661135-423995f22d0b', pipelines: '1524661135-423995f22d0b',
  apis: '1524661135-423995f22d0b', erp: '1524661135-423995f22d0b',
  mobile: '1524661135-423995f22d0b', slas: '1524661135-423995f22d0b',
  training: '1524661135-423995f22d0b',
  // DEFAULTS
  default: 'APPLE%20EXAMPLE/apple%20header%20picture.jpg',
}

/** Get a product image URL from keywords — ported from SUPREME */
export function getProductImage(keywords: string): string {
  const defaultUrl = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
  if (!keywords) return defaultUrl

  const makeUrl = (token: string): string | null => {
    if (!token) return null
    if (token.includes('/') || token.includes('.')) return token
    const isPhotoId = /^\d{10,}-[a-z0-9]+$/i.test(token)
    if (isPhotoId) return `https://images.unsplash.com/photo-${token}?auto=format&fit=crop&w=800&q=80`
    return `https://images.unsplash.com/${token}?auto=format&fit=crop&w=800&q=80`
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
