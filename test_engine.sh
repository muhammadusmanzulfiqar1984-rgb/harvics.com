#!/bin/bash
# Test Country Rule Engine

BASE_URL="http://localhost:4000/api"

echo "Testing UAE Profile (AE)..."
curl -s "$BASE_URL/localisation/rules/AE" | grep "United Arab Emirates" && echo "✅ UAE Profile OK" || echo "❌ UAE Profile Failed"

echo "Testing UK Profile (GB)..."
curl -s "$BASE_URL/localisation/rules/GB" | grep "United Kingdom" && echo "✅ UK Profile OK" || echo "❌ UK Profile Failed"

echo "Testing Workflow Logic (High Value Order)..."
# Order > 50000 should trigger legal review
curl -s "$BASE_URL/localisation/workflow/AE?orderValue=60000&productCategory=Electronics" | grep '"requiresLegalReview":true' && echo "✅ Workflow Logic OK" || echo "❌ Workflow Logic Failed"

echo "Done."
