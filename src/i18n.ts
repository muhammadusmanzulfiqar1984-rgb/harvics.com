import type { AbstractIntlMessages } from 'next-intl'
import {getRequestConfig} from 'next-intl/server';
import { SUPPORTED_LOCALES, STATIC_LOCALES, getValidLocale } from '@/config/locales';

// API base URL for fetching translations from backend
// Use relative URL so Next.js rewrites proxy to backend (everything on port 3000)
// For server-side, we need the full URL, but Next.js rewrites will handle it
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window === 'undefined' 
  ? 'http://localhost:3000' // Server-side: use Next.js port, rewrites will proxy
  : ''); // Client-side: relative URL, uses same origin (port 3000)

export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  locale = getValidLocale(locale);

  // Try to load from static JSON files first (fastest, most reliable)
  // Only try static files for locales that we know have files (en, ar, es)
  let messages: AbstractIntlMessages = {};
  const isStaticLocale = STATIC_LOCALES.includes(locale as (typeof STATIC_LOCALES)[number]);
  
  if (isStaticLocale) {
    try {
      // Use dynamic import with error handling
      const localeModule = await import(`@/locales/${locale}.json`).catch(() => null);
      if (localeModule && localeModule.default) {
        messages = localeModule.default as AbstractIntlMessages;
        console.log(`Successfully loaded static locale file for '${locale}'`);
      } else {
        throw new Error(`Failed to load static locale file for '${locale}'`);
      }
    } catch (staticError) {
      const errorMessage = staticError instanceof Error ? staticError.message : String(staticError);
      // If static file doesn't exist or fails, try backend API
      console.warn(`Static locale file for '${locale}' not found or failed, trying backend API:`, errorMessage);
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        // Use Next.js rewrite path - will be proxied to backend
        const apiUrl = API_BASE_URL ? `${API_BASE_URL}/api/localisation/translations/${locale}` : `/api/localisation/translations/${locale}`;
        const response = await fetch(apiUrl, {
          cache: 'no-store',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = (await response.json()) as { success?: boolean; messages?: AbstractIntlMessages };
          if (data.success && data.messages) {
            messages = data.messages;
          } else {
            throw new Error('Invalid response format');
          }
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (apiError) {
        // If backend also fails, try English fallback
        console.warn(`Backend API failed for '${locale}', trying English fallback:`, apiError);
        try {
          const enModule = await import(`@/locales/en.json`);
          messages = (enModule.default as AbstractIntlMessages) || {};
          locale = 'en';
        } catch (enError) {
          console.error('Failed to load English fallback translations:', enError);
          // Return empty messages - components will show keys
          messages = {};
        }
      }
    }
  } else {
    // For non-static locales, go directly to backend API
    // But if backend fails, fallback to English immediately
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Use Next.js rewrite path - will be proxied to backend
      const apiUrl = API_BASE_URL ? `${API_BASE_URL}/api/localisation/translations/${locale}` : `/api/localisation/translations/${locale}`;
      const response = await fetch(apiUrl, {
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.messages) {
          messages = data.messages;
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (apiError) {
      // If backend fails (not available, timeout, etc.), fallback to English
      console.warn(`Backend API failed for '${locale}', falling back to English:`, apiError);
      try {
        const enModule = await import(`@/locales/en.json`);
        messages = (enModule.default as AbstractIntlMessages) || {};
        locale = 'en';
      } catch (enError) {
        console.error('Failed to load English fallback translations:', enError);
        // Return empty messages rather than crashing
        messages = {};
      }
    }
  }

  return {
    locale,
    messages
  };
});
