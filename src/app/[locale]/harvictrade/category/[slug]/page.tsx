// Header and Footer are provided by layout.tsx - DO NOT import them here
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductImage } from '@/data/harvictradeImages'

const categoryHero: Record<string, string> = {
  textiles: '/assets/harvictrade/heroes/textiles-hero.jpg',
  fmcg: '/assets/harvictrade/heroes/fmcg-hero.jpg',
  commodities: '/assets/harvictrade/heroes/commodities-hero.jpg',
  industrial: '/assets/harvictrade/heroes/industrial-hero.jpg',
  minerals: '/assets/harvictrade/heroes/minerals-hero.jpg',
  energy: '/assets/harvictrade/heroes/energy-hero.jpg',
  electronics: '/assets/harvictrade/heroes/electronics-hero.jpg',
}

const categoryData: Record<string, { name: string; icon: string; desc: string; subcategories: { name: string; count: number; products: { name: string; origin: string; moq: string; price: string; verified: boolean }[] }[] }> = {
  textiles: {
    name: 'Textiles & Apparel', icon: '🧵',
    desc: 'Source textiles, garments, workwear, home textiles, and fabric from verified manufacturers across Pakistan, Bangladesh, Turkey, India, and China.',
    subcategories: [
      { name: 'Workwear & Safety Apparel', count: 620, products: [
        { name: 'Hi-Vis Safety Jacket EN20471 Class 3', origin: 'Turkey', moq: '500 pcs', price: '$8.50–12.00', verified: true },
        { name: 'FR Coverall NFPA 2112 — Navy Blue', origin: 'Pakistan', moq: '300 pcs', price: '$18.00–28.00', verified: true },
        { name: 'Safety Boot S3 — Steel Toe Cap', origin: 'China', moq: '200 pairs', price: '$12.00–22.00', verified: true },
        { name: 'Cargo Work Trousers — Multi-Pocket', origin: 'Bangladesh', moq: '500 pcs', price: '$6.50–9.00', verified: true },
      ]},
      { name: 'Cotton Basics & Casual', count: 480, products: [
        { name: 'Combed Cotton T-Shirt 180 GSM', origin: 'Bangladesh', moq: '1,000 pcs', price: '$2.80–4.50', verified: true },
        { name: 'Cotton Polo Shirt — Piqué 220 GSM', origin: 'Pakistan', moq: '500 pcs', price: '$4.50–7.00', verified: true },
        { name: 'Men\'s Chino Trousers — Stretch Cotton', origin: 'Bangladesh', moq: '500 pcs', price: '$7.00–11.00', verified: true },
        { name: 'Women\'s Cotton Blouse — Printed', origin: 'India', moq: '300 pcs', price: '$5.00–8.50', verified: true },
      ]},
      { name: 'Home Textiles', count: 340, products: [
        { name: 'Cotton Bed Sheet Set — 300 TC', origin: 'Pakistan', moq: '200 sets', price: '$12.00–18.00', verified: true },
        { name: 'Bath Towel Set — 600 GSM Egyptian Cotton', origin: 'Pakistan', moq: '500 pcs', price: '$4.50–8.00', verified: true },
        { name: 'Kitchen Apron — Canvas/Cotton Blend', origin: 'India', moq: '1,000 pcs', price: '$2.00–3.50', verified: true },
      ]},
      { name: 'Fabrics & Raw Materials', count: 960, products: [
        { name: 'Greige Cotton Fabric — 40s Combed', origin: 'Pakistan', moq: '5,000 yards', price: '$1.20–1.80/yard', verified: true },
        { name: 'Polyester Taffeta 190T', origin: 'China', moq: '10,000 yards', price: '$0.45–0.65/yard', verified: true },
        { name: 'Denim Fabric 10oz — Indigo', origin: 'Turkey', moq: '3,000 yards', price: '$2.50–4.00/yard', verified: true },
      ]},
    ],
  },
  fmcg: {
    name: 'FMCG & Food', icon: '🛒',
    desc: 'Fast-moving consumer goods from European and Asian manufacturers. Snacks, beverages, sauces, confectionery, and personal care products.',
    subcategories: [
      { name: 'Snacks & Confectionery', count: 820, products: [
        { name: 'Wafer Bar Assortment — Private Label', origin: 'Spain', moq: '500 cartons', price: '$0.35–0.55/unit', verified: true },
        { name: 'Premium Chocolate Gift Box — 200g', origin: 'Belgium', moq: '1,000 boxes', price: '$3.50–5.50', verified: true },
        { name: 'Potato Chips — Multiple Flavours', origin: 'Spain', moq: '300 cartons', price: '$0.80–1.20/pack', verified: true },
        { name: 'Biscuit Assortment Tin — 400g', origin: 'Turkey', moq: '500 tins', price: '$2.20–3.80', verified: true },
      ]},
      { name: 'Sauces & Condiments', count: 450, products: [
        { name: 'Extra Virgin Olive Oil — 1L Glass', origin: 'Spain', moq: '1 pallet', price: '$4.20–5.80/L', verified: true },
        { name: 'Tomato Ketchup — 340g Squeeze', origin: 'Italy', moq: '500 cartons', price: '$1.00–1.60', verified: true },
        { name: 'Sriracha Hot Sauce — 455ml', origin: 'Thailand', moq: '500 cartons', price: '$1.80–2.50', verified: true },
      ]},
      { name: 'Beverages', count: 680, products: [
        { name: 'Natural Spring Water — 500ml', origin: 'Turkey', moq: '1 FCL', price: '$0.08–0.15/unit', verified: true },
        { name: 'Fruit Juice Pack — 200ml (Mango/Orange)', origin: 'UAE', moq: '1,000 cartons', price: '$0.25–0.40/unit', verified: true },
        { name: 'Energy Drink — 250ml Can', origin: 'Austria', moq: '1 pallet', price: '$0.50–0.80/can', verified: true },
      ]},
      { name: 'Personal Care & Home Care', count: 350, products: [
        { name: 'Antibacterial Hand Wash — 500ml', origin: 'Turkey', moq: '1,000 pcs', price: '$0.80–1.40', verified: true },
        { name: 'Laundry Detergent — 3L', origin: 'Egypt', moq: '500 pcs', price: '$1.50–2.50', verified: true },
      ]},
    ],
  },
  commodities: {
    name: 'Commodities', icon: '📦',
    desc: 'Agricultural and soft commodities sourced directly from origin. Rice, sugar, wheat, spices, edible oils, and pulses.',
    subcategories: [
      { name: 'Rice & Grains', count: 280, products: [
        { name: 'Premium Basmati Rice 1121 Sella', origin: 'Pakistan', moq: '25 MT', price: '$850–950/MT', verified: true },
        { name: 'Thai Jasmine Rice 100%', origin: 'Thailand', moq: '25 MT', price: '$620–750/MT', verified: true },
        { name: 'Yellow Corn — Animal Feed Grade', origin: 'Argentina', moq: '50 MT', price: '$230–280/MT', verified: true },
      ]},
      { name: 'Sugar & Sweeteners', count: 120, products: [
        { name: 'ICUMSA 45 White Refined Sugar', origin: 'Brazil', moq: '100 MT', price: '$450–520/MT', verified: true },
        { name: 'Raw Cane Sugar VHP', origin: 'Thailand', moq: '50 MT', price: '$380–440/MT', verified: true },
      ]},
      { name: 'Edible Oils', count: 180, products: [
        { name: 'RBD Palm Olein CP10', origin: 'Malaysia', moq: '1 FCL', price: '$880–1,050/MT', verified: true },
        { name: 'Cold Pressed Coconut Oil — Virgin', origin: 'Sri Lanka', moq: '5 MT', price: '$1,800–2,200/MT', verified: true },
        { name: 'Sunflower Oil — Crude', origin: 'Ukraine', moq: '25 MT', price: '$950–1,100/MT', verified: true },
      ]},
      { name: 'Spices & Pulses', count: 270, products: [
        { name: 'Turmeric Powder — High Curcumin', origin: 'India', moq: '5 MT', price: '$1,500–2,000/MT', verified: true },
        { name: 'Black Pepper — ASTA 550', origin: 'Vietnam', moq: '5 MT', price: '$3,800–4,500/MT', verified: true },
        { name: 'Red Lentils (Masoor Dal)', origin: 'Turkey', moq: '25 MT', price: '$680–780/MT', verified: true },
      ]},
    ],
  },
  industrial: {
    name: 'Industrial & PPE', icon: '🏭',
    desc: 'Safety equipment, industrial chemicals, machinery, and MRO supplies for construction, manufacturing, and oil & gas sectors.',
    subcategories: [
      { name: 'PPE & Safety Equipment', count: 450, products: [
        { name: 'Hard Hat — HDPE Class E', origin: 'China', moq: '500 pcs', price: '$2.50–4.50', verified: true },
        { name: 'Safety Goggles — Anti-Fog EN166', origin: 'Taiwan', moq: '1,000 pcs', price: '$1.80–3.20', verified: true },
        { name: 'Nitrile Gloves — Powder Free Box/100', origin: 'Malaysia', moq: '10,000 boxes', price: '$3.50–5.00/box', verified: true },
        { name: 'Ear Defenders — SNR 32dB', origin: 'Germany', moq: '500 pcs', price: '$5.00–8.50', verified: true },
      ]},
      { name: 'Construction Materials', count: 380, products: [
        { name: 'Portland Cement 42.5N — Bulk', origin: 'UAE', moq: '100 MT', price: '$62–78/MT', verified: true },
        { name: 'Rebar Steel 12mm — A615 Grade 60', origin: 'Turkey', moq: '25 MT', price: '$550–680/MT', verified: true },
        { name: 'PVC Pipes — 110mm SDR 41', origin: 'UAE', moq: '1,000 pcs', price: '$3.50–6.00', verified: true },
      ]},
      { name: 'Industrial Chemicals', count: 220, products: [
        { name: 'Caustic Soda Flakes 99%', origin: 'China', moq: '25 MT', price: '$350–450/MT', verified: true },
        { name: 'Calcium Carbonate — Ground 325 Mesh', origin: 'Egypt', moq: '25 MT', price: '$80–120/MT', verified: true },
      ]},
      { name: 'MRO & Tools', count: 150, products: [
        { name: 'First Aid Kit — 50 Person Workplace', origin: 'UK', moq: '100 kits', price: '$18–28', verified: true },
        { name: 'Fire Extinguisher ABC 6kg', origin: 'UAE', moq: '50 units', price: '$22–35', verified: true },
      ]},
    ],
  },
  minerals: {
    name: 'Minerals & Metals', icon: '⛏️',
    desc: 'Metallic and non-metallic minerals, ores, aggregates, and refined metals from verified mining operations.',
    subcategories: [
      { name: 'Base Metals', count: 180, products: [
        { name: 'Copper Cathode Grade A — LME Registered', origin: 'Chile', moq: '25 MT', price: 'LME + Premium', verified: true },
        { name: 'Zinc Ingots 99.995% — SHG', origin: 'India', moq: '25 MT', price: 'LME + Premium', verified: true },
        { name: 'Aluminium Ingots A7 99.7%', origin: 'UAE', moq: '25 MT', price: 'LME + Premium', verified: true },
      ]},
      { name: 'Iron Ore & Steel', count: 120, products: [
        { name: 'Iron Ore Fines — 62% Fe', origin: 'South Africa', moq: '50,000 MT', price: 'Index Linked', verified: true },
        { name: 'HMS 1&2 (80:20) Scrap Steel', origin: 'UK', moq: '5,000 MT', price: '$320–380/MT', verified: true },
      ]},
      { name: 'Precious Metals', count: 60, products: [
        { name: 'Gold Dore Bars — 85%+ Purity', origin: 'Ghana', moq: '1 kg', price: 'LBMA Fix', verified: true },
      ]},
      { name: 'Industrial Minerals', count: 60, products: [
        { name: 'Kaolin Clay — Water Washed', origin: 'India', moq: '25 MT', price: '$120–180/MT', verified: true },
        { name: 'Silica Sand 99.5% — 30/50 Mesh', origin: 'Egypt', moq: '50 MT', price: '$35–55/MT', verified: true },
      ]},
    ],
  },
  energy: {
    name: 'Oil, Gas & Energy', icon: '🛢️',
    desc: 'Crude oil, refined petroleum products, LPG, lubricants, and petrochemicals from authorized traders and producers.',
    subcategories: [
      { name: 'Refined Products', count: 80, products: [
        { name: 'Diesel EN590 10ppm — FOB', origin: 'UAE', moq: '5,000 MT', price: 'Platts Linked', verified: true },
        { name: 'Jet Fuel A-1 — Colonial Pipeline Spec', origin: 'UAE', moq: '5,000 MT', price: 'Platts Linked', verified: true },
        { name: 'Fuel Oil 380 CST — High Sulphur', origin: 'UAE', moq: '5,000 MT', price: 'Platts Linked', verified: true },
      ]},
      { name: 'LPG & Gas', count: 40, products: [
        { name: 'LPG Propane/Butane Mix 60:40', origin: 'Saudi Arabia', moq: '1,000 MT', price: 'Saudi CP Linked', verified: true },
      ]},
      { name: 'Lubricants & Base Oil', count: 35, products: [
        { name: 'Base Oil SN150 — Group I', origin: 'UAE', moq: '25 MT', price: '$620–750/MT', verified: true },
        { name: 'Engine Oil 15W-40 — Bulk', origin: 'UAE', moq: '5 MT', price: '$1.20–1.80/L', verified: true },
      ]},
      { name: 'Petrochemicals', count: 25, products: [
        { name: 'Polypropylene Homo — Injection Grade', origin: 'Saudi Arabia', moq: '25 MT', price: '$1,100–1,350/MT', verified: true },
        { name: 'PVC Resin SG-5 K67', origin: 'China', moq: '25 MT', price: '$750–900/MT', verified: true },
      ]},
    ],
  },
}

export async function generateStaticParams() {
  const locales = ['en', 'ar', 'fr', 'es', 'de', 'zh', 'he']
  const slugs = Object.keys(categoryData)
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export default async function CategoryPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const cat = categoryData[slug]
  if (!cat) notFound()

  const totalProducts = cat.subcategories.reduce((acc, sub) => acc + sub.count, 0)

  return (
    <main className="min-h-screen pt-[136px]" style={{ background: '#ffffff' }}>
      {/* Hero */}
      <section 
        className="relative py-16 px-4 border-b border-harvics-gold/40 overflow-hidden"
        style={{
          backgroundImage: `url(${categoryHero[slug] || '/assets/shared/heroes/harvictrade-hero.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-harvics-burgundy/80" />
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="flex items-center gap-2 text-xs text-white/50 mb-4">
            <Link href={`/${locale}/harvictrade`} className="hover:text-harvics-gold transition-colors">HarvicTrade</Link>
            <span>→</span>
            <span className="text-harvics-gold">{cat.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{cat.icon}</span>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>{cat.name}</h1>
              <p className="text-white/60 max-w-2xl">{cat.desc}</p>
            </div>
          </div>
          <div className="mt-6 flex gap-6">
            <div><span className="text-xl font-bold text-harvics-gold">{totalProducts.toLocaleString()}</span><span className="text-xs text-white/50 ml-2">Products</span></div>
            <div><span className="text-xl font-bold text-harvics-gold">{cat.subcategories.length}</span><span className="text-xs text-white/50 ml-2">Subcategories</span></div>
          </div>
        </div>
      </section>

      {/* Subcategories with products */}
      <section className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="space-y-12">
          {cat.subcategories.map((sub) => (
            <div key={sub.name}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-harvics-burgundy">{sub.name}</h2>
                  <span className="text-xs text-harvics-gold font-bold">{sub.count} products</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {sub.products.map((p) => (
                  <div key={p.name} className="bg-white border border-harvics-gold/15 overflow-hidden hover:border-harvics-gold transition-colors group cursor-pointer">
                    <div className="h-24 w-full overflow-hidden bg-[#f8f5f0]">
                      <img 
                        src={getProductImage(p.name, slug)} 
                        className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform" 
                        alt={p.name} 
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        {p.verified && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5">✓ Verified</span>}
                      </div>
                      <h3 className="text-sm font-semibold text-harvics-burgundy mb-3 leading-snug group-hover:text-harvics-gold transition-colors">{p.name}</h3>
                      <div className="space-y-1.5 text-xs text-harvics-burgundy/50">
                        <div className="flex justify-between"><span>Origin</span><span className="font-semibold text-harvics-burgundy">{p.origin}</span></div>
                        <div className="flex justify-between"><span>MOQ</span><span className="font-semibold text-harvics-burgundy">{p.moq}</span></div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-harvics-gold/10">
                        <div className="text-base font-bold text-harvics-burgundy">{p.price}</div>
                      </div>
                      <button className="w-full mt-4 py-2.5 bg-harvics-burgundy text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5a1a24] transition-colors">
                        Request Quote
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RFQ CTA */}
      <section className="bg-harvics-burgundy border-t border-harvics-gold/30">
        <div className="max-w-[1200px] mx-auto px-4 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Can&apos;t Find What You Need?</h3>
            <p className="text-white/50 text-sm">Submit a custom RFQ and our sourcing team will find the right supplier within 24 hours.</p>
          </div>
          <Link href={`/${locale}/harvictrade/rfq`}
            className="px-8 py-3 bg-harvics-gold text-harvics-burgundy text-sm font-bold hover:bg-[#d4b46e] transition-colors">
            Submit RFQ
          </Link>
        </div>
      </section>
    </main>
  )
}
