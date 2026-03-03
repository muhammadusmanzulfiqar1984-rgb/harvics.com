'use client'

/**
 * FoundationProviders - Client-side wrapper for LocaleProvider and GeoProvider
 * 
 * This component:
 * 1. Fetches user session data
 * 2. Extracts locale preference from user profile
 * 3. Extracts user scope for geo provider
 * 4. Wraps children with LocaleProvider and GeoProvider
 */

import React, { useEffect, useState } from 'react'
import { LocaleProvider } from '@/contexts/LocaleProvider'
import { GeoProvider } from '@/contexts/GeoProvider'
import type { UserScope } from '@/types/userScope'
import type { SupportedLocale } from '@/contexts/LocaleProvider'
import { apiClient } from '@/lib/api'

interface FoundationProvidersProps {
  children: React.ReactNode
  initialLocale?: string
}

function InnerProviders({ children, userScope, userLocale, initialLocale }: { 
  children: React.ReactNode
  userScope: UserScope | null
  userLocale?: string
  initialLocale?: string
}) {
  return (
    <LocaleProvider 
      userProfileLocale={userLocale as SupportedLocale | undefined} 
      userId={userScope?.userId}
      initialLocale={initialLocale}
    >
      <GeoProvider userScope={userScope || undefined}>
        {children}
      </GeoProvider>
    </LocaleProvider>
  )
}

export function FoundationProviders({ children, initialLocale }: FoundationProvidersProps) {
  const [userScope, setUserScope] = useState<UserScope | null>(null)
  const [userLocale, setUserLocale] = useState<string | undefined>(initialLocale)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Fetch user session/scope from API
        const response = await apiClient.verifyToken()
        
        if (response.data?.valid && response.data.user?.scope) {
          const scope = response.data.user.scope as UserScope
          setUserScope(scope)
          
          // Extract locale preference from user profile if available
          // For now, we'll use the initial locale or session storage
          const sessionLocale = typeof window !== 'undefined' 
            ? sessionStorage.getItem('harvics_locale')
            : null
          
          setUserLocale(sessionLocale || initialLocale)
        } else {
          // No authenticated user, use defaults
          setUserScope(null)
          setUserLocale(initialLocale)
        }
      } catch (error) {
        console.error('Failed to load user data:', error)
        // Continue with defaults
        setUserScope(null)
        setUserLocale(initialLocale)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [initialLocale])

  // Show loading state if needed (or just render with defaults)
  if (loading) {
    // Render with defaults while loading
    return (
      <InnerProviders userScope={null} userLocale={initialLocale} initialLocale={initialLocale}>
        {children}
      </InnerProviders>
    )
  }

  return (
    <InnerProviders userScope={userScope} userLocale={userLocale} initialLocale={initialLocale}>
      {children}
    </InnerProviders>
  )
}

