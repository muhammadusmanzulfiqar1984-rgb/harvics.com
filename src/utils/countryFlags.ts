// Country code to flag emoji mapping
export const COUNTRY_FLAGS: Record<string, string> = {
  'us': '🇺🇸',
  'united-states': '🇺🇸',
  'usa': '🇺🇸',
  'pk': '🇵🇰',
  'pakistan': '🇵🇰',
  'ae': '🇦🇪',
  'uae': '🇦🇪',
  'united-arab-emirates': '🇦🇪',
  'gb': '🇬🇧',
  'uk': '🇬🇧',
  'united-kingdom': '🇬🇧',
  'sa': '🇸🇦',
  'saudi-arabia': '🇸🇦',
  'eg': '🇪🇬',
  'egypt': '🇪🇬',
  'jo': '🇯🇴',
  'jordan': '🇯🇴',
  'kw': '🇰🇼',
  'kuwait': '🇰🇼',
  'qa': '🇶🇦',
  'qatar': '🇶🇦',
  'bh': '🇧🇭',
  'bahrain': '🇧🇭',
  'om': '🇴🇲',
  'oman': '🇴🇲',
  'iq': '🇮🇶',
  'iraq': '🇮🇶',
  'lb': '🇱🇧',
  'lebanon': '🇱🇧',
  'ma': '🇲🇦',
  'morocco': '🇲🇦',
  'tn': '🇹🇳',
  'tunisia': '🇹🇳',
  'dz': '🇩🇿',
  'algeria': '🇩🇿',
  'ly': '🇱🇾',
  'libya': '🇱🇾',
  'sd': '🇸🇩',
  'sudan': '🇸🇩',
  'ye': '🇾🇪',
  'yemen': '🇾🇪',
  'so': '🇸🇴',
  'somalia': '🇸🇴',
  'dj': '🇩🇯',
  'djibouti': '🇩🇯',
  'comoros': '🇰🇲',
  'fr': '🇫🇷',
  'france': '🇫🇷',
  'de': '🇩🇪',
  'germany': '🇩🇪',
  'es': '🇪🇸',
  'spain': '🇪🇸',
  'it': '🇮🇹',
  'italy': '🇮🇹',
  'cn': '🇨🇳',
  'china': '🇨🇳',
  'he': '🇮🇱',
  'israel': '🇮🇱',
  'global': '🌍'
}

// Region to countries mapping
export const REGION_COUNTRIES: Record<string, string[]> = {
  'middle-east': ['ae', 'sa', 'eg', 'jo', 'kw', 'qa', 'bh', 'om', 'iq', 'lb', 'ye'],
  'europe': ['gb', 'fr', 'de', 'es', 'it'],
  'north-america': ['us'],
  'asia': ['pk', 'cn'],
  'africa': ['eg', 'ma', 'tn', 'dz', 'ly', 'sd', 'so', 'dj', 'comoros'],
  'global': []
}

export const getCountryFlag = (countryCode: string): string => {
  const normalized = countryCode.toLowerCase().replace(/\s+/g, '-')
  return COUNTRY_FLAGS[normalized] || '🌍'
}

export const getCountriesByRegion = (region: string): string[] => {
  return REGION_COUNTRIES[region.toLowerCase()] || []
}

