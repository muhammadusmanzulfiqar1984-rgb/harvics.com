'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import Image from 'next/image'

interface NavigationItem {
  id: string
  label: string
  href: string
  image?: string
  icon?: string
  order: number
}

interface MegaMenuSection {
  id: string
  title: string
  type: 'visual' | 'text' | 'mixed'
  items: NavigationItem[]
  columns?: number
}

interface FoodMegaMenuProps {
  sections: MegaMenuSection[]
  isOpen: boolean
  onClose: () => void
}

const FoodMegaMenu: React.FC<FoodMegaMenuProps> = ({ sections, isOpen, onClose }) => {
  const locale = useLocale()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const visualSection = sections.find(s => s.type === 'visual')
  const textSections = sections.filter(s => s.type === 'text')

  return (
    <div
      ref={menuRef}
      className="absolute top-full left-0 right-0 bg-white border-t-2 border-black200 shadow-2xl z-50"
      onMouseLeave={onClose}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar - Visual Navigation */}
          {visualSection && (
            <div className="col-span-12 lg:col-span-3">
              <div className="space-y-4">
                {visualSection.items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/${locale}${item.href}`}
                    className="flex items-center space-x-4 p-3 hover:bg-white rounded-lg transition-colors group"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-black200 group-hover:border-[#6B1F2B] transition-colors">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.label}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full bg-white flex items-center justify-center">
                          <span className="text-2xl">{item.icon || '🍽️'}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-black group-hover:text-black transition-colors">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Right Section - Text Navigation Columns */}
          <div className="col-span-12 lg:col-span-9">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {textSections.map((section) => (
                <div key={section.id}>
                  <h3 className="text-sm font-bold text-black uppercase tracking-wide mb-4">
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/${locale}${item.href}`}
                          className="text-sm text-black hover:text-black transition-colors block py-1"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FoodMegaMenu



