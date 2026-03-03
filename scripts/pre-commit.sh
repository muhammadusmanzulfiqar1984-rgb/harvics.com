#!/bin/bash

# 🔒 PRE-COMMIT HOOK
# Runs security checks before allowing commit

echo "🔒 Running pre-commit security checks..."
echo ""

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Run security check script
"$SCRIPT_DIR/security-check.sh"

EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "❌ Pre-commit checks failed!"
    echo "   Fix the errors above before committing"
    echo ""
    echo "   To skip checks (NOT RECOMMENDED):"
    echo "   git commit --no-verify"
    exit 1
fi

echo ""
echo "✅ Pre-commit checks passed!"
exit 0

