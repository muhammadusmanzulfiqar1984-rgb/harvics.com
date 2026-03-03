import EnterpriseCRM from '@/components/shared/EnterpriseCRM'
import { notFound } from 'next/navigation'
import { SUPPORTED_LOCALES } from '@/config/locales'

// Generate static params for all locales and personas
export async function generateStaticParams() {
  const locales = [...SUPPORTED_LOCALES]
  const personas = ['distributor', 'retailer', 'sales', 'manager', 'investor', 'copilot']
  
  return locales.flatMap(locale =>
    personas.map(persona => ({ locale, persona }))
  )
}

export default async function AdminPortalCRMPage({
  params
}: {
  params: Promise<{ locale: string; persona: string }>
}) {
  const { locale, persona } = await params

  // Map persona to EnterpriseCRM persona type
  const personaMap: Record<string, 'distributor' | 'supplier' | 'company' | 'manager'> = {
    'distributor': 'distributor',
    'retailer': 'distributor',
    'sales': 'distributor',
    'manager': 'manager',
    'investor': 'company',
    'copilot': 'company'
  }

  const crmPersona = personaMap[persona]
  if (!crmPersona) {
    notFound()
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#6B1F2B' }}>
      {/* Admin Access Banner */}
      <div style={{ 
        backgroundColor: '#10b981', 
        color: 'white', 
        padding: '15px', 
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 'bold',
        borderBottom: '3px solid #059669',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        🔓 ADMIN ACCESS - CRM Portal (No Authentication Required) | Persona: {persona} | Locale: {locale}
      </div>
      <EnterpriseCRM persona={crmPersona} locale={locale} />
    </div>
  )
}

