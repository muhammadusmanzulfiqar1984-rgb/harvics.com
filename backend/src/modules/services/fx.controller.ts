/**
 * FX routes — currency conversion and live rates.
 *   GET /api/services/fx/rates           latest rates (cached 1h)
 *   GET /api/services/fx/convert?from=USD&to=AED&amount=1000
 *   GET /api/services/fx/health          provider status
 */
import { Router } from 'express';
import { getRates, convert, fxEnabled, getCacheInfo } from '../../services/fxService';

export const fxRouter = Router();

fxRouter.get('/health', (_req, res) => {
  res.json({ success: true, fxEnabled: fxEnabled(), provider: 'OpenExchangeRates', cache: getCacheInfo() });
});

fxRouter.get('/rates', async (req, res) => {
  try {
    const data = await getRates();
    const symbols = req.query.symbols ? String(req.query.symbols).toUpperCase().split(',').map(s => s.trim()) : null;
    let rates = data.rates;
    if (symbols && symbols.length) {
      rates = Object.fromEntries(Object.entries(rates).filter(([k]) => symbols.includes(k)));
    }
    res.json({ success: true, base: data.base, fetchedAt: new Date(data.fetchedAt).toISOString(), rates });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

fxRouter.get('/convert', async (req, res) => {
  const amount = Number(req.query.amount);
  const from = String(req.query.from || 'USD');
  const to = String(req.query.to || 'USD');
  if (!Number.isFinite(amount)) return res.status(400).json({ success: false, error: 'amount must be a number' });
  const result = await convert(amount, from, to);
  if (!result) return res.status(400).json({ success: false, error: 'Unsupported currency pair' });
  res.json({ success: true, ...result });
});
