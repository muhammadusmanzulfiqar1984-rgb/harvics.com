import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  UserProfile,
  WalletBalances,
  Transaction,
  Invoice,
  PaymentLink,
  Payout,
  EscrowTrade,
  Trade,
  NotificationItem,
  ActiveTab,
  CurrencyCode,
  PriceAlert,
  StakingPosition,
  VaultTransferRequest
} from '../types';
import {
  initialProfile,
  initialBalances,
  initialTransactions,
  initialInvoices,
  initialPaymentLinks,
  initialPayouts,
  initialEscrowTrades,
  initialTrades,
  initialNotifications,
  initialPriceAlerts,
  initialStakingPositions,
  initialVaultRequests
} from '../data/initialData';
import { LedgerService } from '../services/ledgerService';
import {
  ensureSession,
  syncLedgerState,
  createTransfer,
  createDeposit,
  createPayoutApi,
  releaseEscrowApi,
  reseedDemo,
  mapApiTxToUi,
  mapPayoutToUi,
  HPayApiError,
  searchUsers as apiSearchUsers,
  passkeyVerify,
  fetchForexLatest,
  fetchCryptoTickers,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCachedUser,
} from '../services/hpayApi';
import {
  PROTOCOL,
  amountToCents,
  protocolRequirements,
  protocolClearanceFlags,
} from '../security/protocol.js';

function apiFailReason(e: unknown): string {
  return e instanceof Error ? e.message : 'Request failed';
}

function toastTransferFailed(addToastFn: (title: string, message: string, type?: 'success' | 'error' | 'info') => void, e: unknown) {
  addToastFn(`Transfer Failed: ${apiFailReason(e)}`, 'Protocol fail-closed — ledger unchanged.', 'error');
}

export type ProtocolBioChallenge = {
  amountCents: number;
  recipient?: string;
  path: string;
} | null;

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface HPayContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedCurrency: CurrencyCode;
  setSelectedCurrency: (curr: CurrencyCode) => void;
  profile: UserProfile;
  balances: WalletBalances;
  transactions: Transaction[];
  invoices: Invoice[];
  paymentLinks: PaymentLink[];
  payouts: Payout[];
  escrowTrades: EscrowTrade[];
  trades: Trade[];
  notifications: NotificationItem[];
  priceAlerts: PriceAlert[];
  livePrices: Record<CurrencyCode, number>;
  stakingPositions: StakingPosition[];
  vaultRequests: VaultTransferRequest[];
  selectedTransaction: Transaction | null;
  setSelectedTransaction: (tx: Transaction | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Actions
  sendMoney: (recipientHPayId: string, recipientName: string, amount: number, currency: CurrencyCode, note?: string) => Promise<Transaction>;
  requestMoney: (recipientHPayId: string, amount: number, currency: CurrencyCode, description: string, dueDate: string) => void;
  createInvoice: (customerName: string, customerEmail: string, items: any[], dueDate: string, notes?: string) => void;
  createPaymentLink: (productTitle: string, amount: number, currency: CurrencyCode, description: string) => PaymentLink;
  createPayout: (beneficiaryName: string, bankName: string, accountNumber: string, amount: number, currency: CurrencyCode) => void;
  releaseEscrowFunds: (escrowId: string) => void;
  convertCurrency: (fromCurr: CurrencyCode, toCurr: CurrencyCode, fromAmount: number) => void;
  markNotificationRead: (id: string) => void;
  resetDemoData: () => void;
  topUpWallet: (amount: number, description?: string) => Promise<void>;
  refreshLedger: () => Promise<void>;
  searchHPayUsers: (q: string) => Promise<Array<{ id: string; hpay_id: string; name: string }>>;
  ledgerReady: boolean;
  ledgerSyncing: boolean;
  authReady: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    handle?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  /** PROTOCOL L5 challenge UI — open BiometricOverlay when set */
  protocolBioChallenge: ProtocolBioChallenge;
  resolveProtocolBiometric: () => void;
  cancelProtocolBiometric: () => void;
  protocolId: string;

  // Price Monitoring Actions
  addPriceAlert: (asset: CurrencyCode, targetPrice: number, condition: 'ABOVE' | 'BELOW') => void;
  togglePriceAlert: (id: string) => void;
  deletePriceAlert: (id: string) => void;

  // Staking Actions
  stakeAsset: (asset: CurrencyCode, amount: number, lockPeriodDays: number, apr: number) => void;
  unstakeAsset: (id: string) => void;
  claimYield: (id: string) => void;

  // Multi-Sig Vault Actions
  createVaultTransferRequest: (title: string, recipient: string, amount: number, asset: CurrencyCode) => void;
  signVaultTransferRequest: (id: string, approverName?: string) => void;
}

const HPayContext = createContext<HPayContextType | undefined>(undefined);

const STORAGE_KEY = 'hpay_prototype_state_v1';

const emptyUsdBalances = (): WalletBalances => ({
  ...initialBalances,
  USD: 0,
});

export const HPayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [balances, setBalances] = useState<WalletBalances>(emptyUsdBalances());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>(initialPaymentLinks);
  const [payouts, setPayouts] = useState<Payout[]>(initialPayouts);
  const [escrowTrades, setEscrowTrades] = useState<EscrowTrade[]>(initialEscrowTrades);
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Features State
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(initialPriceAlerts);
  const [stakingPositions, setStakingPositions] = useState<StakingPosition[]>(initialStakingPositions);
  const [vaultRequests, setVaultRequests] = useState<VaultTransferRequest[]>(initialVaultRequests);
  const [ledgerReady, setLedgerReady] = useState(false);
  const [ledgerSyncing, setLedgerSyncing] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [protocolBioChallenge, setProtocolBioChallenge] = useState<ProtocolBioChallenge>(null);
  const protocolBioResolver = useRef<{
    resolve: (v: { biometric_verified: boolean; multi_sig_approved: boolean; multi_sig_approvals: number }) => void;
    reject: (e: Error) => void;
    path: string;
  } | null>(null);

  const [livePrices, setLivePrices] = useState<Record<CurrencyCode, number>>({
    USD: 1.0,
    AED: 3.6725,
    EUR: 0.915,
    PKR: 278.50,
    USDC: 1.0,
    USDT: 1.0,
    eUSD: 1.0,
    eAED: 3.6725,
    BTC: 95420,
    ETH: 2740
  });

  // Live forex (RapidAPI) for fiat pairs
  useEffect(() => {
    let cancelled = false;
    const pull = async () => {
      try {
        const data = await fetchForexLatest({
          base: 'USD',
          symbols: 'EUR,GBP,AED,PKR',
        });
        if (cancelled || !data?.rates) return;
        setLivePrices((prev) => ({
          ...prev,
          USD: 1,
          EUR: Number(data.rates.EUR ?? prev.EUR),
          AED: Number(data.rates.AED ?? prev.AED),
          PKR: Number(data.rates.PKR ?? prev.PKR),
          eAED: Number(data.rates.AED ?? prev.eAED),
        }));
      } catch {
        /* keep last known / sandbox */
      }
    };
    void pull();
    const t = setInterval(pull, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  // Live crypto (RapidAPI liquidity) for BTC/ETH + price alerts
  useEffect(() => {
    let cancelled = false;
    const pull = async () => {
      try {
        const data = await fetchCryptoTickers('BTC,ETH');
        if (cancelled || !data?.tickers) return;
        const newBtc = Number(data.tickers.BTC?.price);
        const newEth = Number(data.tickers.ETH?.price);
        setLivePrices((prev) => {
          const btc = Number.isFinite(newBtc) && newBtc > 0 ? Math.round(newBtc) : prev.BTC;
          const eth = Number.isFinite(newEth) && newEth > 0 ? Math.round(newEth) : prev.ETH;

          priceAlerts.forEach((alert) => {
            if (!alert.active) return;
            const currentPrice =
              alert.asset === 'BTC' ? btc : alert.asset === 'ETH' ? eth : prev[alert.asset];
            let triggered = false;
            if (alert.condition === 'ABOVE' && currentPrice >= alert.targetPrice) triggered = true;
            else if (alert.condition === 'BELOW' && currentPrice <= alert.targetPrice) triggered = true;

            if (triggered) {
              const notifMessage = `🎯 Price Threshold Met! ${alert.asset} is now $${currentPrice.toLocaleString()} (${alert.condition} $${alert.targetPrice.toLocaleString()}).`;
              setNotifications((nPrev) => [
                {
                  id: `pa-notif-${Date.now()}`,
                  title: `Price Alert: ${alert.asset}`,
                  message: notifMessage,
                  timestamp: 'Just now',
                  category: 'PriceAlert',
                  read: false,
                },
                ...nPrev,
              ]);
              addToast(`Price Alert: ${alert.asset}`, notifMessage, 'info');
              setPriceAlerts((paPrev) =>
                paPrev.map((pa) =>
                  pa.id === alert.id ? { ...pa, active: false, triggeredAt: 'Just now' } : pa
                )
              );
            }
          });

          return { ...prev, BTC: btc, ETH: eth };
        });
      } catch {
        /* keep last known / sandbox */
      }
    };
    void pull();
    const t = setInterval(pull, 30_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [priceAlerts]);

  // Load from localStorage on mount — non-ledger UI state only (not balances/tx)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.invoices) setInvoices(parsed.invoices);
        if (parsed.paymentLinks) setPaymentLinks(parsed.paymentLinks);
        if (parsed.payouts) setPayouts(parsed.payouts);
        if (parsed.escrowTrades) setEscrowTrades(parsed.escrowTrades);
        if (parsed.trades) setTrades(parsed.trades);
      }
    } catch {
      /* ignore corrupt cache */
    }
  }, []);

  // Persist non-ledger prototype screens only — never wallet/ledger
  useEffect(() => {
    try {
      const stateToSave = {
        invoices,
        paymentLinks,
        payouts,
        escrowTrades,
        trades,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {
      /* ignore quota */
    }
  }, [invoices, paymentLinks, payouts, escrowTrades, trades]);

  const refreshLedger = async () => {
    setLedgerSyncing(true);
    try {
      const state = await syncLedgerState();
      if (state.user) {
        setProfile((prev) => ({
          ...prev,
          name: state.user!.name,
          hpayId: state.user!.hpay_id,
          email: state.user!.email,
          kycStatus: state.user!.kyc_status === 'approved' ? 'Verified' : prev.kycStatus,
        }));
      }
      setBalances((prev) => ({
        ...prev,
        USD: state.balances.USD,
        AED: Number(state.balances.AED ?? prev.AED) || prev.AED,
        USDC: Number(state.balances.USDC ?? prev.USDC) || prev.USDC,
        USDT: Number(state.balances.USDT ?? prev.USDT) || prev.USDT,
        eUSD: Number(state.balances.eUSD ?? prev.eUSD) || prev.eUSD,
        eAED: Number(state.balances.eAED ?? prev.eAED) || prev.eAED,
        BTC: Number(state.balances.BTC ?? prev.BTC) || prev.BTC,
      }));
      setTransactions(state.transactions.map(mapApiTxToUi));
      setPayouts(state.payouts.map(mapPayoutToUi));
      setLedgerReady(true);
    } finally {
      setLedgerSyncing(false);
    }
  };

  const applyAuthUser = (user: { name: string; hpay_id: string; email: string; kyc_status?: string }) => {
    setProfile((prev) => ({
      ...prev,
      name: user.name,
      hpayId: user.hpay_id,
      email: user.email,
      kycStatus: user.kyc_status === 'approved' ? 'Verified' : 'Pending',
    }));
    setIsAuthenticated(true);
  };

  const signIn = async (email: string, password: string) => {
    const { user } = await apiLogin(email, password);
    applyAuthUser(user);
    await refreshLedger();
    addToast('Signed in', `Welcome back, ${user.hpay_id}`, 'success');
  };

  const signUp = async (input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    handle?: string;
  }) => {
    const { user } = await apiRegister(input);
    applyAuthUser(user);
    await refreshLedger();
    addToast('Account created', `Your handle is ${user.hpay_id}`, 'success');
  };

  const signOut = async () => {
    await apiLogout();
    setIsAuthenticated(false);
    setLedgerReady(false);
    setBalances(emptyUsdBalances());
    setTransactions([]);
    setProfile(initialProfile);
    addToast('Signed out', 'Session cleared', 'info');
  };

  // Boot: restore session if present — never auto-login demo
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await ensureSession();
        if (cancelled) return;
        if (user) {
          applyAuthUser(user);
          await refreshLedger();
        } else {
          setIsAuthenticated(false);
        }
      } catch (e) {
        if (!cancelled) {
          setIsAuthenticated(false);
          setLedgerReady(false);
        }
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const searchHPayUsers = async (q: string) => apiSearchUsers(q);

  /**
   * PROTOCOL clearance before any settlement API call.
   * L4 vault (≥$50k): must use Multi-Sig Vault path (or explicit multi_sig flags).
   * L5 biometric (≥$10k): opens passkey overlay and waits.
   */
  const requestProtocolClearance = (input: {
    amount: number;
    path: string;
    recipient?: string;
    multiSigApproved?: boolean;
    multiSigApprovals?: number;
  }) => {
    const amountCents = amountToCents(input.amount);
    const req = protocolRequirements(amountCents, { path: input.path });

    if (req.vaultMultisig && input.path !== 'vault' && !input.multiSigApproved) {
      return Promise.reject(
        new Error(
          `PROTOCOL L1: ≥ $${(PROTOCOL.layers.L1.mpcThresholdCents / 100).toLocaleString()} requires ${PROTOCOL.layers.L1.m}-of-${PROTOCOL.layers.L1.n} Fireblocks MPC / Multi-Sig Vault`
        )
      );
    }

    if (!req.biometric) {
      const { flags } = protocolClearanceFlags(amountCents, {
        path: input.path,
        biometric_verified: true,
        multi_sig_approved: input.multiSigApproved || input.path === 'vault',
        multi_sig_approvals: input.multiSigApprovals || (input.path === 'vault' ? 3 : 0),
      });
      return Promise.resolve(flags);
    }

    return new Promise<{
      biometric_verified: boolean;
      multi_sig_approved: boolean;
      multi_sig_approvals: number;
    }>((resolve, reject) => {
      protocolBioResolver.current = {
        resolve: (v) => resolve(v),
        reject,
        path: input.path,
      };
      setProtocolBioChallenge({
        amountCents,
        recipient: input.recipient,
        path: input.path,
      });
    }).then((bio) => {
      const { flags } = protocolClearanceFlags(amountCents, {
        path: input.path,
        biometric_verified: bio.biometric_verified,
        multi_sig_approved: input.multiSigApproved || input.path === 'vault' || bio.multi_sig_approved,
        multi_sig_approvals: input.multiSigApprovals || bio.multi_sig_approvals,
      });
      return flags;
    });
  };

  const resolveProtocolBiometric = () => {
    const pending = protocolBioResolver.current;
    const challenge = protocolBioChallenge;
    setProtocolBioChallenge(null);
    protocolBioResolver.current = null;
    if (!pending) return;

    void (async () => {
      try {
        await passkeyVerify({
          type: 'assertion',
          amount: challenge ? challenge.amountCents / 100 : undefined,
          simulate_success: true,
          assertion: { simulated: true, source: 'BiometricOverlay' },
        });
        pending.resolve({
          biometric_verified: true,
          multi_sig_approved: pending.path === 'vault',
          multi_sig_approvals: pending.path === 'vault' ? 3 : 0,
        });
      } catch (e) {
        pending.reject(e instanceof Error ? e : new Error('PROTOCOL L5: Passkey verify failed'));
      }
    })();
  };

  const cancelProtocolBiometric = () => {
    const pending = protocolBioResolver.current;
    setProtocolBioChallenge(null);
    protocolBioResolver.current = null;
    pending?.reject(new Error('PROTOCOL L5: Biometric passkey cancelled'));
  };

  const topUpWallet = async (amount: number, description?: string) => {
    try {
      const flags = await requestProtocolClearance({ amount, path: 'deposit', recipient: 'Bank rail' });
      await createDeposit(amount, description, flags);
      await refreshLedger();
      addToast(
        'Deposit Settled',
        `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} credited · ${PROTOCOL.id}`
      );
    } catch (e) {
      toastTransferFailed(addToast, e);
      throw e;
    }
  };

  const sendMoney = async (
    recipientHPayId: string,
    recipientName: string,
    amount: number,
    currency: CurrencyCode,
    note?: string
  ): Promise<Transaction> => {
    if (currency !== 'USD') {
      const err = new HPayApiError('Live ledger transfers are USD-only', 400, { code: 'USD_ONLY' });
      toastTransferFailed(addToast, err);
      throw err;
    }

    try {
      const flags = await requestProtocolClearance({
        amount,
        path: 'transfer',
        recipient: recipientHPayId,
      });

      const result = await createTransfer({
        to_hpay_id: recipientHPayId,
        amount,
        description: note || `Transfer to ${recipientName || recipientHPayId}`,
        ...flags,
      });

      await refreshLedger();

      const tx: Transaction = {
        id: result.transaction.id,
        amount,
        currency: 'USD',
        status: 'Completed',
        merchantOrPerson: result.recipient.name || recipientName || recipientHPayId,
        recipientHPayId: result.recipient.hpay_id,
        senderHPayId: profile.hpayId,
        category: 'Peer-to-Peer Transfer',
        direction: 'out',
        paymentMethod: 'HPay Wallet Balance',
        paymentRail: 'HPay Double-Entry Ledger',
        timestamp: new Date(result.transaction.created_at).toLocaleString(),
        reference: result.transaction.reference,
        riskStatus: 'Clear',
        riskScore: 5,
        fee: 0,
        settlementAmount: amount,
        ledgerEntries: LedgerService.createDoubleEntry(
          profile.hpayId,
          result.recipient.hpay_id,
          amount,
          0,
          result.transaction.description
        ),
        note,
      };

      setNotifications((prev) => [
        {
          id: Math.random().toString(),
          title: 'Payment Sent',
          message: `USD ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} sent to ${result.recipient.hpay_id}.`,
          timestamp: 'Just now',
          category: 'Payments',
          read: false,
        },
        ...prev,
      ]);

      addToast(
        'Payment Sent',
        `Successfully sent USD ${amount.toLocaleString('en-US')} to ${result.recipient.hpay_id}`
      );

      return tx;
    } catch (e) {
      toastTransferFailed(addToast, e);
      throw e;
    }
  };

  const requestMoney = (
    recipientHPayId: string,
    amount: number,
    currency: CurrencyCode,
    description: string,
    dueDate: string
  ) => {
    const newNotif: NotificationItem = {
      id: Math.random().toString(),
      title: 'Payment Request Created',
      message: `Requested ${currency} ${amount.toLocaleString()} from ${recipientHPayId}. Due: ${dueDate}`,
      timestamp: 'Just now',
      category: 'Payments',
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
    addToast('Payment Request Created', `Request for ${currency} ${amount.toLocaleString()} sent to ${recipientHPayId}`);
  };

  const createInvoice = (
    customerName: string,
    customerEmail: string,
    items: any[],
    dueDate: string,
    notes?: string
  ) => {
    const totalAmount = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `HP-00${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      customerEmail,
      amount: totalAmount,
      currency: 'USD',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate,
      status: 'Pending',
      items,
      notes
    };

    setInvoices((prev) => [newInv, ...prev]);
    addToast('Invoice Created', `Invoice ${newInv.invoiceNumber} created for ${customerName}`);
  };

  const createPaymentLink = (
    productTitle: string,
    amount: number,
    currency: CurrencyCode,
    description: string
  ): PaymentLink => {
    const code = `HP-${Math.floor(10000 + Math.random() * 90000)}`;
    const newLink: PaymentLink = {
      id: `pl-${Date.now()}`,
      code,
      productTitle,
      amount,
      currency,
      description,
      expirationDate: '2026-09-30',
      status: 'Active',
      createdAt: 'Today',
      url: `hpay.me/pay/${code}`
    };

    setPaymentLinks((prev) => [newLink, ...prev]);
    addToast('Payment Link Created', `Link hpay.me/pay/${code} generated successfully.`);
    return newLink;
  };

  const createPayout = async (
    beneficiaryName: string,
    bankName: string,
    accountNumber: string,
    amount: number,
    currency: CurrencyCode
  ) => {
    if (currency !== 'USD') {
      toastTransferFailed(addToast, new Error('Live ledger payouts are USD-only'));
      return;
    }
    try {
      const flags = await requestProtocolClearance({
        amount,
        path: 'payout',
        recipient: bankName,
      });
      await createPayoutApi({
        amount,
        bank_name: bankName,
        account_number: accountNumber,
        description: `Payout to ${beneficiaryName} via ${bankName}`,
        ...flags,
      });
      await refreshLedger();
      addToast(
        'Payout Initiated',
        `USD ${amount.toLocaleString()} scheduled — ${PROTOCOL.id} · Processing → Completed ~2s`
      );
      // Server flips payout to settled after 2s — pull again so UI shows Completed
      window.setTimeout(() => {
        void refreshLedger();
      }, 2200);
    } catch (e) {
      toastTransferFailed(addToast, e);
    }
  };

  const releaseEscrowFunds = async (escrowId: string) => {
    const esc = escrowTrades.find((e) => e.id === escrowId);
    if (!esc) {
      toastTransferFailed(addToast, new Error('Escrow trade not found'));
      return;
    }
    try {
      const flags = await requestProtocolClearance({
        amount: esc.tradeValue,
        path: 'escrow_release',
        recipient: esc.supplierId || '@abc-trading',
      });
      await releaseEscrowApi({
        escrow_id: escrowId,
        to_hpay_id: esc.supplierId || '@abc-trading',
        amount: esc.tradeValue,
        description: `Escrow release ${escrowId} — ${esc.tradeTitle}`,
        ...flags,
      });

      setEscrowTrades((prev) =>
        prev.map((row) => {
          if (row.id !== escrowId) return row;
          return {
            ...row,
            status: 'Settled',
            timeline: row.timeline.map((step) => ({
              ...step,
              completed: true,
              current: step.label.includes('Settlement'),
            })),
          };
        })
      );
      setTrades((prev) =>
        prev.map((tr) => (tr.escrowId === escrowId ? { ...tr, status: 'Completed' } : tr))
      );

      await refreshLedger();
      addToast('Escrow Released', `$${esc.tradeValue.toLocaleString()} settled on ledger → ${esc.supplierId || '@abc-trading'}`);
    } catch (e) {
      toastTransferFailed(addToast, e);
    }
  };

  const convertCurrency = (fromCurr: CurrencyCode, toCurr: CurrencyCode, fromAmount: number) => {
    if (fromCurr === 'USD' || toCurr === 'USD') {
      addToast(
        'FX Blocked',
        'USD is ledger-backed. Use Pay / Transfer for USD — no off-ledger FX against USD.',
        'error'
      );
      return;
    }

    // Display wallets only (non-USD)
    const rates: Record<CurrencyCode, number> = {
      USD: 1.0,
      AED: 3.6725,
      EUR: 0.915,
      PKR: 278.50,
      USDC: 1.0,
      USDT: 1.0,
      eUSD: 1.0,
      eAED: 3.6725,
      BTC: 1 / 95000,
      ETH: 1 / 2700
    };

    const inUSD = fromAmount / rates[fromCurr];
    const outAmount = inUSD * rates[toCurr];

    setBalances((prev) => ({
      ...prev,
      [fromCurr]: Math.max(0, prev[fromCurr] - fromAmount),
      [toCurr]: prev[toCurr] + outAmount
    }));

    addToast(
      'Currency Converted',
      `Converted ${fromCurr} ${fromAmount.toLocaleString()} → ${toCurr} ${outAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  // Price Monitoring Actions
  const addPriceAlert = (asset: CurrencyCode, targetPrice: number, condition: 'ABOVE' | 'BELOW') => {
    const newAlert: PriceAlert = {
      id: `pa-${Date.now()}`,
      asset,
      targetPrice,
      condition,
      active: true,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setPriceAlerts((prev) => [newAlert, ...prev]);
    addToast('Price Alert Set', `Monitoring ${asset} for threshold ${condition} $${targetPrice.toLocaleString()}`);
  };

  const togglePriceAlert = (id: string) => {
    setPriceAlerts((prev) =>
      prev.map((pa) => (pa.id === id ? { ...pa, active: !pa.active } : pa))
    );
  };

  const deletePriceAlert = (id: string) => {
    setPriceAlerts((prev) => prev.filter((pa) => pa.id !== id));
    addToast('Alert Removed', 'Price monitoring threshold removed.', 'info');
  };

  // Staking Actions
  const stakeAsset = (asset: CurrencyCode, amount: number, lockPeriodDays: number, apr: number) => {
    if (asset === 'USD') {
      addToast(
        'Staking Blocked',
        'USD is ledger-backed. Staking cannot invent or lock off-ledger USD balances.',
        'error'
      );
      return;
    }
    if (balances[asset] < amount) {
      addToast('Staking Failed', `Insufficient ${asset} balance.`, 'error');
      return;
    }

    setBalances((prev) => ({
      ...prev,
      [asset]: prev[asset] - amount
    }));

    const newPosition: StakingPosition = {
      id: `stk-${Date.now()}`,
      asset,
      amount,
      apr,
      stakedDate: new Date().toISOString().split('T')[0],
      lockPeriodDays,
      earnedYield: 0,
      status: 'ACTIVE'
    };

    setStakingPositions((prev) => [newPosition, ...prev]);

    setNotifications((prev) => [
      {
        id: `stk-notif-${Date.now()}`,
        title: 'Staking Position Created',
        message: `Staked ${amount.toLocaleString()} ${asset} @ ${apr}% APR (${lockPeriodDays} Days Lock)`,
        timestamp: 'Just now',
        category: 'Settlement',
        read: false
      },
      ...prev
    ]);

    addToast('Assets Staked', `Successfully staked ${amount.toLocaleString()} ${asset} at ${apr}% APR!`);
  };

  const unstakeAsset = (id: string) => {
    const position = stakingPositions.find((s) => s.id === id);
    if (!position || position.status === 'UNSTAKED') return;
    if (position.asset === 'USD') {
      addToast('Unstake Blocked', 'USD staking is not ledger-backed in this build.', 'error');
      return;
    }

    const totalReturn = position.amount + position.earnedYield;

    setBalances((prev) => ({
      ...prev,
      [position.asset]: prev[position.asset] + totalReturn
    }));

    setStakingPositions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'UNSTAKED' } : s))
    );

    addToast(
      'Assets Unstaked',
      `Returned ${position.amount.toLocaleString()} ${position.asset} + ${position.earnedYield.toLocaleString()} ${position.asset} yield to wallet balance!`
    );
  };

  const claimYield = (id: string) => {
    const position = stakingPositions.find((s) => s.id === id);
    if (!position || position.earnedYield <= 0) return;
    if (position.asset === 'USD') {
      addToast('Claim Blocked', 'USD yield cannot invent ledger credits.', 'error');
      return;
    }

    const yieldAmount = position.earnedYield;

    setBalances((prev) => ({
      ...prev,
      [position.asset]: prev[position.asset] + yieldAmount
    }));

    setStakingPositions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, earnedYield: 0 } : s))
    );

    addToast('Yield Claimed', `Claimed ${yieldAmount.toLocaleString()} ${position.asset} accrued yield!`);
  };

  // Multi-Sig Vault Actions
  const createVaultTransferRequest = (
    title: string,
    recipient: string,
    amount: number,
    asset: CurrencyCode
  ) => {
    const reqId = `VLT-${Math.floor(8000 + Math.random() * 1000)}`;
    const newReq: VaultTransferRequest = {
      id: reqId,
      title,
      recipient,
      amount,
      asset,
      requiredSignatures: 3,
      currentSignatures: 1,
      approvers: [
        { name: `${profile.name} (CEO)`, role: 'Primary Keyholder', signed: true, timestamp: 'Just now' },
        { name: 'Ayesha Malik (CFO)', role: 'Treasury Officer', signed: false },
        { name: 'Security Enclave Bot', role: 'Compliance & AML Verification', signed: false }
      ],
      status: 'SECURITY_PENDING',
      createdAt: 'Just now',
      riskAssessment: 'Multi-Sig Authorization Initiated • Pending 2/3 Signatures'
    };

    setVaultRequests((prev) => [newReq, ...prev]);

    setNotifications((prev) => [
      {
        id: `vlt-notif-${Date.now()}`,
        title: 'Vault Request Created',
        message: `Multi-Sig approval initiated for ${amount.toLocaleString()} ${asset} to ${recipient}. Required 2 more signatures.`,
        timestamp: 'Just now',
        category: 'Security',
        read: false
      },
      ...prev
    ]);

    addToast('Vault Transfer Initiated', `Request ${reqId} created in SECURITY_PENDING state.`);
  };

  const signVaultTransferRequest = async (id: string, approverName?: string) => {
    const existing = vaultRequests.find((r) => r.id === id && r.status === 'SECURITY_PENDING');
    if (!existing) return;

    let executed = false;
    const settleAsset: CurrencyCode = existing.asset;
    let transferAmount = existing.amount;
    let recipientName = existing.recipient;

    setVaultRequests((prev) =>
      prev.map((req) => {
        if (req.id === id && req.status === 'SECURITY_PENDING') {
          transferAmount = req.amount;
          recipientName = req.recipient;

          const updatedApprovers = req.approvers.map((appr) => {
            if (!appr.signed && (!approverName || appr.name.includes(approverName))) {
              return { ...appr, signed: true, timestamp: 'Just now' };
            }
            return appr;
          });

          const newSigCount = updatedApprovers.filter((a) => a.signed).length;
          const isFullApproved = newSigCount >= req.requiredSignatures;

          if (isFullApproved) {
            executed = true;
          }

          return {
            ...req,
            approvers: updatedApprovers,
            currentSignatures: newSigCount,
            status: isFullApproved ? 'EXECUTED' : 'SECURITY_PENDING',
            riskAssessment: isFullApproved
              ? 'Passed • 3/3 Multi-Sig Signatures Verified • Executed via Harvics FastRail'
              : `Pending ${req.requiredSignatures - newSigCount} more signature(s)`
          };
        }
        return req;
      })
    );

    if (!executed) {
      addToast('Multi-Sig Signature Recorded', `Cryptographic authorization added for ${id}.`);
      return;
    }

    if (settleAsset === 'USD') {
      try {
        const resolved = recipientName.trim().startsWith('@')
          ? recipientName.trim()
          : '@ahmed';
        await createTransfer({
          to_hpay_id: resolved,
          amount: transferAmount,
          description: `Vault Transfer ${id} Multi-Sig Executed`,
          ...(await requestProtocolClearance({
            amount: transferAmount,
            path: 'vault',
            recipient: resolved,
            multiSigApproved: true,
            multiSigApprovals: 3,
          })),
        });
        await refreshLedger();
        setNotifications((prev) => [
          {
            id: `vlt-exec-${Date.now()}`,
            title: 'Vault Transaction Executed',
            message: `Multi-Sig cleared — $${transferAmount.toLocaleString()} posted on ledger → ${resolved}`,
            timestamp: 'Just now',
            category: 'Security',
            read: false,
          },
          ...prev,
        ]);
        addToast(
          'Vault Transfer Settled',
          `${id} cleared multi-sig and settled $${transferAmount.toLocaleString()} on the ledger`
        );
      } catch (e) {
        setVaultRequests((prev) =>
          prev.map((req) =>
            req.id === id
              ? {
                  ...req,
                  status: 'SECURITY_PENDING',
                  riskAssessment: `Ledger settle failed — ${e instanceof Error ? e.message : 'error'}`,
                }
              : req
          )
        );
        toastTransferFailed(addToast, e);
      }
      return;
    }

    // Display-only crypto / CBDC vault path (not ledger USD)
    setBalances((prev) => ({
      ...prev,
      [settleAsset]: Math.max(0, prev[settleAsset] - transferAmount),
    }));

    const tx = LedgerService.buildTransaction({
      amount: transferAmount,
      currency: settleAsset,
      merchantOrPerson: recipientName,
      recipientHPayId: recipientName,
      senderHPayId: profile.hpayId,
      category: 'Vault Multi-Sig Transfer',
      direction: 'out',
      paymentMethod: 'Harvics Multi-Sig Vault',
      fee: 0,
      note: `Vault Transfer ${id} Multi-Sig Executed`,
    });

    setTransactions((prev) => [tx, ...prev]);
    setNotifications((prev) => [
      {
        id: `vlt-exec-${Date.now()}`,
        title: 'Vault Transaction Executed',
        message: `Multi-Sig approval completed for ${id}! ${transferAmount.toLocaleString()} ${settleAsset} released.`,
        timestamp: 'Just now',
        category: 'Security',
        read: false,
      },
      ...prev,
    ]);
    addToast(
      'Vault Transfer Approved & Executed!',
      `${id} passed multi-sig clearance and transferred ${transferAmount.toLocaleString()} ${settleAsset}.`
    );
  };

  const resetDemoData = async () => {
    try {
      if (!getCachedUser()) {
        await apiLogin('demo@hpay.com', 'demo1234');
        setIsAuthenticated(true);
      }
      const reseeds = await reseedDemo();
      if (reseeds.user) {
        applyAuthUser(reseeds.user);
      }
      setInvoices(initialInvoices);
      setPaymentLinks(initialPaymentLinks);
      setEscrowTrades(initialEscrowTrades);
      setTrades(initialTrades);
      setNotifications(initialNotifications);
      setPriceAlerts(initialPriceAlerts);
      setStakingPositions(initialStakingPositions);
      setVaultRequests(initialVaultRequests);
      localStorage.removeItem(STORAGE_KEY);
      await refreshLedger();
      addToast('Demo Reseeded', 'In-memory ledger reseeded; balances are ledger-derived again.', 'info');
    } catch (e) {
      toastTransferFailed(addToast, e);
    }
  };

  return (
    <HPayContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedCurrency,
        setSelectedCurrency,
        profile,
        balances,
        transactions,
        invoices,
        paymentLinks,
        payouts,
        escrowTrades,
        trades,
        notifications,
        priceAlerts,
        livePrices,
        stakingPositions,
        vaultRequests,
        selectedTransaction,
        setSelectedTransaction,
        isSearchOpen,
        setIsSearchOpen,
        isNotificationOpen,
        setIsNotificationOpen,
        toasts,
        addToast,
        removeToast,
        sendMoney,
        requestMoney,
        createInvoice,
        createPaymentLink,
        createPayout,
        releaseEscrowFunds,
        convertCurrency,
        markNotificationRead,
        resetDemoData,
        topUpWallet,
        refreshLedger,
        searchHPayUsers,
        ledgerReady,
        ledgerSyncing,
        authReady,
        isAuthenticated,
        signIn,
        signUp,
        signOut,
        protocolBioChallenge,
        resolveProtocolBiometric,
        cancelProtocolBiometric,
        protocolId: PROTOCOL.id,
        addPriceAlert,
        togglePriceAlert,
        deletePriceAlert,
        stakeAsset,
        unstakeAsset,
        claimYield,
        createVaultTransferRequest,
        signVaultTransferRequest
      }}
    >
      {children}
    </HPayContext.Provider>
  );
};

export const useHPay = () => {
  const context = useContext(HPayContext);
  if (!context) throw new Error('useHPay must be used within an HPayProvider');
  return context;
};
