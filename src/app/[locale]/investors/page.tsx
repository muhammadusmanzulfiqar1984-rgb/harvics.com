'use client';

import Image from 'next/image';
import Link from 'next/link';

const investorHighlights = [
  {
    title: 'Corridor-Led Scale',
    detail: 'Execution across Europe, GCC, and South Asia with operating focus in Czech Republic, Germany, Poland, Scandinavia, UAE, KSA, and Pakistan.',
  },
  {
    title: 'Institutional Operating Backbone',
    detail: 'HarvicsOS integrates 71 modules with board-grade reporting, controlled approvals, and AI decision support for long-horizon capital confidence.',
  },
  {
    title: 'Commercial Proof',
    detail: 'Demonstrated $700M+ track record through private label, strategic sourcing, and trade corridor execution in complex multi-jurisdiction markets.',
  },
];

export default function InvestorsPage() {
  return (
    <main className="min-h-screen bg-[#0e0e0e] pt-20">
      <section className="relative overflow-hidden">
        {/* Unsplash: executive financial district skyline */}
        <Image
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&h=1200&q=80"
          alt="European financial district skyline symbolizing investor-grade governance and growth"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(20,10,10,0.9)_15%,rgba(20,10,10,0.62)_55%,rgba(20,10,10,0.9)_100%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-[#D4A843]">Investor Relations</p>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white md:text-6xl">
            Institutional-Grade Visibility for Long-Term Partners
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/85 md:text-lg">
            Harvics Global Ventures is engineered for disciplined growth. We operate with sovereign-grade governance,
            corridor-level execution, and transparent performance controls designed for investors who assess durability,
            not narrative alone.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/en/investor-relations" className="bg-[#D4A843] px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#111]">
              Open Investor Briefing
            </Link>
            <Link href="/en/contact" className="border border-[#D4A843]/70 px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#D4A843]">
              Request Management Call
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {investorHighlights.map((item) => (
            <article key={item.title} className="border border-[#991B1B]/12 bg-[#fff] p-6">
              <h2 className="text-lg font-semibold text-[#991B1B]">{item.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#1f1f1f]/85">{item.detail}</p>
            </article>
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="max-w-4xl text-sm leading-relaxed text-[#1f1f1f]/85">
            Our strategic posture has been validated in high-trust institutional forums, including the EU-Pakistan Business Forum in Islamabad,
            where cross-border food-tech and trade resilience agendas require credible operators with repeatable execution discipline.
          </p>
        </div>
      </section>
    </main>
  );
}
