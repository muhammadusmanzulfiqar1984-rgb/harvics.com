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
  // In a real implementation, this would:
  // 1. Check session/token
  // 2. Validate user
  // 3. Return user object with role
  
  // For now, return null (will be handled by auth middleware)
  const role = request.headers.get('x-role') as Role | null
  const userId = request.headers.get('x-user-id')
  
  if (role) {
    return { role, userId: userId || undefined }
  }
  
  return null
}

// Check if route requires authentication
function requiresAuth(pathname: string): boolean {
  // Public routes that don't require auth
  const publicRoutes = [
    '/',
    '/login',
    '/about',
    '/contact',
    '/products',
    '/api/health'
  ]
  
  // Check if pathname starts with any public route
  return !publicRoutes.some(route => pathname.startsWith(route))
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
    // Extract locale from pathname if present
    const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/)
    const locale = localeMatch ? localeMatch[1] : 'en'
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Check portal access
  const portal = isPortalRoute(pathname)
  if (portal && !canAccessPortal(user.role, portal)) {
    // Extract locale from pathname if present
    const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/)
    const locale = localeMatch ? localeMatch[1] : 'en'
    const forbiddenUrl = new URL(`/${locale}/403`, request.url)
    return NextResponse.redirect(forbiddenUrl)
  }
  
  // Check module permissions
  const requiredPermission = getRequiredPermission(pathname)
  if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
    // Extract locale from pathname if present
    const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/)
    const locale = localeMatch ? localeMatch[1] : 'en'
    const forbiddenUrl = new URL(`/${locale}/403`, request.url)
    return NextResponse.redirect(forbiddenUrl)
  }
  
  // Allow access - continue to next middleware
  return undefined
}

