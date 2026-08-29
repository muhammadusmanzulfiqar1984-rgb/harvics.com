import React, { useState } from 'react';
import { useHPay } from '../context/HPayContext';
import { CurrencyCode } from '../types';
import { Bell, TrendingUp, TrendingDown, Plus, Trash2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const PriceMonitoringWidget: React.FC = () => {
  const { priceAlerts, livePrices, addPriceAlert, togglePriceAlert, deletePriceAlert } = useHPay();

  const [isAdding, setIsAdding] = useState(false);
  const [asset, setAsset] = useState<CurrencyCode>('BTC');
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [targetPrice, setTargetPrice] = useState<number>(96000);

  const handleSubmitAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetPrice <= 0) return;
    addPriceAlert(asset, targetPrice, condition);
    setIsAdding(false);
  };

  const assetList: { code: CurrencyCode; name: string; symbol: string }[] = [
    { code: 'BTC', name: 'Bitcoin Vault', symbol: '₿' },
    { code: 'ETH', name: 'Ethereum Vault', symbol: 'Ξ' },
    { code: 'USDC', name: 'USDC Stablecoin', symbol: '$' },
    { code: 'USDT', name: 'Tether Stablecoin', symbol: '$' },
    { code: 'eUSD', name: 'Digital Dollar CBDC', symbol: '$' },
    { code: 'eAED', name: 'Digital Dirham CBDC', symbol: 'AED' }
  ];

  return (
    <div className="rounded-3xl bg-[#180C10] border border-[#33171E] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2B141B]">
        <div>
          <h3 className="text-lg font-black text-[#F5EFE6] flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#E8DCC4]" /> Real-Time Asset Price Monitor & Alert Engine
          </h3>
          <p className="text-xs text-[#A89887] mt-0.5">
            Automated threshold monitoring for digital assets with push notifications directly to drawer
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 rounded-xl bg-[#800020] hover:bg-[#990026] text-[#E8DCC4] text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto border border-[#E8DCC4]/20"
        >
          <Plus className="w-4 h-4" /> Set Threshold Alert
        </button>
      </div>

      {/* Live Digital Assets Ticker Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {assetList.map((ast) => {
          const price = livePrices[ast.code] || 0;
          return (
            <div
              key={ast.code}
              className="p-3.5 rounded-2xl bg-[#211116] border border-[#381B23] space-y-1 relative overflow-hidden"
            >
              <div className="flex items-center justify-between text-[10px] text-[#A89887] font-bold">
                <span>{ast.code}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-sm font-black font-mono text-white">
                {ast.code === 'BTC' || ast.code === 'ETH'
                  ? `$${price.toLocaleString()}`
                  : `$${price.toFixed(4)}`}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Live Feed
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal / Inline Add Form */}
      {isAdding && (
        <form onSubmit={handleSubmitAlert} className="p-5 rounded-2xl bg-[#211116] border border-[#800020] space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-bold text-[#E8DCC4]">
            <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> Create New Target Price Trigger</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-[#A89887] hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#A89887] uppercase block mb-1">Select Asset</label>
              <select
                value={asset}
                onChange={(e) => {
                  const selected = e.target.value as CurrencyCode;
                  setAsset(selected);
                  setTargetPrice(selected === 'BTC' ? 96000 : selected === 'ETH' ? 2800 : 1.0);
                }}
                className="w-full bg-[#180C10] border border-[#381B23] text-white text-xs font-bold p-2.5 rounded-xl"
              >
                {assetList.map((a) => (
                  <option key={a.code} value={a.code}>{a.name} ({a.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A89887] uppercase block mb-1">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as 'ABOVE' | 'BELOW')}
                className="w-full bg-[#180C10] border border-[#381B23] text-white text-xs font-bold p-2.5 rounded-xl"
              >
                <option value="ABOVE">Price Rises Above (&ge;)</option>
                <option value="BELOW">Price Drops Below (&le;)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A89887] uppercase block mb-1">Target Price ($)</label>
              <input
                type="number"
                step="any"
                value={targetPrice}
                onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#180C10] border border-[#381B23] text-white font-mono text-xs font-bold p-2.5 rounded-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#800020] text-[#E8DCC4] text-xs font-extrabold hover:bg-[#990026] transition-all"
          >
            Activate Price Monitor Trigger
          </button>
        </form>
      )}

      {/* Active Threshold Triggers Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-[#A89887] uppercase tracking-wider">Active Price Alerts ({priceAlerts.length})</h4>

        {priceAlerts.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#A89887] bg-[#211116] rounded-2xl border border-[#381B23]">
            No price alerts configured. Click "Set Threshold Alert" to monitor asset prices.
          </div>
        ) : (
          <div className="space-y-2">
            {priceAlerts.map((pa) => {
              const currentVal = livePrices[pa.asset] || 0;
              return (
                <div
                  key={pa.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    pa.active
                      ? 'bg-[#211116] border-[#381B23] hover:border-[#800020]'
                      : 'bg-[#180C10] border-[#2B141B] opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${pa.condition === 'ABOVE' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'}`}>
                      {pa.condition === 'ABOVE' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{pa.asset} Threshold</span>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          pa.active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'bg-gray-800 text-gray-400'
                        }`}>
                          {pa.active ? 'Monitoring' : 'Triggered / Paused'}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#A89887] font-mono mt-0.5">
                        Alert when price goes <strong className="text-[#E8DCC4]">{pa.condition} ${pa.targetPrice.toLocaleString()}</strong> • Current: <span className="text-white font-bold">${currentVal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePriceAlert(pa.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        pa.active
                          ? 'bg-[#3B121A] text-[#E8DCC4] border border-[#800020]'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                      }`}
                    >
                      {pa.active ? 'Pause' : 'Enable'}
                    </button>

                    <button
                      onClick={() => deletePriceAlert(pa.id)}
                      className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-950 transition-all"
                      title="Delete Alert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
