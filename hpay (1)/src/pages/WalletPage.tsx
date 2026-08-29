import React, { useState } from 'react';
import { useHPay } from '../context/HPayContext';
import { CurrencyCode } from '../types';
import {
  Wallet,
  RefreshCw,
  Plus,
  ArrowUpRight,
  Send,
  DollarSign,
  TrendingUp,
  Coins,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  Bell,
  Key
} from 'lucide-react';
import { PriceMonitoringWidget } from '../components/PriceMonitoringWidget';
import { StakingDashboard } from '../components/StakingDashboard';
import { MultiSigVaultDashboard } from '../components/MultiSigVaultDashboard';

export const WalletPage: React.FC = () => {
  const { balances, convertCurrency, addToast, topUpWallet } = useHPay();

  // Active Main Sub-Tab in Wallet Module
  const [walletSubTab, setWalletSubTab] = useState<'overview' | 'price-monitor' | 'staking' | 'vault'>('overview');

  // Active Category Filter for Overview
  const [walletCategory, setWalletCategory] = useState<'all' | 'fiat' | 'digital' | 'crypto'>('all');

  // FX state
  const [fromCurr, setFromCurr] = useState<CurrencyCode>('USD');
  const [toCurr, setToCurr] = useState<CurrencyCode>('USDC');
  const [convertAmount, setConvertAmount] = useState<number>(1000);

  const rates: Record<CurrencyCode, number> = {
    USD: 1.0,
    AED: 3.6725,
    EUR: 0.915,
    PKR: 278.50,
    USDC: 1.0,
    USDT: 1.0,
    eUSD: 1.0,
    eAED: 3.6725,
    BTC: 1 / 95000,
    ETH: 1 / 2700
  };

  const calculatedRate = rates[toCurr] / rates[fromCurr];
  const estimatedReceive = convertAmount * calculatedRate;

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (convertAmount <= 0 || convertAmount > balances[fromCurr]) {
      addToast('Conversion Error', 'Insufficient balance for conversion', 'error');
      return;
    }
    convertCurrency(fromCurr, toCurr, convertAmount);
  };

  const walletCards = [
    // FIAT
    {
      code: 'USD' as CurrencyCode,
      name: 'USD Wallet',
      badge: 'Fiat Primary',
      category: 'fiat',
      symbol: '$',
      balance: balances.USD,
      formatted: `$${balances.USD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      pending: '$0.00'
    },
    {
      code: 'AED' as CurrencyCode,
      name: 'AED Wallet',
      badge: 'UAE Direct',
      category: 'fiat',
      symbol: 'AED',
      balance: balances.AED,
      formatted: `AED ${balances.AED.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      pending: '0.00'
    },
    {
      code: 'PKR' as CurrencyCode,
      name: 'PKR Wallet',
      badge: 'PK Settle',
      category: 'fiat',
      symbol: 'PKR',
      balance: balances.PKR,
      formatted: `PKR ${balances.PKR.toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
      pending: '0'
    },
    {
      code: 'EUR' as CurrencyCode,
      name: 'EUR Wallet',
      badge: 'SEPA Direct',
      category: 'fiat',
      symbol: '€',
      balance: balances.EUR,
      formatted: `€${balances.EUR.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      pending: '0.00'
    },
    // DIGITAL CBDC & STABLECOINS
    {
      code: 'USDC' as CurrencyCode,
      name: 'USDC Vault',
      badge: 'Circle Stablecoin',
      category: 'digital',
      symbol: 'USDC',
      balance: balances.USDC,
      formatted: `${balances.USDC.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC`,
      pending: '0.00'
    },
    {
      code: 'USDT' as CurrencyCode,
      name: 'USDT Vault',
      badge: 'Tether FastRail',
      category: 'digital',
      symbol: 'USDT',
      balance: balances.USDT,
      formatted: `${balances.USDT.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT`,
      pending: '0.00'
    },
    {
      code: 'eUSD' as CurrencyCode,
      name: 'e-USD Wallet',
      badge: 'Digital Dollar CBDC',
      category: 'digital',
      symbol: 'eUSD',
      balance: balances.eUSD,
      formatted: `${balances.eUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} eUSD`,
      pending: '0.00'
    },
    {
      code: 'eAED' as CurrencyCode,
      name: 'e-Dirham Wallet',
      badge: 'Digital Dirham CBDC',
      category: 'digital',
      symbol: 'eAED',
      balance: balances.eAED,
      formatted: `${balances.eAED.toLocaleString('en-US', { minimumFractionDigits: 2 })} eAED`,
      pending: '0.00'
    },
    // CRYPTO
    {
      code: 'BTC' as CurrencyCode,
      name: 'Bitcoin Vault',
      badge: 'BTC On-Chain',
      category: 'crypto',
      symbol: 'BTC',
      balance: balances.BTC,
      formatted: `₿ ${balances.BTC.toFixed(4)} BTC`,
      pending: '0.0000 BTC'
    },
    {
      code: 'ETH' as CurrencyCode,
      name: 'Ethereum Vault',
      badge: 'ETH Smart Settle',
      category: 'crypto',
      symbol: 'ETH',
      balance: balances.ETH,
      formatted: `Ξ ${balances.ETH.toFixed(2)} ETH`,
      pending: '0.00 ETH'
    }
  ];

  const filteredCards = walletCards.filter(c => walletCategory === 'all' || c.category === walletCategory);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#F5EFE6] tracking-tight flex items-center gap-2">
            Multi-Currency & Digital Asset Vault <Sparkles className="w-5 h-5 text-[#E8DCC4]" />
          </h1>
          <p className="text-xs md:text-sm text-[#A89887] mt-1">
            Hybrid Fiat, CBDCs, Stablecoins, Staking & Multi-Sig Vault on Harvics FastRail
          </p>
        </div>

        {/* Primary Wallet Module Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#180C10] rounded-2xl border border-[#33171E] text-xs font-bold self-start md:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setWalletSubTab('overview')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              walletSubTab === 'overview'
                ? 'bg-[#800020] text-[#E8DCC4] shadow-md border border-[#E8DCC4]/20'
                : 'text-[#A89887] hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4" /> Balances & Swap
          </button>
          <button
            onClick={() => setWalletSubTab('price-monitor')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              walletSubTab === 'price-monitor'
                ? 'bg-[#800020] text-[#E8DCC4] shadow-md border border-[#E8DCC4]/20'
                : 'text-[#A89887] hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" /> Price Monitor
          </button>
          <button
            onClick={() => setWalletSubTab('staking')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              walletSubTab === 'staking'
                ? 'bg-[#800020] text-[#E8DCC4] shadow-md border border-[#E8DCC4]/20'
                : 'text-[#A89887] hover:text-white'
            }`}
          >
            <Coins className="w-4 h-4 text-emerald-400" /> Staking Yield
          </button>
          <button
            onClick={() => setWalletSubTab('vault')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              walletSubTab === 'vault'
                ? 'bg-[#800020] text-[#E8DCC4] shadow-md border border-[#E8DCC4]/20'
                : 'text-[#A89887] hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" /> Multi-Sig Vault
          </button>
        </div>
      </div>

      {/* Sub-Tab Conditional Views */}
      {walletSubTab === 'price-monitor' && <PriceMonitoringWidget />}
      {walletSubTab === 'staking' && <StakingDashboard />}
      {walletSubTab === 'vault' && <MultiSigVaultDashboard />}

      {walletSubTab === 'overview' && (
        <div className="space-y-8">
          {/* Category Filter Pills for Overview */}
          <div className="flex items-center justify-between pb-2 border-b border-[#2B141B]">
            <h3 className="text-xs font-bold text-[#A89887] uppercase tracking-wider">Vault Balances Overview</h3>
            <div className="flex items-center gap-1.5 p-1 bg-[#180C10] rounded-xl border border-[#33171E] text-xs font-semibold">
              <button
                onClick={() => setWalletCategory('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  walletCategory === 'all' ? 'bg-[#800020] text-[#E8DCC4]' : 'text-[#A89887] hover:text-white'
                }`}
              >
                All Vaults ({walletCards.length})
              </button>
              <button
                onClick={() => setWalletCategory('fiat')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  walletCategory === 'fiat' ? 'bg-[#800020] text-[#E8DCC4]' : 'text-[#A89887] hover:text-white'
                }`}
              >
                Fiat (4)
              </button>
              <button
                onClick={() => setWalletCategory('digital')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  walletCategory === 'digital' ? 'bg-[#800020] text-[#E8DCC4]' : 'text-[#A89887] hover:text-white'
                }`}
              >
                CBDCs & Stablecoins (4)
              </button>
              <button
                onClick={() => setWalletCategory('crypto')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  walletCategory === 'crypto' ? 'bg-[#800020] text-[#E8DCC4]' : 'text-[#A89887] hover:text-white'
                }`}
              >
                Crypto (2)
              </button>
            </div>
          </div>

      {/* Wallet Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCards.map((card) => (
          <div
            key={card.code}
            className="p-6 rounded-3xl bg-gradient-to-b from-[#211116] to-[#180C10] border border-[#381B23] space-y-4 hover:border-[#5E1A29] transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#A89887] uppercase tracking-wider">{card.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3B121A] text-[#E8DCC4] border border-[#800020]">
                {card.badge}
              </span>
            </div>
            <div>
              <div className="text-2xl font-black font-mono text-white">
                {card.formatted}
              </div>
              <div className="flex justify-between text-[11px] text-[#A89887] mt-2 font-mono">
                <span>Available: {card.formatted}</span>
                <span>Pending: {card.pending}</span>
              </div>
            </div>
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  if (card.code !== 'USD') {
                    addToast(
                      'Transfer Failed: Live deposits are USD-only',
                      'No silent fake — ledger unchanged.',
                      'error'
                    );
                    return;
                  }
                  void topUpWallet(500, `Wallet Add · ${card.name}`).catch(() => undefined);
                }}
                className="flex-1 py-2 rounded-xl bg-[#2B141B] text-xs font-bold text-white hover:bg-[#381B23]"
              >
                Add
              </button>
              <button
                onClick={() => addToast('Withdrawal', `Payout / Transfer drawer opened for ${card.name}`)}
                className="flex-1 py-2 rounded-xl bg-[#2B141B] text-xs font-bold text-white hover:bg-[#381B23]"
              >
                Withdraw
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Simulated FX Currency & Digital Token Swap Section */}
      <div className="rounded-3xl bg-[#180C10] border border-[#33171E] p-6 md:p-8 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#2B141B]">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-[#E8DCC4]" /> Digital & Fiat FX Swap Engine
            </h2>
            <p className="text-xs text-[#A89887]">Zero-slippage instant cross-currency & digital token conversion</p>
          </div>
          <span className="text-[10px] font-mono text-[#E8DCC4] bg-[#3B121A] px-2.5 py-1 rounded-full border border-[#800020]">
            INSTANT CLEARING
          </span>
        </div>

        <form onSubmit={handleConvert} className="space-y-5">
          {/* From Currency */}
          <div className="p-4 rounded-2xl bg-[#211116] border border-[#381B23] space-y-2">
            <span className="text-xs font-bold text-[#A89887] block">You Sell / Swap</span>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={convertAmount}
                onChange={(e) => setConvertAmount(Number(e.target.value))}
                className="w-full bg-transparent text-white font-mono font-extrabold text-2xl focus:outline-none"
              />
              <select
                value={fromCurr}
                onChange={(e) => setFromCurr(e.target.value as CurrencyCode)}
                className="bg-[#180C10] border border-[#381B23] text-white text-xs font-bold px-3 py-2 rounded-xl cursor-pointer"
              >
                <option value="USD">USD ($)</option>
                <option value="AED">AED (AED)</option>
                <option value="PKR">PKR (PKR)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USDC">USDC (Stablecoin)</option>
                <option value="USDT">USDT (Tether)</option>
                <option value="eUSD">eUSD (CBDC)</option>
                <option value="eAED">eAED (CBDC)</option>
                <option value="BTC">BTC (Bitcoin)</option>
                <option value="ETH">ETH (Ethereum)</option>
              </select>
            </div>
            <span className="text-[10px] text-[#A89887] font-mono">
              Available: {balances[fromCurr].toLocaleString()} {fromCurr}
            </span>
          </div>

          {/* Swap Rate Indicator */}
          <div className="flex items-center justify-between px-2 text-xs text-[#A89887] font-mono">
            <span>Rate: 1 {fromCurr} = {calculatedRate < 0.001 ? calculatedRate.toFixed(8) : calculatedRate.toFixed(4)} {toCurr}</span>
            <span className="text-emerald-400 font-bold">Harvics Gasless Fee: $0.00</span>
          </div>

          {/* To Currency */}
          <div className="p-4 rounded-2xl bg-[#211116] border border-[#381B23] space-y-2">
            <span className="text-xs font-bold text-[#A89887] block">You Receive (Instant)</span>
            <div className="flex items-center gap-3">
              <input
                type="text"
                readOnly
                value={estimatedReceive.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                className="w-full bg-transparent text-[#E8DCC4] font-mono font-extrabold text-2xl focus:outline-none"
              />
              <select
                value={toCurr}
                onChange={(e) => setToCurr(e.target.value as CurrencyCode)}
                className="bg-[#180C10] border border-[#381B23] text-white text-xs font-bold px-3 py-2 rounded-xl cursor-pointer"
              >
                <option value="USDC">USDC (Stablecoin)</option>
                <option value="USDT">USDT (Tether)</option>
                <option value="eUSD">eUSD (CBDC)</option>
                <option value="eAED">eAED (CBDC)</option>
                <option value="USD">USD ($)</option>
                <option value="AED">AED (AED)</option>
                <option value="PKR">PKR (PKR)</option>
                <option value="EUR">EUR (€)</option>
                <option value="BTC">BTC (Bitcoin)</option>
                <option value="ETH">ETH (Ethereum)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-[#800020] hover:bg-[#990026] text-[#E8DCC4] font-extrabold text-sm transition-all shadow-lg shadow-[#800020]/20 border border-[#E8DCC4]/20"
          >
            Execute Swap / Conversion
          </button>
        </form>
      </div>
      </div>
      )}
    </div>
  );
};
