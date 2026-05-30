import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/home — Home page API
 * Returns all data needed to render the public home page:
 *   - hero slides
 *   - industry verticals
 *   - showcase products
 *   - company stats / pillars
 *   - supply chain stages
 *   - contact info
 */
export async function GET() {
  const data = {
    hero: {
      slides: [
        {
          img: '/assets/verticals/02-fmcg/categories/pastas/pasta (5).png',
          tagline: 'Authentic Italian Heritage',
          subtitle: 'Premium Pasta Collection',
        },
        {
          img: '/assets/verticals/02-fmcg/categories/confectionery/jelly/bearpops.jpg',
          tagline: 'Sweet Moments of Joy',
          subtitle: 'Confectionary Delights',
        },
        {
          img: '/assets/verticals/02-fmcg/categories/bakery/wafer-and-wafer-bars/wafer -1.png',
          tagline: 'Crafted with Excellence',
          subtitle: 'Quality Bakery Selection',
        },
      ],
      heading: ['Intelligence-led', 'sourcing.', 'Built for scale.'],
      description:
        'A disciplined operating system for global supply chains — from strategy to delivery.',
    },

    industries: [
      { key: 'textiles', icon: '🧵', title: 'Textiles', desc: 'Apparel, fabrics, home textiles and accessories for global markets.' },
      { key: 'fmcg', icon: '🛒', title: 'FMCG', desc: 'Food, personal care, home care and distribution logistics.' },
      { key: 'commodities', icon: '📦', title: 'Commodities', desc: 'Agri, energy, metals, softs and strategic commodities trading.' },
      { key: 'industrial', icon: '🏭', title: 'Industrial', desc: 'Chemicals, machinery, safety equipment and MRO supplies.' },
      { key: 'minerals', icon: '⛏️', title: 'Minerals', desc: 'Metals, energy minerals, precious metals and industrial minerals.' },
      { key: 'oil-gas', icon: '🛢️', title: 'Oil & Gas', desc: 'Upstream exploration, midstream pipelines, downstream refining.' },
      { key: 'real-estate', icon: '🏢', title: 'Real Estate', desc: 'Commercial, residential, industrial real estate and FM services.' },
      { key: 'sourcing', icon: '🔍', title: 'Sourcing', desc: 'Global sourcing, QC, logistics, consulting and OEM/ODM.' },
      { key: 'finance', icon: '💳', title: 'Finance', desc: 'Trade finance, HPay, invoicing, risk and compliance.' },
      { key: 'ai', icon: '🤖', title: 'AI', desc: 'Forecasting, vision, chat, data pipelines and ERP integration.' },
    ],

    showcaseProducts: [
      {
        name: 'Premium Pasta',
        image: '/assets/verticals/02-fmcg/categories/pastas/fusilli -1.png',
        detail: 'Crafted from 100% durum wheat semolina using traditional bronze die extrusion.',
        features: ['Bronze Die Cut', 'Slow Dried', '100% Durum Wheat', 'Al Dente Perfect'],
      },
      {
        name: 'Artisan Wafers',
        image: '/assets/verticals/02-fmcg/categories/bakery/wafer-and-wafer-bars/wafer -1.png',
        detail: 'Multi-layered crispy wafers with premium chocolate and hazelnut cream filling.',
        features: ['Multi-Layer', 'Real Chocolate', 'Hazelnut Cream', 'Golden Baked'],
      },
      {
        name: 'Gourmet Snacks',
        image: '/assets/verticals/02-fmcg/categories/snacks/chips-and-crisps/chips and crisp.png',
        detail: 'Premium potato crisps sliced thin and seasoned with proprietary spice blends.',
        features: ['Thin Sliced', 'Premium Potatoes', 'Unique Seasoning', 'Small Batch'],
      },
    ],

    stats: [
      { title: 'Global Reach', stat: '50+', unit: 'Countries', description: 'Operating across six continents with direct supply chain access.' },
      { title: 'Quality Assured', stat: '100%', unit: 'Tested', description: 'Every product passes rigorous multi-stage quality inspection.' },
      { title: 'Fast Logistics', stat: '72h', unit: 'Transit', description: 'Optimized supply routes for rapid regional delivery.' },
      { title: 'AI-Powered', stat: '24/7', unit: 'Monitoring', description: 'Machine learning forecasting and automated quality control.' },
    ],

    supplyChain: [
      { id: 1, label: 'Buyer Planning', desc: 'Market research, demand forecasting, product brief' },
      { id: 2, label: 'Product Design', desc: 'Design, sampling, tech packs, development' },
      { id: 3, label: 'Vendor Compliance', desc: 'Factory audits, certifications, ethical sourcing' },
      { id: 4, label: 'Raw Material', desc: 'Fabric sourcing, dye lots, material testing' },
      { id: 5, label: 'Factory Sourcing', desc: 'Supplier matching, capacity planning, MOQ negotiation' },
      { id: 6, label: 'Manufacturing', desc: 'Cutting, sewing, assembly, finishing' },
      { id: 7, label: 'Quality Control', desc: 'AQL inspection, lab testing, defect tracking' },
      { id: 8, label: 'Packaging', desc: 'Inner packaging, carton packing, labeling' },
      { id: 9, label: 'Documentation', desc: 'Commercial invoices, packing lists, COO' },
      { id: 10, label: 'Freight & Logistics', desc: 'Booking, container loading, shipping' },
      { id: 11, label: 'Customs Clearance', desc: 'Import documentation, duties, tariffs' },
      { id: 12, label: 'Warehousing', desc: 'Receiving, storage, inventory management' },
      { id: 13, label: 'Distribution', desc: 'Order fulfillment, last-mile delivery, retail' },
      { id: 14, label: 'Consumer', desc: 'End customer, feedback, returns, loyalty' },
    ],

    contact: {
      phone: '+44 7405 527427',
      email: 'sales.uk@harvics.com',
      whatsapp: '+44 7405 527427',
    },

    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0',
    },
  }

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  })
}
