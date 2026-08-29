import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request): Promise<Response> {
  try {
    const { suiteConfig, lifestyle, lang } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({
        error: "Gemini API Key is not configured on the server. Please configure it in Settings > Secrets."
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

    const prompt = `You are a world-class interior architect from Milan collaborating with Harvics Global Ventures on the interior design language of Tabraiz Town, Rahim Yar Khan.
      Based on the chosen Suite Style: ${suiteConfig === "furnished" ? "Bespoke Fully Furnished Edition" : "Sovereign Unfurnished Shell"} and the resident's Lifestyle Profile: ${lifestyle}, write an exclusive, poetic, and highly tactile interior design specification.
      
      Integrate:
      - Southern Punjab's golden desert light angles (maximizing passive illumination)
      - Locally sourced details (hints of hand-glazed indigo clay, delicate desert sand palettes)
      - Core Monolith materials: Italian White Travertine, Champagne-finish steel, Sulphate-Resistant concrete structures.
      
      Please structure the response into 3 elegant parts:
      1. **Architectural Spatial Vibe**: The conceptual atmosphere and feeling of the space.
      2. **Materials Palette & Lighting Kelvin**: Specific material selections, texture pairings, and ambient color temperature.
      3. **Bespoke Artistry & Furniture Suggestions**: Tailored details for this lifestyle profile.
      
      Respond in ${lang === "en" ? "English" : "Urdu"}. Keep the tone extremely elegant, sophisticated, poetic, and professional. Avoid cheap marketing speak; write like a world-renowned architecture journal. Use markdown.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    return Response.json({ text: response.text });
  } catch (err: any) {
    console.error(err);
    return Response.json({ error: err.message || "An error occurred during moodboard generation." }, { status: 500 });
  }
}
