#!/bin/bash

# Convenience script to start servers from frontend directory
# This script calls the main START_SERVERS.sh from the parent directory

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PARENT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "📍 Running from: $SCRIPT_DIR"
echo "📍 Calling: $PARENT_DIR/START_SERVERS.sh"
echo ""

cd "$PARENT_DIR"
bash START_SERVERS.sh

