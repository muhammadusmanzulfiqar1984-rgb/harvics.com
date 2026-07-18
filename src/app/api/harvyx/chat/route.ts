import { NextResponse } from 'next/server';
import {
  extractSearchQuery,
  formatRealBuyerReply,
  isBuyerSearchIntent,
  searchAllDataBanks,
  toBuyerSearchAction,
} from '@/lib/harvyx/leadSearch';
import { addOutreachItem } from '@/lib/harvyx/outreachStore';
import { callOpenAI, callNvidia, OPENAI_CHAT_MODEL, NVIDIA_CHAT_MODEL } from '@/lib/openai';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are HarvyX — the Sovereign Growth OS for Harvics Global, a denim textile trade company.
You help with outreach strategy, email drafts, pipeline advice, and trade show planning.

CRITICAL RULES:
- NEVER invent company names, people, phone numbers, emails, or addresses.
- NEVER pretend you searched a database. You do NOT have buyer lists unless provided in the message context.
- If the user asks to find buyers and no real data is attached, tell them to use the Data Bank search or Discover tab in HarvyX.
- When real search results ARE provided in context, summarize ONLY those records — do not add extras.
- Keep responses concise and actionable.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const history = Array.isArray(messages) ? messages : [];
    const lastUser = [...history].reverse().find((m: any) => m?.role === 'user');
    const userText = String(lastUser?.content || '').trim();

    if (userText && isBuyerSearchIntent(userText)) {
      const query = extractSearchQuery(userText);
      const data = await searchAllDataBanks(query, { includeLive: true });
      const reply = formatRealBuyerReply(query, data.bank, data.library, data.live);
      const action = toBuyerSearchAction(query, data.bank, data.library, data.live);

      // Create a pending-approval card summarizing REAL pipeline matches from D1.
      const pipelineCount = data.bank.total;
      try {
        addOutreachItem({
          id: `buyer_${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: 'draft',
          type: 'buyer_search',
          channel: 'research',
          target: query,
          message: `Buyer search "${query}". Found ${pipelineCount} pipeline lead(s) across ${data.bank.distinctSources} import source(s), ${data.live.length} live match(es), ${data.library.length} catalog match(es).`,
          results: action.results.slice(0, 25),
          pipelineCount,
        });
      } catch {
        /* outreach card is best-effort */
      }

      return NextResponse.json({
        reply,
        action,
        dataSource: 'real',
        bankTotal: data.bank.total,
        pipelineCount,
        distinctSources: data.bank.distinctSources,
        sourceGroups: action.sourceGroups,
        libraryCount: data.library.length,
        liveCount: data.live.length,
        latencyMs: 0,
      });
    }

    const start = Date.now();
    const chatMessages = [{ role: 'system' as const, content: SYSTEM_PROMPT }, ...history];

    // 1. Groq — primary (fastest, free, reliable)
    if (GROQ_API_KEY) {
      const modelsToTry = [GROQ_MODEL, 'llama-3.1-8b-instant', 'llama3-70b-8192'].filter(
        (m, i, arr) => m && arr.indexOf(m) === i,
      );
      for (const model of modelsToTry) {
        const res = await fetch(GROQ_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
          body: JSON.stringify({ model, messages: chatMessages, max_tokens: 512, temperature: 0.4 }),
        });
        if (res.ok) {
          const data = await res.json();
          const reply = data.choices?.[0]?.message?.content || '(no reply)';
          return NextResponse.json({ reply, model, dataSource: 'ai', latencyMs: Date.now() - start });
        }
        const err = await res.text().catch(() => `HTTP ${res.status}`);
        if (!/model|not found|decommission|does not exist/i.test(err)) break;
      }
    }

    // 2. OpenAI fallback
    const openAIReply = await callOpenAI(chatMessages, { temperature: 0.4, maxTokens: 512 });
    if (openAIReply) {
      return NextResponse.json({ reply: openAIReply, model: OPENAI_CHAT_MODEL, dataSource: 'ai', latencyMs: Date.now() - start });
    }

    // 3. NVIDIA fallback
    const nvidiaReply = await callNvidia(chatMessages, { temperature: 0.4, maxTokens: 512 });
    if (nvidiaReply) {
      return NextResponse.json({ reply: nvidiaReply, model: NVIDIA_CHAT_MODEL, dataSource: 'ai', latencyMs: Date.now() - start });
    }

    return NextResponse.json(
      { reply: 'AI chat is not configured — no provider available.', error: 'no_provider', dataSource: 'error' },
      { status: 200 },
    );
  } catch (e: unknown) {
    return NextResponse.json(
      {
        reply: `Network error reaching the AI provider: ${String(e)}`,
        error: String(e),
        dataSource: 'error',
      },
      { status: 200 },
    );
  }
}
