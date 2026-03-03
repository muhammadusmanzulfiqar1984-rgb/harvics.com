'use client'

import { useEffect } from 'react'
import { initFrontendWatchdog } from '@/services/frontendWatchdog'
import { initFrontendRecoveryMode } from '@/services/frontendRecoveryMode'

export default function FrontendWatchdogClient() {
  useEffect(() => {
    // Initialize frontend watchdog on client side
    const watchdog = initFrontendWatchdog({
      checkInterval: 30000, // 30 seconds
      healthEndpoint: '/api/health',
      alertThreshold: 3,
      enabled: true,
      frontendLeadEmail: process.env.NEXT_PUBLIC_FRONTEND_LEAD_EMAIL || 'frontend-lead@harvics.com',
      qaEmail: process.env.NEXT_PUBLIC_QA_EMAIL || 'qa@harvics.com',
      productEmail: process.env.NEXT_PUBLIC_PRODUCT_EMAIL || 'product@harvics.com'
    })

    // Start watchdog
    watchdog.start()

    // Initialize STRICT RECOVERY MODE - FINAL SAFETY NET
    const recoveryMode = initFrontendRecoveryMode({
      enabled: true,
      autoRepair: true,
      strictMode: true, // STRICT MODE ENABLED
      checkInterval: 60000, // 1 minute
      maxRepairAttempts: 3
    })

    // Start recovery mode
    recoveryMode.start()

    // Setup recovery mode event listeners
    const handleRecoveryAction = (event: CustomEvent) => {
      const { action, data } = event.detail
      if (action === 'repair_failed') {
        console.error('❌ FRONTEND RECOVERY: Auto-repair failed', data)
      } else if (action === 'critical_failure') {
        console.error('🛑 FRONTEND STRICT MODE: Critical failure detected', data)
      } else if (action === 'repaired') {
        console.log('✅ FRONTEND RECOVERY: Auto-repaired', data)
      }
    }

    window.addEventListener('recovery:action', handleRecoveryAction as EventListener)

    // Setup event listeners
    const handleHealthy = (event: CustomEvent) => {
      console.log('✅ Frontend health check passed', event.detail)
    }

    const handleUnhealthy = (event: CustomEvent) => {
      console.error('❌ Frontend health check failed', event.detail)
    }

    const handleAlert = (event: CustomEvent) => {
      console.error('🚨 FRONTEND ALERT:', event.detail)
      // TODO: Send to error tracking service (Sentry, etc.)
    }

    window.addEventListener('watchdog:healthy', handleHealthy as EventListener)
    window.addEventListener('watchdog:unhealthy', handleUnhealthy as EventListener)
    window.addEventListener('watchdog:alert', handleAlert as EventListener)

    // Cleanup on unmount
    return () => {
      watchdog.stop()
      recoveryMode.stop()
      window.removeEventListener('watchdog:healthy', handleHealthy as EventListener)
      window.removeEventListener('watchdog:unhealthy', handleUnhealthy as EventListener)
      window.removeEventListener('watchdog:alert', handleAlert as EventListener)
      window.removeEventListener('recovery:action', handleRecoveryAction as EventListener)
    }
  }, [])

  return null // This component doesn't render anything
}

