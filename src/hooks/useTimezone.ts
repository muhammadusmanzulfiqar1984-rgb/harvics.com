/**
 * Timezone Hook
 * React hook for timezone utilities
 */

import { useState, useEffect } from 'react';
import { useCountry } from '@/contexts/CountryContext';
import { useLocale } from 'next-intl';
import {
  getCountryTimezone,
  getCountryTime,
  formatCountryDateTime,
  formatCountryTime,
  formatCountryDate,
  getUTCOffset
} from '@/utils/timezone';

export function useTimezone() {
  const { selectedCountry } = useCountry();
  const locale = useLocale();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const countryCode = selectedCountry?.toUpperCase().replace('-', '') || 'US';
  const tz = getCountryTimezone(countryCode);
  const countryTime = getCountryTime(countryCode);

  return {
    timezone: tz?.timezone || 'UTC',
    utcOffset: tz?.utcOffset || '+00:00',
    currentOffset: getUTCOffset(countryCode),
    currentTime,
    countryTime,
    formatDateTime: (date: Date) => formatCountryDateTime(date, countryCode, locale),
    formatTime: (date: Date) => formatCountryTime(date, countryCode, locale),
    formatDate: (date: Date) => formatCountryDate(date, countryCode, locale),
    hasDST: tz?.dstOffset ? true : false
  };
}
