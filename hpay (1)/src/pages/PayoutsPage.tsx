import React, { useState } from 'react';
import { useHPay } from '../context/HPayContext';
import { CurrencyCode } from '../types';
import { ArrowUpRight, Building2, CheckCircle2, Clock, Plus, ShieldCheck } from 'lucide-react';

export const PayoutsPage: React.FC = () => {
  const { payouts, balances, createPayout, addToast } = useHPay();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [beneficiary, setBeneficiary] = useState('Emirates NBD');
  const [accountNum, setAccountNum] = useState('8829104829');
  const [amount, setAmount] = useState<number>(100);
  const [currency, setCurrency] = useState<CurrencyCode>('USD');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currency !== 'USD') {
      addToast('Transfer Failed: Live ledger payouts are USD-only', 'No silent fake — ledger unchanged.', 'error');
      return;
    }
    if (amount > balances.USD) {
      addToast('Transfer Failed: Insufficient balance', 'No silent fake — ledger unchanged.', 'error');
      return;
    }
    await createPayout('Harvics Global Ventures', beneficiary, accountNum, amount, currency);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Enterprise Bank Payouts</h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1">Direct wire payout clearance to global beneficiary accounts</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" /> Schedule Bank Payout
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-[#10141D] border border-[#202738] space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Available for Payout</span>
          <span className="text-3xl font-extrabold font-mono text-emerald-400 block">$84,250.00</span>
          <span className="text-xs text-gray-500 font-mono">Instant Clearing Eligible</span>
        </div>

        <div className="p-6 rounded-3xl bg-[#10141D] border border-[#202738] space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Pending Reserve Lock</span>
          <span className="text-3xl font-extrabold font-mono text-amber-400 block">$12,800.00</span>
          <span className="text-xs text-gray-500 font-mono">Escrow Release Pending</span>
        </div>

        <div className="p-6 rounded-3xl bg-[#10141D] border border-[#202738] space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Primary Payout Bank</span>
          <span className="text-xl font-bold text-white flex items-center gap-2 mt-1">
            <Building2 className="w-5 h-5 text-cyan-400" /> Emirates NBD (UAE)
          </span>
          <span className="text-xs text-gray-400 font-mono">Account •••• 8829</span>
        </div>
      </div>

      {/* Payout Log Table */}
      <div className="rounded-3xl bg-[#10141D] border border-[#202738] p-6 space-y-4">
        <h2 className="text-base font-bold text-white tracking-tight">Recent Payout Settlements</h2>
        <div className="divide-y divide-[#181F2F]">
          {payouts.map((po) => (
            <div key={po.id} className="py-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#161D2B] text-cyan-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">{po.beneficiaryName}</div>
                  <div className="text-[11px] text-gray-400 font-mono">{po.bankName} • {po.accountNumber} • {po.reference}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold font-mono text-white">${po.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  po.status === 'Completed' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                }`}>
                  {po.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-[#10141D] border border-[#202738] w-full max-w-md rounded-3xl p-6 space-y-4 text-white">
            <h3 className="font-bold text-base border-b pb-3 border-[#1E2536]">Initiate External Bank Payout</h3>

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">Beneficiary Bank</label>
              <select
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.target.value)}
                className="w-full bg-[#141A26] border border-[#232B3E] text-white px-3 py-2.5 rounded-xl text-xs font-bold"
              >
                <option value="Emirates NBD">Emirates NBD (Dubai, UAE)</option>
                <option value="Bank of America">Bank of America (New York, USA)</option>
                <option value="Barclays Bank">Barclays Bank (London, UK)</option>
                <option value="Habib Bank Limited">Habib Bank Limited (Karachi, PK)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">Account IBAN / Number</label>
              <input
                type="text"
                required
                value={accountNum}
                onChange={(e) => setAccountNum(e.target.value)}
                className="w-full bg-[#141A26] border border-[#232B3E] text-white px-3 py-2.5 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Amount</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-[#141A26] border border-[#232B3E] text-white px-3 py-2.5 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="w-full bg-[#141A26] border border-[#232B3E] text-white px-3 py-2.5 rounded-xl text-xs font-bold"
                >
                  <option value="USD">USD</option>
                  <option value="AED">AED</option>
                  <option value="PKR">PKR</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-[#181F2E] text-gray-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-cyan-500 text-black font-extrabold text-xs"
              >
                Confirm Wire Payout
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
