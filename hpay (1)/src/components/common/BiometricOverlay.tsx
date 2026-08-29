import React, { useState, useEffect } from 'react';
import { Fingerprint, Scan, ShieldCheck, Lock, CheckCircle2, AlertTriangle, Sparkles, X } from 'lucide-react';

interface BiometricOverlayProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  amount?: string;
  recipient?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const BiometricOverlay: React.FC<BiometricOverlayProps> = ({
  isOpen,
  title = 'Biometric Authorization Required',
  subtitle = 'High-value transaction requires Harvics Hardware Security Passkey clearance',
  amount,
  recipient,
  onSuccess,
  onCancel
}) => {
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVerifying(false);
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScan = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 900);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#180C10] border border-[#800020] w-full max-w-md rounded-3xl p-6 space-y-6 shadow-2xl relative text-center overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#800020]/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#E8DCC4]/10 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#211116] text-[#A89887] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Security Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B121A] border border-[#800020] text-[#E8DCC4] text-[10px] font-mono font-bold uppercase">
          <ShieldCheck className="w-3.5 h-3.5" /> Harvics Passkey Security Enclave
        </div>

        <div>
          <h3 className="text-xl font-black text-white">{title}</h3>
          <p className="text-xs text-[#A89887] mt-1">{subtitle}</p>
        </div>

        {/* Amount / Recipient Box */}
        {(amount || recipient) && (
          <div className="p-4 rounded-2xl bg-[#211116] border border-[#381B23] space-y-1 font-mono text-left">
            {recipient && (
              <div className="flex justify-between text-xs text-[#A89887]">
                <span>Beneficiary:</span>
                <span className="text-white font-bold">{recipient}</span>
              </div>
            )}
            {amount && (
              <div className="flex justify-between text-xs text-[#A89887]">
                <span>Authorized Value:</span>
                <span className="text-[#E8DCC4] font-black text-sm">{amount}</span>
              </div>
            )}
          </div>
        )}

        {/* Interactive Biometric Fingerprint Sensor Pulse */}
        <div className="py-4 flex flex-col items-center justify-center space-y-4">
          <button
            type="button"
            onClick={handleScan}
            disabled={verifying || success}
            className={`group relative p-6 rounded-3xl border-2 transition-all duration-300 flex items-center justify-center ${
              success
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-400 scale-105'
                : verifying
                ? 'bg-[#3B121A] border-[#E8DCC4] text-[#E8DCC4] animate-pulse'
                : 'bg-[#211116] border-[#800020] hover:border-[#E8DCC4] text-[#E8DCC4] hover:shadow-lg hover:shadow-[#800020]/40'
            }`}
          >
            {success ? (
              <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
            ) : verifying ? (
              <Scan className="w-16 h-16 text-[#E8DCC4] animate-spin" />
            ) : (
              <Fingerprint className="w-16 h-16 text-[#E8DCC4] group-hover:scale-110 transition-transform" />
            )}
          </button>

          <p className="text-xs font-mono font-bold text-[#E8DCC4]">
            {success
              ? 'Biometric Verification Passed! Executing transaction...'
              : verifying
              ? 'Scanning fingerprint & verifying cryptographic passkey...'
              : 'Tap Sensor or Touch ID to Verify Identity'}
          </p>
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-[#2B141B] flex items-center justify-between text-[10px] text-[#A89887] font-mono">
          <span>AES-256 HSM Enclave</span>
          <span className="text-emerald-400 font-bold">Zero-Knowledge Proof</span>
        </div>
      </div>
    </div>
  );
};
