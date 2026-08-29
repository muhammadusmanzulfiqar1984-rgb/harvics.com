import React from 'react';
import { useHPay } from '../../context/HPayContext';
import { Bell, Check, X, ShieldAlert, DollarSign, FileText, Lock } from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const { notifications, isNotificationOpen, setIsNotificationOpen, markNotificationRead } = useHPay();

  if (!isNotificationOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="bg-[#1A0D11] border-l border-[#33171E] w-full max-w-md h-full shadow-2xl flex flex-col text-[#F5EFE6] animate-in slide-in-from-right duration-200">
        <div className="p-5 border-b border-[#2B141B] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#3B121A] text-[#E8DCC4] border border-[#5E1A29]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Notifications Center</h3>
              <p className="text-[11px] text-[#A89887]">Harvics network real-time updates</p>
            </div>
          </div>
          <button
            onClick={() => setIsNotificationOpen(false)}
            className="p-1.5 rounded-lg bg-[#261318] text-[#A89887] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => markNotificationRead(item.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                item.read ? 'bg-[#211116] border-[#381B23] opacity-75' : 'bg-[#2A141A] border-[#661C2C] shadow-lg'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {item.category === 'Payments' && <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {item.category === 'Invoices' && <FileText className="w-4 h-4 text-[#E8DCC4] shrink-0" />}
                  {item.category === 'Escrow' && <ShieldAlert className="w-4 h-4 text-[#D84E69] shrink-0" />}
                  {item.category === 'Security' && <Lock className="w-4 h-4 text-[#E8DCC4] shrink-0" />}
                  <h4 className="text-xs font-bold text-white">{item.title}</h4>
                </div>
                <span className="text-[10px] text-[#A89887] font-mono shrink-0">{item.timestamp}</span>
              </div>
              <p className="text-xs text-[#D4C5B5] mt-1.5 leading-relaxed">{item.message}</p>
              {!item.read && (
                <div className="mt-2.5 flex justify-end">
                  <span className="text-[10px] font-semibold text-[#E8DCC4] flex items-center gap-1">
                    <Check className="w-3 h-3" /> Mark Read
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
