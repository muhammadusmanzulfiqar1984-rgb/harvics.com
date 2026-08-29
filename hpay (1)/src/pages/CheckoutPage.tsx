import React, { useState } from 'react';
import { useHPay } from '../context/HPayContext';
import { CurrencyCode } from '../types';
import { Link, Copy, ExternalLink, QrCode, CheckCircle2, ShieldCheck, ShoppingBag, CreditCard, Wallet, Building2 } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { paymentLinks, createPaymentLink, sendMoney, addToast, balances } = useHPay();

  // Link Form
  const [title, setTitle] = useState('Harvics Marketplace License');
  const [amount, setAmount] = useState<number>(285);
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [desc, setDesc] = useState('Includes license registration and HPay settlement gateway.');

  // Checkout Simulator State
  const [selectedMethod, setSelectedMethod] = useState<'balance' | 'card' | 'bank'>('balance');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    createPaymentLink(title, amount, currency, desc);
  };

  const handleSimulatePayment = async () => {
    setIsPaying(true);
    try {
      await sendMoney('@harvics', 'Harvics Marketplace', amount || 285, 'USD', 'Order #HM-190284');
      setPaymentDone(true);
    } catch {
      /* toast already shown by sendMoney */
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">HPay Checkout & Payment Links</h1>
        <p className="text-xs md:text-sm text-gray-400 mt-1">Generate branded payment links & test the customer checkout flow</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Payment Link Generator & Active Links */}
        <div className="space-y-6">
          <form onSubmit={handleCreateLink} className="rounded-3xl bg-[#10141D] border border-[#202738] p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Link className="w-4 h-4 text-cyan-400" /> Create Payment Link
            </h2>

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">Product or Service Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#141A26] border border-[#232B3E] text-white px-4 py-3 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Price / Amount</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-[#141A26] border border-[#232B3E] text-white px-4 py-3 rounded-xl text-xs font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="w-full bg-[#141A26] border border-[#232B3E] text-white px-4 py-3 rounded-xl text-xs font-bold"
                >
                  <option value="USD">USD ($)</option>
                  <option value="AED">AED (AED)</option>
                  <option value="PKR">PKR (PKR)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">Description</label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full bg-[#141A26] border border-[#232B3E] text-white px-4 py-3 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-all shadow-lg shadow-cyan-500/20"
            >
              Generate HPay Payment Link
            </button>
          </form>

          {/* Active Payment Links List */}
          <div className="rounded-3xl bg-[#10141D] border border-[#202738] p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Active Generated Links</h3>
            <div className="space-y-3">
              {paymentLinks.map((link) => (
                <div key={link.id} className="p-4 rounded-2xl bg-[#141A26] border border-[#222B3D] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{link.productTitle}</span>
                    <span className="text-xs font-mono font-bold text-cyan-300">${link.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono text-gray-400 pt-1 border-t border-[#1F273A]">
                    <span className="text-[11px] text-cyan-400">{link.url}</span>
                    <button
                      onClick={() => addToast('Link Copied', `Copied https://${link.url}`)}
                      className="p-1 rounded bg-[#1C2436] text-gray-300 hover:text-white"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Customer Checkout Experience Simulator */}
        <div className="rounded-3xl bg-[#10141D] border border-[#202738] p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E2536]">
            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">Customer View</span>
              <h2 className="text-base font-bold text-white">HPay Checkout Experience</h2>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>

          {!paymentDone ? (
            <div className="space-y-6">
              {/* Order Summary Box */}
              <div className="p-5 rounded-2xl bg-[#141A26] border border-[#222B3D] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Harvics Marketplace</h4>
                    <p className="text-[11px] text-gray-400">Premium Digital Trade Package</p>
                  </div>
                </div>

                <div className="divide-y divide-[#1F273A] text-xs pt-2">
                  <div className="flex justify-between py-1.5 text-gray-300">
                    <span>Premium Product</span>
                    <span className="font-mono text-white">$250.00</span>
                  </div>
                  <div className="flex justify-between py-1.5 text-gray-300">
                    <span>Express Shipping</span>
                    <span className="font-mono text-white">$20.00</span>
                  </div>
                  <div className="flex justify-between py-1.5 text-gray-300">
                    <span>Tax</span>
                    <span className="font-mono text-white">$15.00</span>
                  </div>
                  <div className="flex justify-between pt-2 font-bold text-sm">
                    <span className="text-white">Total Amount</span>
                    <span className="font-mono text-cyan-300">$285.00</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Select Payment Rail</span>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedMethod('balance')}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      selectedMethod === 'balance' ? 'bg-cyan-950/50 border-cyan-500 text-white' : 'bg-[#141A26] border-[#222B3D] text-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Wallet className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold">
                        HPay One-Click Balance ($
                        {balances.USD.toLocaleString('en-US', { minimumFractionDigits: 2 })})
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">Instant</span>
                  </button>

                  <button
                    onClick={() => setSelectedMethod('card')}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      selectedMethod === 'card' ? 'bg-cyan-950/50 border-cyan-500 text-white' : 'bg-[#141A26] border-[#222B3D] text-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold">Corporate Debit / Credit Card</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedMethod('bank')}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      selectedMethod === 'bank' ? 'bg-cyan-950/50 border-cyan-500 text-white' : 'bg-[#141A26] border-[#222B3D] text-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold">Harvics Direct Bank Rail</span>
                    </div>
                  </button>
                </div>
              </div>

              <button
                disabled={isPaying}
                onClick={handleSimulatePayment}
                className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-sm transition-all shadow-lg shadow-cyan-500/20"
              >
                {isPaying ? 'Processing Instant Checkout...' : 'Pay $285.00 Now'}
              </button>
            </div>
          ) : (
            <div className="py-8 text-center space-y-4 animate-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Checkout Completed</h3>
              <p className="text-xs text-gray-400">
                Payment of $285.00 verified by HPay Engine. Reconciled in merchant ledger.
              </p>
              <button
                onClick={() => setPaymentDone(false)}
                className="px-4 py-2 rounded-xl bg-[#1A2233] text-xs font-bold text-white"
              >
                Reset Simulator
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
