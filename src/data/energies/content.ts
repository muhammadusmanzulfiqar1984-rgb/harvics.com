/** HARVICS ENERGIES — content (no fabricated capacity / certifications) */

export const HE_CHAPTERS = [
  { id: 'system', label: '01 System' },
  { id: 'plant', label: '02 Plant' },
  { id: 'process', label: '03 Process' },
  { id: 'feedstock', label: '04 Feedstock' },
  { id: 'fuels', label: '05 Fuels' },
  { id: 'trade', label: '06 Trade' },
  { id: 'logistics', label: '07 Logistics' },
  { id: 'global', label: '08 Global' },
  { id: 'intelligence', label: '09 Intelligence' },
  { id: 'compliance', label: '10 Quality' },
  { id: 'partners', label: '11 Partners' },
] as const

export const HE_IMAGES = {
  hero: '/assets/energies/hero-complex.png',
  plant: '/assets/energies/plant-masterplan.png',
  processA: '/assets/harvictrade/heroes/oil-gas/02-refinery.webp',
  processB: '/assets/harvictrade/heroes/industrial-hero.webp',
  tank: '/assets/harvictrade/heroes/oil-gas/03-tanker.webp',
  port: '/assets/harvictrade/heroes/commodities/03-port.webp',
  logistics: '/assets/harvictrade/products/diesel-tanker.webp',
  control: '/assets/harvictrade/heroes/ai/01-datacenter.webp',
  finale: '/assets/energies/hero-complex.png',
} as const

export const HE_SYSTEM = [
  { n: '01', title: 'Feedstock', body: 'Eligible renewable feedstocks enter the network.' },
  { n: '02', title: 'Aggregation', body: 'Material is collected and consolidated.' },
  { n: '03', title: 'Pre-treatment', body: 'Feedstock is conditioned for processing.' },
  { n: '04', title: 'Processing', body: 'Controlled conversion into renewable fuel.' },
  { n: '05', title: 'Biodiesel / Fuel', body: 'The finished renewable-fuel stream is formed.' },
  { n: '06', title: 'Quality', body: 'Batch-level testing and documentation.' },
  { n: '07', title: 'Storage', body: 'Finished product moves into controlled storage.' },
  { n: '08', title: 'Logistics', body: 'Physical movement connects the plant to market.' },
  { n: '09', title: 'Port', body: 'Marine and terminal interface toward corridors.' },
  { n: '10', title: 'Global Trade', body: 'Product enters the commercial network.' },
] as const

export const HE_FLOW = HE_SYSTEM

export const HE_HERO_RAIL = ['Feedstock', 'Process', 'Storage', 'Logistics', 'Trade'] as const

export const HE_PROCESS = [
  {
    n: '01',
    title: 'Feedstock',
    body: 'Eligible renewable feedstocks enter the system through controlled sourcing and receiving.',
    panel: ['Intake protocols', 'Sampling regime', 'Batch identity open'],
    image: '/assets/harvictrade/heroes/oil-gas/03-tanker.webp',
  },
  {
    n: '02',
    title: 'Pre-treatment',
    body: 'Feedstock is prepared for downstream processing through controlled conditioning and purification.',
    panel: ['Contaminant control', 'Conditioning', 'Process readiness'],
    image: '/assets/harvictrade/heroes/industrial-hero.webp',
  },
  {
    n: '03',
    title: 'Reaction',
    body: 'The prepared feedstock enters the core conversion process.',
    panel: ['Controlled conversion', 'Operating discipline', 'Process visibility'],
    image: '/assets/harvictrade/heroes/oil-gas/02-refinery.webp',
  },
  {
    n: '04',
    title: 'Separation',
    body: 'Primary products and process streams are separated and conditioned.',
    panel: ['Phase management', 'Recovery pathways', 'Yield discipline'],
    image: '/assets/harvictrade/heroes/oil-gas/02-refinery.webp',
  },
  {
    n: '05',
    title: 'Purification',
    body: 'The renewable fuel stream is refined toward the required commercial specification.',
    panel: ['Polish sequence', 'Spec alignment', 'Release readiness'],
    image: '/assets/harvictrade/heroes/oil-gas/02-refinery.webp',
  },
  {
    n: '06',
    title: 'Quality',
    body: 'Laboratory and batch-level controls support consistency, documentation and traceability.',
    panel: ['Lab workflow', 'Batch record', 'Release gate'],
    image: '/assets/harvictrade/heroes/ai/01-datacenter.webp',
  },
  {
    n: '07',
    title: 'Storage & Dispatch',
    body: 'Finished product moves into storage, logistics and trade execution.',
    panel: ['Tank farm', 'Inventory control', 'Dispatch buffer'],
    image: '/assets/harvictrade/heroes/oil-gas/03-tanker.webp',
  },
] as const

export const HE_LOG_STAGES = [
  { title: 'Plant', image: '/assets/energies/hero-complex.png' },
  { title: 'Tank Farm', image: '/assets/harvictrade/heroes/oil-gas/03-tanker.webp' },
  { title: 'Terminal', image: '/assets/harvictrade/heroes/commodities/03-port.webp' },
  { title: 'Port', image: '/assets/harvictrade/heroes/commodities/03-port.webp' },
  { title: 'Vessel', image: '/assets/harvictrade/heroes/oil-gas/03-tanker.webp' },
  { title: 'Destination', image: '/assets/energies/hero-complex.png' },
] as const

/** Interactive masterplan zones — site boundary overlays */
export const HE_PLANT = [
  {
    id: '01',
    title: 'Feedstock Receiving',
    meta: 'Intake · Weighbridge · Sampling',
    purpose: 'Reception infrastructure for eligible renewable feedstocks.',
    zone: 'Receiving',
    x: 8,
    y: 62,
    w: 18,
    h: 28,
  },
  {
    id: '02',
    title: 'Pre-treatment',
    meta: 'Conditioning · Contaminant control',
    purpose: 'Preparation stage ahead of conversion chemistry.',
    zone: 'Processing',
    x: 28,
    y: 18,
    w: 14,
    h: 32,
  },
  {
    id: '03',
    title: 'Reaction',
    meta: 'Conversion · Process control',
    purpose: 'Core conversion step within the industrial train.',
    zone: 'Processing',
    x: 44,
    y: 12,
    w: 12,
    h: 36,
  },
  {
    id: '04',
    title: 'Separation',
    meta: 'Phase split · Recovery',
    purpose: 'Isolation of product and co-product streams.',
    zone: 'Processing',
    x: 58,
    y: 16,
    w: 12,
    h: 30,
  },
  {
    id: '05',
    title: 'Purification',
    meta: 'Polish · Spec alignment',
    purpose: 'Fuel conditioning and purification toward commercial specification.',
    zone: 'Processing',
    x: 72,
    y: 14,
    w: 14,
    h: 28,
  },
  {
    id: '06',
    title: 'By-product Recovery',
    meta: 'Glycerin · Valorisation',
    purpose: 'By-product handling as part of the platform economics.',
    zone: 'Processing',
    x: 86,
    y: 22,
    w: 10,
    h: 24,
  },
  {
    id: '07',
    title: 'Tank Farm',
    meta: 'Storage · Inventory',
    purpose: 'Dedicated storage for feedstock, intermediates and finished fuel.',
    zone: 'Storage',
    x: 28,
    y: 58,
    w: 36,
    h: 28,
  },
  {
    id: '08',
    title: 'Quality Laboratory',
    meta: 'Laboratory · Batch identity',
    purpose: 'Lab workflow supporting batch documentation and release.',
    zone: 'Laboratory',
    x: 66,
    y: 52,
    w: 12,
    h: 18,
  },
  {
    id: '09',
    title: 'Utilities',
    meta: 'Power · Steam · Water',
    purpose: 'Utility backbone supporting continuous industrial operation.',
    zone: 'Utilities',
    x: 8,
    y: 18,
    w: 16,
    h: 28,
  },
  {
    id: '10',
    title: 'Control Centre',
    meta: 'Operations · Oversight',
    purpose: 'Central operations interface for the industrial complex.',
    zone: 'Control',
    x: 80,
    y: 52,
    w: 14,
    h: 16,
  },
  {
    id: '11',
    title: 'Loading / Dispatch',
    meta: 'Truck · Rail interface',
    purpose: 'Loading infrastructure connecting plant inventory to logistics.',
    zone: 'Loading',
    x: 66,
    y: 74,
    w: 18,
    h: 18,
  },
  {
    id: '12',
    title: 'Logistics Corridor',
    meta: 'Road · Terminal · Port link',
    purpose: 'Outbound corridor from site boundary toward trade logistics.',
    zone: 'Logistics',
    x: 2,
    y: 88,
    w: 96,
    h: 10,
  },
] as const

export const HE_FEEDSTOCK = [
  { title: 'Used Cooking Oil', status: 'Target category' },
  { title: 'Vegetable Oils', status: 'Target category' },
  { title: 'Animal Fats', status: 'Target category' },
  { title: 'Eligible Feedstock Streams', status: 'Market development' },
] as const

export const HE_FEED_FLOW = ['Source', 'Collect', 'Verify', 'Aggregate', 'Trace', 'Deliver'] as const

export const HE_PRODUCTS = [
  {
    product: 'Biodiesel / FAME',
    application: 'Renewable fuel produced from eligible feedstock streams.',
    status: 'Platform product',
    image: '/assets/harvictrade/heroes/oil-gas/02-refinery.webp',
  },
  {
    product: 'Feedstocks',
    application: 'Aggregated renewable feedstock streams supporting processing and trade.',
    status: 'Network development',
    image: '/assets/harvictrade/heroes/oil-gas/03-tanker.webp',
  },
  {
    product: 'Glycerin / By-products',
    application: 'Recoverable streams from integrated processing.',
    status: 'Valorisation pathway',
    image: '/assets/harvictrade/heroes/industrial-hero.webp',
  },
  {
    product: 'Next-Generation Fuels',
    application: 'Future expansion pathway into advanced renewable-fuels technologies.',
    status: 'Under evaluation',
    image: '/assets/energies/hero-complex.png',
  },
] as const

export const HE_TRADE = [
  {
    product: 'Biodiesel / FAME',
    origin: 'South Asia',
    destination: 'GCC',
    lane: 'Strategic Corridor',
    delivery: 'Bulk',
    status: 'Market Development',
  },
  {
    product: 'Feedstock',
    origin: 'South Asia',
    destination: 'Europe',
    lane: 'Target Corridor',
    delivery: 'Bulk',
    status: 'Open for Discussion',
  },
  {
    product: 'Biodiesel / FAME',
    origin: 'South Asia',
    destination: 'Africa',
    lane: 'Target Corridor',
    delivery: 'Bulk',
    status: 'Market Development',
  },
] as const

export const HE_REGIONS = [
  { name: 'South Asia', tag: 'Strategic market', x: 68, y: 52 },
  { name: 'GCC', tag: 'Target corridor', x: 56, y: 44 },
  { name: 'Africa', tag: 'Market development', x: 48, y: 58 },
  { name: 'Europe', tag: 'Target corridor', x: 48, y: 30 },
] as const

export const HE_CORRIDORS = [
  { from: [68, 52], to: [56, 44], label: 'South Asia → GCC' },
  { from: [68, 52], to: [48, 58], label: 'South Asia → Africa' },
  { from: [68, 52], to: [48, 30], label: 'South Asia → Europe' },
] as const

export const HE_LOGISTICS = [
  'Tank Storage',
  'Road Logistics',
  'Rail Connection',
  'Port Terminal',
  'ISO Tank',
  'Bulk Shipping',
] as const

export const HE_LOG_JOURNEY = [
  'Plant',
  'Tank Farm',
  'Terminal',
  'Port',
  'Vessel',
  'Destination',
] as const

export const HE_INTEL = [
  {
    title: 'Feedstock Intelligence',
    body: 'Identify and evaluate sourcing opportunities.',
  },
  {
    title: 'Market Intelligence',
    body: 'Monitor market conditions, demand signals and pricing dynamics.',
  },
  {
    title: 'Supplier Intelligence',
    body: 'Support supplier discovery, verification and qualification.',
  },
  {
    title: 'Production Intelligence',
    body: 'Create visibility across processing and operational workflows.',
  },
  {
    title: 'Logistics Intelligence',
    body: 'Connect storage, movement and delivery information.',
  },
  {
    title: 'Trade Orchestration',
    body: 'Connect market intelligence with commercial execution.',
  },
] as const

export const HE_INTEL_CHAIN = [
  'Physical Asset',
  'Data',
  'Intelligence',
  'Decision',
  'Trade',
] as const

export const HE_TRACE = [
  'Source',
  'Feedstock ID',
  'Batch',
  'Lab',
  'Quality',
  'Documentation',
  'Destination',
] as const

export const HE_PARTNERS = [
  'Strategic Investors',
  'Feedstock Partners',
  'Technology Partners',
  'Logistics Partners',
  'Offtakers',
  'Distribution Partners',
] as const

export const HE_FOOTER_NAV = [
  { id: 'system', label: 'System' },
  { id: 'plant', label: 'Plant' },
  { id: 'process', label: 'Process' },
  { id: 'feedstock', label: 'Feedstock' },
  { id: 'fuels', label: 'Fuels' },
  { id: 'trade', label: 'Trade' },
  { id: 'logistics', label: 'Logistics' },
  { id: 'global', label: 'Global' },
  { id: 'intelligence', label: 'Intelligence' },
  { id: 'compliance', label: 'Quality' },
  { id: 'partners', label: 'Partners' },
] as const
