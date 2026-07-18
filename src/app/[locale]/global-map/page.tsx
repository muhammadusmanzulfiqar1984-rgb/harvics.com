import AnimatedGlobalMap from '@/components/premium/AnimatedGlobalMap'

export default function GlobalMapPage() {
  return (
    <div className="min-h-screen space-y-6">
      <div className="px-6 pt-6">
        <h1 className="text-3xl font-bold text-harvics-gold mb-2">Global Operations Map</h1>
        <p className="text-harvics-gold/90">
          Live visibility of HARVICS warehouses, distribution corridors, and market activity by region.
        </p>
      </div>

      <AnimatedGlobalMap />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-8">
        <div className="bg-white border border-black200 p-6">
          <h2 className="text-lg font-semibold text-harvics-gold/90 mb-2">Coverage Intelligence</h2>
          <p className="text-sm text-harvics-gold/90">
            Review density clusters to prioritize route expansion, last-mile optimization, and new outlet planning.
          </p>
        </div>
        <div className="bg-white border border-black200 p-6">
          <h2 className="text-lg font-semibold text-harvics-gold/90 mb-2">Risk Hotspots</h2>
          <p className="text-sm text-harvics-gold/90">
            Compare weather, congestion, and demand volatility signals before dispatch and replenishment decisions.
          </p>
        </div>
        <div className="bg-white border border-black200 p-6">
          <h2 className="text-lg font-semibold text-harvics-gold/90 mb-2">Network Actions</h2>
          <p className="text-sm text-harvics-gold/90">
            Use map trends to rebalance inventory, adjust delivery windows, and improve territory execution outcomes.
          </p>
        </div>
      </section>
    </div>
  )
}
