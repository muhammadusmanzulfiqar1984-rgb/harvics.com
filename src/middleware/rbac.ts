/**
 * RBAC Middleware for Route Protection
 * 
 * This middleware restricts routes based on user roles.
 * It ensures that users can only access modules and portals
 * permitted for their role.
 */

import { NextRequest, NextResponse } from 'next/server'
import { hasPermission, canAccessPortal, type Role } from '@/types/rbac'

interface AuthUser {
  role: Role
  userId?: string
}

// Extract user from request (this would come from your auth system)
function getUserFromRequest(request: NextRequest): AuthUser | null {
  // Check header first
  const roleFromHeader = request.headers.get('x-role') as Role | null
  const userId = request.headers.get('x-user-id')
  if (roleFromHeader) {
    return { role: roleFromHeader, userId: userId || undefined }
  }
  
  // Check cookie (set by login form)
  const roleCookie = request.cookies.get('x_role')?.value as Role | null
  const authToken = request.cookies.get('auth_token')?.value
  if (roleCookie && authToken) {
    return { role: roleCookie, userId: undefined }
  }

  return null
}

// Routes that require an authenticated session.
// Public surface (homepage, marketing, login, static) stays open.
const PROTECTED_PREFIXES = ['/admin', '/portal', '/os', '/dashboard', '/distributor-portal']

function requiresAuth(pathname: string): boolean {
  // Strip locale prefix like /en, /ar, /fr/, etc.
  const stripped = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/')
  return PROTECTED_PREFIXES.some(p => stripped === p || stripped.startsWith(`${p}/`))
}

// Check if route is a portal route
function isPortalRoute(pathname: string): 'distributor' | 'supplier' | 'staff' | 'admin' | null {
  if (pathname.includes('/portal/distributor') || pathname.includes('/distributor-portal')) {
    return 'distributor'
  }
  if (pathname.includes('/portal/supplier')) {
    return 'supplier'
  }
  if (pathname.includes('/portal/staff') || pathname.includes('/dashboard')) {
    return 'staff'
  }
  if (pathname.includes('/portal/admin') || pathname.includes('/os/')) {
    return 'admin'
  }
  return null
}

// Check if route requires specific permission
function getRequiredPermission(pathname: string): string | null {
  // Map routes to required permissions
  const routePermissions: Record<string, string> = {
    '/orders': 'orders:view',
    '/inventory': 'inventory:view',
    '/logistics': 'logistics:view',
    '/finance': 'finance:view',
    '/crm': 'crm:view',
    '/hr': 'hr:view',
    '/dashboard/executive': 'dashboard:executive'
  }
  
  for (const [route, permission] of Object.entries(routePermissions)) {
    if (pathname.includes(route)) {
      return permission
    }
  }
  
  return null
}

export function rbacMiddleware(request: NextRequest): NextResponse | undefined {
  const pathname = request.nextUrl.pathname

  // Skip public routes
  if (!requiresAuth(pathname)) {
    return undefined // Allow access - continue to next middleware
  }

  // Get user from request
  const user = getUserFromRequest(request)

  // If no user and route requires auth, redirect to login
  if (!user) {
    const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/)
    const locale = localeMatch ? localeMatch[1] : 'en'
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set('redirect', pathname)
    const response = NextResponse.redirect(loginUrl)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return response
  }

  // Authenticated — allow access, client-side handles role-based UI
  return undefined
}

