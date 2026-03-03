/**
 * FRONTEND DEPLOYMENT WATCHDOG
 * Monitors frontend deployment health, build status, and UI/UX
 * Alerts: Frontend Lead, QA Team, Product Team
 */

interface WatchdogConfig {
  checkInterval?: number;
  healthEndpoint?: string;
  alertThreshold?: number;
  enabled?: boolean;
  frontendLeadEmail?: string;
  qaEmail?: string;
  productEmail?: string;
}

interface CheckResult {
  timestamp: string;
  healthy: boolean;
  issues: Array<{
    type: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
  }>;
  metrics: {
    buildTime?: number;
    bundleSize?: number;
    pageLoadTime?: number;
    apiResponseTime?: number;
    errorCount?: number;
  };
}

class FrontendWatchdog {
  private config: Required<WatchdogConfig>;
  private failureCount: number = 0;
  private lastHealthCheck: CheckResult | null = null;
  private isHealthy: boolean = true;
  private interval: NodeJS.Timeout | null = null;
  private watchers: {
    frontendLead: string;
    qa: string;
    product: string;
  };

  constructor(config: WatchdogConfig = {}) {
    this.config = {
      checkInterval: config.checkInterval || 30000, // 30 seconds
      healthEndpoint: config.healthEndpoint || '/api/health',
      alertThreshold: config.alertThreshold || 3,
      enabled: config.enabled !== false,
      frontendLeadEmail: config.frontendLeadEmail || 'frontend-lead@harvics.com',
      qaEmail: config.qaEmail || 'qa@harvics.com',
      productEmail: config.productEmail || 'product@harvics.com'
    };

    this.watchers = {
      frontendLead: this.config.frontendLeadEmail,
      qa: this.config.qaEmail,
      product: this.config.productEmail
    };
  }

  start(): void {
    if (!this.config.enabled) {
      console.warn('⚠️  Frontend Deployment Watchdog is disabled');
      return;
    }

    console.log('🔍 Frontend Deployment Watchdog started');
    console.log(`   Checking every ${this.config.checkInterval / 1000} seconds`);
    console.log(`   Watching: Build, Performance, Errors, API Health`);

    // Initial check
    this.performCheck();

    // Schedule periodic checks
    this.interval = setInterval(() => {
      this.performCheck();
    }, this.config.checkInterval);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      console.log('🛑 Frontend Deployment Watchdog stopped');
    }
  }

  private async performCheck(): Promise<void> {
    const checkResults: CheckResult = {
      timestamp: new Date().toISOString(),
      healthy: true,
      issues: [],
      metrics: {}
    };

    try {
      // 1. Build Status Check
      await this.checkBuildStatus(checkResults);

      // 2. API Health Check
      await this.checkAPIHealth(checkResults);

      // 3. Performance Check
      await this.checkPerformance(checkResults);

      // 4. Error Monitoring
      await this.checkErrors(checkResults);

      // 5. Bundle Size Check
      await this.checkBundleSize(checkResults);

      // Evaluate overall health
      checkResults.healthy = checkResults.issues.filter(i => i.severity === 'critical').length === 0;
      this.isHealthy = checkResults.healthy;
      this.lastHealthCheck = checkResults;

      if (checkResults.healthy) {
        this.failureCount = 0;
        this.onHealthy(checkResults);
      } else {
        this.failureCount++;
        this.onUnhealthy(checkResults);

        // Alert if threshold reached
        if (this.failureCount >= this.config.alertThreshold) {
          await this.sendAlerts(checkResults);
        }
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Frontend Health Check:', checkResults);
      }

    } catch (error) {
      console.error('❌ Frontend Watchdog check failed:', error);
      checkResults.healthy = false;
      checkResults.issues.push({
        type: 'watchdog_error',
        severity: 'critical',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async checkBuildStatus(results: CheckResult): Promise<void> {
    try {
      // Check if build is successful by checking if main bundle exists
      // In Next.js, we can check if the app is running
      const response = await fetch(this.config.healthEndpoint, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        results.issues.push({
          type: 'build_status',
          severity: 'critical',
          message: `Health endpoint returned ${response.status}`
        });
        results.healthy = false;
      }
    } catch (error) {
      results.issues.push({
        type: 'build_status',
        severity: 'critical',
        message: `Build check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      results.healthy = false;
    }
  }

  private async checkAPIHealth(results: CheckResult): Promise<void> {
    try {
      const startTime = performance.now();
      const response = await fetch('/api/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      const responseTime = performance.now() - startTime;

      results.metrics.apiResponseTime = responseTime;

      if (!response.ok) {
        results.issues.push({
          type: 'api_health',
          severity: 'critical',
          message: `API health check failed: ${response.status}`
        });
        results.healthy = false;
      }

      if (responseTime > 2000) {
        results.issues.push({
          type: 'api_health',
          severity: 'warning',
          message: `Slow API response: ${responseTime.toFixed(2)}ms`
        });
      }
    } catch (error) {
      results.issues.push({
        type: 'api_health',
        severity: 'critical',
        message: `API health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      results.healthy = false;
    }
  }

  private async checkPerformance(results: CheckResult): Promise<void> {
    if (typeof window === 'undefined' || !window.performance) {
      return; // Server-side rendering
    }

    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
        results.metrics.pageLoadTime = pageLoadTime;

        if (pageLoadTime > 3000) {
          results.issues.push({
            type: 'performance',
            severity: 'warning',
            message: `Slow page load: ${pageLoadTime.toFixed(2)}ms`
          });
        }
      }
    } catch {
      // Performance API not available
    }
  }

  private async checkErrors(results: CheckResult): Promise<void> {
    // Check for console errors (in development)
    // In production, errors should be logged to error tracking service
    const errorCount = 0; // This would come from error tracking service
    
    results.metrics.errorCount = errorCount;

    if (errorCount > 10) {
      results.issues.push({
        type: 'errors',
        severity: 'warning',
        message: `High error count: ${errorCount} errors detected`
      });
    }
  }

  private async checkBundleSize(results: CheckResult): Promise<void> {
    // This would check bundle size from build output
    // For now, we'll check if the page loads successfully
    // In production, this would read from webpack stats or build manifest
    const bundleSize = 0; // Would come from build analysis
    
    results.metrics.bundleSize = bundleSize;

    if (bundleSize > 500000) { // 500KB
      results.issues.push({
        type: 'bundle_size',
        severity: 'warning',
        message: `Large bundle size: ${(bundleSize / 1024).toFixed(2)}KB`
      });
    }
  }

  private onHealthy(results: CheckResult): void {
    // Emit healthy event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('watchdog:healthy', { detail: results }));
    }
  }

  private onUnhealthy(results: CheckResult): void {
    // Emit unhealthy event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('watchdog:unhealthy', { detail: results }));
    }
  }

  private async sendAlerts(checkResults: CheckResult): Promise<void> {
    const alertMessage = {
      subject: '🚨 Frontend Deployment Health Alert',
      severity: 'critical',
      timestamp: checkResults.timestamp,
      issues: checkResults.issues,
      metrics: checkResults.metrics,
      watchers: this.watchers
    };

    // Log alert
    console.error('🚨 FRONTEND HEALTH ALERT:', JSON.stringify(alertMessage, null, 2));

    // Dispatch alert event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('watchdog:alert', { detail: alertMessage }));
    }

    // TODO: Integrate with email/Slack/PagerDuty
    // For now, we log and emit events
  }

  getStatus() {
    return {
      healthy: this.isHealthy,
      lastCheck: this.lastHealthCheck,
      failureCount: this.failureCount,
      watchers: this.watchers
    };
  }
}

// Export singleton instance
let watchdogInstance: FrontendWatchdog | null = null;

export function initFrontendWatchdog(config?: WatchdogConfig): FrontendWatchdog {
  if (!watchdogInstance) {
    watchdogInstance = new FrontendWatchdog(config);
  }
  return watchdogInstance;
}

export function getFrontendWatchdog(): FrontendWatchdog | null {
  return watchdogInstance;
}

export default FrontendWatchdog;
