# Harvics Meet (`apps/the-meet`)

Standalone Next.js 15 app: schedule → invite → RSVP → pre-join → LiveKit room → post-meeting artifacts.

## Quick start

```bash
cd apps/the-meet
cp .env.example .env.local
# fill DATABASE_URL, NEXTAUTH_SECRET, LiveKit keys
npm install
npx prisma db push
npm run dev
```

Open [http://localhost:3010](http://localhost:3010).

## Stack

- Auth.js (Credentials MVP)
- Prisma + PostgreSQL
- LiveKit Cloud
- Resend · Deepgram · OpenAI · R2 · Inngest (stubs ready)

## Routes

| Path | Purpose |
|------|---------|
| `/schedule` | Create meeting |
| `/dashboard` | Hosted meetings |
| `/meeting/[id]/prejoin` | Device check + join |
| `/meeting/[id]/room` | LiveKit room |
| `/invite/[token]` | RSVP |
| `/post-meeting/[id]` | Artifacts |

Monorepo Apps catalog still has an in-repo bridge at `/apps/meet`. Set `NEXT_PUBLIC_MEET_APP_URL=http://localhost:3010` on the main site to launch this app instead.
