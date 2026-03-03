/**
 * HARVICS PRODUCT DATA
 * Centralized product catalog with image mapping
 */

const productCatalog = {
  // 1. TEXTILES & APPAREL
  textiles: {
    men: [
      { name: "Formal Suit (3-piece)", keywords: "suit,men", price: "$120 - $250" },
      { name: "Casual Denim Shirt", keywords: "denim,shirt,men", price: "$25 - $45" },
      { name: "Polo T-Shirt", keywords: "polo,shirt,men", price: "$15 - $30" },
      { name: "Leather Jacket", keywords: "leather,jacket,men", price: "$80 - $150" },
      { name: "Chinos (Skinny/Slim/Tapered)", keywords: "chinos,men", price: "$25 - $55" },
      { name: "Jeans (Skinny to Loose)", keywords: "jeans,men", price: "$30 - $70" },
      { name: "Merino Knitwear", keywords: "merino,knitwear,men", price: "$35 - $90" },
      { name: "Blazer (Linen/Moleskin/Jersey)", keywords: "blazer,men", price: "$80 - $180" },
      { name: "Wool Overcoat", keywords: "overcoat,wool,men", price: "$120 - $260" },
      { name: "Parkas with Stormwear", keywords: "parka,stormwear,men", price: "$90 - $200" },
      { name: "Easy-Iron Shirts (3-pack)", keywords: "shirts,pack,men", price: "$40 - $80" },
      { name: "Technical Sportswear", keywords: "sportswear,technical,men", price: "$25 - $60" },
      { name: "Trainers & Boots", keywords: "trainers,boots,men", price: "$45 - $120" },
      { name: "Loungewear & Pyjamas", keywords: "loungewear,pyjamas,men", price: "$20 - $60" },
      { name: "Fleece Dressing Gown", keywords: "dressing-gown,men", price: "$35 - $75" }
    ],
    women: [
      { name: "Evening Gown", keywords: "gown,dress,women", price: "$150 - $300" },
      { name: "Summer Floral Dress", keywords: "floral,dress,women", price: "$35 - $60" },
      { name: "Silk Blouse", keywords: "silk,blouse,women", price: "$40 - $70" },
      { name: "Designer Handbag", keywords: "handbag,fashion", price: "$50 - $120" },
      { name: "Balcony/Plunge Bras", keywords: "bra,lingerie,women", price: "$25 - $60" },
      { name: "Seamless & Cotton Knickers", keywords: "knickers,lingerie,women", price: "$10 - $30" },
      { name: "Shapewear (Slips/Bodysuits)", keywords: "shapewear,lingerie,women", price: "$20 - $50" },
      { name: "Sports Bras (High Support)", keywords: "sports-bra,lingerie,women", price: "$25 - $55" },
      { name: "Tights & Socks", keywords: "tights,socks,women", price: "$8 - $25" },
      { name: "Nightwear & Loungewear", keywords: "nightwear,loungewear,women", price: "$20 - $60" }
    ],
    kids: [
      { name: "Boys Cotton T-Shirt", keywords: "boy,tshirt", price: "$10 - $20" },
      { name: "Girls Party Dress", keywords: "girl,dress", price: "$25 - $45" },
      { name: "Denim Jeans", keywords: "jeans,kids", price: "$18 - $30" },
      { name: "School Uniform Set", keywords: "uniform,school", price: "$30 - $50" },
      { name: "Winter Hoodie", keywords: "hoodie,kids", price: "$22 - $40" },
      { name: "Soft Cotton Pajamas", keywords: "pajamas,kids", price: "$15 - $25" },
      { name: "School Shoes", keywords: "shoes,school", price: "$25 - $40" },
      { name: "Sneakers", keywords: "sneakers,kids", price: "$20 - $35" }
    ],
    home: [
      { name: "Luxury Bed Sheet Set", keywords: "bedsheet,bedroom", price: "$30 - $60" },
      { name: "Cotton Bath Towels", keywords: "towel,bathroom", price: "$12 - $25" },
      { name: "Decorative Cushions", keywords: "cushion,decor", price: "$15 - $30" },
      { name: "Kitchen Apron", keywords: "apron,kitchen", price: "$10 - $18" }
    ]
  },

  // 2. FMCG (FOOD & BEVERAGE)
  fmcg: {
    staples: [
      { name: "Premium Basmati Rice", keywords: "rice,basmati,grain", price: "$1.50/kg" },
      { name: "Wheat Flour (Atta)", keywords: "flour,wheat", price: "$0.80/kg" },
      { name: "Red Lentils (Masoor)", keywords: "lentils,red", price: "$1.20/kg" },
      { name: "Organic Oats", keywords: "oats,grain", price: "$2.50/kg" }
    ],
    oils: [
      { name: "Sunflower Oil", keywords: "oil,sunflower,bottle", price: "$2.00/L" },
      { name: "Extra Virgin Olive Oil", keywords: "olive,oil", price: "$8.00/L" },
      { name: "Pure Ghee", keywords: "ghee,butter", price: "$10.00/kg" },
      { name: "Whole Spices Mix", keywords: "spices,bowl", price: "$15.00/kg" }
    ],
    packaged: [
      { name: "Instant Noodles", keywords: "noodles,bowl", price: "$0.50/pack" },
      { name: "Chocolate Chip Cookies", keywords: "cookies,chocolate", price: "$1.20/pack" },
      { name: "Potato Chips", keywords: "chips,snack", price: "$0.80/pack" },
      { name: "Canned Sweet Corn", keywords: "corn,canned", price: "$1.00/can" }
    ],
    dairy: [
      { name: "UHT Milk", keywords: "milk,carton", price: "$1.10/L" },
      { name: "Cheddar Cheese", keywords: "cheese,block", price: "$5.00/block" },
      { name: "Fruit Juice Nectar", keywords: "juice,glass", price: "$1.50/L" },
      { name: "Instant Coffee", keywords: "coffee,jar", price: "$6.00/jar" }
    ],
    personalCare: [
      { name: "Herbal Toothpaste", keywords: "toothpaste,tube", price: "$2.00" },
      { name: "Moisturizing Soap", keywords: "soap,bar", price: "$1.00" },
      { name: "Shampoo", keywords: "shampoo,bottle", price: "$3.50" }
    ],
    homeCare: [
      { name: "Laundry Detergent", keywords: "detergent,laundry", price: "$4.00" },
      { name: "Dishwashing Liquid", keywords: "dishwashing,liquid", price: "$1.50" }
    ]
  },

  // 3. INDUSTRIAL & MINERALS
  industrial: [
    { name: "CNC Machining Center", keywords: "cnc,machine,factory", price: "Request Quote" },
    { name: "Industrial Safety Gear", keywords: "helmet,safety,vest", price: "$15 - $50" },
    { name: "Copper Wire Coils", keywords: "copper,wire,industrial", price: "Market Price" },
    { name: "Iron Ore Pellets", keywords: "iron,ore,mining", price: "Market Price" }
  ],

  // 4. COMMODITIES (GLOBAL TRADE)
  commodities: {
    energy: [
      { name: "Crude Oil (Brent / WTI)", keywords: "oil,rig,ocean", price: "Market Price" },
      { name: "Natural Gas (LNG)", keywords: "gas,tanker,ship", price: "Market Price" },
      { name: "Thermal Coal", keywords: "coal,mine", price: "Market Price" },
      { name: "Refined Diesel", keywords: "fuel,truck", price: "Market Price" }
    ],
    metals: [
      { name: "Gold Bullion", keywords: "gold,bars", price: "Market Price" },
      { name: "Silver Ingots", keywords: "silver,metal", price: "Market Price" },
      { name: "Copper Cathodes", keywords: "copper,industrial", price: "Market Price" },
      { name: "Aluminum Ingots", keywords: "aluminum,metal,industrial", price: "Market Price" },
      { name: "Iron Ore", keywords: "iron,ore,mining", price: "Market Price" },
      { name: "Steel Rebar", keywords: "steel,construction", price: "Market Price" }
    ],
    agri: [
      { name: "Wheat Grain", keywords: "wheat,field", price: "Market Price" },
      { name: "White Rice", keywords: "rice,bowl", price: "Market Price" },
      { name: "Yellow Corn", keywords: "corn,field", price: "Market Price" },
      { name: "Soybeans", keywords: "soybean,field", price: "Market Price" },
      { name: "Raw Sugar", keywords: "sugar,cane", price: "Market Price" }
    ],
    edibleOils: [
      { name: "Palm Oil", keywords: "palm,oil,plantation", price: "Market Price" },
      { name: "Soybean Oil", keywords: "soybean,oil", price: "Market Price" },
      { name: "Sunflower Oil", keywords: "sunflower,oil,field", price: "Market Price" },
      { name: "Coffee Beans", keywords: "coffee,beans", price: "Market Price" },
      { name: "Cocoa Beans", keywords: "cocoa,beans", price: "Market Price" }
    ],
    industrialChem: [
      { name: "Urea Fertilizer", keywords: "fertilizer,farm", price: "Market Price" },
      { name: "DAP / Potash", keywords: "fertilizer,chemical", price: "Market Price" },
      { name: "Phosphate Rock", keywords: "rock,mining", price: "Market Price" },
      { name: "Industrial Salt", keywords: "salt,pile", price: "Market Price" },
      { name: "Sulphur", keywords: "sulphur,yellow", price: "Market Price" }
    ],
    protein: [
      { name: "Frozen Beef", keywords: "beef,steak", price: "Market Price" },
      { name: "Frozen Poultry", keywords: "chicken,meat", price: "Market Price" },
      { name: "Fish & Seafood", keywords: "fish,seafood", price: "Market Price" },
      { name: "Soybean Meal", keywords: "soybean,meal,feed", price: "Market Price" }
    ],
    strategic: [
      { name: "Lithium Carbonate", keywords: "lithium,battery", price: "Market Price" },
      { name: "Nickel Ore", keywords: "nickel,ore", price: "Market Price" }
    ]
  },
  
  // 9. MINERALS
  minerals: {
    metals: [
      { name: "Iron Ore", keywords: "iron,ore,mining", price: "Market Price" },
      { name: "Copper Ore", keywords: "copper,ore,mining", price: "Market Price" },
      { name: "Aluminum Ingot", keywords: "aluminum,metal,industrial", price: "Market Price" },
      { name: "Zinc Concentrate", keywords: "zinc,metal", price: "Market Price" }
    ],
    energy: [
      { name: "Thermal Coal", keywords: "coal,mine", price: "Market Price" },
      { name: "Uranium Ore", keywords: "uranium,ore", price: "Market Price" },
      { name: "Lithium Carbonate", keywords: "lithium,battery", price: "Market Price" }
    ],
    precious: [
      { name: "Gold Bullion", keywords: "gold,bars", price: "Market Price" },
      { name: "Silver Ingots", keywords: "silver,metal", price: "Market Price" },
      { name: "Platinum Bar", keywords: "platinum,metal", price: "Market Price" }
    ],
    industrial: [
      { name: "Construction Sand", keywords: "sand,industrial", price: "Market Price" },
      { name: "Aggregate Gravel", keywords: "gravel,industrial", price: "Market Price" },
      { name: "Limestone Blocks", keywords: "limestone,industrial", price: "Market Price" }
    ]
  },
  
  // 5. OIL & GAS
  oilgas: {
    upstream: [
      { name: "Exploration Surveys", keywords: "rig,ocean,exploration", price: "Project Basis" },
      { name: "Drilling Services", keywords: "rig,drilling,ocean", price: "Project Basis" },
      { name: "OSV Chartering", keywords: "osv,ship,tanker", price: "Daily Rate" }
    ],
    midstream: [
      { name: "Pipeline EPC", keywords: "pipeline,industrial,construction", price: "Project Basis" },
      { name: "Storage Tank Farms", keywords: "storage,tank,industrial", price: "Project Basis" },
      { name: "Marine Terminals Ops", keywords: "terminal,ship,port", price: "Project Basis" }
    ],
    downstream: [
      { name: "Refinery Operations", keywords: "refinery,industrial", price: "Project Basis" },
      { name: "Trading & Offtake", keywords: "trading,fuel,truck", price: "Market Terms" },
      { name: "Distribution Network", keywords: "distribution,truck,logistics", price: "Project Basis" }
    ],
    services: [
      { name: "EPC Projects", keywords: "epc,construction,industrial", price: "Project Basis" },
      { name: "HSE Compliance Audits", keywords: "hse,safety,inspection", price: "Per Audit" },
      { name: "Inspection & Certification", keywords: "inspection,industrial", price: "Per Inspection" }
    ]
  },
  
  // 6. REAL ESTATE
  realestate: {
    commercial: [
      { name: "Grade-A Office Leasing", keywords: "office,building", price: "Per Sq Ft" },
      { name: "Retail Mall Spaces", keywords: "retail,building", price: "Per Sq Ft" },
      { name: "Mixed-Use Development", keywords: "mixed-use,building", price: "Project Basis" }
    ],
    residential: [
      { name: "Premium Apartments", keywords: "apartments,building", price: "Per Unit" },
      { name: "Luxury Villas", keywords: "villas,building", price: "Per Unit" },
      { name: "Community Housing", keywords: "community,building", price: "Per Unit" }
    ],
    industrial: [
      { name: "Warehouses", keywords: "warehouses,industrial,building", price: "Per Sq Ft" },
      { name: "Industrial Parks", keywords: "parks,industrial,building", price: "Project Basis" },
      { name: "SEZ Facilities", keywords: "sez,industrial,building", price: "Project Basis" }
    ],
    services: [
      { name: "Facilities Management (FM)", keywords: "fm,industrial", price: "Monthly" },
      { name: "Leasing Advisory", keywords: "leasing,office", price: "Retainer" }
    ]
  },
  
  // 7. FINANCE & HPAY
  finance: {
    tradeFinance: [
      { name: "Letter of Credit (LC)", keywords: "lc,finance,bank", price: "Bank Terms" },
      { name: "Standby LC (SBLC)", keywords: "sblc,finance,bank", price: "Bank Terms" },
      { name: "Forfaiting", keywords: "forfaiting,finance,bank", price: "Bank Terms" }
    ],
    hpay: [
      { name: "Digital Wallets", keywords: "wallets,finance", price: "Per Account" },
      { name: "Payments Processing", keywords: "payments,finance", price: "Per Transaction" },
      { name: "Payment Gateway", keywords: "gateway,finance", price: "Monthly" }
    ],
    invoicing: [
      { name: "Bills & Invoices", keywords: "bills,invoice,finance", price: "Per Document" },
      { name: "Reconciliation", keywords: "reconciliation,finance", price: "Monthly" },
      { name: "Reports & Analytics", keywords: "reports,analytics,finance", price: "Monthly" }
    ],
    risk: [
      { name: "KYC Compliance", keywords: "kyc,compliance,finance", price: "Per Check" },
      { name: "AML Screening", keywords: "aml,compliance,finance", price: "Per Check" },
      { name: "Risk Scoring", keywords: "scoring,finance,analytics", price: "Per Profile" }
    ]
  },
  
  // 8. AI & TECHNOLOGY
  ai: {
    solutions: [
      { name: "Forecasting Models", keywords: "forecasting,ai", price: "Project Basis" },
      { name: "Computer Vision", keywords: "vision,ai", price: "Project Basis" },
      { name: "Conversational Chat", keywords: "chat,ai", price: "Monthly" }
    ],
    data: [
      { name: "Data Pipelines", keywords: "pipelines,data,ai", price: "Project Basis" },
      { name: "Data Warehouses", keywords: "warehouses,data,ai", price: "Project Basis" },
      { name: "Data APIs", keywords: "apis,data,ai", price: "Monthly" }
    ],
    integration: [
      { name: "ERP Integration", keywords: "erp,integration,ai", price: "Project Basis" },
      { name: "E‑commerce Integration", keywords: "e-commerce,integration,ai", price: "Project Basis" },
      { name: "Mobile Apps", keywords: "mobile,integration,ai", price: "Project Basis" }
    ],
    support: [
      { name: "SLAs", keywords: "slas,support,ai", price: "Monthly" },
      { name: "Training & Enablement", keywords: "training,support,ai", price: "Per Session" },
      { name: "Documentation", keywords: "docs,support,ai", price: "Included" }
    ]
  },
  
  // 5. GLOBAL SOURCING
  sourcing: [
    { 
        name: "OEM / ODM Manufacturing", 
        keywords: "manufacturing,factory,production", 
        desc: "End-to-end product development and mass production facilities.",
        icon: "🏭"
    },
    { 
        name: "Private Label Development", 
        keywords: "brand,label,design", 
        desc: "Custom branding solutions for retailers and e-commerce.",
        icon: "🏷️"
    },
    { 
        name: "Quality Control & Inspection", 
        keywords: "quality,inspection,checklist", 
        desc: "Rigorous testing and factory audits to ensure compliance.",
        icon: "✅"
    },
    { 
        name: "Global Logistics & Freight", 
        keywords: "logistics,ship,cargo", 
        desc: "Seamless shipping by air, sea, and land.",
        icon: "🚢"
    },
    { 
        name: "Supply Chain Strategy", 
        keywords: "strategy,consulting,meeting", 
        desc: "Optimizing your supply chain for efficiency and cost reduction.",
        icon: "📈"
    },
    { 
        name: "Sustainable Sourcing", 
        keywords: "sustainable,eco,green", 
        desc: "Ethical and eco-friendly sourcing solutions.",
        icon: "🌱"
    },
    { 
        name: "Technology & Innovation", 
        keywords: "technology,ai,blockchain,digital", 
        desc: "AI-powered supplier matching and blockchain traceability.",
        icon: "🤖"
    },
    { 
        name: "Government & Industrial Projects", 
        keywords: "government,infrastructure,epc,building", 
        desc: "Turnkey procurement for public sector and large-scale infrastructure.",
        icon: "🏛️"
    }
  ]
};

/**
 * Helper to get a high-quality Unsplash image based on keywords
 */
const UNSPLASH_MAP = {
    // --- TEXTILES & APPAREL ---
    'suit': 'm0ZBWRYYq7o', // Man in suit
    'men': 'm0ZBWRYYq7o',
    'shirt': 'WBN-J1_w7Rw', // White shirt
    'denim': 'B00k_1iHnZk', // Denim texture
    'polo': 'WBN-J1_w7Rw',
    'leather': 'MQuL6b1_v4E', // Leather jacket/texture
    'jacket': 'MQuL6b1_v4E',
    'gown': '9Pspyy5lEMw', // Elegant dress
    'dress': 'P-J4kbEIEk0', // Floral dress
    'floral': 'P-J4kbEIEk0',
    'silk': 'cjUOhrBquqc', // Silk fabric
    'blouse': 'WBN-J1_w7Rw',
    'handbag': '9Pspyy5lEMw',
    'fashion': '9Pspyy5lEMw',
    'boy': '5UL65v055Fg', // Kid
    'tshirt': 'S-2Uq7sYj30', // T-shirt
    'girl': 'P-J4kbEIEk0',
    'women': '9Pspyy5lEMw',
    'jeans': 'B00k_1iHnZk',
    'kids': '5UL65v055Fg',
    'uniform': 'WBN-J1_w7Rw',
    'school': 'WBN-J1_w7Rw',
    'hoodie': '5UL65v055Fg',
    'pajamas': '5UL65v055Fg',
    'shoes': 'WBN-J1_w7Rw',
    'sneakers': 'WBN-J1_w7Rw',
    'bedsheet': 'G7sE2S4Lab4', // Luxury Bedding
    'bedroom': 'G7sE2S4Lab4',
    'towel': '8wTPqxlnKM4', // Towels
    'bathroom': '8wTPqxlnKM4',
    'cushion': 'G7sE2S4Lab4',
    'decor': 'G7sE2S4Lab4',
    'apron': 'WBN-J1_w7Rw',
    'kitchen': '8wTPqxlnKM4',

    // --- FMCG (FOOD & BEVERAGE) ---
    'rice': 'VmBToKkQ8ac', // Rice bowl
    'basmati': 'VmBToKkQ8ac',
    'grain': 'VmBToKkQ8ac',
    'flour': 'KxJ8r8yqQ7o', // Flour/Wheat
    'wheat': 'KxJ8r8yqQ7o',
    'lentils': 'uDnW85d_N7w', // Spices/Legumes
    'red': 'uDnW85d_N7w',
    'oats': 'KxJ8r8yqQ7o',
    'oil': 'PLyJqE4_W3I', // Olive Oil/Cooking Oil
    'sunflower': 'PLyJqE4_W3I',
    'bottle': 'PLyJqE4_W3I',
    'olive': 'PLyJqE4_W3I',
    'ghee': 'PLyJqE4_W3I',
    'butter': 'PLyJqE4_W3I',
    'spices': 'uDnW85d_N7w', // Spices market
    'bowl': 'VmBToKkQ8ac',
    'noodles': 'VmBToKkQ8ac',
    'cookies': 'S-2Uq7sYj30', // Generic food
    'chocolate': 'S-2Uq7sYj30',
    'chips': 'S-2Uq7sYj30',
    'snack': 'S-2Uq7sYj30',
    'corn': 'KxJ8r8yqQ7o',
    'canned': 'PLyJqE4_W3I',
    'milk': '8wTPqxlnKM4', // Clean white/dairy vibe
    'carton': '8wTPqxlnKM4',
    'cheese': '8wTPqxlnKM4',
    'block': '8wTPqxlnKM4',
    'juice': 'PLyJqE4_W3I',
    'glass': 'PLyJqE4_W3I',
    'coffee': 'n_3kdpSkrKw', // Coffee beans
    'jar': 'n_3kdpSkrKw',
    'toothpaste': 't8hTmte4Oyo', // Soap/Personal care
    'tube': 't8hTmte4Oyo',
    'soap': 't8hTmte4Oyo',
    'bar': 't8hTmte4Oyo',
    'shampoo': 't8hTmte4Oyo',
    'detergent': '8wTPqxlnKM4',
    'laundry': '8wTPqxlnKM4',
    'dishwashing': '8wTPqxlnKM4',
    'liquid': 'PLyJqE4_W3I',

    // --- INDUSTRIAL & MINERALS ---
    'cnc': 'Cj4_Q-l_s4I', // CNC Machine/Factory
    'machine': 'Cj4_Q-l_s4I',
    'factory': 'H6d6jIaO9WE', // Large factory
    'helmet': 'tE6th1h6Bfk', // Safety gear
    'safety': 'tE6th1h6Bfk',
    'vest': 'tE6th1h6Bfk',
    'copper': 'B00k_1iHnZk', // Metallic texture (placeholder)
    'wire': 'B00k_1iHnZk',
    'industrial': 'H6d6jIaO9WE',
    'iron': 'H6d6jIaO9WE',
    'ore': 'H6d6jIaO9WE',
    'mining': 'H6d6jIaO9WE',

    // --- COMMODITIES ---
    'rig': 'Ej2FQy1W7z4',
    'ocean': 'Ej2FQy1W7z4',
    'gas': 'Ej2FQy1W7z4',
    'tanker': '0A7YwYhZhWw',
    'ship': '0A7YwYhZhWw',
    'coal': 'H6d6jIaO9WE',
    'mine': 'H6d6jIaO9WE',
    'fuel': 'Ej2FQy1W7z4',
    'truck': '0A7YwYhZhWw',
    'gold': 'ktXmcyqYx54', // Gold bars
    'bars': 'ktXmcyqYx54',
    'silver': 'ktXmcyqYx54', // Use gold as precious metal fallback
    'metal': 'ktXmcyqYx54',
    'aluminum': 'H6d6jIaO9WE',
    'steel': 'H6d6jIaO9WE',
    'construction': 'H6d6jIaO9WE',
    'pipeline': 'H6d6jIaO9WE',
    'storage': 'H6d6jIaO9WE',
    'terminal': '0A7YwYhZhWw',
    'port': '0A7YwYhZhWw',
    'refinery': 'H6d6jIaO9WE',
    'distribution': '0A7YwYhZhWw',
    'epc': 'H6d6jIaO9WE',
    'hse': 'tE6th1h6Bfk',
    'inspection': 'tE6th1h6Bfk',
    'field': '_rXmtIMnOT8', // Wheat field
    'soybean': '_rXmtIMnOT8',
    'sugar': '_rXmtIMnOT8',
    'cane': '_rXmtIMnOT8',
    'palm': '_rXmtIMnOT8',
    'plantation': '_rXmtIMnOT8',
    'beans': 'n_3kdpSkrKw', // Coffee beans
    'cocoa': 'n_3kdpSkrKw',
    'fertilizer': '_rXmtIMnOT8',
    'farm': '_rXmtIMnOT8',
    'chemical': 'H6d6jIaO9WE',
    'rock': 'H6d6jIaO9WE',
    'salt': 'H6d6jIaO9WE',
    'pile': 'H6d6jIaO9WE',
    'sulphur': 'H6d6jIaO9WE',
    'yellow': 'H6d6jIaO9WE',
    'agri': '_rXmtIMnOT8',
    'beef': 'uDnW85d_N7w', // Meat/Food
    'steak': 'uDnW85d_N7w',
    'poultry': 'uDnW85d_N7w',
    'chicken': 'uDnW85d_N7w',
    'meat': 'uDnW85d_N7w',
    'fish': 'uDnW85d_N7w',
    'seafood': 'uDnW85d_N7w',
    'meal': 'uDnW85d_N7w',
    'feed': '_rXmtIMnOT8',
    'lithium': 'ktXmcyqYx54', // Precious material
    'battery': 'ktXmcyqYx54',
    'nickel': 'H6d6jIaO9WE',

    // --- SOURCING & LOGISTICS ---
    'home': '1616486338812-3dadae4b4f9d', // Home Textiles
    'curtains': 'cjUOhrBquqc', // Silk/Curtains
    'bedding': '1522771753035-48498225e6ab', // Bedding
    'towels': 'm8wsQ_8cd2M', // Towels stack
    'office': 'corporate office',
    'meeting': 'business meeting,boardroom',
    'strategy': 'global strategy,world map',
    'logistics': 'FMCG%20IMAGES/Frozen%20Foods/Chicken%20Nuggets/chicken%20nuggets.png',
    'manufacturing': 'manufacturing,factory,machinery',
    'team': 'diverse team,people,coworking',
    'partnership': 'partnership,handshake,business',
    'fmcg': 'FMCG%20IMAGES/Snacks/Chips%20and%20Crisps/chips%20and%20crisp.png',
    'textiles': 'FMCG%20IMAGES/Pastas/pasta%20(5).png',
    'industrial': 'FMCG%20IMAGES/Culinary/Seasoning,Spices%20and%20Marinade/SPices.png',
    // --- CATEGORY ALIASES (TOP 10) ---
    'commodities': 'FMCG%20IMAGES/Pastas/pasta%20(4).png',
    'minerals': 'minerals,ore,rock',
    'oil-gas': 'FMCG%20IMAGES/Culinary/Cooking%20Oil,%20Fats%20and%20Dressing/cooking%20oil.png',
    'real estate': 'modern building,architecture',
    'sourcing': 'FMCG%20IMAGES/Frozen%20Foods/Chicken%20Nuggets/chicken%20nuggets.png',
    'finance': 'finance,analytics,charts',
    'ai': 'ai,technology',
    'metals': 'metals,steel',
    'buildings': 'modern building,architecture',
    'office': 'corporate office',
    'retail': 'retail,shopping,mall',
    'mixed-use': '1486406146926-c627a92ad1ab',
    'apartments': '1486406146926-c627a92ad1ab',
    'villas': '1486406146926-c627a92ad1ab',
    'community': '1486406146926-c627a92ad1ab',
    'warehouses': 'warehouse,logistics',
    'parks': 'industrial park',
    'sez': 'industrial zone',
    'leasing': 'leasing,contract',
    'fm': 'facilities management',
    // --- M&S style apparel keywords ---
    'chinos': '1454165804606-c3d57bc86b40',
    'merino': '1454165804606-c3d57bc86b40',
    'blazer': '1486406146926-c627a92ad1ab',
    'overcoat': '1486406146926-c627a92ad1ab',
    'parka': '1565514020176-db5928a57342',
    'stormwear': '1565514020176-db5928a57342',
    'sportswear': '1565514020176-db5928a57342',
    'trainers': '1516321318423-f06f85e504b3',
    'boots': '1516321318423-f06f85e504b3',
    'loungewear': '1596524430623-6ce64b9c546a',
    'pyjamas': '1596524430623-6ce64b9c546a',
    'dressing-gown': '1596524430623-6ce64b9c546a',
    'bra': '1516321318423-f06f85e504b3',
    'knickers': '1516321318423-f06f85e504b3',
    'shapewear': '1516321318423-f06f85e504b3',
    'sports-bra': '1516321318423-f06f85e504b3',
    'tights': '1516321318423-f06f85e504b3',
    'nightwear': '1596524430623-6ce64b9c546a',
    
    // --- FINANCE & HPAY ---
    'lc': '1524661135-423995f22d0b',
    'sblc': '1524661135-423995f22d0b',
    'forfaiting': '1524661135-423995f22d0b',
    'wallets': '1516321318423-f06f85e504b3',
    'payments': '1516321318423-f06f85e504b3',
    'gateway': '1516321318423-f06f85e504b3',
    'bills': '1596524430623-6ce64b9c546a',
    'reconciliation': '1524661135-423995f22d0b',
    'reports': '1524661135-423995f22d0b',
    'kyc': '1516321318423-f06f85e504b3',
    'aml': '1516321318423-f06f85e504b3',
    'scoring': '1524661135-423995f22d0b',
    
    // --- AI & TECHNOLOGY ---
    'forecasting': 'forecast,analytics,charts',
    'vision': 'ai,computer vision',
    'chat': 'chatbot,ai assistant',
    'pipelines': 'data pipeline,etl',
    'warehouses': 'warehouse,logistics',
    'apis': 'api,developer',
    'erp': 'erp,enterprise systems',
    'e-commerce': 'ecommerce,online store',
    'mobile': 'mobile app,smartphone',
    'slas': 'sla,contract,service level',
    'training': 'training,workshop',
    'docs': 'documentation,writing',
    'building': 'modern building,architecture',
    'map': 'APPLE%20EXAMPLE/apple%20header%20picture.jpg',
    'world': 'APPLE%20EXAMPLE/apple%20header%20picture.jpg',
    'globe': 'APPLE%20EXAMPLE/apple%20header%20picture.jpg',
    'services': 'FMCG%20IMAGES/Beverages/Carbonated/carbonated.png',
    'about': 'FMCG%20IMAGES/Product%20Photos/A%20Pop%20of%20Fun%20in%20Every%20Bite!%20(1).png',
    'competence': 'FMCG%20IMAGES/Confectionary/Jelly/bearpops.jpg',
    'industry': 'FMCG%20IMAGES/Culinary/Seasoning,Spices%20and%20Marinade/SPices.png',
    'apparel': 'FMCG%20IMAGES/Pastas/pasta%20(5).png',
    'oil': 'FMCG%20IMAGES/Culinary/Cooking%20Oil,%20Fats%20and%20Dressing/cooking%20oil.png',
    'gas': 'FMCG%20IMAGES/Culinary/Cooking%20Oil,%20Fats%20and%20Dressing/cooking%20oil.png',
    'supply': 'FMCG%20IMAGES/Frozen%20Foods/Chicken%20Nuggets/chicken%20nuggets.png',
    'email': 'typing,keyboard,email',
    'phone': 'phone,communication',

    // --- DEFAULTS ---
    'default': 'APPLE%20EXAMPLE/apple%20header%20picture.jpg'
};

/**
 * Helper function to get image URL from keywords
 * @param {string} keywords - Comma separated keywords
 * @returns {string} - Image URL
 */










function getProductImage(keywords) {
    const makeUrl = (token) => {
        if (!token) return null;
        if (token.includes('/') || token.includes('.')) return token;
        const isPhotoId = /^\d{10,}-[a-z0-9]+$/i.test(token);
        if (isPhotoId) return `https://images.unsplash.com/photo-${token}?auto=format&fit=crop&w=1600&q=80`;
        return `https://source.unsplash.com/1600x1000/?${encodeURIComponent(token)}`;
    };
    const def = makeUrl(UNSPLASH_MAP.default) || `https://source.unsplash.com/1600x1000/?world,map`;
    if (!keywords) return def;
    const keys = keywords.toLowerCase().split(',').map(k => k.trim());
    for (const key of keys) {
        if (UNSPLASH_MAP[key]) {
            const val = makeUrl(UNSPLASH_MAP[key]);
            if (val) return val;
        }
    }
    for (const key of keys) {
        for (const mapKey in UNSPLASH_MAP) {
            if (mapKey.includes(key) || key.includes(mapKey)) {
                const val = makeUrl(UNSPLASH_MAP[mapKey]);
                if (val) return val;
            }
        }
    }
    return def;
}

/**
 * Helper to render a product grid
 * @param {string} containerId - ID of the container element
 * @param {Array} products - Array of product objects
 */
function renderProductGrid(containerId, products) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.classList.add('product-grid');
    container.innerHTML = products.map(product => {
        const imageUrl = getProductImage(product.keywords);
        return `
        <div class="product-card">
            <div class="product-image" style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;"></div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">${product.price}</div>
            </div>
        </div>
        `;
    }).join('');
}
