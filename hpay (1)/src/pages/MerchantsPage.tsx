import React, { useState, useEffect } from 'react';
import { useHPay } from '../context/HPayContext';
import { Store, TrendingUp, Users, RefreshCw, FileText, Link, ArrowUpRight, CheckCircle2, CheckSquare, Square, Download, Send, Archive, X, ShieldCheck, Building2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { BiometricOverlay } from '../components/common/BiometricOverlay';
import {
  fetchMerchantOutlets,
  batchSettleMerchants,
  fetchSalesVelocity,
} from '../services/hpayApi';

interface MerchantOutlet {
  id: string;
  name: string;
  location: string;
  dailyVolume: number;
  pendingSettlement: number;
  status: 'Active' | 'Paused' | 'Pending Audit';
}

export const MerchantsPage: React.FC = () => {
  const { setActiveTab, addToast, refreshLedger } = useHPay();

  const [outlets, setOutlets] = useState<MerchantOutlet[]>([]);
  const [merchantSalesData, setMerchantSalesData] = useState<{ time: string; sales: number }[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBiometricOpen, setIsBiometricOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'send' | 'archive' | 'export' | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMerchants = async () => {
    setLoading(true);
    try {
      const [out, vel] = await Promise.all([fetchMerchantOutlets(), fetchSalesVelocity()]);
      setOutlets(
        (out.outlets || []).map((o) => ({
          id: o.id,
          name: o.name,
          location: o.location,
          dailyVolume: o.dailyVolume,
          pendingSettlement: o.pendingSettlement,
          status: (o.status as MerchantOutlet['status']) || 'Active',
        }))
      );
      setMerchantSalesData((vel.stream || []).map((s) => ({ time: s.time, sales: s.sales })));
    } catch (e) {
      addToast('Merchants Offline', e instanceof Error ? e.message : 'Failed to load outlets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMerchants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === outlets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(outlets.map((o) => o.id));
    }
  };

  const selectedOutlets = outlets.filter((o) => selectedIds.includes(o.id));
  const totalPendingSettlement = selectedOutlets.reduce((sum, o) => sum + o.pendingSettlement, 0);

  const triggerBatchAction = (action: 'send' | 'archive' | 'export') => {
    if (selectedIds.length === 0) return;
    setPendingAction(action);
    if (totalPendingSettlement > 5000 || action === 'archive') {
      setIsBiometricOpen(true);
    } else {
      void executeBatchAction(action, false);
    }
  };

  const executeBatchAction = async (action: 'send' | 'archive' | 'export', biometricVerified = true) => {
    const count = selectedIds.length;
    if (action === 'send') {
      try {
        const result = await batchSettleMerchants(selectedIds, {
          biometric_verified: biometricVerified || totalPendingSettlement >= 10000,
          multi_sig_approved: totalPendingSettlement >= 50000,
          multi_sig_approvals: totalPendingSettlement >= 50000 ? 3 : 0,
        });
        addToast(
          'Batch Settlement Initiated!',
          `Dispatched payout of $${Number(result.total_amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })} across ${result.settled_count} merchant outlets.`
        );
        await refreshLedger();
        await loadMerchants();
      } catch (e) {
        addToast(
          'Transfer Failed',
          e instanceof Error ? e.message : 'Batch settlement failed',
          'error'
        );
      }
    } else if (action === 'archive') {
      setOutlets((prev) =>
        prev.map((o) => (selectedIds.includes(o.id) ? { ...o, status: 'Paused' } : o))
      );
      addToast('Outlets Paused/Archived', `Updated status for ${count} outlets.`);
    } else if (action === 'export') {
      addToast('Export Complete', `Generated bulk CSV audit statement for ${count} outlets.`);
    }
    setSelectedIds([]);
    setIsBiometricOpen(false);
    setPendingAction(null);
  };

  return (
    <div className="space-y-8 pb-12">
      <BiometricOverlay
        isOpen={isBiometricOpen}
        title="Biometric Merchant Batch Action"
        subtitle={`Verifying biometric passkey to execute ${pendingAction?.toUpperCase()} on ${selectedIds.length} merchant terminals`}
        amount={`$${totalPendingSettlement.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        recipient={`${selectedIds.length} Verified Outlets`}
        onSuccess={() => pendingAction && void executeBatchAction(pendingAction, true)}
        onCancel={() => {
          setIsBiometricOpen(false);
          setPendingAction(null);
        }}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6 text-[#E8DCC4]" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">HPay Merchant Outlets</h1>
          </div>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            Multi-location merchant operations & batch settlement rail
            {loading ? ' · syncing…' : ` · ${outlets.length} outlets live`}
          </p>
        </div>

        {/* Business Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => void loadMerchants()}
            className="px-3.5 py-2 rounded-xl bg-[#211116] border border-[#381B23] hover:border-[#800020] text-xs font-semibold text-white transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#E8DCC4] ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={() => setActiveTab('checkout')}
            className="px-3.5 py-2 rounded-xl bg-[#800020] text-[#E8DCC4] text-xs font-bold hover:bg-[#990026] transition-all flex items-center gap-1.5 border border-[#E8DCC4]/20 shadow-md"
          >
            <Link className="w-3.5 h-3.5" /> Create Payment Link
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className="px-3.5 py-2 rounded-xl bg-[#211116] border border-[#381B23] hover:border-[#800020] text-xs font-semibold text-white transition-all flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-[#E8DCC4]" /> Create Invoice
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className="px-3.5 py-2 rounded-xl bg-[#211116] border border-[#381B23] hover:border-[#800020] text-xs font-semibold text-white transition-all flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> Payout
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-[#180C10] border border-[#33171E] space-y-1">
          <span className="text-[10px] font-bold text-[#A89887] uppercase tracking-wider block">Today's Sales</span>
          <span className="text-xl font-extrabold font-mono text-emerald-400 block">$28,420.00</span>
          <span className="text-[10px] text-gray-500 font-mono">+18% vs yesterday</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#180C10] border border-[#33171E] space-y-1">
          <span className="text-[10px] font-bold text-[#A89887] uppercase tracking-wider block">Pending Settlement</span>
          <span className="text-xl font-extrabold font-mono text-[#E8DCC4] block">$16,800.00</span>
          <span className="text-[10px] text-gray-500 font-mono">5 Outlets Active</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#180C10] border border-[#33171E] space-y-1">
          <span className="text-[10px] font-bold text-[#A89887] uppercase tracking-wider block">Active Outlets</span>
          <span className="text-xl font-extrabold font-mono text-white block">5 Outlets</span>
          <span className="text-[10px] text-gray-500 font-mono">Global Coverage</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#180C10] border border-[#33171E] space-y-1">
          <span className="text-[10px] font-bold text-[#A89887] uppercase tracking-wider block">Success Rate</span>
          <span className="text-xl font-extrabold font-mono text-[#E8DCC4] block">99.2%</span>
          <span className="text-[10px] text-emerald-400 font-mono">Top tier health</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#180C10] border border-[#33171E] space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold text-[#A89887] uppercase tracking-wider block">Total Refunds</span>
          <span className="text-xl font-extrabold font-mono text-rose-400 block">$1,240.00</span>
          <span className="text-[10px] text-gray-500 font-mono">0.04% refund rate</span>
        </div>
      </div>

      {/* Batch Processing Action Bar */}
      {selectedIds.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#211116] border border-[#800020] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn shadow-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-[#E8DCC4]">
            <CheckSquare className="w-4 h-4 text-[#E8DCC4]" />
            <span>{selectedIds.length} Merchant Outlet(s) Selected</span>
            <span className="text-white font-mono">
              (Pending Settlement: ${totalPendingSettlement.toLocaleString('en-US', { minimumFractionDigits: 2 })})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerBatchAction('send')}
              className="px-3.5 py-2 rounded-xl bg-[#800020] hover:bg-[#990026] text-[#E8DCC4] text-xs font-bold transition-all flex items-center gap-1.5 border border-[#E8DCC4]/20"
            >
              <Send className="w-3.5 h-3.5" /> Bulk Settlement
            </button>
            <button
              onClick={() => triggerBatchAction('export')}
              className="px-3.5 py-2 rounded-xl bg-[#180C10] hover:bg-[#2B141B] text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-[#381B23]"
            >
              <Download className="w-3.5 h-3.5 text-[#E8DCC4]" /> Bulk Export CSV
            </button>
            <button
              onClick={() => triggerBatchAction('archive')}
              className="px-3.5 py-2 rounded-xl bg-[#2B141B] hover:bg-[#3B121A] text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-[#422028]"
            >
              <Archive className="w-3.5 h-3.5" /> Bulk Pause
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="p-2 text-[#A89887] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Outlets Table with Checkboxes */}
      <div className="rounded-3xl bg-[#180C10] border border-[#33171E] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#2B141B]">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Merchant Outlets & POS Terminals</h2>
            <p className="text-xs text-[#A89887]">Select multiple terminals for batch settlements and bulk exports</p>
          </div>
          <button
            onClick={toggleSelectAll}
            className="text-xs font-bold text-[#E8DCC4] hover:underline flex items-center gap-1.5"
          >
            {selectedIds.length === outlets.length ? (
              <>
                <CheckSquare className="w-4 h-4 text-emerald-400" /> Deselect All
              </>
            ) : (
              <>
                <Square className="w-4 h-4" /> Select All ({outlets.length})
              </>
            )}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2B141B] text-[#A89887] font-mono">
                <th className="py-3 px-2 w-8"></th>
                <th className="py-3 px-2">Outlet Name</th>
                <th className="py-3 px-2">Location</th>
                <th className="py-3 px-2 text-right">Daily Volume</th>
                <th className="py-3 px-2 text-right">Pending Settlement</th>
                <th className="py-3 px-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B141B] text-white font-mono">
              {outlets.map((outlet) => {
                const isSelected = selectedIds.includes(outlet.id);
                return (
                  <tr
                    key={outlet.id}
                    onClick={() => toggleSelect(outlet.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#211116]' : 'hover:bg-[#211116]/50'
                    }`}
                  >
                    <td className="py-3.5 px-2">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#E8DCC4]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#A89887]" />
                      )}
                    </td>
                    <td className="py-3.5 px-2 font-sans font-bold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#E8DCC4]" />
                      <div>
                        <div>{outlet.name}</div>
                        <div className="text-[10px] font-mono text-[#A89887]">{outlet.id}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-2 text-[#A89887] font-sans">{outlet.location}</td>
                    <td className="py-3.5 px-2 text-right font-bold">${outlet.dailyVolume.toLocaleString()}</td>
                    <td className="py-3.5 px-2 text-right font-bold text-[#E8DCC4]">${outlet.pendingSettlement.toLocaleString()}</td>
                    <td className="py-3.5 px-2 text-center font-sans">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        outlet.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'bg-rose-950 text-rose-400 border border-rose-800/40'
                      }`}>
                        {outlet.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart Section */}
      <div className="rounded-3xl bg-[#180C10] border border-[#33171E] p-6 space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-[#2B141B]">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Today's Hourly Sales Velocity</h2>
            <p className="text-xs text-[#A89887]">Harvics Global Ventures POS & Checkout integrations</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/40">
            LIVE POS STREAM
          </span>
        </div>

        <div className="w-full min-w-0" style={{ height: 256 }}>
          <ResponsiveContainer width="100%" height={256} minWidth={0}>
            <BarChart data={merchantSalesData}>
              <XAxis dataKey="time" stroke="#A89887" fontSize={11} tickLine={false} />
              <YAxis stroke="#A89887" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#211116', borderColor: '#381B23', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="sales" fill="#10B981" radius={[8, 8, 0, 0]} name="Sales ($)" isAnimationActive animationDuration={900} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

