import React, { useState } from 'react';
import { useHPay } from '../context/HPayContext';
import { ShieldAlert, CheckCircle2, FileText, Truck, Lock, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

export const EscrowPage: React.FC = () => {
  const { escrowTrades, releaseEscrowFunds, addToast } = useHPay();

  const [activeTrade, setActiveTrade] = useState(escrowTrades[0]);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showConfirmRelease, setShowConfirmRelease] = useState(false);

  if (!activeTrade) return null;

  const handleRelease = () => {
    releaseEscrowFunds(activeTrade.id);
    setShowConfirmRelease(false);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">HPay Trade Escrow</h1>
          </div>
          <p className="text-xs md:text-sm text-gray-400 mt-1">Smart contractual escrow & programmable global commerce settlement</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-800/40 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> ESCROW GUARANTEED ($50,000.00)
          </span>
        </div>
      </div>

      {/* Main Trade Active Card */}
      <div className="rounded-3xl bg-[#10141D] border border-[#202738] p-6 md:p-8 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#1E2536]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400">{activeTrade.id}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTrade.status === 'Settled' ? 'bg-emerald-950 text-emerald-400' : 'bg-cyan-950 text-cyan-300'
              }`}>
                {activeTrade.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">{activeTrade.tradeTitle}</h2>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Buyer</span>
              <span className="text-sm font-semibold text-white">{activeTrade.buyerName}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-500" />
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Supplier</span>
              <span className="text-sm font-semibold text-white">{activeTrade.supplierName}</span>
            </div>
            <div className="pl-6 border-l border-[#1E2536]">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Escrow Secured Value</span>
              <span className="text-2xl font-black font-mono text-cyan-300">${activeTrade.tradeValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Visual Escrow Milestone Progress Timeline */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">Escrow Contractual Milestone Timeline</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {activeTrade.timeline.map((step, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all ${
                  step.completed
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-white'
                    : 'bg-[#141A26] border-[#20283A] text-gray-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-gray-400">Step {step.step}</span>
                  {step.completed && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <div className="text-xs font-bold leading-tight">{step.label}</div>
                <div className="text-[9px] font-mono text-gray-400 mt-2">{step.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-[#1E2536] flex flex-wrap gap-3">
          <button
            onClick={() => setShowContractModal(true)}
            className="px-4 py-3 rounded-xl bg-[#161D2B] border border-[#232B3E] hover:border-cyan-500/40 text-xs font-bold text-white flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-cyan-400" /> View Contract Docs
          </button>
          <button
            onClick={() => addToast('Documents Verified', 'Bill of Lading & Customs Declaration verified.')}
            className="px-4 py-3 rounded-xl bg-[#161D2B] border border-[#232B3E] hover:border-cyan-500/40 text-xs font-bold text-white flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-amber-400" /> View Shipping Docs
          </button>
          <button
            onClick={() => addToast('Logistics Tracked', `Tracking ${activeTrade.trackingNumber} via Harvics Express`)}
            className="px-4 py-3 rounded-xl bg-[#161D2B] border border-[#232B3E] hover:border-cyan-500/40 text-xs font-bold text-white flex items-center gap-2"
          >
            <Truck className="w-4 h-4 text-emerald-400" /> Track Shipment
          </button>

          {activeTrade.status !== 'Settled' && (
            <button
              onClick={() => setShowConfirmRelease(true)}
              className="ml-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20"
            >
              Release Escrow Funds ($50,000.00)
            </button>
          )}
        </div>
      </div>

      {/* Contract Modal */}
      {showContractModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#10141D] border border-[#202738] w-full max-w-lg rounded-3xl p-6 space-y-4 text-white">
            <h3 className="font-bold text-base border-b pb-3 border-[#1E2536]">Smart Escrow Contract Agreement</h3>
            <div className="text-xs text-gray-300 font-mono space-y-2 bg-[#0E121B] p-4 rounded-xl border border-[#20283B]">
              <p>Contract Ref: ESCROW-HGV-ABC-2026</p>
              <p>Buyer: Harvics Global Ventures (@mian)</p>
              <p>Supplier: ABC Trading LLC (@abc-trading)</p>
              <p>Locked Amount: $50,000.00 USD</p>
              <p>Condition: Automatic or buyer-signed release upon delivery verification at Dubai port.</p>
            </div>
            <button
              onClick={() => setShowContractModal(false)}
              className="w-full py-3 rounded-xl bg-[#181F2E] text-white font-bold text-xs"
            >
              Close Contract
            </button>
          </div>
        </div>
      )}

      {/* Release Confirmation Modal */}
      {showConfirmRelease && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#10141D] border border-[#202738] w-full max-w-md rounded-3xl p-6 space-y-4 text-white text-center">
            <div className="w-12 h-12 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">Confirm Escrow Release</h3>
            <p className="text-xs text-gray-400">
              Are you sure you want to release <span className="text-cyan-300 font-mono font-bold">$50,000.00</span> to ABC Trading LLC? This action is irrevocable.
            </p>
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-300">
              DEMO / SIMULATED ESCROW EXECUTION
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmRelease(false)}
                className="flex-1 py-3 rounded-xl bg-[#181F2E] text-gray-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleRelease}
                className="flex-1 py-3 rounded-xl bg-cyan-500 text-black font-extrabold text-xs"
              >
                Confirm Release
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
