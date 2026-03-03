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
 * - Clean 4-column grid, no borders, just typography
 * - Smooth enter/leave with delay
 */

const SupremeNavBar: React.FC = () => {
  const locale = useLocale()
  const pathname = usePathname()
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
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

  return (
    <>
      <nav
        ref={navRef}
        className="relative"
        onMouseLeave={closeDropdown}
      >
        {/* Nav Links */}
        <div className="max-w-[1200px] mx-auto px-4">
          <ul className="flex items-center justify-center gap-0 list-none m-0 p-0 h-[44px]">
            {navVerticals.map((vertical) => (
              <li
                key={vertical.key}
                className="relative h-full flex items-center"
                onMouseEnter={() => openDropdown(vertical.key)}
              >
                <Link
                  href={`/${locale}${vertical.href}`}
                  className="flex items-center h-full px-3 lg:px-4 text-[11px] tracking-[0.02em] whitespace-nowrap"
                  style={{
                    color: '#6B1F2B',
                    opacity: activeDropdown === vertical.key ? 1 : isActive(`/${locale}${vertical.href}`) ? 1 : 0.65,
                    fontWeight: isActive(`/${locale}${vertical.href}`) ? 600 : 400,
                    textDecoration: 'none',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.04em',
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  {vertical.label}
                </Link>
              </li>
            ))}

            {/* Static links */}
            {[
              { label: 'About', href: '/about' },
              { label: 'Contact', href: '/contact' },
            ].map(link => (
              <li key={link.href} className="relative h-full flex items-center">
                <Link
                  href={`/${locale}${link.href}`}
                  className="flex items-center h-full px-3 lg:px-4 text-[11px] tracking-[0.02em] whitespace-nowrap"
                  style={{
                    color: '#6B1F2B',
                    opacity: isActive(`/${locale}${link.href}`) ? 1 : 0.65,
                    fontWeight: isActive(`/${locale}${link.href}`) ? 600 : 400,
                    textDecoration: 'none',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.04em',
                    transition: 'opacity 0.3s ease',
                  }}
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
          className="absolute top-full left-0 w-full overflow-hidden"
          style={{
            maxHeight: activeDropdown && activeVertical ? '400px' : '0px',
            opacity: activeDropdown && activeVertical ? 1 : 0,
            transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
            zIndex: 9999,
          }}
          onMouseEnter={cancelClose}
          onMouseLeave={closeDropdown}
        >
          <div
            style={{
              background: 'rgba(245, 241, 232, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(195, 163, 94, 0.2)',
            }}
          >
            <div className="max-w-[1200px] mx-auto px-6 py-10">
              {activeVertical && (
                <div className="grid grid-cols-4 gap-x-12 gap-y-6">
                  {activeVertical.blocks.map((block) => (
                    <div key={block.title}>
                      <Link
                        href={`/${locale}/${activeVertical.key}/${slugify(block.title)}`}
                        className="block mb-3"
                        style={{
                          color: '#6B1F2B',
                          fontSize: '12px',
                          fontWeight: 700,
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.06em',
                          textDecoration: 'none',
                          transition: 'opacity 0.2s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.6' }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
                      >
                        {block.title}
                      </Link>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '0', padding: '0' }}>
                        {block.items.map((item) => (
                          <div key={item} style={{ display: 'block' }}>
                            <Link
                              href={`/${locale}/${activeVertical.key}/${slugify(block.title)}/${slugify(item)}`}
                              style={{
                                display: 'block',
                                color: '#6B1F2B',
                                fontSize: '13px',
                                fontWeight: 400,
                                opacity: 0.55,
                                textDecoration: 'none',
                                transition: 'opacity 0.2s ease',
                                lineHeight: '1.4',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
                              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.55' }}
                            >
                              {item}
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Background overlay — dims the page behind dropdown */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
          opacity: activeDropdown ? 1 : 0,
          transition: 'opacity 0.4s ease',
          zIndex: 999,
          top: navRef.current ? navRef.current.getBoundingClientRect().bottom + 'px' : '180px',
        }}
        onClick={() => setActiveDropdown(null)}
      />
    </>
  )
}

export default SupremeNavBar
