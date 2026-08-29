import React, { useState } from 'react';
import { useHPay } from '../context/HPayContext';
import { Code, Copy, Key, RefreshCw, Send, Terminal, CheckCircle2, ShieldAlert } from 'lucide-react';

export const DeveloperPage: React.FC = () => {
  const { addToast } = useHPay();
  const [isTestMode, setIsTestMode] = useState(true);

  const [endpoint, setEndpoint] = useState('/v1/payments/create');
  const [requestBody, setRequestBody] = useState(
    JSON.stringify(
      {
        recipient: '@abc-trading',
        amount: 500.0,
        currency: 'USD',
        idempotency_key: 'ik_882910482'
      },
      null,
      2
    )
  );

  const [apiResponse, setApiResponse] = useState<string | null>(null);

  const handleTestApi = () => {
    setApiResponse(
      JSON.stringify(
        {
          id: 'HP-' + Math.floor(100000 + Math.random() * 900000),
          status: 'SETTLED',
          amount: 500.0,
          currency: 'USD',
          fee: 0.0,
          rail: 'HPay FastRail Engine',
          timestamp: new Date().toISOString()
        },
        null,
        2
      )
    );
    addToast('API Sandbox Executed', '200 OK Response returned');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Code className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Developer Portal & API Sandbox</h1>
          </div>
          <p className="text-xs md:text-sm text-gray-400 mt-1">REST API, Webhooks, and SDKs for Harvics commerce developers</p>
        </div>

        {/* Test Mode Toggle */}
        <div className="flex items-center gap-3 p-2 bg-[#10141D] rounded-2xl border border-[#202738]">
          <span className="text-xs font-bold text-gray-300">Environment Mode:</span>
          <button
            onClick={() => {
              setIsTestMode(!isTestMode);
              addToast('Environment Toggled', `Switched to ${!isTestMode ? 'Test Sandbox' : 'Live Production'}`);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              isTestMode ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20' : 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
            }`}
          >
            {isTestMode ? 'TEST SANDBOX' : 'LIVE PRODUCTION'}
          </button>
        </div>
      </div>

      {/* API Keys Box */}
      <div className="rounded-3xl bg-[#10141D] border border-[#202738] p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-cyan-400" /> API Access Credentials
        </h2>

        <div className="space-y-3 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-[#141A26] border border-[#222B3D] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-400 block uppercase">Test Key</span>
              <span className="font-bold text-white">hp_test_882910482910428</span>
            </div>
            <button
              onClick={() => addToast('Key Copied', 'Copied hp_test_882910482910428')}
              className="p-2 rounded bg-[#1C2436] text-gray-300 hover:text-white"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#141A26] border border-[#222B3D] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 block uppercase">Live Secret Key</span>
              <span className="font-bold text-gray-400">hp_live_••••••••••••••••••••</span>
            </div>
            <button
              onClick={() => addToast('Key Copied', 'Copied Live Secret Key')}
              className="p-2 rounded bg-[#1C2436] text-gray-300 hover:text-white"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive API Sandbox */}
      <div className="rounded-3xl bg-[#10141D] border border-[#202738] p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2536]">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" /> Interactive REST API Sandbox
          </h2>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800">
            HTTPS POST
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Endpoint & Request Payload */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">API Endpoint</label>
              <select
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="w-full bg-[#141A26] border border-[#232B3E] text-white px-3 py-2.5 rounded-xl text-xs font-mono font-bold"
              >
                <option value="/v1/payments/create">POST /v1/payments/create</option>
                <option value="/v1/escrow/release">POST /v1/escrow/release</option>
                <option value="/v1/ledger/balance">GET /v1/ledger/balance</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">Request Payload (JSON)</label>
              <textarea
                rows={7}
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="w-full bg-[#0B0E14] border border-[#232B3E] text-cyan-300 font-mono text-xs p-4 rounded-xl focus:outline-none"
              />
            </div>

            <button
              onClick={handleTestApi}
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20"
            >
              Send Sandbox API Request
            </button>
          </div>

          {/* Response Payload */}
          <div>
            <label className="text-xs font-bold text-gray-400 block mb-1">API Response Output</label>
            <div className="min-h-[260px] bg-[#0B0E14] border border-[#232B3E] rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
              {apiResponse ? (
                <pre>{apiResponse}</pre>
              ) : (
                <span className="text-gray-600">// Click "Send Sandbox API Request" to execute</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
