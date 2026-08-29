#!/usr/bin/env bash
# Module #4 wire smoke — AP bill, payment, aging, audit
set -euo pipefail
BASE="${BASE_URL:-http://127.0.0.1:4001}"
AUTH="Authorization: Bearer ${TOKEN:-demo-token-company_admin}"
HDR=(-H "$AUTH" -H "Content-Type: application/json")
SUFFIX=$(date +%s | tail -c 5)
VEND="Wire AP Vendor $SUFFIX"

echo "=== Module #4 AP WIRE TEST against $BASE ==="
pass=0; fail=0
check() {
  local name="$1" ok="$2" detail="${3:-}"
  if [ "$ok" = "1" ]; then echo "PASS  $name ${detail:+— $detail}"; pass=$((pass+1))
  else echo "FAIL  $name ${detail:+— $detail}"; fail=$((fail+1)); fi
}

code=$(curl -s -o /tmp/m4_age.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/finance/ap/aging" || echo 000)
check "4.1 Aging GET /api/finance/ap/aging" "$([ "$code" = "200" ] && echo 1 || echo 0)" "HTTP $code"

DUE=$(date -u -v+21d +%Y-%m-%d 2>/dev/null || date -u -d '+21 days' +%Y-%m-%d 2>/dev/null || echo "2026-09-20")
BILL_BODY=$(printf '{"vendor":"%s","amount":4800,"dueDate":"%s","type":"AP","postToGl":true}' "$VEND" "$DUE")
code=$(curl -s -o /tmp/m4_bill.json -w "%{http_code}" -X POST "${HDR[@]}" -d "$BILL_BODY" "$BASE/api/finance/invoices" || echo 000)
BILL_NO=$(node -e "try{const j=JSON.parse(require('fs').readFileSync('/tmp/m4_bill.json','utf8')); process.stdout.write(j.data&&j.data.invoiceNo||'')}catch{}")
ok=0; { [ "$code" = "201" ] || [ "$code" = "200" ]; } && [ -n "$BILL_NO" ] && ok=1
check "4.2 Create AP bill POST /api/finance/invoices" "$ok" "HTTP $code $BILL_NO"

code=$(curl -s -o /tmp/m4_list.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/finance/invoices?type=AP&limit=20" || echo 000)
check "4.3 List AP bills GET /api/finance/invoices?type=AP" "$([ "$code" = "200" ] && echo 1 || echo 0)" "HTTP $code"

PAY_BODY=$(printf '{"invoiceNo":"%s","amount":4800,"method":"Bank Transfer","postToGl":true}' "$BILL_NO")
code=$(curl -s -o /tmp/m4_pay.json -w "%{http_code}" -X POST "${HDR[@]}" -d "$PAY_BODY" "$BASE/api/finance/payments" || echo 000)
status=$(node -e "try{const j=JSON.parse(require('fs').readFileSync('/tmp/m4_pay.json','utf8')); process.stdout.write(j.invoiceStatus||'')}catch{}")
ok=0; { [ "$code" = "201" ] || [ "$code" = "200" ]; } && [ "$status" = "Paid" ] && ok=1
check "4.4 Full AP payment POST /api/finance/payments" "$ok" "HTTP $code status=$status"

code=$(curl -s -o /tmp/m4_age2.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/finance/ap/aging" || echo 000)
has=$(node -e "try{const j=JSON.parse(require('fs').readFileSync('/tmp/m4_age2.json','utf8')); process.stdout.write((j.data||[]).some(x=>x.invoiceNo=='$BILL_NO')?'1':'0')}catch{process.stdout.write('0')}")
ok=0; [ "$code" = "200" ] && [ "$has" = "0" ] && ok=1
check "4.5 Paid bill absent from AP aging" "$ok" "HTTP $code stillListed=$has"

code=$(curl -s -o /tmp/m4_audit.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/platform/audit/search?module=ap&limit=5" || echo 000)
check "4.6 Audit module=ap" "$([ "$code" = "200" ] && echo 1 || echo 0)" "HTTP $code"

echo "=== RESULT: $pass passed, $fail failed ==="
[ "$fail" -eq 0 ]
