// Header and Footer are provided by layout.tsx - DO NOT import them here to avoid duplication
import { getTranslations } from 'next-intl/server'
import ContactPageClient from './ContactPageClient'

import type { Metadata } from 'next'
import { generateLocalizedMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateLocalizedMetadata(locale, 'contact')
}


// Generate static params for all locales
export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'ar' },
    { locale: 'fr' },
    { locale: 'es' },
    { locale: 'de' },
    { locale: 'zh' },
    { locale: 'he' }
  ]
}

interface ContactPageProps {
  params: Promise<{ locale: string }>
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params
  const t = await getTranslations('contact')

  return (
    <ContactPageClient
      locale={locale}
      translations={{
        title: t('title'),
        subtitle: t('subtitle'),
        getInTouch: t('getInTouch'),
        phone: t('phone'),
        email: t('email'),
        whatsapp: t('whatsapp'),
        locations: t('locations'),
        locationsValue: t('locationsValue'),
        sendMessage: t('sendMessage'),
        firstName: t('firstName'),
        firstNamePlaceholder: t('firstNamePlaceholder'),
        lastName: t('lastName'),
        lastNamePlaceholder: t('lastNamePlaceholder'),
        emailPlaceholder: t('emailPlaceholder'),
        subject: t('subject'),
        subjectPlaceholder: t('subjectPlaceholder'),
        message: t('message'),
        messagePlaceholder: t('messagePlaceholder'),
        send: t('send'),
      }}
    />
  )
}
