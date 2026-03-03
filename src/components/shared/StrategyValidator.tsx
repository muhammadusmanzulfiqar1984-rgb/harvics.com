'use client';

import React, { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface MarketAttackProposal {
  territory: string;
  sku: string;
  strategy: string;
  targetPrice: number;
  margin: string;
  confidenceScore: number;
  passport?: {
    ethicalScore: number;
  };
  loyaltyOffer?: {
    discountType: string;
    discountValue: string;
    reasoning: string;
  };
  timestamp: string;
}

const StrategyValidator: React.FC = () => {
  const [proposal, setProposal] = useState<MarketAttackProposal | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<'listening' | 'reviewing' | 'approved' | 'rejected'>('listening');

  useEffect(() => {
    // Connect to Harvics Orchestrator (Backend)
    const newSocket = io('http://localhost:4000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to Harvics Orchestrator');
    });

    newSocket.on('market-attack-proposal', (data: MarketAttackProposal) => {
      console.log('New Proposal Received:', data);
      setProposal(data);
      setStatus('reviewing');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleDecision = (decision: 'approved' | 'rejected') => {
    setStatus(decision);
    setTimeout(() => {
      setProposal(null);
      setStatus('listening');
    }, 3000); // Clear after 3 seconds
  };

  if (!proposal && status === 'listening') {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 animate-pulse flex items-center justify-center gap-3">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
        <span className="text-sm font-medium text-gray-500">Orchestrator Listening for Market Signals...</span>
      </div>
    );
  }

  if (!proposal) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-fadeInUp">
      {/* Header */}
      <div className="bg-gray-900 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F5C542] to-[#D4A832] flex items-center justify-center text-lg shadow-sm">
            ⚡
          </div>
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">Strategy Validator</h3>
            <p className="text-gray-400 text-xs">AI Proposed Market Attack</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-white/10 rounded text-xs text-white font-mono">
          CONFIDENCE: {proposal.confidenceScore}%
        </div>
      </div>

      {/* Content */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: The Attack Plan */}
        <div className="space-y-4">
          <div>
            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Target Vector</div>
            <div className="text-2xl font-bold text-gray-900">{proposal.territory} <span className="text-gray-400">/</span> {proposal.sku}</div>
          </div>
          
          <div className="flex gap-4">
            <div className="p-3 bg-gray-50 rounded border border-gray-100 flex-1">
              <div className="text-xs text-gray-500">Strategy</div>
              <div className="font-semibold text-gray-900">{proposal.strategy}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded border border-gray-100 flex-1">
              <div className="text-xs text-gray-500">Projected Yield</div>
              <div className="font-semibold text-green-600">{proposal.margin} Margin</div>
            </div>
          </div>

          {/* Ethical Audit Link */}
          {proposal.passport && (
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${proposal.passport.ethicalScore > 85 ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              <span className="text-gray-600">
                Ethical Audit Score: <strong>{proposal.passport.ethicalScore}/100</strong>
              </span>
              <a href="#" className="text-blue-600 hover:underline ml-1">View Audit Log</a>
            </div>
          )}
        </div>

        {/* Right: Loyalty Logic */}
        <div className="bg-[#F5C542]/5 border border-[#F5C542]/20 rounded-lg p-4">
          <div className="text-xs font-bold text-[#D4A832] uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>🎁</span> Adaptive Loyalty Engine
          </div>
          
          {proposal.loyaltyOffer ? (
            <div className="space-y-2">
              <div className="text-lg font-bold text-gray-900">{proposal.loyaltyOffer.discountValue}</div>
              <div className="text-sm font-medium text-gray-800">{proposal.loyaltyOffer.discountType}</div>
              <div className="text-xs text-gray-500 italic">"{proposal.loyaltyOffer.reasoning}"</div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">No specific loyalty trigger for this vector.</div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
        {status === 'reviewing' ? (
          <>
            <button 
              onClick={() => handleDecision('rejected')}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
            >
              Reject Proposal
            </button>
            <button 
              onClick={() => handleDecision('approved')}
              className="px-6 py-2 rounded-lg text-sm font-semibold text-black bg-[#F5C542] hover:bg-[#D4A832] shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <span>🚀</span> Authorize Attack
            </button>
          </>
        ) : (
          <div className={`text-sm font-bold flex items-center gap-2 ${status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
            {status === 'approved' ? '✅ AUTHORIZED' : '❌ REJECTED'}
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyValidator;
