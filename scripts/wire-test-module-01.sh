#!/usr/bin/env bash
# Module #1 wire smoke test — CoA, period, journal, trial balance, audit
set -euo pipefail
BASE="${BASE_URL:-http://127.0.0.1:4001}"
AUTH="Authorization: Bearer ${TOKEN:-demo-token-company_admin}"
HDR=(-H "$AUTH" -H "Content-Type: application/json")

echo "=== Module #1 WIRE TEST against $BASE ==="
echo "(Requires NODE_ENV=development or ALLOW_DEMO_TOKENS=1, or set TOKEN= to a real JWT)"

pass=0
fail=0
check() {
  local name="$1" ok="$2" detail="${3:-}"
  if [ "$ok" = "1" ]; then
    echo "PASS  $name ${detail:+— $detail}"
    pass=$((pass + 1))
  else
    echo "FAIL  $name ${detail:+— $detail}"
    fail=$((fail + 1))
  fi
}

# 1) Health / finance route reachable
code=$(curl -s -o /tmp/m1_coa.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/finance/gl-accounts?limit=5" || echo 000)
check "1.1 CoA list GET /api/finance/gl-accounts" "$([ "$code" = "200" ] && echo 1 || echo 0)" "HTTP $code"

# 2) Seed standard CoA (idempotent — 400 if already seeded is OK)
code=$(curl -s -o /tmp/m1_seed.json -w "%{http_code}" -X POST "${HDR[@]}" "$BASE/api/finance/gl-accounts/seed-standard" || echo 000)
seed_ok=0
if [ "$code" = "200" ] || [ "$code" = "201" ]; then seed_ok=1; fi
if [ "$code" = "400" ] && grep -q 'already has' /tmp/m1_seed.json 2>/dev/null; then seed_ok=1; fi
check "1.2 Seed CoA POST /api/finance/gl-accounts/seed-standard" "$seed_ok" "HTTP $code $(head -c 80 /tmp/m1_seed.json 2>/dev/null)"

# 3) Open fiscal period for current month
YEAR=$(date +%Y)
MONTH=$(date +%-m 2>/dev/null || date +%m | sed 's/^0//')
PERIOD_BODY=$(printf '{"name":"FY%s M%s","year":%s,"month":%s}' "$YEAR" "$MONTH" "$YEAR" "$MONTH")
code=$(curl -s -o /tmp/m1_period.json -w "%{http_code}" -X POST "${HDR[@]}" -d "$PERIOD_BODY" "$BASE/api/finance/fiscal-periods" || echo 000)
# 200/201 create, or 409/400 if already open — still OK if periods list works
check "1.3 Open period POST /api/finance/fiscal-periods" "$([ "$code" = "200" ] || [ "$code" = "201" ] || [ "$code" = "400" ] || [ "$code" = "409" ] && echo 1 || echo 0)" "HTTP $code"

code=$(curl -s -o /tmp/m1_periods.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/finance/fiscal-periods?limit=20" || echo 000)
check "1.4 List periods GET /api/finance/fiscal-periods" "$([ "$code" = "200" ] && echo 1 || echo 0)" "HTTP $code"

# 4) Resolve debit/credit accounts from CoA
coa=$(curl -s "${HDR[@]}" "$BASE/api/finance/gl-accounts?limit=50")
DEBIT=$(node -e "const j=JSON.parse(process.argv[1]); const a=(j.data||[]).find(x=>String(x.type).toLowerCase()==='asset')||(j.data||[])[0]; process.stdout.write(a?a.accountCode:'')" "$coa")
CREDIT=$(node -e "const j=JSON.parse(process.argv[1]); const a=(j.data||[]).find(x=>String(x.type).toLowerCase()==='revenue'||String(x.type).toLowerCase()==='liability'||String(x.type).toLowerCase()==='equity')||(j.data||[])[1]; process.stdout.write(a?a.accountCode:'')" "$coa")
if [ -z "$DEBIT" ] || [ -z "$CREDIT" ] || [ "$DEBIT" = "$CREDIT" ]; then
  check "1.5 Resolve debit/credit accounts" 0 "debit=$DEBIT credit=$CREDIT"
else
  check "1.5 Resolve debit/credit accounts" 1 "$DEBIT → $CREDIT"
fi

# 5) Post journal
JE_BODY=$(printf '{"description":"Module #1 wire smoke","debit":"%s","credit":"%s","amount":100}' "$DEBIT" "$CREDIT")
code=$(curl -s -o /tmp/m1_je.json -w "%{http_code}" -X POST "${HDR[@]}" -d "$JE_BODY" "$BASE/api/finance/journal" || echo 000)
check "1.6 Post journal POST /api/finance/journal" "$([ "$code" = "200" ] || [ "$code" = "201" ] && echo 1 || echo 0)" "HTTP $code $(head -c 120 /tmp/m1_je.json 2>/dev/null)"

# 6) Trial balance
code=$(curl -s -o /tmp/m1_tb.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/finance/trial-balance" || echo 000)
balanced=$(node -e "try{const j=JSON.parse(require('fs').readFileSync('/tmp/m1_tb.json','utf8')); process.stdout.write(String(j.data&&j.data.balanced===true))}catch{process.stdout.write('false')}")
check "1.7 Trial balance GET /api/finance/trial-balance" "$([ "$code" = "200" ] && echo 1 || echo 0)" "HTTP $code balanced=$balanced"

# 7) GL summary report
code=$(curl -s -o /tmp/m1_sum.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/finance/reports/gl-summary" || echo 000)
check "1.8 GL summary GET /api/finance/reports/gl-summary" "$([ "$code" = "200" ] && echo 1 || echo 0)" "HTTP $code"

# 8) Audit has finance events (optional soft)
code=$(curl -s -o /tmp/m1_audit.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/platform/audit/search?module=finance&limit=5" || echo 000)
audit_n=$(node -e "try{const j=JSON.parse(require('fs').readFileSync('/tmp/m1_audit.json','utf8')); process.stdout.write(String((j.data||[]).length))}catch{process.stdout.write('0')}")
check "1.9 Audit search module=finance" "$([ "$code" = "200" ] && echo 1 || echo 0)" "HTTP $code rows=$audit_n"

echo "=== RESULT: $pass passed, $fail failed ==="
[ "$fail" -eq 0 ]
