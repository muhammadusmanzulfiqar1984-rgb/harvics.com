import { redirect } from 'next/navigation'

export default async function SupplierDashboard({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/portal/supplier`)
}

