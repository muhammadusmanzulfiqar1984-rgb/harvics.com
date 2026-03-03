#!/bin/bash

# ============================================
# HARVICS SYSTEM MONITOR - Startup Script
# Strict Protocol Enforcement Agent
# ============================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Starting HARVICS System Monitoring Agent..."
echo "📋 Protocol Enforcement: ACTIVE"
echo "🐍 ALL AI operations must go through Python"
echo ""

# Check Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is required but not installed"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

echo "📦 Installing/updating dependencies..."
pip install -q -r requirements.txt

# Start the monitoring agent
echo ""
echo "🔍 Starting System Monitor Agent..."
echo ""

python3 src/system_monitor.py

