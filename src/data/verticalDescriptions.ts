/**
 * HARVICS VERTICAL DESCRIPTIONS
 * SP-2: Rich descriptions for every vertical, category, and item
 * Ported & expanded from SUPREME's pageDescriptions + landingDescriptions
 *
 * Structure:
 *   verticalDescriptions[verticalKey].landing  → { title, description }
 *   verticalDescriptions[verticalKey].categories[categorySlug]  → { title, description, highlights[] }
 *   verticalDescriptions[verticalKey].items[itemSlug]  → { description, specs[]? }
 *
 * Usage:
 *   import { getVerticalLanding, getCategoryDescription, getItemDescription } from '@/data/verticalDescriptions'
 */

export interface LandingDescription {
  title: string
  description: string
}

export interface CategoryDescription {
  title: string
  description: string
  highlights: string[]
}

export interface ItemDescription {
  description: string
  specs?: string[]
}

export interface VerticalDescriptionSet {
  landing: LandingDescription
  categories: Record<string, CategoryDescription>
  items: Record<string, ItemDescription>
}

// ═══════════════════════════════════════════════════════════════
// 1. TEXTILES & APPAREL
// ═══════════════════════════════════════════════════════════════

const textiles: VerticalDescriptionSet = {
  landing: {
    title: 'Textiles engineered for scale.',
    description: 'Private label programs, compliant factories and fabric libraries tied to disciplined cut plans, QA and logistics — built to deliver at retail speed.',
  },
  categories: {
    apparel: {
      title: 'Apparel',
      description: 'Full-spectrum apparel sourcing from factory floor to retail rack. Menswear, womenswear, kidswear and sportswear — each category backed by certified factories, pre-production sampling, AQL inspection, and on-time delivery schedules built for seasonal retail calendars.',
      highlights: ['Factory-direct programs', 'Pre-production sampling', 'AQL 2.5 inspection standard', 'Seasonal delivery windows'],
    },
    'home-textiles': {
      title: 'Home Textiles',
      description: 'Bed linen, bath towels, curtains and kitchen textiles sourced from mills with controlled thread counts, colorfast dyes and GSM benchmarks. Every order runs through wash-test cycles and packaging compliance before shipment.',
      highlights: ['Thread count verification', 'Colorfast dye testing', 'GSM consistency', 'Wash-cycle durability'],
    },
    fabrics: {
      title: 'Fabrics',
      description: 'Raw and finished fabrics — cotton, polyester, blends and denim — procured from vertically integrated mills. Fabric libraries, swatch programs and bulk roll shipments with full mill traceability.',
      highlights: ['Vertically integrated mills', 'Swatch & sampling programs', 'Bulk roll logistics', 'Full mill traceability'],
    },
    accessories: {
      title: 'Accessories',
      description: 'Fashion accessories including scarves, bags, belts and shoes. Sourced from specialized manufacturers with quality controls for materials, stitching, hardware and finish.',
      highlights: ['Material quality audits', 'Hardware & finish testing', 'Branded packaging', 'MOQ flexibility'],
    },
  },
  items: {
    "men-s-wear": {
      description: 'Menswear essentials across chinos, denim fits, easy-iron shirts, merino knitwear, blazers and outerwear. Completed with technical sportswear, trainers and loungewear. Every garment is factory-sampled, fit-tested and quality-inspected before bulk production.',
      specs: ['Fit range: Slim to Relaxed', 'Size spread: XS–4XL', 'Fabric: Cotton, Polyester, Wool, Blends', 'MOQ: 500 units/style'],
    },
    "ladies-wear": {
      description: "Ladies' wear and lingerie including balcony/plunge bras, seamless knickers, shapewear, sports bras, tights and versatile dresses built for comfort. Every line runs through fit trials with body-mapping data to ensure consistent sizing across markets.",
      specs: ['Fit mapping: Body-scanned sizing', 'Size range: XS–3XL', 'Support levels: Light to High', 'MOQ: 300 units/style'],
    },
    "kids-baby": {
      description: 'Kidswear and baby basics with soft cottons, durable denim, school uniforms, hoodies and pajamas tuned to everyday play. All fabrics are OEKO-TEX certified and tested for skin sensitivity, wash durability and color retention.',
      specs: ['Age range: 0–14 years', 'Certification: OEKO-TEX Standard 100', 'Wash durability: 50+ cycles', 'MOQ: 300 units/style'],
    },
    sportswear: {
      description: 'Performance sportswear engineered for movement — moisture-wicking fabrics, four-way stretch, flatlock seams and reflective trims. From gym to outdoor, each piece is tested for breathability, recovery and UV protection.',
      specs: ['Fabric: Dry-fit, Spandex blends', 'UV Protection: UPF 30+', 'Seam type: Flatlock', 'MOQ: 500 units/style'],
    },
    'bed-linen': {
      description: 'Luxury bed linens and duvet sets with balanced thread counts, colorfast dyes and durable weaves for repeated wash cycles. Available in percale, sateen and jacquard finishes with bespoke sizing for global hotel and retail programs.',
      specs: ['Thread count: 200–1000 TC', 'Finishes: Percale, Sateen, Jacquard', 'Sizing: Single to Super King', 'Wash tested: 100+ cycles'],
    },
    'bath-linen': {
      description: 'Cotton towels and bath sets with absorbent loops, low linting and consistent GSM benchmarks. Ring-spun and combed cotton options for luxury hospitality and premium retail.',
      specs: ['GSM: 400–700', 'Cotton: Ring-spun, Combed, Egyptian', 'Linting: Low-lint technology', 'Sizes: Hand towel to Bath sheet'],
    },
    curtains: {
      description: 'Window treatments and curtains with blackout linings, thermal insulation and flame-retardant options. Custom widths, drop lengths and heading styles for residential and commercial interiors.',
      specs: ['Linings: Blackout, Thermal, FR-rated', 'Heading: Pencil pleat, Eyelet, Wave', 'Width: Up to 300cm', 'Fire rating: BS 5867'],
    },
    kitchen: {
      description: 'Kitchen textiles — aprons, oven gloves, tea towels and table linen — made from durable cottons and poly-cotton blends. Stain-resistant finishes and industrial wash compatibility for hospitality use.',
      specs: ['Material: Cotton, Poly-cotton', 'Finish: Stain-resistant', 'Wash: Industrial compatible', 'MOQ: 500 units'],
    },
    cotton: {
      description: 'Premium cotton fabrics sourced from Egypt, Pakistan, India and Turkey. Available in combed, mercerized and organic grades with full mill certification and sustainability credentials.',
      specs: ['Origins: Egypt, Pakistan, India, Turkey', 'Grades: Combed, Mercerized, Organic', 'Width: 44"–120"', 'Certification: GOTS, BCI, OEKO-TEX'],
    },
    polyester: {
      description: 'Polyester fabrics for apparel, home textiles and industrial applications. Recycled polyester (rPET) options available with GRS certification for sustainability-focused brands.',
      specs: ['Types: Virgin, Recycled (rPET)', 'Certification: GRS', 'Denier: 50D–600D', 'Finishes: DWR, Anti-static, FR'],
    },
    blends: {
      description: 'Cotton-polyester, viscose and tri-blends engineered for specific performance profiles — wrinkle resistance, moisture management or drape. Custom blend ratios available.',
      specs: ['Blend ratios: Custom', 'Performance: Wrinkle-free, Moisture-wick', 'Weight: 80–400 GSM', 'MOQ: 3,000 meters'],
    },
    denim: {
      description: 'Raw and washed denim from 8oz to 14oz — selvedge, stretch and rigid options. Indigo, black, and vintage washes with laser finishing and sustainable water-saving processes.',
      specs: ['Weight: 8oz–14oz', 'Types: Selvedge, Stretch, Rigid', 'Finishing: Laser, Ozone wash', 'Sustainability: Water-saving processes'],
    },
    scarves: {
      description: 'Fashion scarves in silk, wool, cashmere and modal — printed, woven and embroidered options. Custom design programs with digital printing for seasonal collections.',
      specs: ['Materials: Silk, Wool, Cashmere, Modal', 'Techniques: Print, Weave, Embroider', 'Sizes: 70x200cm to 140x140cm', 'MOQ: 200 units'],
    },
    bags: {
      description: 'Bags and accessories — totes, crossbodies, backpacks and travel bags — in leather, canvas and recycled materials. Custom branding, hardware selection and lining options.',
      specs: ['Materials: Leather, Canvas, rPET', 'Hardware: Custom zinc alloy', 'Branding: Emboss, Print, Label', 'MOQ: 300 units'],
    },
    belts: {
      description: 'Leather and fabric belts with precision-cut edges, branded buckles and consistent sizing. Full-grain, split leather and vegan options.',
      specs: ['Materials: Full-grain, Split, Vegan', 'Width: 25mm–40mm', 'Buckle: Custom casting', 'MOQ: 500 units'],
    },
    shoes: {
      description: 'Footwear sourcing — formal, casual, athletic and safety shoes. Factory-direct with last development, material selection, sole engineering and comfort testing.',
      specs: ['Categories: Formal, Casual, Athletic, Safety', 'Sizes: EU 36–48', 'Sole: Cemented, Goodyear welt', 'Testing: Slip, Impact, Flex'],
    },
  },
}

// ═══════════════════════════════════════════════════════════════
// 2. FMCG
// ═══════════════════════════════════════════════════════════════

const fmcg: VerticalDescriptionSet = {
  landing: {
    title: 'FMCG built for velocity.',
    description: 'Staples, oils, snacks, dairy and care products with origin control, labeling and export logistics tuned to shelf life and route.',
  },
  categories: {
    food: {
      title: 'Food',
      description: 'Complete food sourcing and distribution — grains, spices, snacks and beverages. Every product meets HACCP, FDA/EU food safety standards with full batch traceability from field to shelf.',
      highlights: ['HACCP certified supply chain', 'Full batch traceability', 'Shelf-life optimization', 'Export-ready labeling'],
    },
    'personal-care': {
      title: 'Personal Care',
      description: 'Skincare, haircare, hygiene and cosmetics sourced from GMP-certified manufacturers. INCI-compliant formulations, stability testing and retail-ready packaging for global markets.',
      highlights: ['GMP-certified manufacturers', 'INCI compliance', 'Stability testing', 'Multi-market labeling'],
    },
    'home-care': {
      title: 'Home Care',
      description: 'Detergents, cleaners, paper goods and household tools. Surfactant-optimized formulations, fragrance retention testing and leak-proof packaging for distribution logistics.',
      highlights: ['Surfactant optimization', 'Fragrance lock technology', 'Leak-proof packaging', 'Bulk & retail formats'],
    },
    distribution: {
      title: 'Distribution',
      description: 'End-to-end FMCG distribution — retail, wholesale, logistics and cold storage. AI-powered demand forecasting, route optimization and real-time inventory tracking across 15,000+ retail points.',
      highlights: ['15,000+ retail touchpoints', 'AI demand forecasting', 'Route optimization', 'Cold chain management'],
    },
  },
  items: {
    grains: {
      description: 'Rice, wheat and oats with origin verification, moisture controls and packaging that travels well. Basmati, jasmine and long-grain varieties sourced from Pakistan, India and Thailand with grading consistency and fumigation documentation.',
      specs: ['Origins: Pakistan, India, Thailand', 'Grades: Premium, Standard, Economy', 'Moisture: ≤14%', 'Packaging: 1kg–50kg options'],
    },
    spices: {
      description: 'Whole spices and blends with volatile oil retention, consistent sieve profiles and aroma integrity. Turmeric, cumin, chili, coriander and custom blends with steam-sterilization and ETO-free processing.',
      specs: ['Processing: Steam-sterilized', 'Testing: Volatile oil, Aflatoxin', 'Packaging: Vacuum, Stand-up pouch', 'Certification: FSSC 22000'],
    },
    snacks: {
      description: 'Ready-to-eat snacks and noodles structured for shelf life, clean labeling and logistics. Chips, extruded snacks, cookies and instant noodles with nitrogen-flush packaging and regional flavor profiling.',
      specs: ['Shelf life: 6–12 months', 'Packaging: Nitrogen-flush, MAP', 'Labeling: Multi-language, Nutrition facts', 'MOQ: 5,000 units'],
    },
    beverages: {
      description: 'Hot and cold beverages — juices, energy drinks, tea and coffee. Aseptic filling, cold-press and UHT processing with shelf-stable packaging for tropical and temperate climates.',
      specs: ['Processing: UHT, Cold-press, Aseptic', 'Formats: Bottle, Tetra, Can', 'Shelf life: 6–18 months', 'Certifications: HACCP, Halal'],
    },
    skincare: {
      description: 'Skincare formulations — moisturizers, serums, sunscreens and anti-aging lines. Clean-beauty and halal-certified options with dermatologically tested formulations.',
      specs: ['Formulation: Clean-beauty, Halal', 'Testing: Dermatological, Stability', 'SPF range: 15–50+', 'Packaging: Airless, Tube, Jar'],
    },
    haircare: {
      description: 'Shampoos, conditioners, hair oils and styling products. Sulfate-free and keratin-enriched formulations with salon-grade and mass-market positioning.',
      specs: ['Formulations: Sulfate-free, Keratin', 'Segments: Salon, Mass-market', 'Testing: Trichological, pH', 'MOQ: 3,000 units'],
    },
    hygiene: {
      description: 'Toothpaste, soaps and hand sanitizers with INCI alignment, micro testing and carton specs for retail. Antibacterial and dermatology-approved formulations for sensitive markets.',
      specs: ['Standards: INCI, FDA/EU', 'Testing: Microbial, Stability', 'Formats: Bar, Liquid, Gel', 'Certification: Dermatology-approved'],
    },
    cosmetics: {
      description: 'Color cosmetics — foundations, lipsticks, eyeshadows and setting sprays. Cruelty-free, vegan options with FDA-compliant colorants and heavy-metal testing.',
      specs: ['Standards: FDA, EU Cosmetics Regulation', 'Testing: Heavy metal, Stability', 'Certifications: Cruelty-free, Vegan', 'MOQ: 2,000 units'],
    },
    detergents: {
      description: 'Laundry and dish detergents with optimized surfactant ranges, fragrance locks and packaging that reduces leaks. Powder, liquid and pod formats for mass-market and premium segments.',
      specs: ['Formats: Powder, Liquid, Pods', 'Surfactants: LAS, SLES optimized', 'Fragrance: Encapsulated, Long-lasting', 'Testing: Washability, pH'],
    },
    cleaners: {
      description: 'Multi-surface cleaners, disinfectants and glass cleaners with controlled pH, effective against 99.9% of germs. Spray, wipe and concentrate formats.',
      specs: ['Efficacy: 99.9% germ kill', 'Formats: Spray, Wipe, Concentrate', 'Testing: EN 1276, EN 14476', 'Packaging: Trigger, Refill pouch'],
    },
    paper: {
      description: 'Tissue paper, toilet rolls, kitchen towels and facial tissues. Virgin and recycled pulp options with ply control, embossing and FSC certification.',
      specs: ['Ply: 2–4', 'Pulp: Virgin, Recycled', 'Certification: FSC, PEFC', 'Embossing: Custom patterns'],
    },
    tools: {
      description: 'Household cleaning tools — mops, brooms, brushes and sponges. Durable materials with ergonomic design for consumer and commercial use.',
      specs: ['Materials: PP, Microfiber, Natural bristle', 'Design: Ergonomic grip', 'Durability: Commercial-grade', 'Packaging: Retail-ready'],
    },
    retail: {
      description: 'Retail distribution networks covering supermarkets, hypermarkets, convenience stores and specialty outlets. Planogram management, shelf-share tracking and promotional execution.',
      specs: ['Coverage: 15,000+ outlets', 'Services: Planogram, Shelf-share', 'Tracking: Real-time inventory', 'Markets: GCC, South Asia, Africa'],
    },
    wholesale: {
      description: 'Wholesale distribution — bulk supply to wholesalers, cash-and-carry and institutional buyers. Volume pricing, pallet configuration and scheduled delivery windows.',
      specs: ['Formats: Pallet, Half-pallet, Case', 'Pricing: Volume-tiered', 'Delivery: Scheduled windows', 'Terms: NET 30/60/90'],
    },
    logistics: {
      description: 'FMCG logistics — temperature-controlled transport, last-mile delivery and cross-docking. Fleet management with GPS tracking and AI-optimized routing.',
      specs: ['Fleet: Ambient, Chilled, Frozen', 'Tracking: Real-time GPS', 'Routing: AI-optimized', 'SLA: 98%+ on-time delivery'],
    },
    storage: {
      description: 'Warehousing and cold storage — ambient, chilled and frozen facilities with FIFO/FEFO inventory management, real-time WMS and food-grade certifications.',
      specs: ['Zones: Ambient, +2°C, -18°C', 'System: WMS with FIFO/FEFO', 'Certification: BRC Storage', 'Capacity: 50,000+ pallets'],
    },
  },
}

// ═══════════════════════════════════════════════════════════════
// 3. COMMODITIES
// ═══════════════════════════════════════════════════════════════

const commodities: VerticalDescriptionSet = {
  landing: {
    title: 'Commodities, structured and clear.',
    description: 'Agri, metals and energy flows with specs, inspection and execution windows coordinated to contracts and risk.',
  },
  categories: {
    agri: {
      title: 'Agri',
      description: 'Agricultural commodities — wheat, rice, corn and soybeans. Origin checks, fumigation certificates, phytosanitary documentation and vessel coordination for bulk shipments.',
      highlights: ['Origin certification', 'Phytosanitary compliance', 'Vessel coordination', 'Fumigation documentation'],
    },
    energy: {
      title: 'Energy',
      description: 'Energy commodity trading — crude oil, natural gas and LNG. Specs, laycans and route planning matched to terminal windows, storage capacity and off-take agreements.',
      highlights: ['Laycan management', 'Terminal coordination', 'Off-take structuring', 'Price risk hedging'],
    },
    softs: {
      title: 'Softs',
      description: 'Soft commodities — coffee, cocoa, sugar and cotton. Managed through commodity exchanges with grading, sample retention, warehouse receipts and forward contract structuring.',
      highlights: ['Exchange-grade quality', 'Warehouse receipts', 'Forward contracts', 'Sample retention'],
    },
    metals: {
      title: 'Metals',
      description: 'Base and precious metals — steel, copper, aluminum. Traded with assay certification, LME-aligned specs, delivery warrants and hedge-accounting support.',
      highlights: ['LME-aligned specs', 'Assay certification', 'Delivery warrants', 'Hedge accounting'],
    },
  },
  items: {
    wheat: {
      description: 'Wheat sourcing — milling, feed and durum grades. Origin verification from Black Sea, Australia, Argentina and North America with protein content, moisture and falling number specifications.',
      specs: ['Protein: 10–14%', 'Moisture: ≤13.5%', 'Origins: Black Sea, Australia, Argentina', 'Grades: Milling, Feed, Durum'],
    },
    rice: {
      description: 'Rice trading — basmati, jasmine, long-grain and parboiled varieties. Managed through origin verification, moisture controls, broken percentage and packaging for export windows.',
      specs: ['Varieties: Basmati, Jasmine, Long-grain', 'Broken: ≤5%', 'Moisture: ≤14%', 'Packaging: 1–50kg, Bulk'],
    },
    corn: {
      description: 'Corn and maize for feed, food processing and industrial use. Yellow and white grades with aflatoxin testing, moisture control and vessel-ready documentation.',
      specs: ['Grades: Yellow #2, White', 'Aflatoxin: ≤20 ppb', 'Moisture: ≤14.5%', 'Uses: Feed, Food, Industrial'],
    },
    soybeans: {
      description: 'Soybeans and soybean meal managed to protein ranges and delivery calendars. Sourced from Brazil, Argentina and USA with GMO and non-GMO options.',
      specs: ['Protein: 44–48% (meal)', 'Oil content: 18–20% (bean)', 'Origins: Brazil, Argentina, USA', 'Options: GMO, Non-GMO, Organic'],
    },
    'crude-oil': {
      description: 'Crude oil — Brent, WTI and regional blends. Trading with API gravity specs, sulfur content, laycan management and terminal logistics.',
      specs: ['Benchmarks: Brent, WTI', 'API gravity: 30–45°', 'Sulfur: Sweet (<0.5%), Sour', 'Delivery: FOB, CIF, DES'],
    },
    'natural-gas': {
      description: 'Natural gas logistics matched to capacity, storage and off-take agreements. Pipeline and LNG arrangements with pricing indexed to Henry Hub, TTF or oil-linked formulas.',
      specs: ['Pricing: Henry Hub, TTF, Oil-linked', 'Delivery: Pipeline, LNG', 'Quality: CV, Wobbe Index', 'Contracts: Spot, Term'],
    },
    lng: {
      description: 'LNG sourcing and trading — liquefaction, shipping and regasification. Managed through SPA structures with destination flexibility, vessel scheduling and terminal access.',
      specs: ['Temperature: -162°C', 'Vessel: Q-Flex, Q-Max, Conventional', 'Terms: FOB, DES, Ex-Ship', 'Flexibility: Destination-free options'],
    },
    coffee: {
      description: 'Coffee trading — arabica and robusta beans. Graded by screen size, defect count and cup score with ICO certification and warehouse receipts.',
      specs: ['Types: Arabica, Robusta', 'Grading: Screen size, Cup score', 'Certification: ICO, Fair Trade, Rainforest', 'Storage: Warehoused, GrainPro'],
    },
    cocoa: {
      description: 'Cocoa beans and cocoa products — butter, powder and liquor. West African and South American origins with fermentation quality and ICCO-aligned grading.',
      specs: ['Origins: Ghana, Ivory Coast, Ecuador', 'Products: Beans, Butter, Powder, Liquor', 'Grading: ICCO-aligned', 'Certification: UTZ, Rainforest Alliance'],
    },
    sugar: {
      description: 'Raw and refined sugar — ICUMSA 45, ICUMSA 150 and specialty grades. Brazil, Thailand and India origins with polarization specs and vessel chartering.',
      specs: ['Grades: ICUMSA 45, 150, VHP', 'Polarization: ≥99.8°', 'Origins: Brazil, Thailand, India', 'Packaging: Bulk, 50kg, 1MT bags'],
    },
    'cotton-commodity': {
      description: 'Cotton fiber trading — upland, extra-long staple and organic. Classed by staple length, micronaire, strength and uniformity with HVI testing.',
      specs: ['Types: Upland, ELS, Organic', 'Staple: 1"–1.5"', 'Micronaire: 3.5–4.9', 'Testing: HVI, USDA classed'],
    },
    steel: {
      description: 'Steel products — HRC, CRC, rebar and structural sections. Mill-certified with chemical analysis, mechanical properties and third-party inspection.',
      specs: ['Products: HRC, CRC, Rebar, Sections', 'Grades: S235, S355, A36', 'Testing: Chemical, Mechanical', 'Certification: Mill TC, Third-party'],
    },
    copper: {
      description: 'Copper cathodes, wire rod and concentrates. LME-registered brands with assay certification, delivery warrants and hedge-accounting support.',
      specs: ['Forms: Cathode, Wire rod, Concentrate', 'Purity: ≥99.99% (cathode)', 'Standard: LME Grade A', 'Delivery: LME warrant, Direct'],
    },
    aluminum: {
      description: 'Aluminum ingots, billets and sheet. Primary and recycled grades with chemical composition certificates and P1020A specifications.',
      specs: ['Forms: Ingot, Billet, Sheet', 'Grade: P1020A, 6063, 6061', 'Purity: ≥99.7%', 'Certification: LME-registered'],
    },
  },
}

// ═══════════════════════════════════════════════════════════════
// 4. INDUSTRIAL SOLUTIONS
// ═══════════════════════════════════════════════════════════════

const industrial: VerticalDescriptionSet = {
  landing: {
    title: 'Industrial supply, uninterrupted.',
    description: 'Chemicals, machinery and MRO with certification, spares planning and restock cycles that keep lines running.',
  },
  categories: {
    chemicals: {
      title: 'Chemicals',
      description: 'Industrial chemicals — polymers, acids and solvents for manufacturing, construction and processing sectors. REACH and GHS compliant with SDS documentation and hazmat logistics.',
      highlights: ['REACH & GHS compliance', 'SDS documentation', 'Hazmat-certified logistics', 'Bulk & drum formats'],
    },
    machinery: {
      title: 'Machinery',
      description: 'Capital equipment — textile machinery, food processing lines and packaging systems. OEM partnerships with installation support, operator training and spare parts programs.',
      highlights: ['OEM partnerships', 'Installation & commissioning', 'Operator training', 'Spare parts programs'],
    },
    safety: {
      title: 'Safety',
      description: 'Safety gear, helmets and protective equipment with certification to CE, ANSI and ISO standards. PPE, lockout/tagout kits and fire suppression systems with reliable restock cycles.',
      highlights: ['CE/ANSI/ISO certified', 'PPE programs', 'LOTO kits', 'Fire suppression systems'],
    },
    mro: {
      title: 'MRO',
      description: 'Maintenance, Repair and Operations supplies — bearings, belts, tools and consumables. Planned replenishment with min-max inventory management and same-day dispatch for critical items.',
      highlights: ['Min-max inventory', 'Same-day critical dispatch', 'Planned replenishment', 'Vendor-managed inventory'],
    },
  },
  items: {
    polymers: {
      description: 'Engineering and commodity polymers — PE, PP, PVC, ABS, Nylon. Pellet and granule forms with melt flow index, density and additive specifications for injection molding and extrusion.',
      specs: ['Types: PE, PP, PVC, ABS, PA', 'Forms: Pellet, Granule', 'Testing: MFI, Density, Tensile', 'Packaging: 25kg bags, Bulk'],
    },
    acids: {
      description: 'Industrial acids — sulfuric, hydrochloric, nitric and phosphoric. Technical and reagent grades with concentration specifications, SDS and hazmat-compliant packaging.',
      specs: ['Types: H2SO4, HCl, HNO3, H3PO4', 'Grades: Technical, Reagent', 'Concentration: As specified', 'Packaging: IBC, Drum, Tanker'],
    },
    solvents: {
      description: 'Industrial solvents — acetone, toluene, MEK and IPA. Purity-tested with low moisture and residue specs. Bulk and packaged delivery with ADR-compliant transport.',
      specs: ['Types: Acetone, Toluene, MEK, IPA', 'Purity: ≥99.5%', 'Moisture: ≤0.1%', 'Transport: ADR-compliant'],
    },
    textile: {
      description: 'Textile machinery — looms, knitting machines, dyeing equipment and finishing lines. From leading OEMs with factory layout planning, installation and operator certification.',
      specs: ['Types: Looms, Knitting, Dyeing, Finishing', 'OEMs: Major brands', 'Support: Installation, Training', 'Warranty: Standard + Extended'],
    },
    'food-processing': {
      description: 'Food processing equipment — mixers, fillers, pasteurizers and packaging lines. HACCP-compatible design with CIP systems and food-contact material certification.',
      specs: ['Equipment: Mixer, Filler, Pasteurizer', 'Standards: HACCP, FDA', 'Material: SS 304/316', 'Cleaning: CIP-enabled'],
    },
    packaging: {
      description: 'Packaging machinery — form-fill-seal, labeling, cartoning and palletizing systems. Servo-driven with quick-changeover for multiple SKU formats.',
      specs: ['Types: FFS, Labeler, Cartoner, Palletizer', 'Speed: Up to 600 packs/min', 'Changeover: Quick-change tooling', 'Control: PLC/HMI'],
    },
    ppe: {
      description: 'Personal Protective Equipment — hard hats, safety glasses, gloves, respirators and fall protection. Certified to EN, ANSI and AS/NZS standards with bulk program pricing.',
      specs: ['Standards: EN, ANSI, AS/NZS', 'Categories: Head, Eye, Hand, Respiratory, Fall', 'Programs: Bulk, Vending, Managed', 'Replacement: Scheduled cycles'],
    },
    lockout: {
      description: 'Lockout/Tagout safety systems — padlocks, hasps, valve lockouts and electrical lockouts. OSHA-compliant with training programs and audit support.',
      specs: ['Standards: OSHA 1910.147', 'Components: Padlocks, Hasps, Valve, Electrical', 'Training: On-site programs', 'Audit: Compliance verification'],
    },
    fire: {
      description: 'Fire detection and suppression — extinguishers, sprinkler systems, fire alarms and suppression agents. Designed, installed and maintained to NFPA and local fire codes.',
      specs: ['Standards: NFPA, EN, Local codes', 'Systems: Sprinkler, FM200, CO2', 'Services: Design, Install, Maintain', 'Inspection: Annual certification'],
    },
    bearings: {
      description: 'Industrial bearings — ball, roller, thrust and plain bearings. Premium and economy ranges from authorized distributors with application engineering support.',
      specs: ['Types: Ball, Roller, Thrust, Plain', 'Brands: Premium, Economy', 'Services: Application engineering', 'Stock: Immediate availability'],
    },
    belts: {
      description: 'Power transmission belts — V-belts, timing belts, flat belts and conveyor belts. Matched to drive specifications with tensioning tools and alignment services.',
      specs: ['Types: V-belt, Timing, Flat, Conveyor', 'Materials: Rubber, Polyurethane, Fabric', 'Services: Tensioning, Alignment', 'Stock: Standard & custom lengths'],
    },
    tools: {
      description: 'Industrial hand and power tools — wrenches, drills, grinders and measurement instruments. Professional-grade with calibration services and warranty programs.',
      specs: ['Categories: Hand, Power, Measurement', 'Grade: Professional, Industrial', 'Services: Calibration, Repair', 'Warranty: Manufacturer-backed'],
    },
  },
}

// ═══════════════════════════════════════════════════════════════
// 5. MINERALS
// ═══════════════════════════════════════════════════════════════

const minerals: VerticalDescriptionSet = {
  landing: {
    title: 'Minerals with strategic discipline.',
    description: 'Metallic, energy and industrial inputs managed through origin, assays and bulk delivery calendars.',
  },
  categories: {
    metals: {
      title: 'Metals',
      description: 'Metallic minerals — iron ore, copper, aluminum and zinc. Mine-to-market supply chains with assay verification, grade consistency and bulk vessel logistics.',
      highlights: ['Mine-to-market traceability', 'Assay verification', 'Grade consistency', 'Bulk vessel logistics'],
    },
    energy: {
      title: 'Energy',
      description: 'Energy minerals — coal, uranium and lithium. Managed through origin verification, calorific value testing, regulatory compliance and scheduled delivery programs.',
      highlights: ['Calorific value testing', 'Regulatory compliance', 'Origin verification', 'Delivery scheduling'],
    },
    precious: {
      title: 'Precious',
      description: 'Precious metals — gold, silver and platinum. LBMA-standard bars and coins with assay certificates, chain-of-custody documentation and secure logistics.',
      highlights: ['LBMA-standard', 'Assay certification', 'Chain-of-custody', 'Secure logistics'],
    },
    industrial: {
      title: 'Industrial',
      description: 'Industrial minerals — sand, gravel and limestone. Construction-grade aggregates with particle size distribution, chemical analysis and quarry-to-site logistics.',
      highlights: ['Particle size distribution', 'Chemical analysis', 'Quarry-direct supply', 'Construction-grade'],
    },
  },
  items: {
    'iron-ore': {
      description: 'Iron ore — fines, lump and pellets. Fe content 58–67% with silica, alumina and phosphorus controls. Sourced from Australia, Brazil, India and Africa with SGS/Bureau Veritas inspection.',
      specs: ['Fe: 58–67%', 'Forms: Fines, Lump, Pellet', 'Origins: Australia, Brazil, India, Africa', 'Inspection: SGS, Bureau Veritas'],
    },
    'copper-mineral': {
      description: 'Copper concentrates and cathodes — Cu 20–30% (concentrate), 99.99% (cathode). Smelter-grade with penalty element controls and LME-aligned pricing.',
      specs: ['Cu: 20–30% (conc), 99.99% (cathode)', 'Penalties: As, Bi, Sb controls', 'Pricing: LME-based', 'Delivery: CIF, FOB'],
    },
    'aluminum-mineral': {
      description: 'Aluminum — bauxite, alumina and primary aluminum. From mine to smelter with Al2O3 content verification, reactive silica controls and shipping logistics.',
      specs: ['Products: Bauxite, Alumina, Primary Al', 'Al2O3: ≥45% (bauxite)', 'Reactive SiO2: ≤8%', 'Delivery: Bulk vessel, Container'],
    },
    zinc: {
      description: 'Zinc concentrates, ingots and special high-grade (SHG) zinc. LME-standard with Zn 99.995% purity, used in galvanizing, die-casting and chemicals.',
      specs: ['Forms: Concentrate, Ingot, SHG', 'Purity: 99.995%', 'Applications: Galvanizing, Die-casting', 'Standard: LME SHG'],
    },
    coal: {
      description: 'Thermal and metallurgical coal — GAR 4,200 to 6,300 kcal. Sourced from Indonesia, South Africa, Colombia and Australia with proximate analysis and vessel chartering.',
      specs: ['Types: Thermal, Metallurgical', 'GAR: 4,200–6,300 kcal/kg', 'Origins: Indonesia, South Africa, Colombia', 'Analysis: Proximate, Ultimate'],
    },
    uranium: {
      description: 'Uranium concentrates (yellowcake) for civil nuclear power generation. IAEA-compliant supply chains with safeguards agreements, transport licensing and end-user certificates.',
      specs: ['Form: U3O8 concentrate', 'Purity: Nuclear-grade', 'Compliance: IAEA safeguards', 'Transport: Class 7 licensed'],
    },
    lithium: {
      description: 'Lithium — spodumene concentrate, lithium carbonate and lithium hydroxide. Battery-grade specifications for EV and energy storage applications.',
      specs: ['Products: Spodumene, Carbonate, Hydroxide', 'Grade: Battery (≥99.5%)', 'Applications: EV, ESS', 'Origins: Australia, Chile, Argentina'],
    },
    gold: {
      description: 'Gold bars, coins and dore — 999.9 fine. LBMA Good Delivery standard with assay certificates, serial numbers and chain-of-custody from mine to vault.',
      specs: ['Fineness: 999.9', 'Standard: LBMA Good Delivery', 'Forms: Bar, Coin, Dore', 'Traceability: Serial numbered'],
    },
    silver: {
      description: 'Silver bars and grain — 999.0 fine. LBMA-standard with industrial and investment grades. Used in electronics, solar panels, jewelry and bullion.',
      specs: ['Fineness: 999.0', 'Standard: LBMA', 'Applications: Electronics, Solar, Jewelry', 'Forms: Bar, Grain, Coin'],
    },
    platinum: {
      description: 'Platinum and PGM metals — bars, sponge and salt. 999.5 fine with automotive catalyst, jewelry and industrial applications.',
      specs: ['Fineness: 999.5', 'Forms: Bar, Sponge, Salt', 'Applications: Catalyst, Jewelry, Industrial', 'Standard: LPPM'],
    },
    sand: {
      description: 'Construction sand and silica sand — washed, graded and tested for particle size distribution. Quarry-direct supply for concrete, glass and filtration applications.',
      specs: ['Types: Construction, Silica', 'Testing: PSD, Chloride, Shell content', 'Applications: Concrete, Glass, Filtration', 'Delivery: Tipper, Bulk vessel'],
    },
    gravel: {
      description: 'Crushed stone and gravel — various grades for road base, concrete aggregate and landscaping. Tested for LA abrasion, flakiness index and specific gravity.',
      specs: ['Sizes: 5mm–40mm', 'Testing: LA abrasion, Flakiness', 'Applications: Road base, Concrete, Landscape', 'Delivery: Tipper, Barge'],
    },
    limestone: {
      description: 'Limestone — high calcium and dolomitic grades for cement, steel and chemical industries. CaCO3 content ≥95% with controlled MgO and SiO2 levels.',
      specs: ['CaCO3: ≥95%', 'Types: High calcium, Dolomitic', 'Applications: Cement, Steel, Chemical', 'Delivery: Bulk, Bagged'],
    },
  },
}

// ═══════════════════════════════════════════════════════════════
// 6. OIL & GAS
// ═══════════════════════════════════════════════════════════════

const oilGas: VerticalDescriptionSet = {
  landing: {
    title: 'Oil & Gas, from upstream to retail.',
    description: 'Exploration, midstream and downstream operations aligned to HSE, EPC partners and reliable off-take.',
  },
  categories: {
    upstream: {
      title: 'Upstream',
      description: 'Exploration and production services — seismic surveys, drilling operations and offshore support. Technical partnerships with E&P companies across the Middle East, Central Asia and Africa.',
      highlights: ['Seismic & geological surveys', 'Drilling operations', 'Offshore support vessels', 'E&P technical partnerships'],
    },
    midstream: {
      title: 'Midstream',
      description: 'Pipeline, storage and terminal operations — crude and refined products. EPC project management, FEED studies, pipeline integrity monitoring and tank farm management.',
      highlights: ['Pipeline EPC', 'FEED studies', 'Integrity monitoring', 'Tank farm management'],
    },
    downstream: {
      title: 'Downstream',
      description: 'Refining, trading and distribution — fuel products, lubricants and petrochemicals. Off-take arrangements, product blending and retail network development.',
      highlights: ['Refinery operations', 'Product trading', 'Lubricant blending', 'Retail network development'],
    },
    services: {
      title: 'Services',
      description: 'Oil & gas services — EPC contracting, HSE management and third-party inspection. Technical staffing, IRATA-certified rope access and NDT inspection services.',
      highlights: ['EPC contracting', 'HSE management', 'NDT inspection', 'IRATA rope access'],
    },
  },
  items: {
    exploration: {
      description: 'Seismic data acquisition, geological mapping and reservoir characterization. 2D/3D seismic surveys with advanced processing and interpretation for prospect evaluation.',
      specs: ['Services: 2D/3D Seismic, Geological mapping', 'Processing: Advanced interpretation', 'Software: Petrel, Kingdom, OpendTect', 'Regions: Middle East, Africa, Central Asia'],
    },
    drilling: {
      description: 'Onshore and offshore drilling services — rotary, directional and horizontal drilling. Managed pressure drilling, wellbore stability and cementing services.',
      specs: ['Types: Rotary, Directional, Horizontal', 'Techniques: MPD, UBD', 'Depth: Up to 6,000m', 'Standards: API, NORSOK'],
    },
    osv: {
      description: 'Offshore Support Vessels — AHTS, PSV, crew boats and dive support. Fleet management with DP2 capability, cargo handling and marine crew staffing.',
      specs: ['Types: AHTS, PSV, Crew boat, DSV', 'DP: Class 2 (DP2)', 'Crew: Fully qualified marine staff', 'Standards: IMO, Flag state'],
    },
    pipelines: {
      description: 'Pipeline construction and maintenance — onshore and subsea. Welding, coating, trenching, HDD and intelligent pigging with API 1104 and ASME B31.4/8 compliance.',
      specs: ['Types: Onshore, Subsea', 'Diameters: 2"–48"', 'Standards: API 1104, ASME B31.4/8', 'Services: Construction, Pigging, Repair'],
    },
    'storage-og': {
      description: 'Tank farm design, construction and operation — crude, refined products and LPG. API 650/620 tanks with cathodic protection, leak detection and inventory management.',
      specs: ['Standards: API 650, API 620', 'Products: Crude, Refined, LPG', 'Protection: Cathodic, Leak detection', 'Management: Real-time inventory'],
    },
    terminals: {
      description: 'Marine and inland terminal operations — loading, unloading and blending. Jetty operations, vapor recovery, metering and custody transfer systems.',
      specs: ['Types: Marine, Inland', 'Operations: Loading, Blending, Transfer', 'Systems: LACT, Vapor recovery', 'Standards: OCIMF, ISGOTT'],
    },
    refining: {
      description: 'Refinery operations support — process optimization, turnaround management and catalyst supply. CDU, FCC, HCU and reformer units with yield improvement programs.',
      specs: ['Units: CDU, FCC, HCU, Reformer', 'Services: Optimization, Turnaround', 'Catalysts: FCC, Hydrotreating', 'Improvement: Yield, Energy'],
    },
    trading: {
      description: 'Crude and refined products trading — spot, term and structured deals. Brent, WTI, Murban and regional benchmarks with risk management and paper trading capability.',
      specs: ['Products: Crude, Gasoline, Diesel, Fuel oil', 'Benchmarks: Brent, WTI, Murban', 'Deals: Spot, Term, Structured', 'Risk: Hedging, Options, Swaps'],
    },
    'distribution-og': {
      description: 'Downstream distribution — fuel depots, retail stations and fleet fueling. Network planning, equipment supply and operational management for fuel retail businesses.',
      specs: ['Network: Depot, Retail station, Fleet', 'Equipment: Pumps, Tanks, POS', 'Services: Planning, Build, Operate', 'Standards: NFPA, API RP 1615'],
    },
    epc: {
      description: 'Engineering, Procurement and Construction — greenfield and brownfield projects. FEED, detailed engineering, procurement management, construction supervision and commissioning.',
      specs: ['Phases: FEED, Detail, Procure, Build', 'Types: Greenfield, Brownfield', 'Sectors: Oil, Gas, Petrochem, Power', 'Standards: ASME, API, IEC'],
    },
    hse: {
      description: 'Health, Safety and Environment management — risk assessment, incident investigation, emergency response and environmental monitoring. ISO 45001 and ISO 14001 systems.',
      specs: ['Standards: ISO 45001, ISO 14001', 'Services: Risk assessment, Investigation', 'Training: NEBOSH, IOSH, H2S', 'Systems: PTW, JSA, BBS'],
    },
    inspection: {
      description: 'Third-party inspection — NDT, pressure testing, coating inspection and dimensional control. ASNT Level II/III certified inspectors with advanced techniques (TOFD, Phased Array).',
      specs: ['Methods: UT, RT, MT, PT, TOFD, PA', 'Certification: ASNT Level II/III', 'Standards: ASME, API, AWS', 'Services: NDT, Pressure test, Coating'],
    },
  },
}

// ═══════════════════════════════════════════════════════════════
// 7. REAL ESTATE
// ═══════════════════════════════════════════════════════════════

const realEstate: VerticalDescriptionSet = {
  landing: {
    title: 'Real estate with commercial intelligence.',
    description: 'Commercial, residential and industrial assets supported with advisory, leasing and facilities management.',
  },
  categories: {
    commercial: {
      title: 'Commercial',
      description: 'Grade-A offices, retail spaces and mixed-use developments. Tenant advisory, lease structuring and fit-out management in prime locations across the GCC and South Asia.',
      highlights: ['Grade-A office space', 'Tenant advisory', 'Lease structuring', 'Fit-out management'],
    },
    residential: {
      title: 'Residential',
      description: 'Luxury apartments, villa communities and integrated developments. Sales, leasing and property management with investor reporting and community management.',
      highlights: ['Luxury developments', 'Sales & leasing', 'Property management', 'Investor reporting'],
    },
    industrial: {
      title: 'Industrial',
      description: 'Warehouses, industrial parks and Special Economic Zones. Purpose-built facilities with clear-span design, loading docks and infrastructure for manufacturing and logistics.',
      highlights: ['Purpose-built facilities', 'Clear-span design', 'Loading dock access', 'SEZ facilitation'],
    },
    services: {
      title: 'Services',
      description: 'Facilities management, leasing and advisory services. Hard FM (MEP, HVAC, fire systems) and soft FM (cleaning, security, landscaping) with SLA-driven performance.',
      highlights: ['Hard & soft FM', 'SLA-driven performance', 'MEP maintenance', 'Security & landscaping'],
    },
  },
  items: {
    offices: {
      description: 'Premium office spaces in Grade-A towers — fitted, shell & core and co-working options. Smart building features with BMS, access control and energy-efficient HVAC systems.',
      specs: ['Classes: Grade A, B+', 'Options: Fitted, Shell & core, Co-working', 'Features: BMS, Access control, Smart HVAC', 'Locations: Dubai, Abu Dhabi, Riyadh'],
    },
    'retail-re': {
      description: 'Retail spaces in malls, high streets and mixed-use developments. F&B, fashion, lifestyle and anchor tenant positioning with footfall analytics and tenant-mix planning.',
      specs: ['Types: Mall, High street, Mixed-use', 'Analytics: Footfall, Tenant-mix', 'Services: Fit-out, Lease advisory', 'Markets: GCC, South Asia'],
    },
    'mixed-use': {
      description: 'Integrated mixed-use developments combining residential, commercial, retail and hospitality. Master planning, phased delivery and community management.',
      specs: ['Components: Residential, Office, Retail, Hotel', 'Services: Master planning, Phased delivery', 'Management: Community, Asset', 'Scale: 50,000–500,000 sqm'],
    },
    apartments: {
      description: 'Residential apartments — studio to penthouse. Off-plan and ready properties with investor returns analysis, payment plans and property management services.',
      specs: ['Types: Studio, 1BR–4BR, Penthouse', 'Markets: Off-plan, Ready', 'Services: Sales, Leasing, PM', 'Returns: Yield analysis, Forecasting'],
    },
    villas: {
      description: 'Villa communities and townhouses — 3 to 7 bedrooms. Gated communities with lifestyle amenities, landscaping and 24/7 security.',
      specs: ['Sizes: 3BR–7BR', 'Features: Gated, Landscaped, Pool', 'Security: 24/7, CCTV, Access control', 'Communities: Family-oriented'],
    },
    community: {
      description: 'Integrated community developments — master-planned neighborhoods with schools, clinics, retail and parks. Community management, events and resident engagement.',
      specs: ['Amenities: Schools, Clinics, Retail, Parks', 'Management: Community, Events', 'Engagement: App-based, Resident portal', 'Scale: 1,000–10,000 units'],
    },
    warehouses: {
      description: 'Modern warehouse facilities — ambient, temperature-controlled and bonded. Clear heights 10–15m, dock levelers, yard space and 24/7 operational access.',
      specs: ['Heights: 10–15m clear', 'Types: Ambient, Cold, Bonded', 'Features: Dock levelers, Yard space', 'Access: 24/7 operational'],
    },
    parks: {
      description: 'Industrial parks with ready infrastructure — roads, utilities, fire stations and labor accommodation. Pre-built and build-to-suit options with single-window licensing.',
      specs: ['Infrastructure: Roads, Utilities, Fire', 'Options: Pre-built, Build-to-suit', 'Licensing: Single-window', 'Zones: Industrial, Light industrial'],
    },
    sez: {
      description: 'Special Economic Zone facilities — free zone and mainland. Tax incentives, 100% foreign ownership and simplified regulatory framework for manufacturing and trading.',
      specs: ['Benefits: Tax incentives, 100% ownership', 'Types: Free zone, Mainland', 'Activities: Manufacturing, Trading, Services', 'Licensing: Fast-track setup'],
    },
    fm: {
      description: 'Facilities management — hard and soft FM services. MEP maintenance, HVAC, electrical, plumbing, cleaning, security, pest control and landscaping with SLA-based contracts.',
      specs: ['Hard FM: MEP, HVAC, Electrical, Plumbing', 'Soft FM: Cleaning, Security, Landscape', 'Contracts: SLA-based, Performance', 'Reporting: Monthly, KPI dashboards'],
    },
    leasing: {
      description: 'Property leasing services — tenant search, lease negotiation, renewals and portfolio management. Market analysis, comparable studies and rental benchmarking.',
      specs: ['Services: Search, Negotiate, Renew', 'Analysis: Market, Comparable, Benchmark', 'Portfolio: Multi-asset management', 'Reports: Quarterly market updates'],
    },
    advisory: {
      description: 'Real estate advisory — investment analysis, feasibility studies, highest and best use analysis and transaction support. Due diligence, valuation and deal structuring.',
      specs: ['Services: Feasibility, Valuation, Due diligence', 'Analysis: Investment, HBU, Market', 'Support: Transaction, Structuring', 'Standards: RICS, IVS'],
    },
  },
}

// ═══════════════════════════════════════════════════════════════
// 8. SOURCING SOLUTIONS
// ═══════════════════════════════════════════════════════════════

const sourcing: VerticalDescriptionSet = {
  landing: {
    title: 'AI-powered sourcing that scales.',
    description: 'Supplier discovery, vetting, inspections, logistics and risk-aware workflows orchestrated in one layer.',
  },
  categories: {
    'global-sourcing': {
      title: 'Global Sourcing',
      description: 'End-to-end supplier discovery, vetting and negotiation. AI-powered supplier matching, capability assessment and commercial negotiation across 18+ countries.',
      highlights: ['AI supplier matching', 'Capability assessment', 'Commercial negotiation', '18+ source countries'],
    },
    'quality-control': {
      title: 'Quality Control',
      description: 'Pre-shipment inspections, factory audits and product testing. AQL sampling, BSCI/SMETA social audits and accredited lab testing for regulatory compliance.',
      highlights: ['AQL inspection', 'BSCI/SMETA audits', 'Lab testing', 'Regulatory compliance'],
    },
    logistics: {
      title: 'Logistics',
      description: 'Freight forwarding, customs brokerage and warehousing. FCL/LCL ocean, air freight and multimodal solutions with end-to-end tracking and duty optimization.',
      highlights: ['FCL/LCL ocean freight', 'Air freight solutions', 'Customs brokerage', 'Duty optimization'],
    },
    consulting: {
      title: 'Consulting',
      description: 'Sourcing strategy, supply chain optimization and risk management consulting. Category management, should-cost models, and supplier consolidation programs.',
      highlights: ['Category management', 'Should-cost modeling', 'Risk assessment', 'Supplier consolidation'],
    },
  },
  items: {
    'supplier-discovery': {
      description: 'AI-powered supplier discovery — database of 50,000+ verified manufacturers across Asia, Middle East, Africa and Europe. Capability matching, capacity verification and financial health screening.',
      specs: ['Database: 50,000+ manufacturers', 'Regions: Asia, Middle East, Africa, Europe', 'Screening: Financial, Capability, Capacity', 'Matching: AI-powered algorithms'],
    },
    vetting: {
      description: 'Supplier vetting and qualification — factory visits, capability audits, reference checks and trial orders. BSCI, SMETA, SA8000 social compliance verification.',
      specs: ['Audits: Factory, Social, Environmental', 'Standards: BSCI, SMETA, SA8000', 'Verification: Reference, Trial order', 'Reports: Detailed scoring matrix'],
    },
    negotiation: {
      description: 'Commercial negotiation — pricing, MOQ, payment terms and delivery schedules. Should-cost analysis, competitive bidding and long-term framework agreements.',
      specs: ['Analysis: Should-cost, TCO', 'Bidding: Competitive, RFQ, RFP', 'Terms: Payment, Delivery, Warranty', 'Agreements: Framework, Spot, Annual'],
    },
    inspections: {
      description: 'Product inspections — pre-production, during production, pre-shipment and container loading. AQL 1.0–4.0 sampling with photographic reporting and corrective action tracking.',
      specs: ['Stages: Pre-production, DUPRO, PSI, CLS', 'Sampling: AQL 1.0–4.0', 'Reporting: Photo, Video, Digital', 'Follow-up: Corrective action tracking'],
    },
    audits: {
      description: 'Factory audits — social compliance (BSCI, SMETA), quality management (ISO 9001), environmental (ISO 14001) and C-TPAT security. Certified auditors with global coverage.',
      specs: ['Types: Social, Quality, Environmental, Security', 'Standards: BSCI, SMETA, ISO, C-TPAT', 'Auditors: Certified, Independent', 'Coverage: 30+ countries'],
    },
    testing: {
      description: 'Product testing — physical, chemical and performance testing at accredited laboratories. Textile testing (AATCC, ISO), food testing (FDA, EU), and consumer product safety (CPSC, EN).',
      specs: ['Labs: ILAC-accredited', 'Textile: AATCC, ISO 105, BS EN', 'Food: FDA, EU, Codex', 'Safety: CPSC, EN 71, REACH'],
    },
    freight: {
      description: 'International freight forwarding — ocean (FCL/LCL), air, rail and multimodal. Rate negotiation, carrier selection, booking and shipment tracking with carbon footprint reporting.',
      specs: ['Modes: Ocean, Air, Rail, Multimodal', 'Ocean: FCL, LCL, Breakbulk', 'Tracking: Real-time, Milestone alerts', 'Sustainability: Carbon reporting'],
    },
    customs: {
      description: 'Customs brokerage — tariff classification, duty calculation, preferential origin certificates and bonded warehouse management. FTA utilization and duty drawback programs.',
      specs: ['Services: Classification, Duty calc, Origin', 'FTAs: Preferential tariff programs', 'Bonded: Warehouse management', 'Drawback: Duty recovery programs'],
    },
    warehousing: {
      description: 'Strategic warehousing — origin consolidation, destination distribution and bonded storage. WMS integration, pick-pack-ship and value-added services (labeling, kitting, QC).',
      specs: ['Types: Origin, Destination, Bonded', 'System: WMS integrated', 'VAS: Labeling, Kitting, QC', 'Locations: Key trade hubs'],
    },
    strategy: {
      description: 'Sourcing strategy consulting — category analysis, supply market intelligence, make-vs-buy decisions and sourcing roadmap development. Data-driven recommendations with implementation support.',
      specs: ['Analysis: Category, Supply market, TCO', 'Decisions: Make-vs-buy, Nearshore-vs-offshore', 'Output: Sourcing roadmap', 'Support: Implementation, Change management'],
    },
    optimization: {
      description: 'Supply chain optimization — lead time reduction, inventory optimization, supplier rationalization and logistics cost modeling. Lean and Six Sigma methodologies.',
      specs: ['Methods: Lean, Six Sigma, TOC', 'Focus: Lead time, Inventory, Cost', 'Tools: Simulation, Modeling', 'Improvement: 15–30% typical savings'],
    },
    'risk-management': {
      description: 'Supply chain risk management — supplier risk scoring, geopolitical monitoring, natural disaster mapping and business continuity planning. Real-time risk dashboards with alert systems.',
      specs: ['Scoring: Financial, Operational, Geopolitical', 'Monitoring: Real-time dashboards', 'Planning: BCP, Dual-source strategies', 'Alerts: Automated early warning'],
    },
  },
}

// ═══════════════════════════════════════════════════════════════
// 9. FINANCE & HPAY
// ═══════════════════════════════════════════════════════════════

const finance: VerticalDescriptionSet = {
  landing: {
    title: 'Finance & HPay that moves capital.',
    description: 'LCs, SBLCs, cross-border payments and structured instruments with KYC/AML and clear reconciliation.',
  },
  categories: {
    'trade-finance': {
      title: 'Trade Finance',
      description: 'Structured trade finance instruments — Letters of Credit, Standby LCs and forfaiting. Bank-intermediated transactions with document checking, discrepancy management and swift messaging.',
      highlights: ['LC structuring', 'SBLC issuance', 'Forfaiting arrangements', 'SWIFT messaging'],
    },
    hpay: {
      title: 'HPay',
      description: 'Harvics digital payment platform — wallets, peer-to-peer payments and merchant gateway. Multi-currency support, instant settlement and PCI DSS Level 1 compliance.',
      highlights: ['Digital wallets', 'Multi-currency', 'Instant settlement', 'PCI DSS Level 1'],
    },
    invoicing: {
      title: 'Invoicing',
      description: 'Automated invoicing, billing and reconciliation. E-invoicing with tax compliance (VAT, GST), multi-currency conversion and aging analysis for AR/AP management.',
      highlights: ['E-invoicing', 'Tax compliance (VAT/GST)', 'Multi-currency', 'Aging analysis'],
    },
    risk: {
      title: 'Risk',
      description: 'Financial risk management — KYC/AML screening, credit scoring, counterparty risk assessment and sanctions compliance. Automated screening against global watchlists.',
      highlights: ['KYC/AML automation', 'Credit scoring', 'Sanctions screening', 'Counterparty risk'],
    },
  },
  items: {
    lc: {
      description: 'Letters of Credit — sight, deferred payment, acceptance and negotiation LCs. Issuing, advising, confirming and transferable LCs with UCP 600 compliance and document examination.',
      specs: ['Types: Sight, Deferred, Acceptance, Negotiation', 'Services: Issue, Advise, Confirm, Transfer', 'Rules: UCP 600', 'Documents: B/L, Invoice, Packing, Origin'],
    },
    sblc: {
      description: 'Standby Letters of Credit — performance guarantees, advance payment guarantees and financial SBLCs. ISP98-compliant with demand provisions and auto-renewal options.',
      specs: ['Types: Performance, Advance, Financial', 'Rules: ISP98', 'Features: Auto-renewal, Demand basis', 'Uses: Trade, Project, Tender'],
    },
    forfaiting: {
      description: 'Forfaiting — without-recourse purchase of trade receivables. Medium-term financing (180 days to 7 years) with fixed discount rates, removing payment risk from exporters.',
      specs: ['Tenor: 180 days–7 years', 'Basis: Without recourse', 'Instruments: Promissory notes, Bills, LCs', 'Benefit: Risk transfer, Cash flow'],
    },
    wallets: {
      description: 'HPay digital wallets — multi-currency stored value with KYC-tiered limits. QR payments, bank transfers, bill pay and rewards. iOS and Android apps with biometric authentication.',
      specs: ['Currencies: 15+ supported', 'KYC: Tiered limits', 'Features: QR, Transfer, Bill pay, Rewards', 'Security: Biometric, 2FA, PCI DSS'],
    },
    payments: {
      description: 'Cross-border payments — SWIFT, SEPA, ACH and local payment rails. Multi-currency with competitive FX rates, transparent fees and real-time tracking.',
      specs: ['Rails: SWIFT, SEPA, ACH, Local', 'Speed: Same-day to T+2', 'FX: Competitive, Transparent', 'Tracking: Real-time, Notifications'],
    },
    gateway: {
      description: 'Payment gateway for merchants — online and in-store. Card processing (Visa, Mastercard, AMEX), digital wallets (Apple Pay, Google Pay) and alternative payments with PCI DSS compliance.',
      specs: ['Cards: Visa, MC, AMEX', 'Wallets: Apple Pay, Google Pay, HPay', 'Integration: API, SDK, Plugin', 'Security: PCI DSS Level 1, 3DS2'],
    },
    bills: {
      description: 'Bill management — generation, distribution, payment tracking and dispute resolution. Multi-format output (PDF, EDI, XML) with automated payment reminders and escalation workflows.',
      specs: ['Formats: PDF, EDI, XML, E-invoice', 'Distribution: Email, Portal, API', 'Tracking: Payment, Dispute, Aging', 'Automation: Reminders, Escalation'],
    },
    reconciliation: {
      description: 'Automated reconciliation — bank statements, payment matching and exception handling. Multi-bank, multi-currency with AI-powered matching algorithms and audit trail.',
      specs: ['Sources: Bank, Payment, ERP', 'Matching: AI-powered, Rule-based', 'Currencies: Multi-currency', 'Audit: Full trail, Exception reports'],
    },
    reports: {
      description: 'Financial reporting — real-time dashboards, scheduled reports and custom analytics. Cash position, exposure, aging and P&L views with drill-down capability.',
      specs: ['Types: Dashboard, Scheduled, Custom', 'Views: Cash, Exposure, Aging, P&L', 'Features: Drill-down, Export', 'Formats: PDF, Excel, API'],
    },
    kyc: {
      description: 'Know Your Customer — identity verification, document validation and enhanced due diligence. Automated screening against PEP, sanctions and adverse media databases.',
      specs: ['Checks: ID, Document, Address', 'Screening: PEP, Sanctions, Adverse media', 'Levels: Simplified, Standard, Enhanced', 'Databases: Global watchlists'],
    },
    aml: {
      description: 'Anti-Money Laundering — transaction monitoring, suspicious activity detection and regulatory reporting. Rule-based and AI-powered detection with case management.',
      specs: ['Monitoring: Transaction, Behavioral', 'Detection: Rule-based, AI/ML', 'Reporting: SAR, STR, CTR', 'Management: Case workflow, Investigation'],
    },
    scoring: {
      description: 'Credit scoring and risk assessment — financial analysis, payment history, trade references and behavioral scoring. Automated credit limit recommendations with periodic reviews.',
      specs: ['Inputs: Financial, Payment, Trade refs', 'Models: Statistical, AI/ML', 'Output: Score, Limit, Terms', 'Reviews: Periodic, Trigger-based'],
    },
  },
}

// ═══════════════════════════════════════════════════════════════
// 10. AI & TECHNOLOGY
// ═══════════════════════════════════════════════════════════════

const ai: VerticalDescriptionSet = {
  landing: {
    title: 'AI & Technology built into operations.',
    description: 'Forecasting, computer vision, data pipelines and integrations enabling intelligent supply chains.',
  },
  categories: {
    'ai-solutions': {
      title: 'AI Solutions',
      description: 'Enterprise AI solutions — demand forecasting, computer vision for quality control, and conversational AI. Built on Harvics\' proprietary ML models with 94%+ prediction accuracy.',
      highlights: ['Demand forecasting', 'Computer vision QC', 'Conversational AI', '94%+ accuracy'],
    },
    data: {
      title: 'Data',
      description: 'Data infrastructure — ETL pipelines, data warehouses, API platforms and real-time streaming. Cloud-native architecture with governance, lineage and security controls.',
      highlights: ['ETL pipelines', 'Data warehouse', 'API platform', 'Real-time streaming'],
    },
    integration: {
      title: 'Integration',
      description: 'System integration — ERP, e-commerce and mobile app connectivity. Pre-built connectors for SAP, Oracle, Shopify and WooCommerce with bi-directional sync.',
      highlights: ['ERP connectors (SAP, Oracle)', 'E-commerce (Shopify, WooCommerce)', 'Mobile apps', 'Bi-directional sync'],
    },
    support: {
      title: 'Support',
      description: 'Technical support — SLAs, training programs, documentation and knowledge base. 24/7 support tiers with dedicated account management and continuous improvement reviews.',
      highlights: ['24/7 support tiers', 'Training programs', 'Knowledge base', 'Continuous improvement'],
    },
  },
  items: {
    forecasting: {
      description: 'AI-powered demand forecasting — time series analysis, seasonal decomposition and external signal integration (weather, events, promotions). 94%+ forecast accuracy with automated retraining.',
      specs: ['Models: ARIMA, Prophet, LSTM, Transformer', 'Accuracy: 94%+', 'Signals: Sales, Weather, Events, Promo', 'Retraining: Automated, Weekly'],
    },
    vision: {
      description: 'Computer vision for quality control — defect detection, dimensional measurement, color matching and label verification. Edge-deployed models with real-time processing on production lines.',
      specs: ['Applications: Defect, Dimension, Color, Label', 'Deployment: Edge, Cloud', 'Speed: Real-time (30 fps)', 'Accuracy: 98%+ defect detection'],
    },
    chat: {
      description: 'Conversational AI — customer-facing chatbots, internal copilots and voice assistants. Multi-language support with context awareness, escalation workflows and CRM integration.',
      specs: ['Languages: 38 supported', 'Channels: Web, Mobile, WhatsApp, Voice', 'Features: Context-aware, Escalation', 'Integration: CRM, ERP, Knowledge base'],
    },
    pipelines: {
      description: 'Data pipelines — batch and streaming ETL with schema evolution, data quality checks and lineage tracking. Apache Airflow, Kafka and dbt-based architectures.',
      specs: ['Tools: Airflow, Kafka, dbt', 'Types: Batch, Streaming, CDC', 'Quality: Validation, Profiling', 'Lineage: End-to-end tracking'],
    },
    warehouses: {
      description: 'Data warehouse solutions — cloud-native (Snowflake, BigQuery, Redshift) and on-premise. Star/snowflake schema design, incremental loading and query optimization.',
      specs: ['Platforms: Snowflake, BigQuery, Redshift', 'Design: Star, Snowflake schema', 'Loading: Incremental, Full refresh', 'Optimization: Clustering, Partitioning'],
    },
    apis: {
      description: 'API platform — RESTful and GraphQL APIs with OAuth2 authentication, rate limiting, versioning and developer portal. API gateway with monitoring and analytics.',
      specs: ['Types: REST, GraphQL', 'Auth: OAuth2, API keys, JWT', 'Management: Gateway, Rate limiting', 'Portal: Developer docs, Sandbox'],
    },
    erp: {
      description: 'ERP integration — bi-directional connectors for SAP, Oracle, Microsoft Dynamics and NetSuite. Master data sync, transaction posting and real-time inventory visibility.',
      specs: ['ERPs: SAP, Oracle, Dynamics, NetSuite', 'Sync: Master data, Transactions', 'Mode: Real-time, Batch', 'Protocol: RFC, OData, REST, SOAP'],
    },
    'e-commerce': {
      description: 'E-commerce integration — Shopify, WooCommerce, Magento and marketplace connectors (Amazon, Noon). Order sync, inventory feeds, pricing updates and fulfillment triggers.',
      specs: ['Platforms: Shopify, WooCommerce, Magento', 'Marketplaces: Amazon, Noon, eBay', 'Sync: Orders, Inventory, Pricing', 'Fulfillment: Automated triggers'],
    },
    mobile: {
      description: 'Mobile application development — iOS and Android native and cross-platform (React Native, Flutter). Sales force apps, delivery tracking, warehouse scanning and customer portals.',
      specs: ['Platforms: iOS, Android, Cross-platform', 'Frameworks: React Native, Flutter', 'Use cases: Sales, Delivery, Warehouse, Portal', 'Features: Offline, Push, Barcode'],
    },
    slas: {
      description: 'Service Level Agreements — tiered support with guaranteed response and resolution times. Priority-based escalation, performance reporting and penalty/bonus structures.',
      specs: ['Tiers: P1 (1hr), P2 (4hr), P3 (8hr), P4 (24hr)', 'Coverage: 24/7, Business hours', 'Reporting: Monthly SLA dashboards', 'Structure: Penalty/Bonus'],
    },
    training: {
      description: 'Technical training — on-site workshops, virtual instructor-led sessions and self-paced e-learning. Role-based curriculum for administrators, users and developers.',
      specs: ['Formats: On-site, Virtual, E-learning', 'Roles: Admin, User, Developer', 'Certification: Completion, Competency', 'Materials: Video, Docs, Lab'],
    },
    docs: {
      description: 'Technical documentation — API references, integration guides, user manuals and knowledge base articles. Versioned documentation with search, change logs and community forums.',
      specs: ['Types: API ref, Guide, Manual, KB', 'Features: Versioned, Searchable', 'Formats: Web, PDF, In-app', 'Updates: With every release'],
    },
  },
}


// ═══════════════════════════════════════════════════════════════
// MASTER REGISTRY
// ═══════════════════════════════════════════════════════════════

const verticalDescriptions: Record<string, VerticalDescriptionSet> = {
  textiles,
  fmcg,
  commodities,
  industrial,
  minerals,
  'oil-gas': oilGas,
  'real-estate': realEstate,
  sourcing,
  finance,
  ai,
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/** Slugify helper (mirrors megaMenuData.slugify) */
function toSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

/** Get landing description for a vertical */
export function getVerticalLanding(verticalKey: string): LandingDescription | null {
  return verticalDescriptions[verticalKey]?.landing || null
}

/** Get category description — matches by category slug */
export function getCategoryDescription(verticalKey: string, categorySlug: string): CategoryDescription | null {
  const vertical = verticalDescriptions[verticalKey]
  if (!vertical) return null
  // Direct match
  if (vertical.categories[categorySlug]) return vertical.categories[categorySlug]
  // Try slugified keys
  for (const [key, value] of Object.entries(vertical.categories)) {
    if (toSlug(key) === categorySlug) return value
  }
  return null
}

/** Get item description — matches by item slug */
export function getItemDescription(verticalKey: string, itemSlug: string): ItemDescription | null {
  const vertical = verticalDescriptions[verticalKey]
  if (!vertical) return null
  // Direct match
  if (vertical.items[itemSlug]) return vertical.items[itemSlug]
  // Try slugified keys
  for (const [key, value] of Object.entries(vertical.items)) {
    if (toSlug(key) === itemSlug) return value
  }
  return null
}

/** Get all category descriptions for a vertical */
export function getAllCategoryDescriptions(verticalKey: string): Record<string, CategoryDescription> {
  return verticalDescriptions[verticalKey]?.categories || {}
}

/** Get all item descriptions for a vertical */
export function getAllItemDescriptions(verticalKey: string): Record<string, ItemDescription> {
  return verticalDescriptions[verticalKey]?.items || {}
}

export default verticalDescriptions
