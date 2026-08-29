import { redirect } from 'next/navigation'

/**
 * Harvics Global Ventures presentation — full-screen story in public/harvics_ventures.html
 * /en/ventures and /ventures both land here after locale routing.
 */
export default function VenturesPresentationPage() {
  redirect('/harvics_ventures.html')
}
