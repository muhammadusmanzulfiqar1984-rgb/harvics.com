# 🚀 How to Run Harvics Website

## Quick Start (Easiest Method)

### Option 1: Use Startup Script (Recommended) ⭐

```bash
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/harviclocales-main"
chmod +x START_SERVERS.sh
./START_SERVERS.sh
```

This will:
- ✅ Stop any running servers
- ✅ Start Backend (port 4000)
- ✅ Start Frontend (port 3000)
- ✅ Show you all access URLs

---

## Manual Method (Step by Step)

### Step 1: Navigate to Project
```bash
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/harviclocales-main"
```

### Step 2: Install Dependencies (First Time Only)
```bash
npm install
```

### Step 3: Start Backend
```bash
npm run backend
```
**OR** (with auto-reload on changes):
```bash
npm run backend:watch
```

### Step 4: Start Frontend (New Terminal)
Open a **new terminal window** and run:
```bash
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/harviclocales-main"
npm run dev
```

---

## Alternative: Complete Startup Script

If you're in the parent directory:
```bash
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics"
chmod +x start-complete.sh
./start-complete.sh
```

---

## 📍 Access URLs

Once servers are running:

### Frontend:
- **Homepage:** http://localhost:3000/en
- **Investor Relations:** http://localhost:3000/en/investor-relations
- **CRM Dashboard:** http://localhost:3000/en/dashboard/company/
  - Login: `admin` / `admin`

### Backend:
- **API Base:** http://localhost:4000/api
- **Health Check:** http://localhost:4000/api/system/health
- **Languages:** http://localhost:4000/api/localisation/languages

---

## 🛑 How to Stop Servers

### Option 1: Use Stop Script
```bash
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/harviclocales-main"
chmod +x STOP_SERVERS.sh
./STOP_SERVERS.sh
```

### Option 2: Manual Stop
```bash
# Stop Frontend
pkill -f "next dev"

# Stop Backend
pkill -f "tsx.*backend"
```

### Option 3: If Running in Terminal
- Press `Ctrl + C` in each terminal window

---

## 🔧 Troubleshooting

### Port Already in Use?

**Kill processes on ports:**
```bash
# Kill port 3000 (Frontend)
lsof -ti:3000 | xargs kill -9

# Kill port 4000 (Backend)
lsof -ti:4000 | xargs kill -9
```

### Clear Cache and Restart

```bash
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/harviclocales-main"

# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

### Check if Servers Are Running

```bash
# Check Frontend (port 3000)
lsof -i :3000

# Check Backend (port 4000)
lsof -i :4000
```

### View Logs

**If using START_SERVERS.sh:**
```bash
# Backend logs
tail -f /tmp/harvics-backend.log

# Frontend logs
tail -f /tmp/harvics-frontend.log
```

**If using start-complete.sh:**
```bash
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics"
tail -f logs/backend.log
tail -f logs/frontend.log
```

---

## 📋 Available NPM Scripts

```bash
# Development
npm run dev              # Start frontend (port 3000)
npm run backend          # Start backend (port 4000)
npm run backend:watch    # Start backend with auto-reload

# Build
npm run build            # Build for production
npm run start            # Start production server

# Utilities
npm run clear-cache      # Clear Next.js cache
npm run lint             # Run linter
```

---

## ✅ Verification Checklist

After starting, verify:

1. **Backend Running:**
   ```bash
   curl http://localhost:4000/api/system/health
   ```
   Should return: `{"status":"ok"}`

2. **Frontend Running:**
   ```bash
   curl http://localhost:3000
   ```
   Should return: HTML content

3. **Open in Browser:**
   - Go to: http://localhost:3000/en
   - Should see Harvics homepage

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| **Start Both** | `./START_SERVERS.sh` |
| **Start Backend Only** | `npm run backend` |
| **Start Frontend Only** | `npm run dev` |
| **Stop All** | `./STOP_SERVERS.sh` |
| **Clear Cache** | `npm run clear-cache` |
| **Check Ports** | `lsof -i :3000` or `lsof -i :4000` |

---

## 💡 Pro Tips

1. **Run in Background:**
   ```bash
   npm run backend > /tmp/backend.log 2>&1 &
   npm run dev > /tmp/frontend.log 2>&1 &
   ```

2. **Auto-restart on Changes:**
   - Frontend: Auto-reloads (Next.js)
   - Backend: Use `npm run backend:watch`

3. **Environment Variables:**
   - Check `.env.local` for configuration
   - `USE_MOCK_PROVIDERS=false` = Real APIs
   - `USE_MOCK_PROVIDERS=true` = Mock Data

---

**That's it! Your servers should be running now.** 🎉

