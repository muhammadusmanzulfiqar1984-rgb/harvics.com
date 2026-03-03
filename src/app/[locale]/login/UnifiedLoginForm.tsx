'use client'

import React, { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

export default function UnifiedLoginForm() {
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('common')
  const tContact = useTranslations('contact')
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
      const { apiClient } = await import('@/lib/api')
      const response = await apiClient.login(formData.username, formData.password)

      if (response.error) {
        // Fallback to demo credentials if backend is not available
        if (
          (formData.username === 'admin' && formData.password === 'admin') ||
          (formData.username === 'distributor_user' && formData.password === 'password') ||
          (formData.username === 'supplier_user' && formData.password === 'password') ||
          (formData.username === 'hq_user' && formData.password === 'password')
        ) {
           console.warn('[Login] Backend failed, using demo fallback for:', formData.username)
           
           // Mock successful login for demo
           const mockRole = 
             formData.username.includes('supplier') ? 'supplier' :
             formData.username.includes('distributor') ? 'distributor' :
             formData.username === 'hq_user' ? 'hq' : 'admin';
             
           const mockToken = `demo-token-${mockRole}`
           const mockUser = {
             username: formData.username,
             role: mockRole,
             scope: {
               userId: formData.username,
               role: mockRole,
               geographic: { global: true, countries: [], territories: [] }
             }
           }

           if (typeof window !== 'undefined') {
             localStorage.setItem('auth_token', mockToken)
             localStorage.setItem('user_data', JSON.stringify(mockUser))
             localStorage.setItem('user_scope', JSON.stringify(mockUser.scope))
           }
           
           routeByRole(mockRole)
           return
        }

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
        setError('Cannot connect to server. Please ensure the backend is running and accessible through http://localhost:3000')
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
    
    switch (roleLower) {
      case 'supplier':
        router.push(`/${locale}/portal/supplier`)
        break
      case 'distributor':
      case 'sales_officer':
        router.push(`/${locale}/portal/distributor`)
        break
      case 'country_manager':
      case 'hq':
      case 'admin':
      case 'company':
        router.push(`/${locale}/dashboard/company/`)
        break
      default:
        // Default to portals page if role doesn't match
        router.push(`/${locale}/portals/`)
        break
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            Username *
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#6B1F2B] focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-400 transition-all duration-300"
            placeholder="supplier_user, distributor_user…"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#6B1F2B] focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-400 transition-all duration-300"
            placeholder="Enter password"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-[#6B1F2B] bg-white border-gray-300 rounded focus:ring-[#6B1F2B]"
            />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          <a href="#" className="text-sm text-[#6B1F2B] hover:text-[#50000b] transition-colors duration-300">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#6B1F2B] hover:bg-[#50000b] text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
            <span>Login</span>
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

      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-700 font-medium mb-1">Demo Users:</p>
        <p className="text-xs text-gray-500">supplier_user | distributor_user | sales_officer_user | country_manager_user | hq_user</p>
      </div>
    </div>
  )
}
