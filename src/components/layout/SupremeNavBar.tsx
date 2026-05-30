 'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { navVerticals, slugify } from '@/data/megaMenuData'
import type { MegaMenuBlock, NavVertical } from '@/data/megaMenuData'

/**
 * Apple-style Mega Menu Navigation
 * - Full-width dropdown with smooth height animation
 * - Background overlay dims the page
 * - Clean 4-column grid with elegant hover effects
 * - Smooth enter/leave with delay
 */

const SupremeNavBar: React.FC = () => {
  const locale = useLocale()
  const pathname = usePathname()
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const navRef = useRef<HTMLElement>(null)

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const openDropdown = useCallback((key: string) => {
    clearTimer()
    if (activeDropdown !== key) {
      setIsAnimating(true)
      setActiveDropdown(key)
      // Allow animation to complete
      setTimeout(() => setIsAnimating(false), 300)
    }
  }, [activeDropdown, clearTimer])

  const closeDropdown = useCallback(() => {
    clearTimer()
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 200)
  }, [clearTimer])

  const cancelClose = useCallback(() => {
    clearTimer()
  }, [clearTimer])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  // Close on route change
  useEffect(() => {
    setActiveDropdown(null)
  }, [pathname])

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveDropdown(null)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  const isActive = (href: string) => {
    if (!pathname) return false
    return pathname.startsWith(href)
  }

  const activeVertical = navVerticals.find(v => v.key === activeDropdown)

  // Shorter labels for the nav bar to prevent overflow
  const navLabels: Record<string, string> = {
    textiles: 'Apparels',
    fmcg: 'FMCG',
    commodities: 'Commodities',
    industrial: 'Industrial',
    minerals: 'Minerals',
    'oil-gas': 'Oil & Gas',
    'real-estate': 'Real Estate',
    sourcing: 'Sourcing',
    finance: 'Finance',
    ai: 'AI & Tech',
  }

  return (
    <>
      <nav
        ref={navRef}
        className="relative bg-white"
        onMouseLeave={closeDropdown}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Nav Links */}
        <div className="universal-layout-frame">
          <ul className="flex items-center justify-between gap-1 list-none m-0 p-0 h-[40px] w-full" role="menubar" aria-label="Main navigation">
            {/* About — first tab */}
            <li
              className="relative flex items-center"
              style={{
                animation: `fadeSlideIn 0.4s ease-out forwards`,
                animationDelay: '0s',
                opacity: 0,
              }}
            >
              <Link
                href={`/${locale}/about`}
                className={`text-[10px] font-semibold tracking-[0.12em] uppercase px-3 py-1.5 transition-all duration-200 whitespace-nowrap ${isActive(`/${locale}/about`) ? 'bg-[#1a0608] text-white' : 'text-[#1a0608] hover:bg-[#C9A84C]/10 hover:text-[#C9A84C]'}`}
                onMouseEnter={() => { clearTimer(); setActiveDropdown(null) }}
              >
                About
              </Link>
            </li>

            {navVerticals.map((vertical, idx) => (
              <li
                key={vertical.key}
                className="relative flex items-center"
                role="none"
                onMouseEnter={() => openDropdown(vertical.key)}
                style={{
                  animation: `fadeSlideIn 0.4s ease-out forwards`,
                  animationDelay: `${idx * 0.05}s`,
                  opacity: 0,
                }}
              >
                <Link
                  href={`/${locale}${vertical.href}`}
                  className={`text-[10px] font-semibold tracking-[0.12em] uppercase px-3 py-1.5 transition-all duration-200 whitespace-nowrap ${activeDropdown === vertical.key || isActive(`/${locale}${vertical.href}`) ? 'bg-[#1a0608] text-white' : 'text-[#1a0608] hover:bg-[#C9A84C]/10 hover:text-[#C9A84C]'}`}
                  role="menuitem"
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === vertical.key}
                >
                  {navLabels[vertical.key] || vertical.label}
                </Link>
              </li>
            ))}

            {/* Apps — highlighted tab */}
            <li
              className="relative flex items-center"
              style={{
                animation: `fadeSlideIn 0.4s ease-out forwards`,
                animationDelay: `${navVerticals.length * 0.05}s`,
                opacity: 0,
              }}
              onMouseEnter={() => { clearTimer(); setActiveDropdown(null) }}
            >
              <Link
                href={`/${locale}/apps`}
                className={`text-[10px] font-semibold tracking-[0.12em] uppercase px-3 py-1.5 transition-all duration-200 whitespace-nowrap ${isActive(`/${locale}/apps`) ? 'bg-[#1a0608] text-white' : 'text-[#1a0608] hover:bg-[#C9A84C]/10 hover:text-[#C9A84C]'}`}
              >
                ⬡ Apps
              </Link>
            </li>

            {/* HarvicTrade — B2B Marketplace tab */}
            <li
              className="relative flex items-center"
              style={{
                animation: `fadeSlideIn 0.4s ease-out forwards`,
                animationDelay: `${(navVerticals.length + 0.5) * 0.05}s`,
                opacity: 0,
              }}
              onMouseEnter={() => { clearTimer(); setActiveDropdown(null) }}
            >
              <Link
                href={`/${locale}/harvictrade`}
                className="text-[10px] font-bold text-[#1a0608] border-l border-[#C9A84C]/30 pl-3 ml-1 tracking-[0.12em] uppercase hover:text-[#C9A84C] transition-colors duration-200 whitespace-nowrap py-1.5"
              >
                ♦ HARVICTRADE
              </Link>
            </li>

            {/* Static links */}
            {[
              { label: 'Contact', href: '/contact' },
            ].map((link, idx) => (
              <li key={link.href} className="relative flex items-center"
                style={{
                  animation: `fadeSlideIn 0.4s ease-out forwards`,
                  animationDelay: `${(navVerticals.length + 1 + idx) * 0.05}s`,
                  opacity: 0,
                }}
              >
                <Link
                  href={`/${locale}${link.href}`}
                  className={`text-[10px] font-semibold tracking-[0.12em] uppercase px-3 py-1.5 transition-all duration-200 whitespace-nowrap ${isActive(`/${locale}${link.href}`) ? 'bg-[#1a0608] text-white' : 'text-[#1a0608] hover:bg-[#C9A84C]/10 hover:text-[#C9A84C]'}`}
                  onMouseEnter={() => { clearTimer(); setActiveDropdown(null) }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Mega Dropdown — Apple-style full width, animated */}
        <div
          className={`absolute top-full left-[calc(-50vw+50%)] w-[100vw] overflow-hidden transition-all duration-300 ease-vault ${activeDropdown && activeVertical ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-8px]'}`}
          role="menu"
          aria-label={activeVertical ? `${activeVertical.label} submenu` : undefined}
          style={{
            maxHeight: activeDropdown && activeVertical ? '450px' : '0px',
            transition: 'max-height 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 9999,
          }}
          onMouseEnter={cancelClose}
          onMouseLeave={closeDropdown}
        >
          <div
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 100%)',
              borderTop: '1px solid rgba(255,255,255,1)',
              borderBottom: '1px solid rgba(201, 168, 76, 0.12)',
              boxShadow: '0 1px 0 rgba(255,255,255,1) inset, 0 -1px 0 rgba(255,255,255,0.8) inset, 0 16px 48px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.05)',
            }}
          >
            <div className="max-w-[1200px] mx-auto px-6 py-10">
              {activeVertical && (
                <div className="grid grid-cols-4 gap-x-12 gap-y-6">
                  {activeVertical.blocks.map((block, blockIdx) => (
                    <div 
                      key={block.title}
                      style={{
                        animation: activeDropdown ? `fadeSlideUp 0.4s ease-out forwards` : 'none',
                        animationDelay: `${blockIdx * 0.08}s`,
                        opacity: 0,
                      }}
                    >
                      <Link
                        href={`/${locale}/${activeVertical.key}/${slugify(block.title)}`}
                        className="block mb-4 group/title"
                        style={{
                          color: '#1A0505',
                          fontSize: '12px',
                          fontWeight: 700,
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.08em',
                          textDecoration: 'none',
                        }}
                      >
                        <span className="transition-colors duration-200 group-hover/title:text-[#C9A84C]">
                          {block.title}
                        </span>
                      </Link>
                      <div className="flex flex-col gap-0.5">
                        {block.items.map((item, itemIdx) => (
                          <Link
                            key={item}
                            href={`/${locale}/${activeVertical.key}/${slugify(block.title)}/${slugify(item)}`}
                            className="group/item relative pl-0 transition-all duration-200 hover:pl-2.5 py-1"
                            style={{
                              display: 'block',
                              color: '#1A0505',
                              fontSize: '13px',
                              fontWeight: 400,
                              opacity: hoveredItem === `${block.title}-${item}` ? 1 : 0.5,
                              textDecoration: 'none',
                              lineHeight: '1.5',
                              animation: activeDropdown ? `fadeSlideUp 0.35s ease-out forwards` : 'none',
                              animationDelay: `${blockIdx * 0.08 + (itemIdx + 1) * 0.03}s`,
                            }}
                            onMouseEnter={() => setHoveredItem(`${block.title}-${item}`)}
                            onMouseLeave={() => setHoveredItem(null)}
                          >
                            <span className="relative">
                              {item}
                              {/* Gold dot indicator */}
                              <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#C9A84C] rounded-full opacity-0 scale-0 transition-all duration-200 group-hover/item:opacity-100 group-hover/item:scale-100" />
                              {/* Gold underline slide */}
                              <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-[#C9A84C]/60 group-hover/item:w-full transition-all duration-300 ease-out" />
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </nav>

      {/* Background overlay — dims the page behind dropdown */}
      <div
        className="absolute top-full left-[calc(-50vw+50%)] w-[100vw] h-[100vh] pointer-events-none"
        style={{
          background: 'rgba(0, 0, 0, 0.25)',
          opacity: activeDropdown ? 1 : 0,
          transition: 'opacity 0.5s ease',
          zIndex: 998,
        }}
        onClick={() => setActiveDropdown(null)}
      />
    </>
  )
}

export default SupremeNavBar
