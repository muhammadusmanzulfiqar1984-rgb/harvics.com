# 🚀 HARVICS OS V16 - Production Commands

## Quick Production Start

### Simple Start (No Build)
```bash
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics"
./start-production.sh
```

### Full Production Deployment
```bash
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics"
./deploy-production.sh
```

---

## Individual Commands

### 1. Start Backend Only
```bash
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/server"
PORT=4000 NODE_ENV=production node index.js
```

### 2. Start Frontend Only
```bash
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/harviclocales-main"
PORT=3000 NODE_ENV=production npm start
```

### 3. Build Frontend
```bash
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/harviclocales-main"
NEXT_PUBLIC_API_URL=http://localhost:4000 npm run build
```

### 4. Start with PM2
```bash
# Backend
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/server"
PORT=4000 NODE_ENV=production pm2 start index.js --name harvics-backend

# Frontend
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/harviclocales-main"
PORT=3000 NODE_ENV=production pm2 start npm --name harvics-frontend -- start
```

### 5. Start with Docker
```bash
cd "/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics"
docker-compose -f docker-compose.production.yml up -d --build
```

---

## Stop Services

### Stop All
```bash
# PM2
pm2 stop all

# Docker
docker-compose -f docker-compose.production.yml down

# Manual
kill $(cat logs/backend.pid) $(cat logs/frontend.pid)
```

---

## View Logs

```bash
# Backend
tail -f logs/backend.log

# Frontend
tail -f logs/frontend.log

# PM2
pm2 logs

# Docker
docker-compose -f docker-compose.production.yml logs -f
```

---

## Health Checks

```bash
# Backend
curl http://localhost:4000/api/health

# Frontend
curl http://localhost:3000
```

---

**Ready to deploy! Use `./deploy-production.sh` for full deployment.** 🚀

