/**
 * Official Harvics contact directory — single source for Contact / Leadership / Fin training.
 * Keep names & emails in sync with mailbox provisioning.
 */

export type HarvicsContactGroup =
  | 'leadership'
  | 'general'
  | 'regional'
  | 'commercial'
  | 'operations'
  | 'finance'
  | 'support'
  | 'technology'

export type HarvicsContact = {
  name: string
  email: string
  role: string
  group: HarvicsContactGroup
}

/** Deduped directory (founder listed once with primary ceo@; founder@ also published). */
export const HARVICS_CONTACTS: HarvicsContact[] = [
  {
    name: 'Mian Muhammad Usman',
    email: 'ceo@harvics.com',
    role: 'Founder & Chief Executive Officer',
    group: 'leadership',
  },
  {
    name: 'Mian Muhammad Usman',
    email: 'founder@harvics.com',
    role: 'Founder',
    group: 'leadership',
  },
  {
    name: 'General Inquiries',
    email: 'info@harvics.com',
    role: 'General Inquiries',
    group: 'general',
  },
  {
    name: 'Jessica Lauren',
    email: 'office@harvics.com',
    role: 'Office',
    group: 'general',
  },
  {
    name: 'Paul Smith',
    email: 'america@harvics.com',
    role: 'Americas Desk',
    group: 'regional',
  },
  {
    name: 'Kam Un Chang',
    email: 'gcc@harvics.com',
    role: 'GCC Desk',
    group: 'regional',
  },
  {
    name: 'Shawn Lee',
    email: 'asia@harvics.com',
    role: 'Asia Desk',
    group: 'regional',
  },
  {
    name: 'David Um Kilesh',
    email: 'apac@harvics.com',
    role: 'APAC Desk',
    group: 'regional',
  },
  {
    name: 'Chris David',
    email: 'partnerships@harvics.com',
    role: 'Partnerships',
    group: 'commercial',
  },
  {
    name: 'David Lucas Sanchez',
    email: 'sourcing@harvics.com',
    role: 'Sourcing',
    group: 'commercial',
  },
  {
    name: 'Jose De Silva',
    email: 'operations@harvics.com',
    role: 'Operations',
    group: 'operations',
  },
  {
    name: 'John Smith',
    email: 'accounts@harvics.com',
    role: 'Accounts',
    group: 'finance',
  },
  {
    name: 'Paula Inkavov',
    email: 'billing@harvics.com',
    role: 'Billing',
    group: 'finance',
  },
  {
    name: 'Harvics Support Desk',
    email: 'support@harvicsglobalventures.zendesk.com',
    role: 'Zendesk Support · tickets & help',
    group: 'support',
  },
  {
    name: 'Harvics Technology',
    email: 'technology@harvics.com',
    role: 'Technology',
    group: 'technology',
  },
]

export const HARVICS_PRIMARY = {
  general: 'info@harvics.com',
  support: 'support@harvicsglobalventures.zendesk.com',
  sourcing: 'sourcing@harvics.com',
  partnerships: 'partnerships@harvics.com',
  office: 'office@harvics.com',
  operations: 'operations@harvics.com',
  accounts: 'accounts@harvics.com',
  billing: 'billing@harvics.com',
  technology: 'technology@harvics.com',
  ceo: 'ceo@harvics.com',
  founder: 'founder@harvics.com',
} as const

export const CONTACT_GROUP_LABELS: Record<HarvicsContactGroup, string> = {
  leadership: 'Leadership',
  general: 'General',
  regional: 'Regional Desks',
  commercial: 'Commercial',
  operations: 'Operations',
  finance: 'Finance',
  support: 'Support',
  technology: 'Technology',
}

export function contactsByGroup(): { group: HarvicsContactGroup; label: string; contacts: HarvicsContact[] }[] {
  const order: HarvicsContactGroup[] = [
    'general',
    'regional',
    'commercial',
    'operations',
    'finance',
    'support',
    'technology',
    'leadership',
  ]
  return order.map((group) => ({
    group,
    label: CONTACT_GROUP_LABELS[group],
    contacts: HARVICS_CONTACTS.filter((c) => c.group === group),
  }))
}
