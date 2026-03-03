#!/bin/bash

echo "═══════════════════════════════════════════════════════"
echo "🚀 Starting Harvics CRM Servers"
echo "═══════════════════════════════════════════════════════"
echo ""

# Project root (go up from scripts/ directory)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"
echo "📁 Project root: $PROJECT_ROOT"

# Kill any existing processes
echo "🧹 Cleaning up old processes..."
pkill -f "next dev" 2>/dev/null
pkill -f "tsx.*backend" 2>/dev/null
pkill -f "node.*backend" 2>/dev/null
sleep 2

# Start Backend
echo ""
echo "🔧 Starting Backend Server..."
if [ -f "backend/src/index.ts" ]; then
  npm run backend > /tmp/harvics-backend.log 2>&1 &
  BACKEND_PID=$!
  echo "✅ Backend started (PID: $BACKEND_PID)"
  echo "   Logs: tail -f /tmp/harvics-backend.log"
else
  echo "❌ Backend not found at: backend/src/index.ts"
fi

# Wait a bit for backend to start
sleep 3

# Start Frontend
echo ""
echo "🎨 Starting Frontend Server..."
if [ -f "package.json" ]; then
  npm run dev > /tmp/harvics-frontend.log 2>&1 &
  FRONTEND_PID=$!
  echo "✅ Frontend started (PID: $FRONTEND_PID)"
  echo "   Logs: tail -f /tmp/harvics-frontend.log"
else
  echo "❌ Frontend not found at: $PROJECT_ROOT/package.json"
fi

# Wait a bit for servers to start
sleep 5

echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ SERVERS STARTED!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📊 Access URLs:"
echo ""
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:4000"
echo ""
echo "   Homepage:    http://localhost:3000/en/"
echo "   CRM:         http://localhost:3000/en/dashboard/company/"
echo "   Backend API: http://localhost:4000/health"
echo "   System API:  http://localhost:4000/api/system/monitor-status"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
echo "💡 Tips:"
echo "   - View logs: tail -f /tmp/harvics-*.log"
echo "   - Stop all:  pkill -f 'next dev'; pkill -f 'tsx.*backend'"
echo ""
echo "═══════════════════════════════════════════════════════"

