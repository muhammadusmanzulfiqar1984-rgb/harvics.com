import { redirect } from 'next/navigation'

/**
 * Doha strategic partner brief — full-screen deck in public/harvics_doha_2.html
 * /en/doha and /doha both land here after locale routing.
 */
export default function DohaPartnerBriefPage() {
  redirect('/harvics_doha_2.html')
}
