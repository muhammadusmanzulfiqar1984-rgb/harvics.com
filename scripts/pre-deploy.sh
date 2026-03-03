#!/bin/bash

# 🚀 PRE-DEPLOYMENT CHECK SCRIPT
# Runs comprehensive checks before deployment

set -e

echo "🚀 Running pre-deployment checks..."
echo ""

ERRORS=0
WARNINGS=0

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Run security checks
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔒 SECURITY CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
"$SCRIPT_DIR/security-check.sh"
SECURITY_EXIT=$?

if [ $SECURITY_EXIT -ne 0 ]; then
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check environment variables
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌍 ENVIRONMENT VARIABLES CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

REQUIRED_VARS=("JWT_SECRET" "NODE_ENV")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ $var is not set${NC}"
        MISSING_VARS+=("$var")
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅ $var is set${NC}"
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}❌ Missing required environment variables: ${MISSING_VARS[*]}${NC}"
fi
echo ""

# Check JWT_SECRET strength
if [ -n "$JWT_SECRET" ]; then
    JWT_LENGTH=${#JWT_SECRET}
    if [ "$JWT_LENGTH" -lt 32 ]; then
        echo -e "${RED}❌ JWT_SECRET is too short (minimum 32 characters)${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅ JWT_SECRET length is acceptable ($JWT_LENGTH characters)${NC}"
    fi
fi
echo ""

# Build check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏗️  BUILD CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "harviclocales-main" ]; then
    cd harviclocales-main
    if npm run build 2>/dev/null; then
        echo -e "${GREEN}✅ Frontend build successful${NC}"
    else
        echo -e "${RED}❌ Frontend build failed${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    cd ..
else
    echo -e "${YELLOW}⚠️  Frontend directory not found, skipping build${NC}"
fi
echo ""

# Check for production-ready code
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 PRODUCTION READINESS CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for TODO/FIXME in production code
TODO_COUNT=$(grep -r "TODO\|FIXME" src/ server/ 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
if [ "$TODO_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $TODO_COUNT TODO/FIXME comments${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ No TODO/FIXME comments found${NC}"
fi

# Check for debug code
DEBUG_COUNT=$(grep -ri "debugger\|console\.debug" src/ server/ 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
if [ "$DEBUG_COUNT" -gt 0 ]; then
    echo -e "${RED}❌ Found $DEBUG_COUNT debug statements${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No debug statements found${NC}"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 PRE-DEPLOYMENT CHECK SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
    echo -e "${GREEN}✅ All pre-deployment checks passed!${NC}"
    echo ""
    echo "🚀 Ready to deploy!"
    exit 0
elif [ "$ERRORS" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Pre-deployment check completed with $WARNINGS warning(s)${NC}"
    echo "   Review warnings above"
    echo ""
    echo "⚠️  Deploy with caution"
    exit 0
else
    echo -e "${RED}❌ Pre-deployment check failed with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo "   Fix errors before deploying"
    echo ""
    echo "❌ DO NOT DEPLOY"
    exit 1
fi

