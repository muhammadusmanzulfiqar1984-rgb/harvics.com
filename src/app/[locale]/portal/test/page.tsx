import Link from 'next/link'

export default function TestPortalPage() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 bg-[#6B1F2B] flex items-center justify-center mx-auto mb-8">
          <span className="text-3xl text-white">✓</span>
        </div>
        <h1 className="text-3xl font-bold text-[#6B1F2B] mb-3" style={{ letterSpacing: '-0.03em' }}>Portal Routing Active</h1>
        <p className="text-[#6B1F2B]/60 mb-8">The portal system is online. Select your portal below to continue.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/en/portal/distributor" className="px-6 py-3 bg-[#6B1F2B] text-white text-sm font-semibold hover:bg-[#5a1a24] transition-colors">Distributor Portal</Link>
          <Link href="/en/portal/supplier" className="px-6 py-3 border border-[#6B1F2B] text-[#6B1F2B] text-sm font-semibold hover:bg-[#6B1F2B] hover:text-white transition-colors">Supplier Portal</Link>
          <Link href="/en/login" className="px-6 py-3 border border-[#C3A35E] text-[#C3A35E] text-sm font-semibold hover:bg-[#C3A35E] hover:text-white transition-colors">Sign In</Link>
        </div>
      </div>
    </div>
  )
}

