import { redirect } from 'next/navigation'

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

export default async function OffersIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}/offers/promotions`)
}
