import SupremeHero from '@/components/layout/SupremeHero'
import SupremeIndustryGrid from '@/components/layout/SupremeIndustryGrid'
import SupplyChainWheel from '@/components/layout/SupplyChainWheel'
import InteractiveWorldMap from '@/components/ui/InteractiveWorldMap'
import ContactSection from '@/components/layout/ContactSection'
// Header and Footer are provided by layout.tsx

export default async function Home() {
  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      <SupremeHero />
      <SupremeIndustryGrid />
      <SupplyChainWheel />
      <div className="bg-[#F5F1E8]">
        <InteractiveWorldMap />
      </div>
      <ContactSection />
    </main>
  )
}
