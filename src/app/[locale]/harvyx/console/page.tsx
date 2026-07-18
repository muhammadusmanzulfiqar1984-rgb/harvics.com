import { generateAllLocaleParams } from '@/lib/generateLocaleParams'
import HarvyXConsoleClient from '../HarvyXConsoleClient'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

export const metadata = {
  title: 'HarvyX Console',
  description: 'Gated HarvyX operator console',
}

export default function HarvyXConsolePage() {
  return (
    <main className="min-h-screen bg-harvics-burgundy">
      <HarvyXConsoleClient />
    </main>
  )
}
