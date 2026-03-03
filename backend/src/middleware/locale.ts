/**
 * LOCALE MIDDLEWARE
 * UNIFIED SYSTEM: Extracts locale from request headers and makes it available to all controllers
 * This ensures backend responses are localized based on frontend language selection
 */

import { Request, Response, NextFunction } from 'express';

// Extend Express Request to include locale
declare global {
  namespace Express {
    interface Request {
      locale?: string;
    }
  }
}

// Valid locales supported by the system
const VALID_LOCALES = [
  'en', 'ar', 'es', 'fr', 'de', 'zh', 'hi', 'ur', 'pt', 'ru', 'it', 'tr',
  'ja', 'ko', 'nl', 'pl', 'vi', 'th', 'id', 'ms', 'sw', 'uk', 'ro', 'cs',
  'sv', 'da', 'fi', 'no', 'el', 'hu', 'bg', 'hr', 'sk', 'sr', 'bn', 'fa',
  'ps', 'he'
];

/**
 * Middleware to extract and validate locale from request headers
 * Priority:
 * 1. X-Locale header (explicit locale from frontend)
 * 2. Accept-Language header (standard HTTP header)
 * 3. Default to 'en'
 */
export const localeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  let locale = 'en'; // Default fallback

  // Priority 1: Check X-Locale header (explicit locale from frontend)
  const explicitLocale = req.headers['x-locale'] as string;
  if (explicitLocale && VALID_LOCALES.includes(explicitLocale.toLowerCase())) {
    locale = explicitLocale.toLowerCase();
  } else {
    // Priority 2: Check Accept-Language header (standard HTTP header)
    const acceptLanguage = req.headers['accept-language'] as string;
    if (acceptLanguage) {
      // Accept-Language can be like "ar,en;q=0.9" or just "ar"
      const primaryLang = acceptLanguage.split(',')[0].split(';')[0].trim().toLowerCase();
      if (VALID_LOCALES.includes(primaryLang)) {
        locale = primaryLang;
      }
    }
  }

  // Attach locale to request object for use in controllers
  req.locale = locale;

  // Also set response header so frontend knows what locale was used
  res.setHeader('X-Response-Locale', locale);

  next();
};

/**
 * Helper function to get locale from request (for use in controllers)
 */
export const getRequestLocale = (req: Request): string => {
  return req.locale || 'en';
};

