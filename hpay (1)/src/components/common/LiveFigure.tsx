import React, { useEffect, useRef, useState } from 'react';

type LiveFigureProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  /** Force polarity coloring regardless of delta */
  tone?: 'auto' | 'up' | 'down' | 'neutral';
  durationMs?: number;
};

/**
 * Smooth counting figure. Flashes green on increase, red on decrease.
 */
export const LiveFigure: React.FC<LiveFigureProps> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 2,
  className = '',
  tone = 'auto',
  durationMs = 700,
}) => {
  const [display, setDisplay] = useState(value);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);
  const prevTarget = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;

    if (to > prevTarget.current) setFlash('up');
    else if (to < prevTarget.current) setFlash('down');
    prevTarget.current = to;

    const start = performance.now();
    const delta = to - from;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + delta * eased;
      setDisplay(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
        setDisplay(to);
        window.setTimeout(() => setFlash(null), 900);
      }
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, durationMs]);

  const polarity =
    tone === 'up' ? 'up' : tone === 'down' ? 'down' : tone === 'neutral' ? null : flash;

  const colorClass =
    polarity === 'up'
      ? 'text-emerald-400'
      : polarity === 'down'
        ? 'text-rose-400'
        : '';

  const formatted = display.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span
      className={`tabular-nums transition-colors duration-300 ${colorClass} ${className}`.trim()}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

export default LiveFigure;
