import React, { Component, useCallback, useEffect, useState } from 'react';
import {
  Shield,
  Atom,
  Fingerprint,
  Radar,
  KeyRound,
  Hexagon,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { getSecurityEnclave } from '../security/index.js';
import { useHPay } from '../context/HPayContext';
import { fetchSecurityAudit, rotateHsmKeys, fetchSolvencyProof, passkeyRegisterChallenge, passkeyVerify } from '../services/hpayApi';
import { PROTOCOL } from '../security/protocol.js';

class SecurityErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message || 'Security Enclave failed to render' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-3xl border border-[#661C2C] bg-[#1A0D11] p-6 text-[#F5EFE6]">
          <div className="flex items-center gap-2 text-[#E8DCC4]">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-sm font-bold">Security Enclave Error Boundary</h2>
          </div>
          <p className="mt-2 text-xs text-[#A89887]">{this.state.message}</p>
          <button
            type="button"
            className="mt-4 rounded-xl bg-[#800020] px-4 py-2 text-xs font-bold text-[#E8DCC4]"
            onClick={() => this.setState({ hasError: false, message: '' })}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

type ComponentStatus = {
  id: string;
  name: string;
  status: string;
  notes?: string;
  [key: string]: unknown;
};

const ICONS: Record<string, React.ElementType> = {
  'post-quantum': Atom,
  'zk-proofs': Hexagon,
  hsm: KeyRound,
  'biometric-enclave': Fingerprint,
  'aml-radar': Radar,
  'vault-multisig': Shield,
  'double-entry-ledger': Hexagon,
};

function statusTone(status: string) {
  if (/active|ready|clear/i.test(status)) return 'text-emerald-400 border-emerald-800/50 bg-emerald-950/40';
  if (/stub|interface|simulated/i.test(status)) return 'text-amber-300 border-amber-800/40 bg-amber-950/30';
  return 'text-[#E8DCC4] border-[#7D2235] bg-[#42121D]';
}

const LAYER_STACK = [...PROTOCOL.stackDisplay];

const SecurityEnclaveInner: React.FC = () => {
  const { addToast, setActiveTab } = useHPay();
  const [loading, setLoading] = useState(true);
  const [components, setComponents] = useState<ComponentStatus[]>([]);
  const [stack, setStack] = useState<string[]>(LAYER_STACK);
  const [auditCount, setAuditCount] = useState(0);
  const [serverAudit, setServerAudit] = useState<Array<{ id: string; description: string; created_at: string; metadata?: { event_type?: string; severity?: string } }>>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const enclave = getSecurityEnclave(async (event) => {
        void event;
      });

      if (!enclave.getStatus().ready) {
        await enclave.initialize({ rotationIntervalMs: 30 * 24 * 60 * 60 * 1000 });
      }

      let comps = enclave.getStatus().components as ComponentStatus[];
      try {
        const { fetchSecurityEnclave } = await import('../services/hpayApi');
        const server = (await fetchSecurityEnclave()) as {
          components?: ComponentStatus[];
          stack?: string[];
          auditEvents?: number;
        };
        if (Array.isArray(server.components) && server.components.length) {
          comps = server.components;
        }
        if (Array.isArray(server.stack) && server.stack.length) {
          setStack(server.stack);
        }
      } catch {
        /* local components fallback */
      }

      setComponents(comps);
      setAuditCount(enclave.getStatus().auditEvents);

      try {
        const data = await fetchSecurityAudit();
        setServerAudit((data.events || []) as Array<{
          id: string;
          description: string;
          created_at: string;
          metadata?: { event_type?: string; severity?: string };
        }>);
      } catch {
        /* offline */
      }
    } catch (e) {
      addToast('Security Enclave', e instanceof Error ? e.message : 'Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runDemoProof = async () => {
    setBusy('zk');
    try {
      const data = await fetchSolvencyProof({ threshold_cents: 100000 });
      const enclave = getSecurityEnclave();
      await enclave.proveCompliance({
        policyId: 'HPAY-AML-POLICY-1',
        attestationCommitment: 'attest_demo',
        jurisdiction: 'AE',
      });
      addToast(
        'ZK Solvency Proof',
        `${data.proof.proofId} · ${data.message}`,
        'success'
      );
      await refresh();
    } catch (e) {
      addToast('ZK Proof Failed', e instanceof Error ? e.message : 'error', 'error');
    } finally {
      setBusy(null);
    }
  };

  const rotateHsm = async () => {
    setBusy('hsm');
    try {
      const data = await rotateHsmKeys({
        custody: ['officer_a', 'officer_b'],
        mode: 'manual',
      });
      const enclave = getSecurityEnclave();
      enclave.rotateKeys();
      addToast('HSM Rotation', `Active key ${String(data.toKeyId || '').slice(0, 18)}… (dual-custody)`, 'success');
      await refresh();
    } catch (e) {
      addToast('HSM Rotation Failed', e instanceof Error ? e.message : 'error', 'error');
    } finally {
      setBusy(null);
    }
  };

  const registerPasskey = async () => {
    setBusy('passkey');
    try {
      const challenge = await passkeyRegisterChallenge({ rp_id: 'localhost' });
      const verified = await passkeyVerify({
        challenge_id: challenge.challenge_id,
        type: 'registration',
        credential: {
          id: `cred_demo_${Date.now()}`,
          response: { transports: ['internal'] },
        },
      });
      addToast('Passkey Registered', verified.credential_id || 'L5 WebAuthn credential stored', 'success');
      await refresh();
    } catch (e) {
      addToast('Passkey Failed', e instanceof Error ? e.message : 'error', 'error');
    } finally {
      setBusy(null);
    }
  };

  const wrapDemoKey = async () => {
    setBusy('pq');
    try {
      const enclave = getSecurityEnclave();
      const wrapped = await enclave.wrapApiKey(`hpay_live_${Date.now()}`);
      addToast('API Key Encrypted', `${wrapped.algorithm} · ${wrapped.ciphertext.slice(0, 28)}…`, 'success');
      await refresh();
    } catch (e) {
      addToast('PQ Wrap Failed', e instanceof Error ? e.message : 'error', 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className="mb-2 text-[11px] font-semibold text-[#A89887] hover:text-[#E8DCC4]"
          >
            ← Settings
          </button>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-[#F5EFE6] md:text-3xl">
            <Shield className="h-7 w-7 text-[#E8DCC4]" />
            Defense-Grade Security Enclave
          </h1>
          <p className="mt-1 text-xs text-[#A89887] md:text-sm">
            L1 HSM · L2 ML-KEM-1024+ML-DSA · L3 ZK · L4 M-of-N · L5 FIDO2 · L6 Ledger · L7 OFAC/AML
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="inline-flex items-center gap-2 rounded-xl border border-[#3D1A22] bg-[#231217] px-3.5 py-2 text-xs font-bold text-[#D4C5B5] hover:border-[#7A1D31]"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-[#A89887]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Initializing enclave…</span>
        </div>
      ) : (
        <>
          <div className="rounded-3xl border border-[#3D1A22] bg-[#12090C] p-5 font-mono text-[11px] leading-relaxed text-[#E8DCC4]">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#A89887]">7-Layer Stack</p>
            {stack.map((line) => (
              <div key={line} className="border-b border-[#2B141B] py-1.5 last:border-0">
                {line}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {components.map((c) => {
              const Icon = ICONS[c.id] || Shield;
              return (
                <div
                  key={c.id}
                  className="rounded-3xl border border-[#33171E] bg-[#180C10] p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-xl border border-[#5E1A29] bg-[#3B121A] p-2 text-[#E8DCC4]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{c.name}</h3>
                        <p className="font-mono text-[10px] text-[#A89887]">{c.id}</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusTone(String(c.status))}`}
                    >
                      {c.status}
                    </span>
                  </div>
                  {c.notes ? (
                    <p className="mt-3 text-[11px] leading-relaxed text-[#A89887]">{c.notes}</p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="rounded-3xl border border-[#33171E] bg-[#180C10] p-6">
            <h2 className="mb-4 text-sm font-bold text-white">Enclave Controls</h2>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void registerPasskey()}
                className="rounded-xl border border-[#48242D] bg-[#2E181E] px-4 py-2.5 text-xs font-bold text-[#F5EFE6] disabled:opacity-50"
              >
                {busy === 'passkey' ? 'Registering…' : 'Register WebAuthn Passkey'}
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void wrapDemoKey()}
                className="rounded-xl bg-[#800020] px-4 py-2.5 text-xs font-bold text-[#E8DCC4] disabled:opacity-50"
              >
                {busy === 'pq' ? 'Wrapping…' : 'PQ Encrypt API Key'}
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void runDemoProof()}
                className="rounded-xl border border-[#48242D] bg-[#2E181E] px-4 py-2.5 text-xs font-bold text-[#F5EFE6] disabled:opacity-50"
              >
                {busy === 'zk' ? 'Proving…' : 'GET ZK Solvency Proof'}
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void rotateHsm()}
                className="rounded-xl border border-[#48242D] bg-[#2E181E] px-4 py-2.5 text-xs font-bold text-[#F5EFE6] disabled:opacity-50"
              >
                {busy === 'hsm' ? 'Rotating…' : 'Rotate HSM Keys (dual-custody)'}
              </button>
            </div>
            <p className="mt-3 text-[11px] text-[#A89887]">
              Local audit events: <span className="font-mono text-[#E8DCC4]">{auditCount}</span>
              {' · '}
              Biometric ≥ <span className="font-mono text-[#E8DCC4]">$10,000</span>
              {' · '}
              Vault M-of-N ≥ <span className="font-mono text-[#E8DCC4]">$50,000</span>
              {' · '}
              HSM rotation: <span className="font-mono text-[#E8DCC4]">30 days</span>
            </p>
          </div>

          <div className="rounded-3xl border border-[#33171E] bg-[#180C10] p-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Ledger Security Audit Trail
            </h2>
            {serverAudit.length === 0 ? (
              <p className="text-xs text-[#A89887]">
                No server audit rows yet. Confirm a payment to write AML / PQ events into the ledger.
              </p>
            ) : (
              <ul className="divide-y divide-[#2B141B] text-xs">
                {serverAudit.slice(0, 12).map((ev) => (
                  <li key={ev.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#F5EFE6]">
                        {ev.metadata?.event_type || ev.description}
                      </p>
                      <p className="font-mono text-[10px] text-[#A89887]">{ev.id}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-[10px] uppercase text-[#A89887]">
                        {ev.metadata?.severity || 'info'}
                      </span>
                      <p className="text-[10px] text-[#665548]">
                        {new Date(ev.created_at).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export const SecurityEnclavePage: React.FC = () => (
  <SecurityErrorBoundary>
    <SecurityEnclaveInner />
  </SecurityErrorBoundary>
);

export default SecurityEnclavePage;
