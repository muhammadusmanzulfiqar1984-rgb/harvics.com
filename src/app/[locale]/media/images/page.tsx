// Header and Footer are provided by layout.tsx - DO NOT import them here
import Link from 'next/link'
import type { Metadata } from 'next'
import { generateLocalizedMetadata } from '@/lib/seo'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateLocalizedMetadata(locale, 'media')
}

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

interface ImagesPageProps {
  params: Promise<{ locale: string }>
}

export default async function ImagesPage({ params }: ImagesPageProps) {
  const { locale } = await params

  const assetCategories = [
    { icon: '🏷️', title: 'Brand Logos', desc: 'Harvics Trading House logo in SVG, PNG, and EPS formats. Full-colour, mono, reversed, and icon-only variants.', count: '12 assets' },
    { icon: '📐', title: 'Brand Guidelines', desc: 'Complete visual identity manual — colour palette, typography, spacing rules, and usage do\'s and don\'ts.', count: '1 document' },
    { icon: '👤', title: 'Executive Photography', desc: 'Professional headshots and portraits of the Harvics leadership team for editorial and press use.', count: '4 images' },
    { icon: '🏢', title: 'Office & Operations', desc: 'High-resolution photography of our Dubai headquarters, London office, and warehouse operations.', count: '18 images' },
    { icon: '📦', title: 'Product Photography', desc: 'Studio-quality images of FMCG, textiles, commodities, and industrial products across all verticals.', count: '200+ images' },
    { icon: '🌍', title: 'Global Operations', desc: 'Documentary-style photography from our operations across the Middle East, Europe, South Asia, and Africa.', count: '35 images' },
  ]

  return (
    <main className="min-h-screen pt-[136px]" style={{ background: '#ffffff' }}>
      {/* Hero */}
      <section className="relative bg-[#6B1F2B] py-20 px-4 border-b border-[#C3A35E]/40 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(107,31,43,0.95) 0%, rgba(90,26,36,0.9) 100%)' }} />
        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.2em] mb-3">Media</div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Media Gallery & Brand Assets
          </h1>
          <p className="text-lg text-white/60 max-w-[600px] mx-auto leading-relaxed">
            Download high-resolution imagery, logos, and brand materials for press and editorial use.
          </p>
        </div>
      </section>

      {/* Asset Categories */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assetCategories.map((cat) => (
            <div key={cat.title} className="bg-white border border-[#C3A35E]/15 p-8 flex flex-col">
              <div className="text-3xl mb-4">{cat.icon}</div>
              <h3 className="text-lg font-semibold text-[#6B1F2B] mb-2">{cat.title}</h3>
              <p className="text-sm text-[#6B1F2B]/55 leading-relaxed mb-4 flex-1">{cat.desc}</p>
              <div className="flex items-center justify-between pt-4 border-t border-[#C3A35E]/10">
                <span className="text-xs text-[#C3A35E] font-bold uppercase tracking-wider">{cat.count}</span>
                <span className="text-xs text-[#6B1F2B]/40">Request access →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Usage Terms */}
      <section className="bg-white border-t border-[#C3A35E]/20">
        <div className="max-w-[800px] mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-semibold text-[#6B1F2B] mb-4">Usage Terms</h2>
          <p className="text-sm text-[#6B1F2B]/55 leading-relaxed mb-8">
            All media assets are provided for editorial and press use only. Commercial use requires written authorisation from Harvics Global Ventures. Assets must not be altered, cropped to remove watermarks, or used in any way that misrepresents the company.
          </p>
          <a href="mailto:media@harvics.com"
            className="inline-block px-8 py-3 bg-[#6B1F2B] text-white text-sm font-bold hover:bg-[#5a1a24] transition-colors">
            Request Media Kit — media@harvics.com
          </a>
        </div>
      </section>
    </main>
  )
}

