import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { TABRAIZ_KNOWLEDGE, LANGUAGE_NAMES } from "./api/_lib/tabraiz-knowledge.js";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3020;

  app.use(express.json());

  // API Route: Underwriting Analysis
  app.post("/api/ai/underwrite", async (req, res) => {
    try {
      const { scale, horizonYears, capitalSource, lang, arr, initialPKR, finalPKR } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
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

      res.json({ text: response.text });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "An error occurred during text generation." });
    }
  });

  // API Route: FAQ Q&A Chatbot
  app.post("/api/ai/ask-faq", async (req, res) => {
    try {
      const { question, lang, learnedIntents } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
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

      res.json({ text: response.text });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "An error occurred during Q&A generation." });
    }
  });

  // API Route: AI Interior Aesthetic Moodboard Customizer
  app.post("/api/ai/moodboard", async (req, res) => {
    try {
      const { suiteConfig, lifestyle, lang } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
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

      res.json({ text: response.text });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "An error occurred during moodboard generation." });
    }
  });

  // API Route: AI Plot/Suite Recommender
  app.post("/api/ai/recommend", async (req, res) => {
    try {
      const { budget, purpose, assetType, lang } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
          error: "Gemini API Key is not configured on the server. Please add your key in Settings > Secrets."
        });
      }
      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
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

      const response = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: prompt });
      res.json({ text: response.text });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "An error occurred during recommendation generation." });
    }
  });

  // API Route: Lead Qualification & Follow-up Draft
  app.post("/api/ai/qualify-lead", async (req, res) => {
    try {
      const { email, learnedIntents, chatHistory, lang } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
          error: "Gemini API Key is not configured on the server. Please add your key in Settings > Secrets."
        });
      }
      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
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

      const response = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: prompt });
      res.json({ text: response.text });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "An error occurred during lead qualification." });
    }
  });

  // API Route: AI Suite Visual Generation
  app.post("/api/ai/suite-visual", async (req, res) => {
    try {
      const { suiteConfig, lifestyle } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
          error: "Gemini API Key is not configured on the server. Please add your key in Settings > Secrets."
        });
      }
      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
      const prompt = `Ultra-photorealistic interior photograph of a luxury ${suiteConfig === "furnished" ? "fully furnished designer suite" : "unfurnished open shell suite ready for bespoke fit-out"} inside Tabraiz Town, a premium commercial development in Rahim Yar Khan, Pakistan. Style tailored for a "${lifestyle}" lifestyle profile. Italian white travertine floors and walls, champagne-gold metal accents, floor-to-ceiling triple-glazed windows with warm golden desert light of Southern Punjab streaming in, hints of hand-glazed indigo clay decor, sand-tone palette. Cinematic warm color grade, 35mm lens, shallow depth of field, hyper-detailed, no text, no watermark.`;

      const response = await ai.models.generateContent({ model: "gemini-2.0-flash-preview-image-generation", contents: prompt });
      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        const inline = (part as any).inlineData;
        if (inline?.data) {
          return res.json({ imageBase64: inline.data, mimeType: inline.mimeType || "image/png" });
        }
      }
      res.json({ error: "The visualization engine returned no image. Please try again." });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "An error occurred during suite visualization." });
    }
  });

  // Serve static or dev files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
