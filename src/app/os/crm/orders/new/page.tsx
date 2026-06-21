'use client';

import React, { useState, useEffect } from 'react';
import { CRMPageLayout } from '@/components/layout/crm/CRMPageLayout';
import { HarvicsCard } from '@/components/ui/crm/HarvicsCard';
import { HarvicsKPICard } from '@/components/ui/crm/HarvicsKPICard';

// Mock AI Engine Integration (demand.py and price.py)
function useAIEngine(sku: string, qty: number) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    // Simulate 200ms latency as defined in SOUL document
    const timer = setTimeout(() => {
      // 1. Check Neural Governance (Mock)
      const governance = { allow: true, reason: 'APPROVED' };

      // 2. Fetch Data Ocean Context
      const context = { event: 'Ramadan', daysAway: 18, demandIndex: 1.34 };

      // 3. AI `demand.py`
      const optimalQty = 1200;

      // 4. AI `price.py`
      const basePrice = 4.20;
      const discount = qty >= 1000 ? 0.30 : 0;
      const finalPrice = basePrice - discount;

      setData({
        governance,
        context,
        optimalQty,
        finalPrice,
        margin: qty >= 1000 ? '15%' : '18%',
        suggestions: [
          {
            id: 's1',
            text: `Ramadan in ${context.daysAway} days — recommend ${optimalQty} units (+34% demand predicted)`,
            highlights: [{ word: `${optimalQty} units`, color: '#f97316' }]
          },
          {
            id: 's2',
            text: `Competitor promotion this week: consider earlier delivery.`,
          },
          {
            id: 's3',
            text: `Warehouse stock: 4,200 units available — sufficient for ${optimalQty}.`,
            highlights: [{ word: `4,200 units`, color: '#22c55e' }]
          }
        ]
      });
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [sku, qty]);

  return { loading, data };
}

export default function OrderPlacementScreen() {
  const [sku, setSku] = useState('SKU-042');
  const [qty, setQty] = useState<number>(500);

  const { loading: aiLoading, data: aiData } = useAIEngine(sku, qty);

  return (
    <CRMPageLayout
      domainName="CRM"
      breadcrumbs={[{ label: 'Orders', href: '/os/crm/orders' }, { label: 'New Order' }]}
      aiSuggestions={aiData?.suggestions || []}
      aiLoading={aiLoading}
      primaryAction={{
        label: 'Submit Order',
        onClick: () => alert(`Order submitted for ${qty} units of ${sku}. Governance Check: ${aiData?.governance.reason}`)
      }}
      onAskAI={(q) => console.log('Harvoice command:', q)}
      aiActions={
        <button 
          onClick={() => setQty(aiData?.optimalQty || 1200)}
          className="w-full text-center bg-[rgba(59,130,246,0.15)] hover:bg-[rgba(59,130,246,0.3)] border border-[rgba(59,130,246,0.4)] rounded-md py-1.5 text-[11px] text-[#93c5fd] transition-colors"
        >
          Accept AI Recommendation
        </button>
      }
    >
      {/* Element 2: KPI Cards */}
      <div className="flex gap-4">
        <HarvicsKPICard 
          label="Current Stock (Dubai)" 
          value="4,200" 
          change={0} 
        />
        <HarvicsKPICard 
          label="Total Value" 
          value={`AED ${((aiData?.finalPrice || 0) * qty).toLocaleString(undefined, {minimumFractionDigits: 2})}`} 
        />
        <HarvicsKPICard 
          label="Projected Margin" 
          value={aiData?.margin || '--'} 
          change={qty >= 1000 ? -3 : 2} 
        />
      </div>

      {/* Element 3: Main Content Form */}
      <HarvicsCard title="Order Details" padding="lg">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] text-[#94a3b8] mb-1">Product SKU</label>
              <input 
                type="text" 
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-[#050816] border border-[rgba(75,85,99,0.5)] rounded-md px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#fbbf24]"
              />
            </div>
            <div>
              <label className="block text-[12px] text-[#94a3b8] mb-1">Quantity (Units)</label>
              <input 
                type="number" 
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-full bg-[#050816] border border-[rgba(75,85,99,0.5)] rounded-md px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#fbbf24]"
              />
            </div>
          </div>

          <div className="bg-[#050816]/50 border border-[rgba(75,85,99,0.3)] rounded-md p-4">
            <h4 className="text-[13px] font-bold text-[#e2e8f0] mb-3">Live Pricing & Governance</h4>
            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Unit Price (AI Optimized)</span>
                <span className="text-white font-mono">AED {aiData?.finalPrice?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">VAT (5%)</span>
                <span className="text-white font-mono">AED {((aiData?.finalPrice || 0) * qty * 0.05).toFixed(2)}</span>
              </div>
              <div className="border-t border-[rgba(75,85,99,0.3)] pt-2 flex justify-between font-bold">
                <span className="text-white">Total</span>
                <span className="text-[#fbbf24] font-mono text-[14px]">
                  AED {((aiData?.finalPrice || 0) * qty * 1.05).toLocaleString(undefined, {minimumFractionDigits: 2})}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-[rgba(75,85,99,0.3)]">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${aiData?.governance?.allow ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-[#94a3b8]">Neural Governance: <span className="text-white font-bold">{aiData?.governance?.reason || 'Checking...'}</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </HarvicsCard>
    </CRMPageLayout>
  );
}
