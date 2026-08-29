# harvyx-enrichment

Standalone Cloudflare Worker that enriches D1 leads via Hunter.io (and optional People Data Labs), then fill-empty writebacks onto `harvics-leads`.

## Deploy

```bash
cd harvyx-enrichment
npx wrangler secret put HARVYX_API_KEY    # same ops / MCP key
npx wrangler secret put HUNTER_API_KEY   # optional
npx wrangler secret put PDL_API_KEY      # optional
npx wrangler deploy
```

## API

| Method | Path | Auth | Body |
|--------|------|------|------|
| GET | `/health` | no | — |
| POST | `/enrich` | yes | `{ "leadId": "…" }` or `{ "domain", "firstName?", "lastName?" }` |
| POST | `/enrich/batch` | yes | `{ "limit": 5, "orgId": "harvics" }` |

Auth header: `x-api-key: <HARVYX_API_KEY>` or `Authorization: Bearer <…>`.

## Notes

- Shares D1 `harvics-leads` with the main site Worker (`LEADS_DB` there / `HARVYX_LEADS_DB` here).
- Cron triggers are empty — call `/enrich/batch` from MCP, console, or a later cron.
- Does not replace Hx Apollo workers; this is the light Hunter/PDL path for D1.
