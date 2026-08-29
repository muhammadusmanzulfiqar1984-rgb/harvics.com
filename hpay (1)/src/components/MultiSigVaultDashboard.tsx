import React, { useState } from 'react';
import { useHPay } from '../context/HPayContext';
import { CurrencyCode } from '../types';
import { ShieldCheck, Lock, Key, CheckCircle2, Clock, AlertTriangle, ArrowRight, UserCheck, Sparkles, Send } from 'lucide-react';

export const MultiSigVaultDashboard: React.FC = () => {
  const { vaultRequests, createVaultTransferRequest, signVaultTransferRequest, balances } = useHPay();

  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState<number>(50000);
  const [asset, setAsset] = useState<CurrencyCode>('USDC');

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !recipient || amount <= 0) return;
    createVaultTransferRequest(title, recipient, amount, asset);
    setIsCreating(false);
    setTitle('');
    setRecipient('');
  };

  const pendingRequests = vaultRequests.filter((r) => r.status === 'SECURITY_PENDING');
  const executedRequests = vaultRequests.filter((r) => r.status === 'EXECUTED');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#2B141B] via-[#180C10] to-[#211116] border border-[#381B23] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B121A] border border-[#800020] text-[#E8DCC4] text-[10px] font-mono font-bold uppercase mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> High-Value Institutional Cold Vault
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Multi-Signature Corporate Vault & Security State Engine
            </h2>
            <p className="text-xs text-[#A89887] mt-1 max-w-2xl">
              All high-value corporate asset movements require 3-of-3 threshold passkey approvals with cryptographic zero-knowledge multi-sig verification.
            </p>
          </div>

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="px-5 py-3 rounded-2xl bg-[#800020] hover:bg-[#990026] text-[#E8DCC4] font-extrabold text-xs transition-all shadow-lg border border-[#E8DCC4]/20 flex items-center gap-2 self-start md:self-auto"
          >
            <Key className="w-4 h-4" /> Initiate Vault Transfer Request
          </button>
        </div>

        {/* Multi-Sig Security State Flow Explanation Banner */}
        <div className="pt-4 border-t border-[#33171E] grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-[#180C10] border border-[#2B141B] space-y-1">
            <span className="text-[10px] font-bold text-[#A89887] uppercase block">Step 1: Request</span>
            <span className="font-bold text-white block">Keyholder 1 Initiates</span>
            <span className="text-[10px] text-amber-400 font-mono">1/3 Signatures</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#180C10] border border-[#2B141B] space-y-1">
            <span className="text-[10px] font-bold text-[#A89887] uppercase block">Step 2: Treasury Sign</span>
            <span className="font-bold text-white block">CFO Approval</span>
            <span className="text-[10px] text-amber-400 font-mono">2/3 Signatures</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#180C10] border border-[#2B141B] space-y-1">
            <span className="text-[10px] font-bold text-[#A89887] uppercase block">Step 3: Security Clear</span>
            <span className="font-bold text-white block">Compliance Bot Verify</span>
            <span className="text-[10px] text-emerald-400 font-mono">3/3 Signatures</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#180C10] border border-[#800020] space-y-1">
            <span className="text-[10px] font-bold text-[#E8DCC4] uppercase block">Step 4: FastRail</span>
            <span className="font-bold text-emerald-400 block">Instant Net Settle</span>
            <span className="text-[10px] text-emerald-400 font-mono">Executed</span>
          </div>
        </div>
      </div>

      {/* Creation Modal / Form */}
      {isCreating && (
        <form onSubmit={handleCreateRequest} className="p-6 rounded-3xl bg-[#180C10] border border-[#800020] space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-[#2B141B]">
            <h3 className="text-sm font-extrabold text-[#E8DCC4] flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Create High-Value Multi-Sig Transfer
            </h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-[#A89887] text-xs hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-[#A89887] uppercase block mb-1">Transaction Title / Purpose</label>
              <input
                type="text"
                placeholder="e.g. Middle-East Expansion Escrow Reserve"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#211116] border border-[#381B23] text-white text-xs font-bold p-3 rounded-xl focus:outline-none focus:border-[#800020]"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A89887] uppercase block mb-1">Beneficiary HPay ID / Recipient</label>
              <input
                type="text"
                placeholder="e.g. Emirates NBD Escrow (@enb-escrow)"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-[#211116] border border-[#381B23] text-white text-xs font-bold p-3 rounded-xl focus:outline-none focus:border-[#800020]"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A89887] uppercase block mb-1">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#211116] border border-[#381B23] text-white font-mono text-xs font-bold p-3 rounded-xl focus:outline-none focus:border-[#800020]"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#A89887] uppercase block mb-1">Asset Vault</label>
              <select
                value={asset}
                onChange={(e) => setAsset(e.target.value as CurrencyCode)}
                className="w-full bg-[#211116] border border-[#381B23] text-white text-xs font-bold p-3 rounded-xl cursor-pointer"
              >
                <option value="USDC">USDC Vault</option>
                <option value="USDT">USDT Vault</option>
                <option value="eUSD">e-USD CBDC</option>
                <option value="eAED">e-Dirham CBDC</option>
                <option value="USD">USD Fiat Treasury</option>
                <option value="BTC">BTC Bitcoin Vault</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#800020] text-[#E8DCC4] text-xs font-extrabold hover:bg-[#990026] transition-all border border-[#E8DCC4]/20"
          >
            Submit for Multi-Sig Authorization
          </button>
        </form>
      )}

      {/* Active Multi-Sig Pending Approvals */}
      <div className="rounded-3xl bg-[#180C10] border border-[#33171E] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#2B141B]">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" /> Security Pending Approval Queue ({pendingRequests.length})
          </h3>
          <span className="text-[10px] font-mono text-[#E8DCC4] bg-[#3B121A] px-2.5 py-1 rounded-full border border-[#800020]">
            3-of-3 MULTI-SIG ENFORCED
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#A89887] bg-[#211116] rounded-2xl border border-[#381B23]">
            No pending vault approvals. All multi-sig requests are cleared and executed.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-[#211116] border border-[#381B23] space-y-4 hover:border-[#800020] transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-white">{req.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/40">
                        {req.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A89887] font-mono mt-0.5">
                      Recipient: <strong className="text-white">{req.recipient}</strong> • Created: {req.createdAt} • ID: {req.id}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black font-mono text-[#E8DCC4]">
                      {req.amount.toLocaleString()} {req.asset}
                    </div>
                    <span className="text-[10px] text-amber-400 font-bold">
                      {req.currentSignatures} / {req.requiredSignatures} Signatures
                    </span>
                  </div>
                </div>

                {/* State Progression Visualization Bar */}
                <div className="space-y-2 pt-2 border-t border-[#381B23]">
                  <div className="flex justify-between text-[10px] font-mono text-[#A89887]">
                    <span>Multi-Sig Progression</span>
                    <span className="text-[#E8DCC4]">{req.riskAssessment}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {req.approvers.map((appr, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border text-xs space-y-1 transition-all ${
                          appr.signed
                            ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                            : 'bg-[#180C10] border-[#381B23] text-[#A89887]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold truncate">{appr.name}</span>
                          {appr.signed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          )}
                        </div>
                        <div className="text-[9px] font-mono flex justify-between">
                          <span>{appr.role}</span>
                          <span>{appr.signed ? 'SIGNED' : 'PENDING'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sign Button */}
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => signVaultTransferRequest(req.id)}
                    className="px-4 py-2.5 rounded-xl bg-[#800020] hover:bg-[#990026] text-[#E8DCC4] font-extrabold text-xs transition-all border border-[#E8DCC4]/20 flex items-center gap-2"
                  >
                    <Key className="w-3.5 h-3.5" /> Sign & Authorize Multi-Sig Step
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Executed Vault Transfers Log */}
      <div className="rounded-3xl bg-[#180C10] border border-[#33171E] p-6 space-y-4">
        <h4 className="text-xs font-bold text-[#A89887] uppercase tracking-wider">
          Executed Vault Transfers ({executedRequests.length})
        </h4>

        {executedRequests.map((req) => (
          <div key={req.id} className="p-4 rounded-2xl bg-[#211116] border border-[#381B23] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">{req.title}</h5>
                <p className="text-[10px] text-[#A89887] font-mono mt-0.5">
                  ID: {req.id} • Recipient: {req.recipient} • Multi-Sig 3/3 Cleared
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold font-mono text-emerald-400">
                -{req.amount.toLocaleString()} {req.asset}
              </div>
              <span className="text-[9px] text-[#A89887] font-mono">EXECUTED</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
