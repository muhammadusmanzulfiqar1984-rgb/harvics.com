import type { AbstractIntlMessages } from 'next-intl'
import { getRequestConfig } from 'next-intl/server';
import { getValidLocale } from '@/config/locales';

function deepMerge(base: any, override: any): any {
  if (!override) return base;
  if (typeof base !== 'object' || base === null) return override ?? base;
  const out: any = Array.isArray(base) ? [...base] : { ...base };
  for (const k of Object.keys(override)) {
    out[k] = deepMerge(base?.[k], override[k]);
  }
  return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = getValidLocale(requested ?? 'en');

  let enMessages: AbstractIntlMessages = {};
  try {
    const enModule = await import(`@/locales/en.json`);
    enMessages = enModule.default as AbstractIntlMessages;
  } catch {}

  let localeMessages: AbstractIntlMessages = {};
  if (locale !== 'en') {
    try {
      const localeModule = await import(`@/locales/${locale}.json`);
      localeMessages = localeModule.default as AbstractIntlMessages;
    } catch {}
  }

  // Deep-merge: English is the base, locale overrides keys that exist.
  // Any missing key in the locale silently falls back to English.
  const messages = deepMerge(enMessages, localeMessages) as AbstractIntlMessages;

  return {
    locale,
    messages,
    onError(error) {
      if (error.code === 'MISSING_MESSAGE') {
        return;
      }
      console.error(error);
    },
    getMessageFallback({ namespace, key }) {
      return [namespace, key].filter(Boolean).join('.');
    },
  };
});
