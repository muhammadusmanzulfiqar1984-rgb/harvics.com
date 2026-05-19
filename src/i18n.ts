import type { AbstractIntlMessages } from 'next-intl'
import { getRequestConfig } from 'next-intl/server';
import { getValidLocale } from '@/config/locales';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = getValidLocale(requested ?? 'en');

  let messages: AbstractIntlMessages = {};

  try {
    const localeModule = await import(`@/locales/${locale}.json`);
    messages = localeModule.default as AbstractIntlMessages;
  } catch {
    try {
      const enModule = await import(`@/locales/en.json`);
      messages = enModule.default as AbstractIntlMessages;
    } catch {
      messages = {};
    }
  }

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
