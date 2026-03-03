// Navigation Types - M&S Foods Pattern
export interface NavigationItem {
  id: string
  label: string
  href: string
  icon?: string
  image?: string
  description?: string
  order: number
  category: 'gender' | 'product' | 'special' | 'corporate'
  children?: NavigationItem[]
  featured?: boolean
}

export interface MegaMenuSection {
  id: string
  title: string
  type: 'visual' | 'text' | 'mixed'
  items: NavigationItem[]
  columns?: number
}

export interface NavigationMenu {
  id: string
  name: string
  sections: MegaMenuSection[]
  locale?: string
  country?: string
}

export interface ServiceInfo {
  id: string
  title: string
  description: string
  icon: string
  link?: string
  order: number
}

export interface FooterColumn {
  id: string
  title: string
  links: FooterLink[]
  order: number
}

export interface FooterLink {
  id: string
  label: string
  href: string
  external?: boolean
  order: number
}

export interface PaymentMethod {
  id: string
  name: string
  logo: string
  type: 'card' | 'digital' | 'installment'
  enabled: boolean
}



