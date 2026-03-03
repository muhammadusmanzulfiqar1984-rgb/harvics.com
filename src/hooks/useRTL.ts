/**
 * RTL Hook
 * React hook for RTL layout utilities
 */

import { useLocale } from 'next-intl';
import { isRTL, getTextDirection, getMarginStart, getMarginEnd, getPaddingStart, getPaddingEnd } from '@/utils/rtl';

export function useRTL() {
  const locale = useLocale();

  return {
    isRTL: isRTL(locale),
    direction: getTextDirection(locale),
    marginStart: (size: string) => getMarginStart(locale, size),
    marginEnd: (size: string) => getMarginEnd(locale, size),
    paddingStart: (size: string) => getPaddingStart(locale, size),
    paddingEnd: (size: string) => getPaddingEnd(locale, size),
  };
}

