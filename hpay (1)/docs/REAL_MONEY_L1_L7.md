# HPay Real-Money Security — HPAY-REAL-MONEY-V2

## Fail-closed order: L7 → L1

| Layer | Requirement | Enforcement |
|-------|-------------|-------------|
| L7 | WAF, TLS 1.3, rate throttle, HSTS/CSP | `server/perimeter.cjs` |
| L6 | KYT / OFAC (Chainalysis) | `providers.chainalysis` + sanctions list |
| L5 | `X-Idempotency-Key` + lock | `server/idempotency.cjs` on money POSTs |
| L4 | Double-entry invariant + ZK solvency | ledger invariant + ZK proofs |
| L3 | FIDO2 / WebAuthn ≥ $10,000 | biometric gate |
| L2 | ML-KEM-1024 / Kyber PQ signatures | PQC payload protect |
| L1 | FIPS HSM + Fireblocks MPC (≥ $50k M-of-N) | HSM countersign + vault policy |

## Production adapters (`server/providers.cjs`)

1. **Fireblocks** — `/v1/vault/accounts`, `/v1/transactions`
2. **Circle** — `/v1/transfers`, wire deposits, `/v1/payouts`
3. **SWIFT / CBUAE** — `pacs.008`, `camt.053`
4. **Chainalysis KYT** — `/api/kyt/v2/users`, `/api/kyt/v2/transfers`
5. **Gemini** — Harvey (`GEMINI_API_KEY`, `HARVEY_MODEL`)

Sandbox by default. Set keys + `HPAY_INTEGRATIONS_MODE=auto|live` for live calls.
