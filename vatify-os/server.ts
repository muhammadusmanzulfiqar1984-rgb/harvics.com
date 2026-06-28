import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('vatify.db');

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    country TEXT
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    userId TEXT,
    date TEXT,
    merchant TEXT,
    category TEXT,
    amount REAL,
    currency TEXT,
    vatAmount REAL,
    vatRate REAL,
    country TEXT,
    receiptUrl TEXT,
    status TEXT,
    auditTrail TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );
`);

// Migration: Ensure password column exists (for existing DBs)
try {
  db.prepare('ALTER TABLE users ADD COLUMN password TEXT').run();
} catch (e) {
  // Column already exists or table doesn't exist yet
}

// Validation Schemas
const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  country: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const ExpenseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.string(),
  merchant: z.string(),
  category: z.string(),
  amount: z.number(),
  currency: z.string(),
  vatAmount: z.number(),
  vatRate: z.number(),
  country: z.string(),
  status: z.string(),
  auditTrail: z.array(z.any()),
});

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 5173;

  app.use(express.json({ limit: '15mb' }));

  // Auth Routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, country } = SignupSchema.parse(req.body);
      const id = Math.random().toString(36).substr(2, 9);
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const stmt = db.prepare('INSERT INTO users (id, email, password, country) VALUES (?, ?, ?, ?)');
      stmt.run(id, email, hashedPassword, country || 'UK');
      
      res.status(201).json({ id, email, country: country || 'UK' });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: err.issues });
      }
      if (err.message?.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      console.error('Signup error:', err);
      res.status(500).json({ error: 'Signup failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = LoginSchema.parse(req.body);
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
      
      if (user && await bcrypt.compare(password, user.password)) {
        res.json({ id: user.id, email: user.email, country: user.country });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: err.issues });
      }
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // API Routes
  app.get('/api/expenses', (req, res) => {
    try {
      const userId = req.query.userId;
      if (!userId || typeof userId !== 'string') return res.status(400).json({ error: 'userId required' });
      
      const expenses = db.prepare('SELECT * FROM expenses WHERE userId = ?').all(userId);
      res.json(expenses.map((e: any) => ({
        ...e,
        auditTrail: JSON.parse(e.auditTrail || '[]')
      })));
    } catch (err) {
      console.error('Fetch expenses error:', err);
      res.status(500).json({ error: 'Failed to fetch expenses' });
    }
  });

  app.post('/api/expenses', (req, res) => {
    try {
      const data = ExpenseSchema.parse(req.body);
      const stmt = db.prepare(`
        INSERT INTO expenses (id, userId, date, merchant, category, amount, currency, vatAmount, vatRate, country, status, auditTrail)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        data.id, 
        data.userId, 
        data.date, 
        data.merchant, 
        data.category, 
        data.amount, 
        data.currency, 
        data.vatAmount, 
        data.vatRate, 
        data.country, 
        data.status, 
        JSON.stringify(data.auditTrail)
      );
      res.status(201).json({ success: true });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid expense data', details: err.issues });
      }
      console.error('Save expense error:', err);
      res.status(500).json({ error: 'Failed to save expense' });
    }
  });

  app.delete('/api/expenses/:id', (req, res) => {
    try {
      const id = req.params.id;
      const result = db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Expense not found' });
      }
      res.json({ success: true });
    } catch (err) {
      console.error('Delete expense error:', err);
      res.status(500).json({ error: 'Failed to delete expense' });
    }
  });

  // ---------- Groq AI proxy ----------
  const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
  const GROQ_TEXT_MODEL = process.env.GROQ_TEXT_MODEL || 'llama-3.3-70b-versatile';
  const GROQ_VISION_MODEL = process.env.GROQ_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';

  async function callGroq(body: any) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY not configured on server');
    const r = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const text = await r.text();
      throw new Error(`Groq ${r.status}: ${text}`);
    }
    return r.json();
  }

  const ChatSchema = z.object({
    message: z.string().min(1),
    system: z.string().optional(),
    history: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })).optional(),
  });

  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, system, history } = ChatSchema.parse(req.body);
      const messages = [
        { role: 'system', content: system || "You are 'Vatify AI', the intelligent core of Vatify OS. You are professional, precise, and helpful. You specialize in VAT regulations, expense management, and tax compliance across different European jurisdictions. Your tone is sophisticated yet accessible." },
        ...(history || []),
        { role: 'user', content: message },
      ];
      const data = await callGroq({
        model: GROQ_TEXT_MODEL,
        messages,
        temperature: 0.4,
      });
      const text = data.choices?.[0]?.message?.content || '';
      res.json({ text });
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input', details: err.issues });
      console.error('AI chat error:', err);
      res.status(500).json({ error: err.message || 'AI chat failed' });
    }
  });

  const ExtractSchema = z.object({
    imageBase64: z.string().min(10), // data URL or raw base64
    mimeType: z.string().optional(),
  });

  app.post('/api/ai/extract-receipt', async (req, res) => {
    try {
      const { imageBase64, mimeType } = ExtractSchema.parse(req.body);
      const dataUrl = imageBase64.startsWith('data:')
        ? imageBase64
        : `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`;

      const data = await callGroq({
        model: GROQ_VISION_MODEL,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'You are a receipt OCR engine. Always reply with a single valid JSON object only.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract receipt data from this image. The receipt might be in English, German, Swedish, Polish, or French.
Return JSON with exactly these fields:
{
  "merchant_name": string,
  "total_amount": number,
  "currency": string (3-letter code),
  "date": string (YYYY-MM-DD),
  "vat_amount": number | null,
  "original_description": string (merchant category/description in original language),
  "translated_description": string (English translation)
}`,
              },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ],
      });
      const raw = data.choices?.[0]?.message?.content || '{}';
      let parsed: any = {};
      try { parsed = JSON.parse(raw); } catch { parsed = {}; }
      res.json(parsed);
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input', details: err.issues });
      console.error('AI extract error:', err);
      res.status(500).json({ error: err.message || 'AI extract failed' });
    }
  });

  // Groq (prompt enhancement) -> HuggingFace (image generation)
  const HF_MODEL = process.env.HF_MODEL || 'stabilityai/stable-diffusion-xl-base-1.0';
  const HF_TRANSLATE_MODEL = process.env.HF_TRANSLATE_MODEL || 'facebook/nllb-200-distilled-600M';
  const GROQ_WHISPER_MODEL = process.env.GROQ_WHISPER_MODEL || 'whisper-large-v3-turbo';
  const GenImageSchema = z.object({ prompt: z.string().min(1) });

  app.post('/api/ai/generate-image', async (req, res) => {
    try {
      const { prompt } = GenImageSchema.parse(req.body);
      const hfKey = process.env.HF_API_KEY;
      if (!hfKey) return res.status(500).json({ error: 'HF_API_KEY not configured on server' });

      const groqData = await callGroq({
        model: GROQ_TEXT_MODEL,
        max_tokens: 300,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content:
              "You are an expert image prompt engineer. Take the user's input and rewrite it as a highly detailed, photorealistic image generation prompt. Return ONLY the enhanced prompt, nothing else.",
          },
          { role: 'user', content: prompt },
        ],
      });
      const enhancedPrompt = (groqData.choices?.[0]?.message?.content || '').trim() || prompt;

      const hfRes = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${hfKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: enhancedPrompt }),
      });
      if (!hfRes.ok) {
        const detail = await hfRes.text();
        return res.status(502).json({ error: 'HuggingFace failed', detail });
      }
      const imageBuffer = await hfRes.arrayBuffer();
      const base64 = Buffer.from(imageBuffer).toString('base64');
      res.json({
        success: true,
        originalPrompt: prompt,
        enhancedPrompt,
        image: `data:image/jpeg;base64,${base64}`,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input', details: err.issues });
      console.error('Generate image error:', err);
      res.status(500).json({ error: err.message || 'Generate image failed' });
    }
  });

  // ---------- Auto-categorization ----------
  const CategorizeSchema = z.object({
    merchant: z.string().min(1),
    description: z.string().optional(),
  });
  app.post('/api/ai/categorize', async (req, res) => {
    try {
      const { merchant, description } = CategorizeSchema.parse(req.body);
      const data = await callGroq({
        model: GROQ_TEXT_MODEL,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You categorize business expenses. Reply with a JSON object only.' },
          { role: 'user', content: `Merchant: ${merchant}\nDescription: ${description || ''}\n\nReturn JSON: { "category": one of ["Food & Drink","Travel","Software","Office Supplies","Accommodation","Fuel","Utilities","Marketing","Professional Services","Equipment","Entertainment","Other"], "confidence": number 0-1, "reason": short string }` },
        ],
      });
      const raw = data.choices?.[0]?.message?.content || '{}';
      let parsed: any = {};
      try { parsed = JSON.parse(raw); } catch {}
      res.json(parsed);
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input', details: err.issues });
      console.error('Categorize error:', err);
      res.status(500).json({ error: err.message || 'Categorize failed' });
    }
  });

  // ---------- Smart VAT validation ----------
  const VatValidateSchema = z.object({
    country: z.string(),
    amount: z.number(),
    vatAmount: z.number().optional(),
    vatRate: z.number().optional(),
    merchant: z.string().optional(),
    category: z.string().optional(),
  });
  app.post('/api/ai/validate-vat', async (req, res) => {
    try {
      const input = VatValidateSchema.parse(req.body);
      const data = await callGroq({
        model: GROQ_TEXT_MODEL,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You are a VAT compliance expert for European countries (UK 20/5/0, DE 19/7, SE 25/12/6, DK 25, NO 25/15/12, FR 20/10/5.5, PL 23/8/5). Reply with JSON only.' },
          { role: 'user', content: `Validate this expense. Input: ${JSON.stringify(input)}\n\nReturn JSON: { "ok": boolean, "expectedRate": number, "expectedVat": number, "issues": string[], "suggestion": string }` },
        ],
      });
      const raw = data.choices?.[0]?.message?.content || '{}';
      let parsed: any = {};
      try { parsed = JSON.parse(raw); } catch {}
      res.json(parsed);
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input', details: err.issues });
      console.error('Validate VAT error:', err);
      res.status(500).json({ error: err.message || 'Validate VAT failed' });
    }
  });

  // ---------- Monthly summary / insights ----------
  const SummarySchema = z.object({
    expenses: z.array(z.any()),
    country: z.string().optional(),
    period: z.string().optional(),
  });
  app.post('/api/ai/summary', async (req, res) => {
    try {
      const { expenses, country, period } = SummarySchema.parse(req.body);
      const slim = expenses.slice(0, 200).map((e: any) => ({
        date: e.date, merchant: e.merchant, category: e.category,
        amount: e.amount, currency: e.currency, vat: e.vatAmount, country: e.country,
      }));
      const data = await callGroq({
        model: GROQ_TEXT_MODEL,
        temperature: 0.3,
        messages: [
          { role: 'system', content: 'You are a financial analyst for freelancers. Produce concise, useful markdown insights with bullet points and key numbers. Keep under 250 words.' },
          { role: 'user', content: `Analyse these expenses for ${country || 'EU'} (${period || 'this period'}).\nData: ${JSON.stringify(slim)}\n\nInclude: total spend, total VAT, top 3 categories, unusual spending patterns, 2-3 actionable recommendations.` },
        ],
      });
      const text = data.choices?.[0]?.message?.content || '';
      res.json({ text });
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input', details: err.issues });
      console.error('Summary error:', err);
      res.status(500).json({ error: err.message || 'Summary failed' });
    }
  });

  // ---------- Translation (HF NLLB) ----------
  const TranslateSchema = z.object({
    text: z.string().min(1),
    targetLang: z.string().default('eng_Latn'),
    sourceLang: z.string().optional(),
  });
  app.post('/api/ai/translate', async (req, res) => {
    try {
      const { text, targetLang, sourceLang } = TranslateSchema.parse(req.body);
      const hfKey = process.env.HF_API_KEY;
      if (!hfKey) return res.status(500).json({ error: 'HF_API_KEY not configured' });
      const hfRes = await fetch(`https://api-inference.huggingface.co/models/${HF_TRANSLATE_MODEL}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${hfKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: text,
          parameters: { src_lang: sourceLang, tgt_lang: targetLang },
        }),
      });
      if (!hfRes.ok) {
        const detail = await hfRes.text();
        return res.status(502).json({ error: 'HuggingFace failed', detail });
      }
      const result: any = await hfRes.json();
      const translated = Array.isArray(result) ? (result[0]?.translation_text || '') : (result.translation_text || '');
      res.json({ translated });
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input', details: err.issues });
      console.error('Translate error:', err);
      res.status(500).json({ error: err.message || 'Translate failed' });
    }
  });

  // ---------- Voice transcription (Groq Whisper) ----------
  const TranscribeSchema = z.object({
    audioBase64: z.string().min(10),
    mimeType: z.string().optional(),
    language: z.string().optional(),
  });
  app.post('/api/ai/transcribe', async (req, res) => {
    try {
      const { audioBase64, mimeType, language } = TranscribeSchema.parse(req.body);
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
      const b64 = audioBase64.includes(',') ? audioBase64.split(',')[1] : audioBase64;
      const buf = Buffer.from(b64, 'base64');
      const blob = new Blob([buf], { type: mimeType || 'audio/webm' });
      const form = new FormData();
      form.append('file', blob, 'audio.webm');
      form.append('model', GROQ_WHISPER_MODEL);
      if (language) form.append('language', language);
      const r = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form as any,
      });
      if (!r.ok) {
        const detail = await r.text();
        return res.status(502).json({ error: 'Groq whisper failed', detail });
      }
      const data: any = await r.json();
      res.json({ text: data.text || '' });
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input', details: err.issues });
      console.error('Transcribe error:', err);
      res.status(500).json({ error: err.message || 'Transcribe failed' });
    }
  });

  // ---------- Duplicate detection ----------
  const DuplicateSchema = z.object({
    candidate: z.object({
      merchant: z.string(),
      amount: z.number(),
      date: z.string(),
      currency: z.string().optional(),
    }),
    existing: z.array(z.any()),
  });
  app.post('/api/ai/check-duplicate', async (req, res) => {
    try {
      const { candidate, existing } = DuplicateSchema.parse(req.body);
      // Cheap pre-filter: same currency, amount within 1%, date within 3 days, merchant similar
      const cDate = new Date(candidate.date).getTime();
      const near = existing.filter((e: any) => {
        const sameCur = !candidate.currency || !e.currency || e.currency === candidate.currency;
        const amtClose = Math.abs(e.amount - candidate.amount) / Math.max(1, candidate.amount) < 0.02;
        const dateClose = Math.abs(new Date(e.date).getTime() - cDate) < 3 * 86400000;
        return sameCur && amtClose && dateClose;
      }).slice(0, 10);
      if (near.length === 0) return res.json({ duplicate: false, matches: [] });

      const data = await callGroq({
        model: GROQ_TEXT_MODEL,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You detect duplicate expenses. Reply JSON only.' },
          { role: 'user', content: `Candidate: ${JSON.stringify(candidate)}\nExisting nearby: ${JSON.stringify(near.map((e: any) => ({ id: e.id, merchant: e.merchant, amount: e.amount, date: e.date, currency: e.currency })))}\n\nReturn JSON: { "duplicate": boolean, "matches": [{ "id": string, "confidence": number, "reason": string }] }` },
        ],
      });
      const raw = data.choices?.[0]?.message?.content || '{}';
      let parsed: any = { duplicate: false, matches: [] };
      try { parsed = JSON.parse(raw); } catch {}
      res.json(parsed);
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input', details: err.issues });
      console.error('Duplicate error:', err);
      res.status(500).json({ error: err.message || 'Duplicate check failed' });
    }
  });

  // ---------- Tax-deductibility explainer ----------
  const DeductSchema = z.object({
    merchant: z.string(),
    category: z.string().optional(),
    amount: z.number(),
    country: z.string(),
    businessType: z.string().optional(),
  });
  app.post('/api/ai/deductible', async (req, res) => {
    try {
      const input = DeductSchema.parse(req.body);
      const data = await callGroq({
        model: GROQ_TEXT_MODEL,
        temperature: 0.2,
        messages: [
          { role: 'system', content: 'You are a tax advisor for freelancers in Europe. Answer concisely with markdown. Always end with a disclaimer that this is not formal tax advice.' },
          { role: 'user', content: `Is this expense tax-deductible for a freelancer in ${input.country}?\nMerchant: ${input.merchant}\nCategory: ${input.category || 'unknown'}\nAmount: ${input.amount}\nBusiness type: ${input.businessType || 'freelancer'}\n\nReply with: deductibility (Fully / Partially / Not deductible), reasoning, any conditions, and what records to keep.` },
        ],
      });
      const text = data.choices?.[0]?.message?.content || '';
      res.json({ text });
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input', details: err.issues });
      console.error('Deductible error:', err);
      res.status(500).json({ error: err.message || 'Deductible failed' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
