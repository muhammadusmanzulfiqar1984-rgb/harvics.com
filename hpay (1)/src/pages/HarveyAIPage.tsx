import React, { useState, useEffect } from 'react';
import { useHPay } from '../context/HPayContext';
import { askHarvey } from '../services/hpayApi';
import { Sparkles, Send, Bot, User, RefreshCw, Zap } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'harvey';
  text: string;
  timestamp: string;
}

export const HarveyAIPage: React.FC = () => {
  const { profile, balances, transactions, ledgerReady } = useHPay();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ledgerReady && balances.USD === 0 && transactions.length === 0) return;
    setMessages((prev) => {
      if (prev.length > 1) return prev;
      const usd = balances.USD.toLocaleString('en-US', { minimumFractionDigits: 2 });
      return [
        {
          id: '1',
          sender: 'harvey',
          text: `Hello ${profile.name.split(' ')[0] || 'there'}. I am **Harvey**. Live ledger USD **$${usd}** across **${transactions.length}** transactions. How may I assist?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ];
    });
  }, [ledgerReady, balances.USD, transactions.length, profile.name]);

  const presets = [
    'Summarize my cash flow for this month',
    'What is my pending escrow status?',
    'How can I optimize supplier payment terms?',
    'Give me a breakdown of transaction fees',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const data = await askHarvey(query, {
        user: profile.name,
        hpayId: profile.hpayId,
        balances,
        recentTxCount: transactions.length,
        recentTransactions: transactions.slice(0, 8).map((t) => ({
          amount: t.amount,
          currency: t.currency,
          direction: t.direction,
          counterparty: t.merchantOrPerson,
          reference: t.reference,
        })),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'harvey',
          text: data.reply || data.text || 'No reply from local Harvey.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      const usd = balances.USD.toLocaleString('en-US', { minimumFractionDigits: 2 });
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'harvey',
          text: `Local Harvey only (no cloud AI). Could not reach /api/harvey: ${err instanceof Error ? err.message : 'error'}. Ledger USD **$${usd}**.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-cyan-400" /> Harvey AI
        </h1>
        <p className="text-xs md:text-sm text-gray-400 mt-1">
          Live ledger context · ${balances.USD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD ·{' '}
          {transactions.length} txs
        </p>
      </div>

      <div className="rounded-3xl bg-[#10141D] border border-[#202738] flex flex-col min-h-[480px]">
        <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[520px]">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.sender === 'harvey' && (
                <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#800020] text-[#E8DCC4]'
                    : 'bg-[#141A26] border border-[#232B3E] text-gray-200'
                }`}
              >
                <div dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                <div className="text-[10px] text-gray-500 mt-2">{m.timestamp}</div>
              </div>
              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#2B141B] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[#E8DCC4]" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Harvey is reading the ledger…
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#1E2536] space-y-3">
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => void handleSendMessage(p)}
                className="text-[10px] px-2.5 py-1.5 rounded-lg bg-[#141A26] border border-[#232B3E] text-gray-300 hover:border-cyan-700"
              >
                <Zap className="w-3 h-3 inline mr-1 text-cyan-400" />
                {p}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSendMessage();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Harvey about live balances / activity…"
              className="flex-1 bg-[#141A26] border border-[#232B3E] rounded-xl px-4 py-3 text-sm text-white"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-bold disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
