import React, { useState } from 'react';
import { useHPay } from '../context/HPayContext';
import { CurrencyCode } from '../types';
import {
  Send,
  ArrowDownLeft,
  QrCode,
  Search,
  CheckCircle2,
  DollarSign,
  Copy,
  Share2,
  Download,
  Camera,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const PayPage: React.FC = () => {
  const { sendMoney, requestMoney, balances, addToast } = useHPay();

  const [activeTab, setActiveTab] = useState<'send' | 'request' | 'qr'>('send');

  // Send Form State
  const [sendStep, setSendStep] = useState<1 | 2 | 3 | 4>(1);
  const [recipientHPayId, setRecipientHPayId] = useState('@ahmed');
  const [recipientName, setRecipientName] = useState('Ahmed Khan');
  const [amount, setAmount] = useState<number>(10);
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTxId, setLastTxId] = useState('');

  // Request Form State
  const [reqHPayId, setReqHPayId] = useState('@abc-trading');
  const [reqAmount, setReqAmount] = useState<number>(1500);
  const [reqCurrency, setReqCurrency] = useState<CurrencyCode>('USD');
  const [reqDesc, setReqDesc] = useState('Commercial Invoice Settle #882');
  const [reqDueDate, setReqDueDate] = useState('2026-08-25');

  // QR Tab state
  const [qrMode, setQrMode] = useState<'scan' | 'receive'>('scan');
  const [isScanning, setIsScanning] = useState(false);

  const sampleRecipients = [
    { name: 'Ahmed Khan', id: '@ahmed' },
    { name: 'Sara Malik', id: '@sara' },
    { name: 'Harvics Marketplace', id: '@harvics' },
  ];

  const handleSendSubmit = async () => {
    setIsProcessing(true);
    try {
      const tx = await sendMoney(recipientHPayId, recipientName, amount, currency, note);
      setLastTxId(tx.id);
      setSendStep(4);
    } catch {
      /* toast: Transfer Failed: … from sendMoney — no duplicate */
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestMoney(reqHPayId, reqAmount, reqCurrency, reqDesc, reqDueDate);
    setReqAmount(0);
    setReqDesc('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#F5EFE6] tracking-tight">Payments & Transfers</h1>
        <p className="text-xs md:text-sm text-[#A89887] mt-1">Instant net settlement across HPay commerce rails</p>
      </div>

      {/* Primary Sub-Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-[#180C10] rounded-2xl border border-[#33171E]">
        <button
          onClick={() => setActiveTab('send')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'send'
              ? 'bg-[#800020] text-[#E8DCC4] shadow-lg shadow-[#800020]/20 border border-[#E8DCC4]/20'
              : 'text-[#A89887] hover:text-white hover:bg-[#231217]'
          }`}
        >
          <Send className="w-4 h-4" /> Send Money
        </button>
        <button
          onClick={() => setActiveTab('request')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'request'
              ? 'bg-[#800020] text-[#E8DCC4] shadow-lg shadow-[#800020]/20 border border-[#E8DCC4]/20'
              : 'text-[#A89887] hover:text-white hover:bg-[#231217]'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" /> Request Payment
        </button>
        <button
          onClick={() => setActiveTab('qr')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'qr'
              ? 'bg-[#800020] text-[#E8DCC4] shadow-lg shadow-[#800020]/20 border border-[#E8DCC4]/20'
              : 'text-[#A89887] hover:text-white hover:bg-[#231217]'
          }`}
        >
          <QrCode className="w-4 h-4" /> QR Payment
        </button>
      </div>

      {/* ----------------- TAB 1: SEND MONEY ----------------- */}
      {activeTab === 'send' && (
        <div className="rounded-3xl bg-[#180C10] border border-[#33171E] p-6 md:p-8 space-y-6">
          {/* Step Indicator */}
          {sendStep < 4 && (
            <div className="flex items-center justify-between text-xs font-mono pb-4 border-b border-[#2B141B]">
              <span className={`font-bold ${sendStep >= 1 ? 'text-[#E8DCC4]' : 'text-[#665548]'}`}>1. Recipient</span>
              <span className="text-[#665548]">→</span>
              <span className={`font-bold ${sendStep >= 2 ? 'text-[#E8DCC4]' : 'text-[#665548]'}`}>2. Amount</span>
              <span className="text-[#665548]">→</span>
              <span className={`font-bold ${sendStep >= 3 ? 'text-[#E8DCC4]' : 'text-[#665548]'}`}>3. Review</span>
            </div>
          )}

          {/* STEP 1: Search HPay ID */}
          {sendStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Select Recipient</h3>
                <p className="text-xs text-[#A89887]">Search by HPay ID, business name, or select from recent contacts</p>
              </div>

              <div className="relative">
                <Search className="w-5 h-5 text-[#A89887] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter HPay ID (e.g. @harvics, @abc-trading)"
                  value={recipientHPayId}
                  onChange={(e) => {
                    setRecipientHPayId(e.target.value);
                    setRecipientName(e.target.value);
                  }}
                  className="w-full bg-[#211116] border border-[#381B23] focus:border-[#800020] text-white pl-12 pr-4 py-3.5 rounded-2xl text-sm font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-[#A89887] uppercase tracking-wider block">Suggested Harvics Accounts</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sampleRecipients.map((rec) => (
                    <button
                      key={rec.id}
                      onClick={() => {
                        setRecipientHPayId(rec.id);
                        setRecipientName(rec.name);
                        setSendStep(2);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        recipientHPayId === rec.id
                          ? 'bg-[#3B121A] border-[#800020] text-[#E8DCC4]'
                          : 'bg-[#211116] border-[#381B23] text-[#D4C5B5] hover:border-[#5E1A29]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{rec.name}</div>
                        <div className="text-[11px] font-mono text-[#E8DCC4]">{rec.id}</div>
                      </div>
                      <UserCheck className="w-4 h-4 text-[#A89887]" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={!recipientHPayId}
                onClick={() => setSendStep(2)}
                className="w-full py-4 rounded-2xl bg-[#800020] hover:bg-[#990026] text-[#E8DCC4] font-extrabold text-sm transition-all disabled:opacity-50 border border-[#E8DCC4]/20 shadow-lg shadow-[#800020]/20"
              >
                Continue to Amount
              </button>
            </div>
          )}

          {/* STEP 2: Enter Amount */}
          {sendStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Enter Amount & Currency</h3>
                <p className="text-xs text-[#A89887]">Sending to <span className="text-[#E8DCC4] font-mono font-bold">{recipientName} ({recipientHPayId})</span></p>
              </div>

              <div className="p-6 rounded-2xl bg-[#211116] border border-[#381B23] space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold font-mono text-[#A89887]">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full bg-[#180C10] border border-[#381B23] focus:border-[#800020] text-white pl-10 pr-4 py-4 rounded-xl text-2xl font-bold font-mono focus:outline-none"
                    />
                  </div>

                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className="bg-[#180C10] border border-[#381B23] text-white text-sm font-bold px-4 py-4 rounded-xl cursor-pointer"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="AED">AED (AED)</option>
                    <option value="PKR">PKR (PKR)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USDC">USDC (Stablecoin)</option>
                    <option value="USDT">USDT (Tether)</option>
                    <option value="eUSD">eUSD (Digital Dollar)</option>
                    <option value="eAED">eAED (Digital Dirham)</option>
                    <option value="BTC">BTC (Bitcoin)</option>
                    <option value="ETH">ETH (Ethereum)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between text-xs text-[#A89887] font-mono pt-2">
                  <span>Available in {currency}: {balances[currency].toLocaleString()}</span>
                  <button
                    onClick={() => setAmount(balances[currency])}
                    className="text-[#E8DCC4] font-bold hover:underline"
                  >
                    Use Max
                  </button>
                </div>
              </div>

              <input
                type="text"
                placeholder="Add optional payment reference/note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-[#211116] border border-[#381B23] text-white px-4 py-3.5 rounded-2xl text-xs focus:outline-none"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setSendStep(1)}
                  className="py-4 px-6 rounded-2xl bg-[#2B141B] text-[#D4C5B5] font-bold text-sm"
                >
                  Back
                </button>
                <button
                  disabled={amount <= 0 || amount > balances[currency]}
                  onClick={() => setSendStep(3)}
                  className="flex-1 py-4 rounded-2xl bg-[#800020] hover:bg-[#990026] text-[#E8DCC4] font-extrabold text-sm transition-all disabled:opacity-50 border border-[#E8DCC4]/20 shadow-lg shadow-[#800020]/20"
                >
                  Review Transfer
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {sendStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Review Payment Details</h3>
                <p className="text-xs text-[#A89887]">Harvics net settlement lock preview</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#211116] border border-[#381B23] space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-[#2B141B]">
                  <span className="text-[#A89887]">Recipient</span>
                  <span className="font-bold text-white font-mono">{recipientName} ({recipientHPayId})</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#2B141B]">
                  <span className="text-[#A89887]">Transfer Amount</span>
                  <span className="font-bold text-white font-mono">{currency} {amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#2B141B]">
                  <span className="text-[#A89887]">HPay Instant Rail Fee</span>
                  <span className="font-bold text-emerald-400 font-mono">$0.00 (Zero Fee)</span>
                </div>
                <div className="flex justify-between py-2 pt-3 text-sm">
                  <span className="font-bold text-[#D4C5B5]">Total Deducted</span>
                  <span className="font-extrabold text-[#E8DCC4] font-mono">{currency} {amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSendStep(2)}
                  className="py-4 px-6 rounded-2xl bg-[#2B141B] text-[#D4C5B5] font-bold text-sm"
                >
                  Edit
                </button>
                <button
                  disabled={isProcessing}
                  onClick={handleSendSubmit}
                  className="flex-1 py-4 rounded-2xl bg-[#800020] hover:bg-[#990026] text-[#E8DCC4] font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#800020]/30 border border-[#E8DCC4]/20"
                >
                  {isProcessing ? 'Authenticating & Settling...' : 'Confirm & Settle Payment'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success Animation */}
          {sendStep === 4 && (
            <div className="py-12 text-center space-y-4 animate-in zoom-in duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-950 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Payment Successfully Sent</h2>
              <p className="text-xs font-mono text-[#E8DCC4]">Transaction Reference: {lastTxId}</p>
              <p className="text-xs text-[#A89887] max-w-sm mx-auto">
                {currency} {amount.toLocaleString()} has been instantly credited to {recipientName}. Ledger entry reconciled.
              </p>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setSendStep(1);
                    setAmount(250);
                  }}
                  className="px-6 py-3 rounded-xl bg-[#2B141B] text-xs font-bold text-white hover:bg-[#381B23]"
                >
                  Send Another
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB 2: REQUEST PAYMENT ----------------- */}
      {activeTab === 'request' && (
        <form onSubmit={handleRequestSubmit} className="rounded-3xl bg-[#180C10] border border-[#33171E] p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Request Payment</h3>
            <p className="text-xs text-[#A89887]">Generate a digital payment request delivered to recipient's HPay inbox</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#A89887] block mb-1">Recipient HPay ID</label>
              <input
                type="text"
                required
                value={reqHPayId}
                onChange={(e) => setReqHPayId(e.target.value)}
                className="w-full bg-[#211116] border border-[#381B23] text-white px-4 py-3.5 rounded-2xl text-xs font-mono focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#A89887] block mb-1">Requested Amount</label>
                <input
                  type="number"
                  required
                  value={reqAmount}
                  onChange={(e) => setReqAmount(Number(e.target.value))}
                  className="w-full bg-[#211116] border border-[#381B23] text-white px-4 py-3.5 rounded-2xl text-xs font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#A89887] block mb-1">Currency</label>
                <select
                  value={reqCurrency}
                  onChange={(e) => setReqCurrency(e.target.value as CurrencyCode)}
                  className="w-full bg-[#211116] border border-[#381B23] text-white px-4 py-3.5 rounded-2xl text-xs font-bold"
                >
                  <option value="USD">USD ($)</option>
                  <option value="AED">AED (AED)</option>
                  <option value="PKR">PKR (PKR)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="USDC">USDC (Stablecoin)</option>
                  <option value="USDT">USDT (Tether)</option>
                  <option value="eUSD">eUSD (Digital Dollar)</option>
                  <option value="eAED">eAED (Digital Dirham)</option>
                  <option value="BTC">BTC (Bitcoin)</option>
                  <option value="ETH">ETH (Ethereum)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#A89887] block mb-1">Description / Reference</label>
              <input
                type="text"
                required
                value={reqDesc}
                onChange={(e) => setReqDesc(e.target.value)}
                className="w-full bg-[#211116] border border-[#381B23] text-white px-4 py-3.5 rounded-2xl text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#A89887] block mb-1">Due Date</label>
              <input
                type="date"
                required
                value={reqDueDate}
                onChange={(e) => setReqDueDate(e.target.value)}
                className="w-full bg-[#211116] border border-[#381B23] text-white px-4 py-3.5 rounded-2xl text-xs font-mono focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-[#800020] hover:bg-[#990026] text-[#E8DCC4] font-extrabold text-sm transition-all border border-[#E8DCC4]/20 shadow-lg shadow-[#800020]/20"
          >
            Send Payment Request
          </button>
        </form>
      )}

      {/* ----------------- TAB 3: QR PAYMENT ----------------- */}
      {activeTab === 'qr' && (
        <div className="rounded-3xl bg-[#180C10] border border-[#33171E] p-6 md:p-8 space-y-6 text-center">
          <div className="flex justify-center gap-2 max-w-xs mx-auto p-1 bg-[#211116] rounded-2xl border border-[#381B23]">
            <button
              onClick={() => setQrMode('scan')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                qrMode === 'scan' ? 'bg-[#800020] text-[#E8DCC4]' : 'text-[#A89887]'
              }`}
            >
              Scan QR Code
            </button>
            <button
              onClick={() => setQrMode('receive')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                qrMode === 'receive' ? 'bg-[#800020] text-[#E8DCC4]' : 'text-[#A89887]'
              }`}
            >
              My HPay QR
            </button>
          </div>

          {qrMode === 'scan' ? (
            <div className="py-8 space-y-6 max-w-md mx-auto">
              <div className="relative aspect-square rounded-3xl bg-[#10080B] border-2 border-dashed border-[#800020]/60 flex flex-col items-center justify-center p-6 overflow-hidden">
                <div className="absolute inset-4 border-2 border-[#E8DCC4]/30 rounded-2xl animate-pulse pointer-events-none" />
                <Camera className="w-12 h-12 text-[#E8DCC4] mb-3" />
                <p className="text-xs text-[#D4C5B5] font-semibold">Position merchant or user HPay QR inside camera frame</p>
                <button
                  onClick={() => {
                    setIsScanning(true);
                    setTimeout(() => {
                      setIsScanning(false);
                      addToast('QR Scanned', 'Detected merchant @celavi-dxb for $85.00');
                      setActiveTab('send');
                    }, 1500);
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#800020] text-[#E8DCC4] text-xs font-bold shadow border border-[#E8DCC4]/20"
                >
                  {isScanning ? 'Scanning camera...' : 'Simulate Camera Scan'}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 space-y-6 max-w-md mx-auto">
              <div className="p-6 rounded-3xl bg-white text-black max-w-xs mx-auto shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="font-extrabold text-sm text-[#800020]">HPay™ QR</span>
                  <ShieldCheck className="w-4 h-4 text-[#800020]" />
                </div>
                {/* Generated QR Placeholder SVG */}
                <div className="aspect-square bg-[#180C10] rounded-2xl p-4 flex items-center justify-center">
                  <div className="grid grid-cols-5 gap-2 w-full h-full p-2 bg-white rounded-lg">
                    {Array.from({ length: 25 }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`rounded-sm ${idx % 2 === 0 || idx % 3 === 0 ? 'bg-[#800020]' : 'bg-white'}`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="font-mono font-bold text-lg text-[#180C10]">@mian</div>
                  <p className="text-[11px] text-gray-600 font-medium">Scan to pay Mian Muhammad Usman</p>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => addToast('QR Link Copied', 'hpay.me/qr/@mian copied to clipboard')}
                  className="px-4 py-2.5 rounded-xl bg-[#211116] border border-[#381B23] text-xs font-bold text-[#E8DCC4] flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" /> Share QR
                </button>
                <button
                  onClick={() => addToast('QR Image Downloaded', 'Saved HPay-QR-mian.png')}
                  className="px-4 py-2.5 rounded-xl bg-[#211116] border border-[#381B23] text-xs font-bold text-[#E8DCC4] flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download QR
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
