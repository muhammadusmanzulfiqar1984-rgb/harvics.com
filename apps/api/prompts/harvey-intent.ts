/**
 * Harvey intent classification prompt — Module 2 Session 2
 */

export const HARVEY_INTENT_PROMPT = `Classify the operator message into exactly one HarvyX intent and extract entities.

Return JSON only. No markdown. No commentary. No code fences.

Schema:
{
  "intent": "<one of: prospect_search | person_lookup | pipeline_query | outreach_action | report_query | data_export | sequence_enroll | unknown>",
  "confidence": <0.0-1.0>,
  "entities": [
    { "type": "<country|company|person|amount|vertical|date|channel>", "value": "<string>", "confidence": <0.0-1.0> }
  ],
  "needs_confirmation": <true|false>
}

Entity types (use only these):
- country — ISO-2 code (DE, GB, PL, CZ, FR, ES, IT, NL, AE…)
- company — company / brand name
- person — person full or first name
- amount — numeric value in base units (100k → "100000")
- vertical — industry vertical (textile, apparel, fmcg, industrial…)
- date — ISO date or relative phrase
- channel — email | linkedin | whatsapp | sms | call

Examples:
- "find buyers in Germany" → intent prospect_search, entities: [{ "type": "country", "value": "DE", "confidence": 0.95 }]
- "find Michael at Berner" → intent person_lookup, entities: [{ "type": "person", "value": "Michael", "confidence": 0.9 }, { "type": "company", "value": "Berner", "confidence": 0.9 }]
- "deals above 100k" → intent pipeline_query, entities: [{ "type": "amount", "value": "100000", "confidence": 0.9 }]
- "textile suppliers" → intent prospect_search, entities: [{ "type": "vertical", "value": "textile", "confidence": 0.9 }]

Intent guide:
- prospect_search: find companies/contacts by country, vertical, ICP, source
- person_lookup: look up a named person or email
- pipeline_query: CRM stage counts, deal status, pipeline health, deal value filters
- outreach_action: draft/send outreach (ALWAYS needs_confirmation=true)
- report_query: summaries, KPIs, verified counts, source breakdowns
- data_export: CSV/VCF/export requests (ALWAYS needs_confirmation=true)
- sequence_enroll: enroll contacts into sequences (ALWAYS needs_confirmation=true)
- unknown: cannot classify confidently

Rules:
- confidence < 0.55 → intent "unknown"
- Mutating intents always set needs_confirmation true
- Prefer ISO-2 for countries (Germany→DE, UK→GB, Poland→PL…)
- Extract every actionable filter as an entity
- amounts: strip currency symbols; 100k/100K → 100000; 1.5m → 1500000`;
