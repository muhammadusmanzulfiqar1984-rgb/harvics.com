import { GoogleGenAI } from "@google/genai";
import { TABRAIZ_KNOWLEDGE, LANGUAGE_NAMES } from "../_lib/tabraiz-knowledge.js";

export async function POST(request: Request): Promise<Response> {
  try {
    const { budget, purpose, assetType, lang } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({
        error: "Gemini API Key is not configured on the server. Please add your key in Settings > Secrets."
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } }
    });

    const prompt = `You are the senior portfolio strategist for Tabraiz Town, Rahim Yar Khan. A prospective client has completed the acquisition preference quiz. Recommend the single best-fit unit for them, grounded strictly in the factual project data below.
      ${TABRAIZ_KNOWLEDGE}

      Client preferences:
      - Budget bracket: ${budget}
      - Primary purpose: ${purpose} (investment yield vs own-use vs hybrid)
      - Asset type interest: ${assetType} (retail shop / corporate office / residential apartment)

      Produce a markdown brief with exactly these sections:
      1. **Recommended Position** — name the specific block (A-G), floor level, and unit category (standard / outward-facing / premium corner where relevant) that best fits, with the reasoning in 2-3 sentences referencing real square footages and circulation advantages (boulevard frontage, atrium adjacency, corner exposure).
      2. **Why This Works For You** — 3 short bullets tied to their budget, purpose, and asset type.
      3. **Indicative 4-Year Payment Schedule** — apply the official installment plan (15% reservation, 15% excavation, 30% across 12 quarterly installments, 20% interior fitting, 20% handover) expressed as percentages and, if the budget bracket implies a number, indicative PKR amounts.
      4. **Next Step** — one elegant sentence inviting them to reserve through the private registry.

      Respond in this language: ${LANGUAGE_NAMES[lang] || "English"}. Tone: precise, confident, private-banking grade. No fluffy marketing. Quote only real figures from the data.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    return Response.json({ text: response.text });
  } catch (err: any) {
    console.error(err);
    return Response.json({ error: err.message || "An error occurred during recommendation generation." }, { status: 500 });
  }
}
