#!/bin/bash

echo "🔍 LOCALIZATION ACTIVATION SCRIPT"
echo "=================================="
echo ""

# Check current status
if [ -f .env.local ]; then
    echo "✅ .env.local exists"
    if grep -q "USE_MOCK_PROVIDERS" .env.local; then
        echo "📋 Current setting:"
        grep "USE_MOCK_PROVIDERS" .env.local
    else
        echo "⚠️  USE_MOCK_PROVIDERS not set (defaults to MOCK mode)"
    fi
else
    echo "❌ .env.local not found"
fi

echo ""
echo "🔧 To activate REAL APIs:"
echo "1. Add this line to .env.local:"
echo "   USE_MOCK_PROVIDERS=false"
echo ""
echo "2. (Optional) For weather data, add:"
echo "   OPENWEATHER_API_KEY=your_key_here"
echo ""
echo "3. Restart backend:"
echo "   npm run backend"
echo ""
echo "📊 Current backend status:"
if lsof -i :4000 >/dev/null 2>&1; then
    echo "✅ Backend is running on port 4000"
else
    echo "❌ Backend is NOT running"
fi
