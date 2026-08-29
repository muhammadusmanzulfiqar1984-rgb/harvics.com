import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request): Promise<Response> {
  try {
    const { scale, horizonYears, capitalSource, lang, arr, initialPKR, finalPKR } = await request.json();
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

    const prompt = `You are an elite, high-end McKinsey financial underwriter specializing in sovereign wealth and mega-infrastructure investments in Southern Punjab.
      Write an exclusive, highly tailored Investment Underwriting Brief for a client considering investing in Tabraiz Town, Rahim Yar Khan.
      
      User's Selection Parameters:
      - Asset Scale: ${scale} (Initial Valuation: ${initialPKR})
      - Investment Horizon: ${horizonYears} Years
      - Capital Source: ${capitalSource}
      - Tabraiz Town ARR: ${arr}%
      - Projected Valuation after ${horizonYears} years: ${finalPKR}
      
      Please write a sophisticated, McKinsey-style executive analysis. Organize it into the following three parts:
      1. **Strategic Macro Thesis**: Why this asset scale and capital source makes sense in Southern Punjab's agricultural-to-urban pivot.
      2. **Volumetric Asset Shielding**: How the physical monolithic structure safeguards this capital from inflation.
      3. **Generational Wealth Preservation Pro-Forma**: A detailed commentary on the growth curve and return profile over the ${horizonYears}-year holding period.
      
      Respond in ${lang === "en" ? "English" : "Urdu"}. Keep the tone extremely elegant, intellectual, objective, and professional. Avoid fluffy marketing jargon; sound like a sovereign wealth fund's senior director or a lead McKinsey partner. Use markdown. Do not include excessive introductions, get straight to the point.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    return Response.json({ text: response.text });
  } catch (err: any) {
    console.error(err);
    return Response.json({ error: err.message || "An error occurred during text generation." }, { status: 500 });
  }
}
