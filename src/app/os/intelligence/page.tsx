'use client';

import React, { useEffect, useState } from 'react';

// Types matching the backend response
interface MarketAttackEntry {
  territory: string;
  sku: string;
  strategy: string;
  targetPrice: number;
  margin: string;
  alert: string;
}

interface AttackPlanResponse {
  timestamp: string;
  status: string;
  plan: MarketAttackEntry[];
}

export default function WarRoomDashboard() {
  const [data, setData] = useState<AttackPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // In a real app, this would fetch from the backend API
  // For demo purposes, we can simulate the fetch if the backend isn't running
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try fetching from local backend if running
        const res = await fetch('http://localhost:4000/api/intelligence/attack-plan');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          throw new Error('Backend not reachable');
        }
      } catch (e) {
        console.warn('Backend offline, loading simulation...');
        // Simulation Fallback
        setData({
          timestamp: new Date().toISOString(),
          status: 'simulated',
          plan: [
            { territory: 'US', sku: 'Harvics Honey Glaze Selection', strategy: 'AGGRESSIVE_ARBITRAGE', targetPrice: 5.25, margin: '65%', alert: '🔥 HEAT WAVE: LOGISTICS PREMIUM APPLIED' },
            { territory: 'PK', sku: 'Harvics Fire Chili Snap', strategy: 'AGGRESSIVE_ARBITRAGE', targetPrice: 0.82, margin: '53%', alert: '🔥 HEAT WAVE: LOGISTICS PREMIUM APPLIED' },
            { territory: 'AE', sku: 'Harvics Honey Glaze Selection', strategy: 'AGGRESSIVE_ARBITRAGE', targetPrice: 5.57, margin: '65%', alert: '🔥 HEAT WAVE: LOGISTICS PREMIUM APPLIED' },
            { territory: 'GB', sku: 'Harvics Honey Glaze Selection', strategy: 'AGGRESSIVE_ARBITRAGE', targetPrice: 6.21, margin: '65%', alert: '🔥 HEAT WAVE: LOGISTICS PREMIUM APPLIED' },
            { territory: 'CN', sku: 'Harvics Standard Snap', strategy: 'AGGRESSIVE_ARBITRAGE', targetPrice: 0.84, margin: '57.4%', alert: '🔥 HEAT WAVE: LOGISTICS PREMIUM APPLIED' },
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="mb-12 border-b border-green-900 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter text-white mb-2">
              HARVICS <span className="text-green-500">ALPHA</span>
            </h1>
            <p className="text-sm text-gray-500">GLOBAL INTELLIGENCE WAR ROOM</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">SYSTEM STATUS</div>
            <div className="text-xl font-bold animate-pulse">
              {loading ? 'INITIALIZING...' : 'ONLINE'}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {data?.timestamp}
            </div>
          </div>
        </header>

        {/* Main Grid */}
        {loading ? (
          <div className="text-center py-20 text-2xl animate-pulse">
            ESTABLISHING SECURE CONNECTION TO INTELLIGENCE NODES...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* KPI Cards */}
            <div className="bg-gray-900 border border-green-900 p-6 rounded-lg col-span-full lg:col-span-3 flex justify-around">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">TARGET TERRITORIES</div>
                <div className="text-3xl font-bold text-white">{data?.plan.length}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">AVG YIELD</div>
                <div className="text-3xl font-bold text-green-400">61.2%</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">ACTIVE ALERTS</div>
                <div className="text-3xl font-bold text-red-500 animate-pulse">5</div>
              </div>
            </div>

            {/* Attack Plan Entries */}
            {data?.plan.map((entry) => (
              <div key={entry.territory} className="bg-gray-900 border border-gray-800 hover:border-green-500 transition-colors duration-300 p-6 rounded-lg relative overflow-hidden group">
                
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-white group-hover:opacity-20 transition-opacity">
                  {entry.territory}
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded border border-green-900">
                      {entry.territory} NODE
                    </span>
                    <span className="text-white font-bold text-lg">
                      {entry.margin}
                    </span>
                  </div>

                  <h3 className="text-white text-xl font-bold mb-1 truncate" title={entry.sku}>
                    {entry.sku}
                  </h3>
                  <div className="text-gray-400 text-sm mb-4">
                    Target: <span className="text-white">${entry.targetPrice.toFixed(2)}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">STRATEGY</span>
                      <span className="text-green-300 font-bold">{entry.strategy}</span>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <div className="text-xs text-red-400 font-bold flex items-center gap-2">
                        {entry.alert.includes('HEAT') ? '🔥' : '⚠️'}
                        {entry.alert}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}
