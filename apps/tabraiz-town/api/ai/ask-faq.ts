import { GoogleGenAI } from "@google/genai";
import { TABRAIZ_KNOWLEDGE, LANGUAGE_NAMES } from "../_lib/tabraiz-knowledge.js";

export async function POST(request: Request): Promise<Response> {
  try {
    const { question, lang, learnedIntents } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({
        error: "Gemini API Key is not configured on the server. Please add your key in Settings > Secrets."
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });

    let learnedContext = "";
    if (learnedIntents && Array.isArray(learnedIntents) && learnedIntents.length > 0) {
      learnedContext = `\n\nUSER SESSION INTERACTIVE MEMORY (Learned Intentions):
The user has interacted with the following elements during this session:
${learnedIntents.map((i: string) => `- ${i}`).join("\n")}
Please subtly reference or adapt your tone to show that you remember these specific interactions if relevant, but remain completely professional, objective, and McKinsey-aligned.`;
    }

    const prompt = `You are the sovereign AI Concierge for Tabraiz Town, Rahim Yar Khan, a luxury 30-Kanal mixed-use commercial development.
      Answer the user's question with absolute precision, courtesy, and high-end brand alignment.
      When numbers are relevant, quote the exact figures from the factual data below — never invent numbers.
      ${TABRAIZ_KNOWLEDGE}
      
      User's Question: "${question}"
      Respond in this language: ${LANGUAGE_NAMES[lang] || "English"}${learnedContext}
      
      Provide a highly polished, helpful, and sophisticated response in markdown format. If the question is unrelated to Tabraiz Town or investments/lifestyle in Pakistan, gently redirect the user back to the spatial grandeur of Tabraiz Town. Keep it concise. Ensure response is beautifully structured.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    return Response.json({ text: response.text });
  } catch (err: any) {
    console.error(err);
    return Response.json({ error: err.message || "An error occurred during Q&A generation." }, { status: 500 });
  }
}
