import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request): Promise<Response> {
  try {
    const { suiteConfig, lifestyle } = await request.json();
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

    const prompt = `Ultra-photorealistic interior photograph of a luxury ${suiteConfig === "furnished" ? "fully furnished designer suite" : "unfurnished open shell suite ready for bespoke fit-out"} inside Tabraiz Town, a premium commercial development in Rahim Yar Khan, Pakistan. Style tailored for a "${lifestyle}" lifestyle profile. Italian white travertine floors and walls, champagne-gold metal accents, floor-to-ceiling triple-glazed windows with warm golden desert light of Southern Punjab streaming in, hints of hand-glazed indigo clay decor, sand-tone palette. Cinematic warm color grade, 35mm lens, shallow depth of field, hyper-detailed, no text, no watermark.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: prompt,
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      const inline = (part as any).inlineData;
      if (inline?.data) {
        return Response.json({ imageBase64: inline.data, mimeType: inline.mimeType || "image/png" });
      }
    }
    return Response.json({ error: "The visualization engine returned no image. Please try again." });
  } catch (err: any) {
    console.error(err);
    return Response.json({ error: err.message || "An error occurred during suite visualization." }, { status: 500 });
  }
}
