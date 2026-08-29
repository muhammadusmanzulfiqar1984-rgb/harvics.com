import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, Legend, ReferenceLine } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieIcon, DollarSign, Activity, Sparkles, Calendar, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';
import { fetchPredictiveCashflow } from '../services/hpayApi';

const monthlyVolume = [
  { month: 'Jan', volume: 120000 },
  { month: 'Feb', volume: 145000 },
  { month: 'Mar', volume: 180000 },
  { month: 'Apr', volume: 210000 },
  { month: 'May', volume: 240000 },
  { month: 'Jun', volume: 310000 },
  { month: 'Jul', volume: 420000 },
  { month: 'Aug', volume: 580000 }
];

const paymentMethodData = [
  { name: 'HPay Wallet Balance', value: 55, color: '#800020' },
  { name: 'Corporate Cards', value: 25, color: '#E8DCC4' },
  { name: 'Direct Bank Rail', value: 15, color: '#10B981' },
  { name: 'QR & Express Links', value: 5, color: '#F59E0B' }
];

type ForecastPoint = {
  day: string;
  day_index?: number;
  actual: number | null;
  forecast: number;
  confidenceUpper: number;
  confidenceLower: number;
};

export const AnalyticsPage: React.FC = () => {
  const [selectedHorizon, setSelectedHorizon] = useState<'30d' | '60d' | '90d'>('30d');
  const [forecastData, setForecastData] = useState<ForecastPoint[]>([]);
  const [forecastMeta, setForecastMeta] = useState<{ model: string; starting: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPredictiveCashflow();
        if (cancelled) return;
        setForecastData(data.points || []);
        setForecastMeta({ model: data.model, starting: data.starting_balance });
      } catch {
        /* keep empty until API up */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const day30 = forecastData.find((p) => p.day_index === 30 || String(p.day).includes('Day 30'));
  const netBuffer = day30 && forecastMeta ? day30.forecast - forecastMeta.starting : 0;
  const expectedInflow = Math.max(0, netBuffer);
  const expectedOutflow = Math.max(0, -netBuffer * 0.4);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Financial Intelligence & Analytics</h1>
        <p className="text-xs md:text-sm text-[#A89887] mt-1">Predictive cash flow modeling and deep network settlement metrics</p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#180C10] border border-[#33171E] space-y-2">
          <span className="text-[10px] font-bold text-[#A89887] uppercase tracking-wider block">YTD Settlement Volume</span>
          <span className="text-2xl font-black font-mono text-white block">$2,205,000.00</span>
          <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +42% vs last year
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-[#180C10] border border-[#33171E] space-y-2">
          <span className="text-[10px] font-bold text-[#A89887] uppercase tracking-wider block">Avg Transaction Size</span>
          <span className="text-2xl font-black font-mono text-[#E8DCC4] block">$1,197.00</span>
          <span className="text-xs text-gray-400 font-mono">B2B commercial transactions</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#180C10] border border-[#33171E] space-y-2">
          <span className="text-[10px] font-bold text-[#A89887] uppercase tracking-wider block">Clearing Speed</span>
          <span className="text-2xl font-black font-mono text-emerald-400 block">&lt; 1.2 Seconds</span>
          <span className="text-xs text-gray-400 font-mono">HPay FastRail average</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#180C10] border border-[#33171E] space-y-2">
          <span className="text-[10px] font-bold text-[#A89887] uppercase tracking-wider block">Fraud Prevention Score</span>
          <span className="text-2xl font-black font-mono text-[#E8DCC4] block">99.98%</span>
          <span className="text-xs text-emerald-400 font-mono">Zero chargebacks</span>
        </div>
      </div>

      {/* 30-DAY PREDICTIVE CASH FLOW FORECAST CHART */}
      <div className="rounded-3xl bg-[#180C10] border border-[#33171E] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2B141B]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#E8DCC4]" />
              <h2 className="text-lg font-extrabold text-white tracking-tight">30-Day Cash Flow AI Forecast</h2>
            </div>
            <p className="text-xs text-[#A89887]">
              Ledger-derived 30-day outlook{forecastMeta ? ` · ${forecastMeta.model} · start $${forecastMeta.starting.toLocaleString()}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-[#211116] border border-[#381B23] text-xs font-mono font-bold text-[#E8DCC4] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>API /analytics/predictive-cashflow</span>
            </div>
          </div>
        </div>

        {/* Predictive Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          <div className="p-3.5 rounded-2xl bg-[#211116] border border-[#381B23]">
            <span className="text-[10px] text-[#A89887] uppercase font-bold block">Expected Inflow (30d)</span>
            <span className="text-lg font-black text-emerald-400">
              +${expectedInflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#211116] border border-[#381B23]">
            <span className="text-[10px] text-[#A89887] uppercase font-bold block">Forecasted Outflow (30d)</span>
            <span className="text-lg font-black text-rose-400">
              -${expectedOutflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#211116] border border-[#381B23]">
            <span className="text-[10px] text-[#A89887] uppercase font-bold block">Forecasted Net Buffer</span>
            <span className="text-lg font-black text-[#E8DCC4]">
              {netBuffer >= 0 ? '+' : ''}${netBuffer.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Predictive Chart */}
        <div className="w-full min-w-0" style={{ height: 288 }}>
          <ResponsiveContainer width="100%" height={288} minWidth={0}>
            <LineChart data={forecastData.length ? forecastData : [{ day: 'Day 15 (Today)', actual: 0, forecast: 0, confidenceUpper: 0, confidenceLower: 0 }]}>
              <XAxis dataKey="day" stroke="#A89887" fontSize={11} tickLine={false} />
              <YAxis stroke="#A89887" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#211116', borderColor: '#381B23', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(value: any, name: any) => [
                  `$${Number(value).toLocaleString()}`,
                  name === 'actual' ? 'Historical Balance' : name === 'forecast' ? 'AI Projected Trend' : 'Upper Boundary'
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', color: '#A89887', paddingTop: '10px' }}
              />
              <ReferenceLine x="Day 15 (Today)" stroke="#800020" strokeDasharray="3 3" label={{ value: 'TODAY', fill: '#E8DCC4', fontSize: 10, position: 'top' }} />
              <Line
                type="monotone"
                dataKey="actual"
                name="Historical Cash Flow"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10B981' }}
                isAnimationActive
                animationDuration={900}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name="Forecasted 30-Day Cash Flow"
                stroke="#F43F5E"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: '#F43F5E' }}
                isAnimationActive
                animationDuration={900}
              />
              <Line
                type="monotone"
                dataKey="confidenceUpper"
                name="Upper Confidence Band"
                stroke="#E8DCC4"
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
                isAnimationActive
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settlement Volume Chart */}
        <div className="lg:col-span-2 rounded-3xl bg-[#180C10] border border-[#33171E] p-6 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[#2B141B]">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">2026 Monthly Settlement Growth ($)</h2>
              <p className="text-xs text-[#A89887]">Total volume processed through Harvics Universe</p>
            </div>
          </div>

          <div className="w-full min-w-0" style={{ height: 256 }}>
            <ResponsiveContainer width="100%" height={256} minWidth={0}>
              <AreaChart data={monthlyVolume}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#A89887" fontSize={11} tickLine={false} />
                <YAxis stroke="#A89887" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#211116', borderColor: '#381B23', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="volume" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#volGrad)" isAnimationActive animationDuration={900} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Rail Distribution Pie */}
        <div className="rounded-3xl bg-[#180C10] border border-[#33171E] p-6 space-y-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight pb-2 border-b border-[#2B141B]">
              Payment Rail Mix
            </h2>
            <div className="w-full min-w-0 mt-2" style={{ height: 192 }}>
              <ResponsiveContainer width="100%" height={192} minWidth={0}>
                <PieChart>
                  <Pie data={paymentMethodData} innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" isAnimationActive animationDuration={900}>
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {paymentMethodData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-300">{item.name}</span>
                </div>
                <span className="font-bold text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

