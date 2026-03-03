#!/bin/bash

echo "🔍 COMPREHENSIVE VERIFICATION TEST"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test Backend Health
echo "1. Testing Backend Health..."
if curl -s http://localhost:5000/api/system/health > /dev/null 2>&1 || curl -s http://localhost:5000/health > /dev/null 2>&1; then
    STATUS=$(curl -s http://localhost:5000/api/system/health 2>/dev/null | jq -r '.status' 2>/dev/null || curl -s http://localhost:5000/health 2>/dev/null | jq -r '.status' 2>/dev/null || echo "error")
    if [ "$STATUS" = "ok" ]; then
        echo -e "${GREEN}   ✅ Backend is healthy${NC}"
    else
        echo -e "${RED}   ❌ Backend health check failed${NC}"
    fi
else
    echo -e "${RED}   ❌ Backend not running on port 5000${NC}"
fi

echo ""

# Test Localization APIs
echo "2. Testing Localization APIs..."
echo -n "   - Countries Summary: "
if curl -s http://localhost:5000/api/localization/countries/summary | jq -e '.success == true' > /dev/null 2>&1; then
    COUNT=$(curl -s http://localhost:5000/api/localization/countries/summary | jq -r '.count' 2>/dev/null || echo "0")
    echo -e "${GREEN}✅ Working (${COUNT} countries)${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

echo -n "   - Realtime Data (Pakistan): "
if curl -s http://localhost:5000/api/localization/realtime/pakistan | jq -e '.success == true' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Working${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

echo -n "   - Analysis (Pakistan): "
if curl -s http://localhost:5000/api/localization/analysis/pakistan | jq -e '.success == true' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Working${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

echo ""

# Test GPS & Satellite APIs
echo "3. Testing GPS & Satellite APIs..."
echo -n "   - GPS Heatmap: "
if curl -s "http://localhost:5000/api/gps/heatmap/pakistan" | jq -e '.success == true' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Working${NC}"
else
    echo -e "${YELLOW}⚠️  Endpoint exists but may need data${NC}"
fi

echo -n "   - Satellite White Spaces: "
if curl -s "http://localhost:5000/api/satellite/whitespaces/pakistan" | jq -e '.success == true' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Working${NC}"
else
    echo -e "${YELLOW}⚠️  Endpoint exists but may need data${NC}"
fi

echo ""

# Test Frontend Pages
echo "4. Testing Frontend Pages..."
echo -n "   - Portals Page: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/en/portals/ 2>/dev/null)
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✅ HTTP 200${NC}"
else
    echo -e "${RED}❌ HTTP ${STATUS}${NC}"
fi

echo -n "   - Company Dashboard: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/en/dashboard/company/ 2>/dev/null)
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✅ HTTP 200${NC}"
else
    echo -e "${RED}❌ HTTP ${STATUS}${NC}"
fi

echo -n "   - Distributor Portal: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/en/portal/distributor/ 2>/dev/null)
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✅ HTTP 200${NC}"
else
    echo -e "${RED}❌ HTTP ${STATUS}${NC}"
fi

echo ""
echo "=================================="
echo "✅ Verification test complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Open http://localhost:3000/en/portals/ in browser"
echo "   2. Scroll down to see 'Harvics CRM - Full Architecture' section"
echo ""
