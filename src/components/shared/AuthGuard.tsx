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
        router.push(`/${locale}/portals/`)
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
          router.push(`/${locale}/portals/`)
          return
        }
        
        // Verify token is still valid before allowing access
        try {
          const verifyResponse = await apiClient.verifyToken()
          if (verifyResponse.error || !verifyResponse.data?.valid) {
            // Token invalid, clear and redirect
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user_scope')
            localStorage.removeItem('user_data')
            router.push(`/${locale}/portals/`)
            return
          }
          
          // Token is valid, allow access
          setIsAuthenticated(true)
          setIsChecking(false)
          return
        } catch (error) {
          console.error('AuthGuard: Token verification error:', error)
          // On error, clear auth and redirect
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_scope')
          localStorage.removeItem('user_data')
          router.push(`/${locale}/portals/`)
          return
        }
      }

      // If no localStorage data, try API verification
      try {
        const response = await apiClient.verifyToken()
        
        if (response.error) {
          console.error('AuthGuard: Token verification error:', response.error)
          router.push(`/${locale}/portals/`)
          return
        }

        if (!response.data?.valid) {
          console.log('AuthGuard: Token invalid, redirecting to portals')
          router.push(`/${locale}/portals/`)
          return
        }

        const role = response.data.user?.role || response.data.user?.scope?.role
        if (!role) {
          console.log('AuthGuard: No role found in response, redirecting to portals')
          router.push(`/${locale}/portals/`)
          return
        }

        if (allowedRoles && !allowedRoles.includes(role as UserRole)) {
          console.log(`AuthGuard: Role ${role} not in allowed roles`, allowedRoles)
          router.push(`/${locale}/portals/`)
          return
        }

        setIsAuthenticated(true)
      } catch (error) {
        console.error('AuthGuard: Exception during token verification:', error)
        router.push(`/${locale}/portals/`)
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

