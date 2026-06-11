export type PresentationCategory = 'lobby' | 'lounge'

export type PresentationId =
  | 'textiles'
  | 'sourcing-overview'
  | 'fmcg-mafi'
  | 'textiles-lpp'

export interface PresentationEntry {
  id: PresentationId
  category: PresentationCategory
  title: string
  subtitle: string
  verticals: string[]
  description: string
  /** Static HTML entry under /public */
  launchPath: string
  duration: string
  format: string
  accessNote?: string
  /** Vertical page keys that link to this deck */
  verticalKeys?: string[]
}

export const presentationAreas: Record<
  PresentationCategory,
  { title: string; description: string; href: string }
> = {
  lobby: {
    title: 'Lobby Access',
    description:
      'General Harvics presentation decks for partners, investors, and standard commercial meetings.',
    href: 'lobby',
  },
  lounge: {
    title: 'Lounge Access',
    description:
      'Custom-made programme decks — LPP, MAFI, and other client-specific or board-level presentations.',
    href: 'lounge',
  },
}

export const presentationsCatalog: PresentationEntry[] = [
  {
    id: 'textiles',
    category: 'lobby',
    title: 'Textile & Apparel Sourcing',
    subtitle: 'Harvics cinematic sourcing deck',
    verticals: ['Textiles & Apparels'],
    description:
      'Full-screen cinematic presentation covering global textile sourcing, supply chain architecture, portfolio, and commercial enquiry flow.',
    launchPath: '/textile-v2/index.html',
    duration: '12 chapters',
    format: 'Cinematic scroll',
    verticalKeys: ['textiles'],
  },
  {
    id: 'sourcing-overview',
    category: 'lobby',
    title: 'Global Sourcing Overview',
    subtitle: 'End-to-end sourcing narrative',
    verticals: ['Sourcing'],
    description:
      'Harvics global sourcing story — from factory identification through QA, logistics, and compliance for multi-industry programmes.',
    launchPath: '/textile-v2/index.html',
    duration: '12 chapters',
    format: 'Cinematic scroll',
    verticalKeys: ['sourcing'],
  },
  {
    id: 'fmcg-mafi',
    category: 'lounge',
    title: 'FMCG & Brand Sourcing (MAFI)',
    subtitle: 'Client programme deck',
    verticals: ['FMCG', 'Sourcing'],
    description:
      'Premium FMCG brand presentation with buyer network, compliance, product portfolio, and market-access narrative.',
    launchPath: '/mafi-presentation/index.html',
    duration: 'Full deck',
    format: 'Interactive presentation',
    verticalKeys: ['fmcg', 'sourcing'],
  },
  {
    id: 'textiles-lpp',
    category: 'lounge',
    title: 'LPP Board Presentation',
    subtitle: 'Private board deck',
    verticals: ['Textiles & Apparels'],
    description:
      'Confidential board-level textile sourcing presentation for LPP stakeholder meetings.',
    launchPath: '/textile-v2/lpp/index.html',
    duration: 'Board edition',
    format: 'Cinematic scroll',
    verticalKeys: ['textiles'],
  },
]

export function getPresentation(id: string): PresentationEntry | undefined {
  return presentationsCatalog.find((p) => p.id === id)
}

export function getPresentationsByCategory(category: PresentationCategory): PresentationEntry[] {
  return presentationsCatalog.filter((p) => p.category === category)
}

export function getPresentationForVertical(verticalKey: string): PresentationEntry | undefined {
  const matches = presentationsCatalog.filter((p) => p.verticalKeys?.includes(verticalKey))
  return matches.find((p) => p.category === 'lobby') ?? matches[0]
}
