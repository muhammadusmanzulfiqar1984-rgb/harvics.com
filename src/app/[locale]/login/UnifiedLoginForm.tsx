'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

export default function UnifiedLoginForm() {
  const locale = useLocale()
  const router = useRouter()
  const tForm = useTranslations('form')
  const tContact = useTranslations('contact')
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const usernameInput = (document.querySelector('input[name="username"]') as HTMLInputElement)?.value
      const passwordInput = (document.querySelector('input[name="password"]') as HTMLInputElement)?.value
      const username = usernameRef.current?.value || formData.username || usernameInput || ''
      const password = passwordRef.current?.value || formData.password || passwordInput || ''

      const demoCredentials: Record<string, string> = {
        admin: 'admin',
        distributor_user: 'password',
        supplier_user: 'password',
        hq_user: 'password',
        sales_officer_user: 'password',
        country_manager_user: 'password',
      }

      if (demoCredentials[username] === password) {
        const mockRole = username.includes('supplier')
          ? 'supplier'
          : username.includes('distributor')
            ? 'distributor'
            : username.includes('sales')
              ? 'distributor'
              : username === 'hq_user' || username.includes('manager')
                ? 'hq'
                : 'company_admin'

        const mockToken = `demo-token-${mockRole}`
        const mockUser = {
          username,
          role: mockRole,
          scope: {
            userId: username,
            role: mockRole,
            geographic: { global: true, countries: [], territories: [] },
          },
        }

        localStorage.setItem('auth_token', mockToken)
        localStorage.setItem('user_data', JSON.stringify(mockUser))
        localStorage.setItem('user_scope', JSON.stringify(mockUser.scope))
        document.cookie = `auth_token=${mockToken}; path=/; max-age=86400; SameSite=Lax`
        document.cookie = `x_role=${mockRole}; path=/; max-age=86400; SameSite=Lax`
        routeByRole(mockRole)
        return
      }

      const { apiClient } = await import('@/lib/api')
      const response = await apiClient.login(username, password)

      if (response.error) {
        setError(response.error || 'Invalid username or password')
      } else if (response.data) {
        const userData = response.data.user
        const token = response.data.token

        if (typeof window !== 'undefined' && token) {
          localStorage.setItem('auth_token', token)
          if (userData) {
            localStorage.setItem('user_data', JSON.stringify(userData))
            if (userData.scope) {
              localStorage.setItem('user_scope', JSON.stringify(userData.scope))
            } else if (userData.role) {
              const { role, ...restUserData } = userData
              const scope = {
                role: role,
                userId: userData.username,
                ...restUserData,
              }
              localStorage.setItem('user_scope', JSON.stringify(scope))
            }
          }
          const roleForCookie = userData?.scope?.role || userData?.role || 'company'
          document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`
          document.cookie = `x_role=${roleForCookie}; path=/; max-age=86400; SameSite=Lax`
        }

        const role = userData?.scope?.role || userData?.role || null

        if (role) {
          routeByRole(role)
        } else {
          const uname = userData?.username || formData.username
          let fallbackRole = null

          if (uname?.includes('supplier')) {
            fallbackRole = 'supplier'
          } else if (uname?.includes('distributor') || uname?.includes('sales')) {
            fallbackRole = 'distributor'
          } else if (uname === 'hq_user' || uname?.includes('admin') || uname === 'company') {
            fallbackRole = 'hq'
          } else if (uname?.includes('manager')) {
            fallbackRole = 'country_manager'
          }

          if (fallbackRole) {
            routeByRole(fallbackRole)
          } else {
            setError('User role not found. Please contact support.')
          }
        }
      } else {
        setError('Unexpected response from server. Please try again.')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setError('Cannot connect to server. Please ensure the backend is running.')
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
      [e.target.name]: e.target.value,
    })
  }

  const routeByRole = (role?: string) => {
    const roleLower = role?.toLowerCase() || ''

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

  const inputClass =
    'w-full px-4 py-3.5 bg-harvics-cream border border-harvics-gold/30 text-harvics-burgundy text-sm placeholder:text-harvics-muted/60 focus:outline-none focus:border-harvics-gold focus:ring-1 focus:ring-harvics-gold/40 transition-all duration-300 ease-vault'

  return (
    <div className="bg-white border border-harvics-gold/25 p-7 sm:p-9 shadow-[0_24px_64px_rgba(26,5,5,0.08)]">
      <form onSubmit={handleSubmit} method="post" className="space-y-5">
        {error && (
          <div className="px-4 py-3 border border-red-300/50 bg-red-50/80">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="username" className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-harvics-burgundy mb-2">
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
            autoComplete="username"
            className={inputClass}
            placeholder="Your username"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-harvics-burgundy mb-2">
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
            autoComplete="current-password"
            className={inputClass}
            placeholder="Your password"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-harvics-maroon border-harvics-gold/40"
            />
            <span className="text-xs text-harvics-muted">{tForm('rememberMe') || 'Remember me'}</span>
          </label>
          <Link
            href={`/${locale}/contact`}
            className="text-xs text-harvics-maroon hover:text-harvics-gold transition-colors duration-300 ease-vault font-medium"
          >
            {tForm('forgotPassword') || 'Forgot password?'}
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 bg-harvics-burgundy hover:bg-harvics-maroon text-harvics-gold font-bold py-3.5 px-4 text-xs uppercase tracking-[0.18em] transition-all duration-300 ease-vault disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-harvics-gold/20 hover:border-harvics-gold/50"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Signing in…</span>
            </>
          ) : (
            <span>{tForm('submit')}</span>
          )}
        </button>
      </form>

      <p className="mt-7 pt-6 border-t border-harvics-gold/15 text-center text-xs text-harvics-muted">
        Don&apos;t have an account?{' '}
        <Link
          href={`/${locale}/contact`}
          className="text-harvics-maroon font-semibold hover:text-harvics-gold transition-colors duration-300 ease-vault"
        >
          {tContact('title')}
        </Link>
      </p>
    </div>
  )
}
