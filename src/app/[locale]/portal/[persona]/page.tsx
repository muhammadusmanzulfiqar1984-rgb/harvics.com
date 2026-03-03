import PersonaPortal from '@/components/shared/PersonaPortal'
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

export default async function PersonaPortalPage({
  params
}: {
  params: Promise<{ locale: string; persona: string }>
}) {
  const { locale, persona } = await params

  // Validate persona
  const validPersonas = ['distributor', 'retailer', 'sales', 'manager', 'investor', 'copilot']
  if (!validPersonas.includes(persona)) {
    notFound()
  }

  // Force this to be a server component that renders the client component
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#6B1F2B' }}>
      {/* Visible debug marker - RED background to make it obvious */}
      <div style={{ 
        backgroundColor: '#ff0000', 
        color: 'white', 
        padding: '20px', 
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        border: '5px solid yellow'
      }}>
        🔴 PORTAL PAGE IS LOADING - Persona: {persona} | Locale: {locale}
      </div>
      <PersonaPortal persona={persona as any} locale={locale} />
    </div>
  )
}

