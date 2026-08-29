#!/usr/bin/env bash
# Modules #13–28 wire smoke — GET + primary POST each
set -euo pipefail
BASE="${BASE_URL:-http://127.0.0.1:4001}"
AUTH="Authorization: Bearer ${TOKEN:-demo-token-company_admin}"
HDR=(-H "$AUTH" -H "Content-Type: application/json")
S=$(date +%s | tail -c 5)
pass=0; fail=0
check() {
  local name="$1" ok="$2" detail="${3:-}"
  if [ "$ok" = "1" ]; then echo "PASS  $name ${detail:+— $detail}"; pass=$((pass+1))
  else echo "FAIL  $name ${detail:+— $detail}"; fail=$((fail+1)); fi
}
http_ok() { local c="$1"; { [ "$c" = "200" ] || [ "$c" = "201" ] || [ "$c" = "409" ]; }; }

echo "=== Modules #13–28 WIRE TEST against $BASE ==="

# 13 RFQ
code=$(curl -s -o /tmp/w13a.json -w "%{http_code}" --max-time 25 "${HDR[@]}" "$BASE/api/wave3/procurement/rfqs" || echo 000)
check "13.1 GET rfqs" "$(http_ok "$code" && echo 1 || echo 0)" "HTTP $code"
code=$(curl -s -o /tmp/w13b.json -w "%{http_code}" --max-time 25 -X POST "${HDR[@]}" -d "{\"rfqNo\":\"RFQ-$S\",\"title\":\"Wire RFQ\"}" "$BASE/api/wave3/procurement/rfqs" || echo 000)
check "13.2 POST rfq" "$(http_ok "$code" && echo 1 || echo 0)" "HTTP $code"

# 14 Scorecard
code=$(curl -s -o /tmp/w14a.json -w "%{http_code}" --max-time 25 "${HDR[@]}" "$BASE/api/wave3/vendors/scorecards" || echo 000)
check "14.1 GET scorecards" "$(http_ok "$code" && echo 1 || echo 0)" "HTTP $code"
code=$(curl -s -o /tmp/w14b.json -w "%{http_code}" --max-time 25 -X POST "${HDR[@]}" -d "{\"vendorId\":\"V-$S\",\"vendorName\":\"Wire Vend\",\"period\":\"2026-Q3\",\"onTimePercent\":90,\"qualityScore\":88,\"priceScore\":80,\"responseScore\":85}" "$BASE/api/wave3/vendors/scorecards" || echo 000)
check "14.2 POST scorecard" "$(http_ok "$code" && echo 1 || echo 0)" "HTTP $code"

# 15 Contracts
code=$(curl -s -o /tmp/w15a.json -w "%{http_code}" --max-time 25 "${HDR[@]}" "$BASE/api/wave5/contracts" || echo 000)
check "15.1 GET contracts" "$(http_ok "$code" && echo 1 || echo 0)" "HTTP $code"
code=$(curl -s -o /tmp/w15b.json -w "%{http_code}" --max-time 25 -X POST "${HDR[@]}" -d "{\"contractNo\":\"C-$S\",\"title\":\"Wire Contract\",\"counterparty\":\"ACME\",\"startDate\":\"2026-01-01\",\"endDate\":\"2026-12-31\",\"value\":10000}" "$BASE/api/wave5/contracts" || echo 000)
check "15.2 POST contract" "$(http_ok "$code" && echo 1 || echo 0)" "HTTP $code $(head -c 60 /tmp/w15b.json 2>/dev/null)"

# 16 Sourcing
code=$(curl -s -o /tmp/w16a.json -w "%{http_code}" --max-time 25 "${HDR[@]}" "$BASE/api/wave5/sourcing-suppliers" || echo 000)
check "16.1 GET sourcing" "$(http_ok "$code" && echo 1 || echo 0)" "HTTP $code"
code=$(curl -s -o /tmp/w16b.json -w "%{http_code}" --max-time 25 -X POST "${HDR[@]}" -d "{\"name\":\"Src $S\",\"country\":\"PK\",\"category\":\"FMCG\",\"rating\":4}" "$BASE/api/wave5/sourcing-suppliers" || echo 000)
check "16.2 POST sourcing" "$(http_ok "$code" && echo 1 || echo 0)" "HTTP $code"

# 17 Work orders
code=$(curl -s -o /tmp/w17a.json -w "%{http_code}" --max-time 25 "${HDR[@]}" "$BASE/api/v2/manufacturing/work-orders" || echo 000)
check "17.1 GET work-orders" "$(http_ok "$code" && echo 1 || echo 0)" "HTTP $code"
code=$(curl -s -o /tmp/w17b.json -w "%{http_code}" --max-time 25 -X POST "${HDR[@]}" -d "{\"workOrderNo\":\"WO-$S\",\"productSku\":\"SKU1\",\"qty\":10,\"status\":\"Planned\"}" "$BASE/api/v2/manufacturing/work-orders" || echo 000)
check "17.2 POST work-order" "$(http_ok "$code" && echo 1 || echo 0)" "HTTP $code $(head -c 80 /tmp/w17b.json 2>/dev/null)"

# 18 Shop floor
code=$(curl -s -o /tmp/w18a.json -w "%{http_code}" --max-time 25 "${HDR[@]}" "$BASE/api/wave5/shop-floor-ops" || echo 000)
check "18.1 GET shop-floor" "$(http_ok "$code" && echo 1 || echo 0)" "HTTP $code"

# 19 BOM
code=$(curl -s -o /tmp/w19a.json -w "%{http_code}" --max-time 25 "${HDR[@]}" "$BASE/api/wave4/boms" || echo 000)
check "19.1 GET boms" "$(http_ok "$code" && echo 1 || echo 0)" "HTTP $code"

# 20 Quality
code=$(curl -s -o /tmp/w20a.json -w "%{http_code}" --max-time 25 "${HDR[@]}" "$BASE/api/v2/quality/checks" || echo 000)
check "20.1 GET quality checks" "$(http_ok "$code" && echo 1 || echo 0)" "HTTP $code"

# 21 Recipes
code=$(curl -s -o /tmp/w21a.json -w "%{http_code}" --max-time 25 "${HDR[@]}" "$BASE/api/wave4/recipes" || echo 000)
check "21.1 GET recipes" "$(http_ok "$code" && echo 1 || echo 0)" "HTTP $code"

# 22 Inventory ABC
code=$(curl -s -o /tmp/w22a.json -w "%{http_code}" --max-time 25 "${HDR[@]}" "$BASE/api/wave3/inventory/abc-analysis" || echo 000)
check "22.1 GET abc-analysis" "$(http_ok "$code" && echo 1 || echo 0)" "HTTP $code"

# 23 Warehouses
code=$(curl -s -o /tmp/w23a.json -w "%{http_code}" --max-time 25 "${HDR[@]}" "$BASE/api/wave4/warehouses" || echo 000)
check "23.1 GET warehouses" "$(http_ok "$code" && echo 1 || echo 0)" "HTTP $code"
code=$(curl -s -o /tmp/w23b.json -w "%{http_code}" --max-time 25 -X POST "${HDR[@]}" -d "{\"code\":\"WH-$S\",\"name\":\"Wire WH\",\"type\":\"DC\"}" "$BASE/api/wave4/warehouses" || echo 000)
check "23.2 POST warehouse" "$(http_ok "$code" && echo 1 || echo 0)" "HTTP $code"

# 24 Demand
code=$(curl -s -o /tmp/w24a.json -w "%{http_code}" --max-time 25 "${HDR[@]}" "$BASE/api/wave4/demand/history" || echo 000)
check "24.1 GET demand/history" "$(http_ok "$code" && echo 1 || echo 0)" "HTTP $code"

# 25 Fleet
code=$(curl -s -o /tmp/w25a.json -w "%{http_code}" --max-time 25 "${HDR[@]}" "$BASE/api/wave4/vehicles" || echo 000)
check "25.1 GET vehicles" "$(http_ok "$code" && echo 1 || echo 0)" "HTTP $code"
code=$(curl -s -o /tmp/w25b.json -w "%{http_code}" --max-time 25 -X POST "${HDR[@]}" -d "{\"plate\":\"P-$S\",\"type\":\"van\",\"capacityKg\":1000}" "$BASE/api/wave4/vehicles" || echo 000)
check "25.2 POST vehicle" "$(http_ok "$code" && echo 1 || echo 0)" "HTTP $code $(head -c 60 /tmp/w25b.json 2>/dev/null)"

# 26 Shipping
code=$(curl -s -o /tmp/w26a.json -w "%{http_code}" --max-time 25 "${HDR[@]}" "$BASE/api/wave3/shipping/shipments" || echo 000)
check "26.1 GET shipments" "$(http_ok "$code" && echo 1 || echo 0)" "HTTP $code"

# 27 Trade
code=$(curl -s -o /tmp/w27a.json -w "%{http_code}" --max-time 25 "${HDR[@]}" "$BASE/api/wave3/trade/hs-codes" || echo 000)
check "27.1 GET hs-codes" "$(http_ok "$code" && echo 1 || echo 0)" "HTTP $code"
code=$(curl -s -o /tmp/w27b.json -w "%{http_code}" --max-time 25 -X POST "${HDR[@]}" -d "{\"code\":\"1234.$S\",\"description\":\"Wire HS\",\"dutyPercent\":5}" "$BASE/api/wave3/trade/hs-codes" || echo 000)
check "27.2 POST hs-code" "$(http_ok "$code" && echo 1 || echo 0)" "HTTP $code"

# 28 3PL
code=$(curl -s -o /tmp/w28a.json -w "%{http_code}" --max-time 25 "${HDR[@]}" "$BASE/api/wave5/threepl-partners" || echo 000)
check "28.1 GET threepl" "$(http_ok "$code" && echo 1 || echo 0)" "HTTP $code"
code=$(curl -s -o /tmp/w28b.json -w "%{http_code}" --max-time 25 -X POST "${HDR[@]}" -d "{\"code\":\"3PL-$S\",\"name\":\"3PL $S\",\"authMode\":\"apikey\"}" "$BASE/api/wave5/threepl-partners" || echo 000)
check "28.2 POST threepl" "$(http_ok "$code" && echo 1 || echo 0)" "HTTP $code $(head -c 60 /tmp/w28b.json 2>/dev/null)"

echo "=== RESULT: $pass passed, $fail failed ==="
[ "$fail" -eq 0 ]
