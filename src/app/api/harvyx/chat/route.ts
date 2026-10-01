import { NextResponse } from 'next/server';
import { mian } from '@/lib/harvyx/bot/mian';
import {
  extractSearchQuery,
  formatRealBuyerReply,
  isBuyerSearchIntent,
  searchAllDataBanks,
  toBuyerSearchAction,
} from '@/lib/harvyx/leadSearch';
import { addOutreachItem } from '@/lib/harvyx/outreachStore';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const history = Array.isArray(messages) ? messages : [];
    const lastUser = [...history].reverse().find((m: any) => m?.role === 'user');
    const userText = String(lastUser?.content || '').trim();

    // ── MIAN handles prospecting (find+enrich+draft+send) before buyer search ──
    const isProspecting = /\b(prospect|find.{0,20}leads?|find.{0,20}buyers?|run.{0,20}prosp|start.{0,20}campaign|outreach.{0,20}job|draft.{0,20}email|personalised|personalized)\b/i.test(userText);

    // ── Fast path: buyer search (data-only, no AI needed) ──────────────────
    if (userText && !isProspecting && isBuyerSearchIntent(userText)) {
      const query = extractSearchQuery(userText);
      const data = await searchAllDataBanks(query, { includeLive: true });
      const reply = formatRealBuyerReply(query, data.bank, data.library, data.live);
      const action = toBuyerSearchAction(query, data.bank, data.library, data.live);

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
        /* best-effort */
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

    // ── MIAN: handle all other intents (prospecting, tools, AI fallback) ───
    const origin = new URL(req.url).origin;
    const apiKey = process.env.HARVYX_API_KEY || '';

    const result = await mian(history, origin, apiKey);

    return NextResponse.json(result);
  } catch (e: unknown) {
    return NextResponse.json(
      {
        reply: `Network error: ${String(e)}`,
        error: String(e),
        dataSource: 'error',
      },
      { status: 200 },
    );
  }
}
