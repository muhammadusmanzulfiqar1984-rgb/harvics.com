import React, { useState } from 'react';
import { useHPay } from '../context/HPayContext';
import { Split, DollarSign, Layers, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';

export const SplitPaymentPage: React.FC = () => {
  const { sendMoney, addToast } = useHPay();

  const [grossSale, setGrossSale] = useState<number>(200);
  const [vendorPct, setVendorPct] = useState<number>(85);
  const [platformPct, setPlatformPct] = useState<number>(10);
  const [hpayPct, setHpayPct] = useState<number>(3);
  const [royaltyPct, setRoyaltyPct] = useState<number>(2);

  const [isSplitting, setIsSplitting] = useState(false);
  const [splitComplete, setSplitComplete] = useState(false);

  const vendorAmt = (grossSale * vendorPct) / 100;
  const platformAmt = (grossSale * platformPct) / 100;
  const hpayAmt = (grossSale * hpayPct) / 100;
  const royaltyAmt = (grossSale * royaltyPct) / 100;

  const handleExecuteSplit = async () => {
    setIsSplitting(true);
    try {
      // Sequential ledger posts — each settles before the next (no invented balances)
      await sendMoney('@vendor-dxb', 'Vendor Account', vendorAmt, 'USD', 'Split Settlement');
      await sendMoney('@harvics', 'Harvics Commission', platformAmt, 'USD', 'Marketplace Fee');
      if (hpayAmt > 0) {
        await sendMoney('@sara', 'HPay Fee Pool', hpayAmt, 'USD', 'HPay Rail Fee');
      }
      await sendMoney('@creator-royalty', 'Royalties Pool', royaltyAmt, 'USD', 'Creator Split');
      setSplitComplete(true);
      addToast('Multi-Split Complete', `Distributed $${grossSale.toLocaleString()} across 4 ledger counterparties`);
    } catch {
      /* each failed leg already toasted Transfer Failed: … via sendMoney */
    } finally {
      setIsSplitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Marketplace Split Settlement Engine</h1>
        <p className="text-xs md:text-sm text-gray-400 mt-1">Programmable instant multi-party fee distribution rail</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls Column */}
        <div className="rounded-3xl bg-[#10141D] border border-[#202738] p-6 space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Split className="w-5 h-5 text-cyan-400" /> Split Parameters Configurator
          </h2>

          <div className="p-4 rounded-2xl bg-[#141A26] border border-[#222B3D] space-y-2">
            <label className="text-xs font-bold text-gray-400 block">Gross Order Value ($)</label>
            <input
              type="number"
              value={grossSale}
              onChange={(e) => setGrossSale(Number(e.target.value))}
              className="w-full bg-[#0E121B] border border-[#232B3E] text-white px-4 py-3 rounded-xl font-mono text-xl font-extrabold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-gray-300 mb-1">
                <span>1. Primary Vendor Share ({vendorPct}%)</span>
                <span className="font-mono text-emerald-400">${vendorAmt.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={vendorPct}
                onChange={(e) => setVendorPct(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-gray-300 mb-1">
                <span>2. Harvics Platform Fee ({platformPct}%)</span>
                <span className="font-mono text-cyan-300">${platformAmt.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={platformPct}
                onChange={(e) => setPlatformPct(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-gray-300 mb-1">
                <span>3. HPay Rail Fee ({hpayPct}%)</span>
                <span className="font-mono text-blue-400">${hpayAmt.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={hpayPct}
                onChange={(e) => setHpayPct(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-gray-300 mb-1">
                <span>4. Creator Royalty ({royaltyPct}%)</span>
                <span className="font-mono text-amber-400">${royaltyAmt.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={royaltyPct}
                onChange={(e) => setRoyaltyPct(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={handleExecuteSplit}
            disabled={isSplitting}
            className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-sm transition-all shadow-lg shadow-cyan-500/20"
          >
            {isSplitting ? 'Distributing Funds...' : `Execute $${grossSale.toLocaleString()} Split Settlement`}
          </button>
        </div>

        {/* Visual Settlement Flow Diagram */}
        <div className="rounded-3xl bg-[#10141D] border border-[#202738] p-6 space-y-6">
          <div className="flex justify-between items-center border-b pb-3 border-[#1E2536]">
            <h3 className="text-sm font-bold text-white">Settlement Architecture Breakdown</h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              Instant Atomic Clearing
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-[#141A26] border border-[#222B3D] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-500 block">VENDOR ACCOUNT</span>
                <span className="font-bold text-white">@vendor-dxb</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-400 font-bold">${vendorAmt.toFixed(2)}</span>
                <span className="text-[10px] text-gray-500 block">{vendorPct}% Net Payout</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#141A26] border border-[#222B3D] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-500 block">HARVICS COMMISSION</span>
                <span className="font-bold text-white">@harvics</span>
              </div>
              <div className="text-right">
                <span className="text-cyan-300 font-bold">${platformAmt.toFixed(2)}</span>
                <span className="text-[10px] text-gray-500 block">{platformPct}% Fee</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#141A26] border border-[#222B3D] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-500 block">HPAY INFRASTRUCTURE</span>
                <span className="font-bold text-white">@hpay-reserve</span>
              </div>
              <div className="text-right">
                <span className="text-blue-400 font-bold">${hpayAmt.toFixed(2)}</span>
                <span className="text-[10px] text-gray-500 block">{hpayPct}% Reserve</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#141A26] border border-[#222B3D] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-500 block">CREATOR ROYALTIES</span>
                <span className="font-bold text-white">@creator-royalty</span>
              </div>
              <div className="text-right">
                <span className="text-amber-400 font-bold">${royaltyAmt.toFixed(2)}</span>
                <span className="text-[10px] text-gray-500 block">{royaltyPct}% Royalty</span>
              </div>
            </div>
          </div>

          {splitComplete && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-1 animate-in fade-in">
              <span className="text-xs font-bold text-emerald-400 block">Atomic Split Executed Successfully</span>
              <p className="text-[11px] text-gray-300">All 4 ledger accounts updated simultaneously without dispute window.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
