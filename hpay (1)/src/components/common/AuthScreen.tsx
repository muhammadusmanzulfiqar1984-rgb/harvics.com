import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight, Shield } from 'lucide-react';

type Mode = 'login' | 'signup';

type AuthScreenProps = {
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    handle?: string;
  }) => Promise<void>;
  onDemo?: () => Promise<void>;
};

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onSignup, onDemo }) => {
  const [mode, setMode] = useState<Mode>('signup');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') {
        if (!email.trim() || !password) throw new Error('Email and password required');
        await onLogin(email.trim(), password);
      } else {
        if (!name.trim() || !email.trim() || !password) {
          throw new Error('Name, email and password required');
        }
        if (password.length < 8) throw new Error('Password must be at least 8 characters');
        if (password !== confirm) throw new Error('Passwords do not match');
        await onSignup({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim() || undefined,
          handle: handle.trim().replace(/^@/, '') || undefined,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex h-dvh max-h-dvh overflow-hidden bg-[#12090B] text-[#F5EFE6]">
      {/* Atmosphere */}
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 20% 20%, rgba(128,0,32,0.45), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 80%, rgba(212,195,163,0.12), transparent 50%), linear-gradient(160deg, #0E0709 0%, #1A0C10 45%, #12090B 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(232,220,196,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(232,220,196,0.35) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-[1] mx-auto flex w-full max-w-6xl flex-col items-stretch gap-8 px-5 py-8 md:flex-row md:items-center md:px-10 md:py-12">
        {/* Brand panel */}
        <div className="flex flex-1 flex-col justify-center md:pr-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-[#800020] via-[#A81B39] to-[#D4C3A3] p-[1px]">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#1C0D12]">
                <span className="font-mono text-lg font-black tracking-wider text-[#E8DCC4]">H</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold tracking-tight">HPay</span>
                <span className="font-mono text-[10px] font-bold text-[#D4C3A3]">TM</span>
              </div>
              <p className="text-[11px] text-[#A89887]">Harvics Commerce Network</p>
            </div>
          </div>
          <h1 className="max-w-md text-3xl font-semibold tracking-tight text-[#F5EFE6] md:text-4xl">
            {mode === 'signup' ? 'Open your HPay account' : 'Welcome back'}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[#A89887]">
            {mode === 'signup'
              ? 'Create your wallet identity, get an @handle, and lock into the ledger — double-entry, never a stored balance.'
              : 'Sign in to your ledger. High-value moves still require PROTOCOL L3–L5 clearance.'}
          </p>
          <div className="mt-8 hidden items-center gap-2 text-[11px] text-[#8A7468] md:flex">
            <Shield className="h-3.5 w-3.5 text-[#800020]" />
            HPAY-REAL-MONEY-V2 · Neon schema hpay · SQLite trial ledger
          </div>
        </div>

        {/* Form card */}
        <div className="w-full max-w-md shrink-0 self-center rounded-2xl border border-[#3A1A22] bg-[#180C10]/90 p-6 shadow-[0_24px_80px_-20px_rgba(128,0,32,0.45)] backdrop-blur-md md:p-7">
          <div className="mb-6 flex rounded-xl bg-[#0E0709] p-1">
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                mode === 'signup'
                  ? 'bg-[#4A101D] text-[#F5EFE6] shadow-sm'
                  : 'text-[#A89887] hover:text-[#E8DCC4]'
              }`}
            >
              Sign up
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                mode === 'login'
                  ? 'bg-[#4A101D] text-[#F5EFE6] shadow-sm'
                  : 'text-[#A89887] hover:text-[#E8DCC4]'
              }`}
            >
              Sign in
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            {mode === 'signup' && (
              <>
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#A89887]">
                    Full name
                  </span>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B524A]" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      className="w-full rounded-xl border border-[#33171E] bg-[#0E0709] py-2.5 pl-10 pr-3 text-sm text-[#F5EFE6] outline-none transition focus:border-[#7D2235]"
                      placeholder="Mian Muhammad Usman"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#A89887]">
                    HPay handle
                  </span>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-[#6B524A]">
                      @
                    </span>
                    <input
                      value={handle}
                      onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                      autoComplete="username"
                      className="w-full rounded-xl border border-[#33171E] bg-[#0E0709] py-2.5 pl-8 pr-3 font-mono text-sm text-[#F5EFE6] outline-none transition focus:border-[#7D2235]"
                      placeholder="mian"
                    />
                  </div>
                </label>
              </>
            )}

            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#A89887]">
                Email
              </span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B524A]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full rounded-xl border border-[#33171E] bg-[#0E0709] py-2.5 pl-10 pr-3 text-sm text-[#F5EFE6] outline-none transition focus:border-[#7D2235]"
                  placeholder="you@company.com"
                />
              </div>
            </label>

            {mode === 'signup' && (
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#A89887]">
                  Phone <span className="font-normal normal-case tracking-normal">(optional)</span>
                </span>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B524A]" />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    className="w-full rounded-xl border border-[#33171E] bg-[#0E0709] py-2.5 pl-10 pr-3 text-sm text-[#F5EFE6] outline-none transition focus:border-[#7D2235]"
                    placeholder="+971 …"
                  />
                </div>
              </label>
            )}

            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#A89887]">
                Password
              </span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B524A]" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  className="w-full rounded-xl border border-[#33171E] bg-[#0E0709] py-2.5 pl-10 pr-10 text-sm text-[#F5EFE6] outline-none transition focus:border-[#7D2235]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B524A] hover:text-[#E8DCC4]"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {mode === 'signup' && (
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#A89887]">
                  Confirm password
                </span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B524A]" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-[#33171E] bg-[#0E0709] py-2.5 pl-10 pr-3 text-sm text-[#F5EFE6] outline-none transition focus:border-[#7D2235]"
                    placeholder="••••••••"
                  />
                </div>
              </label>
            )}

            {error && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#800020] to-[#A81B39] py-3 text-sm font-semibold text-[#F5EFE6] transition hover:brightness-110 disabled:opacity-60"
            >
              {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
              {!busy && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          {onDemo && (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                setError(null);
                void onDemo()
                  .catch((err) =>
                    setError(err instanceof Error ? err.message : 'Demo login failed')
                  )
                  .finally(() => setBusy(false));
              }}
              className="mt-3 w-full rounded-xl border border-[#33171E] py-2.5 text-xs font-semibold text-[#A89887] transition hover:border-[#7D2235] hover:text-[#E8DCC4] disabled:opacity-60"
            >
              Continue with demo · demo@hpay.com
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
