'use client'

import React, { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'

interface UserInfoBarProps {
  role?: 'distributor' | 'supplier' | 'company' | 'admin' | 'hq' | 'country_manager' | 'company_admin' | 'super_admin'
  className?: string
}

export default function UserInfoBar({ role, className = '' }: UserInfoBarProps) {
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('common')
  const [userInfo, setUserInfo] = useState<{
    username: string
    role: string
    fullName?: string
  } | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const loadUserInfo = () => {
      if (typeof window !== 'undefined') {
        const userScopeStr = localStorage.getItem('user_scope')
        const userType = localStorage.getItem('user_type')
        
        if (userScopeStr) {
          try {
            const userScope = JSON.parse(userScopeStr)
            setUserInfo({
              username: userScope.userId || userScope.username || 'User',
              role: userScope.role || userType || 'user',
              fullName: userScope.fullName || userScope.name
            })
            return
          } catch (e) {
            console.error('Error parsing user scope:', e)
          }
        }
        
        // Fallback: Use defaults based on user type
        const token = localStorage.getItem('auth_token')
        if (token) {
          // Demo mode fallback - get from user type
          const defaultUsername = userType === 'supplier' ? 'supplier_user' : 
                                  userType === 'distributor' ? 'distributor_user' : 
                                  userType === 'company' || !userType ? 'admin' : 'User'
          setUserInfo({
            username: defaultUsername,
            role: userType || 'admin'
          })
        } else {
          // No token - default
          setUserInfo({
            username: 'User',
            role: userType || 'user'
          })
        }
      }
    }

    loadUserInfo()
  }, [])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      apiClient.clearToken()
      localStorage.removeItem('user_scope')
      localStorage.removeItem('user_type')
      router.push(`/${locale}/login`)
    }
  }

  const getRoleLabel = () => {
    if (!userInfo) return ''
    const roleLabels: Record<string, string> = {
      distributor: 'Distributor',
      supplier: 'Supplier',
      company: 'Company Admin',
      hq: 'HQ Admin',
      country_manager: 'Country Manager',
      admin: 'Admin',
      sales_officer: 'Sales Officer'
    }
    return roleLabels[userInfo.role] || userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1)
  }

  if (!userInfo) {
    return (
      <div className={`bg-gradient-to-r from-[#6B1F2B] to-[#ffffff] text-white px-4 py-2 text-sm ${className}`}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/20 rounded-full animate-pulse"></div>
            <span className="text-[#C3A35E]/90">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-r from-[#6B1F2B] to-[#ffffff] text-white px-4 py-2 text-sm shadow-md ${className}`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center border border-[#C3A35E]/30">
              <span className="text-xs font-bold">{userInfo.username.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-white">Logged in as: {userInfo.fullName || userInfo.username}</span>
              <span className="text-xs text-[#C3A35E]/90">{getRoleLabel()}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span>{userInfo.username.charAt(0).toUpperCase()}</span>
            <span className="text-xs">▼</span>
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-black200 z-50">
              <div className="p-2">
                <div className="px-4 py-2 border-b border-black200">
                  <div className="font-semibold text-black text-sm">{userInfo.fullName || userInfo.username}</div>
                  <div className="text-xs text-black">{getRoleLabel()}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-white rounded-md mt-2"
                >
                  {t('logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

