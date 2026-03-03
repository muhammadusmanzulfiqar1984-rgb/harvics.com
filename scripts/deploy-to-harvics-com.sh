#!/bin/bash

# ============================================
# DEPLOY TO WWW.HARVICS.COM - Copy Website As Is
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  DEPLOY TO WWW.HARVICS.COM${NC}"
echo -e "${BLUE}  Copy Website As Is${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Step 1: Clean previous builds
echo -e "${BLUE}[1/5] Cleaning previous builds...${NC}"
rm -rf .next
rm -rf out
rm -rf deploy-package
echo -e "${GREEN}✅ Cleaned${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${BLUE}[2/5] Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: Build the website
echo -e "${BLUE}[3/5] Building website for production...${NC}"
npm run build
echo -e "${GREEN}✅ Website built${NC}"
echo ""

# Step 4: Create deployment package
echo -e "${BLUE}[4/5] Creating deployment package...${NC}"
mkdir -p deploy-package

# Copy essential files
echo "  → Copying essential files..."
cp -r .next deploy-package/ 2>/dev/null || true
cp -r public deploy-package/ 2>/dev/null || true
cp package.json deploy-package/
cp package-lock.json deploy-package/ 2>/dev/null || true
cp next.config.js deploy-package/
cp netlify.toml deploy-package/
cp tsconfig.json deploy-package/
cp tailwind.config.js deploy-package/
cp postcss.config.js deploy-package/
cp -r src deploy-package/ 2>/dev/null || true

# Copy backend if needed
if [ -d "backend" ]; then
    echo "  → Copying backend..."
    cp -r backend deploy-package/ 2>/dev/null || true
fi

echo -e "${GREEN}✅ Deployment package created${NC}"
echo ""

# Step 5: Summary
echo -e "${BLUE}[5/5] Deployment Summary${NC}"
echo ""
echo -e "${GREEN}✅ Website is ready for deployment!${NC}"
echo ""
echo -e "${YELLOW}Deployment package location:${NC}"
echo "  → $SCRIPT_DIR/deploy-package"
echo ""
echo -e "${YELLOW}For Netlify deployment:${NC}"
echo "  1. Connect your repository to Netlify"
echo "  2. Set build command: npm run build"
echo "  3. Set publish directory: .next"
echo "  4. Or upload the deploy-package folder"
echo ""
echo -e "${YELLOW}For manual deployment:${NC}"
echo "  → Upload the 'deploy-package' folder to your hosting"
echo ""
echo -e "${GREEN}All files copied as-is!${NC}"

