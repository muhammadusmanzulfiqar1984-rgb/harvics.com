import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

const Chatbot = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsProcessing(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'ai' ? 'assistant' as const : 'user' as const,
        content: m.text,
      }));
      const r = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || `Request failed (${r.status})`);
      }
      const { text } = await r.json();
      setMessages(prev => [...prev, { role: 'ai', text: text || "I'm sorry, I couldn't process that." }]);
    } catch (err: any) {
      console.error('Chatbot failed', err);
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${err.message || 'Failed to connect to AI'}.` }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] border border-brand-gold/20 rounded-[2rem] bg-white/30 backdrop-blur-sm overflow-hidden shadow-inner">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-16 h-16 bg-brand-maroon/10 rounded-full flex items-center justify-center text-brand-maroon">
              <Bot size={32} />
            </div>
            <h4 className="font-serif text-xl font-medium text-brand-maroon">How can I assist you today?</h4>
            <p className="text-xs text-brand-gold font-medium uppercase tracking-widest leading-relaxed max-w-[200px]">
              Ask me about VAT rates, compliance, or your expenses.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={cn(
            "flex",
            msg.role === 'user' ? 'justify-end' : 'justify-start'
          )}>
            <div className={cn(
              "max-w-[85%] p-5 rounded-[2rem] text-sm font-medium leading-relaxed shadow-sm",
              msg.role === 'ai' 
                ? "bg-white/80 border border-brand-gold/10 self-start rounded-tl-none text-brand-maroon" 
                : "bg-brand-maroon text-white self-end ml-auto rounded-tr-none shadow-lg shadow-brand-maroon/10"
            )}>
              <div className="prose-maroon text-inherit text-xs leading-relaxed">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white/80 border border-brand-gold/10 p-4 rounded-[2rem] rounded-tl-none flex gap-2">
              <div className="w-2 h-2 bg-brand-gold rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-brand-gold rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-brand-gold rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white/50 border-t border-brand-gold/10 flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm font-medium placeholder:text-brand-gold/50"
        />
        <Button 
          onClick={handleSend} 
          className="w-10 h-10 p-0 rounded-xl flex items-center justify-center shrink-0"
          disabled={isProcessing}
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
};

export default Chatbot;
