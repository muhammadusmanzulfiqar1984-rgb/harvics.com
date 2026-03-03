/**
 * Generate static params for ALL supported locales
 * This ensures all languages are available for static generation
 */
import { SUPPORTED_LOCALES } from '@/config/locales'

export function generateAllLocaleParams() {
  return SUPPORTED_LOCALES.map((locale) => ({
    locale
  }))
}

/**
 * Get locale metadata for display
 */
export const LOCALE_METADATA: Record<string, { name: string; nativeName: string; flag: string }> = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  ar: { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  zh: { name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  he: { name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  ru: { name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  ko: { name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  nl: { name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  pl: { name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  tr: { name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  vi: { name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  th: { name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  id: { name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  ms: { name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  sw: { name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
  uk: { name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  ro: { name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
  cs: { name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  sv: { name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  da: { name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  fi: { name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  no: { name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  el: { name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  hu: { name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
  bg: { name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬' },
  hr: { name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷' },
  sk: { name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰' },
  sr: { name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸' },
  bn: { name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  ur: { name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
  fa: { name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷' },
  ps: { name: 'Pashto', nativeName: 'پښتو', flag: '🇦🇫' }
}

