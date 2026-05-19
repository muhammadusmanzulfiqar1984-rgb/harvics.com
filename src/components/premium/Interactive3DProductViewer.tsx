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
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isAutoRotating, setIsAutoRotating] = useState(true)
  const [scale, setScale] = useState(1)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const lastPos = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const autoRotateRef = useRef<number>(0)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const product = products[activeIndex]

  // Gentle auto-rotate
  useEffect(() => {
    if (!isAutoRotating) return
    let angle = rotation.y
    const animate = () => {
      angle += 0.15
      setRotation(prev => ({ ...prev, y: angle }))
      autoRotateRef.current = requestAnimationFrame(animate)
    }
    autoRotateRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(autoRotateRef.current)
  }, [isAutoRotating])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true)
    setIsAutoRotating(false)
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    lastPos.current = { x: e.clientX, y: e.clientY }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    setRotation(prev => ({
      x: Math.max(-25, Math.min(25, prev.x - dy * 0.35)),
      y: prev.y + dx * 0.35,
    }))
    lastPos.current = { x: e.clientX, y: e.clientY }
  }, [isDragging])

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
    resumeTimer.current = setTimeout(() => setIsAutoRotating(true), 4000)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setScale(prev => Math.max(0.7, Math.min(1.6, prev - e.deltaY * 0.001)))
  }, [])

  // Ambient mouse tracking for section-level parallax
  const handleSectionMouse = useCallback((e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect()
    if (!rect) return
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }, [])

  const switchProduct = useCallback((idx: number) => {
    setActiveIndex(idx)
    setRotation({ x: 0, y: 0 })
    setScale(1)
    setIsAutoRotating(true)
  }, [])

  // Parallax offsets
  const px = (mousePos.x - 0.5) * 12
  const py = (mousePos.y - 0.5) * 8

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleSectionMouse}
      className="relative h-full overflow-hidden flex flex-col justify-center"
      style={{ background: 'linear-gradient(160deg, #ffffff 0%, #fdfcfa 40%, #f7f4ef 70%, #fdfcfa 100%)' }}
    >
      {/* Soft gold radial glow — focused only behind the product area */}
      <div className="absolute pointer-events-none" style={{
        width: '600px', height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(195,163,94,0.10) 0%, rgba(195,163,94,0.04) 45%, transparent 70%)',
        filter: 'blur(60px)',
        left: `${28 + px * 0.2}%`,
        top: `${50 + py * 0.15}%`,
        transform: 'translate(-50%, -50%)',
        transition: 'left 0.5s ease, top 0.5s ease',
      }} />

      {/* Very subtle maroon whisper — top right corner only */}
      <div className="absolute pointer-events-none" style={{
        width: '400px', height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(107,31,43,0.04) 0%, transparent 70%)',
        filter: 'blur(80px)',
        right: '-5%', top: '5%',
      }} />

      {/* Barely-there grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(107,31,43,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(107,31,43,0.025) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      {/* Section Header */}
      <div className="text-center mb-4 relative z-10">
        <div className="inline-flex items-center gap-2 mb-1">
          <div className="w-8 h-px bg-[#C3A35E]" />
          <span className="text-[#C3A35E] text-[11px] font-bold uppercase tracking-[0.35em]">
            Interactive Experience
          </span>
          <div className="w-8 h-px bg-[#C3A35E]" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#6B1F2B] mb-1" style={{ letterSpacing: '-0.03em' }}>
          Explore in 3D
        </h2>
        <p className="text-[#6B1F2B]/45 text-sm max-w-lg mx-auto leading-relaxed">
          Grab and rotate any product. Scroll to zoom in on details.
        </p>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex flex-col lg:flex-row items-center gap-6 relative z-10">

        {/* ─── 3D Viewer Stage ─── */}
        <div className="flex-1 flex items-center justify-center w-full" style={{ perspective: '1400px' }}>
          <div className="relative">
            {/* Ground shadow ellipse */}
            <div
              className="absolute left-1/2 -translate-x-1/2 bottom-[-30px] w-[70%] h-12 rounded-[50%] blur-2xl transition-all duration-700"
              style={{
                background: 'radial-gradient(ellipse, rgba(107,31,43,0.12) 0%, transparent 70%)',
                transform: `translateX(-50%) scale(${0.8 + scale * 0.2})`,
              }}
            />

            {/* Orbit ring — decorative */}
            <div
              className="absolute inset-[-40px] rounded-full pointer-events-none transition-transform duration-200"
              style={{
                border: '1px solid rgba(195,163,94,0.12)',
                transform: `rotateX(72deg) rotateZ(${rotation.y * 0.08}deg)`,
              }}
            />
            <div
              className="absolute inset-[-25px] rounded-full pointer-events-none transition-transform duration-200"
              style={{
                border: '1px dashed rgba(195,163,94,0.08)',
                transform: `rotateX(72deg) rotateZ(${-rotation.y * 0.05}deg)`,
              }}
            />

            {/* Main interactive area */}
            <div
              ref={containerRef}
              className="relative w-[340px] h-[420px] md:w-[420px] md:h-[520px] cursor-grab active:cursor-grabbing select-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onWheel={handleWheel}
              style={{ touchAction: 'none' }}
            >
              {/* 3D Rotating Container */}
              <div
                className="absolute inset-0"
                style={{
                  transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${scale})`,
                  transformStyle: 'preserve-3d',
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                }}
              >
                {/* Card face — Light glass on cream */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    background: 'linear-gradient(160deg, rgba(255,255,255,0.96) 0%, rgba(250,249,247,0.92) 50%, rgba(245,244,242,0.90) 100%)',
                    border: '1px solid rgba(195,163,94,0.25)',
                    borderRadius: '28px',
                    boxShadow: `
                      0 30px 80px rgba(107,31,43,0.07),
                      0 8px 24px rgba(107,31,43,0.04),
                      0 0 0 1px rgba(255,255,255,0.7) inset
                    `,
                    backfaceVisibility: 'hidden',
                  }}
                >
                  {/* Dynamic light reflection following rotation */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `linear-gradient(${130 + rotation.y * 0.6}deg,
                        rgba(255,255,255,0.5) 0%,
                        rgba(255,255,255,0.1) 25%,
                        transparent 50%,
                        rgba(195,163,94,0.03) 80%,
                        rgba(195,163,94,0.06) 100%
                      )`,
                      borderRadius: '28px',
                    }}
                  />

                  {/* Top decorative accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[28px]"
                    style={{ background: 'linear-gradient(90deg, transparent, #C3A35E, transparent)' }}
                  />

                  {/* Category label floating at top */}
                  <div className="absolute top-5 left-0 right-0 flex justify-center z-10">
                    <span
                      className="px-4 py-1 text-[10px] font-bold uppercase tracking-[0.25em] rounded-full"
                      style={{
                        background: 'rgba(107,31,43,0.06)',
                        color: '#6B1F2B',
                        border: '1px solid rgba(107,31,43,0.1)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      {product.category}
                    </span>
                  </div>

                  {/* Product Image — hero placement (image OR emoji glyph fallback) */}
                  <div className="absolute inset-0 top-12 bottom-32 flex items-center justify-center px-8">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain transition-all duration-500"
                        style={{
                          filter: 'drop-shadow(0 16px 40px rgba(107,31,43,0.12)) drop-shadow(0 4px 12px rgba(195,163,94,0.15))',
                          transform: `translateY(${Math.sin(rotation.y * 0.02) * 3}px)`,
                        }}
                        draggable={false}
                      />
                    ) : (
                      <div
                        className="flex items-center justify-center select-none"
                        style={{
                          width: '78%',
                          height: '78%',
                          borderRadius: '50%',
                          background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.95) 0%, rgba(245,241,232,0.85) 55%, rgba(195,163,94,0.18) 100%)',
                          border: '1px solid rgba(195,163,94,0.35)',
                          boxShadow: 'inset 0 4px 18px rgba(255,255,255,0.7), 0 18px 40px rgba(107,31,43,0.10), 0 4px 12px rgba(195,163,94,0.18)',
                          fontSize: 'clamp(96px, 16vw, 180px)',
                          lineHeight: 1,
                          transform: `translateY(${Math.sin(rotation.y * 0.02) * 3}px)`,
                        }}
                      >
                        <span style={{ filter: 'drop-shadow(0 8px 14px rgba(107,31,43,0.18))' }}>
                          {product.emoji || '✦'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Subtle texture dots */}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        width: `${2 + (i % 3)}px`,
                        height: `${2 + (i % 3)}px`,
                        backgroundColor: 'rgba(195,163,94,0.15)',
                        left: `${12 + i * 11}%`,
                        top: `${15 + (i * 7) % 60}%`,
                        animation: `gentleFloat ${4 + i * 0.6}s ease-in-out infinite alternate`,
                        animationDelay: `${i * 0.4}s`,
                      }}
                    />
                  ))}

                  {/* Bottom info strip */}
                  <div
                    className="absolute bottom-0 left-0 right-0 p-6"
                    style={{
                      background: 'linear-gradient(to top, rgba(245,241,232,0.98) 0%, rgba(245,241,232,0.9) 60%, transparent 100%)',
                      borderRadius: '0 0 28px 28px',
                    }}
                  >
                    <h3 className="text-xl font-bold text-[#6B1F2B] mb-1" style={{ letterSpacing: '-0.02em' }}>
                      {product.name}
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      {product.features.map((f, i) => (
                        <span
                          key={i}
                          className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{
                            background: 'rgba(195,163,94,0.12)',
                            color: '#6B1F2B',
                            border: '1px solid rgba(195,163,94,0.2)',
                          }}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Corner accents */}
                  <div className="absolute top-4 left-4 w-5 h-5 border-t border-l border-[#C3A35E]/30 rounded-tl-lg" />
                  <div className="absolute top-4 right-4 w-5 h-5 border-t border-r border-[#C3A35E]/30 rounded-tr-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Product Info & Selector Panel ─── */}
        <div className="flex-1 max-w-md w-full">
          {/* Product details */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #6B1F2B, #8B3A4B)',
                  boxShadow: '0 4px 12px rgba(107,31,43,0.2)',
                }}
              >
                <svg className="w-5 h-5 text-[#C3A35E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C3A35E] block">
                  {product.category}
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-[#6B1F2B]" style={{ letterSpacing: '-0.02em' }}>
                  {product.name}
                </h3>
              </div>
            </div>
            <p className="text-[#6B1F2B]/50 text-[15px] leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Interaction hints */}
            <div className="flex items-center gap-6 text-[#6B1F2B]/30 text-xs">
              <span className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#6B1F2B]/5 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </span>
                Drag to rotate
              </span>
              <span className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#6B1F2B]/5 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </span>
                Scroll to zoom
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#C3A35E]/15" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C3A35E]/50">Our Products</span>
            <div className="flex-1 h-px bg-[#C3A35E]/15" />
          </div>

          {/* Product selector thumbnails — 5-col grid scrollable for all 10 verticals */}
          <div className="grid grid-cols-5 gap-2 max-h-[260px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
            {products.map((p, idx) => (
              <button
                key={idx}
                onClick={() => switchProduct(idx)}
                title={p.name}
                className={`relative p-2 rounded-xl transition-all duration-300 group ${
                  idx === activeIndex ? 'scale-[1.04]' : 'hover:scale-[1.02]'
                }`}
                style={{
                  background: idx === activeIndex
                    ? 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(245,241,232,0.9))'
                    : 'rgba(255,255,255,0.4)',
                  border: idx === activeIndex
                    ? '2px solid rgba(195,163,94,0.5)'
                    : '1px solid rgba(195,163,94,0.1)',
                  boxShadow: idx === activeIndex
                    ? '0 8px 24px rgba(107,31,43,0.08), 0 2px 8px rgba(195,163,94,0.1)'
                    : '0 2px 8px rgba(0,0,0,0.02)',
                }}
              >
                {/* Active indicator dot */}
                {idx === activeIndex && (
                  <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#C3A35E] shadow-sm shadow-[#C3A35E]/30" />
                )}
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-12 object-contain transition-transform duration-300 group-hover:scale-110"
                    style={{
                      filter: idx === activeIndex
                        ? 'drop-shadow(0 4px 8px rgba(107,31,43,0.1))'
                        : 'none',
                    }}
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-12 flex items-center justify-center text-3xl transition-transform duration-300 group-hover:scale-110">
                    <span style={{ filter: idx === activeIndex ? 'drop-shadow(0 4px 8px rgba(107,31,43,0.15))' : 'none' }}>
                      {p.emoji || '✦'}
                    </span>
                  </div>
                )}
                <span className={`text-[9px] mt-1 block text-center truncate font-medium transition-colors ${idx === activeIndex ? 'text-[#6B1F2B]' : 'text-[#6B1F2B]/35'}`}>
                  {p.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes gentleFloat {
          0% { transform: translateY(0) scale(1); opacity: 0.15; }
          100% { transform: translateY(-12px) scale(1.3); opacity: 0.35; }
        }
      `}</style>
    </section>
  )
}

export default Interactive3DProductViewer
