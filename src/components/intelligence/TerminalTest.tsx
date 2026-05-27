'use client';
import React, { useState } from 'react';

export default function TerminalTest() {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const pingGateway = async () => {
    setLoading(true);
    setOutput('');
    try {
      const res = await fetch('/api/grok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Run a brief system diagnostic check. Keep it under 20 words.' }]
        })
      });
      
      if (!res.body) {
        setOutput('Error: No stream detected.');
        setLoading(false);
        return;
      }
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Decode the raw chunk
        const chunkStr = decoder.decode(value, { stream: true });
        
        // Split by lines to handle multiple SSE messages in one chunk
        const lines = chunkStr.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              // Extract the JSON payload
              const data = JSON.parse(line.slice(6));
              const content = data.choices[0]?.delta?.content;
              if (content) {
                // Append only the readable text token
                setOutput(prev => prev + content);
              }
            } catch (e) {
              // Silently ignore incomplete JSON chunks
            }
          }
        }
      }
    } catch (error) {
      setOutput('Gateway connection failed.');
    }
    setLoading(false);
  };

  return (
    <div className="w-full bg-[#110303] text-harvics-cream p-8 border border-harvics-gold/10">
      <div className="flex items-center justify-between mb-6 border-b border-harvics-gold/10 pb-4">
        <span className="text-harvics-gold text-[10px] tracking-widest uppercase font-bold">
          GROK SECURE GATEWAY // LIVE TERMINAL
        </span>
        <button 
          onClick={pingGateway} 
          disabled={loading} 
          className="border border-harvics-gold/20 px-4 py-2 text-[10px] tracking-widest uppercase hover:bg-harvics-gold/10 transition-colors cursor-pointer"
        >
          {loading ? 'STREAMING...' : 'INITIALIZE PING'}
        </button>
      </div>
      <div className="font-mono text-[11px] text-harvics-cream/80 leading-relaxed whitespace-pre-wrap min-h-[120px]">
        {output || '>> Awaiting manual gateway initialization...'}
      </div>
    </div>
  );
}
