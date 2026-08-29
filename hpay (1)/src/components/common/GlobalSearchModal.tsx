import React, { useState } from 'react';
import { useHPay } from '../../context/HPayContext';
import { Search, X, ArrowUpRight, ArrowDownLeft, FileText, ShieldAlert, Store, User } from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    transactions,
    invoices,
    escrowTrades,
    payouts,
    setSelectedTransaction,
    setActiveTab
  } = useHPay();

  const [query, setQuery] = useState('');

  if (!isSearchOpen) return null;

  const q = query.trim().toLowerCase();

  // Search logic across models
  const matchingTx = q
    ? transactions.filter(
        (t) =>
          t.merchantOrPerson.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.reference.toLowerCase().includes(q) ||
          (t.recipientHPayId && t.recipientHPayId.toLowerCase().includes(q))
      )
    : transactions.slice(0, 3);

  const matchingInvoices = q
    ? invoices.filter(
        (i) =>
          i.customerName.toLowerCase().includes(q) ||
          i.invoiceNumber.toLowerCase().includes(q) ||
          i.status.toLowerCase().includes(q)
      )
    : invoices.slice(0, 2);

  const matchingEscrow = q
    ? escrowTrades.filter(
        (e) =>
          e.supplierName.toLowerCase().includes(q) ||
          e.buyerName.toLowerCase().includes(q) ||
          e.tradeTitle.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q)
      )
    : escrowTrades.slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-16 md:pt-24 px-4">
      <div className="bg-[#180C10] border border-[#33171E] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] text-[#F5EFE6]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#2B141B] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#E8DCC4] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search by HPay ID, business, invoice, transaction ID (e.g., 'ABC', 'Supplier', 'HP-928472')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-[#A89887] font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[#A89887] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="px-2.5 py-1 text-xs rounded-lg bg-[#261318] text-[#A89887] hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Quick Example Prompt if Query is "ABC" */}
          {q === 'abc' && (
            <div className="p-3.5 rounded-xl bg-[#3B121A] border border-[#5E1A29] flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-[#E8DCC4]">ABC Trading LLC</h4>
                <p className="text-xs text-[#D4C5B5]">3 transactions linked • $18,420 total volume</p>
              </div>
              <span className="text-xs font-mono font-bold text-[#E8DCC4]">@abc-trading</span>
            </div>
          )}

          {/* Transactions */}
          <div>
            <h4 className="text-xs font-bold text-[#D4C3A3] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-[#E8DCC4]" />
              Transactions ({matchingTx.length})
            </h4>
            <div className="space-y-1.5">
              {matchingTx.map((tx) => (
                <button
                  key={tx.id}
                  onClick={() => {
                    setSelectedTransaction(tx);
                    setIsSearchOpen(false);
                  }}
                  className="w-full p-3 rounded-xl bg-[#211116] hover:bg-[#2A141A] border border-[#381B23] transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${tx.direction === 'in' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                      {tx.direction === 'in' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-[#E8DCC4] transition-colors">
                        {tx.merchantOrPerson}
                      </div>
                      <div className="text-[11px] text-[#A89887] font-mono">{tx.id} • {tx.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-bold font-mono ${tx.direction === 'in' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.direction === 'in' ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <span className="text-[10px] text-[#A89887]">{tx.timestamp}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Invoices */}
          {matchingInvoices.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[#D4C3A3] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#E8DCC4]" />
                Invoices ({matchingInvoices.length})
              </h4>
              <div className="space-y-1.5">
                {matchingInvoices.map((inv) => (
                  <button
                    key={inv.id}
                    onClick={() => {
                      setActiveTab('invoices');
                      setIsSearchOpen(false);
                    }}
                    className="w-full p-3 rounded-xl bg-[#211116] hover:bg-[#2A141A] border border-[#381B23] transition-all flex items-center justify-between text-left"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{inv.customerName}</div>
                      <div className="text-[11px] text-[#A89887] font-mono">{inv.invoiceNumber} • Due {inv.dueDate}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-white">${inv.amount.toLocaleString()}</div>
                      <span className={`text-[10px] font-bold ${inv.status === 'Paid' ? 'text-emerald-400' : 'text-[#E8DCC4]'}`}>
                        {inv.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Escrow Trades */}
          {matchingEscrow.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[#D4C3A3] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#D84E69]" />
                Escrow Deals ({matchingEscrow.length})
              </h4>
              <div className="space-y-1.5">
                {matchingEscrow.map((esc) => (
                  <button
                    key={esc.id}
                    onClick={() => {
                      setActiveTab('escrow');
                      setIsSearchOpen(false);
                    }}
                    className="w-full p-3 rounded-xl bg-[#211116] hover:bg-[#2A141A] border border-[#381B23] transition-all flex items-center justify-between text-left"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{esc.tradeTitle}</div>
                      <div className="text-[11px] text-[#A89887] font-mono">{esc.id} • {esc.supplierName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-[#E8DCC4]">${esc.tradeValue.toLocaleString()}</div>
                      <span className="text-[10px] text-emerald-400 font-bold">{esc.status}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
