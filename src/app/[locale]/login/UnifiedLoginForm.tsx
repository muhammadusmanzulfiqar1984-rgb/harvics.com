'use client'

import React, { useState, useRef } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

export default function UnifiedLoginForm() {
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('common')
  const tForm = useTranslations('form')
  const tContact = useTranslations('contact')
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Read directly from DOM as fallback in case React state was reset by hydration
      const usernameInput = (document.querySelector('input[name="username"]') as HTMLInputElement)?.value
      const passwordInput = (document.querySelector('input[name="password"]') as HTMLInputElement)?.value
      const username = usernameRef.current?.value || formData.username || usernameInput || ''
      const password = passwordRef.current?.value || formData.password || passwordInput || ''

      // Check demo credentials FIRST — before any backend call
      const demoCredentials: Record<string, string> = {
        'admin': 'admin',
        'distributor_user': 'password',
        'supplier_user': 'password',
        'hq_user': 'password',
        'sales_officer_user': 'password',
        'country_manager_user': 'password',
      }

      if (demoCredentials[username] === password) {
        const mockRole =
          username.includes('supplier') ? 'supplier' :
          username.includes('distributor') ? 'distributor' :
          username.includes('sales') ? 'distributor' :
          username === 'hq_user' || username.includes('manager') ? 'hq' : 'company_admin'

        const mockToken = `demo-token-${mockRole}`
        const mockUser = {
          username,
          role: mockRole,
          scope: {
            userId: username,
            role: mockRole,
            geographic: { global: true, countries: [], territories: [] }
          }
        }

        localStorage.setItem('auth_token', mockToken)
        localStorage.setItem('user_data', JSON.stringify(mockUser))
        localStorage.setItem('user_scope', JSON.stringify(mockUser.scope))
        routeByRole(mockRole)
        return
      }

      const { apiClient } = await import('@/lib/api')
      const response = await apiClient.login(username, password)

      if (response.error) {
        setError(response.error || 'Invalid username or password')
      } else if (response.data) {
        // Store token and user data
        const userData = response.data.user
        const token = response.data.token
        
        if (typeof window !== 'undefined' && token) {
          localStorage.setItem('auth_token', token)
          if (userData) {
            localStorage.setItem('user_data', JSON.stringify(userData))
            // Store scope if available, or create one from role
            if (userData.scope) {
              localStorage.setItem('user_scope', JSON.stringify(userData.scope))
            } else if (userData.role) {
              // Create scope from role if scope doesn't exist
              const { role, ...restUserData } = userData
              const scope = {
                role: role,
                userId: userData.username,
                ...restUserData
              }
              localStorage.setItem('user_scope', JSON.stringify(scope))
            }
          }
          // Set cookie so server-side RBAC middleware can read the role
          const roleForCookie = userData?.scope?.role || userData?.role || 'company'
          document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`
          document.cookie = `x_role=${roleForCookie}; path=/; max-age=86400; SameSite=Lax`
        }
        
        // Extract role from multiple possible locations
        // Backend returns: user.role (direct) and user.scope.role (in scope)
        const role = userData?.scope?.role || userData?.role || null
        
        if (role) {
          routeByRole(role)
        } else {
          // Fallback: Try to determine role from username or other fields
          const username = userData?.username || formData.username
          let fallbackRole = null
          
          if (username?.includes('supplier')) {
            fallbackRole = 'supplier'
          } else if (username?.includes('distributor') || username?.includes('sales')) {
            fallbackRole = 'distributor'
          } else if (username === 'hq_user' || username?.includes('admin') || username === 'company') {
            fallbackRole = 'hq'
          } else if (username?.includes('manager')) {
            fallbackRole = 'country_manager'
          }
          
          if (fallbackRole) {
            console.warn('[Login] Using fallback role based on username:', fallbackRole)
            routeByRole(fallbackRole)
          } else {
            console.error('[Login] Role extraction failed. User object:', JSON.stringify(userData, null, 2))
            setError('User role not found. Please contact support.')
          }
        }
      } else {
        // No error, but no data either - unexpected response
        console.error('[Login] Unexpected response format:', response)
        setError('Unexpected response from server. Please try again.')
      }
    } catch (err) {
      console.error('Unified login failed', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setError('Cannot connect to server. Please ensure the backend is running on http://localhost:4000')
      } else {
        setError(`Connection error: ${errorMessage}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const routeByRole = (role?: string) => {
    const roleLower = role?.toLowerCase() || ''
    
    // Use replace() so login page is removed from browser history
    // — pressing Back will never return to login
    switch (roleLower) {
      case 'supplier':
        router.replace(`/${locale}/portal/supplier`)
        break
      case 'distributor':
      case 'sales_officer':
        router.replace(`/${locale}/portal/distributor`)
        break
      case 'country_manager':
      case 'hq':
      case 'admin':
      case 'company_admin':
      case 'super_admin':
      case 'company':
        router.replace(`/${locale}/dashboard/company`)
        break
      case 'investor':
        router.replace(`/${locale}/investor-relations`)
        break
      case 'employee':
        router.replace(`/${locale}/os/hr`)
        break
      default:
        router.replace(`/${locale}/portals`)
        break
    }
  }

  return (
    <div 
      className="shadow-xl p-6 sm:p-8"
      style={{
        background: 'white',
        border: '1px solid rgba(195,163,94,0.3)',
        borderRadius: '12px'
      }}
    >
      <form onSubmit={handleSubmit} method="post" className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            {tForm('username')} *
          </label>
          <input
            ref={usernameRef}
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-[#6B1F2B] focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-400 transition-all duration-300"
            placeholder="Enter your username"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            {tForm('password')} *
          </label>
          <input
            ref={passwordRef}
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-[#6B1F2B] focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-400 transition-all duration-300"
            placeholder="Enter password"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-[#6B1F2B] bg-white border-gray-300 rounded focus:ring-[#6B1F2B]"
            />
            <span className="ml-2 text-sm text-gray-600">{tForm('rememberMe') || 'Remember me'}</span>
          </label>
          <a href="#" className="text-sm text-[#6B1F2B] hover:text-[#50000b] transition-colors duration-300">
            {tForm('forgotPassword') || 'Forgot password?'}
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#6B1F2B] hover:bg-[#50000b] text-white font-bold py-3 px-4 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Logging in...</span>
            </>
          ) : (
            <span>{tForm('submit')}</span>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="#" className="text-[#6B1F2B] hover:text-[#50000b] font-medium transition-colors duration-300">
            {tContact('title')}
          </a>
        </p>
      </div>

      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
        <p className="text-xs font-semibold text-amber-800 mb-2">Demo Credentials (password: <code className="bg-amber-100 px-1 rounded">password</code> / <code className="bg-amber-100 px-1 rounded">admin</code>):</p>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="bg-white border border-amber-100 rounded p-1">
            <span className="font-medium text-[#6B1F2B]">admin</span> <span className="text-gray-400">/ admin</span>
            <div className="text-gray-400 text-[10px]">Company HQ</div>
          </div>
          <div className="bg-white border border-amber-100 rounded p-1">
            <span className="font-medium text-[#6B1F2B]">supplier_user</span> <span className="text-gray-400">/ password</span>
            <div className="text-gray-400 text-[10px]">Supplier Portal</div>
          </div>
          <div className="bg-white border border-amber-100 rounded p-1">
            <span className="font-medium text-[#6B1F2B]">distributor_user</span> <span className="text-gray-400">/ password</span>
            <div className="text-gray-400 text-[10px]">Distributor Portal</div>
          </div>
          <div className="bg-white border border-amber-100 rounded p-1">
            <span className="font-medium text-[#6B1F2B]">hq_user</span> <span className="text-gray-400">/ password</span>
            <div className="text-gray-400 text-[10px]">HQ Dashboard</div>
          </div>
        </div>
      </div>
    </div>
  )
}
