import os
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

load_dotenv()

VAPI_PRIVATE_KEY = os.getenv("VAPI_PRIVATE_KEY", "")
VAPI_PUBLIC_KEY = os.getenv("VAPI_PUBLIC_KEY", "")
VAPI_ASSISTANT_ID = os.getenv("VAPI_ASSISTANT_ID", "")
VAPI_WEBHOOK_SECRET = os.getenv("VAPI_WEBHOOK_SECRET", "")

VAPI_BASE_URL = "https://api.vapi.ai"

app = FastAPI(title="Vapi Integration")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/", response_class=HTMLResponse)
async def index() -> HTMLResponse:
    return HTMLResponse((STATIC_DIR / "index.html").read_text())


@app.get("/api/config")
async def get_config() -> dict[str, str]:
    if not VAPI_PUBLIC_KEY or not VAPI_ASSISTANT_ID:
        raise HTTPException(500, "VAPI_PUBLIC_KEY / VAPI_ASSISTANT_ID not set in .env")
    return {"publicKey": VAPI_PUBLIC_KEY, "assistantId": VAPI_ASSISTANT_ID}


@app.post("/api/calls")
async def create_call(payload: dict[str, Any]) -> Any:
    """Create an outbound or web call via Vapi REST API."""
    if not VAPI_PRIVATE_KEY:
        raise HTTPException(500, "VAPI_PRIVATE_KEY not set")
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(
            f"{VAPI_BASE_URL}/call",
            headers={"Authorization": f"Bearer {VAPI_PRIVATE_KEY}"},
            json=payload,
        )
    if r.status_code >= 400:
        raise HTTPException(r.status_code, r.text)
    return r.json()


@app.post("/webhook/vapi")
async def vapi_webhook(request: Request) -> JSONResponse:
    """Server-side webhook for Vapi events (tool calls, status updates, transcripts)."""
    if VAPI_WEBHOOK_SECRET:
        secret = request.headers.get("x-vapi-secret", "")
        if secret != VAPI_WEBHOOK_SECRET:
            raise HTTPException(401, "Invalid webhook secret")

    body = await request.json()
    message = body.get("message", {})
    msg_type = message.get("type")

    if msg_type == "tool-calls":
        results = []
        for tc in message.get("toolCallList", []):
            name = tc.get("function", {}).get("name")
            args = tc.get("function", {}).get("arguments", {})
            results.append({
                "toolCallId": tc.get("id"),
                "result": handle_tool_call(name, args),
            })
        return JSONResponse({"results": results})

    # status-update, end-of-call-report, transcript, etc.
    print(f"[vapi] {msg_type}: {message.get('status') or ''}")
    return JSONResponse({"received": True})


def handle_tool_call(name: str, args: dict[str, Any]) -> Any:
    """Implement your custom tools here. Wire them up in the Vapi assistant config."""
    if name == "get_weather":
        city = args.get("city", "unknown")
        return f"It's 72°F and sunny in {city}."
    return f"Unknown tool: {name}"
