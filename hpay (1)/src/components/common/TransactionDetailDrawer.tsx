import React from 'react';
import { useHPay } from '../../context/HPayContext';
import { X, CheckCircle2, ShieldCheck, ArrowUpRight, ArrowDownLeft, Layers, Download, RefreshCw } from 'lucide-react';

export const TransactionDetailDrawer: React.FC = () => {
  const { selectedTransaction, setSelectedTransaction, addToast } = useHPay();

  if (!selectedTransaction) return null;

  const tx = selectedTransaction;

  const timelineSteps = [
    { label: 'Created', completed: true, timestamp: '17:42:01' },
    { label: 'Authenticated', completed: true, timestamp: '17:42:02' },
    { label: 'Authorized', completed: true, timestamp: '17:42:02' },
    { label: 'Processing', completed: true, timestamp: '17:42:03' },
    { label: 'Settled', completed: tx.status === 'Completed', timestamp: tx.status === 'Completed' ? '17:42:04' : 'Pending' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end">
      <div className="bg-[#180C10] border-l border-[#33171E] w-full max-w-xl h-full shadow-2xl flex flex-col text-[#F5EFE6] animate-in slide-in-from-right duration-200 overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[#2B141B] flex items-center justify-between sticky top-0 bg-[#180C10]/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${tx.direction === 'in' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'bg-rose-950 text-rose-400 border border-rose-800/40'}`}>
              {tx.direction === 'in' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{tx.merchantOrPerson}</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                  {tx.status}
                </span>
              </div>
              <p className="text-xs text-[#A89887] font-mono">Transaction ID: {tx.id}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedTransaction(null)}
            className="p-2 rounded-lg bg-[#261318] text-[#A89887] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          {/* Main Amount Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#281318] to-[#1C0D11] border border-[#3D1A22] text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#800020]/10 rounded-full blur-2xl pointer-events-none" />
            <span className="text-xs text-[#A89887] font-medium uppercase tracking-wider">Settled Amount</span>
            <div className={`text-3xl md:text-4xl font-extrabold font-mono mt-1 ${tx.direction === 'in' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {tx.direction === 'in' ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-[#A89887] mt-2 font-mono">Timestamp: {tx.timestamp}</p>
          </div>

          {/* Visual Settlement Timeline */}
          <div className="p-5 rounded-2xl bg-[#211116] border border-[#381B23] space-y-3">
            <h4 className="text-xs font-bold text-[#D4C3A3] uppercase tracking-widest flex items-center justify-between">
              <span>Settlement Rail Lifecycle</span>
              <span className="text-[10px] text-[#E8DCC4] font-mono">Harvics FastRail</span>
            </h4>
            <div className="relative pt-2">
              <div className="flex items-center justify-between relative z-10">
                {timelineSteps.map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        step.completed
                          ? 'bg-[#800020] text-[#E8DCC4] shadow-lg shadow-[#800020]/30 border border-[#E8DCC4]/30'
                          : 'bg-[#2E181E] text-[#A89887] border border-[#422028]'
                      }`}
                    >
                      {step.completed ? <CheckCircle2 className="w-4 h-4 text-[#E8DCC4]" /> : idx + 1}
                    </div>
                    <span className="text-[10px] font-medium text-[#D4C5B5] mt-2 text-center max-w-[60px]">
                      {step.label}
                    </span>
                    <span className="text-[9px] text-[#A89887] font-mono mt-0.5">{step.timestamp}</span>
                  </div>
                ))}
              </div>
              {/* Connecting line */}
              <div className="absolute top-5 left-4 right-4 h-0.5 bg-[#381B23] -z-0" />
            </div>
          </div>

          {/* Meta Details Table */}
          <div className="p-5 rounded-2xl bg-[#211116] border border-[#381B23] space-y-3 text-xs">
            <h4 className="text-xs font-bold text-[#D4C3A3] uppercase tracking-widest">Transaction Metadata</h4>
            <div className="grid grid-cols-2 gap-3 text-[#D4C5B5]">
              <div className="p-3 rounded-xl bg-[#2A141A] border border-[#3D1A22]">
                <span className="text-[10px] text-[#A89887] block">From</span>
                <span className="font-semibold text-white truncate block">{tx.senderHPayId || tx.merchantOrPerson}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#2A141A] border border-[#3D1A22]">
                <span className="text-[10px] text-[#A89887] block">To</span>
                <span className="font-semibold text-white truncate block">{tx.recipientHPayId || '@mian'}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#2A141A] border border-[#3D1A22]">
                <span className="text-[10px] text-[#A89887] block">Payment Method</span>
                <span className="font-medium text-white">{tx.paymentMethod}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#2A141A] border border-[#3D1A22]">
                <span className="text-[10px] text-[#A89887] block">Payment Rail</span>
                <span className="font-medium text-[#E8DCC4]">{tx.paymentRail}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#2A141A] border border-[#3D1A22]">
                <span className="text-[10px] text-[#A89887] block">Reference</span>
                <span className="font-mono text-[#D4C5B5]">{tx.reference}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#2A141A] border border-[#3D1A22]">
                <span className="text-[10px] text-[#A89887] block">Risk Status</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> {tx.riskStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Immutable Ledger Entries (Double-Entry Bookkeeping) */}
          <div className="p-5 rounded-2xl bg-[#211116] border border-[#381B23] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#D4C3A3] uppercase tracking-widest flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#E8DCC4]" />
                Immutable Double-Entry Ledger
              </h4>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                Balanced
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#381B23] text-[#A89887]">
                    <th className="pb-2 font-normal">Account Name</th>
                    <th className="pb-2 font-normal text-right">Debit ($)</th>
                    <th className="pb-2 font-normal text-right">Credit ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2E181E] text-[#D4C5B5]">
                  {tx.ledgerEntries.map((entry, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-sans">
                        <div className="font-medium text-white">{entry.accountName}</div>
                        <div className="text-[10px] text-[#A89887]">{entry.description}</div>
                      </td>
                      <td className="py-2.5 text-right font-bold text-rose-400">
                        {entry.debit > 0 ? entry.debit.toFixed(2) : '-'}
                      </td>
                      <td className="py-2.5 text-right font-bold text-emerald-400">
                        {entry.credit > 0 ? entry.credit.toFixed(2) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex gap-3">
            <button
              onClick={() => addToast('Receipt Downloaded', `PDF receipt generated for ${tx.id}`)}
              className="flex-1 py-3 px-4 rounded-xl bg-[#800020] hover:bg-[#990026] text-xs font-bold text-[#E8DCC4] flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#800020]/20"
            >
              <Download className="w-4 h-4" /> Download Receipt
            </button>
            <button
              onClick={() => addToast('Support Ticket Created', `Inquiry created for transaction ${tx.id}`)}
              className="py-3 px-4 rounded-xl bg-[#281318] hover:bg-[#33181F] border border-[#422028] text-xs font-semibold text-[#D4C5B5] flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Issue Support Query
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
