/**
 * hx-harvey-nlp.ts — intent + entity extraction for Harvey
 * Module 2 — Groq classification (llama3-8b)
 */

import { HARVEY_INTENT_PROMPT } from '../prompts/harvey-intent';
import type {
  HxHarveyEntity,
  HxHarveyIntent,
} from '../../../packages/types/hx-harvey.types';
import { hxLogger } from '../../../packages/lib/hx-logger';

const MODULE = 'hx-harvey-nlp';
const GROQ_KEY = process.env.HX_GROQ_API_KEY ?? process.env.GROQ_API_KEY ?? '';
const GROQ_MODEL = process.env.HX_HARVEY_CLASSIFY_MODEL ?? 'llama3-8b-8192';
const FETCH_TIMEOUT = 15_000;

const INTENTS: HxHarveyIntent[] = [
  'prospect_search',
  'person_lookup',
  'pipeline_query',
  'outreach_action',
  'report_query',
  'data_export',
  'sequence_enroll',
  'unknown',
];

export interface HarveyNlpResult {
  intent: HxHarveyIntent;
  confidence: number;
  entities: HxHarveyEntity[];
  needs_confirmation: boolean;
  model_used: string;
}

function heuristicClassify(message: string): HarveyNlpResult {
  const m = message.toLowerCase();
  const entities: HxHarveyEntity[] = [];

  const GEO_MAP: Record<string, string> = {
    'germany': 'DE', 'german': 'DE', 'deutschland': 'DE',
    'uk': 'GB', 'united kingdom': 'GB', 'britain': 'GB', 'england': 'GB',
    'poland': 'PL', 'polish': 'PL',
    'czech': 'CZ', 'czechia': 'CZ', 'czech republic': 'CZ',
    'france': 'FR', 'french': 'FR',
    'spain': 'ES', 'spanish': 'ES',
    'italy': 'IT', 'italian': 'IT',
    'netherlands': 'NL', 'dutch': 'NL',
    'sweden': 'SE', 'swedish': 'SE',
    'norway': 'NO', 'norwegian': 'NO',
    'uae': 'AE', 'dubai': 'AE', 'emirates': 'AE',
    'russia': 'RU', 'russian': 'RU',
    'turkey': 'TR', 'turkish': 'TR',
    'india': 'IN', 'indian': 'IN',
    'vietnam': 'VN', 'vietnamese': 'VN',
    'pakistan': 'PK', 'bangladesh': 'BD',
  };

  let detectedCountry: string | null = null;
  for (const [name, code] of Object.entries(GEO_MAP)) {
    if (m.includes(name)) { detectedCountry = code; break; }
  }
  const countryMatch = detectedCountry
    ? [null, detectedCountry]
    : m.match(/\b(gb|uk|de|cz|pl|es|fr|it|nl|ae|us|se|no|tr|in|vn)\b/i);

  if (countryMatch?.[1]) {
    entities.push({
      type: 'country',
      value: countryMatch[1].toUpperCase() === 'UK'
        ? 'GB' : countryMatch[1].toUpperCase(),
      confidence: 0.85,
    });
  }

  const VERTICAL_MAP: Record<string, string> = {
    'textile': 'textile',
    'fabric': 'textile',
    'cloth': 'textile',
  };

  let detectedVertical: string | null = null;
  for (const [keyword, vertical] of Object.entries(VERTICAL_MAP)) {
    if (m.includes(keyword)) { detectedVertical = vertical; break; }
  }
  if (detectedVertical) {
    entities.push({
      type: 'vertical',
      value: detectedVertical,
      confidence: 0.85,
    });
  }

  let intent: HxHarveyIntent = 'unknown';
  if (/export|csv|download|vcf/i.test(m)) intent = 'data_export';
  else if (/enroll|sequence|nurture/i.test(m)) intent = 'sequence_enroll';
  else if (/send|outreach|email|whatsapp|linkedin/i.test(m)) intent = 'outreach_action';
  else if (/pipeline|deal|stage|crm/i.test(m)) intent = 'pipeline_query';
  else if (/report|summary|kpi|how many|count|verified/i.test(m)) intent = 'report_query';
  else if (/who is|find person|look up|email of/i.test(m)) intent = 'person_lookup';
  else if (/find|search|prospect|buyer|supplier|contact/i.test(m)) intent = 'prospect_search';

  const needs =
    intent === 'outreach_action' ||
    intent === 'data_export' ||
    intent === 'sequence_enroll';

  return {
    intent,
    confidence: intent === 'unknown' ? 0.4 : 0.62,
    entities,
    needs_confirmation: needs,
    model_used: 'heuristic',
  };
}

export async function classifyMessage(message: string): Promise<HarveyNlpResult> {
  if (!GROQ_KEY) {
    hxLogger.warn(MODULE, 'GROQ key missing — using heuristic classifier');
    return heuristicClassify(message);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0,
        max_tokens: 400,
        messages: [
          { role: 'system', content: HARVEY_INTENT_PROMPT },
          { role: 'user', content: message.slice(0, 4_000) },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Groq ${res.status}: ${body.slice(0, 200)}`);
    }

    const data = await res.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content?.trim() ?? '{}';
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(cleaned) as {
      intent?: string;
      confidence?: number;
      entities?: HxHarveyEntity[];
      needs_confirmation?: boolean;
    };

    const intent = INTENTS.includes(parsed.intent as HxHarveyIntent)
      ? (parsed.intent as HxHarveyIntent)
      : 'unknown';

    let confidence = Math.min(1, Math.max(0, Number(parsed.confidence) || 0.5));
    if (confidence < 0.55) {
      return {
        intent: 'unknown',
        confidence,
        entities: Array.isArray(parsed.entities) ? parsed.entities : [],
        needs_confirmation: false,
        model_used: GROQ_MODEL,
      };
    }

    const needs =
      Boolean(parsed.needs_confirmation) ||
      intent === 'outreach_action' ||
      intent === 'data_export' ||
      intent === 'sequence_enroll';

    return {
      intent,
      confidence,
      entities: Array.isArray(parsed.entities) ? parsed.entities : [],
      needs_confirmation: needs,
      model_used: GROQ_MODEL,
    };
  } catch (err) {
    hxLogger.error(MODULE, 'classify failed — falling back to heuristic', {
      err: err instanceof Error ? err.message : String(err),
    });
    return heuristicClassify(message);
  } finally {
    clearTimeout(timer);
  }
}
