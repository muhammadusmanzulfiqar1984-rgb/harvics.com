/**
 * BACKEND TRANSLATION UTILITY
 * TIER 0: Localization Engine - Server-side translation support
 * 
 * Provides locale-aware translations for:
 * - API responses (status, descriptions)
 * - Error messages
 * - System notifications
 */

import * as path from 'path';
import * as fs from 'fs';

// Cache for loaded translations
const translationCache: Record<string, Record<string, any>> = {};

// Base path for backend locale files
const LOCALES_PATH = path.join(__dirname, '../locales');

/**
 * Load translations for a specific locale
 * Caches results to avoid repeated file reads
 */
export const loadTranslations = (locale: string): Record<string, any> => {
  // Return cached if available
  if (translationCache[locale]) {
    return translationCache[locale];
  }

  // Try to load the locale file
  const localePath = path.join(LOCALES_PATH, `${locale}.json`);
  
  try {
    if (fs.existsSync(localePath)) {
      const content = fs.readFileSync(localePath, 'utf-8');
      translationCache[locale] = JSON.parse(content);
      return translationCache[locale];
    }
  } catch (error) {
    console.warn(`Failed to load translations for locale: ${locale}`, error);
  }

  // Fall back to English
  if (locale !== 'en') {
    return loadTranslations('en');
  }

  // Return empty object if no translations found
  return {};
};

/**
 * Get a translated string by key
 * Supports nested keys like 'orders.status.pending'
 */
export const t = (key: string, locale: string = 'en'): string => {
  const translations = loadTranslations(locale);
  
  // Navigate nested keys
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Key not found, fall back to English or return key
      if (locale !== 'en') {
        return t(key, 'en');
      }
      return key; // Return the key itself as fallback
    }
  }
  
  return typeof value === 'string' ? value : key;
};

/**
 * Translate order status
 */
export const translateOrderStatus = (status: string, locale: string = 'en'): string => {
  const statusMap: Record<string, string> = {
    'Pending': t('orders.status.pending', locale),
    'In Transit': t('orders.status.inTransit', locale),
    'Completed': t('orders.status.completed', locale),
    'Cancelled': t('orders.status.cancelled', locale),
    'Processing': t('orders.status.processing', locale),
    'Delivered': t('orders.status.delivered', locale),
    'On Hold': t('orders.status.onHold', locale),
  };
  
  return statusMap[status] || status;
};

/**
 * Translate inventory category
 */
export const translateInventoryCategory = (category: string, locale: string = 'en'): string => {
  const categoryMap: Record<string, string> = {
    'Frozen Foods': t('inventory.categories.frozenFoods', locale),
    'Culinary': t('inventory.categories.culinary', locale),
    'Commodities': t('inventory.categories.commodities', locale),
    'Industrial': t('inventory.categories.industrial', locale),
    'Grains': t('inventory.categories.grains', locale),
    'Pantry': t('inventory.categories.pantry', locale),
    'Confectionery': t('inventory.categories.confectionery', locale),
    'Natural': t('inventory.categories.natural', locale),
    'Home Textiles': t('inventory.categories.homeTextiles', locale),
    'Beverages': t('inventory.categories.beverages', locale),
  };
  
  return categoryMap[category] || category;
};

/**
 * Translate customer segment
 */
export const translateCustomerSegment = (segment: string, locale: string = 'en'): string => {
  const segmentMap: Record<string, string> = {
    'Wholesale': t('crm.segments.wholesale', locale),
    'Distributor': t('crm.segments.distributor', locale),
    'Retail': t('crm.segments.retail', locale),
    'B2B': t('crm.segments.b2b', locale),
    'E-commerce': t('crm.segments.ecommerce', locale),
    'Direct': t('crm.segments.direct', locale),
  };
  
  return segmentMap[segment] || segment;
};

/**
 * Translate employee department
 */
export const translateDepartment = (department: string, locale: string = 'en'): string => {
  const deptMap: Record<string, string> = {
    'Sales': t('hr.departments.sales', locale),
    'Operations': t('hr.departments.operations', locale),
    'Finance': t('hr.departments.finance', locale),
    'HR': t('hr.departments.hr', locale),
    'IT': t('hr.departments.it', locale),
    'Marketing': t('hr.departments.marketing', locale),
    'Logistics': t('hr.departments.logistics', locale),
    'Procurement': t('hr.departments.procurement', locale),
    'Executive': t('hr.departments.executive', locale),
    'Legal': t('hr.departments.legal', locale),
  };
  
  return deptMap[department] || department;
};

/**
 * Translate error messages
 */
export const translateError = (errorKey: string, locale: string = 'en'): string => {
  return t(`errors.${errorKey}`, locale);
};

/**
 * Translate common API response messages
 */
export const translateMessage = (messageKey: string, locale: string = 'en'): string => {
  return t(`messages.${messageKey}`, locale);
};

/**
 * Get all available translations for a namespace
 */
export const getTranslationNamespace = (namespace: string, locale: string = 'en'): Record<string, any> => {
  const translations = loadTranslations(locale);
  return translations[namespace] || {};
};

/**
 * Clear translation cache (useful for development)
 */
export const clearTranslationCache = (): void => {
  Object.keys(translationCache).forEach(key => delete translationCache[key]);
};

export default {
  t,
  translateOrderStatus,
  translateInventoryCategory,
  translateCustomerSegment,
  translateDepartment,
  translateError,
  translateMessage,
  loadTranslations,
  getTranslationNamespace,
  clearTranslationCache,
};
