'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { UserRole } from '@/types/userScope'
import { apiClient } from '@/lib/api'

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter()
  const locale = useLocale()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window === 'undefined') {
        setIsChecking(false)
        return
      }

      const token = localStorage.getItem('auth_token')

      if (!token) {
        console.log('AuthGuard: No token found, redirecting to portals')
        router.push(`/${locale}/login`)
        return
      }

      // Helper function to extract role from localStorage
      const getRoleFromStorage = (): UserRole | null => {
        try {
          // Try user_scope first
          const userScopeStr = localStorage.getItem('user_scope')
          if (userScopeStr) {
            const userScope = JSON.parse(userScopeStr)
            if (userScope?.role) {
              return userScope.role as UserRole
            }
          }
          
          // Try user_data as fallback
          const userDataStr = localStorage.getItem('user_data')
          if (userDataStr) {
            const userData = JSON.parse(userDataStr)
            if (userData?.scope?.role) {
              return userData.scope.role as UserRole
            }
            if (userData?.role) {
              return userData.role as UserRole
            }
          }
        } catch (e) {
          console.error('Error parsing user data from localStorage:', e)
        }
        return null
      }

      // Check localStorage first (fast, works offline)
      const storedRole = getRoleFromStorage()
      if (storedRole) {
        // Check if role is allowed
        if (allowedRoles && !allowedRoles.includes(storedRole)) {
          console.log(`AuthGuard: Role ${storedRole} not in allowed roles`, allowedRoles)
          // Clear invalid auth data
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_scope')
          localStorage.removeItem('user_data')
          router.push(`/${locale}/login`)
          return
        }
        
        // Skip API verification for demo tokens — backend may not be running
        if (token.startsWith('demo-token-')) {
          setIsAuthenticated(true)
          setIsChecking(false)
          return
        }

        // Verify token is still valid before allowing access
        try {
          const verifyResponse = await apiClient.verifyToken()
          if (verifyResponse.error || !verifyResponse.data?.valid) {
            // Token invalid — but if backend is down (any error), trust localStorage role
            if (verifyResponse.error) {
              setIsAuthenticated(true)
              setIsChecking(false)
              return
            }
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user_scope')
            localStorage.removeItem('user_data')
            router.push(`/${locale}/login`)
            return
          }
          
          // Token is valid, allow access
          setIsAuthenticated(true)
          setIsChecking(false)
          return
        } catch (error) {
          // Backend not running — trust the localStorage role rather than kicking user out
          console.warn('AuthGuard: Backend unreachable, trusting localStorage role:', storedRole)
          setIsAuthenticated(true)
          setIsChecking(false)
          return
        }
      }

      // No localStorage role — but if it's a demo token, extract role from the token name
      if (token.startsWith('demo-token-')) {
        const demoRole = token.replace('demo-token-', '') as UserRole
        if (!allowedRoles || allowedRoles.length === 0 || allowedRoles.includes(demoRole)) {
          setIsAuthenticated(true)
          setIsChecking(false)
          return
        }
        // demo token role not allowed — redirect
        router.push(`/${locale}/login`)
        return
      }

      // If no localStorage data, try API verification
      try {
        const response = await apiClient.verifyToken()
        
        if (response.error) {
          console.error('AuthGuard: Token verification error:', response.error)
          router.push(`/${locale}/login`)
          return
        }

        if (!response.data?.valid) {
          console.log('AuthGuard: Token invalid, redirecting to portals')
          router.push(`/${locale}/login`)
          return
        }

        const role = response.data.user?.role || response.data.user?.scope?.role
        if (!role) {
          console.log('AuthGuard: No role found in response, redirecting to portals')
          router.push(`/${locale}/login`)
          return
        }

        if (allowedRoles && !allowedRoles.includes(role as UserRole)) {
          console.log(`AuthGuard: Role ${role} not in allowed roles`, allowedRoles)
          router.push(`/${locale}/login`)
          return
        }

        setIsAuthenticated(true)
      } catch (error) {
        console.error('AuthGuard: Exception during token verification:', error)
        router.push(`/${locale}/login`)
        return
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [router, locale, allowedRoles])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#440000] to-[#660000] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F5C542] mx-auto mb-4"></div>
          <p className="text-[#F5C542] text-lg">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Return null to allow redirect to happen
    return null
  }

  return <>{children}</>
}

