import React from 'react';
import { useHPay } from '../context/HPayContext';
import { Shield, ChevronRight } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { profile, addToast, setActiveTab, resetDemoData, ledgerSyncing } = useHPay();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Account & Network Settings</h1>
        <p className="text-xs md:text-sm text-gray-400 mt-1">Manage security, organization credentials, and network preferences</p>
      </div>

      <div className="rounded-3xl bg-[#10141D] border border-[#202738] p-6 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-[#1E2536]">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-black font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            MU
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{profile.name}</h2>
            <p className="text-xs text-cyan-400 font-mono">{profile.hpayId} • {profile.businessName}</p>
            <p className="text-xs text-gray-400">{profile.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-400 block mb-1">Full Name</label>
            <input
              type="text"
              readOnly
              value={profile.name}
              className="w-full bg-[#141A26] border border-[#232B3E] text-white px-4 py-3 rounded-xl text-xs font-medium"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 block mb-1">HPay Handle</label>
            <input
              type="text"
              readOnly
              value={profile.hpayId}
              className="w-full bg-[#141A26] border border-[#232B3E] text-cyan-300 font-mono px-4 py-3 rounded-xl text-xs font-bold"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setActiveTab('security')}
        className="w-full rounded-3xl bg-[#180C10] border border-[#33171E] p-6 text-left hover:border-[#7A1D31] transition-all group"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#3B121A] border border-[#5E1A29] text-[#E8DCC4]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white group-hover:text-[#E8DCC4]">Security Enclave</h2>
              <p className="text-[11px] text-[#A89887] mt-1 leading-relaxed">
                Defense-grade stack: ML-KEM-1024, ZK-SNARK solvency, FIPS HSM, FIDO2 passkeys, AML radar
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#A89887] group-hover:text-[#E8DCC4] shrink-0" />
        </div>
      </button>

      <div className="rounded-3xl bg-[#10141D] border border-[#202738] p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" /> Security & Key Management
        </h2>

        <div className="divide-y divide-[#181F2F] text-xs">
          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">Two-Factor Authentication (2FA)</span>
              <span className="text-gray-400 text-[11px]">Hardware token or Authenticator app required for payouts</span>
            </div>
            <span className="text-emerald-400 font-bold bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
              Active
            </span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">Passkey Biometric Login</span>
              <span className="text-gray-400 text-[11px]">Hardware key registered on Apple TouchID / Windows Hello</span>
            </div>
            <button
              onClick={() => addToast('Passkey Registered', 'Touch ID hardware key verified')}
              className="px-3 py-1.5 rounded-lg bg-[#181F2E] text-white font-bold hover:bg-[#20283C]"
            >
              Configure
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-[#180C10] border border-[#5E1A29] p-6 space-y-3">
        <h2 className="text-base font-bold text-white">Demo Ledger Controls</h2>
        <p className="text-[11px] text-[#A89887] leading-relaxed">
          Wipe the in-memory double-entry store and re-seed all users (@mian, @ahmed, @sara, @harvics, counterparties) to original opening balances.
        </p>
        <button
          type="button"
          disabled={ledgerSyncing}
          onClick={() => {
            void resetDemoData();
          }}
          className="px-4 py-3 rounded-xl bg-[#800020] hover:bg-[#990026] text-[#E8DCC4] font-bold text-xs disabled:opacity-50"
        >
          Reset Demo → Re-seed Ledger
        </button>
      </div>
    </div>
  );
};
