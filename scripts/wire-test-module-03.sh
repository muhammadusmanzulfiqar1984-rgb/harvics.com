#!/usr/bin/env bash
# Module #3 wire smoke — AR invoice, payment, aging, audit
set -euo pipefail
BASE="${BASE_URL:-http://127.0.0.1:4001}"
AUTH="Authorization: Bearer ${TOKEN:-demo-token-company_admin}"
HDR=(-H "$AUTH" -H "Content-Type: application/json")
SUFFIX=$(date +%s | tail -c 5)
CUST="Wire AR Cust $SUFFIX"

echo "=== Module #3 AR WIRE TEST against $BASE ==="
pass=0; fail=0
check() {
  local name="$1" ok="$2" detail="${3:-}"
  if [ "$ok" = "1" ]; then echo "PASS  $name ${detail:+— $detail}"; pass=$((pass+1))
  else echo "FAIL  $name ${detail:+— $detail}"; fail=$((fail+1)); fi
}

code=$(curl -s -o /tmp/m3_age.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/finance/ar/aging" || echo 000)
check "3.1 Aging GET /api/finance/ar/aging" "$([ "$code" = "200" ] && echo 1 || echo 0)" "HTTP $code"

DUE=$(date -u -v+14d +%Y-%m-%d 2>/dev/null || date -u -d '+14 days' +%Y-%m-%d 2>/dev/null || echo "2026-09-15")
INV_BODY=$(printf '{"customer":"%s","amount":2500,"dueDate":"%s","type":"AR","postToGl":true}' "$CUST" "$DUE")
code=$(curl -s -o /tmp/m3_inv.json -w "%{http_code}" -X POST "${HDR[@]}" -d "$INV_BODY" "$BASE/api/finance/invoices" || echo 000)
INV_NO=$(node -e "try{const j=JSON.parse(require('fs').readFileSync('/tmp/m3_inv.json','utf8')); process.stdout.write(j.data&&j.data.invoiceNo||'')}catch{}")
ok=0; { [ "$code" = "201" ] || [ "$code" = "200" ]; } && [ -n "$INV_NO" ] && ok=1
check "3.2 Create AR invoice POST /api/finance/invoices" "$ok" "HTTP $code $INV_NO"

code=$(curl -s -o /tmp/m3_list.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/finance/invoices?type=AR&limit=20" || echo 000)
check "3.3 List AR invoices GET /api/finance/invoices?type=AR" "$([ "$code" = "200" ] && echo 1 || echo 0)" "HTTP $code"

PAY_BODY=$(printf '{"invoiceNo":"%s","amount":1000,"method":"Bank Transfer","postToGl":true}' "$INV_NO")
code=$(curl -s -o /tmp/m3_pay.json -w "%{http_code}" -X POST "${HDR[@]}" -d "$PAY_BODY" "$BASE/api/finance/payments" || echo 000)
status=$(node -e "try{const j=JSON.parse(require('fs').readFileSync('/tmp/m3_pay.json','utf8')); process.stdout.write(j.invoiceStatus||'')}catch{}")
ok=0; { [ "$code" = "201" ] || [ "$code" = "200" ]; } && [ "$status" = "Partial" ] && ok=1
check "3.4 Partial payment POST /api/finance/payments" "$ok" "HTTP $code status=$status"

code=$(curl -s -o /tmp/m3_pays.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/finance/payments?limit=20" || echo 000)
check "3.5 List payments GET /api/finance/payments" "$([ "$code" = "200" ] && echo 1 || echo 0)" "HTTP $code"

code=$(curl -s -o /tmp/m3_age2.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/finance/ar/aging" || echo 000)
has=$(node -e "try{const j=JSON.parse(require('fs').readFileSync('/tmp/m3_age2.json','utf8')); process.stdout.write((j.data||[]).some(x=>x.invoiceNo==='$INV_NO')?'1':'0')}catch{process.stdout.write('0')}")
ok=0; [ "$code" = "200" ] && [ "$has" = "1" ] && ok=1
check "3.6 Aging includes invoice" "$ok" "HTTP $code has=$has"

code=$(curl -s -o /tmp/m3_audit.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/platform/audit/search?module=ar&limit=5" || echo 000)
check "3.7 Audit module=ar" "$([ "$code" = "200" ] && echo 1 || echo 0)" "HTTP $code"

echo "=== RESULT: $pass passed, $fail failed ==="
[ "$fail" -eq 0 ]
