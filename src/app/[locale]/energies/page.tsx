import type { Metadata } from 'next'
import EnergiesExperience from '@/components/energies/EnergiesExperience'

export const metadata: Metadata = {
  title: 'Harvics Energies | Renewable Fuels · Industrial Scale · Global Trade',
  description:
    'Harvics Energies — renewable fuels infrastructure engineered from feedstock to global trade. A Harvics Global Ventures initiative.',
  robots: { index: true, follow: true },
}

export default function EnergiesPage() {
  return <EnergiesExperience />
}
