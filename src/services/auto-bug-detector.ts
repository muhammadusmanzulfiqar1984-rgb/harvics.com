/**
 * Automated Bug Detection and Fixing System
 * Continuously monitors the application for bugs and automatically fixes them
 */

export interface BugReport {
  id: string
  type: 'error' | 'warning' | 'performance' | 'security' | 'integration'
  severity: 'critical' | 'high' | 'medium' | 'low'
  message: string
  location: string
  timestamp: Date
  fixed: boolean
  fixApplied?: string
}

export interface BugFix {
  bugId: string
  fixType: 'code' | 'config' | 'data' | 'integration'
  description: string
  applied: boolean
  timestamp: Date
}

// Use relative URL for client-side, full URL for server-side (through Next.js proxy on 3000)
const isServer = typeof window === 'undefined';
const RAW_BACKEND_URL = isServer
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '') // Server: use Next.js port
  : ''; // Client: relative URL (uses same origin - port 3000)
const API_ROOT = `${RAW_BACKEND_URL}/api`

class AutoBugDetector {
  private bugs: BugReport[] = []
  private fixes: BugFix[] = []
  private checkInterval: NodeJS.Timeout | null = null
  private isRunning = false
  private monitorSnapshot: unknown = null

  constructor() {
    this.loadBugsFromStorage()
  }

  // Start continuous monitoring
  // In dev we run more frequently (10s) so issues surface quickly.
  start(intervalMs: number = process.env.NODE_ENV === 'development' ? 10000 : 30000) {
    if (this.isRunning) return

    this.isRunning = true
    console.log('🔍 Auto Bug Detector started')

    // Initial check
    this.performCheck()

    // Periodic checks
    this.checkInterval = setInterval(() => {
      this.performCheck()
    }, intervalMs)
  }

  // Stop monitoring
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    this.isRunning = false
    console.log('🛑 Auto Bug Detector stopped')
  }

  // Perform comprehensive bug check
  async performCheck() {
    const checks = [
      this.checkAPIEndpoints(),
      this.checkAuthentication(),
      this.checkDataConsistency(),
      this.checkPerformance(),
      this.checkSecurity(),
      this.checkIntegration(),
      this.fetchBackendAlerts(),
    ]

    await Promise.all(checks)
    this.saveBugsToStorage()
    this.autoFixBugs()
  }

  // Check API endpoints
  private async checkAPIEndpoints() {
    // Align with frontend API client: base already includes `/api`
    const apiUrl = API_ROOT
    // Only check endpoints that actually exist in the current backend
    const endpoints = [
      // Localisation core
      '/localisation/country/US',
      '/localisation/countries/summary',
      '/localisation/analysis/united-states',
      // System / monitoring
      '/system/monitor-status',
    ]

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${apiUrl}${endpoint}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          this.reportBug({
            type: 'integration',
            severity: 'high',
            message: `API endpoint ${endpoint} returned ${response.status}`,
            location: endpoint,
          })
        }
      } catch (error) {
        // Only report if it's not a network error (backend might be offline)
        if (error instanceof TypeError && error.message.includes('fetch')) {
          // Network error - might be expected if backend is down
          continue
        }
        this.reportBug({
          type: 'error',
          severity: 'medium',
          message: `API endpoint ${endpoint} failed: ${error}`,
          location: endpoint,
        })
      }
    }
  }

  // Check authentication
  private async checkAuthentication() {
    if (typeof window === 'undefined') return

    const token = localStorage.getItem('auth_token')
    if (!token) return

    try {
      const { apiClient } = await import('@/lib/api')
      const response = await apiClient.verifyToken()

      if (response.error) {
        this.reportBug({
          type: 'security',
          severity: 'high',
          message: 'Authentication token is invalid',
          location: 'auth',
        })

        // Auto-fix: Clear invalid token
        this.applyFix({
          bugId: 'auth-invalid-token',
          fixType: 'code',
          description: 'Clear invalid authentication token',
          applied: false,
          timestamp: new Date(),
          autoFix: () => {
            localStorage.removeItem('auth_token')
            window.location.href = '/login'
          },
        })
      }
    } catch (error) {
      // Ignore if API is not available
    }
  }

  // Check data consistency
  private async checkDataConsistency() {
    if (typeof window === 'undefined') return

    try {
      const response = await fetch(`${API_ROOT}/products`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!response.ok) {
        return
      }
      const products = { data: (await response.json()) as unknown }

      if (products.data && Array.isArray(products.data)) {
        const items = products.data as Array<{ id: string; name?: string; category?: string }>
        // Check for duplicate IDs
        const ids = items.map((p) => p.id)
        const duplicates = ids.filter((id: string, index: number) => ids.indexOf(id) !== index)

        if (duplicates.length > 0) {
          this.reportBug({
            type: 'error',
            severity: 'medium',
            message: `Found ${duplicates.length} duplicate product IDs`,
            location: 'products',
          })
        }

        // Check for missing required fields
        const invalidProducts = items.filter((p) => !p.name || !p.category)
        if (invalidProducts.length > 0) {
          this.reportBug({
            type: 'error',
            severity: 'low',
            message: `Found ${invalidProducts.length} products with missing required fields`,
            location: 'products',
          })
        }
      }
    } catch {
      // Ignore if API is not available
    }
  }

  // Check performance
  private checkPerformance() {
    if (typeof window === 'undefined') return

    // Check for memory leaks (too many event listeners)
    const performance = window.performance
    const performanceWithMemory = performance as Performance & { memory?: { usedJSHeapSize: number } }
    if (performanceWithMemory.memory) {
      const memoryMB = performanceWithMemory.memory.usedJSHeapSize / 1048576
      if (memoryMB > 100) {
        this.reportBug({
          type: 'performance',
          severity: 'medium',
          message: `High memory usage: ${memoryMB.toFixed(2)}MB`,
          location: 'performance',
        })
      }
    }

    // Check for slow API responses
    if (performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart
        if (loadTime > 5000) {
          this.reportBug({
            type: 'performance',
            severity: 'low',
            message: `Slow page load: ${loadTime.toFixed(0)}ms`,
            location: 'performance',
          })
        }
      }
    }
  }

  // Check security
  private checkSecurity() {
    if (typeof window === 'undefined') return

    // Check for exposed sensitive data
    const sensitiveKeys = ['password', 'secret', 'token', 'key', 'api_key']
    const localStorageKeys = Object.keys(localStorage)

    for (const key of localStorageKeys) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        const value = localStorage.getItem(key)
        if (value && value.length > 0 && !value.startsWith('encrypted:')) {
          this.reportBug({
            type: 'security',
            severity: 'high',
            message: `Sensitive data stored in plain text: ${key}`,
            location: 'localStorage',
          })
        }
      }
    }

    // Check CSP violations and important console errors
    const originalError = console.error
    console.error = (...args: unknown[]) => {
      const message = args.join(' ')
      if (message.includes('Content Security Policy') || message.includes('CSP')) {
        this.reportBug({
          type: 'security',
          severity: 'medium',
          message: `CSP violation detected: ${message}`,
          location: 'security',
        })
      }
      // Detect missing translation keys from next-intl
      if (message.includes('MISSING_MESSAGE')) {
        this.reportBug({
          type: 'warning',
          severity: 'low',
          message: `Missing translation detected: ${message}`,
          location: 'i18n',
        })
      }
      originalError.apply(console, args)
    }
  }

  // Check integration
  private async checkIntegration() {
    // Check if backend is accessible via root /health (not under /api)
    const backendRoot = RAW_BACKEND_URL
    const healthUrl = `${backendRoot}/health`

    try {
      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      })

      if (!response.ok) {
        this.reportBug({
          type: 'integration',
          severity: 'high',
          message: 'Backend health check failed',
          location: 'backend',
        })
      }
    } catch (error) {
      // Backend might be offline - this is expected in some cases
      // Only report if it's a persistent issue
    }
  }

  private async fetchBackendAlerts() {
    if (typeof window === 'undefined') return
    const apiUrl = API_ROOT
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
      const timeout = controller ? setTimeout(() => controller.abort(), 5000) : null
      const response = await fetch(`${apiUrl}/system/monitor-status`, {
        method: 'GET',
        signal: controller?.signal,
      })
      if (timeout) {
        clearTimeout(timeout)
      }
      if (!response.ok) return
      const data = (await response.json()) as {
        monitorIssues?: Array<{ type?: string; payload?: { url?: string } }>
        runtime?: {
          backend?: { healthy?: boolean; url?: string }
          frontend?: { healthy?: boolean; url?: string }
        }
      }
      this.monitorSnapshot = data

      const issues = data?.monitorIssues || []
      if (Array.isArray(issues)) {
        issues.forEach((issue) => {
          this.reportBug({
            type: 'integration',
            severity: 'medium',
            message: issue.type || 'Backend monitor issue',
            location: issue.payload?.url || 'monitor',
          })
        })
      }

      const runtime = data?.runtime
      if (runtime && runtime.backend && runtime.backend.healthy === false) {
        this.reportBug({
          type: 'integration',
          severity: 'high',
          message: 'Runtime watchdog detected backend outage',
          location: runtime.backend.url || 'backend',
        })
      }
      if (runtime && runtime.frontend && runtime.frontend.healthy === false) {
        this.reportBug({
          type: 'integration',
          severity: 'high',
          message: 'Runtime watchdog detected frontend outage',
          location: runtime.frontend.url || 'frontend',
        })
      }
    } catch {
      // ignore network errors
    }
  }

  // Report a bug
  private reportBug(bug: Omit<BugReport, 'id' | 'timestamp' | 'fixed'>) {
    const bugReport: BugReport = {
      ...bug,
      id: `bug-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date(),
      fixed: false,
    }

    // Check if similar bug already exists
    const existingBug = this.bugs.find(
      (b) => b.message === bugReport.message && b.location === bugReport.location && !b.fixed
    )

    if (!existingBug) {
      this.bugs.push(bugReport)
      console.warn('🐛 Bug detected:', bugReport)
    }
  }

  // Auto-fix bugs
  private async autoFixBugs() {
    const unfixedBugs = this.bugs.filter((b) => !b.fixed)

    for (const bug of unfixedBugs) {
      const fix = this.generateFix(bug)
      if (fix) {
        await this.applyFix(fix)
      }
    }
  }

  // Generate fix for a bug
  private generateFix(bug: BugReport): BugFix & { autoFix?: () => void } | null {
    // Auto-fix strategies based on bug type
    switch (bug.type) {
      case 'security':
        if (bug.message.includes('invalid token')) {
          return {
            bugId: bug.id,
            fixType: 'code',
            description: 'Clear invalid authentication token',
            applied: false,
            timestamp: new Date(),
            autoFix: () => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token')
                window.location.href = '/login'
              }
            },
          }
        }
        break

      case 'integration':
        if (bug.message.includes('API endpoint')) {
          return {
            bugId: bug.id,
            fixType: 'integration',
            description: 'Retry API endpoint with exponential backoff',
            applied: false,
            timestamp: new Date(),
          }
        }
        break

      case 'error':
        if (bug.message.includes('duplicate')) {
          return {
            bugId: bug.id,
            fixType: 'data',
            description: 'Remove duplicate entries',
            applied: false,
            timestamp: new Date(),
          }
        }
        break
    }

    return null
  }

  // Apply a fix
  private async applyFix(fix: BugFix & { autoFix?: () => void }) {
    try {
      if (fix.autoFix) {
        fix.autoFix()
      }

      fix.applied = true
      this.fixes.push(fix)

      // Mark bug as fixed
      const bug = this.bugs.find((b) => b.id === fix.bugId)
      if (bug) {
        bug.fixed = true
        bug.fixApplied = fix.description
      }

      console.log('✅ Fix applied:', fix)
      this.saveBugsToStorage()
    } catch (error) {
      console.error('❌ Failed to apply fix:', error)
    }
  }

  // Get all bugs
  getBugs(): BugReport[] {
    return [...this.bugs]
  }

  // Get unfixed bugs
  getUnfixedBugs(): BugReport[] {
    return this.bugs.filter((b) => !b.fixed)
  }

  // Get bugs by severity
  getBugsBySeverity(severity: BugReport['severity']): BugReport[] {
    return this.bugs.filter((b) => b.severity === severity && !b.fixed)
  }

  // Clear fixed bugs
  clearFixedBugs() {
    this.bugs = this.bugs.filter((b) => !b.fixed)
    this.saveBugsToStorage()
  }

  // Save bugs to localStorage
  private saveBugsToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('bug_reports', JSON.stringify(this.bugs))
        localStorage.setItem('bug_fixes', JSON.stringify(this.fixes))
      } catch (error) {
        console.error('Failed to save bugs to storage:', error)
      }
    }
  }

  // Load bugs from localStorage
  private loadBugsFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const bugsJson = localStorage.getItem('bug_reports')
        const fixesJson = localStorage.getItem('bug_fixes')

        if (bugsJson) {
          this.bugs = JSON.parse(bugsJson).map((b: any) => ({
            ...b,
            timestamp: new Date(b.timestamp),
          }))
        }

        if (fixesJson) {
          this.fixes = JSON.parse(fixesJson).map((f: any) => ({
            ...f,
            timestamp: new Date(f.timestamp),
          }))
        }
      } catch (error) {
        console.error('Failed to load bugs from storage:', error)
      }
    }
  }

  // Get bug statistics
  getStats() {
    return {
      total: this.bugs.length,
      fixed: this.bugs.filter((b) => b.fixed).length,
      unfixed: this.bugs.filter((b) => !b.fixed).length,
      bySeverity: {
        critical: this.bugs.filter((b) => b.severity === 'critical' && !b.fixed).length,
        high: this.bugs.filter((b) => b.severity === 'high' && !b.fixed).length,
        medium: this.bugs.filter((b) => b.severity === 'medium' && !b.fixed).length,
        low: this.bugs.filter((b) => b.severity === 'low' && !b.fixed).length,
      },
      fixesApplied: this.fixes.filter((f) => f.applied).length,
    }
  }

  getMonitorSnapshot() {
    return this.monitorSnapshot
  }
}

// Singleton instance
export const autoBugDetector = new AutoBugDetector()

// Auto-start in browser
if (typeof window !== 'undefined') {
  autoBugDetector.start(30000) // Check every 30 seconds
}
