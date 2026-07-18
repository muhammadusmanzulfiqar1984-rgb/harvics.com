import { redirect } from 'next/navigation'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

/** Local corridor preview — same document as production trial HTML (no iframe). */
export default async function HomepageTrialPage() {
  redirect('/homepage-options-trial.html')
}
