/**
 * Public HPay checkout — token is the credential (no login).
 */
import { Router, Request, Response } from 'express';
import {
  getPayLink,
  publicCheckoutPayload,
  settleHpayCheckout,
  type HpayRail,
} from '../../services/invoicePayLink.service';

const router = Router();

router.get('/checkout/:token', (req: Request, res: Response) => {
  const link = getPayLink(req.params.token);
  if (!link) return res.status(404).json({ success: false, error: 'Pay link not found' });
  res.json({ success: true, data: publicCheckoutPayload(link) });
});

router.post('/checkout/:token/pay', async (req: Request, res: Response) => {
  const railRaw = String(req.body?.rail || 'wallet').toLowerCase();
  const rail: HpayRail = railRaw === 'bank' || railRaw === 'card' ? railRaw : 'wallet';
  const result = await settleHpayCheckout(req.params.token, rail);
  if (!result.ok) {
    return res.status(result.status || 400).json({ success: false, error: result.error });
  }
  res.json({
    success: true,
    data: result,
    message: result.alreadyPaid ? 'Already paid' : `Paid via ${result.rail}`,
  });
});

export default router;
