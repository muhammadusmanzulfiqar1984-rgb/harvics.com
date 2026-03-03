#!/bin/bash

# 🔒 HARVICS SECURITY CHECK SCRIPT
# Runs all security checks before commit/deployment

set -e  # Exit on error

echo "🔒 Running Harvics Security Checks..."
echo ""

ERRORS=0
WARNINGS=0

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Function to check for console statements
check_console_statements() {
    echo "📝 Checking for console statements..."
    # Exclude node_modules, .next, dist, build directories
    CONSOLE_COUNT=$(grep -r "console\." src/ server/ harviclocales-main/src/ 2>/dev/null | \
        grep -v "node_modules" | \
        grep -v ".next" | \
        grep -v "dist" | \
        grep -v "build" | \
        grep -v "NODE_ENV" | \
        grep -v "process.env.NODE_ENV" | \
        wc -l | tr -d ' ')
    
    if [ "$CONSOLE_COUNT" -gt 0 ]; then
        echo -e "${RED}❌ Found $CONSOLE_COUNT console statements (not wrapped in dev-only)${NC}"
        grep -r "console\." src/ server/ harviclocales-main/src/ 2>/dev/null | \
            grep -v "node_modules" | \
            grep -v ".next" | \
            grep -v "dist" | \
            grep -v "build" | \
            grep -v "NODE_ENV" | \
            grep -v "process.env.NODE_ENV" | \
            head -10
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅ No console statements found${NC}"
    fi
    echo ""
}

# Function to check for hardcoded secrets
check_hardcoded_secrets() {
    echo "🔐 Checking for hardcoded secrets..."
    SECRET_PATTERNS=("password.*=" "secret.*=" "api_key.*=" "apikey.*=" "jwt_secret.*=" "private_key.*=" "access_key.*=")
    FOUND_SECRETS=0
    
    for pattern in "${SECRET_PATTERNS[@]}"; do
        # Look for actual assignments, exclude comments, schema definitions, and legitimate uses
        COUNT=$(grep -ri "$pattern" src/ server/ 2>/dev/null | \
            grep -v "process.env" | \
            grep -v ".env" | \
            grep -v "node_modules" | \
            grep -v "package-lock.json" | \
            grep -v "^[[:space:]]*//" | \
            grep -v "^[[:space:]]*\*" | \
            grep -v "TEXT NOT NULL" | \
            grep -v "database schema" | \
            grep -v "CREATE TABLE" | \
            grep -v "INSERT INTO" | \
            grep -v "password.*hash" | \
            wc -l | tr -d ' ')
        if [ "$COUNT" -gt 0 ]; then
            echo -e "${YELLOW}⚠️  Found potential hardcoded '$pattern'${NC}"
            grep -ri "$pattern" src/ server/ 2>/dev/null | \
                grep -v "process.env" | \
                grep -v ".env" | \
                grep -v "node_modules" | \
                grep -v "^[[:space:]]*//" | \
                grep -v "TEXT NOT NULL" | \
                head -3
            FOUND_SECRETS=$((FOUND_SECRETS + COUNT))
        fi
    done
    
    if [ "$FOUND_SECRETS" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Review potential secrets above (may be false positives)${NC}"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}✅ No hardcoded secrets found${NC}"
    fi
    echo ""
}

# Function to check SQL injection risks
check_sql_injection() {
    echo "💉 Checking for SQL injection risks..."
    SQL_RISKS=$(grep -r "db\.prepare\|db\.run\|db\.all\|db\.get" server/routes/ 2>/dev/null | grep -v "?" | grep -v "prepare(" | wc -l | tr -d ' ')
    
    if [ "$SQL_RISKS" -gt 0 ]; then
        echo -e "${RED}❌ Found potential SQL injection risks (queries without parameterization)${NC}"
        grep -r "db\.prepare\|db\.run\|db\.all\|db\.get" server/routes/ 2>/dev/null | grep -v "?" | head -5
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅ SQL queries appear to be parameterized${NC}"
    fi
    echo ""
}

# Function to check for authentication on routes
check_authentication() {
    echo "🔑 Checking authentication on routes..."
    # This is a basic check - may need customization
    PROTECTED_ROUTES=$(grep -r "router\.(get|post|put|delete|patch)" server/routes/ 2>/dev/null | grep -v "authenticateToken" | grep -v "router.use(authenticateToken)" | wc -l | tr -d ' ')
    
    if [ "$PROTECTED_ROUTES" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Found routes that may not have authentication${NC}"
        echo "   (Manual review recommended)"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}✅ Routes appear to have authentication${NC}"
    fi
    echo ""
}

# Function to check TypeScript compilation
check_typescript() {
    echo "📘 Checking TypeScript compilation..."
    if [ -f "harviclocales-main/tsconfig.json" ]; then
        cd harviclocales-main
        # Only check for critical type errors, not test files
        if npx tsc --noEmit --skipLibCheck 2>&1 | grep -v "test.ts" | grep -v "Cannot find name 'describe'" | grep -v "Cannot find name 'it'" | grep -v "Cannot find name 'expect'" | grep -q "error TS"; then
            echo -e "${YELLOW}⚠️  TypeScript has some errors (excluding test files)${NC}"
            echo "   Review TypeScript errors manually"
            WARNINGS=$((WARNINGS + 1))
        else
            echo -e "${GREEN}✅ TypeScript compilation check passed${NC}"
        fi
        cd ..
    else
        echo -e "${YELLOW}⚠️  TypeScript config not found, skipping${NC}"
    fi
    echo ""
}

# Function to check for error boundaries
check_error_boundaries() {
    echo "🛡️  Checking for error boundaries..."
    if [ -f "harviclocales-main/src/components/ErrorBoundary.tsx" ]; then
        USAGE=$(grep -r "ErrorBoundary" harviclocales-main/src/app/ 2>/dev/null | wc -l | tr -d ' ')
        if [ "$USAGE" -gt 0 ]; then
            echo -e "${GREEN}✅ Error boundaries found and used${NC}"
        else
            echo -e "${YELLOW}⚠️  ErrorBoundary component exists but may not be used${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e "${RED}❌ ErrorBoundary component not found${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    echo ""
}

# Function to check environment variables
check_env_variables() {
    echo "🌍 Checking environment variables..."
    if [ -f ".env.example" ] || [ -f "server/.env.example" ]; then
        echo -e "${GREEN}✅ .env.example file found${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.example file not found (recommended)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check if JWT_SECRET is referenced
    JWT_REF=$(grep -r "JWT_SECRET" server/ 2>/dev/null | grep "process.env" | wc -l | tr -d ' ')
    if [ "$JWT_REF" -gt 0 ]; then
        echo -e "${GREEN}✅ JWT_SECRET uses environment variable${NC}"
    else
        echo -e "${RED}❌ JWT_SECRET may not be using environment variable${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    echo ""
}

# Run all checks
check_console_statements
check_hardcoded_secrets
check_sql_injection
check_authentication
check_typescript
check_error_boundaries
check_env_variables

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SECURITY CHECK SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
    echo -e "${GREEN}✅ All security checks passed!${NC}"
    exit 0
elif [ "$ERRORS" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Security check completed with $WARNINGS warning(s)${NC}"
    echo "   Review warnings above"
    exit 0
else
    echo -e "${RED}❌ Security check failed with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo "   Fix errors before committing/deploying"
    exit 1
fi

