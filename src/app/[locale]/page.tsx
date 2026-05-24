import dynamic from 'next/dynamic'
import LiquidGlassHero from '@/components/premium/LiquidGlassHero'
import Footer from '@/components/layout/Footer'
import ThreeDErrorBoundary from '@/components/shared/ThreeDErrorBoundary'
import ContactSection from '@/components/layout/ContactSection'
import FrameDotNav from '@/components/premium/FrameDotNav'
import LazySection from '@/components/shared/LazySection'

// All below-the-fold sections are dynamic-imported so they don't block
// the initial main-thread render of the hero.
const EnhancedIndustryGrid = dynamic(() => import('@/components/premium/EnhancedIndustryGrid'))
const HarvicsGlobe = dynamic(() => import('@/components/HarvicsGlobe'))
const HowItWorksSection = dynamic(() => import('@/components/premium/HowItWorksSection'))
const TrustSection = dynamic(() => import('@/components/premium/TrustSection'))
const AudienceRoutingSection = dynamic(() => import('@/components/premium/AudienceRoutingSection'))
const Interactive3DProductViewer = dynamic(
  () => import('@/components/premium/Interactive3DProductViewer'),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin border-harvics-gold" style={{ borderTopColor: 'transparent' }}></div>
      </div>
    )
  }
)

const ScrollNarrativeSection = dynamic(
  () => import('@/components/premium/ScrollNarrativeSection'),
  { 
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin border-harvics-maroon" style={{ borderTopColor: 'transparent' }}></div>
      </div>
    )
  }
)

const SupplyChainWheel = dynamic(
  () => import('@/components/layout/SupplyChainWheel'),
  { 
    loading: () => (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-harvics-maroon border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
)

const CinematicSupplyChainSection = dynamic(
  () => import('@/components/SupplyChainSection'),
  {
    loading: () => (
      <div className="min-h-[50vh] flex items-center justify-center bg-[#06080a]">
        <div className="w-10 h-10 border-4 border-[#C9A84C] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
)

const InteractiveWorldMap = dynamic(
  () => import('@/features/geo/InteractiveWorldMap'),
  { 
    loading: () => (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-harvics-gold border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-harvics-maroon font-medium">Loading World Map...</p>
        </div>
      </div>
    )
  }
)

// Header and Footer are provided by layout.tsx

export default async function Home() {
  const frameHeight = 'calc(100vh - 136px)'
  const frameStyle = { scrollSnapAlign: 'start' as const, minHeight: frameHeight }

  // Solid frame backgrounds — alternating to create depth rhythm.
  // NOTE: backdrop-filter blur was removed because re-blurring the entire
  // viewport on every paint across ~10 frames was making the page unresponsive.
  const glassA = { ...frameStyle, background: '#ffffff' }
  const glassB = { ...frameStyle, background: '#faf9f7' }

  return (
    <>
      {/* Fixed glass-white gradient backdrop — sits behind all snap frames */}
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

      <main
        id="homepage-main"
        className="overflow-y-auto bg-transparent"
        style={{ scrollSnapType: 'y proximity', height: frameHeight }}
      >
        {/* Apple-style right-side frame dot navigation */}
        <FrameDotNav totalFrames={11} />

        {/* Frame 1: Hero — slightly more opaque so hero imagery pops */}
        <div data-frame="1" data-animate className="overflow-hidden relative" style={glassA}>
          <LiquidGlassHero />
        </div>

        {/* Frame 3: Industry Grid */}
        <div data-frame="3" data-animate className="overflow-hidden relative" style={glassB}>
          <LazySection minHeight="100vh">
            <EnhancedIndustryGrid />
          </LazySection>
        </div>

        {/* Frame 3: 3D Product Viewer */}
        <div data-frame="3" data-animate className="overflow-hidden relative" style={glassA}>
          <LazySection minHeight="100vh">
            <ThreeDErrorBoundary>
              <Interactive3DProductViewer />
            </ThreeDErrorBoundary>
          </LazySection>
        </div>

        {/* Frame 4: How It Works */}
        <div data-frame="4" data-animate className="overflow-hidden relative" style={glassB}>
          <LazySection minHeight="100vh">
            <HowItWorksSection />
          </LazySection>
        </div>

        {/* Frame 5: Trust — Certifications + Key Markets */}
        <div data-frame="5" data-animate className="overflow-hidden relative" style={glassA}>
          <LazySection minHeight="100vh">
            <TrustSection />
          </LazySection>
        </div>

        {/* Frame 6: Audience Routing — Buyers / Distributors / Suppliers */}
        <div data-frame="6" data-animate className="overflow-hidden relative" style={glassB}>
          <LazySection minHeight="100vh">
            <AudienceRoutingSection />
          </LazySection>
        </div>

        {/* Frame 7: Scroll Narrative */}
        <div data-frame="7" data-animate className="overflow-hidden relative" style={glassA}>
          <LazySection minHeight="100vh">
            <ThreeDErrorBoundary>
              <ScrollNarrativeSection />
            </ThreeDErrorBoundary>
          </LazySection>
        </div>

        {/* Frame 8: Supply Chain Cloud — fixed height, no LazySection (component owns its own height) */}
        <div
          data-frame="8"
          data-animate
          className="relative overflow-hidden"
          style={{ ...frameStyle, scrollSnapAlign: 'start' }}
        >
          <ThreeDErrorBoundary>
            <CinematicSupplyChainSection />
          </ThreeDErrorBoundary>
        </div>

        {/* Frame 8b: Supply Chain Wheel — TEMP HIDDEN
        <div data-frame="8b" data-animate className="overflow-hidden relative" style={glassB}>
          <LazySection minHeight="100vh">
            <ThreeDErrorBoundary>
              <SupplyChainWheel />
            </ThreeDErrorBoundary>
          </LazySection>
        </div>
        */}

        {/* Frame 9: Harvics Globe */}
        <div
          data-frame="9"
          data-animate
          className="relative overflow-hidden"
          style={{ ...frameStyle, scrollSnapAlign: 'start', background: '#06080a' }}
        >
          <HarvicsGlobe />
        </div>

        {/* Frame 10: Contact */}
        <div data-frame="10" data-animate className="overflow-hidden relative" style={glassB}>
          <LazySection minHeight="100vh">
            <ContactSection />
          </LazySection>
        </div>

        {/* Frame 11: Footer */}
        <div data-frame="11" data-animate className="overflow-hidden relative" style={{ ...frameStyle, background: '#ffffff' }}>
          <Footer />
        </div>
      </main>
    </>
  )
}
