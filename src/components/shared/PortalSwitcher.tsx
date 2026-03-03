'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'

interface PortalSwitcherProps {
  currentPortal: 'company' | 'distributor' | 'supplier'
}

export default function PortalSwitcher({ currentPortal }: PortalSwitcherProps) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const portals = [
    { id: 'company', label: 'Company', path: `/dashboard/company`, icon: '🏢', name: 'Company HQ', description: 'Overall business performance' },
    { id: 'distributor', label: 'Distributor', path: `/portal/distributor`, icon: '🚚', name: 'Distributor Portal', description: 'Sales and logistics' },
    { id: 'supplier', label: 'Supplier', path: `/portal/supplier`, icon: '📦', name: 'Supplier Hub', description: 'Inventory and procurement' }
  ]

  const currentPortalConfig = portals.find(p => p.id === currentPortal)

  const handlePortalSwitch = (path: string) => {
    router.push(`/${locale}${path}`)
    setIsOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#C3A35E]/30 rounded-md hover:bg-[#F8F9FA] transition-colors"
      >
        <span className="text-lg">{currentPortalConfig?.icon || '🌐'}</span>
        <span className="text-sm font-bold text-[#6B1F2B] hidden sm:inline">
          {currentPortalConfig?.name || 'Switch Portal'}
        </span>
        <span className="text-xs text-[#6B1F2B]/50">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-[#C3A35E] rounded-lg shadow-xl z-50 py-2">
          <div className="px-4 py-2 border-b border-[#C3A35E]/20 mb-2">
            <p className="text-xs font-bold text-[#6B1F2B] uppercase tracking-wider">Switch Context</p>
          </div>
          
          <div className="space-y-1">
            {portals.map((portal) => (
              <button
                key={portal.id}
                onClick={() => handlePortalSwitch(portal.path)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                  currentPortal === portal.id
                    ? 'bg-[#C3A35E]/10 text-[#6B1F2B] font-bold border-l-4 border-[#6B1F2B]'
                    : 'text-[#6B1F2B]/80 hover:bg-[#F8F9FA] hover:text-[#6B1F2B] border-l-4 border-transparent'
                }`}
              >
                <span className="text-xl">{portal.icon}</span>
                <div>
                  <div className="text-sm font-medium">{portal.name}</div>
                  <div className="text-[10px] text-[#6B1F2B]/60">{portal.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

