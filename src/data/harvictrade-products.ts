export interface HarvicProduct {
  name: string
  origin: string
  moq: string
  price: string
  category: string
  categorySlug: string
  verified: boolean
  subcategory?: string
}

export const ALL_PRODUCTS: HarvicProduct[] = [
  // Textiles & Apparel
  { name: 'Hi-Vis Safety Jacket EN20471 Class 3', origin: 'Turkey', moq: '500 pcs', price: '$8.50–12.00', category: 'Textiles & Apparel', categorySlug: 'textiles', verified: true, subcategory: 'Workwear & Safety Apparel' },
  { name: 'FR Coverall NFPA 2112 — Navy Blue', origin: 'Pakistan', moq: '300 pcs', price: '$18.00–28.00', category: 'Textiles & Apparel', categorySlug: 'textiles', verified: true, subcategory: 'Workwear & Safety Apparel' },
  { name: 'Safety Boot S3 — Steel Toe Cap', origin: 'China', moq: '200 pairs', price: '$12.00–22.00', category: 'Textiles & Apparel', categorySlug: 'textiles', verified: true, subcategory: 'Workwear & Safety Apparel' },
  { name: 'Cargo Work Trousers — Multi-Pocket', origin: 'Bangladesh', moq: '500 pcs', price: '$6.50–9.00', category: 'Textiles & Apparel', categorySlug: 'textiles', verified: true, subcategory: 'Workwear & Safety Apparel' },
  { name: 'Combed Cotton T-Shirt 180 GSM', origin: 'Bangladesh', moq: '1,000 pcs', price: '$2.80–4.50', category: 'Textiles & Apparel', categorySlug: 'textiles', verified: true, subcategory: 'Cotton Basics' },
  { name: 'Cotton Polo Shirt — Piqué 220 GSM', origin: 'Pakistan', moq: '500 pcs', price: '$4.50–7.00', category: 'Textiles & Apparel', categorySlug: 'textiles', verified: true, subcategory: 'Cotton Basics' },
  { name: "Men's Chino Trousers — Stretch Cotton", origin: 'Bangladesh', moq: '500 pcs', price: '$7.00–11.00', category: 'Textiles & Apparel', categorySlug: 'textiles', verified: true, subcategory: 'Cotton Basics' },
  { name: 'Cotton Bed Sheet Set — 300 TC', origin: 'Pakistan', moq: '200 sets', price: '$12.00–18.00', category: 'Textiles & Apparel', categorySlug: 'textiles', verified: true, subcategory: 'Home Textiles' },
  { name: 'Bath Towel Set — 600 GSM Egyptian Cotton', origin: 'Pakistan', moq: '500 pcs', price: '$4.50–8.00', category: 'Textiles & Apparel', categorySlug: 'textiles', verified: true, subcategory: 'Home Textiles' },
  { name: 'Denim Fabric 10oz — Indigo', origin: 'Turkey', moq: '3,000 yards', price: '$2.50–4.00/yard', category: 'Textiles & Apparel', categorySlug: 'textiles', verified: true, subcategory: 'Fabrics' },
  { name: 'Greige Cotton Fabric — 40s Combed', origin: 'Pakistan', moq: '5,000 yards', price: '$1.20–1.80/yard', category: 'Textiles & Apparel', categorySlug: 'textiles', verified: true, subcategory: 'Fabrics' },

  // FMCG & Food
  { name: 'Wafer Bar Assortment — Private Label', origin: 'Spain', moq: '500 cartons', price: '$0.35–0.55/unit', category: 'FMCG & Food', categorySlug: 'fmcg', verified: true, subcategory: 'Snacks & Confectionery' },
  { name: 'Premium Chocolate Gift Box — 200g', origin: 'Belgium', moq: '1,000 boxes', price: '$3.50–5.50', category: 'FMCG & Food', categorySlug: 'fmcg', verified: true, subcategory: 'Snacks & Confectionery' },
  { name: 'Biscuit Assortment Tin — 400g', origin: 'Turkey', moq: '500 tins', price: '$2.20–3.80', category: 'FMCG & Food', categorySlug: 'fmcg', verified: true, subcategory: 'Snacks & Confectionery' },
  { name: 'Extra Virgin Olive Oil — 1L Glass', origin: 'Spain', moq: '1 pallet', price: '$4.20–5.80/L', category: 'FMCG & Food', categorySlug: 'fmcg', verified: true, subcategory: 'Sauces & Condiments' },
  { name: 'Tomato Ketchup — 340g Squeeze', origin: 'Italy', moq: '500 cartons', price: '$1.00–1.60', category: 'FMCG & Food', categorySlug: 'fmcg', verified: true, subcategory: 'Sauces & Condiments' },
  { name: 'Natural Spring Water — 500ml', origin: 'Turkey', moq: '1 FCL', price: '$0.08–0.15/unit', category: 'FMCG & Food', categorySlug: 'fmcg', verified: true, subcategory: 'Beverages' },
  { name: 'Energy Drink — 250ml Can', origin: 'Austria', moq: '1 pallet', price: '$0.50–0.80/can', category: 'FMCG & Food', categorySlug: 'fmcg', verified: true, subcategory: 'Beverages' },
  { name: 'Antibacterial Hand Wash — 500ml', origin: 'Turkey', moq: '1,000 pcs', price: '$0.80–1.40', category: 'FMCG & Food', categorySlug: 'fmcg', verified: true, subcategory: 'Personal Care' },

  // Commodities
  { name: 'Premium Basmati Rice 1121 Sella', origin: 'Pakistan', moq: '25 MT', price: '$850–950/MT', category: 'Commodities', categorySlug: 'commodities', verified: true, subcategory: 'Rice & Grains' },
  { name: 'Thai Jasmine Rice 100%', origin: 'Thailand', moq: '25 MT', price: '$620–750/MT', category: 'Commodities', categorySlug: 'commodities', verified: true, subcategory: 'Rice & Grains' },
  { name: 'ICUMSA 45 White Refined Sugar', origin: 'Brazil', moq: '100 MT', price: '$450–520/MT', category: 'Commodities', categorySlug: 'commodities', verified: true, subcategory: 'Sugar & Sweeteners' },
  { name: 'RBD Palm Olein CP10', origin: 'Malaysia', moq: '1 FCL', price: '$880–1,050/MT', category: 'Commodities', categorySlug: 'commodities', verified: true, subcategory: 'Edible Oils' },
  { name: 'Cold Pressed Coconut Oil — Virgin', origin: 'Sri Lanka', moq: '5 MT', price: '$1,800–2,200/MT', category: 'Commodities', categorySlug: 'commodities', verified: true, subcategory: 'Edible Oils' },
  { name: 'Sunflower Oil — Crude', origin: 'Ukraine', moq: '25 MT', price: '$950–1,100/MT', category: 'Commodities', categorySlug: 'commodities', verified: true, subcategory: 'Edible Oils' },
  { name: 'Black Pepper — ASTA 550', origin: 'Vietnam', moq: '5 MT', price: '$3,800–4,500/MT', category: 'Commodities', categorySlug: 'commodities', verified: true, subcategory: 'Spices & Pulses' },
  { name: 'Turmeric Powder — High Curcumin', origin: 'India', moq: '5 MT', price: '$1,500–2,000/MT', category: 'Commodities', categorySlug: 'commodities', verified: true, subcategory: 'Spices & Pulses' },

  // Industrial & PPE
  { name: 'Hard Hat — HDPE Class E', origin: 'China', moq: '500 pcs', price: '$2.50–4.50', category: 'Industrial & PPE', categorySlug: 'industrial', verified: true, subcategory: 'PPE & Safety Equipment' },
  { name: 'Nitrile Gloves — Powder Free Box/100', origin: 'Malaysia', moq: '10,000 boxes', price: '$3.50–5.00/box', category: 'Industrial & PPE', categorySlug: 'industrial', verified: true, subcategory: 'PPE & Safety Equipment' },
  { name: 'Ear Defenders — SNR 32dB', origin: 'Germany', moq: '500 pcs', price: '$5.00–8.50', category: 'Industrial & PPE', categorySlug: 'industrial', verified: true, subcategory: 'PPE & Safety Equipment' },
  { name: 'Portland Cement 42.5N — Bulk', origin: 'UAE', moq: '100 MT', price: '$62–78/MT', category: 'Industrial & PPE', categorySlug: 'industrial', verified: true, subcategory: 'Construction Materials' },
  { name: 'Rebar Steel 12mm — A615 Grade 60', origin: 'Turkey', moq: '25 MT', price: '$550–680/MT', category: 'Industrial & PPE', categorySlug: 'industrial', verified: true, subcategory: 'Construction Materials' },
  { name: 'Caustic Soda Flakes 99%', origin: 'China', moq: '25 MT', price: '$350–450/MT', category: 'Industrial & PPE', categorySlug: 'industrial', verified: true, subcategory: 'Industrial Chemicals' },
  { name: 'Fire Extinguisher ABC 6kg', origin: 'UAE', moq: '50 units', price: '$22–35', category: 'Industrial & PPE', categorySlug: 'industrial', verified: true, subcategory: 'MRO & Tools' },

  // Minerals & Metals
  { name: 'Copper Cathode Grade A — LME Registered', origin: 'Chile', moq: '25 MT', price: 'LME + Premium', category: 'Minerals & Metals', categorySlug: 'minerals', verified: true, subcategory: 'Base Metals' },
  { name: 'Zinc Ingots 99.995% — SHG', origin: 'India', moq: '25 MT', price: 'LME + Premium', category: 'Minerals & Metals', categorySlug: 'minerals', verified: true, subcategory: 'Base Metals' },
  { name: 'Aluminium Ingots A7 99.7%', origin: 'UAE', moq: '25 MT', price: 'LME + Premium', category: 'Minerals & Metals', categorySlug: 'minerals', verified: true, subcategory: 'Base Metals' },
  { name: 'Iron Ore Fines — 62% Fe', origin: 'South Africa', moq: '50,000 MT', price: 'Index Linked', category: 'Minerals & Metals', categorySlug: 'minerals', verified: true, subcategory: 'Iron Ore & Steel' },
  { name: 'HMS 1&2 (80:20) Scrap Steel', origin: 'UK', moq: '5,000 MT', price: '$320–380/MT', category: 'Minerals & Metals', categorySlug: 'minerals', verified: true, subcategory: 'Iron Ore & Steel' },
  { name: 'Gold Dore Bars — 85%+ Purity', origin: 'Ghana', moq: '1 kg', price: 'LBMA Fix', category: 'Minerals & Metals', categorySlug: 'minerals', verified: true, subcategory: 'Precious Metals' },
  { name: 'Silica Sand 99.5% — 30/50 Mesh', origin: 'Egypt', moq: '50 MT', price: '$35–55/MT', category: 'Minerals & Metals', categorySlug: 'minerals', verified: true, subcategory: 'Industrial Minerals' },

  // Consumer Electronics (Harvyoice)
  { name: 'iPhone 17 Pro Max — 256GB', origin: 'Global', moq: '10 units', price: '$1,199–1,399', category: 'Consumer Electronics', categorySlug: 'electronics', verified: true, subcategory: 'Apple — iPhone' },
  { name: 'iPhone 17 — 128GB', origin: 'Global', moq: '10 units', price: '$799–899', category: 'Consumer Electronics', categorySlug: 'electronics', verified: true, subcategory: 'Apple — iPhone' },
  { name: 'MacBook Pro M4 — 14"', origin: 'Global', moq: '5 units', price: '$1,999–2,499', category: 'Consumer Electronics', categorySlug: 'electronics', verified: true, subcategory: 'Apple — Mac' },
  { name: 'MacBook Air M4 — 13"', origin: 'Global', moq: '5 units', price: '$1,099–1,299', category: 'Consumer Electronics', categorySlug: 'electronics', verified: true, subcategory: 'Apple — Mac' },
  { name: 'iPad Pro M4 — 11"', origin: 'Global', moq: '5 units', price: '$999–1,199', category: 'Consumer Electronics', categorySlug: 'electronics', verified: true, subcategory: 'Apple — iPad' },
  { name: 'Apple Watch Ultra 3', origin: 'Global', moq: '10 units', price: '$799–899', category: 'Consumer Electronics', categorySlug: 'electronics', verified: true, subcategory: 'Apple — Watch & AirPods' },
  { name: 'AirPods Pro 3', origin: 'Global', moq: '20 units', price: '$249–299', category: 'Consumer Electronics', categorySlug: 'electronics', verified: true, subcategory: 'Apple — Watch & AirPods' },
  { name: 'Samsung Galaxy S25 Ultra — 256GB', origin: 'Global', moq: '10 units', price: '$1,099–1,299', category: 'Consumer Electronics', categorySlug: 'electronics', verified: true, subcategory: 'Samsung' },
  { name: 'Samsung Galaxy S25 — 128GB', origin: 'Global', moq: '10 units', price: '$799–899', category: 'Consumer Electronics', categorySlug: 'electronics', verified: true, subcategory: 'Samsung' },
  { name: 'Google Pixel 10 Pro', origin: 'Global', moq: '10 units', price: '$999–1,099', category: 'Consumer Electronics', categorySlug: 'electronics', verified: true, subcategory: 'Google & Others' },
  { name: 'Xiaomi 15 Ultra', origin: 'China', moq: '20 units', price: '$899–999', category: 'Consumer Electronics', categorySlug: 'electronics', verified: true, subcategory: 'Google & Others' },

  // Oil, Gas & Energy
  { name: 'Diesel EN590 10ppm — FOB', origin: 'UAE', moq: '5,000 MT', price: 'Platts Linked', category: 'Oil, Gas & Energy', categorySlug: 'energy', verified: true, subcategory: 'Refined Products' },
  { name: 'Jet Fuel A-1 — Colonial Pipeline Spec', origin: 'UAE', moq: '5,000 MT', price: 'Platts Linked', category: 'Oil, Gas & Energy', categorySlug: 'energy', verified: true, subcategory: 'Refined Products' },
  { name: 'LPG Propane/Butane Mix 60:40', origin: 'Saudi Arabia', moq: '1,000 MT', price: 'Saudi CP Linked', category: 'Oil, Gas & Energy', categorySlug: 'energy', verified: true, subcategory: 'LPG & Gas' },
  { name: 'Polypropylene Homo — Injection Grade', origin: 'Saudi Arabia', moq: '25 MT', price: '$1,100–1,350/MT', category: 'Oil, Gas & Energy', categorySlug: 'energy', verified: true, subcategory: 'Petrochemicals' },
  { name: 'PVC Resin SG-5 K67', origin: 'China', moq: '25 MT', price: '$750–900/MT', category: 'Oil, Gas & Energy', categorySlug: 'energy', verified: true, subcategory: 'Petrochemicals' },
]

export const CATEGORY_META = [
  { slug: 'textiles', name: 'Textiles & Apparel', count: '2,400+', desc: 'Workwear, fashion basics, home textiles, raw fabrics', abbr: 'TX' },
  { slug: 'fmcg', name: 'FMCG & Food', count: '3,100+', desc: 'Snacks, beverages, sauces, personal care', abbr: 'FG' },
  { slug: 'commodities', name: 'Commodities', count: '850+', desc: 'Rice, sugar, edible oils, spices, pulses', abbr: 'CM' },
  { slug: 'industrial', name: 'Industrial & PPE', count: '1,200+', desc: 'Safety equipment, chemicals, construction', abbr: 'IN' },
  { slug: 'minerals', name: 'Minerals & Metals', count: '420+', desc: 'Base metals, ores, precious metals', abbr: 'MM' },
  { slug: 'energy', name: 'Oil, Gas & Energy', count: '180+', desc: 'Refined products, LPG, petrochemicals', abbr: 'EN' },
  { slug: 'electronics', name: 'Consumer Electronics', count: '180+', desc: 'Apple, Samsung, Xiaomi — flagship devices, accessories, bulk B2B', abbr: 'CE' },
]
