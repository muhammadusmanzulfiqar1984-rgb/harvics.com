#!/usr/bin/env bash
# Modules #5–12 wire smoke (one pass, report each)
set -euo pipefail
BASE="${BASE_URL:-http://127.0.0.1:4001}"
AUTH="Authorization: Bearer ${TOKEN:-demo-token-company_admin}"
HDR=(-H "$AUTH" -H "Content-Type: application/json")
SUFFIX=$(date +%s | tail -c 6)
PERIOD=$(date +%Y-%m)

pass=0; fail=0
check() {
  local name="$1" ok="$2" detail="${3:-}"
  if [ "$ok" = "1" ]; then echo "PASS  $name ${detail:+— $detail}"; pass=$((pass+1))
  else echo "FAIL  $name ${detail:+— $detail}"; fail=$((fail+1)); fi
}

echo "=== Modules #5–12 WIRE TEST against $BASE ==="

# ── #5 Treasury ──
code=$(curl -s -o /tmp/m5a.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/v2/treasury/accounts" || echo 000)
check "5.1 GET treasury accounts" "$([ "$code" = "200" ] && echo 1 || echo 0)" "HTTP $code"
ACC_BODY=$(printf '{"accountNo":"WB-%s","bankName":"WireBank","currency":"USD","balance":10000,"accountType":"Operating"}' "$SUFFIX")
code=$(curl -s -o /tmp/m5b.json -w "%{http_code}" -X POST "${HDR[@]}" -d "$ACC_BODY" "$BASE/api/v2/treasury/accounts" || echo 000)
ok=0; { [ "$code" = "201" ] || [ "$code" = "200" ]; } && ok=1
check "5.2 POST treasury account" "$ok" "HTTP $code"

# ── #6 HPay ──
code=$(curl -s -o /tmp/m6a.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/wave5/payment-runs" || echo 000)
check "6.1 GET payment-runs" "$([ "$code" = "200" ] && echo 1 || echo 0)" "HTTP $code"
PR_BODY=$(printf '{"runNo":"PR-%s","currency":"USD","items":[{"payeeName":"Wire Vendor","amount":150}]}' "$SUFFIX")
code=$(curl -s -o /tmp/m6b.json -w "%{http_code}" -X POST "${HDR[@]}" -d "$PR_BODY" "$BASE/api/wave5/payment-runs" || echo 000)
PR_ID=$(node -e "try{const j=JSON.parse(require('fs').readFileSync('/tmp/m6b.json','utf8')); process.stdout.write(j.data&&j.data.id||'')}catch{}")
ok=0; { [ "$code" = "201" ] || [ "$code" = "200" ]; } && [ -n "$PR_ID" ] && ok=1
check "6.2 POST payment-run" "$ok" "HTTP $code id=$PR_ID"
code=$(curl -s -o /tmp/m6c.json -w "%{http_code}" -X POST "${HDR[@]}" "$BASE/api/wave5/payment-runs/$PR_ID/release" || echo 000)
ok=0; { [ "$code" = "200" ] || [ "$code" = "201" ]; } && ok=1
check "6.3 POST release payment-run" "$ok" "HTTP $code"

# ── #7 Planning ──
code=$(curl -s -o /tmp/m7a.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/finance/budgets/variance?period=$PERIOD" || echo 000)
check "7.1 GET budgets/variance" "$([ "$code" = "200" ] && echo 1 || echo 0)" "HTTP $code"
BUD_BODY=$(printf '{"period":"%s","account":"6000","budgeted":9999,"scenario":"Base","notes":"wire-%s"}' "$PERIOD" "$SUFFIX")
code=$(curl -s -o /tmp/m7b.json -w "%{http_code}" -X POST "${HDR[@]}" -d "$BUD_BODY" "$BASE/api/finance/budgets" || echo 000)
ok=0; { [ "$code" = "201" ] || [ "$code" = "200" ] || [ "$code" = "409" ]; } && ok=1
check "7.2 POST budget line" "$ok" "HTTP $code"

# ── #8 CRM ──
code=$(curl -s -o /tmp/m8a.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/wave8/leads" || echo 000)
check "8.1 GET leads" "$([ "$code" = "200" ] && echo 1 || echo 0)" "HTTP $code"
LEAD_BODY=$(printf '{"company":"Wire Co %s","contact":"Wire","value":5000,"stage":"Lead"}' "$SUFFIX")
code=$(curl -s -o /tmp/m8b.json -w "%{http_code}" -X POST "${HDR[@]}" -d "$LEAD_BODY" "$BASE/api/wave8/leads" || echo 000)
LEAD_ID=$(node -e "try{const j=JSON.parse(require('fs').readFileSync('/tmp/m8b.json','utf8')); process.stdout.write(j.data&&j.data.id||'')}catch{}")
ok=0; { [ "$code" = "201" ] || [ "$code" = "200" ]; } && [ -n "$LEAD_ID" ] && ok=1
check "8.2 POST lead" "$ok" "HTTP $code id=$LEAD_ID"
code=$(curl -s -o /tmp/m8c.json -w "%{http_code}" -X POST "${HDR[@]}" "$BASE/api/wave8/leads/$LEAD_ID/convert" || echo 000)
ok=0; { [ "$code" = "201" ] || [ "$code" = "200" ]; } && ok=1
check "8.3 POST convert lead" "$ok" "HTTP $code"

# ── #9 CPQ (needs tax rate) ──
code=$(curl -s -o /tmp/m9tax.json -w "%{http_code}" -X POST "${HDR[@]}" -d '{"country":"US","taxType":"VAT","ratePercent":10,"effectiveFrom":"2020-01-01"}' "$BASE/api/platform/tax/rates" || echo 000)
# 201/200/409 ok
code=$(curl -s -o /tmp/m9a.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/wave5/quotes?limit=5" || echo 000)
check "9.1 GET quotes" "$([ "$code" = "200" ] && echo 1 || echo 0)" "HTTP $code"
Q_BODY=$(printf '{"customerName":"Wire Buyer %s","taxCountry":"US","taxType":"VAT","lines":[{"sku":"WIRE-1","qty":2,"unitPrice":100}]}' "$SUFFIX")
code=$(curl -s -o /tmp/m9b.json -w "%{http_code}" -X POST "${HDR[@]}" -d "$Q_BODY" "$BASE/api/wave5/quotes" || echo 000)
ok=0; { [ "$code" = "201" ] || [ "$code" = "200" ]; } && ok=1
check "9.2 POST quote" "$ok" "HTTP $code $(head -c 80 /tmp/m9b.json 2>/dev/null)"

# ── #10 Sales & Dist ──
code=$(curl -s -o /tmp/m10a.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/wave4/channels" || echo 000)
check "10.1 GET channels" "$([ "$code" = "200" ] && echo 1 || echo 0)" "HTTP $code"
CH_BODY=$(printf '{"code":"CH-%s","name":"Wire Channel","type":"distributor","priority":1,"leadTimeDays":3}' "$SUFFIX")
code=$(curl -s -o /tmp/m10b.json -w "%{http_code}" -X POST "${HDR[@]}" -d "$CH_BODY" "$BASE/api/wave4/channels" || echo 000)
ok=0; { [ "$code" = "201" ] || [ "$code" = "200" ]; } && ok=1
check "10.2 POST channel" "$ok" "HTTP $code"

# ── #11 Marketing ──
code=$(curl -s -o /tmp/m11a.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/v2/marketing/email-campaigns" || echo 000)
check "11.1 GET email-campaigns" "$([ "$code" = "200" ] && echo 1 || echo 0)" "HTTP $code"
CAM_BODY=$(printf '{"name":"Wire Campaign %s","subject":"Hello","status":"Draft"}' "$SUFFIX")
code=$(curl -s -o /tmp/m11b.json -w "%{http_code}" -X POST "${HDR[@]}" -d "$CAM_BODY" "$BASE/api/v2/marketing/email-campaigns" || echo 000)
ok=0; { [ "$code" = "201" ] || [ "$code" = "200" ]; } && ok=1
check "11.2 POST campaign" "$ok" "HTTP $code $(head -c 80 /tmp/m11b.json 2>/dev/null)"

# ── #12 Distributor ──
code=$(curl -s -o /tmp/m12a.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/orders?limit=5" || echo 000)
check "12.1 GET orders" "$([ "$code" = "200" ] && echo 1 || echo 0)" "HTTP $code"
ORD_BODY=$(printf '{"customerName":"Wire Dist %s","channel":"distributor","amount":300,"items":[{"sku":"SKU1","qty":1,"unitPrice":300}]}' "$SUFFIX")
code=$(curl -s -o /tmp/m12b.json -w "%{http_code}" -X POST "${HDR[@]}" -d "$ORD_BODY" "$BASE/api/orders" || echo 000)
ok=0; { [ "$code" = "201" ] || [ "$code" = "200" ]; } && ok=1
check "12.2 POST order" "$ok" "HTTP $code"

echo "=== RESULT: $pass passed, $fail failed ==="
[ "$fail" -eq 0 ]
