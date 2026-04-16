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

  const handleLogout = () => {
    setIsOpen(false)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      localStorage.removeItem('user_scope')
      localStorage.removeItem('user_type')
      document.cookie = 'auth_token=; path=/; max-age=0'
      document.cookie = 'x_role=; path=/; max-age=0'
    }
    router.replace(`/${locale}/login`)
  }

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

          {/* Logout */}
          <div className="mt-2 pt-2 border-t border-[#C3A35E]/20 px-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

