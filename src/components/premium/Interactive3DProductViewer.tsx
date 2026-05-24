'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'

/**
 * Interactive3DProductViewer — Premium CSS 3D product explorer.
 * Drag to rotate, scroll to zoom, click to switch products.
 * Uses website base colors: #F5F1E8 (cream), #6B1F2B (burgundy), #C3A35E (gold).
 */

interface Product {
  name: string
  category: string
  image: string
  emoji?: string
  description: string
  features: string[]
}

const products: Product[] = [
  // ── FMCG (real product photography) ──
  {
    name: 'Premium Fusilli',
    category: 'FMCG · Pasta',
    image: '/FMCG IMAGES/Pastas/fusilli -1.png',
    description: 'Artisan spiral pasta crafted from finest durum wheat semolina with traditional bronze die extrusion.',
    features: ['Bronze Die Cut', 'Slow Dried', '100% Durum'],
  },
  {
    name: 'BearPops Gummy',
    category: 'FMCG · Confectionary',
    image: '/FMCG IMAGES/Confectionary/Jelly/bearpops.jpg',
    description: 'Playful bear-shaped jelly pops in vibrant natural fruit flavors kids love.',
    features: ['Natural Flavors', 'Halal Certified', 'Fun Shapes'],
  },
  {
    name: 'Wafer Bars',
    category: 'FMCG · Bakery',
    image: '/FMCG IMAGES/Bakery/Wafer and Wafer Bars/wafer -1.png',
    description: 'Crispy multi-layered wafers with rich chocolate and hazelnut cream filling.',
    features: ['Multi-Layer', 'Real Chocolate', 'Hazelnut Cream'],
  },
  {
    name: 'Crispy Chips',
    category: 'FMCG · Snacks',
    image: '/FMCG IMAGES/Snacks/Chips and Crisps/chips and crisp.png',
    description: 'Golden thin-cut potato crisps seasoned with premium spice blends.',
    features: ['Thin Sliced', 'Premium Spice', 'Small Batch'],
  },
  // ── Other 9 HARVICS verticals — using real photography from /public/Industries Picture & /public/Images ──
  {
    name: 'Industrial Solutions',
    category: 'Industrial',
    image: '/Industries Picture/Industrial Solutions.jpg',
    description: 'Heavy-duty machinery, valves, chemicals and PPE for refineries, plants and factories across 22 markets.',
    features: ['ISO 9001', 'API 6D', '316 Stainless'],
  },
  {
    name: 'Premium Textiles',
    category: 'Textiles',
    image: '/Industries Picture/Textile.jpg',
    description: 'Sustainably sourced cotton, denim and home textiles shipped to 28 markets in standard or custom GSM.',
    features: ['BCI Cotton', 'OEKO-TEX', 'Custom GSM'],
  },
  {
    name: 'Oil & Gas',
    category: 'Energy · Oil',
    image: '/Industries Picture/Oil and Gas .jpg',
    description: 'Upstream, midstream and downstream oil & gas trading — crude, refined fuels and petrochemical feedstocks.',
    features: ['ISO 8217', 'BL Tracked', 'Bonded Tank'],
  },
  {
    name: 'Agro Commodities',
    category: 'Agro · Commodities',
    image: '/Industries Picture/Commodities .jpg',
    description: 'Wheat, rice, sugar and pulses sourced direct from farms — bulk shipments with full lab certification.',
    features: ['Origin Audited', 'Lab Tested', 'Bulk / Bagged'],
  },
  {
    name: 'Minerals & Metals',
    category: 'Trading House',
    image: '/Industries Picture/Minerals.jpg',
    description: 'Precious metals, energy minerals and industrial resources traded through HARVICS Trading House.',
    features: ['LBMA Good', 'Origin Audit', 'Vault Stored'],
  },
  {
    name: 'IT & Technology',
    category: 'Tech',
    image: '/Industries Picture/IT.jpg',
    description: 'Enterprise IT, smart logistics platforms and IoT-tracked sourcing across all HARVICS verticals.',
    features: ['Real-Time GPS', 'Multi-modal', 'API First'],
  },
  {
    name: 'Sourcing Solutions',
    category: 'Sourcing',
    image: '/Industries Picture/Sourcing.jpg',
    description: 'Global sourcing, supplier qualification and quality control across 38 markets and 95+ product lines.',
    features: ['Audited Mills', 'QC On-Site', '38 Markets'],
  },
  {
    name: 'Real Estate',
    category: 'Construction',
    image: '/Industries Picture/Real Estate.jpg',
    description: 'OPC, PPC and white cement, structural steel and finishing materials for large-scale EPC projects.',
    features: ['EN 197-1', 'Grade 53', 'EPC Ready'],
  },
  {
    name: 'Trade Finance',
    category: 'Finance · Trading House',
    image: '/Industries Picture/Finance.jpg',
    description: 'Trade finance, LC issuance and treasury services that move HARVICS commerce across the globe.',
    features: ['LC / DA', 'Multi-Currency', 'Bank-Backed'],
  },
]

const Interactive3DProductViewer: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  const product = products[activeIndex]

  // Auto-cycle products every 4.5s — pause on hover
  useEffect(() => {
    if (isPaused || !visible) return
    const t = setInterval(() => {
      setImgLoaded(false)
      setActiveIndex(i => (i + 1) % products.length)
    }, 4500)
    return () => clearInterval(t)
  }, [isPaused, visible])

  // Reveal on visibility
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting && e.intersectionRatio > 0.15),
      { threshold: [0, 0.15, 0.5] }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  const goto = useCallback((idx: number) => {
    setImgLoaded(false)
    setActiveIndex(idx)
  }, [])

  const next = useCallback(() => goto((activeIndex + 1) % products.length), [activeIndex, goto])
  const prev = useCallback(() => goto((activeIndex - 1 + products.length) % products.length), [activeIndex, goto])

  return (
    <section
      ref={sectionRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative h-full overflow-hidden flex flex-col justify-center"
      style={{
        background: 'radial-gradient(ellipse at 50% 45%, #4a1620 0%, #2a0c12 55%, #1a060a 100%)',
        color: '#F5F1E8',
      }}
    >
      {/* Subtle gold film grain / stars */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.12]" style={{
        backgroundImage: 'radial-gradient(rgba(195,163,94,0.4) 0.5px, transparent 0.5px)',
        backgroundSize: '4px 4px',
      }} />

      {/* Top — section eyebrow */}
      <div className="relative z-20 text-center pt-6">
        <div className="inline-flex items-center gap-3">
          <div className="w-10 h-px bg-[#C3A35E]/60" />
          <span className="text-[10px] font-bold uppercase tracking-[0.42em]" style={{ color: '#C3A35E' }}>
            Interactive Showcase
          </span>
          <div className="w-10 h-px bg-[#C3A35E]/60" />
        </div>
        <h2
          className="mt-3 font-light"
          style={{
            fontSize: 'clamp(28px, 3.6vw, 48px)',
            color: '#F5F1E8',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
          }}
        >
          Every product, <span style={{ color: '#E5C07B', fontStyle: 'italic', fontWeight: 300 }}>rises.</span>
        </h2>
      </div>

      {/* ── Cloud stage (pure CSS, GPU-friendly) ── */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4">
        <div className="relative" style={{ width: 'min(72vmin, 600px)', height: 'min(72vmin, 600px)' }}>
          {/* Soft gold-white cloud halo — pure CSS radial gradient */}
          <div
            className="absolute inset-0 hv-cloud-pulse"
            style={{
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 50% 45%, rgba(245,241,232,0.55) 0%, rgba(229,192,123,0.30) 35%, rgba(195,163,94,0.10) 60%, rgba(195,163,94,0) 75%)',
              filter: 'blur(2px)',
              willChange: 'transform, opacity',
            }}
          />
          {/* Outer faint gold ring */}
          <div
            className="absolute inset-[6%] hv-ring-spin"
            style={{
              borderRadius: '50%',
              border: '1px dashed rgba(229,192,123,0.18)',
              willChange: 'transform',
            }}
          />

          {/* Product image rising inside the cloud */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ padding: '18%' }}>
            <div
              key={activeIndex}
              className="hv-rise relative w-full h-full"
              style={{ transformOrigin: 'center bottom' }}
            >
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  onLoad={() => setImgLoaded(true)}
                  draggable={false}
                  className="w-full h-full object-contain"
                  style={{
                    filter: 'drop-shadow(0 20px 32px rgba(0,0,0,0.45))',
                    opacity: imgLoaded ? 1 : 0,
                    transition: 'opacity 0.5s ease',
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ fontSize: 'clamp(80px, 14vw, 160px)', color: '#E5C07B' }}>
                  {product.emoji || '✦'}
                </div>
              )}
            </div>
          </div>

          {/* Floating product label — overlaid */}
          <div
            key={`label-${activeIndex}`}
            className="hv-fade absolute left-1/2 -translate-x-1/2 text-center pointer-events-none"
            style={{ bottom: '-2%', width: 'min(420px, 85%)' }}
          >
            <div style={{
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.32em',
              color: '#C3A35E', textTransform: 'uppercase', marginBottom: 6,
            }}>
              {product.category}
            </div>
            <div style={{
              fontSize: 'clamp(20px, 2.2vw, 30px)',
              fontWeight: 300,
              color: '#F5F1E8',
              letterSpacing: '-0.02em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
            }}>
              {product.name}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom controls: feature pills + dots + arrows ── */}
      <div className="relative z-20 pb-6 px-4">
        <div
          key={`pills-${activeIndex}`}
          className="hv-fade flex justify-center gap-2 flex-wrap mb-5 max-w-[640px] mx-auto"
        >
          {product.features.map((f) => (
            <span
              key={f}
              className="px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase"
              style={{
                color: '#E5C07B',
                background: 'rgba(229,192,123,0.06)',
                border: '1px solid rgba(229,192,123,0.25)',
                borderRadius: '999px',
                backdropFilter: 'blur(6px)',
              }}
            >
              {f}
            </span>
          ))}
        </div>

        {/* Dot navigator */}
        <div className="flex justify-center items-center gap-1.5 flex-wrap max-w-[640px] mx-auto">
          <button
            onClick={prev}
            aria-label="Previous product"
            className="mr-3 w-7 h-7 flex items-center justify-center rounded-full transition-all"
            style={{ border: '1px solid rgba(229,192,123,0.35)', color: '#E5C07B', background: 'transparent' }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {products.map((p, i) => (
            <button
              key={p.name}
              onClick={() => goto(i)}
              aria-label={`Show ${p.name}`}
              className="transition-all"
              style={{
                width: i === activeIndex ? 22 : 6,
                height: 6,
                borderRadius: 3,
                background: i === activeIndex ? '#E5C07B' : 'rgba(229,192,123,0.25)',
                border: 'none',
                cursor: 'pointer',
                transition: 'width 0.4s ease, background 0.4s ease',
              }}
            />
          ))}

          <button
            onClick={next}
            aria-label="Next product"
            className="ml-3 w-7 h-7 flex items-center justify-center rounded-full transition-all"
            style={{ border: '1px solid rgba(229,192,123,0.35)', color: '#E5C07B', background: 'transparent' }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="text-center mt-4">
          <span style={{ fontSize: 10, color: 'rgba(245,241,232,0.4)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
            {String(activeIndex + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}
            &nbsp;&middot;&nbsp; Hover to pause
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes hv-rise {
          0%   { opacity: 0; transform: translateY(38px) scale(0.92); }
          60%  { opacity: 1; transform: translateY(-6px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .hv-rise {
          animation: hv-rise 1.1s cubic-bezier(0.16, 1, 0.3, 1) both;
          will-change: transform, opacity;
        }
        @keyframes hv-fade {
          0%   { opacity: 0; transform: translate(-50%, 8px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
        .hv-fade {
          animation: hv-fade 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes hv-cloud-pulse {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50%      { transform: scale(1.04); opacity: 1; }
        }
        .hv-cloud-pulse {
          animation: hv-cloud-pulse 8s ease-in-out infinite;
        }
        @keyframes hv-ring-spin {
          to { transform: rotate(360deg); }
        }
        .hv-ring-spin {
          animation: hv-ring-spin 80s linear infinite;
        }
      `}</style>
    </section>
  )
}

export default Interactive3DProductViewer
