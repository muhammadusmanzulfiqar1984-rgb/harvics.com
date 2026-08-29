import React, { useState } from 'react';
import { useHPay } from '../context/HPayContext';
import {
  Plus,
  Send,
  ArrowDownLeft,
  QrCode,
  TrendingUp,
  TrendingDown,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { LiveFigure } from '../components/common/LiveFigure';
import { useLiveBalance, useLiveCashFlow } from '../hooks/useLiveFigures';

export const DashboardPage: React.FC = () => {
  const { profile, balances, transactions, setActiveTab, setSelectedTransaction, addToast, topUpWallet } =
    useHPay();
  const [chartRange, setChartRange] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');
  const { data: cashFlowData, totals } = useLiveCashFlow(chartRange);

  // Ledger USD is authoritative — no fake drift on real money
  const liveUsd = balances.USD;
  const liveAed = useLiveBalance(balances.AED, 0.003);
  const livePkr = useLiveBalance(balances.PKR, 0.004);
  const liveEur = useLiveBalance(balances.EUR, 0.003);
  const liveUsdc = useLiveBalance(balances.USDC, 0.002);
  const liveEusd = useLiveBalance(balances.eUSD, 0.002);
  const liveEaed = useLiveBalance(balances.eAED, 0.003);
  const liveBtc = useLiveBalance(balances.BTC, 0.006);

  const pendingTotal = transactions
    .filter((t) => t.status === 'Pending')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#3D1212] tracking-tight">
              Good morning, Mian
            </h1>
            <span className="p-1 rounded-full bg-[#800020]/15 text-[#800020]">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xs md:text-sm text-[#665548] mt-1 font-medium">
            Your financial activity across the Harvics commerce network.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('trade')}
            className="px-3.5 py-2 rounded-xl bg-[#231217] border border-[#3D1A22] hover:border-[#7A1D31] text-xs font-semibold text-[#D4C5B5] hover:text-white transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-[#E8DCC4]" />
            <span>Escrow Guarantee Active</span>
          </button>
        </div>
      </div>

      {/* Main Balance Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#281318] via-[#1E0D12] to-[#14080B] border border-[#3D1A22] p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-[#800020]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-[#D4C3A3]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#A89887] uppercase tracking-widest">
                Total Available Balance
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#3D121B] text-[#E8DCC4] border border-[#6B1B2C]">
                Live
              </span>
            </div>
            <div className="text-4xl md:text-5xl font-black font-mono tracking-tight mt-2 text-white">
              <LiveFigure value={liveUsd} prefix="$" decimals={2} />
            </div>
            <p className="text-xs text-[#A89887] mt-1 font-medium">
              Equivalent across USD, AED, PKR, EUR, Digital CBDCs & Crypto balances
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full md:w-auto">
            <button
              onClick={() => {
                void (async () => {
                  try {
                    await topUpWallet(500, `Dashboard top-up · ${profile.hpayId}`);
                  } catch {
                    /* Transfer Failed toast from topUpWallet */
                  }
                })();
              }}
              className="px-4 py-3 rounded-xl bg-[#800020] hover:bg-[#990026] text-[#E8DCC4] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#800020]/30 active:scale-95 border border-[#E8DCC4]/20"
            >
              <Plus className="w-4 h-4" /> Add Money
            </button>
            <button
              onClick={() => setActiveTab('pay')}
              className="px-4 py-3 rounded-xl bg-[#2E181E] hover:bg-[#381D24] border border-[#48242D] text-[#F5EFE6] font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Send className="w-4 h-4 text-[#E8DCC4]" /> Send
            </button>
            <button
              onClick={() => setActiveTab('pay')}
              className="px-4 py-3 rounded-xl bg-[#2E181E] hover:bg-[#381D24] border border-[#48242D] text-[#F5EFE6] font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <ArrowDownLeft className="w-4 h-4 text-[#E8DCC4]" /> Request
            </button>
            <button
              onClick={() => setActiveTab('pay')}
              className="px-4 py-3 rounded-xl bg-[#2E181E] hover:bg-[#381D24] border border-[#48242D] text-[#F5EFE6] font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <QrCode className="w-4 h-4 text-[#E8DCC4]" /> Scan
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#3B1C23] space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#211116]/80 border border-[#381B23]">
              <span className="text-[10px] font-bold text-[#A89887] uppercase tracking-wider block">
                USD Balance
              </span>
              <LiveFigure
                value={liveUsd}
                prefix="$"
                className="text-lg font-bold font-mono text-white block mt-0.5"
              />
              <span className="text-[10px] text-emerald-400 font-semibold font-mono">Primary Operating</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#211116]/80 border border-[#381B23]">
              <span className="text-[10px] font-bold text-[#A89887] uppercase tracking-wider block">
                AED Balance
              </span>
              <LiveFigure
                value={liveAed}
                prefix="AED "
                className="text-lg font-bold font-mono text-white block mt-0.5"
              />
              <span className="text-[10px] text-[#A89887] font-mono">
                ≈ ${(liveAed / 3.6725).toLocaleString('en-US', { maximumFractionDigits: 0 })} USD
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#211116]/80 border border-[#381B23]">
              <span className="text-[10px] font-bold text-[#A89887] uppercase tracking-wider block">
                PKR Balance
              </span>
              <LiveFigure
                value={livePkr}
                prefix="PKR "
                decimals={0}
                className="text-lg font-bold font-mono text-white block mt-0.5"
              />
              <span className="text-[10px] text-[#A89887] font-mono">
                ≈ ${(livePkr / 278.5).toLocaleString('en-US', { maximumFractionDigits: 0 })} USD
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#211116]/80 border border-[#381B23]">
              <span className="text-[10px] font-bold text-[#A89887] uppercase tracking-wider block">
                EUR Balance
              </span>
              <LiveFigure
                value={liveEur}
                prefix="€"
                className="text-lg font-bold font-mono text-white block mt-0.5"
              />
              <span className="text-[10px] text-[#A89887] font-mono">
                ≈ ${(liveEur / 0.915).toLocaleString('en-US', { maximumFractionDigits: 0 })} USD
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-[#1A0A0E] border border-[#2B141B]">
              <span className="text-[10px] font-bold text-[#A89887] uppercase tracking-wider">USDC</span>
              <LiveFigure
                value={liveUsdc}
                suffix=" USDC"
                className="text-base font-bold font-mono text-[#E8DCC4] block mt-0.5"
              />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#1A0A0E] border border-[#2B141B]">
              <span className="text-[10px] font-bold text-[#A89887] uppercase tracking-wider">e-USD</span>
              <LiveFigure
                value={liveEusd}
                suffix=" eUSD"
                className="text-base font-bold font-mono text-[#E8DCC4] block mt-0.5"
              />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#1A0A0E] border border-[#2B141B]">
              <span className="text-[10px] font-bold text-[#A89887] uppercase tracking-wider">e-Dirham</span>
              <LiveFigure
                value={liveEaed}
                suffix=" eAED"
                className="text-base font-bold font-mono text-[#E8DCC4] block mt-0.5"
              />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#1A0A0E] border border-[#2B141B]">
              <span className="text-[10px] font-bold text-[#A89887] uppercase tracking-wider">Bitcoin</span>
              <LiveFigure
                value={liveBtc}
                prefix="₿ "
                suffix=" BTC"
                decimals={4}
                className="text-base font-bold font-mono text-[#E8DCC4] block mt-0.5"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl bg-[#180C10] border border-[#33171E] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#F5EFE6] tracking-tight">
                Cash Flow & Financial Velocity
              </h2>
              <p className="text-xs text-[#A89887]">Live settlement velocity — green inflows / red outflows</p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-[#231217] rounded-xl border border-[#3D1A22]">
              {(['7D', '30D', '90D', '1Y'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setChartRange(r)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    chartRange === r ? 'bg-[#800020] text-[#E8DCC4] shadow' : 'text-[#A89887] hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#211116] border border-[#381B23]">
              <span className="text-[10px] text-[#A89887] font-bold uppercase tracking-wider block">
                Money In
              </span>
              <span className="text-base font-bold font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                <LiveFigure value={totals.moneyIn} prefix="+$" decimals={0} tone="up" />
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#211116] border border-[#381B23]">
              <span className="text-[10px] text-[#A89887] font-bold uppercase tracking-wider block">
                Money Out
              </span>
              <span className="text-base font-bold font-mono text-rose-400 flex items-center gap-1 mt-0.5">
                <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                <LiveFigure value={totals.moneyOut} prefix="-$" decimals={0} tone="down" />
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#211116] border border-[#381B23]">
              <span className="text-[10px] text-[#A89887] font-bold uppercase tracking-wider block">
                Pending
              </span>
              <span className="text-base font-bold font-mono text-[#E8DCC4] flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <LiveFigure value={pendingTotal || 12800} prefix="$" decimals={0} tone="neutral" />
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#211116] border border-[#381B23]">
              <span className="text-[10px] text-[#A89887] font-bold uppercase tracking-wider block">
                Net Flow
              </span>
              <span
                className={`text-base font-bold font-mono mt-0.5 block ${
                  totals.net >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                <LiveFigure
                  value={Math.abs(totals.net)}
                  prefix={totals.net >= 0 ? '+$' : '-$'}
                  decimals={0}
                  tone={totals.net >= 0 ? 'up' : 'down'}
                />
              </span>
            </div>
          </div>

          {/* Fixed-height chart so Recharts always paints */}
          <div className="w-full min-w-0" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height={260} minWidth={0}>
              <AreaChart data={cashFlowData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2B141B" vertical={false} />
                <XAxis dataKey="day" stroke="#A89887" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#A89887"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                  width={42}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#211116',
                    borderColor: '#381B23',
                    borderRadius: '12px',
                    color: '#F5EFE6',
                    fontSize: '12px',
                  }}
                  formatter={(value, name) => [
                    `$${Number(value).toLocaleString()}`,
                    name === 'in' ? 'Money In' : 'Money Out / Withdrawal',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="in"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fill="url(#colorIn)"
                  name="in"
                  isAnimationActive
                  animationDuration={900}
                />
                <Area
                  type="monotone"
                  dataKey="out"
                  stroke="#F43F5E"
                  strokeWidth={2.5}
                  fill="url(#colorOut)"
                  name="out"
                  isAnimationActive
                  animationDuration={900}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl bg-[#180C10] border border-[#33171E] p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#2B141B]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E8DCC4]" />
                <h3 className="text-sm font-bold text-white">Harvey Financial Intelligence</h3>
              </div>
              <button
                onClick={() => setActiveTab('harvey')}
                className="text-[11px] font-semibold text-[#E8DCC4] hover:underline flex items-center gap-0.5"
              >
                Ask Harvey <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3 mt-4">
              <div className="p-4 rounded-2xl bg-[#211116] border border-[#381B23] space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                  Inflow
                </span>
                <p className="text-xs text-[#D4C5B5] leading-relaxed font-medium">
                  Live money-in this window:{' '}
                  <LiveFigure value={totals.moneyIn} prefix="$" decimals={0} tone="up" className="font-mono" />
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#211116] border border-[#381B23] space-y-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block">
                  Outflow / Withdrawals
                </span>
                <p className="text-xs text-[#D4C5B5] leading-relaxed font-medium">
                  Live money-out:{' '}
                  <LiveFigure value={totals.moneyOut} prefix="$" decimals={0} tone="down" className="font-mono" />
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#211116] border border-[#381B23] space-y-1">
                <span className="text-[10px] font-bold text-[#E8DCC4] uppercase tracking-widest block">
                  Settlement
                </span>
                <p className="text-xs text-[#D4C5B5] leading-relaxed font-medium">
                  Pending escrow / settlement sits at{' '}
                  <LiveFigure value={pendingTotal || 12800} prefix="$" decimals={0} tone="neutral" className="font-mono" />
                  .
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('harvey')}
            className="w-full py-3 px-4 rounded-xl bg-[#800020] hover:bg-[#990026] border border-[#E8DCC4]/20 text-xs font-bold text-[#E8DCC4] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#800020]/20"
          >
            <Sparkles className="w-4 h-4 text-[#E8DCC4]" /> Consult Harvey AI Assistant
          </button>
        </div>
      </div>

      <div className="rounded-3xl bg-[#180C10] border border-[#33171E] p-6 space-y-4">
        <div className="flex items-center justify-between pb-2">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Recent Financial Activity</h2>
            <p className="text-xs text-[#A89887]">
              Inflows in green · withdrawals / outflows in red
            </p>
          </div>
          <button
            onClick={() => setActiveTab('activity')}
            className="text-xs font-semibold text-[#E8DCC4] hover:underline flex items-center gap-1"
          >
            View All Ledger <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-[#2B141B]">
          {transactions.slice(0, 6).map((tx) => (
            <div
              key={tx.id}
              onClick={() => setSelectedTransaction(tx)}
              className="py-3.5 px-3 rounded-2xl hover:bg-[#211116] transition-all cursor-pointer flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`p-2.5 rounded-xl ${
                    tx.direction === 'in'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
                      : 'bg-rose-950/80 text-rose-400 border border-rose-800/40'
                  }`}
                >
                  {tx.direction === 'in' ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-[#E8DCC4] transition-colors">
                    {tx.merchantOrPerson}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-[#A89887] font-mono mt-0.5">
                    <span>{tx.id}</span>
                    <span>•</span>
                    <span>{tx.category}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-xs font-bold font-mono ${
                    tx.direction === 'in' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {tx.direction === 'in' ? '+' : '-'}$
                  {tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      tx.status === 'Completed'
                        ? 'bg-emerald-950 text-emerald-400'
                        : 'bg-[#4A2012] text-[#E8DCC4]'
                    }`}
                  >
                    {tx.status}
                  </span>
                  <span className="text-[10px] text-[#A89887]">{tx.timestamp.split(',')[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
