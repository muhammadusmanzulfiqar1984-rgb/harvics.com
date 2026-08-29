import React, { useState } from 'react';
import { useHPay } from '../../context/HPayContext';
import { CurrencyCode } from '../../types';
import { QrCode, Send, ArrowDownLeft, X, Copy, Check, ShieldCheck, Zap } from 'lucide-react';

interface QuickPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'pay' | 'receive' | 'qr';
}

export const QuickPayModal: React.FC<QuickPayModalProps> = ({ isOpen, onClose, defaultMode = 'pay' }) => {
  const { profile, balances, addToast, sendMoney } = useHPay();
  const [mode, setMode] = useState<'pay' | 'receive' | 'qr'>(defaultMode);

  const [recipient, setRecipient] = useState('@ahmed');
  const [amount, setAmount] = useState<number>(10);
  const [asset, setAsset] = useState<CurrencyCode>('USD');
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const favoriteContacts = [
    { name: 'Ahmed Khan', hpayId: '@ahmed', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
    { name: 'Sara Malik', hpayId: '@sara', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80' },
    { name: 'Harvics Marketplace', hpayId: '@harvics', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
  ];

  const handleSendPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || amount <= 0 || sending) return;

    if (asset !== 'USD') {
      addToast('Transfer Failed: Live ledger transfers are USD-only', 'No silent fake — ledger unchanged.', 'error');
      return;
    }

    setSending(true);
    try {
      const id = recipient.startsWith('@') ? recipient : `@${recipient}`;
      await sendMoney(id, recipient, amount, 'USD', note);
      onClose();
    } catch {
      /* Transfer Failed toast from context */
    } finally {
      setSending(false);
    }
  };

  const copyPayLink = () => {
    navigator.clipboard?.writeText?.(`https://hpay.harvics.com/pay/${profile.hpayId}`);
    setCopied(true);
    addToast('PayLink Copied', `Copied https://hpay.harvics.com/pay/${profile.hpayId}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#180C10] border border-[#3D1A22] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white">
        <div className="p-5 border-b border-[#2B141B] flex items-center justify-between bg-[#211116]">
          <div className="flex items-center gap-1.5 p-1 bg-[#180C10] rounded-xl border border-[#33171E]">
            <button
              onClick={() => setMode('pay')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'pay' ? 'bg-[#800020] text-[#E8DCC4]' : 'text-[#A89887] hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" /> Quick Pay
            </button>
            <button
              onClick={() => setMode('receive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'receive' ? 'bg-[#800020] text-[#E8DCC4]' : 'text-[#A89887] hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" /> Request / Receive
            </button>
            <button
              onClick={() => setMode('qr')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'qr' ? 'bg-[#800020] text-[#E8DCC4]' : 'text-[#A89887] hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" /> QR Code
            </button>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[#2B141B] text-[#A89887]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {mode === 'pay' && (
            <form onSubmit={handleSendPayment} className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {favoriteContacts.map((c) => (
                  <button
                    key={c.hpayId}
                    type="button"
                    onClick={() => setRecipient(c.hpayId)}
                    className={`shrink-0 px-3 py-2 rounded-xl border text-[11px] font-bold ${
                      recipient === c.hpayId
                        ? 'border-[#800020] bg-[#3B121A] text-[#E8DCC4]'
                        : 'border-[#33171E] bg-[#211116] text-[#A89887]'
                    }`}
                  >
                    {c.hpayId}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#A89887] uppercase tracking-wider">Recipient</label>
                <input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="mt-1 w-full bg-[#211116] border border-[#33171E] rounded-xl px-4 py-3 text-sm font-mono"
                  placeholder="@ahmed"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#A89887] uppercase tracking-wider">Amount</label>
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="mt-1 w-full bg-[#211116] border border-[#33171E] rounded-xl px-4 py-3 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#A89887] uppercase tracking-wider">Asset</label>
                  <select
                    value={asset}
                    onChange={(e) => setAsset(e.target.value as CurrencyCode)}
                    className="mt-1 w-full bg-[#211116] border border-[#33171E] rounded-xl px-4 py-3 text-sm"
                  >
                    <option value="USD">USD (ledger)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#A89887] uppercase tracking-wider">Note</label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 w-full bg-[#211116] border border-[#33171E] rounded-xl px-4 py-3 text-sm"
                  placeholder="Optional"
                />
              </div>
              <p className="text-[11px] text-[#A89887]">
                Available ledger USD: ${balances.USD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 rounded-xl bg-[#800020] text-[#E8DCC4] font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                {sending ? 'Posting to ledger…' : 'Send via POST /transfers'}
              </button>
            </form>
          )}

          {mode === 'receive' && (
            <div className="space-y-4 text-center">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm text-[#E8DCC4]">Share your HPay ID to receive ledger credits</p>
              <p className="font-mono text-lg text-white">{profile.hpayId}</p>
              <button
                type="button"
                onClick={copyPayLink}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2B141B] text-xs font-bold"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Pay Link
              </button>
            </div>
          )}

          {mode === 'qr' && (
            <div className="space-y-3 text-center">
              <div className="mx-auto w-40 h-40 rounded-2xl bg-white flex items-center justify-center">
                <QrCode className="w-24 h-24 text-black" />
              </div>
              <p className="text-xs text-[#A89887] font-mono">{profile.hpayId}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
