# Vapi Integration (FastAPI companion)

This folder is the **server-side companion** for HarvyX voice on the main Harvics site.

- **On the website:** voice lives inside `src/features/ai/ChatbotWidget.tsx` (Talk button + transcripts in the same chat panel), using `@vapi-ai/web` and `NEXT_PUBLIC_VAPI_*` from `.env.local`.
- **This FastAPI app:** optional — webhooks (`/webhook/vapi`), custom tools, and outbound phone calls via the private API key.

## Website (primary)

The HarvyX FAB (bottom-right) opens chat. Use **Talk** in the panel header (or the mic button) to start a Vapi call. Final transcripts sync into the same message thread as text chat.

## FastAPI (optional tools / outbound)

```bash
cd vapi-integration
source .venv/bin/activate
pip install -r requirements.txt
# fill .env with VAPI_PRIVATE_KEY, VAPI_PUBLIC_KEY, VAPI_ASSISTANT_ID
uvicorn app.main:app --reload --port 8000
```

Point your Vapi assistant **Server URL** at `https://<public-host>/webhook/vapi` (ngrok for local). Implement tools in `handle_tool_call()` in `app/main.py`.

## Env

| Key | Where |
|-----|--------|
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | Root `.env.local` (browser) |
| `NEXT_PUBLIC_VAPI_ASSISTANT_ID` | Root `.env.local` (browser) |
| `VAPI_PRIVATE_KEY` | `vapi-integration/.env` only (server) |
