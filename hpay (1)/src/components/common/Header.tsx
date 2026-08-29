import React, { useState } from 'react';
import { useHPay } from '../../context/HPayContext';
import { CurrencyCode } from '../../types';
import { Search, Bell, Sparkles, ShieldCheck, ChevronDown, Zap, LogOut } from 'lucide-react';
import { QuickPayModal } from './QuickPayModal';

export const Header: React.FC = () => {
  const {
    profile,
    selectedCurrency,
    setSelectedCurrency,
    notifications,
    setIsSearchOpen,
    isNotificationOpen,
    setIsNotificationOpen,
    setActiveTab,
    signOut,
  } = useHPay();

  const [isQuickPayOpen, setIsQuickPayOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#180C10]/90 backdrop-blur-md border-b border-[#33171E] px-4 md:px-8 flex items-center justify-between">
      <QuickPayModal isOpen={isQuickPayOpen} onClose={() => setIsQuickPayOpen(false)} />

      {/* Search trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-[#231217] border border-[#3D1A22] text-[#A89887] hover:text-white hover:border-[#5C2733] transition-all text-xs md:text-sm w-48 md:w-80 group shadow-inner"
        >
          <Search className="w-4 h-4 text-[#A89887] group-hover:text-[#E8DCC4] transition-colors" />
          <span className="truncate">Search transactions, invoices...</span>
          <kbd className="hidden md:inline-block ml-auto text-[10px] font-mono bg-[#2E181E] text-[#A89887] px-1.5 py-0.5 rounded border border-[#422028]">
            ⌘K
          </kbd>
        </button>

        {/* Quick Fast Action Trigger */}
        <button
          onClick={() => setIsQuickPayOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#800020] hover:bg-[#990026] text-[#E8DCC4] text-xs font-bold border border-[#E8DCC4]/20 transition-all shadow-md"
        >
          <Zap className="w-3.5 h-3.5 text-[#E8DCC4]" />
          <span>Fast Pay & QR</span>
        </button>

        {/* Demo Mode Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2B141B] border border-[#422028] text-[11px] font-medium text-[#E8DCC4]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8DCC4] animate-pulse" />
          DEMO MODE
        </div>
      </div>

      {/* Right Navigation & Profile controls */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Currency Selector */}
        <div className="relative">
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value as CurrencyCode)}
            className="appearance-none bg-[#231217] border border-[#3D1A22] hover:border-[#7A1D31] text-[#F5EFE6] text-xs font-semibold px-3 py-1.5 pr-7 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#800020] transition-all"
          >
            <option value="USD">USD ($)</option>
            <option value="AED">AED (AED)</option>
            <option value="PKR">PKR (PKR)</option>
            <option value="EUR">EUR (€)</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#A89887] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Notifications Toggle */}
        <button
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          className="relative p-2 rounded-lg bg-[#231217] border border-[#3D1A22] text-[#A89887] hover:text-white hover:bg-[#2E181E] transition-all"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#800020] text-[#E8DCC4] text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce border border-[#E8DCC4]/30">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Harvey AI Quick Pill */}
        <button
          onClick={() => setActiveTab('harvey')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#4A101D] to-[#2B0B13] border border-[#7D2235] hover:border-[#A82842] text-[#E8DCC4] text-xs font-medium transition-all shadow-sm group"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E8DCC4] group-hover:rotate-12 transition-transform" />
          <span>Harvey AI</span>
        </button>

        {/* HPay ID & Avatar */}
        <button
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl hover:bg-[#231217] border border-transparent hover:border-[#3D1A22] transition-all"
        >
          <div className="relative">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#7D2235]"
            />
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 absolute -bottom-1 -right-1 bg-[#12090B] rounded-full" />
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-[#F5EFE6] leading-none">{profile.name}</span>
            <span className="text-[10px] font-mono text-[#D4C3A3] leading-tight mt-0.5">{profile.hpayId}</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => void signOut()}
          className="p-2 rounded-lg bg-[#231217] border border-[#3D1A22] text-[#A89887] hover:text-white hover:bg-[#2E181E] transition-all"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
