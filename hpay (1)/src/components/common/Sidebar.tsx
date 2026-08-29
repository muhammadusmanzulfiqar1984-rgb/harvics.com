import React, { useState } from 'react';
import { useHPay } from '../../context/HPayContext';
import { ActiveTab } from '../../types';
import {
  Home,
  Send,
  Wallet,
  Activity,
  Store,
  FileText,
  ArrowUpRight,
  ShieldAlert,
  Globe,
  BarChart2,
  Sparkles,
  Settings,
  User,
  Code2,
  MoreHorizontal,
  X,
  Layers,
  Shield
} from 'lucide-react';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useHPay();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainNavItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'pay', label: 'Pay & Transfer', icon: Send },
    { id: 'wallet', label: 'Multi-Currency Wallet', icon: Wallet },
    { id: 'activity', label: 'Activity & Ledger', icon: Activity },
    { id: 'merchants', label: 'Merchants', icon: Store },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'payouts', label: 'Payouts', icon: ArrowUpRight },
    { id: 'escrow', label: 'Trade Escrow', icon: ShieldAlert, badge: 'Secured' },
    { id: 'trade', label: 'Global Trade', icon: Globe },
    { id: 'analytics', label: 'Financial Intelligence', icon: BarChart2 }
  ];

  const bottomNavItems: NavItem[] = [
    { id: 'harvey', label: 'Harvey AI', icon: Sparkles, badge: 'AI' },
    { id: 'developer', label: 'Developer & API', icon: Code2 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'security', label: 'Security Enclave', icon: Shield, badge: 'FIPS' },
    { id: 'profile', label: 'Account Profile', icon: User }
  ];

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar — fixed height sibling of main, not sticky-in-flow */}
      <aside className="hidden md:flex h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-[#33171E] bg-[#180C10] select-none">
        {/* Brand Header */}
        <div className="p-6 flex items-center justify-between border-b border-[#2B141B]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#800020] via-[#A81B39] to-[#D4C3A3] p-[1px] shadow-lg shadow-[#800020]/20">
              <div className="w-full h-full bg-[#1C0D12] rounded-[11px] flex items-center justify-center">
                <span className="text-[#E8DCC4] font-black text-lg tracking-wider font-mono">H</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[#F5EFE6] font-bold text-lg tracking-tight font-sans">HPay</span>
                <span className="text-[10px] text-[#D4C3A3] font-mono font-bold">TM</span>
              </div>
              <p className="text-[10px] text-[#A89887] font-medium tracking-tight">Harvics Commerce Network</p>
            </div>
          </div>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 px-3 py-4 space-y-6">
          {/* Main Menu */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-[#A89887] uppercase tracking-widest mb-2">Main Financial Layer</p>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#4A101D] to-[#330B13] text-[#F5EFE6] border border-[#7D2235] shadow-sm shadow-[#800020]/30'
                      : 'text-[#C5B5A5] hover:text-white hover:bg-[#261318]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#E8DCC4]' : 'text-[#A89887]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#521321] text-[#E8DCC4] border border-[#7D2235]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Business Divider Header */}
          <div className="pt-2 border-t border-[#2B141B]">
            <p className="px-3 text-[10px] font-bold text-[#D4C3A3] uppercase tracking-widest mb-2 flex items-center justify-between">
              <span>Harvics Business</span>
              <span className="text-[9px] text-[#A89887] font-mono">@mian</span>
            </p>
            <button
              onClick={() => handleSelect('checkout')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'checkout'
                  ? 'bg-gradient-to-r from-[#4A101D] to-[#330B13] text-[#F5EFE6] border border-[#7D2235] shadow-sm shadow-[#800020]/30'
                  : 'text-[#C5B5A5] hover:text-white hover:bg-[#261318]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-[#E8DCC4]" />
                <span>Checkout & Links</span>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-[#2B141B] space-y-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#4A101D] to-[#330B13] text-[#F5EFE6] border border-[#7D2235]'
                    : 'text-[#C5B5A5] hover:text-white hover:bg-[#261318]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#E8DCC4]' : 'text-[#A89887]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#521321] text-[#E8DCC4] border border-[#7D2235]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#180C10]/95 backdrop-blur-xl border-t border-[#33171E] px-3 py-2 flex items-center justify-around">
        <button
          onClick={() => handleSelect('home')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-[#E8DCC4]' : 'text-[#A89887]'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button
          onClick={() => handleSelect('pay')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'pay' ? 'text-[#E8DCC4]' : 'text-[#A89887]'}`}
        >
          <Send className="w-5 h-5" />
          <span className="text-[10px] font-medium">Pay</span>
        </button>
        <button
          onClick={() => handleSelect('activity')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'activity' ? 'text-[#E8DCC4]' : 'text-[#A89887]'}`}
        >
          <Activity className="w-5 h-5" />
          <span className="text-[10px] font-medium">Activity</span>
        </button>
        <button
          onClick={() => handleSelect('harvey')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'harvey' ? 'text-[#E8DCC4]' : 'text-[#A89887]'}`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-medium">Harvey</span>
        </button>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 text-[#A89887] hover:text-white"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </div>

      {/* Mobile Full Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#140A0D]/98 backdrop-blur-2xl p-6 overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between pb-6 border-b border-[#33171E]">
            <div className="flex items-center gap-2">
              <span className="text-[#F5EFE6] font-bold text-xl">HPay Navigation</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-[#231217] text-[#A89887] hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="py-6 space-y-3 flex-1">
            {[...mainNavItems, ...bottomNavItems].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold ${
                    activeTab === item.id ? 'bg-[#521321] text-[#E8DCC4] border border-[#7D2235]' : 'text-[#C5B5A5] bg-[#231217]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-[#E8DCC4]" />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
