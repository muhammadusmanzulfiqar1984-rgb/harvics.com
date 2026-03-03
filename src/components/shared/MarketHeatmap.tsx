import React, { useEffect, useState } from 'react';
import SupplyChainPassport from './SupplyChainPassport';

interface RegionStatus {
  id: string;
  name: string;
  profitMargin: number;
  inflationRate: number;
  competitorStock: 'In Stock' | 'Out of Stock';
}

const MarketHeatmap: React.FC = () => {
  const [regions, setRegions] = useState<RegionStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttackPlan = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/intelligence/attack-plan');
        const data = await response.json();
        
        if (data.status === 'active' && data.plan) {
          const mappedRegions: RegionStatus[] = data.plan.map((item: any) => {
            // Determine stock status based on strategy
            const isArbitrage = item.strategy === 'AGGRESSIVE_ARBITRAGE';
            
            // Map country codes to names
            const names: Record<string, string> = {
              'US': 'United States',
              'PK': 'Pakistan',
              'AE': 'UAE',
              'GB': 'United Kingdom',
              'CN': 'China'
            };

            // Parse margin (remove %)
            const margin = parseFloat(item.margin.replace('%', ''));

            return {
              id: item.territory,
              name: names[item.territory] || item.territory,
              profitMargin: margin,
              inflationRate: item.alert.includes('INFLATION') ? 15.0 : 2.5, // Simulate based on alert
              competitorStock: isArbitrage ? 'Out of Stock' : 'In Stock',
              passport: item.passport
            };
          });
          setRegions(mappedRegions);
        }
      } catch (error) {
        console.error('Failed to fetch intelligence:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttackPlan();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAttackPlan, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (region: RegionStatus) => {
    // Gold: High-margin arbitrage (Competitors out of stock)
    if (region.competitorStock === 'Out of Stock') return 'bg-gradient-to-br from-[#F5C542]/20 to-[#F5C542]/5 border-[#F5C542] text-black shadow-[0_4px_20px_rgba(245,197,66,0.15)]';
    
    // Red: High inflation risk (> 10%) - Immediate price adjustment required
    if (region.inflationRate > 10) return 'bg-red-50 border-red-200 text-red-800 animate-pulse';
    
    // Green: Stable growth - Standard automation
    return 'bg-white border-gray-200 text-gray-800 hover:border-gray-300';
  };

  if (loading) {
    return (
      <div className="p-8 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#F5C542] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 font-medium">Synthesizing Global Intelligence...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 w-full transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            🌍 Global Market Heatmap
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-[#F5C542] text-black rounded-full shadow-sm">Live Alpha-Net</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">Real-time arbitrage & inflation tracking across territories</p>
        </div>
        <div className="text-right">
          <div className="text-xs font-mono text-gray-400">SYNC: {new Date().toLocaleTimeString()}</div>
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] font-medium text-green-600">SENTINEL ACTIVE</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {regions.map((region) => (
          <div key={region.id} className="relative group">
            <div 
              onClick={() => setSelectedRegion(selectedRegion === region.id ? null : region.id)}
              className={`p-4 rounded-xl border flex flex-col justify-between min-h-[120px] transition-all duration-300 hover:scale-[1.02] cursor-pointer ${getStatusColor(region)}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg leading-tight">{region.name}</h3>
                  <div className="text-[10px] font-medium opacity-60 uppercase tracking-wider mt-0.5">{region.id} NODE</div>
                </div>
                {region.competitorStock === 'Out of Stock' && (
                  <span className="text-lg">⚡</span>
                )}
              </div>
              
              <div className="space-y-2 mt-3">
                <div className="flex justify-between items-end p-2 bg-black/5 rounded-lg">
                  <span className="text-[10px] font-semibold uppercase opacity-70">Margin</span>
                  <span className="font-mono font-bold text-sm">{region.profitMargin}%</span>
                </div>
                
                <div className="flex items-center gap-2">
                   <div className={`h-1.5 flex-1 rounded-full overflow-hidden bg-gray-200`}>
                      <div 
                        className={`h-full rounded-full ${region.inflationRate > 10 ? 'bg-red-500' : 'bg-green-500'}`} 
                        style={{ width: `${Math.min(region.inflationRate * 5, 100)}%` }}
                      ></div>
                   </div>
                   <span className="text-[10px] font-mono opacity-70">{region.inflationRate}% CPI</span>
                </div>
              </div>

              {/* Click hint */}
              <div className="mt-2 text-[9px] text-center opacity-0 group-hover:opacity-100 transition-opacity">
                Click to view Supply Chain
              </div>
            </div>

            {/* Expanded Passport View */}
            {selectedRegion === region.id && region.passport && (
              <div className="absolute top-full left-0 right-0 z-20 mt-2 animate-fadeInUp">
                <SupplyChainPassport 
                  origin={region.passport.origin}
                  farmerId={region.passport.farmerId}
                  fairTradeStatus={region.passport.fairTradeStatus}
                  ethicalScore={region.passport.ethicalScore}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketHeatmap;
