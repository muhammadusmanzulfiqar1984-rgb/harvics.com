import { redirect } from 'next/navigation'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export default async function DistributorPortalOrdersIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}/distributor-portal/orders/history`)
}
