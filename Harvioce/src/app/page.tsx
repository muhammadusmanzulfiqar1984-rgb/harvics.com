'use client';

import { useChat } from 'ai/react';
import { useHarvyStore } from '@/store/useHarvyStore';

export default function HarvyCommandCenter() {
  const { setActiveLead, setOutreachDraft } = useHarvyStore();

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    onToolCall({ toolCall }) {
      // Intercept tool calls from Groq and update the Zustand store
      if (toolCall.toolName === 'fetchLead') {
        setActiveLead(toolCall.args);
      }
      if (toolCall.toolName === 'draftMessage') {
        setOutreachDraft(toolCall.args as any);
      }
    },
  });

  return (
    <div className="flex h-screen bg-[#1a0003] text-white">

      {/* LEFT PANEL: Data Intelligence */}
      <div className="w-1/4 border-r border-[#C3A35E]/30 p-4">
        <DataIntelligencePanel />
      </div>

      {/* CENTER PANEL: Harvoice */}
      <div className="w-2/4 flex flex-col border-r border-[#C3A35E]/30 p-4">
        <div className="flex-1 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="flex flex-col">
              <strong className="text-[#C3A35E]">{m.role === 'user' ? 'You' : 'Harvoice'}</strong>

              {/* Standard Text Response */}
              {m.content && <div className="text-white mt-1">{m.content}</div>}

              {/* Generative UI: Show what the Agent is doing */}
              {m.toolInvocations?.map((toolInv: any) => {
                if (toolInv.toolName === 'fetchLead') {
                  return (
                    <div
                      key={toolInv.toolCallId}
                      className="mt-2 bg-[#C3A35E]/10 border border-[#C3A35E]/30 text-[#C3A35E] p-2 rounded text-sm"
                    >
                      ⚡ Fetching enriched data for <strong>{toolInv.args.name}</strong>... updating Left Panel.
                    </div>
                  );
                }
                if (toolInv.toolName === 'draftMessage') {
                  return (
                    <div
                      key={toolInv.toolCallId}
                      className="mt-2 bg-blue-900/20 border border-blue-500/30 text-blue-400 p-2 rounded text-sm"
                    >
                      📝 Drafted {toolInv.args.channel} message for <strong>{toolInv.args.target}</strong>. Sent to Execution Queue.
                    </div>
                  );
                }
                return null;
              })}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Message Harvoice..."
            className="w-full p-4 rounded bg-[#111111] border border-[#C3A35E]/50 text-white focus:outline-none focus:border-[#C3A35E]"
          />
        </form>
      </div>

      {/* RIGHT PANEL: Outreach Console */}
      <div className="w-1/4 p-4">
        <OutreachConsolePanel />
      </div>

    </div>
  );
}

function DataIntelligencePanel() {
  const activeLead = useHarvyStore((state) => state.activeLead);

  if (!activeLead) return <div className="text-gray-500">No lead selected yet.</div>;

  return (
    <div>
      <h3 className="text-xl font-bold">{activeLead.name}</h3>
      <div className="text-[#C3A35E]">Score: {activeLead.score}</div>
      <div className="mt-4">
        <button disabled={!activeLead.whatsapp} className="bg-green-600 p-2 m-1">WhatsApp</button>
        <button disabled={!activeLead.email} className="bg-blue-600 p-2 m-1">Email</button>
      </div>
    </div>
  );
}

function OutreachConsolePanel() {
  const draft = useHarvyStore((state) => state.outreachDraft);

  if (!draft) return <div className="text-gray-500">No drafts yet.</div>;

  return (
    <div>
      <div className="text-sm text-gray-400 uppercase">Draft: {draft.channel}</div>
      <textarea
        className="w-full h-32 mt-2 p-2 bg-black text-white border border-gray-600"
        defaultValue={draft.content}
      />
      <button className="w-full mt-4 bg-[#C3A35E] text-black font-bold p-2">
        APPROVE &amp; SEND
      </button>
    </div>
  );
}
