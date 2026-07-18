'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, animate } from 'framer-motion';

type TabKey = 'process' | 'trust' | 'audience';

// ───── Animated number counter ─────
const CountUp: React.FC<{ value: string; duration?: number }> = ({ value, duration = 1.8 }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const mv = useMotionValue(0);

  const match = value.match(/^(\$)?([\d.]+)(.*)$/);
  const prefix = match?.[1] || '';
  const numeric = match ? parseFloat(match[2]) : 0;
  const suffix = match?.[3] || '';

  const rounded = useTransform(mv, latest => {
    if (numeric < 10 && numeric % 1 !== 0) return latest.toFixed(1);
    return Math.round(latest).toString();
  });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const unsub = rounded.on('change', v => setDisplay(v));
    return () => unsub();
  }, [rounded]);

  useEffect(() => {
    if (!inView || !match) return;
    const controls = animate(mv, numeric, { duration, ease: [0.2, 0.7, 0.2, 1] });
    return () => controls.stop();
  }, [inView, numeric, duration, mv, match]);

  if (!match) return <span ref={ref}>{value}</span>;
  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
};

// ───── Animated connector path between process cards ─────
const ProcessConnector: React.FC = () => (
  <div className="hidden md:block absolute top-[88px] left-0 right-0 h-[2px] pointer-events-none z-20">
    <svg width="100%" height="2" preserveAspectRatio="none" className="overflow-visible">
      <motion.line
        x1="16%" x2="84%" y1="1" y2="1"
        stroke="url(#opGoldGrad)" strokeWidth="1.5" strokeDasharray="4 6"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: 'easeInOut', delay: 0.4 }}
      />
      <defs>
        <linearGradient id="opGoldGrad" x1="0" x2="1">
          <stop offset="0" stopColor="var(--harvics-gold)" stopOpacity="0.2" />
          <stop offset="0.5" stopColor="var(--harvics-gold)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--harvics-gold)" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </svg>
    <motion.div
      className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
      style={{ background: 'var(--harvics-gold)', boxShadow: '0 0 14px #C3A35E, 0 0 28px rgba(195, 163, 94,0.4)' }}
      initial={{ left: '16%', opacity: 0 }}
      whileInView={{
        left: ['16%', '50%', '84%', '50%', '16%'],
        opacity: [0, 1, 1, 1, 0],
      }}
      viewport={{ once: false, amount: 0.4 }}
      transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity, delay: 2 }}
    />
  </div>
);

type OpModelTone = 'dark' | 'cream'

const OperatingModelSection: React.FC<{ tone?: OpModelTone }> = ({ tone = 'dark' }) => {
  const [tab, setTab] = useState<TabKey>('process');
  const isCream = tone === 'cream'

  const tabs: { key: TabKey; num: string; label: string }[] = [
    { key: 'process', num: '01', label: 'Process' },
    { key: 'trust', num: '02', label: 'Trust' },
    { key: 'audience', num: '03', label: 'For You' },
  ];

  return (
    <section
      className="w-full relative overflow-hidden py-16 px-6"
      style={{
        background: isCream
          ? 'var(--harvics-cream)'
          : 'radial-gradient(ellipse at 20% 0%, rgba(61, 18, 18,0.45) 0%, transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(195, 163, 94,0.18) 0%, transparent 50%), linear-gradient(160deg, #3D1212 0%, #120303 60%, #3D1212 100%)',
      }}
    >
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(195, 163, 94,1) 1px, transparent 1px), linear-gradient(90deg, rgba(195, 163, 94,1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-harvics-gold to-transparent" />

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* HEADER — Option B: left-aligned dashboard with metrics on right */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 md:gap-10 mb-8"
        >
          <div className="md:max-w-2xl">
            <span className="inline-flex items-center gap-2.5 text-[10px] tracking-[0.28em] uppercase text-harvics-gold font-semibold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-harvics-gold" />
              {isCream ? '07 · Operating model' : 'The HARVICS Operating Model'}
            </span>
            <h2
              className={`harvics-corridor-display ${isCream ? 'text-harvics-burgundy' : 'text-harvics-cream'} text-[clamp(28px,4.2vw,48px)]`}
            >
              Built like infrastructure.
              <br />
              <span className="text-harvics-gold font-medium">Sold like a service.</span>
            </h2>
            <p
              className={`harvics-corridor-body max-w-xl mt-3 ${isCream ? '' : '!text-harvics-cream/70'}`}
            >
              The system behind every shipment, every approval, every relationship — explained on your terms.
            </p>
          </div>
          <div
            className={`flex gap-8 md:gap-9 md:pl-6 md:border-l ${isCream ? 'md:border-harvics-gold/35' : 'md:border-harvics-gold/15'}`}
          >
            <div>
              <div className="text-harvics-gold text-[9px] tracking-[3px] uppercase font-bold mb-1.5">Stages</div>
              <div
                className={`${isCream ? 'text-harvics-burgundy' : 'text-harvics-cream'} text-2xl md:text-[26px] font-medium tabular-nums leading-none`}
              >
                14
              </div>
            </div>
            <div>
              <div className="text-harvics-gold text-[9px] tracking-[3px] uppercase font-bold mb-1.5">Markets</div>
              <div
                className={`${isCream ? 'text-harvics-burgundy' : 'text-harvics-cream'} text-2xl md:text-[26px] font-medium tabular-nums leading-none`}
              >
                42
              </div>
            </div>
            <div>
              <div className="text-harvics-gold text-[9px] tracking-[3px] uppercase font-bold mb-1.5">On-Time</div>
              <div
                className={`${isCream ? 'text-harvics-burgundy' : 'text-harvics-cream'} text-2xl md:text-[26px] font-medium tabular-nums leading-none`}
              >
                96%
              </div>
            </div>
          </div>
        </motion.div>

        {/* TABS */}
        <div className="flex justify-center mb-6">
          {tabs.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`relative px-6 md:px-8 py-4 text-[11px] tracking-[4px] uppercase font-semibold transition-colors ${
                tab === t.key
                  ? 'text-harvics-gold'
                  : isCream
                    ? 'text-harvics-burgundy/50 hover:text-harvics-gold'
                    : 'text-harvics-cream/50 hover:text-harvics-gold'
              }`}
            >
              <span className="text-[9px] opacity-50 font-normal mr-2">{t.num}</span>
              {t.label}
              {tab === t.key && (
                <motion.span
                  layoutId="op-tab-underline"
                  className="absolute -bottom-px left-0 right-0 h-[2px] bg-harvics-gold"
                  style={{ boxShadow: '0 0 10px rgba(195, 163, 94,0.6)' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* PANELS */}
        <div className="relative min-h-[480px]">
          <AnimatePresence mode="wait">
            {tab === 'process' && (
              <motion.div
                key="process"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="relative"
              >
                <ProcessConnector />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-harvics-gold/25 relative">
                  {[
                    {
                      num: '01',
                      title: 'Source',
                      sub: 'Tell us what you need',
                      body: 'Submit your product brief — category, volume, market, certifications. Our sourcing team identifies the right factories from our verified global network within 24 hours.',
                      tags: ['Product Spec', 'Volume', 'Market'],
                    },
                    {
                      num: '02',
                      title: 'Sample',
                      sub: 'Validate before you commit',
                      body: 'Physical samples with full lab reports — HACCP, Halal, ISO. Our QC team runs AQL inspections at source. You approve, we proceed. No surprises.',
                      tags: ['Physical Sample', 'Lab Reports', 'AQL'],
                    },
                    {
                      num: '03',
                      title: 'Ship',
                      sub: 'Door to door, tracked',
                      body: 'Full freight management — FCL, LCL, air, road. Customs documentation, Letters of Credit, HS code filing. Real-time container tracking until shelf.',
                      tags: ['FCL / LCL', 'Customs', 'Live Tracking'],
                    },
                  ].map((card, i) => (
                    <motion.div
                      key={card.num}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.55, delay: 0.15 + i * 0.15, ease: 'easeOut' }}
                      className="group relative bg-harvics-burgundy hover:bg-harvics-burgundy/90 transition-all duration-500 p-9 overflow-hidden cursor-default"
                    >
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(195, 163, 94,0.18) 0%, transparent 60%)' }}
                      />
                      <div className="relative">
                        <div className="text-[80px] font-thin text-harvics-gold/25 group-hover:text-harvics-gold/60 transition-colors duration-500 leading-none tracking-tighter select-none mb-4">
                          {card.num}
                        </div>
                        <h3 className="text-white text-xl font-light tracking-wide mb-1">{card.title}</h3>
                        <div className="text-harvics-gold text-[9px] font-semibold uppercase tracking-[4px] mb-5">
                          {card.sub}
                        </div>
                        <div className="w-8 h-px bg-harvics-gold mb-5 group-hover:w-16 transition-all duration-500" />
                        <p className="text-white/60 text-[13px] leading-[1.8] font-light mb-7">{card.body}</p>
                        <div className="flex flex-wrap gap-2">
                          {card.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 border border-harvics-gold/35 text-harvics-gold text-[9px] font-medium uppercase tracking-[2px] group-hover:border-harvics-gold/70 transition-colors duration-500"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {tab === 'trust' && (
              <motion.div
                key="trust"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-harvics-gold/25">
                  {[
                    { num: '50+', label: 'Countries', sub: 'Global Reach', body: 'Operating across six continents with direct supply chain access and local market intelligence.' },
                    { num: '100%', label: 'Tested', sub: 'Quality Assured', body: 'Every product passes ISO, HACCP, BRC and Halal multi-stage certification before dispatch.' },
                    { num: '72h', label: 'Transit', sub: 'Fast Logistics', body: 'Multi-modal freight — air, sea, road — with real-time container tracking and SLA guarantees.' },
                    { num: '24/7', label: 'Monitoring', sub: 'AI-Powered', body: 'Predictive demand forecasting and automated compliance checks running around the clock.' },
                    { num: '$1.2B+', label: 'Volume', sub: 'Trade Finance', body: 'Letters of credit, escrow, and HPAY digital settlements enabling seamless cross-border trade.' },
                    { num: '10', label: 'Verticals', sub: 'Multi-Industry', body: 'FMCG to Oil & Gas, Real Estate to AI — one commercial engine powering every sector.' },
                    { num: '200+', label: 'Specialists', sub: 'Dedicated Teams', body: 'Category experts, compliance officers, and field agents embedded in every market we serve.' },
                    { num: '190+', label: 'Jurisdictions', sub: 'Full Compliance', body: 'Sanctions checks, AML controls, and regulatory filing across every country we operate in.' },
                  ].map((cell, i) => (
                    <motion.div
                      key={cell.label}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.06, ease: 'easeOut' }}
                      className="group relative bg-harvics-burgundy hover:bg-harvics-burgundy/90 transition-all duration-500 p-7 overflow-hidden"
                    >
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(195, 163, 94,0.15) 0%, transparent 60%)' }}
                      />
                      <div className="relative">
                        <div className="text-[44px] font-extralight text-harvics-gold leading-none tracking-tight mb-3">
                          <CountUp value={cell.num} />
                        </div>
                        <div className="text-white text-[13px] font-normal mb-1">{cell.label}</div>
                        <div className="text-harvics-gold text-[9px] tracking-[3px] uppercase mb-4 font-semibold">{cell.sub}</div>
                        <div className="w-6 h-px bg-harvics-gold/50 mb-4 group-hover:w-12 transition-all duration-500" />
                        <p className="text-white/55 text-[12px] leading-[1.7] font-light">{cell.body}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-10 pt-9 border-t border-harvics-gold/15 flex flex-wrap justify-center gap-3.5">
                  {['HACCP', 'ISO 22000', 'Halal Certified', 'SGS Audited', 'BSCI Compliant', 'Sedex Member'].map((c, i) => (
                    <motion.span
                      key={c}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.4 + i * 0.06 }}
                      className="px-4 py-2 border border-harvics-gold/40 text-harvics-gold text-[10px] tracking-[3px] uppercase font-medium hover:border-harvics-gold hover:bg-harvics-gold/5 transition-colors"
                    >
                      {c}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {tab === 'audience' && (
              <motion.div
                key="audience"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-harvics-gold/25">
                  {[
                    {
                      letter: 'B',
                      title: 'For Buyers',
                      tag: 'Retail · HORECA · Wholesale',
                      body: 'Source verified product at scale with transparent pricing, full compliance, and one accountable partner across categories.',
                      cta: 'Start a brief →',
                      href: '/contact',
                    },
                    {
                      letter: 'D',
                      title: 'For Distributors',
                      tag: 'Territory · Exclusive · Multi-SKU',
                      body: 'Territory rights, marketing support, and inventory financing for partners ready to own a market with our brands.',
                      cta: 'Apply for territory →',
                      href: '/distributor',
                    },
                    {
                      letter: 'I',
                      title: 'For Investors',
                      tag: 'Equity · Trade Finance · JV',
                      body: 'Vertical-specific opportunities across food, FMCG, and infrastructure — backed by 20 years of operating data.',
                      cta: 'Investor portal →',
                      href: '/investor-relations',
                    },
                  ].map((card, i) => (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.55, delay: 0.15 + i * 0.15, ease: 'easeOut' }}
                      className="group relative bg-harvics-burgundy hover:bg-harvics-burgundy/90 transition-all duration-500 p-10 flex flex-col overflow-hidden cursor-pointer"
                    >
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(195, 163, 94,0.18) 0%, transparent 60%)' }}
                      />
                      <div className="relative flex flex-col flex-1">
                        <div className="w-11 h-11 border border-harvics-gold text-harvics-gold flex items-center justify-center text-lg mb-6 group-hover:bg-harvics-gold/10 transition-colors duration-500">
                          {card.letter}
                        </div>
                        <h3 className="text-white text-xl font-light mb-1">{card.title}</h3>
                        <div className="text-harvics-gold text-[9px] font-semibold uppercase tracking-[4px] mb-4">
                          {card.tag}
                        </div>
                        <p className="text-white/60 text-[13px] leading-[1.8] font-light mb-6 flex-1">
                          {card.body}
                        </p>
                        <a
                          href={card.href}
                          className="text-harvics-gold text-[11px] tracking-[3px] uppercase font-semibold border-b border-harvics-gold pb-1 self-start hover:tracking-[5px] transition-all duration-300"
                        >
                          {card.cta}
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default OperatingModelSection;
