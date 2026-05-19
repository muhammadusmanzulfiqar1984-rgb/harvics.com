import { redirect } from 'next/navigation'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'

export default async function CompanyLoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}/login`)
}

// Generate static params for all locales
export async function generateStaticParams() {
  return generateAllLocaleParams()
}

