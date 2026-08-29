import React from 'react';
import { HPayProvider, useHPay } from './context/HPayContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { MarketTickerRail } from './components/common/MarketTickerRail';
import { ToastContainer } from './components/common/Toast';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { TransactionDetailDrawer } from './components/common/TransactionDetailDrawer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { BiometricOverlay } from './components/common/BiometricOverlay';
import { AuthScreen } from './components/common/AuthScreen';
import { IntercomFinWidget } from './components/common/IntercomFinWidget';
import { PROTOCOL } from './security/protocol.js';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { PayPage } from './pages/PayPage';
import { WalletPage } from './pages/WalletPage';
import { ActivityPage } from './pages/ActivityPage';
import { MerchantsPage } from './pages/MerchantsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { PayoutsPage } from './pages/PayoutsPage';
import { EscrowPage } from './pages/EscrowPage';
import { TradePage } from './pages/TradePage';
import { SplitPaymentPage } from './pages/SplitPaymentPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { HarveyAIPage } from './pages/HarveyAIPage';
import { SettingsPage } from './pages/SettingsPage';
import { SecurityEnclavePage } from './pages/SecurityEnclavePage';
import { DeveloperPage } from './pages/DeveloperPage';

const AppContent: React.FC = () => {
  const {
    activeTab,
    protocolBioChallenge,
    resolveProtocolBiometric,
    cancelProtocolBiometric,
    authReady,
    isAuthenticated,
    signIn,
    signUp,
    profile,
  } = useHPay();

  if (!authReady) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#12090B] text-[#A89887] text-sm">
        Unlocking HPay…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthScreen
          onLogin={signIn}
          onSignup={signUp}
          onDemo={async () => {
            await signIn('demo@hpay.com', 'demo1234');
          }}
        />
        <ToastContainer />
        <IntercomFinWidget identityKey="visitor" />
      </>
    );
  }

  return (
    <div className="h-dvh max-h-dvh bg-[#12090B] text-[#F5EFE6] antialiased selection:bg-[#800020] selection:text-[#E8DCC4] overflow-hidden">
      {/* App shell — only sidebar + content are flex children */}
      <div className="flex h-full w-full min-w-0">
        <Sidebar />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#F5F0E8]">
          <Header />

          {/* pb-24 clears the fixed mobile bottom bar */}
          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#F5F0E8] p-4 pb-24 md:p-8 md:pb-8">
            <div className="mx-auto w-full max-w-7xl">
              {activeTab === 'home' && <DashboardPage />}
              {activeTab === 'pay' && <PayPage />}
              {activeTab === 'wallet' && <WalletPage />}
              {activeTab === 'activity' && <ActivityPage />}
              {activeTab === 'merchants' && <MerchantsPage />}
              {activeTab === 'checkout' && <CheckoutPage />}
              {activeTab === 'invoices' && <InvoicesPage />}
              {activeTab === 'payouts' && <PayoutsPage />}
              {activeTab === 'escrow' && <EscrowPage />}
              {activeTab === 'trade' && <TradePage />}
              {activeTab === 'split' && <SplitPaymentPage />}
              {activeTab === 'analytics' && <AnalyticsPage />}
              {activeTab === 'harvey' && <HarveyAIPage />}
              {activeTab === 'settings' && <SettingsPage />}
              {activeTab === 'security' && <SecurityEnclavePage />}
              {activeTab === 'profile' && <SettingsPage />}
              {activeTab === 'developer' && <DeveloperPage />}
            </div>
          </main>
        </div>

        <MarketTickerRail />
      </div>

      {/* Overlays live outside the flex shell so they never steal row space */}
      <ToastContainer />
      <NotificationDrawer />
      <TransactionDetailDrawer />
      <GlobalSearchModal />
      <IntercomFinWidget identityKey={profile.hpayId || profile.email} />
      <BiometricOverlay
        isOpen={Boolean(protocolBioChallenge)}
        title="PROTOCOL L5 · Passkey Required"
        subtitle={`${PROTOCOL.id} — high-value settlement requires FIDO2 / Touch ID clearance`}
        amount={
          protocolBioChallenge
            ? `$${(protocolBioChallenge.amountCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
            : undefined
        }
        recipient={protocolBioChallenge?.recipient}
        onSuccess={resolveProtocolBiometric}
        onCancel={cancelProtocolBiometric}
      />
    </div>
  );
};

export default function App() {
  return (
    <HPayProvider>
      <AppContent />
    </HPayProvider>
  );
}
