// Header and Footer are provided by layout.tsx - DO NOT import them here to avoid duplication
import { getTranslations } from 'next-intl/server'
import ContactPageClient from './ContactPageClient'
import enMessages from '@/locales/en.json'

import type { Metadata } from 'next'
import { generateLocalizedMetadata } from '@/lib/seo'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateLocalizedMetadata(locale, 'contact')
}


// Generate static params for all locales
export async function generateStaticParams() {
  return generateAllLocaleParams()
}

interface ContactPageProps {
  params: Promise<{ locale: string }>
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params
  const t = await getTranslations('contact')
  const fallback = enMessages.contact

  const safe = (key: keyof typeof fallback) => {
    try {
      return t(key)
    } catch {
      return fallback[key]
    }
  }

  return (
    <ContactPageClient
      locale={locale}
      translations={{
        title: safe('title'),
        subtitle: safe('subtitle'),
        getInTouch: safe('getInTouch'),
        phone: safe('phone'),
        email: safe('email'),
        whatsapp: safe('whatsapp'),
        locations: safe('locations'),
        locationsValue: safe('locationsValue'),
        sendMessage: safe('sendMessage'),
        firstName: safe('firstName'),
        firstNamePlaceholder: safe('firstNamePlaceholder'),
        lastName: safe('lastName'),
        lastNamePlaceholder: safe('lastNamePlaceholder'),
        emailPlaceholder: safe('emailPlaceholder'),
        subject: safe('subject'),
        subjectPlaceholder: safe('subjectPlaceholder'),
        message: safe('message'),
        messagePlaceholder: safe('messagePlaceholder'),
        send: safe('send'),
      }}
    />
  )
}
