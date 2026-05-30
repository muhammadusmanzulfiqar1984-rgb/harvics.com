'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// ───── 9 HARVICS hubs (positioned on a 1200×620 canvas) ─────
const HUBS = [
  { id: 'newyork',   city: 'New York',   role: 'Trade Office',  x: 285,  y: 235, isHQ: false },
  { id: 'london',    city: 'London',     role: 'Headquarters',  x: 565,  y: 200, isHQ: true  },
  { id: 'milan',     city: 'Milan',      role: 'Procurement',   x: 600,  y: 225, isHQ: false },
  { id: 'istanbul',  city: 'Istanbul',   role: 'Trade Gateway', x: 655,  y: 235, isHQ: false },
  { id: 'cairo',     city: 'Cairo',      role: 'Africa Hub',    x: 645,  y: 295, isHQ: false },
  { id: 'lagos',     city: 'Lagos',      role: 'West Africa',   x: 555,  y: 345, isHQ: false },
  { id: 'dubai',     city: 'Dubai',      role: 'Regional Hub',  x: 720,  y: 290, isHQ: false },
  { id: 'karachi',   city: 'Karachi',    role: 'Sourcing Hub',  x: 765,  y: 275, isHQ: false },
  { id: 'singapore', city: 'Singapore',  role: 'Asia Hub',      x: 895,  y: 350, isHQ: false },
];

// Dense route network (flights = air, ships = sea)
const FLIGHTS: { from: number; to: number; dur: number; delay: number }[] = [
  { from: 1, to: 0, dur: 9,  delay: 0   },
  { from: 1, to: 6, dur: 8,  delay: 1.2 },
  { from: 6, to: 8, dur: 7,  delay: 2.4 },
  { from: 1, to: 7, dur: 10, delay: 0.6 },
  { from: 3, to: 4, dur: 5,  delay: 1.8 },
  { from: 2, to: 6, dur: 7,  delay: 3.0 },
  { from: 1, to: 5, dur: 8,  delay: 4.2 },
  { from: 0, to: 1, dur: 9,  delay: 5.4 },
  { from: 6, to: 4, dur: 6,  delay: 2.7 },
  { from: 7, to: 8, dur: 8,  delay: 3.6 },
];

const SHIPS: { from: number; to: number; dur: number; delay: number }[] = [
  { from: 7, to: 8, dur: 18, delay: 0   },
  { from: 6, to: 5, dur: 22, delay: 3   },
  { from: 4, to: 5, dur: 16, delay: 6   },
  { from: 8, to: 7, dur: 18, delay: 9   },
  { from: 0, to: 1, dur: 24, delay: 2   },
  { from: 1, to: 0, dur: 24, delay: 14  },
  { from: 7, to: 6, dur: 14, delay: 5   },
];

const TICKER = [
  '47 TEU cement · Karachi → Dar es Salaam · DEPARTED',
  '220 MT durum wheat · Toronto → Casablanca · INSPECTION PASSED',
  '1.8M USD LC issued · Dubai → Lagos · APPROVED',
  '8 containers fusilli · Istanbul → Riyadh · IN TRANSIT',
  '12 reefer units · Singapore → Mombasa · LOADED',
  '300 MT urea · Karachi → Hamburg · BL RELEASED',
  '4 air pallets pharma · London → Nairobi · CUSTOMS CLEARED',
  '60 TEU steel · Istanbul → Doha · AT PORT',
  '180 MT rice · Karachi → Jeddah · LOADING',
  '95 TEU textile · Karachi → Rotterdam · AT SEA',
];

// ───── Geometry helpers ─────
const airArc = (a: typeof HUBS[number], b: typeof HUBS[number]) => {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 - Math.abs(b.x - a.x) * 0.32 - 20;
  return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
};
const seaArc = (a: typeof HUBS[number], b: typeof HUBS[number]) => {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 + Math.abs(b.x - a.x) * 0.16 + 12;
  return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
};

// ───── Dot-grid world background ─────
// Simple boolean grid: 1 = land dot, 0 = ocean. 60×30 cells covering the major continents.
const LAND_MAP: string[] = [
  '............................................................',
  '...........XXXXXX......XXXXXXX.....X.........XXXXXX.........',
  '...XXXXXXXXXXXXXXXX..XXXXXXXXXXXXXXX.XXXXX.XXXXXXXXXX.......',
  '...XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX...XX.',
  '....XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX...XX.',
  '....XXXXXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX..XXX.',
  '......XXXXXXXXXX.....XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX....X..',
  '........XXXXXX........XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.......',
  '.........XX.........XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.........',
  '..........X.........XXXXXXXXXXXX.XXXXXXXXXXXXXX............',
  '....................XXXXXXXXXX...XXXXXXXXXXX..............',
  '.....................XXXXXXX......XXXXXXXX................',
  '.....................XXXXX........XXXXXXX................',
  '......................XXX..........XXXXXX................',
  '.......................X............XXXXX................',
  '.......................X............XXXX.................',
  '......................X.............XXXX.................',
  '.....................X..............XXX..................',
  '....................X................X...................',
  '............................................................',
];

const CinematicTradeMap: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setTick(x => (x + 1) % TICKER.length), 2400);
    return () => clearInterval(t);
  }, [visible]);

  // Pre-compute dot grid positions
  const dots = useMemo(() => {
    const W = 1200, H = 620;
    const cols = LAND_MAP[0].length;
    const rows = LAND_MAP.length;
    const stepX = W / cols;
    const stepY = (H - 100) / rows;
    const offsetY = 80;
    const out: { x: number; y: number; on: boolean }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        out.push({
          x: c * stepX + stepX / 2,
          y: r * stepY + offsetY,
          on: LAND_MAP[r][c] === 'X',
        });
      }
    }
    return out;
  }, []);

  // Counters
  const [shipments, setShipments] = useState(0);
  const [countries, setCountries] = useState(0);
  const [teu, setTeu] = useState(0);
  useEffect(() => {
    if (!visible) return;
    const start = performance.now();
    let raf = 0;
    const animateCounters = (t: number) => {
      const p = Math.min((t - start) / 1800, 1);
      setShipments(Math.floor(1247 * p));
      setCountries(Math.floor(38 * p));
      setTeu(Math.floor(12400 * p));
      if (p < 1) raf = requestAnimationFrame(animateCounters);
    };
    raf = requestAnimationFrame(animateCounters);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  // Drift the live shipment counter to feel "live"
  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setShipments(s => s + Math.floor(Math.random() * 3) - 1), 2000);
    return () => clearInterval(t);
  }, [visible]);

  return (
    <section
      ref={ref}
      className="w-full relative overflow-hidden py-16 px-4"
      style={{
        background:
          'radial-gradient(ellipse at 25% 0%, rgba(107,31,43,0.6) 0%, transparent 50%), radial-gradient(ellipse at 85% 100%, rgba(195,163,94,0.22) 0%, transparent 50%), linear-gradient(180deg, #06020a 0%, #0f0408 60%, #06020a 100%)',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C3A35E] to-transparent" />

      <div className="max-w-[1380px] mx-auto relative z-10">
        {/* HEADER — Option B: left-aligned dashboard with live stats on right */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 md:gap-10 pb-6 border-b border-[#C3A35E]/20 mb-8">
          <div className="md:max-w-2xl">
            <span className="inline-flex items-center gap-2.5 text-[10px] tracking-[5px] uppercase text-[#E5C07B] font-semibold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5C07B] animate-pulse" />
              Live · Global Trade Network
            </span>
            <h2 className="text-white text-3xl md:text-5xl font-extralight tracking-tight leading-[1.05]">
              Watch HARVICS
              <span className="text-[#E5C07B] font-normal"> move.</span>
            </h2>
            <p className="text-white/55 text-[13px] max-w-xl mt-3 font-light leading-relaxed">
              9 offices · 42+ markets · Every 14 minutes, a HARVICS shipment clears customs somewhere in the world.
            </p>
          </div>
          <div className="flex gap-8 md:gap-9 md:pl-6 md:border-l md:border-[#C3A35E]/15">
            <div>
              <div className="text-[#E5C07B] text-[9px] tracking-[3px] uppercase font-bold mb-1.5">Shipments</div>
              <div className="text-white text-2xl md:text-[26px] font-extralight tabular-nums leading-none">{shipments.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[#E5C07B] text-[9px] tracking-[3px] uppercase font-bold mb-1.5">Countries</div>
              <div className="text-white text-2xl md:text-[26px] font-extralight tabular-nums leading-none">{countries}</div>
            </div>
            <div>
              <div className="text-[#E5C07B] text-[9px] tracking-[3px] uppercase font-bold mb-1.5">TEU in Transit</div>
              <div className="text-white text-2xl md:text-[26px] font-extralight tabular-nums leading-none">{teu.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* ───── COMMAND CENTER ───── */}
        <div className="relative bg-[#06020a] border border-[#C3A35E]/25 overflow-hidden">
          {/* Top status strip */}
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-[#C3A35E]/20 bg-black/30">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5C07B] animate-pulse" />
              <span className="text-[#E5C07B] text-[9px] tracking-[3px] uppercase font-bold">Live · UTC</span>
              <span className="text-white/30 text-[9px] tracking-[2px]">|</span>
              <span className="text-white/60 text-[9px] tracking-[2px] uppercase">
                {HUBS.length} Hubs · {FLIGHTS.length + SHIPS.length} Active Routes
              </span>
            </div>
            <div className="text-white/40 text-[9px] tracking-[3px] uppercase font-semibold">
              Auto-refresh · 2s
            </div>
          </div>

          {/* MAP CANVAS */}
          <div className="relative">
            <svg viewBox="0 0 1200 620" className="w-full block">
              <defs>
                <radialGradient id="ctmHubGlow" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0" stopColor="#E5C07B" stopOpacity="0.95" />
                  <stop offset="0.5" stopColor="#C3A35E" stopOpacity="0.3" />
                  <stop offset="1" stopColor="#C3A35E" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="ctmAirGrad" x1="0" x2="1">
                  <stop offset="0" stopColor="#E5C07B" stopOpacity="0" />
                  <stop offset="0.5" stopColor="#E5C07B" stopOpacity="0.9" />
                  <stop offset="1" stopColor="#E5C07B" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="ctmSeaGrad" x1="0" x2="1">
                  <stop offset="0" stopColor="#C3A35E" stopOpacity="0" />
                  <stop offset="0.5" stopColor="#C3A35E" stopOpacity="0.55" />
                  <stop offset="1" stopColor="#C3A35E" stopOpacity="0" />
                </linearGradient>
                <filter id="ctmGlow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="2.5" />
                </filter>
                <filter id="ctmBigGlow" x="-200%" y="-200%" width="500%" height="500%">
                  <feGaussianBlur stdDeviation="5" />
                </filter>

                <symbol id="ctmPlane" viewBox="-12 -12 24 24">
                  <path d="M0,-10 L2,-3 L12,0 L2,2 L1,10 L-1,10 L-2,2 L-12,0 L-2,-3 Z" fill="#FFE9B2" stroke="#fff" strokeWidth="0.6" />
                </symbol>
                <symbol id="ctmShip" viewBox="-14 -7 28 14">
                  <path d="M-12,-1 L12,-1 L9,4 L-9,4 Z M-2,-1 L-2,-6 L5,-6 L5,-1 Z" fill="#E5C07B" stroke="#fff" strokeWidth="0.4" />
                </symbol>
              </defs>

              {/* Background subtle vignette */}
              <rect width="1200" height="620" fill="#06020a" />

              {/* Latitude grid lines */}
              {[120, 220, 320, 420, 520].map(y => (
                <line key={y} x1="0" x2="1200" y1={y} y2={y} stroke="rgba(195,163,94,0.05)" strokeDasharray="2 6" />
              ))}
              {[200, 400, 600, 800, 1000].map(x => (
                <line key={x} x1={x} x2={x} y1="60" y2="560" stroke="rgba(195,163,94,0.05)" strokeDasharray="2 6" />
              ))}

              {/* Dotted land grid */}
              <g>
                {dots.map((d, i) =>
                  d.on ? (
                    <circle
                      key={i}
                      cx={d.x}
                      cy={d.y}
                      r="1.6"
                      fill="#C3A35E"
                      opacity={visible ? 0.55 : 0}
                      style={{ transition: `opacity 0.8s ease ${(i % 30) * 0.015}s` }}
                    />
                  ) : null
                )}
              </g>

              {/* Ship routes (behind flights) */}
              {SHIPS.map((r, i) => {
                const a = HUBS[r.from], b = HUBS[r.to];
                const d = seaArc(a, b);
                return (
                  <g key={`sh-${i}`}>
                    <motion.path
                      d={d}
                      fill="none"
                      stroke="url(#ctmSeaGrad)"
                      strokeWidth="1"
                      strokeDasharray="1 5"
                      initial={{ pathLength: 0 }}
                      animate={visible ? { pathLength: 1 } : {}}
                      transition={{ duration: 1.5, delay: 0.2 + i * 0.1 }}
                    />
                    {visible && (
                      <use href="#ctmShip" width="16" height="8" filter="url(#ctmGlow)">
                        <animateMotion dur={`${r.dur}s`} repeatCount="indefinite" rotate="auto" begin={`${r.delay}s`} path={d} />
                      </use>
                    )}
                  </g>
                );
              })}

              {/* Flight routes */}
              {FLIGHTS.map((r, i) => {
                const a = HUBS[r.from], b = HUBS[r.to];
                const d = airArc(a, b);
                return (
                  <g key={`fl-${i}`}>
                    <motion.path
                      d={d}
                      fill="none"
                      stroke="url(#ctmAirGrad)"
                      strokeWidth="1.4"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={visible ? { pathLength: 1, opacity: 1 } : {}}
                      transition={{ duration: 1.6, delay: 0.4 + i * 0.12 }}
                    />
                    {/* Pulse trail dot */}
                    {visible && (
                      <>
                        <circle r="2.2" fill="#FFE9B2" filter="url(#ctmBigGlow)">
                          <animateMotion dur={`${r.dur}s`} repeatCount="indefinite" begin={`${r.delay}s`} path={d} />
                        </circle>
                        <use href="#ctmPlane" width="18" height="18" filter="url(#ctmGlow)">
                          <animateMotion dur={`${r.dur}s`} repeatCount="indefinite" rotate="auto" begin={`${r.delay}s`} path={d} />
                        </use>
                      </>
                    )}
                  </g>
                );
              })}

              {/* Hubs */}
              {HUBS.map((h, i) => (
                <g key={h.id} style={{ opacity: visible ? 1 : 0, transition: `opacity 0.5s ease ${0.3 + i * 0.05}s` }}>
                  {/* Outer pulsing rings */}
                  <circle cx={h.x} cy={h.y} r={h.isHQ ? 22 : 18} fill="url(#ctmHubGlow)">
                    <animate attributeName="r" values={`${h.isHQ ? 18 : 14};${h.isHQ ? 30 : 24};${h.isHQ ? 18 : 14}`} dur="2.6s" repeatCount="indefinite" begin={`${i * 0.18}s`} />
                    <animate attributeName="opacity" values="0.85;0.1;0.85" dur="2.6s" repeatCount="indefinite" begin={`${i * 0.18}s`} />
                  </circle>
                  {/* Concentric ring */}
                  <circle cx={h.x} cy={h.y} r={h.isHQ ? 12 : 9} fill="none" stroke="#E5C07B" strokeWidth="0.8" opacity="0.55">
                    <animate attributeName="r" values={`${h.isHQ ? 10 : 7};${h.isHQ ? 24 : 20}`} dur="2.2s" repeatCount="indefinite" begin={`${i * 0.15}s`} />
                    <animate attributeName="opacity" values="0.7;0" dur="2.2s" repeatCount="indefinite" begin={`${i * 0.15}s`} />
                  </circle>
                  {/* Core */}
                  <circle cx={h.x} cy={h.y} r={h.isHQ ? 5 : 3.5} fill="#FFE9B2" filter="url(#ctmGlow)" />
                  <circle cx={h.x} cy={h.y} r={h.isHQ ? 2.8 : 1.8} fill="#fff" />
                  {/* Label */}
                  <text
                    x={h.x + (h.x > 700 ? -9 : 9)}
                    y={h.y - 8}
                    fill="#E5C07B"
                    fontSize="10.5"
                    fontWeight="700"
                    textAnchor={h.x > 700 ? 'end' : 'start'}
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '0.08em' }}
                  >
                    {h.city.toUpperCase()}
                  </text>
                  <text
                    x={h.x + (h.x > 700 ? -9 : 9)}
                    y={h.y + 4}
                    fill="rgba(255,255,255,0.45)"
                    fontSize="7.5"
                    textAnchor={h.x > 700 ? 'end' : 'start'}
                    style={{ fontFamily: '-apple-system, sans-serif', letterSpacing: '0.18em', textTransform: 'uppercase' }}
                  >
                    {h.role}
                  </text>
                  {h.isHQ && (
                    <g>
                      <rect x={h.x - 12} y={h.y + 9} width="24" height="11" fill="#E5C07B" />
                      <text x={h.x} y={h.y + 17} fill="#1a0608" fontSize="7" fontWeight="800" textAnchor="middle" style={{ letterSpacing: '0.18em' }}>HQ</text>
                    </g>
                  )}
                </g>
              ))}

              {/* Scan-line sweep */}
              <motion.line
                x1="0" x2="0" y1="60" y2="560"
                stroke="rgba(229,192,123,0.25)"
                strokeWidth="1"
                initial={{ x1: 0, x2: 0 }}
                animate={visible ? { x1: [0, 1200], x2: [0, 1200] } : {}}
                transition={{ duration: 6, ease: 'linear', repeat: Infinity, repeatDelay: 4 }}
              />
            </svg>

            {/* Corner readouts */}
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm border border-[#C3A35E]/30 px-3 py-2 font-mono">
              <div className="text-[8px] tracking-[3px] uppercase text-white/40 mb-1">Network Load</div>
              <div className="flex items-center gap-2">
                <div className="h-1 w-20 bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={visible ? { width: ['18%', '92%', '54%', '78%', '38%', '88%'] } : {}}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    className="h-full bg-[#E5C07B]"
                  />
                </div>
                <span className="text-[#E5C07B] text-[10px] tabular-nums">OK</span>
              </div>
            </div>
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm border border-[#C3A35E]/30 px-3 py-2 font-mono">
              <div className="flex items-center gap-3">
                <span className="text-white/40 text-[8px] tracking-[3px] uppercase">AIR</span>
                <span className="text-[#E5C07B] text-[10px] font-bold">{FLIGHTS.length}</span>
                <span className="text-white/20">|</span>
                <span className="text-white/40 text-[8px] tracking-[3px] uppercase">SEA</span>
                <span className="text-[#E5C07B] text-[10px] font-bold">{SHIPS.length}</span>
              </div>
            </div>
          </div>

          {/* TICKER */}
          <div className="bg-black/60 border-t border-[#C3A35E]/25 px-5 py-3 flex items-center gap-4">
            <span className="text-[#E5C07B] text-[9px] tracking-[3px] uppercase font-bold shrink-0">
              ► Trade Pulse
            </span>
            <div className="flex-1 overflow-hidden relative h-5">
              <motion.div
                key={tick}
                initial={{ y: 22, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -22, opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="absolute inset-0 text-white/85 text-[12px] font-mono tabular-nums truncate"
              >
                {TICKER[tick]}
              </motion.div>
            </div>
            <span className="text-white/30 text-[10px] font-mono tabular-nums shrink-0">
              {String(tick + 1).padStart(2, '0')}/{String(TICKER.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CinematicTradeMap;
