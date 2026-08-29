#!/usr/bin/env bash
# Modules #29–54 wire smoke — primary GET (+ key POST when cheap)
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
okc() { local c="$1"; { [ "$c" = "200" ] || [ "$c" = "201" ] || [ "$c" = "409" ]; }; }

echo "=== Modules #29–54 WIRE TEST against $BASE ==="

hit() {
  local id="$1" label="$2" method="$3" path="$4" body="${5:-}"
  local code
  if [ "$method" = "POST" ]; then
    code=$(curl -s -o "/tmp/w${id}.json" -w "%{http_code}" --max-time 25 -X POST "${HDR[@]}" -d "$body" "$BASE$path" || echo 000)
  else
    code=$(curl -s -o "/tmp/w${id}.json" -w "%{http_code}" --max-time 25 "${HDR[@]}" "$BASE$path" || echo 000)
  fi
  check "$id $label" "$(okc "$code" && echo 1 || echo 0)" "HTTP $code"
}

hit 29.1 "GET leave" GET "/api/wave3/hr/leave"
hit 29.2 "POST leave" POST "/api/wave3/hr/leave" "{\"employeeId\":\"E-$S\",\"leaveType\":\"Annual\",\"startDate\":\"2026-09-01\",\"endDate\":\"2026-09-03\"}"
hit 30.1 "GET postings" GET "/api/wave5/postings"
hit 30.2 "POST posting" POST "/api/wave5/postings" "{\"reqNo\":\"REQ-$S\",\"title\":\"Wire Role $S\",\"department\":\"Ops\"}"
hit 31.1 "GET courses" GET "/api/wave5/courses"
hit 32.1 "GET perf-reviews" GET "/api/wave5/perf-reviews"
hit 33.1 "GET headcount" GET "/api/wave5/headcount-plans"
hit 34.1 "GET assets" GET "/api/v2/assets"
hit 34.2 "POST asset" POST "/api/v2/assets" "{\"assetCode\":\"A-$S\",\"name\":\"Wire Asset\",\"category\":\"Equipment\",\"status\":\"Active\"}"
hit 35.1 "GET pm-orders" GET "/api/wave5/pm-orders"
hit 36.1 "GET properties" GET "/api/wave5/properties"
hit 37.1 "GET incidents" GET "/api/t14/incidents"
hit 38.1 "GET audit-events" GET "/api/v2/audit-events"
hit 39.1 "GET legal cases" GET "/api/v2/legal/cases"
hit 40.1 "GET governance" GET "/api/platform/governance/policies"
hit 41.1 "GET reports" GET "/api/wave5/reports"
hit 42.1 "GET board-packs" GET "/api/wave5/board-packs"
hit 43.1 "GET okr" GET "/api/t14/okr"
hit 44.1 "GET variance" GET "/api/wave5/variance-commentary"
hit 45.1 "GET projects" GET "/api/v2/projects"
hit 46.1 "GET service-tickets" GET "/api/wave5/service-tickets"
hit 47.1 "GET engagements" GET "/api/wave5/engagements"
hit 48.1 "GET tax rates" GET "/api/platform/tax/rates"
hit 49.1 "GET fx-rates" GET "/api/v2/treasury/fx-rates"
hit 50.1 "GET audit search" GET "/api/platform/audit/search?limit=5"
hit 51.1 "GET notifications" GET "/api/v2/notifications"
hit 52.1 "GET documents" GET "/api/v2/documents"
hit 53.1 "GET admin users" GET "/api/platform/admin/users"
hit 54.1 "GET endpoints" GET "/api/wave7/endpoints"

echo "=== RESULT: $pass passed, $fail failed ==="
[ "$fail" -eq 0 ]
