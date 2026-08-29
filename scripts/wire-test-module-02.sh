#!/usr/bin/env bash
# Module #2 wire smoke test — cost centers, plan/actual, allocations, variance, optional GL
set -euo pipefail
BASE="${BASE_URL:-http://127.0.0.1:4001}"
AUTH="Authorization: Bearer ${TOKEN:-demo-token-company_admin}"
HDR=(-H "$AUTH" -H "Content-Type: application/json")
PERIOD=$(date +%Y-%m)
SUFFIX=$(date +%s | tail -c 5)
CC="W2-$SUFFIX"

echo "=== Module #2 WIRE TEST against $BASE ==="
echo "(Requires NODE_ENV=development or ALLOW_DEMO_TOKENS=1, or set TOKEN= to a real JWT)"
echo "Period=$PERIOD CostCenter=$CC"

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

# 1) List cost centers
code=$(curl -s -o /tmp/m2_cc.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/finance/cost-centers" || echo 000)
check "2.1 List cost centers GET /api/finance/cost-centers" "$([ "$code" = "200" ] && echo 1 || echo 0)" "HTTP $code"

# 2) Create cost center
CC_BODY=$(printf '{"code":"%s","name":"Wire Test CC %s","manager":"Wire"}' "$CC" "$SUFFIX")
code=$(curl -s -o /tmp/m2_cc_create.json -w "%{http_code}" -X POST "${HDR[@]}" -d "$CC_BODY" "$BASE/api/finance/cost-centers" || echo 000)
check "2.2 Create cost center POST /api/finance/cost-centers" "$([ "$code" = "200" ] || [ "$code" = "201" ] && echo 1 || echo 0)" "HTTP $code $(head -c 100 /tmp/m2_cc_create.json 2>/dev/null)"

# 3) Plan posting
PLAN_BODY=$(printf '{"costCenterCode":"%s","period":"%s","account":"6000","amount":10000,"type":"Plan","description":"Wire plan"}' "$CC" "$PERIOD")
code=$(curl -s -o /tmp/m2_plan.json -w "%{http_code}" -X POST "${HDR[@]}" -d "$PLAN_BODY" "$BASE/api/finance/cost-postings" || echo 000)
check "2.3 Plan posting POST /api/finance/cost-postings" "$([ "$code" = "200" ] || [ "$code" = "201" ] && echo 1 || echo 0)" "HTTP $code $(head -c 100 /tmp/m2_plan.json 2>/dev/null)"

# 4) Actual posting (may or may not hit GL — both OK if posting saved)
ACT_BODY=$(printf '{"costCenterCode":"%s","period":"%s","account":"6000","amount":8500,"type":"Actual","description":"Wire actual","postToGl":true}' "$CC" "$PERIOD")
code=$(curl -s -o /tmp/m2_act.json -w "%{http_code}" -X POST "${HDR[@]}" -d "$ACT_BODY" "$BASE/api/finance/cost-postings" || echo 000)
has_data=$(node -e "try{const j=JSON.parse(require('fs').readFileSync('/tmp/m2_act.json','utf8')); process.stdout.write(j.data&&j.data.id?'1':'0')}catch{process.stdout.write('0')}")
check "2.4 Actual posting POST /api/finance/cost-postings" "$([ "$code" = "200" ] || [ "$code" = "201" ] && [ "$has_data" = "1" ] && echo 1 || echo 0)" "HTTP $code $(head -c 140 /tmp/m2_act.json 2>/dev/null)"

# 5) Allocation
ALLOC_BODY=$(printf '{"period":"%s","fromAccount":"6000","toCostCenter":"%s","amount":1200,"basis":"wire","notes":"Module #2 smoke"}' "$PERIOD" "$CC")
code=$(curl -s -o /tmp/m2_alloc.json -w "%{http_code}" -X POST "${HDR[@]}" -d "$ALLOC_BODY" "$BASE/api/finance/allocations" || echo 000)
check "2.5 Allocation POST /api/finance/allocations" "$([ "$code" = "200" ] || [ "$code" = "201" ] && echo 1 || echo 0)" "HTTP $code $(head -c 100 /tmp/m2_alloc.json 2>/dev/null)"

# 6) List allocations
code=$(curl -s -o /tmp/m2_allocs.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/finance/allocations?period=$PERIOD&limit=50" || echo 000)
check "2.6 List allocations GET /api/finance/allocations" "$([ "$code" = "200" ] && echo 1 || echo 0)" "HTTP $code"

# 7) Controlling variance report
code=$(curl -s -o /tmp/m2_rep.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/finance/controlling/report?period=$PERIOD" || echo 000)
has_row=$(node -e "try{const j=JSON.parse(require('fs').readFileSync('/tmp/m2_rep.json','utf8')); const r=(j.data||[]).find(x=>x.code==='$CC'); process.stdout.write(r?'1':'0')}catch{process.stdout.write('0')}")
check "2.7 Variance report GET /api/finance/controlling/report" "$([ "$code" = "200" ] && [ "$has_row" = "1" ] && echo 1 || echo 0)" "HTTP $code hasCC=$has_row"

# 8) List postings for period
code=$(curl -s -o /tmp/m2_posts.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/finance/cost-postings?period=$PERIOD&limit=50" || echo 000)
check "2.8 List postings GET /api/finance/cost-postings" "$([ "$code" = "200" ] && echo 1 || echo 0)" "HTTP $code"

# 9) Audit controlling (soft — route reachable)
code=$(curl -s -o /tmp/m2_audit.json -w "%{http_code}" "${HDR[@]}" "$BASE/api/platform/audit/search?module=controlling&limit=5" || echo 000)
audit_n=$(node -e "try{const j=JSON.parse(require('fs').readFileSync('/tmp/m2_audit.json','utf8')); process.stdout.write(String((j.data||[]).length))}catch{process.stdout.write('0')}")
check "2.9 Audit search module=controlling" "$([ "$code" = "200" ] && echo 1 || echo 0)" "HTTP $code rows=$audit_n"

echo "=== RESULT: $pass passed, $fail failed ==="
[ "$fail" -eq 0 ]
