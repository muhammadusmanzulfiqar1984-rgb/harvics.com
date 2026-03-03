#!/bin/bash

# 🔧 SETUP GIT HOOKS
# Installs pre-commit hook for security checks

echo "🔧 Setting up Git hooks..."
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
GIT_DIR="$PROJECT_ROOT/.git"

if [ ! -d "$GIT_DIR" ]; then
    echo "❌ Error: Not a git repository"
    echo "   Run 'git init' first"
    exit 1
fi

HOOKS_DIR="$GIT_DIR/hooks"
PRE_COMMIT_HOOK="$HOOKS_DIR/pre-commit"

# Create hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# Create pre-commit hook
cat > "$PRE_COMMIT_HOOK" << 'EOF'
#!/bin/bash
# Pre-commit hook for Harvics security checks

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"

# Run security check
"$PROJECT_ROOT/scripts/pre-commit.sh"
EOF

# Make hook executable
chmod +x "$PRE_COMMIT_HOOK"

echo "✅ Git hooks installed successfully!"
echo ""
echo "📝 Pre-commit hook will now run security checks before each commit"
echo ""
echo "   To skip checks (NOT RECOMMENDED):"
echo "   git commit --no-verify"
echo ""

