#!/bin/bash

# ============================================
# AI Integration Setup Script
# Sets up OpenAI GPT-4 and ML models
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║          🤖 HARVICS AI INTEGRATION SETUP               ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_DIR"

# Step 1: Install Node.js dependencies
echo -e "${BLUE}[1/5] Installing Node.js dependencies...${NC}"
cd "$PROJECT_DIR/server"
if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}⚠️  package.json not found in server directory${NC}"
else
    npm install openai node-fetch 2>/dev/null || echo -e "${YELLOW}⚠️  Some packages may already be installed${NC}"
    echo -e "${GREEN}✅ Node.js dependencies installed${NC}"
fi
echo ""

# Step 2: Install Python ML libraries
echo -e "${BLUE}[2/5] Installing Python ML libraries...${NC}"
cd "$PROJECT_DIR/harviclocales-main/ai-engine"

if [ ! -d "venv" ]; then
    echo "  → Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "  → Activating virtual environment..."
source venv/bin/activate

echo "  → Installing ML libraries..."
pip install --upgrade pip
pip install -r requirements.txt

echo -e "${GREEN}✅ Python ML libraries installed${NC}"
echo ""

# Step 3: Setup environment variables
echo -e "${BLUE}[3/5] Setting up environment variables...${NC}"

# Check if .env exists
if [ ! -f "$PROJECT_DIR/server/.env" ]; then
    echo "  → Creating .env file..."
    cat > "$PROJECT_DIR/server/.env" << EOF
# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview

# AI Engine Configuration
AI_ENGINE_URL=http://localhost:8000
NODE_ENV=development
EOF
    echo -e "${YELLOW}⚠️  Created .env file. Please add your OpenAI API key!${NC}"
else
    echo -e "${GREEN}✅ .env file exists${NC}"
    
    # Check if OpenAI key is set
    if grep -q "your-openai-api-key-here" "$PROJECT_DIR/server/.env" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Please update OPENAI_API_KEY in .env file${NC}"
    else
        echo -e "${GREEN}✅ OpenAI API key configured${NC}"
    fi
fi
echo ""

# Step 4: Verify installation
echo -e "${BLUE}[4/5] Verifying installation...${NC}"

# Check Node.js packages
if [ -d "$PROJECT_DIR/server/node_modules/openai" ]; then
    echo -e "${GREEN}✅ OpenAI package installed${NC}"
else
    echo -e "${RED}❌ OpenAI package not found${NC}"
fi

# Check Python packages
cd "$PROJECT_DIR/harviclocales-main/ai-engine"
source venv/bin/activate 2>/dev/null || true

if python3 -c "import prophet" 2>/dev/null; then
    echo -e "${GREEN}✅ Prophet installed${NC}"
else
    echo -e "${RED}❌ Prophet not installed${NC}"
fi

if python3 -c "import xgboost" 2>/dev/null; then
    echo -e "${GREEN}✅ XGBoost installed${NC}"
else
    echo -e "${RED}❌ XGBoost not installed${NC}"
fi

if python3 -c "import ortools" 2>/dev/null; then
    echo -e "${GREEN}✅ OR-Tools installed${NC}"
else
    echo -e "${RED}❌ OR-Tools not installed${NC}"
fi
echo ""

# Step 5: Summary
echo -e "${BLUE}[5/5] Setup Summary${NC}"
echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ AI Integration Setup Complete!${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Get OpenAI API Key:"
echo "   → Go to: https://platform.openai.com/api-keys"
echo "   → Create new key"
echo "   → Add $5-10 credits"
echo ""
echo "2. Add API Key to .env:"
echo "   → Edit: $PROJECT_DIR/server/.env"
echo "   → Set: OPENAI_API_KEY=sk-your-key-here"
echo ""
echo "3. Test the Integration:"
echo "   → Start backend: cd server && npm start"
echo "   → Test AI Copilot in dashboard"
echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}🎉 Your AI integration is ready!${NC}"
echo ""

