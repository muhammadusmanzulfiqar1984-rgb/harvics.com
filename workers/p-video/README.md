# AI Media Generator (Workers AI)

Standalone Cloudflare Worker with a browser UI + JSON APIs for image and video generation.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Browser UI (Image / Video tabs) |
| `POST` | `/api/image` | `{ "model", "prompt" }` → base64 `image` |
| `POST` | `/api/video` | `{ "model", "prompt", "duration" }` → `videoUrl` |
| `GET` | `/health` | Binding + defaults |

## Config

`wrangler.jsonc` already has the AI binding.

**Video — Pruna native API (recommended):**

1. Key + credits: https://dashboard.pruna.ai (API Keys + Billing, min ~$5)
2. Set Worker secret:
   ```bash
   npx wrangler secret put PRUNA_API_KEY
   ```
3. Worker calls:
   ```bash
   POST https://api.pruna.ai/v1/predictions
   -H "apikey: …"
   -H "Model: p-video"
   -H "Try-Sync: true"
   ```

Fallback order: Pruna → Replicate Gateway BYOK → `env.AI.run` (Cloudflare credits).

Optional secrets / bindings (`Env`):
```ts
REPLICATE_API_KEY, PRUNA_API_KEY, AI, ASSETS_BUCKET?, CACHE?
```
```bash
npx wrangler secret put REPLICATE_API_KEY   # optional fallback
```

```jsonc
"ai": { "binding": "AI" }
```

## Commands

```bash
cd workers/p-video
npm install
npx wrangler login   # once
npx wrangler dev     # http://localhost:8787
npx wrangler deploy
```

## Examples

```bash
# Image
curl -sS -X POST "$URL/api/image" \
  -H "Content-Type: application/json" \
  -d '{"model":"@cf/black-forest-labs/flux-1-schnell","prompt":"a cyberpunk lizard"}'

# Video (draft + 720p = cheaper Neurons)
curl -sS -X POST "$URL/api/video" \
  -H "Content-Type: application/json" \
  -d '{"model":"pruna/p-video","prompt":"neon city drift","duration":5,"resolution":"720p","draft":true}'
```

Defaults: Flux Schnell for image, `pruna/p-video` for video (`duration=5`, `720p`, `draft=true`).
