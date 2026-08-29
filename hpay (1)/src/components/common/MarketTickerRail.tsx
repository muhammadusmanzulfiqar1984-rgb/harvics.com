import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, ChevronRight, Radio, TrendingDown, TrendingUp, X } from 'lucide-react';
import { LiveFigure } from './LiveFigure';
import { fetchCryptoBoard, type CryptoBoardRow } from '../../services/hpayApi';

const BOARD_SYMBOLS = 'BTC,ETH,SOL,XRP,BNB,DOGE';
const STORAGE_KEY = 'hpay_market_ticker_open';

type HistoryMap = Record<string, number[]>;

function formatCompact(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(n);
}

function priceDecimals(price: number | null) {
  if (price == null) return 2;
  if (price < 1) return 4;
  if (price < 100) return 3;
  return 2;
}

const Spark: React.FC<{ points: number[]; up: boolean }> = ({ points, up }) => {
  const path = useMemo(() => {
    if (!points.length) return '';
    const min = Math.min(...points);
    const max = Math.max(...points);
    const span = max - min || 1;
    const w = 64;
    const h = 22;
    return points
      .map((p, i) => {
        const x = (i / Math.max(points.length - 1, 1)) * w;
        const y = h - ((p - min) / span) * h;
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [points]);

  if (!path) {
    return <div className="h-[22px] w-16 rounded bg-[#2A151C]/60" />;
  }

  return (
    <svg width="64" height="22" viewBox="0 0 64 22" className="overflow-visible" aria-hidden>
      <path
        d={path}
        fill="none"
        stroke={up ? '#34D399' : '#FB7185'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.9}
      />
    </svg>
  );
};

const TapeItem: React.FC<{ row: CryptoBoardRow }> = ({ row }) => {
  const up = (row.change24h ?? 0) >= 0;
  const price = row.price ?? 0;
  return (
    <span className="inline-flex items-center gap-2 px-4 font-mono text-[11px] tracking-tight whitespace-nowrap">
      <span className="font-semibold text-[#E8DCC4]">{row.symbol}</span>
      <span className="tabular-nums text-[#F5EFE6]">
        ${price.toLocaleString('en-US', {
          minimumFractionDigits: priceDecimals(price),
          maximumFractionDigits: priceDecimals(price),
        })}
      </span>
      <span className={`tabular-nums ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
        {up ? '+' : ''}
        {(row.change24h ?? 0).toFixed(2)}%
      </span>
      <span className="text-[#5C3A42]">·</span>
    </span>
  );
};

export const MarketTickerRail: React.FC = () => {
  const [open, setOpen] = useState(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v == null ? true : v === '1';
    } catch {
      return true;
    }
  });
  const [rows, setRows] = useState<CryptoBoardRow[]>([]);
  const [mode, setMode] = useState<string>('idle');
  const [asOf, setAsOf] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryMap>({});
  const [selected, setSelected] = useState<string>('BTC');
  const [pulse, setPulse] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, open ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [open]);

  useEffect(() => {
    mounted.current = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    const pull = async () => {
      try {
        const data = await fetchCryptoBoard(BOARD_SYMBOLS);
        if (!mounted.current || !data?.rows?.length) return;
        setRows(data.rows);
        setMode(data.mode || 'live');
        setAsOf(data.as_of || new Date().toISOString());
        setPulse(true);
        window.setTimeout(() => setPulse(false), 400);
        setHistory((prev) => {
          const next: HistoryMap = { ...prev };
          for (const row of data.rows) {
            if (row.price == null) continue;
            const series = [...(next[row.symbol] || []), row.price].slice(-28);
            next[row.symbol] = series;
          }
          return next;
        });
      } catch {
        /* keep last board */
      }
    };

    void pull();
    timer = setInterval(pull, 20_000);
    return () => {
      mounted.current = false;
      if (timer) clearInterval(timer);
    };
  }, []);

  const active = rows.find((r) => r.symbol === selected) || rows[0];
  const tapeRows = rows.length ? [...rows, ...rows] : [];

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden xl:flex h-full w-10 shrink-0 flex-col items-center justify-start gap-3 border-l border-[#33171E] bg-[#140A0E] pt-5 text-[#C5B5A5] transition hover:bg-[#1C0F14] hover:text-[#E8DCC4]"
        title="Open market tape"
        aria-label="Open market tape"
      >
        <ChevronRight className="h-4 w-4 rotate-180" />
        <span
          className="mt-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#A89887]"
          style={{ writingMode: 'vertical-rl' }}
        >
          Market Tape
        </span>
        <Activity className="mt-auto mb-6 h-4 w-4 text-[#800020]" />
      </button>
    );
  }

  return (
    <aside className="hidden xl:flex h-full w-[300px] shrink-0 flex-col border-l border-[#33171E] bg-[#12090B] select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2B141B] px-4 py-3.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${
                  pulse ? 'animate-ping' : ''
                }`}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#E8DCC4]">
              Market Tape
            </p>
          </div>
          <p className="mt-0.5 truncate text-[10px] text-[#8A7468]">
            {mode === 'live' ? 'LIVE · RapidAPI + spot' : 'STANDBY'}
            {asOf ? ` · ${new Date(asOf).toLocaleTimeString()}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg p-1.5 text-[#8A7468] transition hover:bg-[#261318] hover:text-[#E8DCC4]"
          aria-label="Collapse market tape"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrolling tape */}
      <div className="relative overflow-hidden border-b border-[#2B141B] bg-[#0E0709] py-2.5">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#0E0709] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#0E0709] to-transparent" />
        {tapeRows.length > 0 ? (
          <div className="hpay-ticker-marquee flex w-max">
            {tapeRows.map((row, i) => (
              <TapeItem key={`${row.symbol}-${i}`} row={row} />
            ))}
          </div>
        ) : (
          <p className="px-4 font-mono text-[11px] text-[#8A7468]">Waiting for session quote feed…</p>
        )}
      </div>

      {/* Focus quote */}
      {active && (
        <div className="border-b border-[#2B141B] bg-gradient-to-b from-[#1A0E12] to-[#12090B] px-4 py-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A89887]">
                Spot · USD
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-[#F5EFE6]">
                {active.symbol}
                <span className="ml-2 text-sm font-normal text-[#8A7468]">/USD</span>
              </p>
            </div>
            {(active.change24h ?? 0) >= 0 ? (
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            ) : (
              <TrendingDown className="h-5 w-5 text-rose-400" />
            )}
          </div>
          <div className="mt-3 flex items-end justify-between gap-3">
            <LiveFigure
              value={active.price ?? 0}
              prefix="$"
              decimals={priceDecimals(active.price)}
              className="text-[1.65rem] font-semibold tracking-tight text-[#F5EFE6] font-mono"
            />
            <span
              className={`rounded-md px-2 py-1 font-mono text-[11px] font-semibold tabular-nums ${
                (active.change24h ?? 0) >= 0
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-rose-500/15 text-rose-400'
              }`}
            >
              {(active.change24h ?? 0) >= 0 ? '+' : ''}
              {(active.change24h ?? 0).toFixed(2)}%
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-[10px]">
            <div className="rounded-lg bg-[#1C0F14] px-2 py-2">
              <p className="uppercase tracking-wider text-[#8A7468]">Liquidity</p>
              <p className="mt-1 font-mono text-[11px] text-[#E8DCC4]">
                {active.readable_liquidity || formatCompact(active.liquidity)}
              </p>
            </div>
            <div className="rounded-lg bg-[#1C0F14] px-2 py-2">
              <p className="uppercase tracking-wider text-[#8A7468]">Volume</p>
              <p className="mt-1 font-mono text-[11px] text-[#E8DCC4]">
                {active.readable_volume || formatCompact(active.volume)}
              </p>
            </div>
            <div className="rounded-lg bg-[#1C0F14] px-2 py-2">
              <p className="uppercase tracking-wider text-[#8A7468]">Mkt Cap</p>
              <p className="mt-1 font-mono text-[11px] text-[#E8DCC4]">
                {active.readable_marketcap || formatCompact(active.marketcap)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Blotter */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="sticky top-0 z-[1] flex items-center justify-between border-b border-[#2B141B] bg-[#140A0E]/95 px-4 py-2 backdrop-blur">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A89887]">
            Watchlist
          </p>
          <Radio className="h-3 w-3 text-[#800020]" />
        </div>
        <ul className="divide-y divide-[#241218]">
          {rows.map((row) => {
            const up = (row.change24h ?? 0) >= 0;
            const isActive = row.symbol === (active?.symbol || selected);
            return (
              <li key={row.symbol}>
                <button
                  type="button"
                  onClick={() => setSelected(row.symbol)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                    isActive ? 'bg-[#4A101D]/35' : 'hover:bg-[#1C0F14]'
                  }`}
                >
                  <div className="min-w-[52px]">
                    <p className="font-mono text-[12px] font-semibold text-[#F5EFE6]">{row.symbol}</p>
                    <p className={`font-mono text-[10px] tabular-nums ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {up ? '+' : ''}
                      {(row.change24h ?? 0).toFixed(2)}%
                    </p>
                  </div>
                  <div className="flex-1">
                    <Spark points={history[row.symbol] || []} up={up} />
                  </div>
                  <div className="text-right">
                    <LiveFigure
                      value={row.price ?? 0}
                      prefix="$"
                      decimals={priceDecimals(row.price)}
                      className="font-mono text-[12px] font-medium text-[#F5EFE6]"
                    />
                    <p className="mt-0.5 font-mono text-[9px] text-[#8A7468]">
                      Liq {row.readable_liquidity || formatCompact(row.liquidity)}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
          {!rows.length && (
            <li className="px-4 py-8 text-center text-[11px] text-[#8A7468]">
              Connecting to market feed…
            </li>
          )}
        </ul>
      </div>

      <div className="border-t border-[#2B141B] px-4 py-2.5">
        <p className="text-[9px] leading-relaxed text-[#6B524A]">
          Liquidity · volume · market cap via RapidAPI. Spot & 24h via market complement.
        </p>
      </div>
    </aside>
  );
};
