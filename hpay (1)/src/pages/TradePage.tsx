import React from 'react';
import { useHPay } from '../context/HPayContext';
import { ShieldCheck, Truck, ArrowRight, Layers, Lock, FileText } from 'lucide-react';

export const TradePage: React.FC = () => {
  const { escrowTrades, setActiveTab } = useHPay();

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Supply Chain Trade Network</h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1">Cross-border trade execution & automated multi-currency settlement</p>
        </div>

        <button
          onClick={() => setActiveTab('escrow')}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-all flex items-center gap-2"
        >
          <Lock className="w-4 h-4" /> Open Escrow Desk
        </button>
      </div>

      {/* Active Trades Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">Active Commerce Trade Contracts</h2>
        <div className="space-y-4">
          {escrowTrades.map((trade) => (
            <div key={trade.id} className="p-6 rounded-3xl bg-[#10141D] border border-[#202738] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E2536]">
                <div>
                  <span className="text-xs font-mono text-cyan-400">{trade.id}</span>
                  <h3 className="text-base font-bold text-white mt-0.5">{trade.tradeTitle}</h3>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold font-mono text-cyan-300">${trade.tradeValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">{trade.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <span className="text-gray-500 block text-[10px]">BUYER</span>
                  <span className="font-bold text-white">{trade.buyerName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">SUPPLIER</span>
                  <span className="font-bold text-white">{trade.supplierName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">TRACKING</span>
                  <span className="font-bold text-cyan-400">{trade.trackingNumber}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">INCOTERM</span>
                  <span className="font-bold text-amber-400">CIF DUBAI PORT</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveTab('escrow')}
                  className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
                >
                  Inspect Milestone Controls <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
