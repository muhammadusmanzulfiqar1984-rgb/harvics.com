# Port Configuration Guide

## Current Setup

- **Frontend (Next.js)**: Port **3000**
- **Backend (Express)**: Port **4000**

## How It Works

1. **Frontend** runs on `http://localhost:3000`
2. **Backend** runs on `http://localhost:4000`
3. **Next.js Rewrites** automatically proxy `/api/*` requests from port 3000 to port 4000

## Environment Variables

### For Development (Default)
- No environment variables needed - defaults work correctly
- Backend rewrites use: `http://localhost:4000`
- Frontend API client uses: `http://localhost:3000` (via proxy)

### For Production
Set these environment variables:
- `BACKEND_URL` or `NEXT_PUBLIC_BACKEND_URL`: Your production backend URL (e.g., `https://api.harvics.com`)
- `NEXT_PUBLIC_API_URL`: Your production frontend URL (e.g., `https://www.harvics.com`)

## Important Notes

⚠️ **DO NOT** set `NEXT_PUBLIC_API_URL` to `http://localhost:4000` in development!
- This breaks the Next.js proxy rewrites
- The frontend API client should use `http://localhost:3000` (which proxies to backend)

## Testing

1. **Backend Health Check**: `curl http://localhost:4000/health`
2. **Frontend Health Check**: `curl http://localhost:3000`
3. **API Proxy Test**: `curl http://localhost:3000/api/localisation/languages`

## Troubleshooting

If you see "Internal Server Error":
1. Check backend is running: `lsof -ti:4000`
2. Check frontend is running: `lsof -ti:3000`
3. Check backend health: `curl http://localhost:4000/health`
4. Restart both servers: `./start-complete.sh`
