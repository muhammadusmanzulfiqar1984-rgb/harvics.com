import { GoogleGenAI } from "@google/genai";
import { TABRAIZ_KNOWLEDGE, LANGUAGE_NAMES } from "../_lib/tabraiz-knowledge.js";

export async function POST(request: Request): Promise<Response> {
  try {
    const { email, learnedIntents, chatHistory, lang } = await request.json();
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

    const intents = Array.isArray(learnedIntents) && learnedIntents.length > 0
      ? learnedIntents.map((i: string) => `- ${i}`).join("\n")
      : "- (no recorded interactions)";
    const history = Array.isArray(chatHistory) && chatHistory.length > 0
      ? chatHistory.map((m: any) => `${m.sender}: ${m.text}`).join("\n")
      : "(no chat history)";

    const prompt = `You are the head of sales intelligence for Tabraiz Town, Rahim Yar Khan. A visitor just registered interest via the private registry. Analyze their session and produce an internal lead brief plus a ready-to-send follow-up message.
      ${TABRAIZ_KNOWLEDGE}

      Registered email: ${email}
      Session interactions:
      ${intents}

      Concierge chat transcript:
      ${history}

      Produce markdown with exactly these sections:
      1. **Lead Classification** — one line: [Investor | End-User | Hybrid | Unknown] + urgency [Hot | Warm | Cold] + inferred budget signal, each with a one-phrase justification.
      2. **What They Care About** — up to 3 bullets inferred from their actual interactions (do not invent).
      3. **Draft Follow-Up Message** — a short, elegant WhatsApp/email message (under 120 words) from the Tabraiz Town concierge team, personalized to their interests, inviting them to a private site presentation. Write the draft in ${LANGUAGE_NAMES[lang] || "English"}.

      Sections 1-2 in English (internal). Be honest when data is thin — classify as Unknown rather than inventing.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    return Response.json({ text: response.text });
  } catch (err: any) {
    console.error(err);
    return Response.json({ error: err.message || "An error occurred during lead qualification." }, { status: 500 });
  }
}
