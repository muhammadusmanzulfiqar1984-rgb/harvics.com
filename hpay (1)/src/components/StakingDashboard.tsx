import React, { useState } from 'react';
import { useHPay } from '../context/HPayContext';
import { CurrencyCode } from '../types';
import { Coins, TrendingUp, Lock, Unlock, Percent, Sparkles, CheckCircle2, ArrowUpRight } from 'lucide-react';

export const StakingDashboard: React.FC = () => {
  const { balances, stakingPositions, stakeAsset, unstakeAsset, claimYield } = useHPay();

  const [selectedAsset, setSelectedAsset] = useState<CurrencyCode>('USDC');
  const [stakeAmount, setStakeAmount] = useState<number>(1000);
  const [lockDays, setLockDays] = useState<number>(30);

  const yieldOptions: { code: CurrencyCode; name: string; apr: number; badge: string; minLock: number }[] = [
    { code: 'USDC', name: 'USDC Vault Staking', apr: 5.2, badge: 'High Yield Stablecoin', minLock: 30 },
    { code: 'USDT', name: 'USDT Rail Yield', apr: 5.0, badge: 'Flexible Liquidity', minLock: 14 },
    { code: 'eUSD', name: 'e-USD CBDC Yield', apr: 4.8, badge: 'Digital Dollar Sovereign', minLock: 30 },
    { code: 'eAED', name: 'e-Dirham Staking', apr: 3.8, badge: 'UAE Treasury Yield', minLock: 60 },
    { code: 'BTC', name: 'Bitcoin Yield Vault', apr: 3.5, badge: 'BTC On-Chain Proof', minLock: 90 },
    { code: 'ETH', name: 'Ethereum Staking', apr: 4.2, badge: 'ETH Validator Pool', minLock: 60 }
  ];

  const currentOption = yieldOptions.find((y) => y.code === selectedAsset) || yieldOptions[0];

  const calculateEstimatedReturn = () => {
    return (stakeAmount * (currentOption.apr / 100) * lockDays) / 365;
  };

  const handleStakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stakeAmount <= 0) return;
    stakeAsset(selectedAsset, stakeAmount, lockDays, currentOption.apr);
  };

  const activePositions = stakingPositions.filter((p) => p.status === 'ACTIVE');
  const totalStakedUSD = activePositions.reduce((sum, p) => {
    const rate = p.asset === 'BTC' ? 95000 : p.asset === 'ETH' ? 2700 : p.asset === 'eAED' ? 1 / 3.6725 : 1;
    return sum + p.amount * rate;
  }, 0);

  const totalEarnedUSD = activePositions.reduce((sum, p) => {
    const rate = p.asset === 'BTC' ? 95000 : p.asset === 'ETH' ? 2700 : p.asset === 'eAED' ? 1 / 3.6725 : 1;
    return sum + p.earnedYield * rate;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-gradient-to-b from-[#211116] to-[#180C10] border border-[#381B23] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#A89887]">
            <span>Total Staked Assets</span>
            <Coins className="w-4 h-4 text-[#E8DCC4]" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            ${totalStakedUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-[#A89887]">Active yield-generating vaults</p>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-b from-[#211116] to-[#180C10] border border-[#381B23] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#A89887]">
            <span>Total Accrued Yield</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            +${totalEarnedUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-[#A89887]">Real-time daily yield distribution</p>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-b from-[#211116] to-[#180C10] border border-[#381B23] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#A89887]">
            <span>Average Portfolio APR</span>
            <Percent className="w-4 h-4 text-[#E8DCC4]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#E8DCC4]">
            4.68% APR
          </div>
          <p className="text-[10px] text-emerald-400 font-semibold">Zero Gas Fee Staking</p>
        </div>
      </div>

      {/* Main Form + Available Staking Pools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Available Yield Rates Table */}
        <div className="lg:col-span-7 rounded-3xl bg-[#180C10] border border-[#33171E] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2B141B]">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E8DCC4]" /> Yield Rates & APR Pools
              </h3>
              <p className="text-xs text-[#A89887]">Select a digital asset to initiate staking position</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {yieldOptions.map((opt) => (
              <div
                key={opt.code}
                onClick={() => {
                  setSelectedAsset(opt.code);
                  setLockDays(opt.minLock);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  selectedAsset === opt.code
                    ? 'bg-[#211116] border-[#800020] shadow-md shadow-[#800020]/20'
                    : 'bg-[#1D0E13] border-[#2B141B] hover:border-[#5E1A29]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#3B121A] text-[#E8DCC4] border border-[#800020] font-mono font-bold text-xs">
                    {opt.code}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      {opt.name}
                      <span className="text-[9px] font-mono px-2 py-0.2 rounded bg-[#2B141B] text-[#A89887]">
                        {opt.badge}
                      </span>
                    </h4>
                    <p className="text-[10px] text-[#A89887] font-mono mt-0.5">
                      Min Lock: {opt.minLock} Days • Balance: {balances[opt.code]} {opt.code}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black font-mono text-emerald-400 block">
                    {opt.apr}% APR
                  </span>
                  <span className="text-[9px] text-[#A89887]">Compounded Daily</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stake Execution Form */}
        <div className="lg:col-span-5 rounded-3xl bg-[#180C10] border border-[#33171E] p-6 space-y-5">
          <div className="pb-3 border-b border-[#2B141B]">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#E8DCC4]" /> Stake {selectedAsset}
            </h3>
            <p className="text-xs text-[#A89887]">Lock assets to earn guaranteed yield</p>
          </div>

          <form onSubmit={handleStakeSubmit} className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-[#A89887] mb-1">
                <span>Amount to Stake</span>
                <span>Available: {balances[selectedAsset]} {selectedAsset}</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#211116] border border-[#381B23] text-white font-mono font-extrabold text-lg p-3 rounded-xl focus:outline-none focus:border-[#800020]"
                />
                <button
                  type="button"
                  onClick={() => setStakeAmount(balances[selectedAsset])}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#E8DCC4] bg-[#3B121A] px-2 py-1 rounded border border-[#800020]"
                >
                  MAX
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#A89887] block mb-1">Lock Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {[30, 60, 90].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setLockDays(days)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      lockDays === days
                        ? 'bg-[#800020] text-[#E8DCC4] border border-[#E8DCC4]/30'
                        : 'bg-[#211116] text-[#A89887] border border-[#381B23]'
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>

            {/* Return Calculation Box */}
            <div className="p-4 rounded-2xl bg-[#211116] border border-[#381B23] space-y-2 text-xs">
              <div className="flex justify-between text-[#A89887]">
                <span>Applied APR</span>
                <span className="font-mono text-white font-bold">{currentOption.apr}%</span>
              </div>
              <div className="flex justify-between text-[#A89887]">
                <span>Lock Duration</span>
                <span className="font-mono text-white font-bold">{lockDays} Days</span>
              </div>
              <div className="pt-2 border-t border-[#381B23] flex justify-between font-bold text-[#E8DCC4]">
                <span>Estimated Yield Return</span>
                <span className="font-mono text-emerald-400 text-sm">
                  +{calculateEstimatedReturn().toFixed(4)} {selectedAsset}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={balances[selectedAsset] < stakeAmount || stakeAmount <= 0}
              className="w-full py-3.5 rounded-xl bg-[#800020] hover:bg-[#990026] disabled:bg-gray-800 text-[#E8DCC4] font-extrabold text-xs transition-all border border-[#E8DCC4]/20"
            >
              Confirm & Lock {selectedAsset} Staking
            </button>
          </form>
        </div>
      </div>

      {/* Active Staking Positions */}
      <div className="rounded-3xl bg-[#180C10] border border-[#33171E] p-6 space-y-4">
        <h4 className="text-xs font-bold text-[#A89887] uppercase tracking-wider">
          Active Staking Positions ({activePositions.length})
        </h4>

        {activePositions.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#A89887] bg-[#211116] rounded-2xl border border-[#381B23]">
            No active staking positions. Select an asset pool above to begin earning yield.
          </div>
        ) : (
          <div className="divide-y divide-[#2B141B]">
            {activePositions.map((pos) => (
              <div key={pos.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#3B121A] text-[#E8DCC4] border border-[#800020] font-mono font-bold text-xs">
                    {pos.asset}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-bold text-white">
                        {pos.amount.toLocaleString()} {pos.asset}
                      </h5>
                      <span className="text-[9px] font-mono px-2 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                        {pos.apr}% APR
                      </span>
                    </div>
                    <p className="text-[10px] text-[#A89887] font-mono mt-0.5">
                      Staked: {pos.stakedDate} • Lock: {pos.lockPeriodDays} Days • ID: {pos.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-emerald-400 block">
                      +{pos.earnedYield.toFixed(4)} {pos.asset}
                    </span>
                    <span className="text-[9px] text-[#A89887]">Accrued Yield</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => claimYield(pos.id)}
                      disabled={pos.earnedYield <= 0}
                      className="px-3 py-1.5 rounded-lg bg-[#3B121A] hover:bg-[#800020] disabled:opacity-50 text-xs font-bold text-[#E8DCC4] border border-[#800020] transition-all"
                    >
                      Claim
                    </button>
                    <button
                      onClick={() => unstakeAsset(pos.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#211116] hover:bg-[#2B141B] text-xs font-bold text-white border border-[#381B23] transition-all"
                    >
                      Unstake
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
