'use client';

import Image from 'next/image';
import Link from 'next/link';

const pillars = [
  {
    title: 'Unified Enterprise Command',
    body: 'HarvicsOS consolidates finance, procurement, logistics, HR, compliance, and executive reporting into one operating command layer so leadership can act without fragmentation.',
  },
  {
    title: '71-Module Execution Fabric',
    body: 'Our 71 modules are engineered as one governed architecture, not disconnected apps, enabling corridor-level execution across Czech Republic, Germany, Poland, Scandinavia, UAE, KSA, and Pakistan.',
  },
  {
    title: 'AI-Directed Commercial Velocity',
    body: 'We deploy AI procurement intelligence, demand sensing, and board-ready variance commentary to convert market signals into executable action in hours, not quarters.',
  },
];

const stats = [
  { label: 'Track Record', value: '$700M+' },
  { label: 'Operating Legacy', value: '20 Years' },
  { label: 'Industry Verticals', value: '10' },
  { label: 'Platform Modules', value: '71' },
];

export default function OSIndexPage() {
  return (
    <main className="min-h-screen bg-[#050505] pt-20">
      <section className="relative overflow-hidden">
        {/* Unsplash: modern data center architecture */}
        <Image
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2000&h=1200&q=80"
          alt="High-performance enterprise data infrastructure representing HarvicsOS architecture"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(10,10,10,0.88)_20%,rgba(10,10,10,0.62)_55%,rgba(10,10,10,0.84)_100%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-[#D4A843]">HarvicsOS</p>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white md:text-6xl">
            Sovereign Enterprise Operating System for Cross-Border Trade Execution
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/85 md:text-lg">
            We architect operational control for institutions that trade at scale. HarvicsOS fuses command visibility,
            governed decisioning, and AI-enabled throughput so boardrooms can move from insight to execution across EU,
            GCC, and South Asia without governance drift.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/en/os/tier0" className="bg-[#D4A843] px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#111]">
              Open Module Command
            </Link>
            <Link href="/en/contact" className="border border-[#D4A843]/70 px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#D4A843]">
              Request Executive Demo
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map((item) => (
            <div key={item.label} className="border border-[#991B1B]/10 bg-[#fff] px-5 py-6">
              <p className="text-3xl font-bold text-[#991B1B]">{item.value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#991B1B]/65">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f8f7f4] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-[#991B1B] md:text-4xl">Why HarvicsOS Is Different</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {pillars.map((item) => (
              <article key={item.title} className="border border-[#991B1B]/12 bg-white p-6">
                <h3 className="text-lg font-semibold text-[#991B1B]">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#1f1f1f]/85">{item.body}</p>
              </article>
            ))}
          </div>
          <p className="mt-9 max-w-4xl text-sm leading-relaxed text-[#1f1f1f]/85">
            Credibility is earned through repeatable outcomes. Our corridors have delivered private-label scale, AI-procurement
            acceleration, and governance-ready reporting for enterprise stakeholders and public-private forums, including the
            EU-Pakistan Business Forum in Islamabad.
          </p>
        </div>
      </section>
    </main>
  );
}
