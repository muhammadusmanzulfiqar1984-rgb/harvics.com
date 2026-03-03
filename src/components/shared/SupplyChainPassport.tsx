import React from 'react';

interface SupplyChainPassportProps {
  origin: string;
  farmerId: string;
  fairTradeStatus: string;
  ethicalScore: number;
  carbonFootprint?: string;
}

export default function SupplyChainPassport({
  origin,
  farmerId,
  fairTradeStatus,
  ethicalScore,
  carbonFootprint = '0.4kg CO2e'
}: SupplyChainPassportProps) {
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 80) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
          <span>🌿</span> Supply Chain Passport
        </h3>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getScoreColor(ethicalScore)}`}>
          ETHICAL SCORE: {ethicalScore}/100
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg">
            🧑‍🌾
          </div>
          <div>
            <div className="text-xs text-gray-500">Origin & Producer</div>
            <div className="text-sm font-semibold text-gray-900">{origin}</div>
            <div className="text-xs text-gray-400 font-mono">ID: {farmerId}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-gray-50 rounded border border-gray-100">
            <div className="text-[10px] text-gray-500 uppercase">Certification</div>
            <div className="text-xs font-medium text-gray-800 flex items-center gap-1">
              {fairTradeStatus === 'Certified' ? '✅' : '🤝'} {fairTradeStatus}
            </div>
          </div>
          <div className="p-2 bg-gray-50 rounded border border-gray-100">
            <div className="text-[10px] text-gray-500 uppercase">Carbon Footprint</div>
            <div className="text-xs font-medium text-gray-800 flex items-center gap-1">
              👣 {carbonFootprint}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
