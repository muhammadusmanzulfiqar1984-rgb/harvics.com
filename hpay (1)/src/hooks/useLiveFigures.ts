import { useEffect, useMemo, useState } from 'react';

export type CashFlowPoint = { day: string; in: number; out: number };

const BASE_30D: CashFlowPoint[] = [
  { day: '01 Aug', in: 12000, out: 4200 },
  { day: '02 Aug', in: 8500, out: 2100 },
  { day: '03 Aug', in: 19400, out: 18000 },
  { day: '04 Aug', in: 14200, out: 6200 },
  { day: '05 Aug', in: 22000, out: 8400 },
  { day: '06 Aug', in: 31000, out: 12500 },
  { day: '07 Aug', in: 42850, out: 18420 },
];

function scaleSeries(points: CashFlowPoint[], factor: number): CashFlowPoint[] {
  return points.map((p) => ({
    ...p,
    in: Math.max(500, Math.round(p.in * factor)),
    out: Math.max(200, Math.round(p.out * factor)),
  }));
}

function jitter(points: CashFlowPoint[]): CashFlowPoint[] {
  return points.map((p) => ({
    ...p,
    in: Math.max(400, Math.round(p.in * (0.97 + Math.random() * 0.08))),
    out: Math.max(200, Math.round(p.out * (0.97 + Math.random() * 0.08))),
  }));
}

/**
 * Live cash-flow series for dashboard charts — updates on an interval so graphs keep moving.
 */
export function useLiveCashFlow(range: '7D' | '30D' | '90D' | '1Y') {
  const seed = useMemo(() => {
    if (range === '7D') return scaleSeries(BASE_30D, 0.55);
    if (range === '90D') return scaleSeries(BASE_30D, 1.45);
    if (range === '1Y') return scaleSeries(BASE_30D, 2.1);
    return BASE_30D.map((p) => ({ ...p }));
  }, [range]);

  const [data, setData] = useState<CashFlowPoint[]>(seed);

  useEffect(() => {
    setData(seed);
  }, [seed]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setData((prev) => jitter(prev));
    }, 2800);
    return () => window.clearInterval(id);
  }, [range]);

  const totals = useMemo(() => {
    const moneyIn = data.reduce((s, p) => s + p.in, 0);
    const moneyOut = data.reduce((s, p) => s + p.out, 0);
    return {
      moneyIn,
      moneyOut,
      net: moneyIn - moneyOut,
    };
  }, [data]);

  return { data, totals };
}

/**
 * Gently drifts a balance so hero figures stay “alive” without large jumps.
 */
export function useLiveBalance(base: number, amp = 0.004) {
  const [value, setValue] = useState(base);

  useEffect(() => {
    setValue(base);
  }, [base]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setValue((v) => {
        const drift = base * amp * (Math.random() * 2 - 1);
        return Math.max(0, base + drift);
      });
    }, 3200);
    return () => window.clearInterval(id);
  }, [base, amp]);

  return value;
}
