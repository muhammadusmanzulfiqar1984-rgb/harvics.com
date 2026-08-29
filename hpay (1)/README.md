# HPay (local)

Backend is the dropped **`server.js`** ledger API, runnable as **`server.cjs`** (required because `package.json` has `"type": "module"`).

```bash
npm install
npm run dev
# http://localhost:3004
```

Demo login: `demo@hpay.com` / `demo1234` (`@mian`)

- `server.js` — original dropped file (kept as reference; won’t run under ESM as `.js`)
- `server.cjs` — same API + Vite UI on port **3004**
- `server.ts` / `server/hpayApi.ts` — previous TS stack (`npm run dev:ts`)
