import { redirect } from 'next/navigation'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export default async function AdminIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}/admin/company-dashboard`)
}
