#!/bin/bash

echo "═══════════════════════════════════════════════════════"
echo "🛑 Stopping Harvics CRM Servers"
echo "═══════════════════════════════════════════════════════"
echo ""

echo "🔄 Stopping Frontend..."
pkill -f "next dev" 2>/dev/null
if [ $? -eq 0 ]; then
  echo "✅ Frontend stopped"
else
  echo "⚠️  Frontend was not running"
fi

echo ""
echo "🔄 Stopping Backend..."
pkill -f "tsx.*backend" 2>/dev/null
pkill -f "node.*backend" 2>/dev/null
# Also kill by port 4000
lsof -ti:4000 | xargs kill -9 2>/dev/null || true
if [ $? -eq 0 ] || lsof -ti:4000 >/dev/null 2>&1; then
  echo "✅ Backend stopped"
else
  echo "⚠️  Backend was not running"
fi

sleep 2

echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ All servers stopped!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "💡 To start again, run: ./START_SERVERS.sh"
echo ""

