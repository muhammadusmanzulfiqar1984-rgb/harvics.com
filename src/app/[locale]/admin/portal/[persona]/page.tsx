import PersonaPortal from '@/components/shared/PersonaPortal'
import { notFound } from 'next/navigation'
import { SUPPORTED_LOCALES } from '@/config/locales'

type PersonaType = 'distributor' | 'retailer' | 'sales' | 'manager' | 'investor' | 'copilot'

// Generate static params for all locales and personas
export async function generateStaticParams() {
  const locales = [...SUPPORTED_LOCALES]
  const personas: PersonaType[] = ['distributor', 'retailer', 'sales', 'manager', 'investor', 'copilot']
  
  return locales.flatMap(locale =>
    personas.map(persona => ({ locale, persona }))
  )
}

export default async function AdminPortalPage({
  params
}: {
  params: Promise<{ locale: string; persona: string }>
}) {
  const { locale, persona } = await params

  // Validate persona
  const validPersonas: PersonaType[] = ['distributor', 'retailer', 'sales', 'manager', 'investor', 'copilot']
  if (!validPersonas.includes(persona as PersonaType)) {
    notFound()
  }

  // Direct access - no authentication required
  // This is for development/admin access to view and make changes
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
        borderBottom: '3px solid #059669'
      }}>
        🔓 ADMIN ACCESS - Direct Portal Entry (No Authentication Required) | Persona: {persona} | Locale: {locale}
      </div>
      <PersonaPortal persona={persona as PersonaType} locale={locale} />
    </div>
  )
}

