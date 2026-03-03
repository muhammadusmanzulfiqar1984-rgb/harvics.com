// Regional structure based on Coca-Cola's country selector
// Organized by regions with languages and regional presence

export interface RegionLocation {
  code: string
  name: string
  languages: string[]
  locale?: string
  flag?: string
  region?: string
}

export interface Region {
  id: string
  name: string
  count: number
  locations: RegionLocation[]
}

export const regions: Region[] = [
  {
    id: 'africa',
    name: 'Africa',
    count: 14,
    locations: [
      { code: 'africa-cluster', name: 'Africa Cluster', languages: ['Amharic', 'English', 'French', 'Portuguese', 'Swahili'], locale: 'en' },
      { code: 'algeria', name: 'Algeria', languages: ['العربية', 'Français'], locale: 'ar' },
      { code: 'egypt', name: 'Egypt', languages: ['English', 'مصر'], locale: 'ar' },
      { code: 'kenya', name: 'Kenya', languages: ['English'], locale: 'en' },
      { code: 'morocco', name: 'Morocco', languages: ['Arabic', 'French'], locale: 'ar' },
      { code: 'nigeria', name: 'Nigeria', languages: ['English'], locale: 'en' },
      { code: 'south-africa', name: 'South Africa', languages: ['English'], locale: 'en' },
    ]
  },
  {
    id: 'asean-south-pacific',
    name: 'ASEAN & South Pacific',
    count: 14,
    locations: [
      { code: 'australia', name: 'Australia', languages: ['English'], locale: 'en' },
      { code: 'cambodia', name: 'Cambodia', languages: ['Khmer', 'English'], locale: 'en' },
      { code: 'french-polynesia', name: 'French Polynesia', languages: ['French'], locale: 'fr' },
      { code: 'indonesia', name: 'Indonesia', languages: ['Indonesian'], locale: 'en' },
      { code: 'malaysia', name: 'Malaysia', languages: ['Malay', 'English'], locale: 'en' },
      { code: 'myanmar', name: 'Myanmar', languages: ['Burmese'], locale: 'en' },
      { code: 'new-zealand', name: 'New Zealand', languages: ['English'], locale: 'en' },
      { code: 'papua-new-guinea', name: 'Papua New Guinea', languages: ['English'], locale: 'en' },
      { code: 'philippines', name: 'Philippines', languages: ['English', 'Filipino'], locale: 'en' },
      { code: 'singapore', name: 'Singapore', languages: ['English'], locale: 'en' },
      { code: 'thailand', name: 'Thailand', languages: ['Thai'], locale: 'en' },
      { code: 'vietnam', name: 'Vietnam', languages: ['Vietnamese'], locale: 'en' },
      { code: 'fiji', name: 'Fiji', languages: ['English'], locale: 'en' },
    ]
  },
  {
    id: 'eurasia-middle-east',
    name: 'Eurasia & Middle East',
    count: 35,
    locations: [
      { code: 'armenia', name: 'Armenia', languages: ['Armenian'], locale: 'en' },
      { code: 'azerbaijan', name: 'Azerbaijan', languages: ['Azerbaijani'], locale: 'en' },
      { code: 'bahrain', name: 'Bahrain', languages: ['العربية', 'English'], locale: 'ar' },
      { code: 'georgia', name: 'Georgia', languages: ['Georgian'], locale: 'en' },
      { code: 'iraq', name: 'Iraq', languages: ['English', 'العربية'], locale: 'ar' },
      { code: 'israel', name: 'Israel', languages: ['עברית', 'English'], locale: 'he' },
      { code: 'jordan', name: 'Jordan', languages: ['العربية', 'English'], locale: 'ar' },
      { code: 'kazakhstan', name: 'Kazakhstan', languages: ['Kазахстан', 'Русский'], locale: 'en' },
      { code: 'kuwait', name: 'Kuwait', languages: ['العربية', 'English'], locale: 'ar' },
      { code: 'kyrgyzstan', name: 'Kyrgyzstan', languages: ['Kyrgyz', 'Russian'], locale: 'en' },
      { code: 'oman', name: 'Oman', languages: ['العربية', 'English'], locale: 'ar' },
      { code: 'pakistan', name: 'Pakistan', languages: ['English', 'اردو'], locale: 'en' },
      { code: 'qatar', name: 'Qatar', languages: ['English', 'العربية'], locale: 'ar' },
      { code: 'saudi-arabia', name: 'Kingdom of Saudi Arabia', languages: ['English', 'العربية'], locale: 'ar' },
      { code: 'tajikistan', name: 'Tajikistan', languages: ['Tajik', 'Russian'], locale: 'en' },
      { code: 'turkiye', name: 'Türkiye', languages: ['Turkish'], locale: 'en' },
      { code: 'uae', name: 'United Arab Emirates', languages: ['English', 'العربية'], locale: 'ar' },
      { code: 'uzbekistan', name: 'Uzbekistan', languages: ['Russian', 'Uzbek'], locale: 'en' },
      { code: 'west-bank-gaza', name: 'West Bank/Gaza', languages: ['English', 'العربية'], locale: 'ar' },
      { code: 'middle-east', name: 'Middle East', languages: ['English', 'العربية'], locale: 'ar' },
    ]
  },
  {
    id: 'europe',
    name: 'Europe',
    count: 42,
    locations: [
      { code: 'albania', name: 'Albania', languages: ['Albanian'], locale: 'en' },
      { code: 'austria', name: 'Austria', languages: ['German'], locale: 'de' },
      { code: 'belarus', name: 'Belarus', languages: ['Belarusian', 'Russian'], locale: 'en' },
      { code: 'belgium-luxemburg', name: 'Belgium & Luxemburg', languages: ['French', 'Dutch'], locale: 'fr' },
      { code: 'bosnia-herzegovina', name: 'Bosna & Hercegovina', languages: ['Bosnian'], locale: 'en' },
      { code: 'bulgaria', name: 'Bulgaria', languages: ['Bulgarian'], locale: 'en' },
      { code: 'croatia', name: 'Croatia', languages: ['Croatian'], locale: 'en' },
      { code: 'cyprus', name: 'Cyprus', languages: ['Greek', 'Turkish'], locale: 'en' },
      { code: 'czech-republic', name: 'Czech Republic', languages: ['Czech'], locale: 'en' },
      { code: 'denmark', name: 'Denmark', languages: ['Danish'], locale: 'en' },
      { code: 'estonia', name: 'Estonia', languages: ['Estonian'], locale: 'en' },
      { code: 'finland', name: 'Finland', languages: ['Finnish'], locale: 'en' },
      { code: 'france', name: 'France', languages: ['French'], locale: 'fr' },
      { code: 'germany', name: 'Germany', languages: ['German'], locale: 'de' },
      { code: 'great-britain', name: 'Great Britain', languages: ['English'], locale: 'en' },
      { code: 'greece', name: 'Greece', languages: ['Greek'], locale: 'en' },
      { code: 'hungary', name: 'Hungary', languages: ['Hungarian'], locale: 'en' },
      { code: 'iceland', name: 'Iceland', languages: ['Icelandic'], locale: 'en' },
      { code: 'ireland', name: 'Ireland', languages: ['English'], locale: 'en' },
      { code: 'italy', name: 'Italy', languages: ['Italian'], locale: 'en' },
      { code: 'kosovo', name: 'Kosovo', languages: ['Albanian', 'Serbian'], locale: 'en' },
      { code: 'latvia', name: 'Latvia', languages: ['Latvian'], locale: 'en' },
      { code: 'lithuania', name: 'Lithuania', languages: ['Lithuanian'], locale: 'en' },
      { code: 'moldova', name: 'Moldova', languages: ['Romanian', 'Russian'], locale: 'en' },
      { code: 'montenegro', name: 'Montenegro', languages: ['Montenegrin'], locale: 'en' },
      { code: 'netherlands', name: 'Netherlands', languages: ['Dutch'], locale: 'en' },
      { code: 'north-macedonia', name: 'North Macedonia', languages: ['Macedonian', 'Albanian'], locale: 'en' },
      { code: 'norway', name: 'Norway', languages: ['Norwegian'], locale: 'en' },
      { code: 'poland', name: 'Poland', languages: ['Polish'], locale: 'en' },
      { code: 'portugal', name: 'Portugal', languages: ['Portuguese'], locale: 'en' },
      { code: 'romania', name: 'Romania', languages: ['Romanian'], locale: 'en' },
      { code: 'serbia', name: 'Serbia', languages: ['Serbian'], locale: 'en' },
      { code: 'slovakia', name: 'Slovakia', languages: ['Slovak'], locale: 'en' },
      { code: 'slovenia', name: 'Slovenia', languages: ['Slovenian'], locale: 'en' },
      { code: 'spain', name: 'Spain', languages: ['Español'], locale: 'es' },
      { code: 'sweden', name: 'Sweden', languages: ['Swedish'], locale: 'en' },
      { code: 'switzerland', name: 'Switzerland', languages: ['German', 'French'], locale: 'de' },
      { code: 'ukraine', name: 'Ukraine', languages: ['Ukrainian'], locale: 'en' },
    ]
  },
  {
    id: 'greater-china-mongolia',
    name: 'Greater China & Mongolia',
    count: 4,
    locations: [
      { code: 'china', name: 'China', languages: ['中文'], locale: 'zh' },
      { code: 'hong-kong', name: 'China | Hong Kong SAR', languages: ['English', '繁體中文'], locale: 'zh' },
      { code: 'mongolia', name: 'Mongolia', languages: ['English'], locale: 'en' },
    ]
  },
  {
    id: 'india-southwest-asia',
    name: 'India & Southwest Asia',
    count: 12,
    locations: [
      { code: 'bangladesh', name: 'Bangladesh', languages: ['Bangla', 'English'], locale: 'en' },
      { code: 'bhutan', name: 'Bhutan', languages: ['English', 'Dzongkha'], locale: 'en' },
      { code: 'maldives', name: 'Maldives', languages: ['English', 'Divehi'], locale: 'en' },
      { code: 'nepal', name: 'Nepal', languages: ['English', 'Nepali'], locale: 'en' },
      { code: 'india', name: 'India', languages: ['English', 'Hindi'], locale: 'en' },
      { code: 'sri-lanka', name: 'Sri Lanka', languages: ['English', 'Sinhala'], locale: 'en' },
    ]
  },
  {
    id: 'japan-south-korea',
    name: 'Japan & South Korea',
    count: 2,
    locations: [
      { code: 'japan', name: 'Japan', languages: ['Japanese'], locale: 'en' },
      { code: 'south-korea', name: 'Republic of Korea', languages: ['Korean'], locale: 'en' },
    ]
  },
  {
    id: 'latin-america',
    name: 'Latin America',
    count: 17,
    locations: [
      { code: 'argentina', name: 'Argentina', languages: ['Español'], locale: 'es' },
      { code: 'bolivia', name: 'Bolivia', languages: ['Español'], locale: 'es' },
      { code: 'brasil', name: 'Brasil', languages: ['Portuguese'], locale: 'en' },
      { code: 'caribe', name: 'Caribe', languages: ['Español'], locale: 'es' },
      { code: 'chile', name: 'Chile', languages: ['Español'], locale: 'es' },
      { code: 'colombia', name: 'Colombia', languages: ['Español'], locale: 'es' },
      { code: 'costa-rica', name: 'Costa Rica', languages: ['Español'], locale: 'es' },
      { code: 'dominican-republic', name: 'República Dominicana', languages: ['Español'], locale: 'es' },
      { code: 'ecuador', name: 'Ecuador', languages: ['Español'], locale: 'es' },
      { code: 'el-salvador', name: 'El Salvador', languages: ['Español'], locale: 'es' },
      { code: 'guatemala', name: 'Guatemala', languages: ['Español'], locale: 'es' },
      { code: 'honduras', name: 'Honduras', languages: ['Español'], locale: 'es' },
      { code: 'mexico', name: 'México', languages: ['Español'], locale: 'es' },
      { code: 'panama', name: 'Panamá', languages: ['Español'], locale: 'es' },
      { code: 'paraguay', name: 'Paraguay', languages: ['Español'], locale: 'es' },
      { code: 'peru', name: 'Perú', languages: ['Español'], locale: 'es' },
      { code: 'uruguay', name: 'Uruguay', languages: ['Español'], locale: 'es' },
    ]
  },
  {
    id: 'north-america',
    name: 'North America',
    count: 3,
    locations: [
      { code: 'united-states', name: 'United States', languages: ['English'], locale: 'en' },
      { code: 'canada', name: 'Canada', languages: ['English', 'Français'], locale: 'en' },
    ]
  }
]

// Get all locations flattened
export const getAllLocations = (): RegionLocation[] => {
  return regions.flatMap(region => region.locations)
}

// Get location by code
export const getLocationByCode = (code: string): RegionLocation | undefined => {
  return getAllLocations().find(loc => loc.code === code)
}

// Get locations by region
export const getLocationsByRegion = (regionId: string): RegionLocation[] => {
  const region = regions.find(r => r.id === regionId)
  return region ? region.locations : []
}

// Get region by location code
export const getRegionByLocationCode = (locationCode: string): Region | undefined => {
  return regions.find(region => 
    region.locations.some(loc => loc.code === locationCode)
  )
}

