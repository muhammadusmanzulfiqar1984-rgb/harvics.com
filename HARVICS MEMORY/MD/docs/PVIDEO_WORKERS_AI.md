# Pruna P-Video (Cloudflare Workers AI)

**Model:** `pruna/p-video`  
**Binding:** already in `wrangler.jsonc` → `"ai": { "binding": "AI" }`  
**No separate “install”** — calling the model via the AI binding is enough. Usage draws from Workers Paid Neurons / startup credits (draft @720p is cheapest).

## Generate from the site (after deploy)

```bash
curl -sS -X POST "https://www.harvics.com/api/ai/p-video" \
  -H "Authorization: Bearer $INTERNAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A sports car drifting through a neon-lit city at night, cinematic aerial shot",
    "duration": 5,
    "resolution": "720p",
    "aspect_ratio": "16:9",
    "draft": true
  }'
```

Set Worker secret (once):

```bash
npx wrangler secret put INTERNAL_API_KEY
# or
npx wrangler secret put PVIDEO_API_KEY
```

## Generate locally (REST, no deploy)

```bash
export CLOUDFLARE_API_TOKEN=...   # Workers AI Write
node scripts/p-video-generate.mjs "Harvics corridor freight at golden hour, cinematic"
```

## Cost tip

Prefer `"draft": true` + `"resolution": "720p"` while experimenting with free credits.

## Text models (same `AI` binding)

```bash
curl -sS -X POST "https://www.harvics.com/api/ai/workers" \
  -H "Authorization: Bearer $INTERNAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "prompt": "What is Cloudflare?" }'
```

Equivalent Worker snippet:

```js
const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
  prompt: "What is Cloudflare?",
});
```

