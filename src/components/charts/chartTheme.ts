/** Light OS chart theme — cream surfaces, burgundy accents (not burgundy fills). */
export const CT = {
  bg: '#FFFEF9',
  border: 'rgba(61, 18, 18, 0.12)',
  title: '#3D1212',
  muted: '#6B5E52',
  grid: 'rgba(61, 18, 18, 0.07)',
  tipBg: '#FFFFFF',
  tipBorder: 'rgba(61, 18, 18, 0.14)',
  tipText: '#1A1A1A',
  tipLabel: '#8B2535',
  burgundy: 'var(--harvics-burgundy)',
  gold: 'var(--harvics-gold)',
  cream: 'var(--harvics-cream)',
  cardShadow: '0 1px 3px rgba(61, 18, 18, 0.06)',
} as const

export const CHART_SERIES = [
  'var(--harvics-burgundy)',
  'var(--harvics-gold)',
  '#0F766E',
  '#B45309',
  '#475569',
] as const
