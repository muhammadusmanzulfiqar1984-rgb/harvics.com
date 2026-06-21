import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, User, Loader2 } from 'lucide-react';
// Cloudflare Workers AI — no external API key required
import { useTranslation } from 'react-i18next';

interface ChatBotProps {
  contextData?: {
    shipments: any[];
    hsData: any[];
    settlements: any[];
    searchQuery: string;
  };
}

const ChatBot: React.FC<ChatBotProps> = ({ contextData }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string, sources?: { title: string, uri: string }[] }[]>([
    { role: 'bot', text: t('chatbot_welcome') }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const systemInstruction = `You are Harvics AI, a specialized logistics and customs intelligence assistant for the UK-GCC corridor. You help users with HS classifications, trade finance, shipment tracking, and regional compliance. Be professional, concise, and technical.

Current Dashboard Context:
Search Query: "${contextData?.searchQuery || 'None'}"
Shipments: ${JSON.stringify(contextData?.shipments?.slice(0, 5) || [])}
HS Codes: ${JSON.stringify(contextData?.hsData?.slice(0, 5) || [])}`;

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: systemInstruction,
          messages: [{ role: 'user', content: userMessage }],
        }),
      });

      const botResponse = res.ok ? ((await res.json() as { response?: string }).response ?? ruleBasedReply(userMessage)) : ruleBasedReply(userMessage);

      setMessages(prev => [...prev, { role: 'bot', text: botResponse, sources: [] }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: ruleBasedReply(userMessage) }]);
    } finally {
      setIsLoading(false);
    }
  };

  function ruleBasedReply(msg: string): string {
    const m = msg.toLowerCase();
    if (m.includes('hs') || m.includes('classification') || m.includes('tariff')) return 'Use the HS Code Lookup tab to search classifications. Enter the product description or 6-digit code for full duty rates and compliance notes.';
    if (m.includes('ship') || m.includes('track') || m.includes('status')) return 'Live shipment tracking is on the Shipments tab. Filter by origin, destination, or carrier for current status.';
    if (m.includes('duty') || m.includes('vat') || m.includes('tax')) return 'The UK-GCC corridor typically carries 0-5% import duty depending on HS code. UAE has 5% VAT, KSA 15% VAT. Use the Duty Calculator for exact figures.';
    if (m.includes('document') || m.includes('invoice') || m.includes('certificate')) return 'Required docs for UK-GCC: Commercial Invoice, Packing List, Certificate of Origin (Form A or EUR.1), and Bill of Lading/Airway Bill.';
    if (m.includes('hello') || m.includes('hi')) return 'Hello! I\'m Harvics AI. I can help with HS codes, shipment tracking, duty calculations, and UK-GCC trade compliance.';
    return 'I can assist with HS code lookups, shipment tracking, duty calculations, and trade documentation for the UK-GCC corridor. What do you need?';
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] sm:w-96 h-[450px] sm:h-[500px] glass-card rounded-2xl shadow-2xl border-harvics-gold/30 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 maroon-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-harvics-gold" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white">{t('chatbot_name')}</span>
                  <span className="text-[8px] text-emerald-400 uppercase tracking-tighter">{t('chatbot_status')}</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-white/5">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-[11px] leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-harvics-maroon text-white rounded-tr-none' 
                      : 'bg-white/10 text-harvics-maroon border border-harvics-maroon/5 rounded-tl-none font-medium'
                  }`}>
                    {msg.text}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-harvics-maroon/5 flex flex-col gap-1">
                        <span className="text-[8px] uppercase font-bold opacity-40">Sources:</span>
                        {msg.sources.map((source, idx) => (
                          <a 
                            key={idx} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[8px] text-blue-600 hover:underline truncate flex items-center gap-1"
                          >
                            <span className="w-1 h-1 bg-blue-600 rounded-full" />
                            {source.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin text-harvics-maroon" />
                    <span className="text-[10px] text-harvics-maroon/60 italic">{t('chatbot_thinking')}</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-harvics-maroon/5 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('chatbot_placeholder')}
                className="flex-1 bg-harvics-maroon/5 border border-harvics-maroon/10 rounded-xl px-4 py-2 text-[11px] focus:outline-none focus:border-harvics-maroon/30"
              />
              <button 
                type="submit" 
                disabled={isLoading}
                className="p-2 bg-harvics-maroon text-white rounded-xl hover:bg-harvics-maroon/90 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-harvics-maroon text-white shadow-2xl flex items-center justify-center border-2 border-harvics-gold/50 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-harvics-gold/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        <MessageSquare className="w-6 h-6 relative z-10" />
      </motion.button>
    </div>
  );
};

export default ChatBot;
