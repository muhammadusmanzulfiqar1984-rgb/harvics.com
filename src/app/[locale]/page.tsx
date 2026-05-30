import dynamic from 'next/dynamic'
import LiquidGlassHero from '@/components/premium/LiquidGlassHero'
import ThreeDErrorBoundary from '@/components/shared/ThreeDErrorBoundary'
import ContactSection from '@/components/layout/ContactSection'

const EnhancedIndustryGrid = dynamic(() => import('@/components/premium/EnhancedIndustryGrid'))
const OperatingModelSection = dynamic(() => import('@/components/premium/OperatingModelSection'))
const Interactive3DProductViewer = dynamic(() => import('@/components/premium/CinematicTradeMap'))
const SupplyChainWheel = dynamic(() => import('@/components/layout/SupplyChainWheel'), {
  loading: () => (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-harvics-maroon border-t-transparent rounded-full animate-spin" />
    </div>
  ),
})

export default function Home() {
  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: -1,
          background: [
            'radial-gradient(ellipse at 10% 6%,  rgba(107,31,43,0.07)  0%, transparent 40%)',
            'radial-gradient(ellipse at 90% 94%, rgba(195,163,94,0.09)  0%, transparent 42%)',
            'radial-gradient(ellipse at 88% 10%, rgba(195,163,94,0.055) 0%, transparent 36%)',
            'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.5)  0%, transparent 68%)',
            'linear-gradient(160deg, #ffffff 0%, #fdfcfb 45%, #faf9f7 100%)',
          ].join(', '),
        }}
      />

      <main id="homepage-main" className="w-full min-h-screen bg-transparent flex flex-col">

        <section className="relative overflow-hidden flex flex-col w-full min-h-screen border-b border-white/5 bg-harvics-dark">
          <LiquidGlassHero />
        </section>

        <section className="relative overflow-hidden flex flex-col w-full bg-[#faf9f7]">
          <EnhancedIndustryGrid />
        </section>

        <section className="relative overflow-hidden flex flex-col w-full">
          <Interactive3DProductViewer />
        </section>

        <section className="relative overflow-hidden flex flex-col w-full">
          <OperatingModelSection />
        </section>

        <section className="relative overflow-hidden flex flex-col w-full bg-[#faf9f7]">
          <ThreeDErrorBoundary>
            <SupplyChainWheel />
          </ThreeDErrorBoundary>
        </section>

        <section className="relative overflow-hidden flex flex-col w-full bg-[#faf9f7]">
          <ContactSection />
        </section>

      </main>
    </>
  )
}
