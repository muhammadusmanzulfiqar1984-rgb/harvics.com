import LiquidGlassHero from '@/components/premium/LiquidGlassHero'
import ManifestoSection from '@/components/home/ManifestoSection'
import CorridorProofSection from '@/components/home/CorridorProofSection'
import IndustriesHScrollSection from '@/components/home/IndustriesHScrollSection'
import CorridorMarqueeSection from '@/components/home/CorridorMarqueeSection'
import HarvicTradeGateSection from '@/components/home/HarvicTradeGateSection'
import LiveListingsSection from '@/components/home/LiveListingsSection'
import AppsCommercialSection from '@/components/home/AppsCommercialSection'
import OperatingModelSection from '@/components/premium/OperatingModelSection'
import CinematicTradeMap from '@/components/premium/CinematicTradeMap'
import SupplyChainWheel from '@/components/layout/SupplyChainWheel'
import ThreeDErrorBoundary from '@/components/shared/ThreeDErrorBoundary'
import ContactSection from '@/components/layout/ContactSection'
import HomepageLenis from '@/components/home/HomepageLenis'

/** Local dev home — aligned with production harvics.com/en corridor stack. */
export default function Home() {
  return (
    <>
      <HomepageLenis />
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: -1,
          background: [
            'radial-gradient(ellipse at 10% 6%,  rgba(61, 18, 18,0.07)  0%, transparent 40%)',
            'radial-gradient(ellipse at 90% 94%, rgba(195, 163, 94,0.09)  0%, transparent 42%)',
            'radial-gradient(ellipse at 88% 10%, rgba(195, 163, 94,0.055) 0%, transparent 36%)',
            'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.5)  0%, transparent 68%)',
            'linear-gradient(160deg, #ffffff 0%, #fdfcfb 45%, #faf9f7 100%)',
          ].join(', '),
        }}
      />

      <main id="homepage-main" className="w-full min-h-screen bg-transparent flex flex-col text-harvics-burgundy">

        <section className="relative overflow-hidden flex flex-col w-full min-h-screen border-b border-harvics-gold/10 bg-harvics-burgundy">
          <LiquidGlassHero />
        </section>

        <ManifestoSection />

        <CorridorProofSection />

        <section id="supply-chain" className="relative overflow-hidden flex flex-col w-full bg-harvics-cream">
          <ThreeDErrorBoundary>
            <SupplyChainWheel />
          </ThreeDErrorBoundary>
        </section>

        <IndustriesHScrollSection />

        <CorridorMarqueeSection />

        <section id="network" className="relative overflow-hidden flex flex-col w-full">
          <CinematicTradeMap />
        </section>

        <section id="operating-model" className="relative overflow-hidden flex flex-col w-full bg-harvics-cream">
          <OperatingModelSection tone="cream" />
        </section>

        <HarvicTradeGateSection />

        <LiveListingsSection />

        <AppsCommercialSection />

        <section id="contact" className="relative overflow-hidden flex flex-col w-full border-t border-harvics-gold/15 bg-harvics-cream">
          <ContactSection />
        </section>

      </main>
    </>
  )
}
