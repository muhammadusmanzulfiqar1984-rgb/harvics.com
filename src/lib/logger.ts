/**
 * Production-ready logging service
 * Replaces console statements with proper logging that can be integrated with
 * error tracking services (Sentry, LogRocket, etc.)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
  url?: string;
  userAgent?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatMessage(level: LogLevel, message: string, data?: unknown): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
    };

    if (data !== undefined) {
      entry.data = data;
    }

    // Add browser context in client-side
    if (typeof window !== 'undefined') {
      entry.url = window.location.href;
      entry.userAgent = navigator.userAgent;
    }

    return entry;
  }

  private shouldLog(level: LogLevel): boolean {
    // In production, only log warnings and errors
    if (this.isProduction) {
      return level === 'warn' || level === 'error';
    }
    // In development, log everything
    return true;
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = this.formatMessage(level, message, data);

    // Use console in development for debugging
    if (this.isDevelopment) {
      const consoleMethod = console[level] || console.log;
      if (data !== undefined) {
        consoleMethod(`[${level.toUpperCase()}]`, message, data);
      } else {
        consoleMethod(`[${level.toUpperCase()}]`, message);
      }
    }

    // In production, send to error tracking service
    if (this.isProduction && level === 'error') {
      // TODO: Integrate with error tracking service (e.g., Sentry)
      // Example: Sentry.captureException(new Error(message), { extra: data });
      
      // For now, log to console in production for critical errors only
      console.error('[ERROR]', message, data);
    }

    // Store logs in localStorage for debugging (client-side only, limit to 100 entries)
    if (typeof window !== 'undefined' && this.isDevelopment) {
      try {
        const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
        logs.push(entry);
        // Keep only last 100 logs
        const recentLogs = logs.slice(-100);
        localStorage.setItem('app_logs', JSON.stringify(recentLogs));
      } catch {
        // Silently fail if localStorage is full or unavailable
      }
    }
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | unknown, context?: unknown): void {
    if (error instanceof Error) {
      this.log('error', message, {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        context,
      });
    } else {
      this.log('error', message, { error, context });
    }
  }

  // Helper to log API errors
  apiError(endpoint: string, error: unknown, requestData?: unknown): void {
    this.error(`API Error: ${endpoint}`, error, { requestData });
  }

  // Helper to log component errors
  componentError(componentName: string, error: Error, errorInfo?: unknown): void {
    this.error(`Component Error: ${componentName}`, error, { errorInfo });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for use in other files
export type { Logger, LogLevel, LogEntry };
