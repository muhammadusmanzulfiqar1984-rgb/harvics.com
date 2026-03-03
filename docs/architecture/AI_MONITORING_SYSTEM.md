# 🤖 AI-Powered 24/7 Monitoring & Auto-Fix System

## Overview

The Harvics system now includes a comprehensive AI-powered monitoring and auto-fix system that runs 24/7, watching for issues and automatically rectifying them.

## Architecture

### 1. **Backend Runtime Watchdog** (`server/services/runtimeWatchdog.js`)
- **Purpose**: Continuously monitors backend and frontend health
- **Frequency**: Checks every 60 seconds
- **Actions**:
  - Pings backend health endpoint (`/api/system/health`)
  - Pings frontend health endpoint (`/api/health`)
  - Triggers auto-recovery when outages detected
  - Logs all events to `logs/watchdog.log`

### 2. **Frontend Auto Bug Detector** (`src/services/auto-bug-detector.ts`)
- **Purpose**: Client-side bug detection and auto-fixing
- **Frequency**: Checks every 30 seconds
- **Checks**:
  - API endpoint availability
  - Authentication token validity
  - Data consistency (duplicates, missing fields)
  - Performance metrics (memory, load time)
  - Security issues (exposed sensitive data, CSP violations)
  - Integration health
  - **Backend alerts** (consumes `/api/system/monitor-status`)

### 3. **Backend Monitor Service** (`server/services/monitor.js`)
- **Purpose**: Tracks workflow, connector, and AI decision metrics
- **Frequency**: Checks every 30 seconds
- **Tracks**:
  - Workflow completions/errors
  - Integration connector success/errors
  - AI decision counts
  - Recent issues (last 50)

### 4. **Auto Bug Fixer** (`server/services/auto-bug-fixer.js`)
- **Purpose**: Automatically fixes detected issues
- **Frequency**: Runs every 5 minutes
- **Fixes**:
  - Database inconsistencies
  - Missing data
  - Configuration errors

## API Endpoints

### Health & Monitoring
- `GET /api/health` (Frontend) - Frontend health check
- `GET /api/system/health` (Backend) - Backend health with diagnostics
- `GET /api/system/monitor-status` - Combined monitor & watchdog status

### Manual Triggers
- `POST /api/system/fix-bugs` - Manually trigger bug fixer
- `POST /api/system/sync-data` - Manually trigger data sync

## Environment Variables

### Frontend (`.env.local` in `harviclocales-main/`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (`.env` in `server/`)
```bash
PORT=5000
NODE_ENV=development
```

## Monitoring Dashboard

The `AutoBugDetector` component displays real-time bug statistics:
- Total bugs detected
- Fixed vs unfixed count
- Severity breakdown (critical, high, medium, low)
- Recent unfixed bugs
- Backend monitor status

**Access**: Visible in bottom-right corner when bugs are detected, or click to expand.

## Auto-Recovery Flow

1. **Watchdog detects outage** → Logs event
2. **Triggers bug fixer** → Runs full diagnostic
3. **Emits event** → `watchdog.recovery` event on EventBus
4. **Frontend consumes** → AutoBugDetector fetches alerts
5. **User notified** → Bug appears in AutoBugDetector UI

## Logs

All monitoring activity is logged:
- `logs/watchdog.log` - Runtime watchdog events
- `logs/monitor.log` - Monitor service events
- Browser console - Frontend bug detector logs

## CI/CD Integration

The system includes GitHub Actions CI that:
- Runs `test-system.sh` on every push
- Tests all API endpoints
- Tests all frontend routes
- Verifies file structure
- Ensures health endpoints respond

**File**: `.github/workflows/ci.yml`

## Deployment Checklist

### Before Deploying:
1. ✅ Set `NEXT_PUBLIC_API_URL` to production API URL
2. ✅ Set backend `PORT` and `NODE_ENV=production`
3. ✅ Ensure all health endpoints are accessible
4. ✅ Verify monitoring services start automatically
5. ✅ Test auto-recovery with manual outage simulation

### Production Monitoring:
- Monitor `logs/watchdog.log` for recovery events
- Check `/api/system/monitor-status` endpoint regularly
- Review AutoBugDetector stats in frontend
- Set up alerts for critical severity bugs

## Troubleshooting

### Watchdog not starting
- Check `server/index.js` - RuntimeWatchdog should be initialized
- Verify EventBus is passed to constructor
- Check `logs/watchdog.log` for errors

### Frontend not detecting backend issues
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check browser console for fetch errors
- Ensure `/api/system/monitor-status` is accessible

### Auto-fixes not applying
- Check browser console for fix errors
- Verify localStorage is available (not in incognito)
- Review `auto-bug-detector.ts` fix strategies

## Next Steps

Future enhancements:
- [ ] WebSocket connection for real-time alerts
- [ ] Email/SMS notifications for critical bugs
- [ ] Machine learning for bug pattern detection
- [ ] Automated rollback on critical failures
- [ ] Integration with external monitoring (Datadog, New Relic)

---

**Status**: ✅ Fully operational and monitoring 24/7

