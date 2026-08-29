import React, { useState } from 'react';
import { useHPay } from '../context/HPayContext';
import { Search, ArrowUpRight, ArrowDownLeft, Filter, Layers, Download, FileText } from 'lucide-react';
import { exportTransactionsToCSV, exportTransactionsToPDF } from '../services/exportService';

export const ActivityPage: React.FC = () => {
  const { transactions, profile, setSelectedTransaction, addToast } = useHPay();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.merchantOrPerson.toLowerCase().includes(search.toLowerCase()) ||
      tx.id.toLowerCase().includes(search.toLowerCase()) ||
      tx.category.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || tx.status.toUpperCase() === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Financial Activity & Immutable Ledger</h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1">Real-time ledger audit trail for Harvics Global Ventures</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              exportTransactionsToCSV(filtered);
              addToast('Export Complete', 'Downloaded transaction_ledger.csv');
            }}
            className="px-4 py-2.5 rounded-xl bg-[#211116] border border-[#381B23] hover:border-[#800020] text-xs font-bold text-[#E8DCC4] transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-[#E8DCC4]" /> Export CSV
          </button>
          <button
            onClick={() => {
              exportTransactionsToPDF(filtered, profile);
              addToast('PDF Statement Generated', 'Opening print preview...');
            }}
            className="px-4 py-2.5 rounded-xl bg-[#800020] hover:bg-[#990026] text-xs font-extrabold text-[#E8DCC4] transition-all flex items-center gap-2 border border-[#E8DCC4]/20"
          >
            <FileText className="w-4 h-4 text-[#E8DCC4]" /> Export PDF Statement
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A89887] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by merchant, transaction ID or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#180C10] border border-[#33171E] text-white pl-10 pr-4 py-3 rounded-xl text-xs font-medium focus:outline-none focus:border-[#800020]"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#180C10] rounded-xl border border-[#33171E]">
          {['ALL', 'COMPLETED', 'PENDING'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterStatus === st ? 'bg-[#800020] text-[#E8DCC4] shadow' : 'text-[#A89887] hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-3xl bg-[#180C10] border border-[#33171E] overflow-hidden">
        <div className="p-4 border-b border-[#2B141B] flex items-center justify-between text-xs text-[#A89887] font-mono">
          <span>Showing {filtered.length} transactions</span>
          <span className="flex items-center gap-1 text-[#E8DCC4]">
            <Layers className="w-3.5 h-3.5" /> Double-Entry Reconciled
          </span>
        </div>

        <div className="divide-y divide-[#2B141B]">
          {filtered.map((tx) => (
            <div
              key={tx.id}
              onClick={() => setSelectedTransaction(tx)}
              className="p-4 hover:bg-[#211116] transition-all cursor-pointer flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3.5">
                <div className={`p-2.5 rounded-xl ${tx.direction === 'in' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40' : 'bg-rose-950/80 text-rose-400 border border-rose-800/40'}`}>
                  {tx.direction === 'in' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-[#E8DCC4] transition-colors">
                    {tx.merchantOrPerson}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-[#A89887] font-mono mt-0.5">
                    <span>{tx.id}</span>
                    <span>•</span>
                    <span>{tx.category}</span>
                    <span>•</span>
                    <span>{tx.paymentMethod}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-xs font-bold font-mono tabular-nums ${tx.direction === 'in' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {tx.direction === 'in' ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center justify-end gap-2 mt-0.5">
                  <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full ${
                    tx.status === 'Completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-[#4A2012] text-[#E8DCC4] border border-[#6B2F1B]'
                  }`}>
                    {tx.status}
                  </span>
                  <span className="text-[10px] text-[#A89887] font-mono">{tx.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
